/**
 * inbox 元命令处理器（file drop relay）的测试。
 *
 * 通过创建带测试 JSON 文件的临时目录，并调用 `handleMetaCommand`
 * 或直接复刻其核心逻辑，验证 inbox 展示、`--clear` 标志，以及各种边界情况。
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { handleMetaCommand } from '../src/meta-commands';
import { BrowserManager } from '../src/browser-manager';

let tmpDir: string;
let bm: BrowserManager;

// `handleMetaCommand` 需要一个 BrowserManager 实例，但 inbox 本身并不会用到它。
// 另外还得把 `git rev-parse` 的结果指向我们的临时目录，mock 成本较高。
// 所以这里主要通过直接操作文件系统，复刻 inbox 的核心逻辑来测试。

// 直接文件系统测试（绕开 handleMetaCommand）
// meta-commands.ts 里的 inbox 处理器会调用 `git rev-parse --show-toplevel`
// 来找到 inbox 目录。单元测试里不太方便 mock，所以这里直接测试
// inbox 的解析与格式化逻辑。

interface InboxMessage {
  timestamp: string;
  url: string;
  userMessage: string;
}

/** 复刻 meta-commands.ts 里的 inbox 文件读取逻辑。 */
function readInbox(inboxDir: string): InboxMessage[] {
  if (!fs.existsSync(inboxDir)) return [];

  const files = fs.readdirSync(inboxDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('.'))
    .sort()
    .reverse();

  if (files.length === 0) return [];

  const messages: InboxMessage[] = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(inboxDir, file), 'utf-8'));
      messages.push({
        timestamp: data.timestamp || '',
        url: data.page?.url || 'unknown',
        userMessage: data.userMessage || '',
      });
    } catch {
      // 畸形文件直接跳过。
    }
  }
  return messages;
}

/** 复刻 meta-commands.ts 里的 inbox 格式化逻辑。 */
function formatInbox(messages: InboxMessage[]): string {
  if (messages.length === 0) return 'Inbox empty.';

  const lines: string[] = [];
  lines.push(`SIDEBAR INBOX (${messages.length} message${messages.length === 1 ? '' : 's'})`);
  lines.push('--------------------------------');

  for (const msg of messages) {
    const ts = msg.timestamp ? `[${msg.timestamp}]` : '[unknown]';
    lines.push(`${ts} ${msg.url}`);
    lines.push(`  "${msg.userMessage}"`);
    lines.push('');
  }

  lines.push('--------------------------------');
  return lines.join('\n');
}

/** 复刻 meta-commands.ts 里的 `--clear` 逻辑。 */
function clearInbox(inboxDir: string): number {
  const files = fs.readdirSync(inboxDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('.'));
  for (const file of files) {
    try { fs.unlinkSync(path.join(inboxDir, file)); } catch {}
  }
  return files.length;
}

function writeTestInboxFile(
  inboxDir: string,
  message: string,
  pageUrl: string,
  timestamp: string,
): string {
  fs.mkdirSync(inboxDir, { recursive: true });
  const filename = `${timestamp.replace(/:/g, '-')}-observation.json`;
  const filePath = path.join(inboxDir, filename);
  fs.writeFileSync(filePath, JSON.stringify({
    type: 'observation',
    timestamp,
    page: { url: pageUrl, title: '' },
    userMessage: message,
    sidebarSessionId: 'test-session',
  }, null, 2));
  return filePath;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-drop-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// 空 inbox

describe('inbox - empty states', () => {
  test('no .context/sidebar-inbox directory returns empty', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    const messages = readInbox(inboxDir);
    expect(messages.length).toBe(0);
    expect(formatInbox(messages)).toBe('Inbox empty.');
  });

  test('empty inbox directory returns empty', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    fs.mkdirSync(inboxDir, { recursive: true });
    const messages = readInbox(inboxDir);
    expect(messages.length).toBe(0);
    expect(formatInbox(messages)).toBe('Inbox empty.');
  });

  test('directory with only dotfiles returns empty', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    fs.mkdirSync(inboxDir, { recursive: true });
    fs.writeFileSync(path.join(inboxDir, '.tmp-file.json'), '{}');
    const messages = readInbox(inboxDir);
    expect(messages.length).toBe(0);
  });
});

// 有效消息

describe('inbox - valid messages', () => {
  test('displays formatted output with timestamps and URLs', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    writeTestInboxFile(inboxDir, 'This button is broken', 'https://example.com/page', '2024-06-15T10:30:00.000Z');
    writeTestInboxFile(inboxDir, 'Login form fails', 'https://example.com/login', '2024-06-15T10:31:00.000Z');

    const messages = readInbox(inboxDir);
    expect(messages.length).toBe(2);

    const output = formatInbox(messages);
    expect(output).toContain('SIDEBAR INBOX (2 messages)');
    expect(output).toContain('https://example.com/page');
    expect(output).toContain('https://example.com/login');
    expect(output).toContain('"This button is broken"');
    expect(output).toContain('"Login form fails"');
    expect(output).toContain('[2024-06-15T10:30:00.000Z]');
    expect(output).toContain('[2024-06-15T10:31:00.000Z]');
  });

  test('single message uses singular form', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    writeTestInboxFile(inboxDir, 'Just one', 'https://example.com', '2024-06-15T10:30:00.000Z');

    const messages = readInbox(inboxDir);
    const output = formatInbox(messages);
    expect(output).toContain('1 message)');
    expect(output).not.toContain('messages)');
  });

  test('messages sorted newest first', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    writeTestInboxFile(inboxDir, 'older', 'https://example.com', '2024-06-15T10:00:00.000Z');
    writeTestInboxFile(inboxDir, 'newer', 'https://example.com', '2024-06-15T11:00:00.000Z');

    const messages = readInbox(inboxDir);
    // 文件名按字典序排序后再 reverse，因此最新消息排最前。
    expect(messages[0].userMessage).toBe('newer');
    expect(messages[1].userMessage).toBe('older');
  });
});

// 畸形文件

describe('inbox - malformed files', () => {
  test('malformed JSON files are skipped gracefully', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    fs.mkdirSync(inboxDir, { recursive: true });

    // 先写一条有效消息。
    writeTestInboxFile(inboxDir, 'valid message', 'https://example.com', '2024-06-15T10:30:00.000Z');

    // 再写一条损坏的 JSON。
    fs.writeFileSync(
      path.join(inboxDir, '2024-06-15T10-35-00.000Z-observation.json'),
      'this is not valid json {{{',
    );

    const messages = readInbox(inboxDir);
    expect(messages.length).toBe(1);
    expect(messages[0].userMessage).toBe('valid message');
  });

  test('JSON file missing fields uses defaults', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    fs.mkdirSync(inboxDir, { recursive: true });

    // 写入一个缺字段的 JSON 文件。
    fs.writeFileSync(
      path.join(inboxDir, '2024-06-15T10-30-00.000Z-observation.json'),
      JSON.stringify({ type: 'observation' }),
    );

    const messages = readInbox(inboxDir);
    expect(messages.length).toBe(1);
    expect(messages[0].timestamp).toBe('');
    expect(messages[0].url).toBe('unknown');
    expect(messages[0].userMessage).toBe('');
  });
});

// clear 标志

describe('inbox - --clear flag', () => {
  test('files deleted after clear', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    writeTestInboxFile(inboxDir, 'message 1', 'https://example.com', '2024-06-15T10:30:00.000Z');
    writeTestInboxFile(inboxDir, 'message 2', 'https://example.com', '2024-06-15T10:31:00.000Z');

    // 确认文件最初存在。
    const filesBefore = fs.readdirSync(inboxDir).filter(f => f.endsWith('.json') && !f.startsWith('.'));
    expect(filesBefore.length).toBe(2);

    // 执行清空。
    const cleared = clearInbox(inboxDir);
    expect(cleared).toBe(2);

    // 确认文件被删除。
    const filesAfter = fs.readdirSync(inboxDir).filter(f => f.endsWith('.json') && !f.startsWith('.'));
    expect(filesAfter.length).toBe(0);
  });

  test('clear on empty directory does nothing', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    fs.mkdirSync(inboxDir, { recursive: true });

    const cleared = clearInbox(inboxDir);
    expect(cleared).toBe(0);
  });

  test('clear preserves dotfiles', () => {
    const inboxDir = path.join(tmpDir, '.context', 'sidebar-inbox');
    fs.mkdirSync(inboxDir, { recursive: true });

    // 写一个 dotfile，再写一条普通消息文件。
    fs.writeFileSync(path.join(inboxDir, '.keep'), '');
    writeTestInboxFile(inboxDir, 'to be cleared', 'https://example.com', '2024-06-15T10:30:00.000Z');

    clearInbox(inboxDir);

    // Dotfile 应该保留。
    expect(fs.existsSync(path.join(inboxDir, '.keep'))).toBe(true);
    // 普通 JSON 文件应该被删掉。
    const jsonFiles = fs.readdirSync(inboxDir).filter(f => f.endsWith('.json') && !f.startsWith('.'));
    expect(jsonFiles.length).toBe(0);
  });
});
