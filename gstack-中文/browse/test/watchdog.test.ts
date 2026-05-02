import { describe, test, expect, afterEach } from 'bun:test';
import { spawn, type Subprocess } from 'bun';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// server.ts 中父进程 watchdog 的端到端回归测试。
// watchdog 从 v0.18.1.0 (#1025) 到 v0.18.2.0
//（community wave #994 以及后续的 mode-gating 修正）
// 形成了分层行为：
//
//   1. `BROWSE_PARENT_PID=0` 会完全关闭 watchdog（给 CI 和 pair-agent 使用）。
//   2. `BROWSE_HEADED=1` 会完全关闭 watchdog（服务端对 headed 模式的保护，
//      因为这时窗口生命周期由用户控制）。
//   3. 默认 headless 模式下，即使父进程死掉，服务也会继续存活。
//      原先“父进程一死就关闭”的逻辑在 #994 中被反转，因为 Claude Code
//      的 Bash sandbox 会在每次工具调用后杀掉父 shell，而 #994 又要求
//      browse 能在多次 `$B` 调用之间持续存活。最终清理由空闲超时
//      （30 分钟）负责。
//
// Tunnel 模式下“父进程死亡 -> 服务关闭”（因为此时不能靠 idle timeout）
// 没有在这里做自动化覆盖。原因是 `tunnelActive` 是运行时变量，
// 来自 `/pair-agent` 的 tunnel-create 流，而不是环境变量。要伪造它，
// 需要侵入式的仅测试 hook。相关模式判断已经在 watchdog 和 SIGTERM
// 处理逻辑旁边写了内联说明，而且如果回归，`/pair-agent` 用户会很明显地
// 观察到问题（断连后服务还在挂着）。
//
// 每个测试都会启动真实的 `server.ts`。前两个测试通过 stdout 日志快速验证；
// 第三个测试会等待 watchdog 轮询周期，确认父进程死亡后服务仍然存活
//（较慢，大约 20 秒观测窗口）。

const ROOT = path.resolve(import.meta.dir, '..');
const SERVER_SCRIPT = path.join(ROOT, 'src', 'server.ts');

let tmpDir: string;
let serverProc: Subprocess | null = null;
let parentProc: Subprocess | null = null;

afterEach(async () => {
  // 杀掉任何残留进程，保证后续测试从干净状态开始。
  try { parentProc?.kill('SIGKILL'); } catch {}
  try { serverProc?.kill('SIGKILL'); } catch {}
  // 稍等片刻，确保进程退出后再清理 tmpDir。
  await Bun.sleep(100);
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  parentProc = null;
  serverProc = null;
});

function spawnServer(env: Record<string, string>, port: number): Subprocess {
  const stateFile = path.join(tmpDir, 'browse-state.json');
  return spawn(['bun', 'run', SERVER_SCRIPT], {
    env: {
      ...process.env,
      BROWSE_STATE_FILE: stateFile,
      BROWSE_PORT: String(port),
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0); // signal 0 = 只检查进程是否存在，不实际发信号
    return true;
  } catch {
    return false;
  }
}

// 持续读取 stdout，直到看到预期标记或超时，返回已捕获文本。
// 用于验证启动阶段是否走到了预期的 watchdog 分支。
async function readStdoutUntil(
  proc: Subprocess,
  marker: string,
  timeoutMs: number,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  const decoder = new TextDecoder();
  let captured = '';
  const reader = (proc.stdout as ReadableStream<Uint8Array>).getReader();
  try {
    while (Date.now() < deadline) {
      const readPromise = reader.read();
      const timed = Bun.sleep(Math.max(0, deadline - Date.now()));
      const result = await Promise.race([readPromise, timed.then(() => null)]);
      if (!result || result.done) break;
      captured += decoder.decode(result.value);
      if (captured.includes(marker)) return captured;
    }
  } finally {
    try { reader.releaseLock(); } catch {}
  }
  return captured;
}

describe('parent-process watchdog (v0.18.1.0)', () => {
  test('BROWSE_PARENT_PID=0 disables the watchdog', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'watchdog-pid0-'));
    serverProc = spawnServer({ BROWSE_PARENT_PID: '0' }, 34901);

    const out = await readStdoutUntil(
      serverProc,
      'Parent-process watchdog disabled (BROWSE_PARENT_PID=0)',
      5000,
    );
    expect(out).toContain('Parent-process watchdog disabled (BROWSE_PARENT_PID=0)');
    // 对照检查：绝不能出现“父进程退出，准备关闭”这类日志。
    // 如果出现，就说明明明要求跳过 watchdog，却还是跑了。
    expect(out).not.toContain('Parent process');
  }, 15_000);

  test('BROWSE_HEADED=1 disables the watchdog (server-side guard)', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'watchdog-headed-'));
    // 传一个假的 parent PID，证明 BROWSE_HEADED 的优先级更高。
    // 如果服务端这层保护回归，watchdog 就会去轮询这个 PID，
    // 最后把它当成“死亡父进程”处理。
    serverProc = spawnServer(
      { BROWSE_HEADED: '1', BROWSE_PARENT_PID: '999999' },
      34902,
    );

    const out = await readStdoutUntil(
      serverProc,
      'Parent-process watchdog disabled (headed mode)',
      5000,
    );
    expect(out).toContain('Parent-process watchdog disabled (headed mode)');
    expect(out).not.toContain('Parent process 999999 exited');
  }, 15_000);

  test('default headless mode: server STAYS ALIVE when parent dies (#994)', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'watchdog-default-'));

    // 启动一个真实、但很快会死掉的“父进程”，让 watchdog 去轮询它。
    parentProc = spawn(['sleep', '60'], { stdio: ['ignore', 'ignore', 'ignore'] });
    const parentPid = parentProc.pid!;

    // 默认 headless：没有 BROWSE_HEADED，且给出真实 parent PID。
    serverProc = spawnServer({ BROWSE_PARENT_PID: String(parentPid) }, 34903);
    const serverPid = serverProc.pid!;

    // 给服务一点时间启动并注册 watchdog interval。
    await Bun.sleep(2000);
    expect(isProcessAlive(serverPid)).toBe(true);

    // 杀掉父进程。watchdog 每 15 秒轮询一次，所以父进程死亡后，
    // 最慢约 15 秒内就会进入第一次检测。#994 之前这里会导致服务退出；
    // #994 之后服务应记录日志但继续存活。
    parentProc.kill('SIGKILL');

    // 等到至少一次 watchdog 轮询发生，再加一点余量。
    // 服务仍应保持存活，这就是 #994 的核心要求。
    await Bun.sleep(20_000);
    expect(isProcessAlive(serverPid)).toBe(true);
  }, 45_000);
});
