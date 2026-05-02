# ADR: Live Variant Mode

**Status:** Implemented (v3.1, feature branch `feature/single-skill-consolidation`)
**Date:** 2026-04-12
**Author:** Paul Bakaus + Claude

## 背景

Impeccable 是一个面向 AI coding agents 的设计 skill。它教会各种 AI harness（Claude Code、Cursor、Gemini CLI、Codex 等）如何产出更好的前端设计。这个 skill 目前有 22 个命令（bolder、quieter、polish、typeset 等），供 agent 在 source code 上执行。

缺失的一块是：此前没有办法在真实 live page 上做可视化迭代。用户当然可以让 agent “make this bolder”，但之后只能去读代码 diff、刷新页面，再判断自己喜不喜欢。不喜欢就再问一遍、再等、再刷新、再重复。这个过程既慢，又割裂。

**目标：** 让用户可以直接在浏览器里选中一个元素、选择一个设计动作，并看到 N 个真实的 HTML + CSS variants 被热替换进去。用户可以在视觉上轮换查看、接受或丢弃，然后继续下一轮。variant 由 agent 生成，浏览器负责展示。

## 决策

构建一个自包含的 live variant mode，并把它作为 impeccable skill 的一部分一起发布（不需要额外单独安装 npm 包）。系统要在三方之间打通桥梁：**browser**（用户在其中选元素、轮换 variants）、**server**（本地 localhost HTTP server，负责中转消息）以及 **agent**（通过修改 source files 来生成 variants 的 AI）。

### 关键架构决策

**1. 改 source，不直接 patch DOM。**
Variants 被写入真实 source file，而不是简单注入浏览器 DOM。这样做意味着：
- Framework state（React、Vue 等）可以保留，因为更新会走框架自己的渲染流水线和 HMR。
- “Accept” 变得非常简单：获胜的 variant 已经在 source 里，只需要把其他 variants 删除。
- Variants 是真实代码，用户可以在编辑器中查看、diff、提交。

**2. 用 SSE + fetch，不用 WebSocket。**
采用 Server-Sent Events（server -> browser）+ fetch POST（browser -> server），而不是 WebSocket。这样可以彻底去掉 `ws` 这个 npm 依赖。整个 server 保持为零依赖纯 Node.js（http、crypto、fs、net、os）。这很重要，因为这些脚本是随着 skill 一起分发的，要能在用户项目里零安装直接运行。

**3. 所有 live mode 脚本都自包含在 skill 中。**
全部 live mode 代码都放在 `source/skills/impeccable/scripts/`：
- `live-server.mjs` —— HTTP server（SSE、poll、source file 读取器）
- `live-poll.mjs` —— agent 的 poll / reply loop CLI 客户端
- `live-wrap.mjs` —— CLI helper，用于在 source 中定位元素并创建 variant wrappers
- `live-browser.js` —— 浏览器脚本（元素 picker、action panel、variant cycler、global bar）

用户通过 `npx skills add pbakaus/impeccable` 安装 skill 时，就自动获得 live mode，不需要额外 setup。agent 通过 `node {{scripts_path}}/live-server.mjs` 这样的方式运行脚本。

**4. agent 与 server 之间用 HTTP long-poll，而不是 WebSocket 或 stdin。**
agent 通过 HTTP long-poll 与 server 通信（`GET /poll` 会阻塞，直到浏览器事件到来）。这个设计可以跨所有 AI harness 工作，因为任何 harness 都能跑 shell command 并读取 stdout。无需做任何 harness-specific 集成。

**5. variant wrapper 使用 `display: contents`。**
Variants 会被包在一个 `display: contents` 的容器中，这样 wrapper 本身不会影响 CSS layout。被选中元素与父元素的关系（flex child、grid child 等）会被完整保留。wrapper 上会挂 `data-impeccable-variants` 和 `data-impeccable-variant-count` 两个属性，供浏览器脚本检测和轮换 variants。

**6. 提供 no-HMR fallback。**
对于不支持 HMR 的 dev server（例如 Bun 的静态 HTML import），浏览器会直接从 live server 的 `/source` endpoint 抓取原始 source file，再把 variants 注入 DOM。这个方案普适，但代价是注入阶段无法保留 framework state。

## 架构

```text
[BROWSER]
live-browser.js（通过 source HTML 中注入的 <script> 加载）
- 元素 picker（mousemove 高亮、click 选择、键盘导航）
- Action bar（floating pill：action picker、freeform input、variant count、go button）
- Global bar（底部 pill：Detect / Pick / Exit）
- Variant cycler（MutationObserver 监视 DOM 中新出现的 [data-impeccable-variant]）
- SSE 连接（EventSource -> /events）
- fetch POST（-> /events）
- localStorage（刷新后保留 session 状态）

[LIVE SERVER]
live-server.mjs（node, localhost:8400+, zero dependencies）
- GET  /live.js
- GET  /detect.js
- GET  /events
- POST /events
- GET  /poll
- POST /poll
- GET  /source
- GET  /health
- GET  /stop

状态：session token、SSE client set、event queue、poll queue
PID 文件：.impeccable-live.json（项目根目录）

[AGENT]
遵循 source/skills/impeccable/reference/live.md
1. 启动 server
2. 往 source HTML 注入 <script>
3. 进入 poll loop：
   - generate -> wrap + 写 variants + reply done
   - accept   -> 保留选中 variant + cleanup + reply done
   - discard  -> 恢复原始内容 + reply done
   - exit     -> 清理 script tag + stop server
   - timeout  -> 继续 re-poll

每次生成所用工具：
1. node live-wrap.mjs（定位元素、创建 wrapper）
2. 编辑文件（一次写完所有 variants）
3. node live-poll.mjs --reply <id> done --file <path>
```

## 消息流

### Generate variants

```text
用户点击元素 -> 选择 "Bolder" -> 点击 Go
  ->
Browser POST /events: {type:"generate", id:"abc", action:"bolder", count:3, element:{...}}
  ->
Server 把事件入队
  ->
Agent GET /poll 返回: {type:"generate", id:"abc", action:"bolder", count:3, element:{...}}
  ->
Agent 运行: node live-wrap.mjs --id abc --count 3 --classes "hero-left"
  -> 在 source 中找到元素，包上 data-impeccable-variants 容器
  -> 原始内容继续保持可见（不会闪成空白）
  ->
Agent 在一次 Edit tool 调用中写入全部 3 个 variants
  -> 每个 variant 都是一个 <div data-impeccable-variant="N">，内部是完整 HTML 替换
  -> 第一个 variant 可见，其他 display:none
  ->
Agent POST /poll: {id:"abc", type:"done", file:"public/index.html"}
  ->
Server 通过 SSE 转发给 browser: {type:"done", file:"public/index.html"}
  ->
Browser 检查：DOM 中有 variants 吗？（HMR 路径）
  YES -> MutationObserver 检测到 -> 显示 cycling bar
  NO  -> fetch /source?path=public/index.html -> parse -> inject -> 显示 cycling bar
```

### Accept variant

```text
用户在 variant 2 上点击 Accept
  ->
Browser POST /events: {type:"accept", id:"abc", variantId:"2"}
Browser 显示 "Applying variant..." spinner
  ->
Agent GET /poll 返回: {type:"accept", id:"abc", variantId:"2"}
Agent 从 source 中读取 variant 2 的 HTML，并呈现给用户
Agent 移除 variant wrapper，恢复干净 source
Agent POST /poll: {id:"abc", type:"done"}
  ->
Browser 通过 SSE 收到 done -> 绿色 "Variant applied" 确认 -> 自动消失
```

### Discard

```text
用户点击 Discard（或按 Escape）
  ->
Browser POST /events: {type:"discard", id:"abc"}
Browser 立即：恢复原始元素 DOM，隐藏 bar，重置回 PICKING
  ->
Agent GET /poll 返回: {type:"discard", id:"abc"}
Agent 从 source 中移除 variant wrapper，恢复原始内容
Agent POST /poll: {id:"abc", type:"done"}
```

## Variant wrapper 格式

写入 source file 时（HTML 示例）：

```html
<!-- impeccable-variants-start abc12345 -->
<div data-impeccable-variants="abc12345" data-impeccable-variant-count="3" style="display: contents">
  <div data-impeccable-variant="original">
    <!-- original element (visible until first variant arrives) -->
  </div>
  <div data-impeccable-variant="1">
    <!-- variant 1 (visible) -->
  </div>
  <div data-impeccable-variant="2" style="display: none">
    <!-- variant 2 -->
  </div>
  <div data-impeccable-variant="3" style="display: none">
    <!-- variant 3 -->
  </div>
</div>
<!-- impeccable-variants-end abc12345 -->
```

Comment markers 使 cleanup 可以做成确定性逻辑。wrapper 上的 `display: contents` 会保留 flex / grid 布局关系。`data-impeccable-variant-count` 则告诉浏览器一共应该等到几个 variants。

## 浏览器 UI

### Global bar（live mode 期间始终可见）

位于页面底部中央的轻量浮动 pill。视觉上要轻、半透明，并与品牌气质一致。

- **Impeccable** 品牌标记（magenta）
- **Detect** 开关（eye icon）：加载 anti-pattern scanner 的 extension mode，并显示 overlay 数量 badge
- **Pick** 开关（crosshair icon）：打开 / 关闭 element picker（默认开启）
- **Exit** 按钮（x）：发送 exit 事件，拆除全部 UI

当 Detect 和 Pick 同时开启时，detect overlays 会被设为 `pointer-events: none`，这样 picker 可以点穿过去。picker 的 z-index（100001）要高于 detect overlays（99999）。

### Action bar（浮动、上下文相关）

出现在被选元素下方，会在不同状态之间变形：

- **Configure**：`[Action pill ▼] [freeform input] [×3] [Go →]`
- **Generating**：`[Action label] [● ● ●] Generating 2 of 3...`
- **Cycling**：`[←] [● ● ●] 2/3 [→] [✓ Accept] [✕]`
- **Saving**：`[spinner] Applying variant...`
- **Confirmed**：`[✓ Variant applied]`（绿色，1.8 秒后自动消失）

## Session 持久化

`localStorage` 中会保存：
- Session state（id、action、count、已到达的 variants、当前可见 variant）
- Handled sessions（已 accept / discard 的 session IDs）

这意味着即使页面刷新、浏览器关闭重开、HMR 重载，甚至误刷新，状态仍能延续。页面加载时，`resumeSession()` 会同时检查 DOM 中是否存在活动中的 variant wrapper，以及 localStorage 中的 session state，并把 cycling 恢复到正确位置。

## 安全性

- **Session token**：通过 `crypto.randomUUID()` 生成，所有会修改状态的 endpoint 和 SSE 连接都会校验它。
- **只绑定 localhost**：server 绑定的是 `127.0.0.1`，不是 `0.0.0.0`。
- **Token 存在 PID 文件里**：即项目根目录下的 `.impeccable-live.json`。只有用户自己的进程能读取。
- **Token 会注入进 `/live.js`**：server 在提供这个文件时，会 prepend 一段 `window.__IMPECCABLE_TOKEN__`。
- **路径穿越防护**：`/source` endpoint 会校验请求路径必须在 `process.cwd()` 内。
- **不使用 eval / innerHTML**：所有浏览器 UI 都用 `createElement` 和 `textContent` 构建。

## Server 韧性

- **延迟退出**：当所有 SSE clients 都断开后，server 会等待 8 秒再向 agent 发 exit，避免因为 HMR reload 或短暂网络抖动造成误退出。
- **陈旧 PID 检测**：启动时，server 会检查已有 PID 文件里的进程是否仍在运行；已经死亡的进程会被自动清理。
- **浏览器端 server-lost 处理**：如果 SSE 重连连续失败 5 次，浏览器会清理全部 UI，并显示一个 “Live server disconnected” toast。

## 性能优化

生成循环已从大约 40 秒优化到约 15–20 秒：

1. **`wrap` CLI helper**：一个命令替代 3–4 次 agent tool 调用（grep + read + edit）。它能按 ID / class / tag 优先级定位元素、创建 variant wrapper，并返回 file path 与 insert line。
2. **批量写入 variants**：一次文件编辑写入所有 variants，而不是每个 variant 一次。减少了 N-1 次 tool call 往返。
3. **页面 URL hint**：浏览器会在 generate 事件中带上 `location.pathname`，这样 agent 可以更直接地把 URL 映射回 source file。

最终效果是：只需 4 次 tool calls（wrap + edit + read + reply），而不是 8 次以上。

## 测试覆盖

- **26 个 wrap tests**（`tests/live-wrap.test.mjs`）：包括 `buildSearchQueries`、`findElement`、`findClosingLine`、`detectCommentSyntax` 的单元测试，以及在 HTML / JSX fixtures 上运行完整 `wrapCli` 的集成测试。
- **15 个 server tests**（`tests/live-server.test.mjs`）：集成测试会启动真实 server，测试所有 endpoints，并验证 browser -> agent 的事件流，以及 agent -> browser 的 SSE 投递。

## 已知限制

- **Bun 的静态 HTML import**：Bun 的 `import from "index.html"` 会在模块加载时缓存。source 变更后，要重启 server 才能让 served HTML 体现出来。`/source` 的 no-HMR fallback 可以兜住这一点，但整体体验没有 Vite / Next.js 原生 HMR 那么顺滑。
- **同一时间只允许一个 generate session**：这是刻意设计的限制，因为一个 source file 同一时间只能容纳一个 variant wrapper。
- **Inspection-only accept（v1）**：当前 accept 后主要是向用户展示代码并清理 scaffolding。真正的“把 accept 后的 variant 直接保留下来作为新 source”计划放在 v2。
- **生成期间不可取消**：一旦 agent 开始生成，就必须把所有 variants 全部写完，用户才能再次交互。

## 后续工作

- **Accept 时直接 write-back**：不要 accept 后再恢复原始内容，而是直接把被接受的 variant 留作新 source。
- **Detect-to-fix flow**：点击一个检测到的 anti-pattern 后，自动预选对应元素并预填 action（例如“overused font” 自动预填为 “typeset”）。
- **Claude Code 的后台 poll**：使用 `run_in_background: true`，让主对话在 poll loop 期间保持可用。
- **Streaming variants**：随着 agent 逐个写出 variant 逐步揭示，而不是为了速度全部批量写入。