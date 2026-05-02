# 远程浏览器访问：如何与 GStack Browser 配对

GStack Browser 服务端可以共享给任何能够发起 HTTP 请求的 AI 代理。代理会获得对真实 Chromium 浏览器的受限访问能力：打开页面、读取内容、点击元素、填写表单、截屏。每个代理都会拿到自己的独立标签页。

这份文档是给远程代理使用的参考说明。实际的快速开始指令由 `$B pair-agent` 动态生成，并会把真实凭据直接嵌进去。

## 架构

```text
你的机器                            远程代理
-------------                      -------------
GStack Browser Server              任意 AI 代理
  ├── Chromium (Playwright)          (OpenClaw, Hermes, Codex 等)
  ├── Local listener  127.0.0.1:LOCAL
  │    (bootstrap, CLI, sidebar, cookies)
  ├── Tunnel listener  127.0.0.1:TUNNEL
  │    (仅 pair-agent: /connect, /command,
  │     /sidebar-chat，且走固定 allowlist)
  ├── ngrok tunnel（只转发 tunnel 端口）
  │    https://xxx.ngrok.dev
  └── Token Registry
       ├── Root token（仅 local listener 可用）
       ├── Setup keys（5 分钟，一次性）
       ├── Session tokens（24 小时，带 scope）
       └── SSE session cookies（30 分钟，仅 stream scope）
```

### 双 listener 架构（v1.6.0.0）

守护进程会绑定两个 HTTP socket。**local listener** 只向 `127.0.0.1` 暴露完整命令面，永远不会被转发。**tunnel listener** 则在 `/tunnel/start` 时按需绑定，在 `/tunnel/stop` 时释放，并且只开放锁定后的路径 allowlist。ngrok 只转发 tunnel 端口。

即使有人偶然拿到了你的 ngrok URL，也无法访问 `/health`、`/cookie-picker`、`/inspector/*` 或 `/welcome`，因为这些路径在那个 TCP socket 上根本不存在。通过 tunnel 发送 root token 会直接得到 403。tunnel listener 只接受 `/connect`、`/command`（要求 scoped token，并且命令必须在 26 条浏览器驱动命令 allowlist 内），以及 `/sidebar-chat`。

完整的端点表见 [ARCHITECTURE.md](../ARCHITECTURE.md#dual-listener-tunnel-architecture-v1600)。

## 连接流程

1. **用户执行** `$B pair-agent`（或在 Claude Code 中执行 `/pair-agent`）
2. **服务端创建** 一次性 setup key（5 分钟后过期）
3. **用户复制** 指令块到另一个代理的聊天中
4. **远程代理调用** `POST /connect`，并附带 setup key
5. **服务端返回** 一个带 scope 的 session token（默认 24 小时）
6. **远程代理调用** `POST /command` 并使用 `newtab` 创建自己的标签页
7. **远程代理使用** session token + tabId，通过 `POST /command` 驱动浏览器

## API 参考

### 认证

所有命令端点都要求 Bearer token：

```text
Authorization: Bearer gsk_sess_...
```

`/connect` 不需要认证，但会限流。它负责让远程代理用 setup key 换取一个带 scope 的 session token。`/health` 在 local listener 上无需认证（供启动流程使用），但它在 tunnel listener 上根本不存在，会返回 404。

SSE 端点（`/activity/stream`、`/inspector/events`）接受 Bearer token，或者接受 HttpOnly 的 `gstack_sse` cookie（通过 `POST /sse-session` 签发，TTL 为 30 分钟，而且只用于 stream scope，不能用于 `/command`）。从 v1.6.0.0 开始，`?token=<ROOT>` 这种 query-string 认证方式已不再支持。

### 端点

#### POST /connect

把 setup key 换成 session token。无需认证，限流为每分钟 300 次。

```json
Request:  {"setup_key": "gsk_setup_..."}
Response: {"token": "gsk_sess_...", "expires": "ISO8601", "scopes": ["read","write"], "agent": "agent-name"}
```

#### POST /command

发送浏览器命令。需要 Bearer 认证。

```json
Request:  {"command": "goto", "args": ["https://example.com"], "tabId": 1}
Response: (命令的纯文本结果)
```

#### GET /health

服务状态。无需认证。返回状态、标签页、模式和运行时长。

## 命令

#### 导航

|命令|参数| 说明 |
|---------|------|------|
|__代码_0__|__代码_0__|打开某个 URL|
|__代码_0__| `[]` | 后退 |
|__代码_0__| `[]` | 前进 |
|__代码_0__| `[]` | 刷新页面 |

#### 读取内容

|命令|参数| 说明 |
|---------|------|------|
|__代码_0__| `["-i"]` |带 `@ref` 标签的交互快照，最常用|
|__代码_0__| `[]` | 页面全文本 |
|__代码_0__|__代码_0__|元素 HTML 或整个页面 HTML|
|__代码_0__| `[]` | 页面中的所有链接 |
|__代码_0__|__代码_0__| 截图 |
|__代码_0__| `[]` |当前 URL|

#### 交互

|命令|参数| 说明 |
|---------|------|------|
|__代码_0__| `["@e3"]` |点击元素（使用 snapshot 里的 `@ref`）|
|__代码_0__|__代码_0__| 填写表单字段 |
|__代码_0__|__代码_0__| 选择下拉值 |
|__代码_0__|__代码_0__| 键盘输入文本 |
|__代码_0__|__代码_0__| 按某个按键 |
|__代码_0__|__代码_0__| 滚动页面 |

#### 标签页

|命令|参数| 说明 |
|---------|------|------|
|__代码_0__|__代码_0__| 新建标签页（写操作前必须先创建） |
|__代码_0__| `[]` | 列出所有标签页 |
|__代码_0__|__代码_0__| 关闭标签页 |

## Snapshot -> @ref 模式

这是最强的浏览模式之一。相比自己手写 CSS selector：

1. 先运行 `snapshot -i`，获得带标签的交互快照
2. 返回结果通常像这样：
   ```text
   [Page Title]
   @e1 [link] "Home"
   @e2 [button] "Sign In"
   @e3 [input] "Search..."
   ```
3. 之后直接在命令中使用这些 `@e` 引用，例如：`click @e2`、`fill @e3 "search query"`

这就是 snapshot 系统的核心使用方式，比猜 CSS selector 稳定得多。原则上都应该先 `snapshot -i`，再使用这些 refs。

## 范围

|范围| 允许内容 |
|-------|----------|
|__代码_0__|快照、文本、html、链接、截图、url、选项卡、控制台等|
|__代码_0__|转到、单击、填充、滚动、newtab、closetab 等|
|__代码_0__|eval、js、cookies、存储、cookie-import、useragent 等|
|__代码_0__|tab、diff、frame、响应式、watch|

默认 token 只带 `read` + `write`。如果需要 admin，配对时必须显式加 `--admin`。

## 标签页隔离

每个代理只“拥有”自己创建的标签页。规则如下：

- **Read：** 任意代理都可以读取任意标签页（snapshot、text、screenshot）
- **Write：** 只有标签页所有者才能执行写操作（click、fill、goto 等）
- **Unowned tabs：** 已存在的标签页对 root 之外的写操作不可用
- **第一步：** 想要交互时，先 `newtab`

## 错误码

|代码| 含义 | 应对方式 |
|------|------|----------|
| 401 |token 无效、已过期或已撤销|请用户重新执行 `/pair-agent`|
| 403 |命令不在 scope 内，或标签页不属于你|使用 `newtab`，或请求 `--admin`|
| 429 |触发限流（>10 req/s）|等待 `Retry-After` 响应头|

## 安全模型

- **物理端口隔离。** local listener 和 tunnel listener 是两个不同的 TCP socket。ngrok 只转发 tunnel 端口。远程调用方在 tunnel 上根本碰不到 bootstrap 端点。
- **Tunnel 命令 allowlist。** 通过 tunnel 调用 `/command` 时，只允许 26 条浏览器驱动命令（如 goto、click、fill、snapshot、text、newtab、tabs、back、forward、reload、closetab 等）。服务器管理命令（tunnel、pair、token、useragent、js）在 tunnel 上会被拒绝。
- **Root token 在 tunnel 上被拦截。** 如果在 tunnel listener 上带 root token 请求，会直接得到 403，并返回配对提示。通过 tunnel 只能使用 scoped session token。
- **Setup keys** 5 分钟后过期，而且只能使用一次。
- **Session tokens** 默认 24 小时后过期（可配置）。
- 指令块和连接串里永远不会出现 root token。
- **Admin scope**（执行 JS、访问 cookie 等）默认关闭。
- token 可以即时撤销：`$B tunnel revoke agent-name`
- **SSE auth** 使用 30 分钟有效的 HttpOnly SameSite=Strict cookie，且只对 stream scope 有效，绝不允许用于 `/command`。
- `/welcome` 上做了 **path traversal 防护**：`GSTACK_SLUG` 必须匹配 `^[a-z0-9_-]+$`，否则会退回内置模板。
- 对 `goto`、`download` 和 scrape 路径做了 **SSRF 防护**，会校验目标 URL，阻止访问 localhost 和私网网段。
- **Tunnel surface denial logging。** 所有在 tunnel listener 上被拒绝的请求（如 `path_not_on_tunnel`、`root_token_on_tunnel`、`missing_scoped_token`、`disallowed_command:*`）都会写入 `~/.gstack/security/attempts.jsonl`，记录时间戳、来源 IP、路径和方法，并限制为每分钟最多 60 次写入。
- 所有代理活动都会带归属信息（clientId）记录下来。

**当前已知非目标（追踪号 #1136）：** 在 Windows 上，`cookie-import-browser` 会使用 `--remote-debugging-port=<random>` 启动 Chrome。对于启用了 App-Bound Encryption v20 的场景，同一用户下的本地进程可以连到这个端口并导出已解密的 v20 cookie，这相对于直接读取 SQLite DB 形成了一条提权路径。后续修复方向是改成 `--remote-debugging-pipe` 而不是 TCP。

## 同机快捷方式

如果两个代理就在同一台机器上，可以跳过复制粘贴：

```bash
$B pair-agent --local openclaw
$B pair-agent --local codex
$B pair-agent --local cursor
```

这样不需要 tunnel，直接走 localhost。

## ngrok Tunnel 配置

针对不同机器上的远程代理：

1. 到 [ngrok.com](https://ngrok.com) 注册账号（免费版就够用）
2. 从控制台复制你的 auth token
3. 保存它：`echo 'NGROK_AUTHTOKEN=your_token' > ~/.gstack/ngrok.env`
4. 如有需要，也可以配置固定域名：`echo 'NGROK_DOMAIN=your-name.ngrok-free.dev' >> ~/.gstack/ngrok.env`
5. 用 tunnel 模式启动：`BROWSE_TUNNEL=1 $B restart`
6. 执行 `$B pair-agent`，它会自动使用 tunnel URL