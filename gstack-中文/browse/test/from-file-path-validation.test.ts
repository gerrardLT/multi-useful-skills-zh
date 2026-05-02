/**
 * 针对 `--from-file` 快捷参数的源码级护栏测试。
 *
 * 背景：`load-html <file>`（write-commands.ts）和 `pdf <url>`
 *（meta-commands.ts）都支持 `--from-file <payload.json>` 这个快捷入口，
 * 用来读取携带内联内容的 JSON 负载（HTML 正文 / PDF 选项）。
 * 直接的 `load-html <file>` 路径会把调用方给出的文件路径都走一遍
 * `validateReadPath()`，从而把读取限制在 `SAFE_DIRECTORIES` 内。
 * 但历史上 `--from-file` 路径曾跳过这个校验，形成了一个一致性漏洞：
 * 如果 MCP 调用方能控制 payload 路径，就可能通过 `--from-file`
 * 绕过 safe-dirs 策略。
 *
 * 这个测试会直接检查源码，确保两个 `--from-file` 分支都会在
 * `fs.readFileSync` 之前调用 `validateReadPath`。模式参考
 * postgres-engine.test.ts 和 pglite-search-timeout.test.ts。
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dir, '..', 'src');
const WRITE_SRC = readFileSync(join(ROOT, 'write-commands.ts'), 'utf-8');
const META_SRC  = readFileSync(join(ROOT, 'meta-commands.ts'), 'utf-8');

function stripComments(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/[^\n]*/g, '$1');
}

describe('--from-file path validation parity', () => {
  test('load-html --from-file validates payload path before reading', () => {
    const stripped = stripComments(WRITE_SRC);
    // 抓取 `--from-file` 这个分支的代码片段。
    const idx = stripped.indexOf("'--from-file'");
    expect(idx).toBeGreaterThan(-1);
    const fromFileBranch = stripped.slice(idx, idx + 1200);

    // `validateReadPath` 必须出现在该分支里的 `readFileSync` 之前。
    const vIdx = fromFileBranch.indexOf('validateReadPath');
    const rIdx = fromFileBranch.indexOf('readFileSync');
    expect(vIdx).toBeGreaterThan(-1);
    expect(rIdx).toBeGreaterThan(-1);
    expect(vIdx).toBeLessThan(rIdx);
  });

  test('pdf --from-file validates payload path before reading', () => {
    const stripped = stripComments(META_SRC);
    const idx = stripped.indexOf('function parsePdfFromFile');
    expect(idx).toBeGreaterThan(-1);
    const fnBody = stripped.slice(idx, idx + 1200);

    const vIdx = fnBody.indexOf('validateReadPath');
    const rIdx = fnBody.indexOf('readFileSync');
    expect(vIdx).toBeGreaterThan(-1);
    expect(rIdx).toBeGreaterThan(-1);
    expect(vIdx).toBeLessThan(rIdx);
  });

  test('both sites reference SAFE_DIRECTORIES in the error message', () => {
    // 错误消息形状也要保持一致，这样运维和 agent 才能看到统一输出。
    const write = stripComments(WRITE_SRC);
    const meta = stripComments(META_SRC);
    // load-html --from-file 的报错
    expect(write).toMatch(/load-html: --from-file [\s\S]{0,80}SAFE_DIRECTORIES/);
    // pdf --from-file 的报错
    expect(meta).toMatch(/pdf: --from-file [\s\S]{0,80}SAFE_DIRECTORIES/);
  });
});
