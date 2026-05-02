# 侧边栏流程

GStack Browser 侧边栏的实际工作方式。修改 `sidepanel.js`、`background.js`、`content.js`、`terminal-agent.ts`，或任何和 sidebar 相关的 server endpoint 前，先读这份文档。

侧边栏的主界面只有一个，即 **Terminal** pane，一个交互式的 `claude` PTY。Activity / Refs / Inspector 现在只是放在底部 `debug` toggle 后面的调试 overlay。旧的 chat queue 路径，也就是 one-shot `claude -p` 和 `sidebar-agent.ts`，在 PTY 路线验证成功后已经被移除，因为 Terminal pane 的能力是严格更强的。

## 组件

```text
sidepanel.js +           server.ts              terminal-agent.ts
- sidepanel-terminal.js  (compiled)            (non-compiled)
(xterm.js)                                      PTY listener

        <-> ws://127.0.0.1:<termPort>/ws (Sec-WebSocket-Protocol auth) <-> Bun.spawn(claude)

POST /pty-session
(Bearer AUTH_TOKEN)
        |
pty-session-cookie.ts
(in-memory token registry)
        |
POST /internal/grant (loopback)
        |
validTokens Set
in agent memory
```

编译后的 browse server 无法通过 `posix_spawn` 启动外部可执行程序，因此 `terminal-agent.ts` 必须作为单独的、未编译的 `bun run` 进程运行，并负责持有 `claude` 子进程。

## 启动到首次按键的时间线

```text
T+0ms     CLI runs `$B connect`
            -> Server starts (compiled)
            -> Spawns terminal-agent.ts via `bun run`

T+500ms   terminal-agent.ts boots
            -> Bun.serve on 127.0.0.1:0 (random port)
            -> Writes <stateDir>/terminal-port (server reads it for /health)
            -> Writes <stateDir>/terminal-internal-token (loopback handshake)
            -> Probes claude -> writes claude-available.json

T+1-3s    Extension loads, sidebar opens
            -> sidepanel-terminal.js: setState(IDLE), shows "Starting Claude Code..."
            -> tryAutoConnect() polls until window.gstackServerPort + token are set

T+ready   tryAutoConnect calls connect()
            -> POST /pty-session (Authorization: Bearer AUTH_TOKEN)
              -> server mints session token, posts /internal/grant to agent
              -> responds with {terminalPort, ptySessionToken}
            -> GET /claude-available (preflight)
            -> new WebSocket(`ws://127.0.0.1:<terminalPort>/ws`,
                             [`gstack-pty.<token>`])
              -> Browser sends Sec-WebSocket-Protocol + Origin
              -> Agent validates Origin AND token BEFORE upgrading
              -> Agent echoes the protocol back (REQUIRED - browser
                 closes the connection without it)
            -> On open: send {type:"resize"} then a single \n byte
            -> Agent message handler sees the byte -> spawnClaude()
```

## 认证：WebSocket 不能发送 Authorization headers

浏览器端 WebSocket 客户端不能自定义 `Authorization`，但可以通过 `new WebSocket(url, protocols)` 的第二个参数设置 `Sec-WebSocket-Protocol`。所以这里利用了这一点：

1. `POST /pty-session`（认证方式：Bearer AUTH_TOKEN）-> server 生成一个短生命周期 session token，通过 loopback 推给 agent，再在 JSON body 里返回给扩展。
2. 扩展调用 `new WebSocket(url, ['gstack-pty.<token>'])`。
3. Agent 读取 `Sec-WebSocket-Protocol`，去掉前缀 `gstack-pty.`，在 `validTokens` 中校验，并把该 protocol 原样回显。这个回显是必须的，否则 Chromium 在收到 upgrade response 后会主动断开连接。

同时还会返回一个 `Set-Cookie: gstack_pty=...` header，给非浏览器调用方使用，比如 curl 或 integration tests。Cookie 路径是最早的 v1 设计，但 `SameSite=Strict` cookie 无法跨过 `server.ts:34567 -> agent:<random>` 这种跨端口跳转，尤其来源还是 `chrome-extension`。因此浏览器真正走的是 protocol-token 路径。

### 双 token 模型

| Token | 存放位置 | 用途 | 生命周期 |
|-------|----------|----------|----------|
| `AUTH_TOKEN` | `<stateDir>/browse.json`；server.ts 内存中 | `/pty-session` POST（生成 cookie + token） | server 生命周期 |
| `gstack-pty.<...>` (`Sec-WebSocket-Protocol`) | 仅存在于浏览器内存；agent 的 `validTokens` Set | `/ws` upgrade auth | 30 分钟；WS 关闭时自动撤销 |
| `INTERNAL_TOKEN` | `<stateDir>/terminal-internal-token`；agent 内存中 | server -> agent loopback `/internal/grant` | agent 生命周期 |

`AUTH_TOKEN` **绝不能**直接用于 `/ws`。session token **也绝不能**用于 `/pty-session` 或 `/command`。这种严格隔离是为了防止 SSE 或页面内容里的 token 泄露后，进一步升级为 shell 访问权限。

## 威胁模型

Terminal pane **有意绕过 prompt-injection 安全栈**，因为这里的输入直接来自用户键盘，内容直接送给 claude，中间没有不可信页面内容参与。信任来源就是键盘，和本地终端完全一样。

这个信任前提建立在三条传输保障之上：

1. **只监听本地。** `terminal-agent.ts` 只绑定 `127.0.0.1`。双监听 tunnel surface，也就是 server.ts 里的 `TUNNEL_PATHS`，默认不包含 `/pty-session` 或 `/terminal/*`，因此 tunnel 走默认拒绝并返回 404。
2. **Origin gate。** `/ws` upgrade 必须带有 `Origin: chrome-extension://<id>`。普通 localhost 网页无法对 shell 发起跨站 WebSocket 劫持，因为它的 Origin 只会是普通的 `http(s)://...`。
3. **Session token auth。** Token 只能通过已认证的 `/pty-session` POST 生成，只绑定一个 WebSocket，并在关闭时自动撤销。

这三条里任何一条失守，整个 tab 都会变得不安全。

## 生命周期

- **Eager auto-connect。** Sidebar 打开后，`tryAutoConnect` 会轮询 bootstrap globals，一旦准备好就立刻连接。不需要额外按键。
- **One PTY per WS。** WebSocket 关闭时，会先向 claude 发送 SIGINT，3 秒后再发 SIGKILL。对应 session token 也会被撤销，因此被盗 token 不能重放。
- **关闭后不自动重连。** 用户会看到 `"Session ended, click to start a new session."`。如果自动重连，每次 reload 都会消耗一个全新的 claude session。v1.1 可能会加上基于 tab/session id 的 session resumption，见 TODOS。
- **随时手动重启。** 一个 `-> Restart` 按钮始终放在 terminal toolbar 中，即便在会话进行中也可使用，而不只是在 ENDED 状态下出现。

## 快捷操作工具栏

Terminal pane 顶部除了 Restart，还会放三个 browser-action 按钮：

| 按钮 | 行为 |
|--------|----------|
| Cleanup | `window.gstackInjectToTerminal(prompt)` -> 把“删除广告/横幅”之类的指令注入当前 PTY。terminal 中的 claude 会接收并执行。 |
| Screenshot | `POST /command screenshot` -> 直接调用 browse-server，不经过 PTY。 |
| Cookies | 跳转到 `/cookie-picker` 页面。 |

Inspector 中的 `"Send to Code"` 按钮也复用同一条 `gstackInjectToTerminal` 路径，把 CSS inspector 数据转发给 claude。

## 调试界面（Activity / Refs / Inspector）

它们都挂在底部的 `debug` toggle 后面，且依赖 SSE，与 Terminal pane 相互独立：

- **Activity** - 通过 `/activity/stream` SSE 流式展示每一条 browse command
- **Refs** - REST：`GET /refs`，展示当前页面的 `@ref` 元素标签
- **Inspector** - 基于 CDP 的元素选择器；事件流来自 `/inspector/events`

当 debug strip 关闭后，Terminal pane 会重新成为可见界面。xterm.js 在容器从 `display:none` 切回 `display:flex` 时不会自动重绘，因此 sidepanel-terminal.js 会对 `#tab-terminal` 的 class 变化挂一个 `MutationObserver`，当 `.active` 回来时强制执行 fit + refresh。

## 文件

| 组件 | 文件 | 运行环境 |
|-----------|------|---------|
| Sidebar UI shell | `extension/sidepanel.html` + `sidepanel.js` + `sidepanel.css` | Chrome side panel |
| Terminal UI | `extension/sidepanel-terminal.js` + `extension/lib/xterm.js` | Chrome side panel |
| Service worker | `extension/background.js` | Chrome background |
| Content script | `extension/content.js` | Page context |
| HTTP server | `browse/src/server.ts` | Bun（compiled binary） |
| PTY agent | `browse/src/terminal-agent.ts` | Bun（non-compiled） |
| PTY token store | `browse/src/pty-session-cookie.ts` | Bun（compiled，运行在 server.ts 中） |
| CLI entry | `browse/src/cli.ts` | Bun（compiled binary） |
| State file | `<stateDir>/browse.json` | Filesystem |
| Terminal port | `<stateDir>/terminal-port` | Filesystem |
| Internal token | `<stateDir>/terminal-internal-token` | Filesystem |
| Claude probe | `<stateDir>/claude-available.json` | Filesystem |
| Active tab | `<stateDir>/active-tab.json` | Filesystem（claude 会读取） |