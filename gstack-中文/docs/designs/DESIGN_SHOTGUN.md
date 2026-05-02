# 设计：Design Shotgun — 浏览器到代理的反馈循环

生成日期：2026-03-27
分支：garrytan/agent-design-tools
状态：生活文档 - 随着发现并修复错误而更新

## 此功能的作用

Design Shotgun 生成多个 AI 设计模型，并在用户的真实浏览器中作为比较板展示，同时收集结构化反馈（选择收藏、评价替代方案、留下注释、请求重新生成）。反馈流返回到编码代理，代理对其进行操作：要么继续执行已批准的变体，要么生成新变体并重新加载面板。

用户无需离开浏览器标签页。代理不会提出多余的问题。面板本身就是反馈机制。

## 核心问题：必须对话的两个世界

```
  ┌─────────────────────┐          ┌──────────────────────┐
  │   USER'S BROWSER    │          │   CODING AGENT       │
  │   (real Chrome)     │          │   (Claude Code /     │
  │                     │          │    Conductor)         │
  │  Comparison board   │          │                      │
  │  with buttons:      │   ???    │  Needs to know:      │
  │  - Submit           │ ──────── │  - What was picked   │
  │  - Regenerate       │          │  - Star ratings      │
  │  - More like this   │          │  - Comments          │
  │  - Remix            │          │  - Regen requested?  │
  └─────────────────────┘          └──────────────────────┘
```

这“？？？”是最难的部分。用户在 Chrome 中点击按钮。运行在终端中的代理需要知道这一点。这是两个完全独立的过程，没有共享内存、没有共享事件总线、没有 WebSocket 连接。

## 架构：连接如何运作

```
  USER'S BROWSER                    $D serve (Bun HTTP)              AGENT
  ═══════════════                   ═══════════════════              ═════
       │                                   │                           │
       │  GET /                            │                           │
       │ ◄─────── serves board HTML ──────►│                           │
       │    (with __GSTACK_SERVER_URL      │                           │
       │     injected into <head>)         │                           │
       │                                   │                           │
       │  [user rates, picks, comments]    │                           │
       │                                   │                           │
       │  POST /api/feedback               │                           │
       │ ─────── {preferred:"A",...} ─────►│                           │
       │                                   │                           │
       │  ◄── {received:true} ────────────│                           │
       │                                   │── writes feedback.json ──►│
       │  [inputs disabled,                │   (or feedback-pending    │
       │   "Return to agent" shown]        │    .json for regen)       │
       │                                   │                           │
       │                                   │                  [agent polls
       │                                   │                   every 5s,
       │                                   │                   reads file]
```

### 三个文件

| 文件 | 写入时机 | 方法 | 代理行动 |
|------|-------------|-------|-------------|
| `feedback.json` | 用户点击提交 | 最终选择，完成 | 阅读它，继续 |
| `feedback-pending.json` | 用户点击“重新生成/更多类似” | 想要新的选择 | 读取它，删除它，生成新的变体，重新加载面板 |
| `feedback.json`（第 2 轮以上） | 重新生成后用户点击提交 | 迭代后最终选择 | 阅读它，继续 |

### 状态机

```
  $D serve starts
       │
       ▼
  ┌──────────┐
  │ SERVING  │◄──────────────────────────────────────┐
  │          │                                        │
  │ Board is │  POST /api/feedback                    │
  │ live,    │  {regenerated: true}                   │
  │ waiting  │──────────────────►┌──────────────┐     │
  │          │                   │ REGENERATING │     │
  │          │                   │              │     │
  └────┬─────┘                   │ Agent has    │     │
       │                         │ 10 min to    │     │
       │  POST /api/feedback     │ POST new     │     │
       │  {regenerated: false}   │ board HTML   │     │
       │                         └──────┬───────┘     │
       ▼                                │             │
  ┌──────────┐                POST /api/reload        │
  │  DONE    │                {html: "/new/board"}    │
  │          │                          │             │
  │ exit 0   │                          ▼             │
  └──────────┘                   ┌──────────────┐     │
                                 │  RELOADING   │─────┘
                                 │              │
                                 │ Board auto-  │
                                 │ refreshes    │
                                 │ (same tab)   │
                                 └──────────────┘
```

### 端口发现

代理后台运行 `$D serve` 并从 stderr 读取端口信息：

```
SERVE_STARTED: port=54321 html=/path/to/board.html
SERVE_BROWSER_OPENED: url=http://127.0.0.1:54321
```

代理从 stderr 解析 `port=XXXXX`。稍后需要使用此端口来 POST `/api/reload`，当用户请求重新生成时。如果代理丢失了端口号，就无法重新加载面板。

### 为什么是 127.0.0.1，而不是 localhost

在某些系统上，当 Bun.serve() 仅监听 IPv4 时，`localhost` 可能解析为 IPv6 `::1`。更重要的是，`localhost` 会发送该域的所有开发 cookie，开发者一直在努力解决这个问题。在具有许多活动会话的计算机上，这可能超出 Bun 的默认标头大小限制（HTTP 431 错误）。`127.0.0.1` 避免了这两个问题。

## 每个边缘情况和陷阱

### 1. 僵尸面板问题

**问题：** 用户提交反馈，POST 成功，服务器退出。但 HTML 页面仍在 Chrome 中打开。看起来是可交互的。用户可以编辑他们的反馈并再次点击提交。什么也不会发生，因为服务器已经消失了。

**修复：** POST 成功后，面板 JS：
- 禁用所有输入（按钮、单选按钮、文本区域、星级评定）
- 完全隐藏重新生成栏
- 将“提交”按钮替换为：“收到反馈！返回给您的编码代理。”
- 显示：“想要进行更多更改？再次运行 `/design-shotgun`。”
- 该页面成为所提交内容的只读记录

**实现于：** `compare.ts:showPostSubmitState()`（第 484 行）

### 2. 服务器死机问题

**问题：** 服务器超时（默认 10 分钟）或崩溃，而用户仍然打开了面板。用户点击提交。`fetch()` 会静默失败。

**修复：** `postFeedback()` 函数有一个 `.catch()` 处理程序。网络故障时：
- 显示红色错误横幅：“连接丢失”
- 在可复制的 `<pre>` 块中显示收集的反馈 JSON
- 用户可以将其直接复制粘贴到他们的编码代理中

**实现于：** `compare.ts:showPostFailure()`（第 546 行）

### 3. 陈旧的重新生成旋转器

**问题：** 用户点击“重新生成”。面板显示旋转器并每 2 秒轮询 `/api/progress`。代理崩溃或需要很长时间才能生成新变体。旋转器永远旋转。

**修复：** 进度轮询有 5 分钟硬性超时（150 次轮询 x 2 秒间隔）。5 分钟后：
- 旋转器替换为：“出了点问题。”
- 显示：“在编码代理中再次运行 `/design-shotgun`。”
- 轮询停止。页面变为信息性页面。

**实现于：** `compare.ts:startProgressPolling()`（第 511 行）

### 4. file:// URL 问题（原始错误）

**问题：** 技能模板最初使用 `$B goto file:///path/to/board.html`。但出于安全考虑，`browse/src/url-validation.ts:71` 会阻止 `file://` URL。后备的 `open file://...` 会打开用户的 macOS 浏览器，但 `$B eval` 轮询的是 Playwright 的无头浏览器（不同的进程，从未加载页面）。代理永远轮询空 DOM。

**修复：** `$D serve` 通过 HTTP 提供服务。切勿对主板使用 `file://`。`$D compare` 上的 `--serve` 标志将面板生成和 HTTP 服务结合在一个命令中。

**证据：** 请参阅 `.context/attachments/image-v2.png` — 真实用户准确命中了这个漏洞。代理正确诊断：(1) `$B goto` 拒绝 `file://` URL，(2) 即使使用浏览守护程序也没有轮询循环。

### 5. 双击竞赛

**问题：** 用户快速点击“提交”两次。两个 POST 请求到达服务器。第一个将状态设置为“完成”并在 100 毫秒内安排 `exit(0)`。第二个在那 100 毫秒的窗口期间到达。

**当前状态：** 未完全防护。`handleFeedback()` 函数不检查状态在处理之前是否已经“完成”。第二次 POST 将成功并写入第二个 `feedback.json`（无害，相同的数据）。之后退出仍然会在 100 毫秒后触发。

**风险：** 低。面板在第一次成功的 POST 响应时禁用所有输入，因此第二次点击需要在大约 1 毫秒内到达。两次写入都包含相同的反馈数据。

**潜在修复：** 在 `handleFeedback()` 顶部添加 `if (state === 'done') return Response.json({error: 'already submitted'}, {status: 409})`。

### 6. 端口协调问题

**问题：** 代理后台运行 `$D serve` 并从 stderr 解析 `port=54321`。代理稍后在重新生成期间需要此端口来 POST `/api/reload`。如果代理丢失上下文（对话压缩，上下文窗口填满），它可能不会记住端口。

**当前状态：** 端口打印到 stderr 一次。代理必须记住。没有端口文件写入磁盘。

**潜在修复：** 在面板 HTML 旁边写入 `serve.pid` 或 `serve.port` 文件。代理可以随时读取：
```bash
cat "$_DESIGN_DIR/serve.port"  # → 54321
```

### 7. 反馈文件清理问题

**问题：** 重新生成轮次中的 `feedback-pending.json` 留在磁盘上。如果代理在读取之前崩溃，下一个 `$D serve` 会话会发现一个过时的文件。

**当前状态：** 解析器模板中的轮询循环指示在读取后删除 `feedback-pending.json`。但这取决于代理完美遵循指示。过时的文件可能会混淆新会话。

**潜在修复：** `$D serve` 可以在启动时检查并删除过时的反馈文件。或者：使用时间戳命名文件 (`feedback-pending-1711555200.json`)。

### 8. 顺序生成规则

**问题：** 底层 OpenAI GPT 图像 API 速率限制并发图像生成请求。当 3 个 `$D generate` 调用并行运行时，1 个成功，2 个中止。

**修复：** 技能模板必须明确说明：“一次生成一个模型。不要并行化 `$D generate` 调用。”这是一条提示级指令，而不是代码级锁。设计二进制文件不强制顺序执行。

**风险：** 代理经过训练可以并行独立工作。没有明确指令时，他们将尝试同时运行 3 个生成器。这会浪费 API 调用和金钱。

### 9. AskUserQuestion 冗余

**问题：** 用户通过面板提交反馈后（包含首选变体、评级、评论的 JSON），代理再次询问他们：“你喜欢哪种变体？”这很烦人。面板的目的就是避免这种情况。

**修复：** 技能模板必须说：“不要使用 AskUserQuestion 来询问用户的偏好。读取 `feedback.json`，它包含他们的选择。只询问用户问题来确认你理解正确，而不是再次询问。”

### 10. CORS 问题

**问题：** 如果面板 HTML 引用外部资源（来自 CDN 的字体、图像），浏览器会发送带有 `Origin: http://127.0.0.1:PORT` 的请求。大多数 CDN 允许这个，但有些人可能会阻止它。

**当前状态：** 服务器未设置 CORS 标头。面板 HTML 是独立的（图像 base64 编码，内联样式），所以这在实践中不是问题。

**风险：** 当前设计较低。如果面板加载外部资源，这会变得重要。

### 11. 大有效负载问题

**问题：** 对 `/api/feedback` 的 POST 正文没有大小限制。如果面板以某种方式发送多 MB 的有效负载，`req.json()` 会将其全部解析到内存中。

**当前状态：** 实际上，反馈 JSON 约为 500 字节到 2KB。风险是理论上的，不实际的。面板 JS 构造一个固定形状的 JSON 对象。

### 12. fs.writeFileSync 错误

**问题：** `feedback.json` 在 `serve.ts:138` 使用 `fs.writeFileSync()` 写入，没有 try/catch。如果磁盘已满或目录是只读的，则会抛出异常使服务器崩溃。用户永远看到一个旋转器（服务器已死，但面板不知道）。

**风险：** 实践中较低（面板 HTML 只是写入同一目录，证明它是可写的）。但是带有 500 响应的 try/catch 会更干净。

## 完整流程（逐步）

### 快乐路径：用户首次尝试时的选择

```
1. 代理运行: $D compare --images "A.png,B.png,C.png" --output board.html --serve &
2. $D serve 在随机端口（例如 54321）启动 Bun.serve()
3. $D serve 在用户的浏览器中打开 http://127.0.0.1:54321
4. $D serve 打印到 stderr: SERVE_STARTED: port=54321 html=/path/board.html
5. $D serve 写入注入了 __GSTACK_SERVER_URL 的面板 HTML
6. 用户看到并排显示 3 个变体的比较面板
7. 用户选择选项 B，评级 A: 3/5, B: 5/5, C: 2/5
8. 用户在总体反馈中写入“B 的间距更好，就用这个”
9. 用户点击提交
10. 面板 JS POST 到 http://127.0.0.1:54321/api/feedback
    正文: {"preferred":"B","ratings":{"A":3,"B":5,"C":2},"overall":"B has better spacing","regenerated":false}
11. 服务器将 feedback.json 写入磁盘（与 board.html 同目录）
12. 服务器将反馈 JSON 打印到 stdout
13. 服务器响应 {received:true, action:"submitted"}
14. 面板禁用所有输入，显示“返回给您的编码代理”
15. 服务器在 100 毫秒后以代码 0 退出
16. 代理的轮询循环找到 feedback.json
17. 代理读取它，向用户总结，继续执行
```

### 重新生成路径：用户想要不同的选择

```
1-6.  同上
7.  用户点击“完全不同”的小块
8.  用户点击重新生成
9.  面板 JS POST 到 /api/feedback
    正文: {"regenerated":true,"regenerateAction":"different","preferred":"","ratings":{},...}
10. 服务器将 feedback-pending.json 写入磁盘
11. 服务器状态 → "regenerating"
12. 服务器响应 {received:true, action:"regenerate"}
13. 面板显示旋转器：“正在生成新设计...”
14. 面板开始每 2 秒轮询 GET /api/progress

    同时，在代理中：
15. 代理的轮询循环找到 feedback-pending.json
16. 代理读取它，删除它
17. 代理运行: $D variants --brief "totally different direction" --count 3
    （一次一个，不并行）
18. 代理运行: $D compare --images "new-A.png,new-B.png,new-C.png" --output board-v2.html
19. 代理 POST: curl -X POST http://127.0.0.1:54321/api/reload -d '{"html":"/path/board-v2.html"}'
20. 服务器将 htmlContent 替换为新面板
21. 服务器状态 → "serving"（从 reloading）
22. 面板的下一次 /api/progress 轮询返回 {"status":"serving"}
23. 面板自动刷新: window.location.reload()
24. 用户看到带有 3 个新变体的新面板
25. 用户选择一个，点击提交 → 从步骤 10 开始的快乐路径
```

### “更多类似”路径

```
与重新生成相同，除了：
- regenerateAction 是 "more_like_B"（引用该变体）
- 代理使用 $D iterate --image B.png --brief "more like this, keep the spacing"
  而不是 $D variants
```

### 后备路径：$D 服务失败

```
1. 代理尝试 $D compare --serve，失败（二进制文件缺失、端口错误等）
2. 代理回退到: open file:///path/board.html
3. 代理使用 AskUserQuestion: "我已经打开了设计面板。你更喜欢哪个变体？有什么反馈吗？"
4. 用户以文本回复
5. 代理使用文本反馈继续（没有结构化 JSON）
```

## 实现此功能的文件

| 文件 | 角色 |
|------|------|
| `serve.ts` | HTTP 服务器、状态机、文件写入、浏览器启动 |
| `compare.ts` | 面板 HTML 生成、评级 JS/选择/重新生成、POST 逻辑、提交后生命周期 |
| `index.ts` | CLI 入口点，连接 `serve` 和 `compare --serve` 命令 |
| `commands.ts` | 命令注册表，定义 `serve` 和 `compare` 及其参数 |
| `template.ts` | `generateDesignShotgunLoop()` — 输出轮询循环和重新加载指令的模板解析器 |
| `skill.md` | 协调整个流程的技能模板：上下文收集、变体生成、`{{DESIGN_SHOTGUN_LOOP}}`、反馈确认 |
| `serve.test.ts` | HTTP 端点和状态转换的单元测试 |
| `compare.test.ts` | E2E 测试：浏览器点击 → JS fetch → HTTP POST → 磁盘文件 |
| `board.test.ts` | 比较面板 UI 的 DOM 级测试 |

## 仍然可能出现什么问题

### 已知风险（按可能性排序）

1. **代理不遵循顺序生成规则** - 大多数 LLM 希望并行化。如果没有在二进制文件中强制执行，这是一条可以忽略的提示级指令。

2. **代理丢失端口号** — 上下文压缩会丢弃 stderr 输出。代理无法重新加载面板。缓解措施：将端口写入文件。

3. **过时的反馈文件** — 崩溃会话中剩余的 `feedback-pending.json` 会混淆下一次运行。缓解措施：启动时清理。

4. **fs.writeFileSync 崩溃** — 反馈文件写入时没有 try/catch。如果磁盘已满，服务器将无声死亡。用户看到无限旋转器。5. **进度轮询漂移** — `setInterval(fn, 2000)` 超过 5 分钟。实际上，JavaScript 计时器足够准确。但如果浏览器选项卡处于后台，Chrome 可能会将间隔限制为每分钟一次。

### 运作良好的事情

1. **双通道反馈** — 前台模式的标准输出，后台模式的文件。两者始终活跃。代理可以使用哪个有效。

2. **独立的 HTML** — 板内嵌有所有 CSS、JS 和 base64 编码图像。没有外部依赖。离线工作。

3. **同一选项卡重新生成** — 用户停留在一个选项卡中。主板通过 `/api/progress` 轮询 + `window.location.reload()` 自动刷新。没有标签爆炸。

4. **优雅降级** — POST 失败显示可复制的 JSON。进度超时显示清晰的错误消息。没有无声的失败。

5. **提交后生命周期** — 提交后面板变为只读。没有僵尸形态。清除“下一步做什么”消息。

## 测试覆盖率

### 测试了什么

| 流动 | 测试 | 文件 |
|------|------|------|
| 提交→反馈.json在磁盘上 | 浏览器点击→文件 | __代码_0__ |
| 提交后 UI 锁定 | 输入已禁用，显示成功 | __代码_0__ |
| 重新生成→feedback-pending.json | 巧克力+再生点击→文件 | __代码_0__ |
| “更多这样的”→具体行动 | JSON 格式的 more_like_B | __代码_0__ |
| 再生后的旋转器 | DOM 显示加载文本 | __代码_0__ |
| 完全再生→重新加载→提交 | 2 往返 | __代码_0__ |
| 服务器在随机端口上启动 | 端口 0 绑定 | __代码_0__ |
| 服务器 URL 的 HTML 注入 | __GSTACK_SERVER_URL 检查 | __代码_0__ |
| 无效的 JSON 拒绝 | 400 回复 | __代码_0__ |
| HTML 文件验证 | 如果缺少则退出 1 | __代码_0__ |
| 超时行为 | 超时后退出1 | __代码_0__ |
| 板 DOM 结构 | 收音机、星星、巧克力 | __代码_0__ |

### 什么没有测试

| 差距 | 风险 | 优先事项 |
|-----|------|----------|
| 双击提交比赛 | 低 — 输入在第一次响应时禁用 | P3 |
| 进度轮询超时（150 次迭代） | 中等 — 测试中 5 分钟的等待时间较长 | P2 |
| 再生期间服务器崩溃 | 中 — 用户看到无限旋转器 | P2 |
| POST 期间网络超时 | 低 — 本地主机速度很快 | P3 |
| 后台 Chrome 标签限制间隔 | 中 — 可以将 5 分钟超时延长至 30 分钟以上 | P2 |
| 大反馈有效负载 | 低 — 板构造固定形状的 JSON | P3 |
| 并发会话（两个板，一台服务器） | 低 — 每个 $D 服务都有自己的端口 | P3 |
| 先前会话的过时反馈文件 | 中 - 可能会混淆新的轮询循环 | P2 |

## 潜在的改进

### 短期（本分支）

1. **将端口写入文件** — `serve.ts` 在启动时将 `serve.port` 写入磁盘。代理随时阅读。 5行。
2. **启动时清理陈旧文件** — `serve.ts` 在启动前删除 `feedback*.json`。 3行。
3. **守卫双击** — 检查 `handleFeedback()` 顶部的 `state === 'done'`。 2 行。
4. **try/catch 文件写入** — 将 `fs.writeFileSync` 包装在 try/catch 中，失败时返回 500。 5行。

### 中期（后续）

5. **WebSocket 而不是轮询** — 将 `setInterval` + `GET /api/progress` 替换为 WebSocket 连接。当新的 HTML 准备就绪时，董事会会收到即时通知。消除轮询漂移和后台选项卡限制。 serve.ts 中约 50 行 +compare.ts 中约 20 行。

6. **代理的端口文件** — 将 `{"port": 54321, "pid": 12345, "html": "/path/board.html"}` 写入 `$_DESIGN_DIR/serve.json`。代理读取此内容而不是解析 stderr。使系统对于上下文丢失更加稳健。

7. **反馈架构验证** — 在写入之前根据 JSON 架构验证 POST 正文。尽早捕获格式错误的反馈，而不是让下游代理感到困惑。

### 长期（设计方向）

8. **持久设计服务器** — 运行长期设计守护进程（如浏览守护进程），而不是每个会话启动 `$D serve`。多块板共享一台服务器。消除冷启动。但增加了守护进程生命周期管理的复杂性。

9. **实时协作** — 两名代理（或一名代理 + 一名人员）同时在同一个板上工作。服务器通过 WebSocket 广播状态更改。需要解决反馈冲突。