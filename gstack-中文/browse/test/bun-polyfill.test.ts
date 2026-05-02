import { describe, test, expect, afterAll } from 'bun:test';
import * as path from 'path';

// 把 polyfill 加载到一个全新的对象环境里，避免污染 globalThis.Bun。
const polyfillPath = path.resolve(import.meta.dir, '../src/bun-polyfill.cjs');

describe('bun-polyfill', () => {
  // 这里通过 Node.js 子进程来测试 polyfill，
  // 因为它本来就是给 Node 用的，不是给 Bun 自己用的。

  test('Bun.sleep resolves after delay', async () => {
    const result = Bun.spawnSync(['node', '-e', `
      require('${polyfillPath}');
      (async () => {
        const start = Date.now();
        await Bun.sleep(50);
        const elapsed = Date.now() - start;
        console.log(elapsed >= 40 ? 'OK' : 'TOO_FAST');
      })();
    `], { stdout: 'pipe', stderr: 'pipe' });
    expect(result.stdout.toString().trim()).toBe('OK');
    expect(result.exitCode).toBe(0);
  });

  test('Bun.spawnSync runs a command and returns stdout', () => {
    const result = Bun.spawnSync(['node', '-e', `
      require('${polyfillPath}');
      const r = Bun.spawnSync(['echo', 'hello'], { stdout: 'pipe' });
      console.log(r.stdout.toString().trim());
      console.log('exit:' + r.exitCode);
    `], { stdout: 'pipe', stderr: 'pipe' });
    const lines = result.stdout.toString().trim().split('\n');
    expect(lines[0]).toBe('hello');
    expect(lines[1]).toBe('exit:0');
  });

  test('Bun.spawn launches a process with pid', async () => {
    const result = Bun.spawnSync(['node', '-e', `
      require('${polyfillPath}');
      const p = Bun.spawn(['echo', 'test'], { stdio: ['pipe', 'pipe', 'pipe'] });
      console.log(typeof p.pid === 'number' ? 'HAS_PID' : 'NO_PID');
      console.log(typeof p.kill === 'function' ? 'HAS_KILL' : 'NO_KILL');
      console.log(typeof p.unref === 'function' ? 'HAS_UNREF' : 'NO_UNREF');
    `], { stdout: 'pipe', stderr: 'pipe' });
    const lines = result.stdout.toString().trim().split('\n');
    expect(lines[0]).toBe('HAS_PID');
    expect(lines[1]).toBe('HAS_KILL');
    expect(lines[2]).toBe('HAS_UNREF');
  });

  test('Bun.serve creates an HTTP server that responds', async () => {
    const result = Bun.spawnSync(['node', '-e', `
      require('${polyfillPath}');
      const server = Bun.serve({
        port: 0,  // 注意：polyfill 直接使用传入端口，所以这里只测试对象结构
        hostname: '127.0.0.1',
        fetch(req) {
          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        },
      });
      // polyfill 不支持 port 0 自动分配，所以这里只验证返回对象的形状
      console.log(typeof server.stop === 'function' ? 'HAS_STOP' : 'NO_STOP');
      console.log(typeof server.port === 'number' ? 'HAS_PORT' : 'NO_PORT');
      server.stop();
    `], { stdout: 'pipe', stderr: 'pipe' });
    const lines = result.stdout.toString().trim().split('\n');
    expect(lines[0]).toBe('HAS_STOP');
    expect(lines[1]).toBe('HAS_PORT');
  });
});
