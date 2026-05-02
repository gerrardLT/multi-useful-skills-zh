# 建筑学

本文档解释了**为什么** gstack 是这样构建的。有关设置和命令，请参阅 CLAUDE.md。如需贡献，请参阅 CONTRIBUTING.md。

## 核心理念

gstack 为 Claude Code 提供了一个持久的浏览器和一组固执己见的工作流程技能。浏览器是最难的部分——其他的都是 Markdown。

关键见解：与浏览器交互的人工智能代理需要**亚秒级延迟**和**持久状态**。如果每个命令都会冷启动浏览器，则每个工具调用都需要等待 3-5 秒。如果浏览器在命令之间死机，您将丢失 cookie、选项卡和登录会话。因此，gstack 运行一个长期存在的 Chromium 守护进程，CLI 通过本地主机 HTTP 与其进行通信。

```
Claude Code                     gstack
─────────                      ──────
                               ┌──────────────────────┐
  Tool call: $B snapshot -i    │  CLI (compiled binary)│
  ─────────────────────────→   │  • reads state file   │
                               │  • POST /command      │
                               │    to localhost:PORT   │
                               └──────────┬───────────┘
                                          │ HTTP
                               ┌──────────▼───────────┐
                               │  Server (Bun.serve)   │
                               │  • dispatches command  │
                               │  • talks to Chromium   │
                               │  • returns plain text  │
                               └──────────┬───────────┘
                                          │ CDP
                               ┌──────────▼───────────┐
                               │  Chromium (headless)   │
                               │  • persistent tabs     │
                               │  • cookies carry over  │
                               │  • 30min idle timeout  │
                               └───────────────────────┘
```

第一次调用开始一切（~3s）。每次调用后：~100-200ms。

## 为什么选择发髻

Node.js 可以工作。面包在这里更好有三个原因：

1. **编译的二进制文件。** `bun build --compile` 生成单个约 58MB 的可执行文件。运行时没有 `node_modules`，没有 `npx`，没有 PATH 配置。二进制文件刚刚运行。这很重要，因为 gstack 安装到 `~/.claude/skills/` 中，用户不希望在其中管理 Node.js 项目。

2. **原生 SQLite。** Cookie 解密直接读取 Chromium 的 SQLite Cookie 数据库。 Bun 内置了 `new Database()` — 没有 `better-sqlite3`，没有本机插件编译，没有 gyp。少一件在不同机器上损坏的事情。

3. **本机 TypeScript。** 服务器在开发过程中以 `bun run server.ts` 运行。没有编译步骤，没有 `ts-node`，没有要调试的源映射。编译后的二进制文件用于部署；源文件用于开发。

4. **内置 HTTP 服务器。** `Bun.serve()` 快速、简单，不需要 Express 或 Fastify。服务器总共处理约 10 条路由。框架将是开销。

瓶颈始终是 Chromium，而不是 CLI 或服务器。 Bun 的启动速度（编译后的二进制文件约为 1 毫秒，Node 约为 100 毫秒）很不错，但这不是我们选择它的原因。已编译的二进制文件和本机 SQLite 是。

## 守护进程模型

### 为什么不按命令启动浏览器？

Playwright 可以在大约 2-3 秒内启动 Chromium。对于单个屏幕截图来说，这很好。对于包含 20 多个命令的 QA 会话，浏览器启动开销为 40 秒以上。更糟糕的是：您会丢失命令之间的所有状态。 Cookie、本地存储、登录会话、打开的选项卡 — 全部消失了。

守护进程模型意味着：

- **持久状态。** 登录一次，保持登录状态。打开选项卡，它保持打开状态。 localStorage 跨命令持续存在。
- **亚秒级命令。** 第一次调用后，每个命令只是一个 HTTP POST。大约 100-200 毫秒的往返，包括 Chromium 的工作。
- **自动生命周期。** 服务器在首次使用时自动启动，闲置 30 分钟后自动关闭。无需流程管理。

### 状态文件

服务器写入 `.gstack/browse.json` （通过 tmp + 重命名进行原子写入，模式 0o600）：

```json
{ "pid": 12345, "port": 34567, "token": "uuid-v4", "startedAt": "...", "binaryVersion": "abc123" }
```

CLI 读取此文件来查找服务器。如果文件丢失或服务器未通过 HTTP 运行状况检查，CLI 会生成一个新服务器。在 Windows 上，Bun 二进制文件中基于 PID 的进程检测并不可靠，因此运行状况检查 (GET /health) 是所有平台上的主要活动信号。

### 端口选择

10000-60000 之间的随机端口（冲突时重试最多 5 次）。这意味着 10 个 Conductor 工作区每个都可以运行自己的浏览守护程序，且零配置和零端口冲突。旧方法（扫描 9400-9409）在多工作空间设置中不断失效。

### 版本自动重启

构建将 `git rev-parse HEAD` 写入 `browse/dist/.version`。在每次 CLI 调用中，如果二进制文件的版本与正在运行的服务器的 `binaryVersion` 不匹配，CLI 将终止旧服务器并启动新服务器。这完全可以防止“过时的二进制”类错误 - 重建二进制文件，下一个命令会自动拾取它。

## 安全模型

### 仅本地主机

HTTP 服务器绑定到 `127.0.0.1`，而不是 `0.0.0.0`。无法从网络访问它。

### 双监听隧道架构（v1.6.0.0）

当用户运行 `pair-agent --client` 时，守护进程会启动一个 ngrok 隧道，以便远程配对代理可以驱动浏览器。将完整的守护进程表面暴露到互联网（甚至在随机的 ngrok 子域后面）意味着 `/health` 泄露了任何 Origin 欺骗上的根令牌，并且 `/cookie-picker` 将令牌嵌入到任何调用者都可以获取的 HTML 中。

修复方法是 **两个 HTTP 侦听器**，而不是一个：

- **本地侦听器** (`127.0.0.1:LOCAL_PORT`) — 始终绑定。提供引导程序（带有令牌传递的 `/health`）、`/cookie-picker`、`/inspector/*`、`/welcome`、`/refs`、侧边栏代理 API 和完整的命令界面。从来没有转发过。
- **隧道侦听器** (`127.0.0.1:TUNNEL_PORT`) — 惰性绑定在 `/tunnel/start` 上，在 `/tunnel/stop` 上拆除。提供锁定的白名单：`/connect`（配对仪式、未经身份验证 + 速率限制）、`/command`（仅限作用域令牌，进一步限制为浏览器驱动命令白名单）和 `/sidebar-chat`。其他一切都是 404。

ngrok 仅转发隧道端口。安全属性来自**物理端口分离**：隧道调用者无法到达 `/health` 或 `/cookie-picker`，因为这些路径在该 TCP 套接字上不存在。标头推断（检查 `x-forwarded-for`、检查来源）不可靠（ngrok 标头行为发生变化；本地代理可以添加这些标头）；套接字分离不是。

|端点|本地监听器|隧道监听器|笔记|
|---|---|---|---|
|__代码_0__|公共（除非以 /extension 为标题，否则没有令牌）| 404 |扩展的令牌引导仅在本地发生|
|__代码_0__|公共（`{alive:true}`）|公共（`{alive:true}`）|隧道活性探测路径|
|__代码_0__|公共（速率限制 300/min）|公共（限速）|配对代理的设置密钥交换|
|__代码_0__|auth（不记名根或范围）|auth（仅限范围，允许列表的命令）|隧道上的根令牌 = 403|
|__代码_0__|授权|授权|让远程代理发布到本地侧边栏|
|__代码_0__|仅限 root| 404 |配对薄荷 — 本地操作员操作|
|__代码_0__|仅限 root| 404 |守护进程配置|
|__代码_0__、__代码_1__|仅限 root| 404 |范围代币 mint/revoke|
|__代码_0__、__代码_1__|公共 UI、身份验证 API| 404 |仅本地 - 读取本地浏览器数据库|
|`GET /inspector`、`/inspector/events` 等|授权| 404 |扩展回调，仅限本地|
|__代码_0__|民众| 404 |GStack 浏览器登陆页面，仅限本地|
|__代码_0__|授权| 404 |参考图——内部状态|
|__代码_0__|承载或 HttpOnly `gstack_sse` cookie| 404 |上交所。 ?token= 不再接受查询参数|
|__代码_0__|承载或 HttpOnly `gstack_sse` cookie| 404 |上交所。与 /activity/stream 相同的 cookie|
|__代码_0__|授权（持有者）| 404 |生成仅供查看的 30 分钟 SSE 会话 cookie|

**隧道表面拒绝日志。** 隧道侦听器上的每个拒绝（`path_not_on_tunnel`、`root_token_on_tunnel`、`missing_scoped_token`、`disallowed_command:*`）都会以时间戳、源 IP（来自 `x-forwarded-for`）、路径和方法异步记录到 `~/.gstack/security/attempts.jsonl`。全局速率上限为 60 次写入/min，以防止日志洪泛 DoS。与提示注入扫描程序共享尝试日志。

**SSE 会话 cookie。** EventSource 无法发送授权标头，因此扩展程序在引导时使用根 Bearer POST `/sse-session` 一次，并接收 30 分钟的仅查看 cookie（`gstack_sse`、HttpOnly、SameSite=Strict）。该 cookie 仅对 `/activity/stream` 和 `/inspector/events` 有效 — 它不是作用域令牌，不能在 `/command` 上使用。范围隔离由模块边界强制执行：`sse-session-cookie.ts` 没有从 `token-registry.ts` 导入。

**此波中的非目标**（跟踪为#1136）：cookie-import-browser 路径使用 `--remote-debugging-port=<random>` 启动 Chrome。在具有应用程序绑定加密 v20 的 Windows 上，同一用户本地进程可以连接到该端口并泄露解密的 v20 cookie - 相对于直接读取 SQLite DB 的提升路径（没有 DPAPI 上下文无法解密 v20）。修复方向为 `--remote-debugging-pipe` 而不是 TCP；需要重组 CDP 客户端。

### 不记名令牌身份验证

每个服务器会话都会生成一个随机 UUID 令牌，以模式 0o600（仅限所有者读取）写入状态文件。每个改变浏览器状态的 HTTP 请求都必须包含 `Authorization: Bearer <token>`。如果令牌不匹配，服务器将返回 401。

这可以防止同一台计算机上的其他进程与您的浏览服务器通信。 Cookie 选择器 UI (`/cookie-picker`) 和运行状况检查 (`/health`) 在本地侦听器上不受限制 — 它们与 127.0.0.1 绑定，并且不执行命令。在隧道侦听器上，除了 `/connect` 之外，没有任何内容可以豁免。

### Cookie 安全

Cookie 是最敏感的数据 gstack 句柄。设计：

1. **钥匙串访问需要用户批准。** 每个浏览器的第一个 cookie 导入会触发 macOS 钥匙串对话框。用户必须单击“允许”或“始终允许”。 gstack 永远不会默默地访问凭据。

2. **解密发生在进程中。** Cookie 值在内存中解密 (PBKDF2 + AES-128-CBC)，加载到 Playwright 上下文中，并且永远不会以明文形式写入磁盘。 Cookie 选择器 UI 从不显示 Cookie 值 - 仅显示域名和计数。

3. **数据库是只读的。** gstack 将 Chromium cookie DB 复制到临时文件（以避免 SQLite 锁定与正在运行的浏览器发生冲突）并将其以只读方式打开。它永远不会修改您真实浏览器的 cookie 数据库。

4. **密钥缓存是按会话进行的。** 钥匙串密码 + 派生的 AES 密钥在服务器的生命周期内缓存在内存中。当服务器关闭（空闲超时或显式停止）时，缓存就会消失。

5. **日志中没有 cookie 值。** 控制台、网络和对话日志从不包含 cookie 值。 `cookies` 命令输出 cookie 元数据（域、名称、过期时间），但值会被截断。

### 预防外壳注入

浏览器注册表（Comet、Chrome、Arc、Brave、Edge）是硬编码的。数据库路径是根据已知常量构建的，而不是根据用户输入构建的。钥匙串访问使用 `Bun.spawn()` 和显式参数数组，而不是 shell 字符串插值。

### 提示注入防御（侧边栏代理）

Chrome 侧边栏代理具有工具（Bash、Read、Glob、Grep、WebFetch）并读取恶意网页，因此它是 gstack 最容易受到提示注入的部分。防御是分层的，而不是单点的。

1. **L1-L3 内容安全 (`browse/src/content-security.ts`)。** 在每个页面内容命令和每个工具输出上运行：数据标记、隐藏元素条带、ARIA 正则表达式、URL 阻止列表和信任边界信封包装器。适用于服务器和代理。

2. **L4 ML 分类器 — TestSavantAI (`browse/src/security-classifier.ts`)。** 与代理捆绑在一起的 22MB BERT-小型 ONNX 模型（int8 量化）。本地运行，无需网络。在 Claude 看到之前扫描每条用户消息和每个 Read/Glob/Grep/WebFetch 工具输出。通过 `GSTACK_SECURITY_ENSEMBLE=deberta` 选择加入 721MB DeBERTa-v3 ensemble。

3. **L4b 转录分类器。** Claude Haiku 通行证查看完整的对话形式（用户消息、工具调用、工具输出），而不仅仅是文本。由 `LOG_ONLY: 0.40` 控制，因此大多数干净的流量都会跳过付费电话。

4. **L5 金丝雀令牌 (`browse/src/security.ts`)。** 在会话开始时注入系统提示符的随机令牌。如果令牌出现在 Claude 的输出、工具参数、URL 或文件写入中的任何位置，则跨 `text_delta` 和 `input_json_delta` 流的滚动缓冲区检测会捕获该令牌。确定性块——如果令牌泄漏，攻击者说服克劳德透露系统提示，然后会话结束。

5. **L6 集成组合器 (`combineVerdict`)。** BLOCK 需要两个 ML 分类器在 >= `WARN` (0.60) 处达成一致，而不是单个置信命中。这是堆栈溢出指令写入误报缓解措施。在工具输出扫描中，单层高置信度直接阻止 - 内容不是用户创作的，因此 FP 问题不适用。

**关键约束：** `security-classifier.ts` 仅在侧边栏代理进程中运行，而不会在编译的浏览二进制文件中运行。 `@huggingface/transformers` v4 需要 `onnxruntime-node`，这会导致 Bun 编译的临时提取目录中的 `dlopen` 失败。只有纯字符串片段（金丝雀注入/check、判决组合器、攻击日志、状态）位于`security.ts`中，可以安全地从`server.ts`导入。

**环境旋钮：** `GSTACK_SECURITY_OFF=1` 是一个真正的终止开关（跳过 ML 扫描，金丝雀仍然注入）。模型缓存位于 `~/.gstack/models/testsavant-small/`（112MB，首次运行）和 `~/.gstack/models/deberta-v3-injection/`（721MB，仅限选择加入）。攻击日志位于 `~/.gstack/security/attempts.jsonl`（加盐 sha256 + 域，以 10MB 轮换，5 代）。每个设备的盐位于 `~/.gstack/security/device-salt` (0600)，在进程内缓存以适应 FS 不可写的环境。

**可见性。** 侧边栏标题显示通过 `/sidebar-chat` 轮询的盾牌图标 (绿色/amber/red)。金丝雀泄漏或 BLOCK 判决上会出现居中横幅，并显示确切的层分数。 `bin/gstack-security-dashboard` 聚合本地尝试； `supabase/functions/community-pulse` 聚合跨用户选择加入的社区遥测。

## 参考系统

Refs (`@e1`, `@e2`, `@c1`) 是代理在不编写 CSS 选择器或 XPath 的情况下寻址页面元素的方式。

### 它是如何运作的

```
1. Agent runs: $B snapshot -i
2. Server calls Playwright's page.accessibility.snapshot()
3. Parser walks the ARIA tree, assigns sequential refs: @e1, @e2, @e3...
4. For each ref, builds a Playwright Locator: getByRole(role, { name }).nth(index)
5. Stores Map<string, RefEntry> on the BrowserManager instance (role + name + Locator)
6. Returns the annotated tree as plain text

Later:
7. Agent runs: $B click @e3
8. Server resolves @e3 → Locator → locator.click()
```

### 为什么是定位器，而不是 DOM 突变

最明显的方法是将 `data-ref="@e1"` 属性注入到 DOM 中。这打破了：

- **CSP（内容安全策略）。**许多生产站点阻止脚本中的 DOM 修改。
- **React/Vue/Svelte 水合作用。** 框架协调可以剥离注入的属性。
- **Shadow DOM。** 无法从外部到达内部影子根。

剧作家定位器位于 DOM 外部。它们使用可访问性树（Chromium 内部维护）和 `getByRole()` 查询。无 DOM 突变、无 CSP 问题、无框架冲突。

### 参考生命周期

导航时参考被清除（主框架上的 `framenavigated` 事件）。这是正确的——导航后，所有定位器都已过时。代理必须再次运行 `snapshot` 才能获取新的引用。这是设计使然：陈旧的引用应该大声失败，而不是点击错误的元素。

### 引用过时检测

SPA 可以在不触发 `framenavigated` 的情况下改变 DOM（例如 React 路由器转换、选项卡切换、模式打开）。即使页面 URL 没有改变，这也会导致 refs 过时。为了捕获这个问题， `resolveRef()` 在使用任何引用之前执行异步 `count()` 检查：

```
resolveRef(@e3) → entry = refMap.get("e3")
                → count = await entry.locator.count()
                → if count === 0: throw "Ref @e3 is stale — element no longer exists. Run 'snapshot' to get fresh refs."
                → if count > 0: return { locator }
```

这会快速失败（大约 5 毫秒的开销），而不是让 Playwright 的 30 秒操作超时在缺少元素时到期。 `RefEntry` 将 `role` 和 `name` 元数据与定位器一起存储，因此错误消息可以告诉代理该元素是什么。

### 光标交互式参考 (@c)

`-C` 标志查找可单击但不在 ARIA 树中的元素 - 使用 `cursor: pointer` 样式的元素、具有 `onclick` 属性的元素或自定义 `tabindex`。这些在单独的命名空间中获取 `@c1`、`@c2` 引用。这捕获了框架呈现为 `<div>` 但实际上是按钮的自定义组件。

## 日志架构

三个环形缓冲区（每个 50,000 个条目，O(1) 推送）：

```
Browser events → CircularBuffer (in-memory) → Async flush to .gstack/*.log
```

控制台消息、网络请求和对话事件都有自己的缓冲区。刷新每 1 秒发生一次——服务器仅添加自上次刷新以来的新条目。这意味着：

- HTTP 请求处理永远不会被磁盘 I/O 阻止
- 日志在服务器崩溃后仍可保存（最多 1 秒的数据丢失）
- 内存是有限的（50K 条目 × 3 个缓冲区）
- 磁盘文件只能追加，可由外部工具读取

`console`、`network` 和 `dialog` 命令从内存缓冲区读取，而不是从磁盘读取。磁盘文件用于事后调试。

## SKILL.md模板系统

### 问题

SKILL.md 文件告诉 Claude 如何使用浏览命令。如果文档列出了不存在的标志，或者错过了添加的命令，则代理会出错。手工维护的文档总是偏离代码。

### 解决方案

```
SKILL.md.tmpl          (human-written prose + placeholders)
       ↓
gen-skill-docs.ts      (reads source code metadata)
       ↓
SKILL.md               (committed, auto-generated sections)
```

模板包含需要人工判断的工作流程、提示和示例。占位符是在构建时从源代码填充的：

|占位符|来源|它生成什么|
|-------------|--------|-------------------|
|__代码_0__|__代码_0__|分类命令表|
|__代码_0__|__代码_0__|带有示例的标记参考|
|__代码_0__|__代码_0__|启动块：更新检查、会话跟踪、贡献者模式、AskUserQuestion 格式|
|__代码_0__|__代码_0__|二进制发现+设置说明|
|__代码_0__|__代码_0__|针对公关目标技能的动态基础分支检测（发布、审查、质量保证、计划-首席执行官-审查）|
|__代码_0__|__代码_0__|/qa 和 /qa-only 的共享 QA 方法块|
|__代码_0__|__代码_0__|/plan-design-review 和 /design-review 的共享设计审核方法|
|__代码_0__|__代码_0__|飞行前检查 /ship 的准备情况仪表板|
|__代码_0__|__代码_0__|测试框架检测、引导程序、针对 /qa、/ship、/design-review 的 CI/CD 设置|
|__代码_0__|__代码_0__|/plan-ceo-review 和 /plan-eng-review 的可选跨模型计划审查（Codex 或 Claude 子代理后备）|
|__代码_0__|__代码_0__|`$D` 设计二进制文件的发现模式，镜像 `{{BROWSE_SETUP}}`|
|__代码_0__|__代码_0__|/design-shotgun、/plan-design-review、/design-consultation 的共享比较板反馈回路|
|__代码_0__|__代码_0__|/design-html、/design-shotgun、/design-review、/plan-design-review 的用户行为基础（扫描、满意、商誉库、主干测试）|
|__代码_0__|__代码_0__|具有关键词提取、健康意识和数据研究路由的大脑优先上下文搜索。注入10项大脑意识技能。在无脑宿主上受到抑制。|
|__代码_0__|__代码_0__|具有实体丰富、节流处理和每技能保存指令的技能后大脑持久性。 8 种特定于技能的保存格式。|

这在结构上是合理的——如果代码中存在命令，它就会出现在文档中。如果它不存在，它就不会出现。

### 序言

每个技能都以 `{{PREAMBLE}}` 块开始，该块在技能自己的逻辑之前运行。它在一个 bash 命令中处理五件事：

1. **更新检查** — 调用 `gstack-update-check`，报告升级是否可用。
2. **会话跟踪** — 触及 `~/.gstack/sessions/$PPID` 并计算活动会话（过去 2 小时内修改的文件）。当运行 3 个以上会话时，所有技能都会进入“ELI16 模式”——每个问题都会让用户重新了解上下文，因为他们正在处理窗口。
3. **操作自我改进** - 在每次技能会话结束时，代理都会反思失败（CLI 错误、错误方法、项目怪癖）并将操作学习记录到项目的 JSONL 文件中以供将来的会话使用。
4. **AskUserQuestion 格式** — 通用格式：上下文、问题、`RECOMMENDATION: Choose X because ___`、字母选项。所有技能保持一致。
5. **构建前搜索** — 在构建基础设施或不熟悉的模式之前，请先搜索。三层知识：经过验证的知识（第 1 层）、新颖流行的知识（第 2 层）、第一原理（第 3 层）。当第一性原理推理表明传统观点是错误的时，智能体会命名“尤里卡时刻”并记录下来。请参阅 `ETHOS.md` 了解完整的构建器理念。

### 为什么是提交的，而不是在运行时生成的？

三个原因：

1. **Claude 在技能加载时读取 SKILL.md。** 当用户调用 `/browse` 时，没有构建步骤。该文件必须已经存在并且正确。
2. **CI 可以验证新鲜度。** `gen:skill-docs --dry-run` + `git diff --exit-code` 在合并之前捕获过时的文档。
3. **Git Blame 有效。** 您可以看到命令何时添加以及在哪个提交中。

### 模板测试层

|等级|什么|成本|速度|
|------|------|------|-------|
|1 — 静态验证|解析 SKILL.md 中的每个 `$B` 命令，根据注册表进行验证|自由的| <2s |
|2 — E2E 通过 `claude -p`|生成真正的克劳德会话，运行每个技能，检查错误| ~$3.85 |约20分钟|
|3 — 法学硕士法官|十四行诗对文档清晰度进行评分/completeness/actionability| ~$0.15 | ~30s |

第 1 层在每个 `bun test` 上运行。第 2+3 层位于 `EVALS=1` 后面。这个想法是：免费捕获 95% 的问题，仅使用法学硕士进行判断。

## 指挥调度

命令按副作用分类：

- **READ**（文本、html、链接、控制台、cookies...）：没有突变。可以安全重试。返回页面状态。
- **写入**（转到、单击、填充、按下...）：改变页面状态。不是幂等的。
- **META**（快照、屏幕截图、选项卡、链……）：服务器级操作不完全适合 read/write。

这不仅仅是组织上的。服务器使用它来进行调度：

```typescript
if (READ_COMMANDS.has(cmd))  → handleReadCommand(cmd, args, bm)
if (WRITE_COMMANDS.has(cmd)) → handleWriteCommand(cmd, args, bm)
if (META_COMMANDS.has(cmd))  → handleMetaCommand(cmd, args, bm, shutdown)
```

`help` 命令返回所有三个集合，以便代理可以自行发现可用的命令。

## 错误哲学

错误是人工智能代理的错误，而不是人类的错误。每条错误消息都必须是可操作的：

- “未找到元素”→“未找到元素或不可交互。运行 `snapshot -i` 以查看可用元素。”
- “选择器匹配多个元素”→“选择器匹配多个元素。请改用来自 `snapshot` 的 @refs。”
- 超时 → “导航在 30 秒后超时。页面可能很慢或 URL 可能错误。”

Playwright 的本机错误通过 `wrapError()` 重写，以去除内部堆栈跟踪并添加指导。代理应该能够读取错误并知道下一步该做什么，而无需人工干预。

### 崩溃恢复

服务器不会尝试自我修复。如果 Chromium 崩溃 (`browser.on('disconnected')`)，服务器会立即退出。 CLI 在下一个命令中检测到失效服务器并自动重新启动。这比尝试重新连接到半死的浏览器进程更简单、更可靠。

## 端到端测试基础设施

### 会话运行程序 (`test/helpers/session-runner.ts`)

E2E 测试将 `claude -p` 作为一个完全独立的子进程生成 - 不是通过 Agent SDK，它不能嵌套在 Claude Code 会话中。跑步者：

1. 将提示写入临时文件（避免 shell 转义问题）
2. 生成 `sh -c 'cat 提示符|克劳德-p --输出格式流-json --verbose'`
3. 从标准输出流式传输 NDJSON 以获取实时进度
4. 与可配置的超时竞争
5. 将完整的 NDJSON 记录解析为结构化结果

`parseNDJSON()` 函数是纯函数——没有 I/O，没有副作用——使其可独立测试。

### 可观测性数据流

```
  skill-e2e-*.test.ts
        │
        │ generates runId, passes testName + runId to each call
        │
  ┌─────┼──────────────────────────────┐
  │     │                              │
  │  runSkillTest()              evalCollector
  │  (session-runner.ts)         (eval-store.ts)
  │     │                              │
  │  per tool call:              per addTest():
  │  ┌──┼──────────┐              savePartial()
  │  │  │          │                   │
  │  ▼  ▼          ▼                   ▼
  │ [HB] [PL]    [NJ]          _partial-e2e.json
  │  │    │        │             (atomic overwrite)
  │  │    │        │
  │  ▼    ▼        ▼
  │ e2e-  prog-  {name}
  │ live  ress   .ndjson
  │ .json .log
  │
  │  on failure:
  │  {name}-failure.json
  │
  │  ALL files in ~/.gstack-dev/
  │  Run dir: e2e-runs/{runId}/
  │
  │         eval-watch.ts
  │              │
  │        ┌─────┴─────┐
  │     read HB     read partial
  │        └─────┬─────┘
  │              ▼
  │        render dashboard
  │        (stale >10min? warn)
```

**分割所有权：** session-runner 拥有心跳（当前测试状态），eval-store 拥有部分结果（已完成的测试状态）。观察者阅读两者。两个组件都不知道对方——它们仅通过文件系统共享数据。

**非致命的一切：** 所有可观察性 I/O 都包含在 try/catch 中。写入失败永远不会导致测试失败。测试本身就是真理的来源；可观察性是尽力而为的。

**机器可读的诊断：** 每个测试结果包括 `exit_reason`（成功、超时、error_max_turns、error_api、exit_code_N）、`timeout_at_turn` 和 `last_tool_call`。这将启用 `jq` 查询，例如：
```bash
jq '.tests[] | select(.exit_reason == "timeout") | .last_tool_call' ~/.gstack-dev/evals/_partial-e2e.json
```

### 评估持久性 (`test/helpers/eval-store.ts`)

`EvalCollector` 累积测试结果并以两种方式写入：

1. **增量：** `savePartial()` 在每次测试后写入 `_partial-e2e.json` （原子：写入 `.tmp`、`fs.renameSync`）。杀戮中幸存。
2. **最终：** `finalize()` 写入带时间戳的 eval 文件（例如 `e2e-20260314-143022.json`）。部分文件永远不会被清理——它与最终文件一起保留以实现可观察性。

`eval:compare` 比较两次 eval 运行。 `eval:summary` 汇总 `~/.gstack-dev/evals/` 中所有运行的统计信息。

### 测试等级

|等级|什么|成本|速度|
|------|------|------|-------|
|1 — 静态验证|解析 `$B` 命令，根据注册表进行验证，可观察性单元测试|自由的| <5s |
|2 — E2E 通过 `claude -p`|生成真正的克劳德会话，运行每个技能，扫描错误| ~$3.85 |约20分钟|
|3 — 法学硕士法官|十四行诗对文档清晰度进行评分/completeness/actionability| ~$0.15 | ~30s |

第 1 层在每个 `bun test` 上运行。第 2+3 层位于 `EVALS=1` 后面。想法：免费捕获 95% 的问题，仅使用法学硕士进行判断调用和集成测试。

## 故意不在这里的东西

- **没有 WebSocket 流。** HTTP 请求/response 更简单，可以使用curl 进行调试，并且足够快。流媒体会增加边际效益的复杂性。
- **无 MCP 协议。** MCP 会增加每个请求的 JSON 架构开销，并且需要持久连接。纯 HTTP + 纯文本输出在令牌上更轻且更易于调试。
- **无多用户支持。** 每个工作区一台服务器，一名用户。令牌身份验证是深度防御，而不是多租户。
- **无 Windows/Linux cookie 解密。** macOS 钥匙串是唯一受支持的凭据存储。 Linux (GNOME Keyring/kwallet) 和 Windows (DPAPI) 在架构上是可行的，但尚未实现。
- **无 iframe 自动发现。** `$B frame` 支持跨框架交互（CSS 选择器、@ref、`--name`、`--url` 匹配），但 ref 系统不会在 `snapshot` 期间自动抓取 iframe。您必须首先显式输入框架上下文。
