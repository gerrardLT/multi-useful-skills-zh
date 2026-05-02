/**
 * Brainstorm server 的集成测试。
 *
 * 覆盖完整服务行为：HTTP 提供内容、WebSocket 通信、
 * 文件监听，以及 brainstorming 工作流本身。
 *
 * 测试客户端使用 `ws` npm 包（仅测试依赖，不随产品交付给终端用户）。
 */

const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const SERVER_PATH = path.join(__dirname, '../../skills/brainstorming/scripts/server.cjs');
const TEST_PORT = 3334;
const TEST_DIR = '/tmp/brainstorm-test';
const CONTENT_DIR = path.join(TEST_DIR, 'content');
const STATE_DIR = path.join(TEST_DIR, 'state');

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
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
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: data
      }));
    }).on('error', reject);
  });
}

function startServer() {
  return spawn('node', [SERVER_PATH], {
    env: { ...process.env, BRAINSTORM_PORT: TEST_PORT, BRAINSTORM_DIR: TEST_DIR }
  });
}

async function waitForServer(server) {
  let stdout = '';
  let stderr = '';

  return new Promise((resolve, reject) => {
    server.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.includes('server-started')) {
        resolve({ stdout, stderr, getStdout: () => stdout });
      }
    });
    server.stderr.on('data', (data) => { stderr += data.toString(); });
    server.on('error', reject);

    setTimeout(() => reject(new Error(`Server 未成功启动。stderr: ${stderr}`)), 5000);
  });
}

async function runTests() {
  cleanup();

  const server = startServer();
  let stdoutAccum = '';
  server.stdout.on('data', (data) => { stdoutAccum += data.toString(); });

  const { stdout: initialStdout } = await waitForServer(server);
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    return fn().then(() => {
      console.log(`  PASS: ${name}`);
      passed++;
    }).catch(e => {
      console.log(`  FAIL: ${name}`);
      console.log(`    ${e.message}`);
      failed++;
    });
  }

  try {
    // ========== Server 启动 ==========
    console.log('\n--- Server 启动 ---');

    await test('启动时输出 server-started JSON', () => {
      const msg = JSON.parse(initialStdout.trim());
      assert.strictEqual(msg.type, 'server-started');
      assert.strictEqual(msg.port, TEST_PORT);
      assert(msg.url, '应包含 URL');
      assert(msg.screen_dir, '应包含 screen_dir');
      return Promise.resolve();
    });

    await test('会把 server-info 写入 state/', () => {
      const infoPath = path.join(STATE_DIR, 'server-info');
      assert(fs.existsSync(infoPath), 'state/server-info 应存在');
      const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8').trim());
      assert.strictEqual(info.type, 'server-started');
      assert.strictEqual(info.port, TEST_PORT);
      assert.strictEqual(info.screen_dir, CONTENT_DIR, 'screen_dir 应指向 content/');
      assert.strictEqual(info.state_dir, STATE_DIR, 'state_dir 应指向 state/');
      return Promise.resolve();
    });

    // ========== HTTP 提供内容 ==========
    console.log('\n--- HTTP 提供内容 ---');

    await test('在没有 screen 时返回等待页', async () => {
      const res = await fetch(`http://localhost:${TEST_PORT}/`);
      assert.strictEqual(res.status, 200);
      assert(res.body.includes('Waiting for the agent'), '应显示等待提示');
    });

    await test('会把 helper.js 注入等待页', async () => {
      const res = await fetch(`http://localhost:${TEST_PORT}/`);
      assert(res.body.includes('WebSocket'), '应注入 helper.js');
      assert(res.body.includes('toggleSelect'), '应包含 helper 中的 toggleSelect');
      assert(res.body.includes('brainstorm'), '应包含 helper 中的 brainstorm API');
    });

    await test('返回的 Content-Type 为 text/html', async () => {
      const res = await fetch(`http://localhost:${TEST_PORT}/`);
      assert(res.headers['content-type'].includes('text/html'), '应为 text/html');
    });

    await test('完整 HTML 文档会原样返回，而不是被包裹', async () => {
      const fullDoc = '<!DOCTYPE html>\n<html><head><title>Custom</title></head><body><h1>Custom Page</h1></body></html>';
      fs.writeFileSync(path.join(CONTENT_DIR, 'full-doc.html'), fullDoc);
      await sleep(300);

      const res = await fetch(`http://localhost:${TEST_PORT}/`);
      assert(res.body.includes('<h1>Custom Page</h1>'), '应保留原始内容');
      assert(res.body.includes('WebSocket'), '仍应注入 helper.js');
      assert(!res.body.includes('indicator-bar'), '完整文档不应再套 frame 模板');
    });

    await test('HTML 片段会被包进 frame 模板', async () => {
      const fragment = '<h2>Pick a layout</h2>\n<div class="options"><div class="option" data-choice="a"><div class="letter">A</div></div></div>';
      fs.writeFileSync(path.join(CONTENT_DIR, 'fragment.html'), fragment);
      await sleep(300);

      const res = await fetch(`http://localhost:${TEST_PORT}/`);
      assert(res.body.includes('indicator-bar'), '片段应带 indicator bar');
      assert(!res.body.includes('<!-- CONTENT -->'), '占位符应被替换');
      assert(res.body.includes('Pick a layout'), '片段内容应存在');
      assert(res.body.includes('data-choice="a"'), '交互元素应保持完整');
    });

    await test('按 mtime 返回最新文件', async () => {
      fs.writeFileSync(path.join(CONTENT_DIR, 'older.html'), '<h2>Older</h2>');
      await sleep(100);
      fs.writeFileSync(path.join(CONTENT_DIR, 'newer.html'), '<h2>Newer</h2>');
      await sleep(300);

      const res = await fetch(`http://localhost:${TEST_PORT}/`);
      assert(res.body.includes('Newer'), '应返回最新文件');
    });

    await test('提供内容时会忽略非 html 文件', async () => {
      fs.writeFileSync(path.join(CONTENT_DIR, 'data.json'), '{"not": "html"}');
      await sleep(300);

      const res = await fetch(`http://localhost:${TEST_PORT}/`);
      assert(res.body.includes('Newer'), '仍应返回最新 HTML');
      assert(!res.body.includes('"not"'), '不应返回 JSON 内容');
    });

    await test('非根路径返回 404', async () => {
      const res = await fetch(`http://localhost:${TEST_PORT}/other`);
      assert.strictEqual(res.status, 404);
    });

    // ========== WebSocket 通信 ==========
    console.log('\n--- WebSocket 通信 ---');

    await test('支持在 / 路径进行 WebSocket upgrade', async () => {
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await new Promise((resolve, reject) => {
        ws.on('open', resolve);
        ws.on('error', reject);
      });
      ws.close();
    });

    await test('会把用户事件转发到 stdout，并附带 source 字段', async () => {
      stdoutAccum = '';
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await new Promise(resolve => ws.on('open', resolve));

      ws.send(JSON.stringify({ type: 'click', text: 'Test Button' }));
      await sleep(300);

      assert(stdoutAccum.includes('"source":"user-event"'), '应打上 source 标记');
      assert(stdoutAccum.includes('Test Button'), '应包含事件数据');
      ws.close();
    });

    await test('会把 choice 事件写入 state/events', async () => {
      const eventsFile = path.join(STATE_DIR, 'events');
      if (fs.existsSync(eventsFile)) fs.unlinkSync(eventsFile);

      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await new Promise(resolve => ws.on('open', resolve));

      ws.send(JSON.stringify({ type: 'click', choice: 'b', text: 'Option B' }));
      await sleep(300);

      assert(fs.existsSync(eventsFile), 'state/events 应存在');
      const lines = fs.readFileSync(eventsFile, 'utf-8').trim().split('\n');
      const event = JSON.parse(lines[lines.length - 1]);
      assert.strictEqual(event.choice, 'b');
      assert.strictEqual(event.text, 'Option B');
      ws.close();
    });

    await test('不会把非 choice 事件写入 state/events', async () => {
      const eventsFile = path.join(STATE_DIR, 'events');
      if (fs.existsSync(eventsFile)) fs.unlinkSync(eventsFile);

      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await new Promise(resolve => ws.on('open', resolve));

      ws.send(JSON.stringify({ type: 'hover', text: 'Something' }));
      await sleep(300);

      assert(!fs.existsSync(eventsFile), '非 choice 事件不应生成 state/events');
      ws.close();
    });

    await test('可同时处理多个 WebSocket 客户端', async () => {
      const ws1 = new WebSocket(`ws://localhost:${TEST_PORT}`);
      const ws2 = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await Promise.all([
        new Promise(resolve => ws1.on('open', resolve)),
        new Promise(resolve => ws2.on('open', resolve))
      ]);

      let ws1Reload = false;
      let ws2Reload = false;
      ws1.on('message', (data) => {
        if (JSON.parse(data.toString()).type === 'reload') ws1Reload = true;
      });
      ws2.on('message', (data) => {
        if (JSON.parse(data.toString()).type === 'reload') ws2Reload = true;
      });

      fs.writeFileSync(path.join(CONTENT_DIR, 'multi-client.html'), '<h2>Multi</h2>');
      await sleep(500);

      assert(ws1Reload, '客户端 1 应收到 reload');
      assert(ws2Reload, '客户端 2 应收到 reload');
      ws1.close();
      ws2.close();
    });

    await test('会把已关闭客户端从广播列表中清理掉', async () => {
      const ws1 = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await new Promise(resolve => ws1.on('open', resolve));
      ws1.close();
      await sleep(100);

      fs.writeFileSync(path.join(CONTENT_DIR, 'after-close.html'), '<h2>After</h2>');
      await sleep(300);
      // 只要没有抛错，测试就算通过
    });

    await test('客户端发送畸形 JSON 时，server 仍能正常运行', async () => {
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await new Promise(resolve => ws.on('open', resolve));

      ws.send('not json at all {{{');
      await sleep(300);

      const res = await fetch(`http://localhost:${TEST_PORT}/`);
      assert.strictEqual(res.status, 200, 'server 应继续存活');
      ws.close();
    });

    // ========== 文件监听 ==========
    console.log('\n--- 文件监听 ---');

    await test('新建 .html 文件时会发送 reload', async () => {
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await new Promise(resolve => ws.on('open', resolve));

      let gotReload = false;
      ws.on('message', (data) => {
        if (JSON.parse(data.toString()).type === 'reload') gotReload = true;
      });

      fs.writeFileSync(path.join(CONTENT_DIR, 'watch-new.html'), '<h2>New</h2>');
      await sleep(500);

      assert(gotReload, '新文件出现时应发送 reload');
      ws.close();
    });

    await test('修改 .html 文件时会发送 reload', async () => {
      const filePath = path.join(CONTENT_DIR, 'watch-change.html');
      fs.writeFileSync(filePath, '<h2>Original</h2>');
      await sleep(500);

      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await new Promise(resolve => ws.on('open', resolve));

      let gotReload = false;
      ws.on('message', (data) => {
        if (JSON.parse(data.toString()).type === 'reload') gotReload = true;
      });

      fs.writeFileSync(filePath, '<h2>Modified</h2>');
      await sleep(500);

      assert(gotReload, '文件变更时应发送 reload');
      ws.close();
    });

    await test('非 .html 文件变化不会触发 reload', async () => {
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await new Promise(resolve => ws.on('open', resolve));

      let gotReload = false;
      ws.on('message', (data) => {
        if (JSON.parse(data.toString()).type === 'reload') gotReload = true;
      });

      fs.writeFileSync(path.join(CONTENT_DIR, 'data.txt'), 'not html');
      await sleep(500);

      assert(!gotReload, '非 HTML 文件不应触发 reload');
      ws.close();
    });

    await test('新 screen 出现时会清空 state/events', async () => {
      const eventsFile = path.join(STATE_DIR, 'events');
      fs.writeFileSync(eventsFile, '{"choice":"a"}\n');
      assert(fs.existsSync(eventsFile));

      fs.writeFileSync(path.join(CONTENT_DIR, 'clear-events.html'), '<h2>New screen</h2>');
      await sleep(500);

      assert(!fs.existsSync(eventsFile), '新 screen 出现时应清空 state/events');
    });

    await test('新文件出现时会记录 screen-added', async () => {
      stdoutAccum = '';
      fs.writeFileSync(path.join(CONTENT_DIR, 'log-test.html'), '<h2>Log</h2>');
      await sleep(500);

      assert(stdoutAccum.includes('screen-added'), '应记录 screen-added');
    });

    await test('文件更新时会记录 screen-updated', async () => {
      const filePath = path.join(CONTENT_DIR, 'log-update.html');
      fs.writeFileSync(filePath, '<h2>V1</h2>');
      await sleep(500);

      stdoutAccum = '';
      fs.writeFileSync(filePath, '<h2>V2</h2>');
      await sleep(500);

      assert(stdoutAccum.includes('screen-updated'), '应记录 screen-updated');
    });

    // ========== helper.js 校验 ==========
    console.log('\n--- helper.js 校验 ---');

    await test('helper.js 定义了必要 API', () => {
      const helperContent = fs.readFileSync(
        path.join(__dirname, '../../skills/brainstorming/scripts/helper.js'), 'utf-8'
      );
      assert(helperContent.includes('toggleSelect'), '应定义 toggleSelect');
      assert(helperContent.includes('sendEvent'), '应定义 sendEvent');
      assert(helperContent.includes('selectedChoice'), '应跟踪 selectedChoice');
      assert(helperContent.includes('brainstorm'), '应暴露 brainstorm API');
      return Promise.resolve();
    });

    // ========== Frame 模板校验 ==========
    console.log('\n--- Frame 模板校验 ---');

    await test('frame 模板包含必要结构', () => {
      const template = fs.readFileSync(
        path.join(__dirname, '../../skills/brainstorming/scripts/frame-template.html'), 'utf-8'
      );
      assert(template.includes('indicator-bar'), '应包含 indicator bar');
      assert(template.includes('indicator-text'), '应包含 indicator text');
      assert(template.includes('<!-- CONTENT -->'), '应包含内容占位符');
      assert(template.includes('claude-content'), '应包含内容容器');
      return Promise.resolve();
    });

    // ========== 汇总 ==========
    console.log(`\n--- 结果：${passed} 通过，${failed} 失败 ---`);
    if (failed > 0) process.exit(1);

  } finally {
    server.kill();
    await sleep(100);
    cleanup();
  }
}

runTests().catch(err => {
  console.error('测试失败：', err);
  process.exit(1);
});
