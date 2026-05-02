# GStack Browser V0：AI 原生开发浏览器

**日期：** 2026-03-30  
**作者：** Garry Tan + Claude Code  
**状态：** Phase 1a 已发布，Phase 1b 进行中  
**分支：** `garrytan/gstack-as-browser`

## 核心论点

其他 AI 浏览器（Atlas、Dia、Comet、Chrome Auto Browse）都是先有一个面向消费者的浏览器，再把 AI 挂上去。GStack Browser 反过来做。它先把 Claude Code 当成运行时，再给它一个浏览器视口。

代理是第一公民。浏览器是画布。Skills 是一等能力。你不是“在浏览器里用一点 AI 帮助”，而是在使用一个“能看见并操作 Web 的 AI”。

这是后 IDE 时代的 IDE。代码住在终端里，产品住在浏览器里，AI 同时跨这两边工作。Cursor 之于文本编辑器，GStack Browser 就是浏览器世界里的对应物。

## 它现在是什么（Phase 1a，已发布）

一个可双击启动的 macOS `.app`，内部打包了 Playwright 的 Chromium 和 gstack sidebar extension。打开它之后，Claude Code 就能看见你的屏幕、跳转页面、填写表单、截图、检查 CSS、清理遮罩层，并运行任意 gstack skill，而且全程不用碰终端。

```text
GStack Browser.app (389MB, 189MB DMG)
├── Compiled browse binary (58MB) - CLI + HTTP server
├── Chrome extension (172KB) - sidebar, activity feed, inspector
├── Playwright's Chromium (330MB) - 真正的浏览器
└── Launcher script - 绑定项目目录，设置环境变量
```

启动流程：

`Launch -> Chromium 打开并带 sidebar -> extension 自动连接 browse server -> 约 5 秒后 agent 就绪`

## 它将会变成什么

### Phase 1b：开发者体验（下一步）

**Command Palette（Cmd+K）**  
最标志性的交互方式。打开一个支持模糊筛选的 skill picker。输入 `/qa` 开始 QA 测试，输入 `/investigate` 开始排查，输入 `/ship` 创建 PR。Skills 从 browse server 动态获取，而不是硬编码。这个 palette 是所有能力的总入口。

**Quick Screenshot（Cmd+Shift+S）**  
抓取当前 viewport，并把图片带着 “What do you see?” 的上下文送进 sidebar chat。AI 分析截图并给出可执行反馈。视觉 bug 报告只需一个快捷键。

**Status Bar**  
每个页面底部都固定有一条 30px 的状态条，显示 agent 状态（idle/thinking）、workspace 名称、当前 branch，以及自动检测到的 dev server。点击某个 dev server pill 就能导航过去。用户可以随时知道 AI 正在做什么。

**Auto-Detect Dev Servers**  
启动时扫描常见端口（3000、3001、4200、5173、5174、8000、8080）。如果只发现一个 server，就自动跳转。状态条里也会显示 dev server pills，支持一键切换。

### Phase 2：BoomLooper 集成

sidebar 不再连本地 `claude -p` 子进程，而是连 BoomLooper 的 Phoenix/Elixir API。BoomLooper 提供：

- **多代理编排**：同时拉起 5 个代理，每个代理一个浏览器 tab
- **Docker 基础设施**：每个代理运行在隔离容器内，无端口冲突、无状态泄漏
- **会话持久化**：浏览器重启后代理上下文依然保留
- **团队可见性**：团队成员可实时看到代理在做什么

### Phase 3：把 browse 变成 BoomLooper Tool

`browse` binary 成为 BoomLooper 中的 MCP tool。运行在 Docker 容器中的代理可以用 browse 命令测试 dev server、截图、填写表单和验证部署。为此需要完成跨平台编译（linux-arm64/x64）。

### Phase 4：Chromium Fork（条件触发）

当 extension side panel 遇到 API 极限、产品开始对外部用户发布、构建基础设施成熟、并且商业价值足以支撑维护时：fork Chromium。沿用 Brave 那种 `chromium_src` override 模式，并用 Claude Code 驱动 6 周一轮的 rebase。

### Phase 5：原生 Shell

用 SwiftUI/AppKit 写一个原生 app shell，内建 sidebar，并把 Chromium 作为独立服务。实现完整的平台级集成。也可能被 Phase 4 替代。

## 愿景：AI 浏览器能做什么

### 1. 看见你所看见的

浏览器是 AI 的眼睛。不只是截图，而是通过 DOM、CSS、网络请求和无障碍树直接理解页面结构。

**现在：**
- `snapshot` 命令返回可访问性树
- AI 能看见按钮、链接、表单字段和文本
- 用 `@e1`、`@e2` 这类元素引用去点击、填写和交互

**下一步：**
- 实时页面观察
- 页面变化、控制台错误、网络失败时自动被察觉
- 不等人提醒就开始排查

**未来：**
- 真正的视觉理解
- 对比前后截图捕捉视觉回归
- 像“按钮左移了 3px，字体从 14px 变成 13px”这样的像素级审查

### 2. 对所见之物采取行动

它不只是“读网页”，而是能像人类一样操作页面。

**现在：**
- click、fill、select、hover、type、scroll、upload files、handle dialogs、navigate、manage tabs

**下一步：**
- 多步骤用户流程
- 例如“登录 → 去设置页 → 改时区 → 验证确认消息”

**未来：**
- 全自动 QA 代理
- “把这个页面的每个链接都点一遍，每个表单都试一遍，想办法搞坏它”

### 3. 一边浏览，一边写代码

这是关键差异点。AI 可以一边在浏览器里看到 bug，一边在代码里修复它。

**现在：**
- sidebar chat 连到 Claude Code
- 你说“这个按钮对不齐”
- AI 会读取 CSS、定位问题并给出修复建议
- `/design-review` 可以截图、发现视觉问题、提交修复并给出前后对比证据

**下一步：**
- 实现 live reload 闭环
- AI 改 CSS/HTML → 浏览器自动刷新 → AI 再次视觉验证

**未来：**
- 全栈调试
- 在浏览器里看到 500 错误
- 读 server logs
- 定位到出错代码
- 写修复并回浏览器验证

### 4. 理解整个栈

浏览器不只是视口，而是进入应用健康状态的窗口。

**现在：**
- 控制台日志捕获
- 网络请求监控
- 性能指标
- Cookie / Storage 检查
- CSS 计算样式和 box model 检查

**下一步：**
- 请求回放
- 性能回归检测
- 第三方脚本依赖审计
- 无障碍审计

**未来：**
- 全应用遥测
- 跨浏览器测试
- 与真实用户监控数据关联

### 5. Workspace 模型

浏览器本身就是 workspace。

**现在：**
- 每个浏览器会话绑定一个项目目录
- sidebar 显示当前 branch
- status bar 显示检测到的 dev server

**下一步：**
- 多项目支持
- 不关闭浏览器即可切换项目

**未来：**
- 团队工作区
- 多人共享同一个浏览器工作区
- 一个人导航，另一个人看着 AI 实时修

### 6. Skill 就是浏览器能力

每个 gstack skill 都会变成浏览器能力：

| Skill | 浏览器能力 |
|-------|-----------|
| `/qa` | 测试每个页面、发现 bug、修复并验证 |
| `/design-review` | 截图 → 分析 → 改 CSS → 再截图 |
| `/investigate` | 在浏览器里看错误 → 追到代码 → 修复 → 验证 |
| `/benchmark` | 测量性能 → 检测回归 |
| `/canary` | 监控线上站点 → 周期截图 → 异常告警 |
| `/ship` | 跑测试 → 评审 diff → 创建 PR → 在浏览器里验证部署 |
| `/cso` | 在真实浏览器里审计 XSS、开放重定向、点击劫持 |
| `/office-hours` | 浏览竞品站点 → 综合观察 → 写设计文档 |

Cmd+K 的 command palette 是总中枢。你不需要记住具体有哪些 skill，只要输入你想做什么，系统就会找到最合适的那个。

### 7. 设计闭环

AI 设计不是交接，而是一个循环：

```text
生成 mockup（GPT Image API）
  -> 在浏览器中评审（与线上页面并排）
  -> 根据反馈迭代
  -> 确认方向
  -> 生成生产级 HTML/CSS
  -> 在浏览器预览
  -> 用 /design-review 微调
  -> 发布
```

浏览器弥合了“Figma 里看起来怎样”和“线上真实效果怎样”之间的差距，因为 AI 可以同时看见两者。

### 8. 安全闭环

在真实浏览器里做 CSO 审查，而不只是静态分析。

- 向每个输入框注入 XSS payload
- 用不同 origin 回放请求测试 CSRF
- 构造 URL 测试开放重定向
- 检查 CSP 是否真的生效
- 操作 cookie 和 token 测 auth flow
- 把站点嵌入 iframe 测点击劫持

静态分析只能抓模式，浏览器测试才能验证现实。

### 9. 监控闭环

部署后的 canary 监控，运行在真实浏览器里：

```text
部署
 -> 浏览器打开生产 URL
 -> 记录基线截图
 -> 每 5 分钟：截图、对比、检查 console
 -> 发现视觉回归、新 console 错误、性能下降就告警
 -> 严重问题自动回滚
```

这是带 AI 判断能力的 synthetic monitoring，不只是“页面是否返回 200”，而是“页面是否看起来正确且功能正常”。

## 架构

```text
+-------------------------------------------------------+
|                  GStack Browser                       |
|                                                       |
|  +------------------+  +---------------------------+  |
|  |   Chromium       |  |   Extension Side Panel    |  |
|  |   (Playwright)   |  |   Chat / Feed / Inspector |  |
|  |   + Status Bar   |  |   Command Palette         |  |
|  +--------+---------+  +-------------+-------------+  |
+-----------+---------------------------+----------------+
            |                           |
            v                           v
  +---------+----------+    +-----------+----------+
  |  Browse Server     |    |  Sidebar Agent       |
  |  (HTTP + SSE)      |    |  (claude -p wrapper) |
  |  goto/click/fill   |    |  runs gstack skills  |
  +---------+----------+    +-----------+----------+
            |                           |
            v                           v
  +---------+----------+    +-----------+----------+
  |  User's App        |    |  Claude Code         |
  |  localhost:3000    |    |  reads/writes code   |
  +--------------------+    +----------------------+
```

## 竞争格局

| 浏览器 | 路线 | 差异点 | 弱点 |
|--------|------|--------|------|
| Atlas | Chromium fork + AI layer | Agentic browser | 偏消费者，不和代码编辑深度集成 |
| Dia | AI-native browser | UI 干净 | 没有 dev tools，没有代码编辑 |
| Comet | AI browser | 多代理浏览 | 很早期，开发工作流不清晰 |
| Chrome Auto Browse | Extension | 与 Chrome 深度集成 | 只是 extension，没有代码能力 |
| Cursor | VSCode fork + AI | 代码编辑很强 | 没有浏览器视口 |
| GStack Browser | Claude Code runtime + browser viewport | 浏览器里看到 bug，代码里修，浏览器里验证 | 目前仅 macOS、暂无消费者功能 |

GStack Browser 不和消费级浏览器竞争，它竞争的是“浏览器和编辑器之间来回切换”的工作流。

## 设计系统

来自 `DESIGN.md`：

- **主强调色：** Amber-500（`#F59E0B`）
- **背景：** Zinc-950 到 Zinc-800
- **字体：** JetBrains Mono（代码/状态）、DM Sans（UI/标签）
- **圆角：** 8px、12px、full
- **动效：** agent active 时 pulse，过渡 200ms
- **布局：** 右侧 sidebar，底部 status bar，居中的 palette

## 实现状态

| 组件 | 状态 | 说明 |
|------|------|------|
| `.app` bundle | 已发布 | 389MB，约 5 秒启动 |
| DMG 打包 | 已发布 | 189MB 压缩包 |
| `GSTACK_CHROMIUM_PATH` | 已发布 | 支持自定义 Chromium |
| `BROWSE_EXTENSIONS_DIR` | 已发布 | 支持覆盖 extension 路径 |
| 通过 `/health` 做 auth | 已发布 | 替代 `.auth.json` |
| 构建脚本 | 已发布 | `scripts/build-app.sh` |
| 模型路由 | 已发布 | action 用 Sonnet，analysis 用 Opus |
| 调试日志 | 已发布 | 40+ silent catch 改成带前缀日志 |
| headed 模式无 idle timeout | 已发布 | 窗口开着浏览器就活着 |
| cookie import 按钮 | 已发布 | sidebar footer 一键导入 |
| sidebar arrow hint | 已发布 | 真打开 sidebar 后才隐藏 |
| 架构文档 | 已发布 | `docs/designs/SIDEBAR_MESSAGE_FLOW.md` |
| command palette | 规划中 | Phase 1b |
| quick screenshot | 规划中 | Phase 1b |
| status bar | 规划中 | Phase 1b |
| dev server detection | 规划中 | Phase 1b |
| BoomLooper integration | 未来 | Phase 2 |
| 跨平台 | 未来 | Phase 3 |
| Chromium fork | 条件触发 | Phase 4 |
| native shell | 延后 | Phase 5 |

## 12 个月愿景

```text
TODAY（Phase 1）            6 MONTHS（Phase 2-3）       12 MONTHS（Phase 4-5）
macOS .app wrapper         BoomLooper multi-agent      Chromium fork 或
Extension sidebar          Docker containers           Native SwiftUI shell
Local claude -p agent      Team workspaces             Cross-platform
Single project             Linux/x64 browse            Auto-update
Manual skill invocation    Autonomous QA loops         Skill marketplace
                           Performance monitoring      Plugin API
                           Real-time collaboration     Enterprise features
```

理想中的 12 个月后：

你打开 GStack Browser，它自动识别项目、启动 dev server、跑测试并告诉你哪里坏了。你说一句“fix it”，AI 就修掉全部 bug、逐个视觉验证并创建 PR。你在同一个浏览器里看 PR、批准、部署，然后 AI 继续监控 canary。所有事情都在一个窗口里完成。

这才是“浏览器即 AI 工作区”。不是“给浏览器外挂 AI”，而是“给 AI 外挂浏览器”。

## 评审历史

这份计划经历了 4 轮评审：

1. **CEO Review**：提出 9 个范围建议，接受 3 个（Cmd+K、Cmd+Shift+S、status bar）
2. **Design Review**：从 5/10 提升到 8/10，补了 9 个设计决策，生成了 2 个 mockup
3. **Eng Review**：发现 4 个问题，没有致命缺口，并产出了测试计划
4. **Codex Review**：发现 9 个问题，其中 3 个是关键架构缺口，全部已修正

Codex review 抓住了前 3 轮都漏掉的 3 个真实架构问题，说明跨模型评审是有效的。