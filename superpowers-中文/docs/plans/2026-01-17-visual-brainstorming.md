# 可视化头脑风暴辅助界面实现计划
> **面向代理工作者：** 需要使用 `superpowers:executing-plans` 按任务步骤实现本计划。
**目标：** 为 Claude 的头脑风暴会话提供一个基于浏览器的可视化辅助界面，在终端对话旁展示模型、原型和交互式选项。
**架构：** Claude 将 HTML 写入临时文件，本地 Node.js 服务器监视该文件并提供页面访问，同时自动注入辅助库。用户交互通过 WebSocket 传输到服务器的标准输出，Claude 可在后台任务输出中看到这些事件。
**技术栈：** Node.js、Express、ws（WebSocket）、chokidar（文件监视）

---

## 任务 1：搭建服务基础

**文件：**
- 新建：`lib/brainstorm-server/index.js`
- 新建：`lib/brainstorm-server/package.json`

**步骤 1：创建 package.json**

```json
{
  "name": "brainstorm-server",
  "version": "1.0.0",
  "description": "为 Claude Code 提供头脑风暴可视化伴侣服务",
  "main": "index.js",
  "dependencies": {
    "chokidar": "^3.5.3",
    "express": "^4.18.2",
    "ws": "^8.14.2"
  }
}
```

**步骤 2：创建最小可运行服务器**

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

const PORT = process.env.BRAINSTORM_PORT || 3333;
const SCREEN_FILE = process.env.BRAINSTORM_SCREEN || '/tmp/brainstorm/screen.html';
const SCREEN_DIR = path.dirname(SCREEN_FILE);

// 确保 screen 目录存在
if (!fs.existsSync(SCREEN_DIR)) {
  fs.mkdirSync(SCREEN_DIR, { recursive: true });
}

// 如无默认 screen，则先创建
if (!fs.existsSync(SCREEN_FILE)) {
  fs.writeFileSync(SCREEN_FILE, `<!DOCTYPE html>
<html>
<head>
  <title>Brainstorm Companion</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
    h1 { color: #333; }
    p { color: #666; }
  </style>
</head>
<body>
  <h1>Brainstorm Companion</h1>
  <p>Waiting for Claude to push a screen...</p>
</body>
</html>`);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 保存已连接浏览器，用于发送刷新通知
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));

  ws.on('message', (data) => {
    // 用户交互事件，写到 stdout 给 Claude 看
    const event = JSON.parse(data.toString());
    console.log(JSON.stringify({ type: 'user-event', ...event }));
  });
});

// 返回当前 screen，并注入 helper.js
app.get('/', (req, res) => {
  let html = fs.readFileSync(SCREEN_FILE, 'utf-8');

  const helperScript = fs.readFileSync(path.join(__dirname, 'helper.js'), 'utf-8');
  const injection = `<script>\n${helperScript}\n</script>`;

  if (html.includes('</body>')) {
    html = html.replace('</body>', `${injection}\n</body>`);
  } else {
    html += injection;
  }

  res.type('html').send(html);
});

// 监听 screen 文件变化
chokidar.watch(SCREEN_FILE).on('change', () => {
  console.log(JSON.stringify({ type: 'screen-updated', file: SCREEN_FILE }));
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'reload' }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(JSON.stringify({ type: 'server-started', port: PORT, url: `http://localhost:${PORT}` }));
});
```

**步骤 3：执行 npm install**
运行：`cd lib/brainstorm-server && npm install`
预期：依赖安装完成
**步骤 4：测试服务器是否能启动**
运行：`cd lib/brainstorm-server && timeout 3 node index.js || true`
预期：看到包含 `server-started` 和端口信息的 JSON

**步骤 5：提交**

```bash
git add lib/brainstorm-server/
git commit -m "feat: add brainstorm server foundation"
```

---

## 任务 2：创建辅助库

**文件：**
- 新建：`lib/brainstorm-server/helper.js`

**步骤 1：创建自动捕获事件的 helper.js**

```javascript
(function() {
  const WS_URL = 'ws://' + window.location.host;
  let ws = null;
  let eventQueue = [];

  function connect() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      eventQueue.forEach(e => ws.send(JSON.stringify(e)));
      eventQueue = [];
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'reload') {
        window.location.reload();
      }
    };

    ws.onclose = () => {
      setTimeout(connect, 1000);
    };
  }

  function send(event) {
    event.timestamp = Date.now();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    } else {
      eventQueue.push(event);
    }
  }

  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a, [data-choice], [role="button"], input[type="submit"]');
    if (!target) return;

    if (target.tagName === 'A' && !target.dataset.choice) return;

    e.preventDefault();

    send({
      type: 'click',
      text: target.textContent.trim(),
      choice: target.dataset.choice || null,
      id: target.id || null,
      className: target.className || null
    });
  });

  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => { data[key] = value; });

    send({
      type: 'submit',
      formId: form.id || null,
      formName: form.name || null,
      data: data
    });
  });

  let inputTimeout = null;
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (!target.matches('input, textarea, select')) return;

    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
      send({
        type: 'input',
        name: target.name || null,
        id: target.id || null,
        value: target.value,
        inputType: target.type || target.tagName.toLowerCase()
      });
    }, 500);
  });

  window.brainstorm = {
    send: send,
    choice: (value, metadata = {}) => send({ type: 'choice', value, ...metadata })
  };

  connect();
})();
```

**步骤 2：验证 helper.js 语法正确**
运行：`node -c lib/brainstorm-server/helper.js`
预期：无语法错误

**步骤 3：提交**

```bash
git add lib/brainstorm-server/helper.js
git commit -m "feat: add browser helper library for event capture"
```

---

## 任务 3：为服务器编写测试

**文件：**
- 新建：`tests/brainstorm-server/server.test.js`
- 新建：`tests/brainstorm-server/package.json`

**步骤 1：创建测试 package.json**

```json
{
  "name": "brainstorm-server-tests",
  "version": "1.0.0",
  "scripts": {
    "test": "node server.test.js"
  }
}
```

**步骤 2：编写服务器测试**

```javascript
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const SERVER_PATH = path.join(__dirname, '../../lib/brainstorm-server/index.js');
const TEST_PORT = 3334;
const TEST_SCREEN = '/tmp/brainstorm-test/screen.html';

function cleanup() {
  if (fs.existsSync(path.dirname(TEST_SCREEN))) {
    fs.rmSync(path.dirname(TEST_SCREEN), { recursive: true });
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  cleanup();

  const server = spawn('node', [SERVER_PATH], {
    env: { ...process.env, BRAINSTORM_PORT: TEST_PORT, BRAINSTORM_SCREEN: TEST_SCREEN }
  });

  let stdout = '';
  server.stdout.on('data', (data) => { stdout += data.toString(); });
  server.stderr.on('data', (data) => { console.error('Server stderr:', data.toString()); });

  await sleep(1000);

  try {
    console.log('Test 1: Server startup message');
    assert(stdout.includes('server-started'), 'Should output server-started');
    assert(stdout.includes(TEST_PORT.toString()), 'Should include port');
    console.log('  PASS');

    console.log('Test 2: Serves HTML with helper injected');
    const res = await fetch(`http://localhost:${TEST_PORT}/`);
    assert.strictEqual(res.status, 200);
    assert(res.body.includes('brainstorm'), 'Should include brainstorm content');
    assert(res.body.includes('WebSocket'), 'Should have helper.js injected');
    console.log('  PASS');

    console.log('Test 3: WebSocket relays events to stdout');
    stdout = '';
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    await new Promise(resolve => ws.on('open', resolve));

    ws.send(JSON.stringify({ type: 'click', text: 'Test Button' }));
    await sleep(100);

    assert(stdout.includes('user-event'), 'Should relay user events');
    assert(stdout.includes('Test Button'), 'Should include event data');
    ws.close();
    console.log('  PASS');

    console.log('Test 4: File change notifies browsers');
    const ws2 = new WebSocket(`ws://localhost:${TEST_PORT}`);
    await new Promise(resolve => ws2.on('open', resolve));

    let gotReload = false;
    ws2.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'reload') gotReload = true;
    });

    fs.writeFileSync(TEST_SCREEN, '<html><body>Updated</body></html>');
    await sleep(500);

    assert(gotReload, 'Should send reload message on file change');
    ws2.close();
    console.log('  PASS');

    console.log('\nAll tests passed!');

  } finally {
    server.kill();
    cleanup();
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
```

**步骤 3：运行测试**
运行：`cd tests/brainstorm-server && npm install ws && node server.test.js`
预期：所有测试应通过

**步骤 4：提交**

```bash
git add tests/brainstorm-server/
git commit -m "test: add brainstorm server integration tests"
```

---

## 任务 4：将视觉辅助集成到头脑风暴技能中

**文件：**
- 修改：`skills/brainstorming/SKILL.md`
- 新建：`skills/brainstorming/visual-companion.md`

**步骤 1：创建配套文档**

创建 `skills/brainstorming/visual-companion.md`：
```markdown
# 视觉伴侣参考

## 启动服务器

作为后台作业运行：

```bash
node ${PLUGIN_ROOT}/lib/brainstorm-server/index.js
```

告诉用户：“我已在 http://localhost:3333 启动视觉伴侣 - 请在浏览器中打开。”

## 推送屏幕

将 HTML 写入 `/tmp/brainstorm/screen.html`。服务器监视此文件并自动刷新浏览器。

## 读取用户响应

检查后台任务输出中的 JSON 事件：

```json
{"type":"user-event","type":"click","text":"Option A","choice":"optionA","timestamp":1234567890}
{"type":"user-event","type":"submit","data":{"notes":"My feedback"},"timestamp":1234567891}
```

事件类型：
- **click**：用户点击了按钮或 `data-choice` 元素
- **submit**：用户提交表单（包含所有表单数据）
- **input**：用户在输入框里输入（500ms 防抖）
```

**步骤 2：在头脑风暴技能中加入视觉伴侣章节**

加在 `Key Principles` 之后：
```markdown
## 视觉伴侣（可选）

当头脑风暴涉及视觉元素 - UI 模型、线框图、交互式原型时 - 使用基于浏览器的视觉伴侣。

**何时使用：**
- 展示受益于视觉比较的 UI/UX 选项
- 显示线框图或布局选项
- 收集结构化反馈（评分、表单）
- 原型化点击交互

**工作原理：**
1. 作为后台作业启动服务器
2. 告诉用户打开 http://localhost:3333
3. 将 HTML 写入 `/tmp/brainstorm/screen.html`（自动刷新）
4. 检查后台任务输出中的用户交互

终端仍是主要对话界面。浏览器是视觉辅助工具。

**参考：** 有关 HTML 模式和 API 详情，请参见此技能目录中的 `visual-companion.md`。
```

**步骤 3：验证修改**
运行：`grep -A5 "Visual Companion" skills/brainstorming/SKILL.md`
预期：能看到新增章节

**步骤 4：提交**

```bash
git add skills/brainstorming/
git commit -m "feat: add visual companion to brainstorming skill"
```

---

## 任务 5：将服务器目录加入忽略规则（可选清理）

**文件：**
- 检查 `.gitignore` 是否需要忽略 `lib/brainstorm-server/node_modules/`

**步骤 1：检查当前 gitignore**
运行：`cat .gitignore 2>/dev/null || echo "No .gitignore"`

**步骤 2：如有需要，加入：**
```text
lib/brainstorm-server/node_modules/
```

**步骤 3：如有修改则提交**

```bash
git add .gitignore
git commit -m "chore: ignore brainstorm-server node_modules"
```## 总结

全部完成后，你将拥有：
1.  存放于 `lib/brainstorm-server/` 的 **服务器**
2.  自动集成的 **辅助库**
3.  存放于 `tests/brainstorm-server/` 的 **测试**
4.  已更新的 **头脑风暴技能** 与 `visual-companion.md`**使用方式：**
1.  以后台任务方式启动服务器：`node lib/brainstorm-server/index.js &`
2.  提示用户访问 `http://localhost:3333`
3.  将HTML文件写入 `/tmp/brainstorm/screen.html`
4.  从任务输出中读取用户事件