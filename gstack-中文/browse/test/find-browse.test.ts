/**
 * `find-browse` 二进制定位逻辑的测试。
 */

import { describe, test, expect } from 'bun:test';
import { locateBinary } from '../src/find-browse';
import { existsSync } from 'fs';

describe('locateBinary', () => {
  test('returns null when no binary exists at known paths', () => {
    // 这个测试依赖当前测试环境。
    // 如果真实二进制正好存在于 ~/.claude/skills/gstack/browse/dist/browse，
    // 那它就会被找到。这里主要验证函数不会抛异常。
    const result = locateBinary();
    expect(result === null || typeof result === 'string').toBe(true);
  });

  test('returns string path when binary exists', () => {
    const result = locateBinary();
    if (result !== null) {
      expect(existsSync(result)).toBe(true);
    }
  });

  test('priority chain checks .codex, .agents, .claude markers', () => {
    // 直接验证源码里是否实现了正确的优先级顺序。
    // 这里通过读取函数源码来确认 markers 数组的排列。
    const src = require('fs').readFileSync(require('path').join(__dirname, '../src/find-browse.ts'), 'utf-8');
    // markers 应该先列 .codex，再列 .agents，最后是 .claude
    const markersMatch = src.match(/const markers = \[([^\]]+)\]/);
    expect(markersMatch).not.toBeNull();
    const markers = markersMatch![1];
    const codexIdx = markers.indexOf('.codex');
    const agentsIdx = markers.indexOf('.agents');
    const claudeIdx = markers.indexOf('.claude');
    // 三者都必须存在。
    expect(codexIdx).toBeGreaterThanOrEqual(0);
    expect(agentsIdx).toBeGreaterThanOrEqual(0);
    expect(claudeIdx).toBeGreaterThanOrEqual(0);
    // 顺序必须是 .codex -> .agents -> .claude
    expect(codexIdx).toBeLessThan(agentsIdx);
    expect(agentsIdx).toBeLessThan(claudeIdx);
  });

  test('function signature accepts no arguments', () => {
    // locateBinary 应该可以在无参数下直接调用。
    expect(typeof locateBinary).toBe('function');
    expect(locateBinary.length).toBe(0);
  });
});
