import { describe, test, expect } from 'bun:test';
import { resolveConfig, ensureStateDir, readVersionHash, getGitRoot, getRemoteSlug } from '../src/config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('config', () => {
  describe('getGitRoot', () => {
    test('returns a path when in a git repo', () => {
      const root = getGitRoot();
      expect(root).not.toBeNull();
      expect(fs.existsSync(path.join(root!, '.git'))).toBe(true);
    });
  });

  describe('resolveConfig', () => {
    test('uses git root by default', () => {
      const config = resolveConfig({});
      const gitRoot = getGitRoot();
      expect(gitRoot).not.toBeNull();
      expect(config.projectDir).toBe(gitRoot);
      expect(config.stateDir).toBe(path.join(gitRoot!, '.gstack'));
      expect(config.stateFile).toBe(path.join(gitRoot!, '.gstack', 'browse.json'));
    });

    test('derives paths from BROWSE_STATE_FILE when set', () => {
      const stateFile = '/tmp/test-config/.gstack/browse.json';
      const config = resolveConfig({ BROWSE_STATE_FILE: stateFile });
      expect(config.stateFile).toBe(stateFile);
      expect(config.stateDir).toBe('/tmp/test-config/.gstack');
      expect(config.projectDir).toBe('/tmp/test-config');
    });

    test('log paths are in stateDir', () => {
      const config = resolveConfig({});
      expect(config.consoleLog).toBe(path.join(config.stateDir, 'browse-console.log'));
      expect(config.networkLog).toBe(path.join(config.stateDir, 'browse-network.log'));
      expect(config.dialogLog).toBe(path.join(config.stateDir, 'browse-dialog.log'));
    });
  });

  describe('ensureStateDir', () => {
    test('creates directory if it does not exist', () => {
      const tmpDir = path.join(os.tmpdir(), `browse-config-test-${Date.now()}`);
      const config = resolveConfig({ BROWSE_STATE_FILE: path.join(tmpDir, '.gstack', 'browse.json') });
      expect(fs.existsSync(config.stateDir)).toBe(false);
      ensureStateDir(config);
      expect(fs.existsSync(config.stateDir)).toBe(true);
      // 清理
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('is a no-op if directory already exists', () => {
      const tmpDir = path.join(os.tmpdir(), `browse-config-test-${Date.now()}`);
      const stateDir = path.join(tmpDir, '.gstack');
      fs.mkdirSync(stateDir, { recursive: true });
      const config = resolveConfig({ BROWSE_STATE_FILE: path.join(stateDir, 'browse.json') });
      ensureStateDir(config); // 不应抛错
      expect(fs.existsSync(config.stateDir)).toBe(true);
      // 清理
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('adds .gstack/ to .gitignore if not present', () => {
      const tmpDir = path.join(os.tmpdir(), `browse-gitignore-test-${Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n');
      const config = resolveConfig({ BROWSE_STATE_FILE: path.join(tmpDir, '.gstack', 'browse.json') });
      ensureStateDir(config);
      const content = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8');
      expect(content).toContain('.gstack/');
      expect(content).toBe('node_modules/\n.gstack/\n');
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('does not duplicate .gstack/ in .gitignore', () => {
      const tmpDir = path.join(os.tmpdir(), `browse-gitignore-test-${Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n.gstack/\n');
      const config = resolveConfig({ BROWSE_STATE_FILE: path.join(tmpDir, '.gstack', 'browse.json') });
      ensureStateDir(config);
      const content = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8');
      expect(content).toBe('node_modules/\n.gstack/\n');
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('handles .gitignore without trailing newline', () => {
      const tmpDir = path.join(os.tmpdir(), `browse-gitignore-test-${Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules');
      const config = resolveConfig({ BROWSE_STATE_FILE: path.join(tmpDir, '.gstack', 'browse.json') });
      ensureStateDir(config);
      const content = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8');
      expect(content).toBe('node_modules\n.gstack/\n');
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('logs warning to browse-server.log on non-ENOENT gitignore error', () => {
      const tmpDir = path.join(os.tmpdir(), `browse-gitignore-test-${Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      // 创建只读 .gitignore（没有 .gstack/ 条目，因此代码会尝试追加）
      fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n');
      fs.chmodSync(path.join(tmpDir, '.gitignore'), 0o444);
      const config = resolveConfig({ BROWSE_STATE_FILE: path.join(tmpDir, '.gstack', 'browse.json') });
      ensureStateDir(config); // 不应抛错
      // 确认警告已经写入 server 日志
      const logPath = path.join(config.stateDir, 'browse-server.log');
      expect(fs.existsSync(logPath)).toBe(true);
      const logContent = fs.readFileSync(logPath, 'utf-8');
      expect(logContent).toContain('Warning: could not update .gitignore');
      // .gitignore 内容应保持不变
      const gitignoreContent = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8');
      expect(gitignoreContent).toBe('node_modules/\n');
      // 清理
      fs.chmodSync(path.join(tmpDir, '.gitignore'), 0o644);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('skips if no .gitignore exists', () => {
      const tmpDir = path.join(os.tmpdir(), `browse-gitignore-test-${Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      const config = resolveConfig({ BROWSE_STATE_FILE: path.join(tmpDir, '.gstack', 'browse.json') });
      ensureStateDir(config);
      expect(fs.existsSync(path.join(tmpDir, '.gitignore'))).toBe(false);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
  });

  describe('getRemoteSlug', () => {
    test('returns owner-repo format for current repo', () => {
      const slug = getRemoteSlug();
      // 当前仓库带有 origin remote，因此这里应该能拿到 slug
      expect(slug).toBeTruthy();
      expect(slug).toMatch(/^[a-zA-Z0-9._-]+-[a-zA-Z0-9._-]+$/);
    });

    test('parses SSH remote URLs', () => {
      // 这里直接测正则，因为 Bun.spawnSync 不太方便 mock
      const url = 'git@github.com:garrytan/gstack.git';
      const match = url.match(/[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      expect(match).not.toBeNull();
      expect(`${match![1]}-${match![2]}`).toBe('garrytan-gstack');
    });

    test('parses HTTPS remote URLs', () => {
      const url = 'https://github.com/garrytan/gstack.git';
      const match = url.match(/[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      expect(match).not.toBeNull();
      expect(`${match![1]}-${match![2]}`).toBe('garrytan-gstack');
    });

    test('parses HTTPS remote URLs without .git suffix', () => {
      const url = 'https://github.com/garrytan/gstack';
      const match = url.match(/[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      expect(match).not.toBeNull();
      expect(`${match![1]}-${match![2]}`).toBe('garrytan-gstack');
    });
  });

  describe('readVersionHash', () => {
    test('returns null when .version file does not exist', () => {
      const result = readVersionHash('/nonexistent/path/browse');
      expect(result).toBeNull();
    });

    test('reads version from .version file adjacent to execPath', () => {
      const tmpDir = path.join(os.tmpdir(), `browse-version-test-${Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      const versionFile = path.join(tmpDir, '.version');
      fs.writeFileSync(versionFile, 'abc123def\n');
      const result = readVersionHash(path.join(tmpDir, 'browse'));
      expect(result).toBe('abc123def');
      // 清理
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
  });
});

describe('resolveServerScript', () => {
  // 从 cli.ts 导入这个函数
  const { resolveServerScript } = require('../src/cli');

  test('uses BROWSE_SERVER_SCRIPT env when set', () => {
    const result = resolveServerScript({ BROWSE_SERVER_SCRIPT: '/custom/server.ts' }, '', '');
    expect(result).toBe('/custom/server.ts');
  });

  test('finds server.ts adjacent to cli.ts in dev mode', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const result = resolveServerScript({}, srcDir, '');
    expect(result).toBe(path.join(srcDir, 'server.ts'));
  });

  test('throws when server.ts cannot be found', () => {
    expect(() => resolveServerScript({}, '/nonexistent/$bunfs', '/nonexistent/browse'))
      .toThrow('Cannot find server.ts');
  });
});

describe('resolveNodeServerScript', () => {
  const { resolveNodeServerScript } = require('../src/cli');

  test('finds server-node.mjs in dist from dev mode', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const distFile = path.resolve(srcDir, '..', 'dist', 'server-node.mjs');
    const fs = require('fs');
    // 只有文件存在时才测试，因为当前工作区可能还没 build
    if (fs.existsSync(distFile)) {
      const result = resolveNodeServerScript(srcDir, '');
      expect(result).toBe(distFile);
    }
  });

  test('returns null when server-node.mjs does not exist', () => {
    const result = resolveNodeServerScript('/nonexistent/$bunfs', '/nonexistent/browse');
    expect(result).toBeNull();
  });

  test('finds server-node.mjs adjacent to compiled binary', () => {
    const distDir = path.resolve(__dirname, '../dist');
    const distFile = path.join(distDir, 'server-node.mjs');
    const fs = require('fs');
    if (fs.existsSync(distFile)) {
      const result = resolveNodeServerScript('/$bunfs/something', path.join(distDir, 'browse'));
      expect(result).toBe(distFile);
    }
  });
});

describe('version mismatch detection', () => {
  test('detects when versions differ', () => {
    const stateVersion = 'abc123';
    const currentVersion = 'def456';
    expect(stateVersion !== currentVersion).toBe(true);
  });

  test('no mismatch when versions match', () => {
    const stateVersion = 'abc123';
    const currentVersion = 'abc123';
    expect(stateVersion !== currentVersion).toBe(false);
  });

  test('no mismatch when either version is null', () => {
    const currentVersion: string | null = null;
    const stateVersion: string | undefined = 'abc123';
    // 只有两边版本都存在时，才会触发版本不一致判断
    const shouldRestart = currentVersion !== null && stateVersion !== undefined && currentVersion !== stateVersion;
    expect(shouldRestart).toBe(false);
  });
});

describe('isServerHealthy', () => {
  const { isServerHealthy } = require('../src/cli');
  const http = require('http');

  test('returns true for a healthy server', async () => {
    const server = http.createServer((_req: any, res: any) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy' }));
    });
    await new Promise<void>(resolve => server.listen(0, resolve));
    const port = server.address().port;
    try {
      expect(await isServerHealthy(port)).toBe(true);
    } finally {
      server.close();
    }
  });

  test('returns false for an unhealthy server', async () => {
    const server = http.createServer((_req: any, res: any) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'unhealthy' }));
    });
    await new Promise<void>(resolve => server.listen(0, resolve));
    const port = server.address().port;
    try {
      expect(await isServerHealthy(port)).toBe(false);
    } finally {
      server.close();
    }
  });

  test('returns false when server is not running', async () => {
    // 用一个几乎不可能被占用的端口
    expect(await isServerHealthy(59999)).toBe(false);
  });

  test('returns false on non-200 response', async () => {
    const server = http.createServer((_req: any, res: any) => {
      res.writeHead(500);
      res.end('Internal Server Error');
    });
    await new Promise<void>(resolve => server.listen(0, resolve));
    const port = server.address().port;
    try {
      expect(await isServerHealthy(port)).toBe(false);
    } finally {
      server.close();
    }
  });
});

describe('startup error log', () => {
  test('write and read error log', () => {
    const tmpDir = path.join(os.tmpdir(), `browse-error-log-test-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    const errorLogPath = path.join(tmpDir, 'browse-startup-error.log');
    const errorMsg = 'Cannot find module playwright';
    fs.writeFileSync(errorLogPath, `2026-03-23T00:00:00.000Z ${errorMsg}\n`);
    const content = fs.readFileSync(errorLogPath, 'utf-8').trim();
    expect(content).toContain(errorMsg);
    expect(content).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 时间戳前缀
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
