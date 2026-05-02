# 零依赖 Brainstorm Server

用一个只依赖 Node.js built-ins 的单文件 `server.js`，替换 brainstorm companion server 中 vendored 的 node_modules（express、ws、chokidar，共 714 个被追踪文件）。

## 动机

将 node_modules 打包进 git 仓库会带来供应链风险：被冻结的依赖无法获取安全补丁，714 个第三方文件未经审计就被直接提交，而且对 vendored 代码的修改在 git 历史中看起来和普通改动没有区别。虽然实际风险不高，因为这只是仅限本地的开发服务器，但将其彻底移除其实非常直接。

## 架构

一个单独的 `server.js` 文件，大约 250-300 行，只使用 `http`、`crypto`、`fs` 和 `path`。
这个文件承担两个角色：

- **当被直接运行时**（`node server.js`）：启动 HTTP / WebSocket 服务器
- **当被 require 时**（`require('./server.js')`）：导出 WebSocket 协议函数，供单元测试使用

### WebSocket 协议

实现 RFC 6455，但仅支持文本帧：

**握手：**
根据客户端的 `Sec-WebSocket-Key`，使用 SHA-1 加上 RFC 6455 的 magic GUID 计算 `Sec-WebSocket-Accept`，然后返回 `101 Switching Protocols`。

**帧解码（客户端 -> 服务器）：**
处理三种 masked 长度编码：
- 小型：负载 < 126 字节
- 中型：126-65535 字节（16 位扩展）
- 大型：> 65535 字节（64 位扩展）

使用 4 字节掩码密钥对负载进行 XOR 解掩码。返回 `{ opcode, payload, bytesConsumed }`，如果 buffer 不完整则返回 `null`。未 masked 的帧一律拒绝。

**帧编码（服务器 -> 客户端）：**
发送 unmasked 帧，长度编码同样采用三档。

**处理的 opcodes：**
TEXT（0x01）、CLOSE（0x08）、PING（0x09）、PONG（0x0A）。
无法识别的 opcode 会返回带状态码 1003（Unsupported Data）的关闭帧。

**明确不支持：**
二进制帧、分片消息、扩展（如 permessage-deflate）、子协议。
对于本地客户端之间的小型 JSON 文本消息来说，这些都不是必需项。
而扩展和子协议本身是在握手期间协商的，只要服务器不声明支持，它们就永远不会启用。

**缓冲区累积：**
每个连接都维护一个缓冲区。收到 `data` 后，将数据追加进去，并循环调用 `decodeFrame`，直到它返回 `null` 或缓冲区被消费完。

### HTTP 服务器

有 3 条路由：

1. **`GET /`** - 从屏幕目录中找出 mtime 最新的 `.html` 文件并返回。若检测到是完整 HTML 文档，则直接返回；如果只是片段，则将其包装进 frame 模板并注入 helper.js。响应类型为 `text/html`。如果目录中还没有任何 `.html` 文件，则返回一张硬编码的等待页面（`"Waiting for Claude to push a screen..."`），同样注入 helper.js。
2. **`GET /files/*`** - 从屏幕目录中返回静态文件，并通过硬编码扩展名映射设置 MIME 类型，如 html、css、js、png、jpg、gif、svg、json。找不到则返回 404。
3. **其他所有路径** - 404。

WebSocket 升级通过 HTTP 服务器的 `'upgrade'` 事件单独处理，而不是放在请求处理器中。

### 配置

环境变量全部可选：

- `BRAINSTORM_PORT` - 绑定端口（默认：49152-65535 之间的随机高位端口）
- `BRAINSTORM_HOST` - 绑定的接口（默认：`127.0.0.1`）
- `BRAINSTORM_URL_HOST` - 启动 JSON 中使用的 URL 主机（默认：如果 host 是 `127.0.0.1` 则使用 `localhost`，否则沿用 host）
- `BRAINSTORM_DIR` - 屏幕目录路径（默认：`/tmp/brainstorm`）

### 启动流程

1. 若 `SCREEN_DIR` 不存在，则先 `mkdirSync`（recursive）
2. 从 `__dirname` 加载 frame 模板和 helper.js
3. 在配置的 host / port 上启动 HTTP 服务器
4. 对 `SCREEN_DIR` 启动 `fs.watch`
5. 成功监听后，向 stdout 输出 `server-started` JSON：`{ type, port, host, url_host, url, screen_dir }`
6. 同时将同样的 JSON 写入 `SCREEN_DIR/.server-info`，这样在后台运行导致 stdout 不可见时，agent 也能找到连接信息

### 应用层 WebSocket 消息

当收到客户端发来的 TEXT 帧时：

1. 尝试按 JSON 解析，解析失败则写 stderr 并继续
2. 按 `{ source: 'user-event', ...event }` 的格式写 stdout
3. 如果事件中带有 `choice` 属性，则将该 JSON 追加到 `SCREEN_DIR/.events`，每行一条

### 文件监听

`fs.watch(SCREEN_DIR)` 替换原来的 chokidar。
当 `.html` 文件发生事件时：

- 新文件（`rename` 事件且文件存在）：如果 `.events` 文件存在则删除（`unlinkSync`），然后向 stdout 输出 `screen-added` JSON
- 文件更新（`change` 事件）：向 stdout 输出 `screen-updated` JSON，但**不要**清空 `.events`
- 这两种事件都会向所有已连接的 WebSocket 客户端广播 `{ type: 'reload' }`

需要进行按文件名的防抖，大约 100ms，以避免在 macOS 和 Linux 上常见的重复触发。

### 错误处理

- WebSocket 客户端发来的 JSON 非法：写 stderr，继续运行
- 不支持的 opcode：用状态码 1003 关闭
- 客户端断开：从广播集合中移除
- `fs.watch` 报错：写 stderr，继续运行
- 没有实现优雅关闭：进程生命周期由 shell 脚本通过 SIGTERM 管理

## 有哪些变化

| 之前 | 之后 |
|---|---|
| `index.js` + `package.json` + `package-lock.json` + 714 个 `node_modules` 文件 | `server.js`（单文件） |
| 依赖 express、ws、chokidar | 无依赖 |
| 不支持静态文件服务 | `/files/*` 直接服务屏幕目录中的文件 |

## 哪些保持不变

- `helper.js` - 不改
- `frame-template.html` - 不改
- `start-server.sh` - 只改一行，将 `index.js` 改成 `server.js`
- `stop-server.sh` - 不改
- `visual-companion.md` - 不改
- 所有既有服务器行为与外部契约保持不变

## 平台兼容性

- `server.js` 只使用跨平台的 Node built-ins
- 对于单层平面目录，`fs.watch` 在 macOS、Linux 和 Windows 上都足够可靠
- Shell 脚本仍然要求 bash（Windows 上使用 Git Bash，而 Claude Code 本身就依赖它）

## 测试

**单元测试**（`ws-protocol.test.js`）：
直接 `require('server.js')` 导出的函数，测试 WebSocket 帧的编码/解码、握手计算和协议边界情况。

**集成测试**（`server.test.js`）：
测试完整的服务器行为，如 HTTP 服务、WebSocket 通信、文件监听以及 brainstorming 工作流。这里会使用 `ws` 这个 npm 包作为**仅测试期**的客户端依赖，而不会发给终端用户。