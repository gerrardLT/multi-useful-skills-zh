/**
 * 欢迎页 E2E 测试：验证侧边栏箭头提示和关键元素
 * 在通过 HTTP 提供欢迎页时都能正确渲染。
 *
 * 测试会启动一个真实的 `Bun.serve`，抓取 HTML，再解析它，
 * 确认侧边栏提示箭头、功能卡片和品牌元素都存在。
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';

const WELCOME_PATH = path.join(import.meta.dir, '../src/welcome.html');
const welcomeHtml = fs.readFileSync(WELCOME_PATH, 'utf-8');

let server: ReturnType<typeof Bun.serve>;
let baseUrl: string;

beforeAll(() => {
  // 按 browse 服务的真实方式把欢迎页提供出来。
  server = Bun.serve({
    port: 0,
    hostname: '127.0.0.1',
    fetch() {
      return new Response(welcomeHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    },
  });
  baseUrl = `http://127.0.0.1:${server.port}`;
});

afterAll(() => {
  server?.stop();
});

describe('welcome page served via HTTP', () => {
  let html: string;

  beforeAll(async () => {
    const resp = await fetch(baseUrl);
    expect(resp.ok).toBe(true);
    expect(resp.headers.get('content-type')).toContain('text/html');
    html = await resp.text();
  });

  // 侧边栏箭头提示（这个测试最初就是为了覆盖这里的 bug）

  test('sidebar prompt arrow is present and visible', () => {
    // 必须存在 class 为 "arrow-right" 的箭头元素。
    expect(html).toContain('class="arrow-right"');
    // 它应该包含右箭头字符（→ = &#x2192;）。
    expect(html).toContain('&#x2192;');
  });

  test('sidebar prompt container is visible by default (no hidden class)', () => {
    // 初始加载时，提示容器不应该带有 hidden class。
    expect(html).toContain('id="sidebar-prompt"');
    expect(html).not.toMatch(/class="sidebar-prompt[^"]*hidden/);
  });

  test('sidebar prompt has instruction text', () => {
    expect(html).toContain('Open the sidebar to get started');
    expect(html).toContain('puzzle piece');
  });

  test('sidebar prompt is positioned on the right side', () => {
    // CSS 应该把它放在页面右侧。
    expect(html).toMatch(/\.sidebar-prompt\s*\{[^}]*right:\s*\d+px/);
  });

  test('arrow has nudge animation', () => {
    expect(html).toContain('@keyframes nudge');
    expect(html).toMatch(/\.arrow-right\s*\{[^}]*animation:\s*nudge/);
  });

  // 品牌元素

  test('has GStack Browser title and branding', () => {
    expect(html).toContain('<title>GStack Browser</title>');
    expect(html).toContain('GStack Browser');
  });

  test('has amber dot logo', () => {
    expect(html).toContain('class="logo-dot"');
    expect(html).toContain('class="logo-text"');
  });

  // 功能卡片

  test('has all six feature cards', () => {
    expect(html).toContain('Talk to the sidebar');
    expect(html).toContain('Or use your main agent');
    expect(html).toContain('Import your cookies');
    expect(html).toContain('Clean up any page');
    expect(html).toContain('Smart screenshots');
    expect(html).toContain('Modify any page');
  });

  // Try it 区块

  test('has try-it section with example prompts', () => {
    expect(html).toContain('Try it now');
    expect(html).toContain('news.ycombinator.com');
  });

  // 扩展检测后的自动隐藏行为

  test('hides sidebar prompt when extension is detected', () => {
    // 应该监听 extension-ready 事件。
    expect(html).toContain("'gstack-extension-ready'");
    // 应该给 sidebar-prompt 添加 hidden class。
    expect(html).toContain("classList.add('hidden')");
  });

  test('does NOT auto-hide based on extension detection alone', () => {
    // 箭头只应在侧边栏真正打开时隐藏，
    // 不能因为 content script 加载就直接隐藏。
    expect(html).not.toContain('gstack-status-pill');
    expect(html).not.toContain('checkPill');
  });

  // 深色主题

  test('uses dark theme colors', () => {
    expect(html).toContain('--base: #0C0C0C');
    expect(html).toContain('--surface: #141414');
  });

  // 左对齐文本

  test('text is left-aligned, not centered', () => {
    expect(html).not.toMatch(/text-align:\s*center/);
  });

  // 页脚

  test('has footer with attribution', () => {
    expect(html).toContain('Garry Tan');
    expect(html).toContain('github.com/garrytan/gstack');
  });
});
