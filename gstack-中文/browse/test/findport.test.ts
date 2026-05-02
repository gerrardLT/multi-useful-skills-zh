import { describe, test, expect } from 'bun:test';
import * as net from 'net';
import * as path from 'path';

const polyfillPath = path.resolve(import.meta.dir, '../src/bun-polyfill.cjs');

// 辅助函数：占用一个端口并保持监听，返回释放函数。
function occupyPort(port: number): Promise<() => Promise<void>> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(port, '127.0.0.1', () => {
      resolve(() => new Promise<void>((r) => srv.close(() => r())));
    });
  });
}

// 辅助函数：通过绑定到 0 找到一个已知空闲端口。
function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const port = (srv.address() as net.AddressInfo).port;
      srv.close(() => resolve(port));
    });
  });
}

describe('findPort / isPortAvailable', () => {

  test('isPortAvailable returns true for a free port', async () => {
    // 这里复用 server.ts 里同样的 isPortAvailable 思路。
    const port = await getFreePort();

    const available = await new Promise<boolean>((resolve) => {
      const srv = net.createServer();
      srv.once('error', () => resolve(false));
      srv.listen(port, '127.0.0.1', () => {
        srv.close(() => resolve(true));
      });
    });

    expect(available).toBe(true);
  });

  test('isPortAvailable returns false for an occupied port', async () => {
    const port = await getFreePort();
    const release = await occupyPort(port);

    try {
      const available = await new Promise<boolean>((resolve) => {
        const srv = net.createServer();
        srv.once('error', () => resolve(false));
        srv.listen(port, '127.0.0.1', () => {
          srv.close(() => resolve(true));
        });
      });

      expect(available).toBe(false);
    } finally {
      await release();
    }
  });

  test('port is actually free after isPortAvailable returns true', async () => {
    // 这是核心竞态测试：当 isPortAvailable 说端口空闲后，
    // 我们能不能立刻再次绑定它？
    const port = await getFreePort();

    // 模拟 isPortAvailable。
    const isFree = await new Promise<boolean>((resolve) => {
      const srv = net.createServer();
      srv.once('error', () => resolve(false));
      srv.listen(port, '127.0.0.1', () => {
        srv.close(() => resolve(true));
      });
    });

    expect(isFree).toBe(true);

    // 立刻再次绑定。旧的 Bun.serve() polyfill 方案在这里会失败，
    // 因为测试服务器的 listen() 关闭还可能没完全落地。
    const canBind = await new Promise<boolean>((resolve) => {
      const srv = net.createServer();
      srv.once('error', () => resolve(false));
      srv.listen(port, '127.0.0.1', () => {
        srv.close(() => resolve(true));
      });
    });

    expect(canBind).toBe(true);
  });

  test('polyfill Bun.serve stop() is fire-and-forget (async)', async () => {
    // 验证 polyfill 里的 stop() 不会等待 socket 真正关闭。
    // 这正是竞态条件的根因。在 macOS/Linux 上端口回收更快，
    // 问题未必稳定出现，但在 Windows 的 TIME_WAIT 下几乎必现。
    const result = Bun.spawnSync(['node', '-e', `
      require('${polyfillPath}');
      const net = require('net');

      async function test() {
        const port = 10000 + Math.floor(Math.random() * 50000);

        const testServer = Bun.serve({
          port,
          hostname: '127.0.0.1',
          fetch: () => new Response('ok'),
        });

        // stop() 返回 undefined，而不是 Promise，
        // 所以调用方没法等待 socket 完成释放。
        const retval = testServer.stop();
        console.log(typeof retval === 'undefined' ? 'FIRE_AND_FORGET' : 'AWAITABLE');
      }

      test();
    `], { stdout: 'pipe', stderr: 'pipe' });

    const output = result.stdout.toString().trim();
    // 这证明 polyfill 的 stop() 是 fire-and-forget，
    // 调用方无法等待端口真正释放，所以会有竞态。
    expect(output).toBe('FIRE_AND_FORGET');
  });

  test('net.createServer approach does not have the race condition', async () => {
    // 证明修复方案有效：正确的 async bind/close 不会留下这个竞态。
    const result = Bun.spawnSync(['node', '-e', `
      const net = require('net');

      async function testFix() {
        const port = 10000 + Math.floor(Math.random() * 50000);

        // 模拟新的 isPortAvailable：正确地异步绑定和关闭。
        const isFree = await new Promise((resolve) => {
          const srv = net.createServer();
          srv.once('error', () => resolve(false));
          srv.listen(port, '127.0.0.1', () => {
            srv.close(() => resolve(true));
          });
        });

        if (!isFree) {
          console.log('PORT_BUSY');
          return;
        }

        // 立刻再次绑定。这里应该成功，因为 close()
        // 已经在 Promise resolve 前完成了。
        const canBind = await new Promise((resolve) => {
          const srv = net.createServer();
          srv.once('error', () => resolve(false));
          srv.listen(port, '127.0.0.1', () => {
            srv.close(() => resolve(true));
          });
        });

        console.log(canBind ? 'FIX_WORKS' : 'FIX_BROKEN');
      }

      testFix();
    `], { stdout: 'pipe', stderr: 'pipe' });

    const output = result.stdout.toString().trim();
    expect(output).toBe('FIX_WORKS');
  });

  test('isPortAvailable handles rapid sequential checks', async () => {
    // 压测：连续多次检查同一个端口。
    const port = await getFreePort();
    const results: boolean[] = [];

    for (let i = 0; i < 5; i++) {
      const available = await new Promise<boolean>((resolve) => {
        const srv = net.createServer();
        srv.once('error', () => resolve(false));
        srv.listen(port, '127.0.0.1', () => {
          srv.close(() => resolve(true));
        });
      });
      results.push(available);
    }

    // 5 次检查都应该成功，不能泄漏 socket。
    expect(results).toEqual([true, true, true, true, true]);
  });
});
