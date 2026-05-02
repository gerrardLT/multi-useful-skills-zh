import { describe, test, expect } from 'bun:test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { safeUnlink, safeKill, isProcessAlive } from '../src/error-handling';

describe('safeUnlink', () => {
  test('removes an existing file', () => {
    const tmp = path.join(os.tmpdir(), `test-safeUnlink-${Date.now()}`);
    fs.writeFileSync(tmp, 'hello');
    safeUnlink(tmp);
    expect(fs.existsSync(tmp)).toBe(false);
  });

  test('ignores ENOENT (file does not exist)', () => {
    expect(() => safeUnlink('/tmp/nonexistent-file-' + Date.now())).not.toThrow();
  });

  test('rethrows non-ENOENT errors', () => {
    // 尝试删除目录而不是文件，会抛出 EPERM/EISDIR
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-safeUnlink-'));
    expect(() => safeUnlink(dir)).toThrow();
    fs.rmdirSync(dir);
  });
});

describe('safeKill', () => {
  test('sends signal to a running process', () => {
    // signal 0 是无副作用的存在性检查，发给当前进程也安全
    expect(() => safeKill(process.pid, 0)).not.toThrow();
  });

  test('ignores ESRCH (process does not exist)', () => {
    // PID 99999999 几乎不可能真实存在
    expect(() => safeKill(99999999, 0)).not.toThrow();
  });
});

describe('isProcessAlive', () => {
  test('returns true for current process', () => {
    expect(isProcessAlive(process.pid)).toBe(true);
  });

  test('returns false for non-existent process', () => {
    expect(isProcessAlive(99999999)).toBe(false);
  });
});
