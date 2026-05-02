import { describe, test, expect } from 'bun:test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const SERVER_NODE = path.join(DIST_DIR, 'server-node.mjs');

describe('build: server-node.mjs', () => {
  test('passes node --check if present', () => {
    if (!fs.existsSync(SERVER_NODE)) {
      // browse/dist 被 gitignore 了；当前 checkout 里可能还没执行过构建。
      // 这里选择跳过而不是失败，这样普通的 `bun test` 不需要先 build。
      return;
    }
    expect(() => execSync(`node --check ${SERVER_NODE}`, { stdio: 'pipe' })).not.toThrow();
  });

  test('does not inline @ngrok/ngrok (must be external)', () => {
    if (!fs.existsSync(SERVER_NODE)) return;
    const bundle = fs.readFileSync(SERVER_NODE, 'utf-8');
    // externalize 之后，动态导入的包在 bundle 里应该只以字符串字面量出现，
    // 而不应该把模块代码整个内联进来。这里的启发式判断是：
    // 如果出现 ngrok 原生绑定加载器的内部标识符，就说明虽然传了
    // `--external`，但它还是被错误地打进 bundle 了。
    expect(bundle).not.toMatch(/ngrok_napi|ngrokNapi|@ngrok\/ngrok-darwin|@ngrok\/ngrok-linux|@ngrok\/ngrok-win32/);
  });
});
