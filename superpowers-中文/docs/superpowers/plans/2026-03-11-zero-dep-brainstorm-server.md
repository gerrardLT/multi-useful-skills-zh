# 零依赖 Brainstorm Server 实现计划

> **面向代理 worker：** 必须使用 `superpowers:subagent-driven-development`（若可用子代理）或 `superpowers:executing-plans` 来实现本计划。步骤使用 checkbox（`- [ ]`）语法跟踪。

**目标：** 用一个零依赖的 `server.js` 替换 brainstorm server 中 vendored 的 `node_modules`。

**架构：** 使用单文件实现 WebSocket 协议（RFC 6455 文本帧）、HTTP server（`http` 模块）和文件监听（`fs.watch`）。当作为模块被 `require` 时导出协议函数，便于单元测试。

**技术栈：** 仅使用 Node.js 内建模块：`http`、`crypto`、`fs`、`path`

**规格说明：** `docs/superpowers/specs/2026-03-11-zero-dep-brainstorm-server-design.md`

**现有测试：**
- `tests/brainstorm-server/ws-protocol.test.js`
- `tests/brainstorm-server/server.test.js`

---

## 文件映射

- **新建：** `skills/brainstorming/scripts/server.js`，作为零依赖替代方案
- **修改：** `skills/brainstorming/scripts/start-server.sh:94,100`，把 `index.js` 改成 `server.js`
- **修改：** `.gitignore:6`，移除 `!skills/brainstorming/scripts/node_modules/` 例外
- **删除：** `skills/brainstorming/scripts/index.js`
- **删除：** `skills/brainstorming/scripts/package.json`
- **删除：** `skills/brainstorming/scripts/package-lock.json`
- **删除：** `skills/brainstorming/scripts/node_modules/`（714 个文件）
- **不改：** `helper.js`、`frame-template.html`、`stop-server.sh`

---

## Chunk 1：WebSocket 协议层

### 任务 1：实现 WebSocket 协议导出

**文件：**
- 新建：`skills/brainstorming/scripts/server.js`
- 测试：`tests/brainstorm-server/ws-protocol.test.js`

- [ ] **步骤 1：创建 `server.js`，加入 `OPCODES` 和 `computeAcceptKey`**

```js
const crypto = require('crypto');

const OPCODES = { TEXT: 0x01, CLOSE: 0x08, PING: 0x09, PONG: 0x0A };
const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function computeAcceptKey(clientKey) {
  return crypto.createHash('sha1').update(clientKey + WS_MAGIC).digest('base64');
}
```

- [ ] **步骤 2：实现 `encodeFrame`**
- [ ] **步骤 3：实现 `decodeFrame`**
- [ ] **步骤 4：在文件末尾导出模块**

```js
module.exports = { computeAcceptKey, encodeFrame, decodeFrame, OPCODES };
```

- [ ] **步骤 5：运行单元测试**

运行：`cd tests/brainstorm-server && node ws-protocol.test.js`  
预期：所有测试通过

- [ ] **步骤 6：提交**

```bash
git add skills/brainstorming/scripts/server.js
git commit -m "Add WebSocket protocol layer for zero-dep brainstorm server"
```

---

## Chunk 2：HTTP Server 与应用逻辑

### 任务 2：加入 HTTP server、文件监听和 WebSocket 连接处理

**文件：**
- 修改：`skills/brainstorming/scripts/server.js`
- 测试：`tests/brainstorm-server/server.test.js`

- [ ] **步骤 1：在文件顶部加入配置和常量**
- [ ] **步骤 2：加入 WAITING_PAGE、模板加载和 helper 函数**
- [ ] **步骤 3：加入 HTTP request handler**
- [ ] **步骤 4：加入 WebSocket upgrade 与消息处理**
- [ ] **步骤 5：加入 debounce timer map**
- [ ] **步骤 6：加入 `startServer` 与 `require.main === module` 条件主入口**

- [ ] **步骤 7：运行集成测试**

运行：`cd tests/brainstorm-server && npm install && node server.test.js`  
预期：所有测试通过

- [ ] **步骤 8：提交**

```bash
git add skills/brainstorming/scripts/server.js
git commit -m "Add HTTP server, WebSocket handling, and file watching to server.js"
```

---

## Chunk 3：切换并清理

### 任务 3：更新 `start-server.sh` 并移除旧文件

**文件：**
- 修改：`skills/brainstorming/scripts/start-server.sh:94,100`
- 修改：`.gitignore:6`
- 删除：`skills/brainstorming/scripts/index.js`
- 删除：`skills/brainstorming/scripts/package.json`
- 删除：`skills/brainstorming/scripts/package-lock.json`
- 删除：`skills/brainstorming/scripts/node_modules/`

- [ ] **步骤 1：把 `start-server.sh` 中的 `index.js` 改为 `server.js`**
- [ ] **步骤 2：移除 `.gitignore` 中对 node_modules 的例外**
- [ ] **步骤 3：删除旧文件**
- [ ] **步骤 4：运行两套测试**

运行：`cd tests/brainstorm-server && node ws-protocol.test.js && node server.test.js`

- [ ] **步骤 5：提交**

```bash
git add skills/brainstorming/scripts/ .gitignore
git commit -m "Remove vendored node_modules, swap to zero-dep server.js"
```

### 任务 4：手工 Smoke Test

- [ ] **步骤 1：手动启动 server**

```bash
cd skills/brainstorming/scripts
BRAINSTORM_DIR=/tmp/brainstorm-smoke BRAINSTORM_PORT=9876 node server.js
```

- [ ] **步骤 2：浏览器打开 `http://localhost:9876`**
- [ ] **步骤 3：向 screen 目录写一个 HTML 文件**
- [ ] **步骤 4：验证 WebSocket 连接正常**
- [ ] **步骤 5：Ctrl-C 停止 server，并清理 `/tmp/brainstorm-smoke`**