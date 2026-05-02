import { describe, it, expect } from 'bun:test';
import {
  canonicalizeCommand,
  COMMAND_ALIASES,
  NEW_IN_VERSION,
  buildUnknownCommandError,
  ALL_COMMANDS,
} from '../src/commands';

describe('canonicalizeCommand', () => {
  it('将 setcontent 解析为 load-html', () => {
    expect(canonicalizeCommand('setcontent')).toBe('load-html');
  });

  it('将 set-content 解析为 load-html', () => {
    expect(canonicalizeCommand('set-content')).toBe('load-html');
  });

  it('将 setContent 解析为 load-html（区分大小写键名）', () => {
    expect(canonicalizeCommand('setContent')).toBe('load-html');
  });

  it('保留规范命令名不变', () => {
    expect(canonicalizeCommand('load-html')).toBe('load-html');
    expect(canonicalizeCommand('goto')).toBe('goto');
  });

  it('保留未知命令名不变（别名表是允许列表，不是过滤器）', () => {
    expect(canonicalizeCommand('totally-made-up')).toBe('totally-made-up');
  });
});

describe('buildUnknownCommandError', () => {
  it('每条错误都带上原始输入', () => {
    const msg = buildUnknownCommandError('xyz', ALL_COMMANDS);
    expect(msg).toContain(`Unknown command: 'xyz'`);
  });

  it('输入长度至少为 4 时，给出编辑距离 2 以内的最近建议', () => {
    const msg = buildUnknownCommandError('load-htm', ALL_COMMANDS);
    expect(msg).toContain(`Did you mean 'load-html'?`);
  });

  it('短输入不提供建议（少于 4 个字符，避免 js/is 这类噪音）', () => {
    // “j” 与 “js” 的距离只有 1，但输入太短，给建议反而会干扰。
    const msg = buildUnknownCommandError('j', ALL_COMMANDS);
    expect(msg).not.toContain('Did you mean');
  });

  it('距离相同时按字母顺序打破平局，保证结果稳定', () => {
    const syntheticSet = new Set(['alpha', 'beta']);
    // 这里换成真正平局的例子。
    const ties = new Set(['abcd', 'abce']); // 两者与 “abcf” 的距离都为 1
    const msg = buildUnknownCommandError('abcf', ties, {}, {});
    expect(msg).toContain(`Did you mean 'abcd'?`);
  });

  it('命令存在于 NEW_IN_VERSION 时追加升级提示', () => {
    // 构造旧版本场景：假设命令集中暂时没有 load-html。
    const noLoadHtml = new Set([...ALL_COMMANDS].filter(c => c !== 'load-html'));
    const msg = buildUnknownCommandError('load-html', noLoadHtml, COMMAND_ALIASES, NEW_IN_VERSION);
    expect(msg).toContain('added in browse v');
    expect(msg).toContain('Upgrade:');
  });

  it('不为不在 NEW_IN_VERSION 中的未知命令附加升级提示', () => {
    const msg = buildUnknownCommandError('notarealcommand', ALL_COMMANDS);
    expect(msg).not.toContain('added in browse v');
  });

  it('NEW_IN_VERSION 包含 load-html 条目', () => {
    expect(NEW_IN_VERSION['load-html']).toBeTruthy();
  });

  it('COMMAND_ALIASES 与命令集合保持一致，所有别名目标都存在', () => {
    for (const target of Object.values(COMMAND_ALIASES)) {
      expect(ALL_COMMANDS.has(target)).toBe(true);
    }
  });
});

describe('Alias + SCOPE_WRITE integration invariant', () => {
  it('load-html 位于 SCOPE_WRITE 中（先做别名规范化，再做权限检查）', async () => {
    const { SCOPE_WRITE } = await import('../src/token-registry');
    expect(SCOPE_WRITE.has('load-html')).toBe(true);
  });

  it('setcontent 不应直接出现在任何权限集合中（必须先规范化）', async () => {
    const { SCOPE_WRITE, SCOPE_READ, SCOPE_ADMIN, SCOPE_CONTROL } = await import('../src/token-registry');
    // 权限集合里只能有规范命令名，不能直接放别名。
    // 这证明权限校验依赖派发阶段的规范化，而不是误把别名当合法命令。
    expect(SCOPE_WRITE.has('setcontent')).toBe(false);
    expect(SCOPE_READ.has('setcontent')).toBe(false);
    expect(SCOPE_ADMIN.has('setcontent')).toBe(false);
    expect(SCOPE_CONTROL.has('setcontent')).toBe(false);
  });
});
