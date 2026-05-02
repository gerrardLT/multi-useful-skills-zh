/**
 * 只读 SSE 会话 cookie 模块的单元测试。
 *
 * 覆盖注册表生命周期（mint / validate / expire）、cookie 标志位约束
 *（HttpOnly、SameSite=Strict、不带 Secure）、token 熵，以及
 * scope 必须保持隐式这一点（注册表不能留下任何跨端点痕迹，避免把
 * cookie 升级成 scoped token）。
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import {
  mintSseSessionToken, validateSseSessionToken, extractSseCookie,
  buildSseSetCookie, buildSseClearCookie, SSE_COOKIE_NAME,
  __resetSseSessions,
} from '../src/sse-session-cookie';

const MODULE_SRC = fs.readFileSync(
  path.join(import.meta.dir, '../src/sse-session-cookie.ts'), 'utf-8'
);

beforeEach(() => __resetSseSessions());

describe('SSE session cookie: mint + validate', () => {
  test('mint returns a token and an expiry', () => {
    const { token, expiresAt } = mintSseSessionToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);
    expect(expiresAt).toBeGreaterThan(Date.now());
  });

  test('mint uses 32 random bytes (256-bit entropy)', () => {
    // 32 字节做 base64url 编码后是 43 个字符（无 padding）。
    const { token } = mintSseSessionToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  test('two mint calls produce different tokens', () => {
    const a = mintSseSessionToken();
    const b = mintSseSessionToken();
    expect(a.token).not.toBe(b.token);
  });

  test('validate returns true for a just-minted token', () => {
    const { token } = mintSseSessionToken();
    expect(validateSseSessionToken(token)).toBe(true);
  });

  test('validate returns false for an unknown token', () => {
    expect(validateSseSessionToken('not-a-real-token')).toBe(false);
  });

  test('validate returns false for null/undefined/empty', () => {
    expect(validateSseSessionToken(null)).toBe(false);
    expect(validateSseSessionToken(undefined)).toBe(false);
    expect(validateSseSessionToken('')).toBe(false);
  });
});

describe('SSE session cookie: TTL enforcement', () => {
  test('TTL is 30 minutes', () => {
    // 通过源码断言；真实常量是模块私有的。
    expect(MODULE_SRC).toContain('const TTL_MS = 30 * 60 * 1000');
  });

  test('a token with artificially rewound expiry is rejected', () => {
    // 先 mint 一个 token，再 monkey-patch Date.now，
    // 模拟时间快进 31 分钟。
    const { token, expiresAt } = mintSseSessionToken();
    const originalNow = Date.now;
    try {
      Date.now = () => expiresAt + 1;
      expect(validateSseSessionToken(token)).toBe(false);
    } finally {
      Date.now = originalNow;
    }
  });
});

describe('SSE session cookie: cookie flag invariants', () => {
  test('Set-Cookie is HttpOnly', () => {
    const { token } = mintSseSessionToken();
    expect(buildSseSetCookie(token)).toContain('HttpOnly');
  });

  test('Set-Cookie is SameSite=Strict', () => {
    const { token } = mintSseSessionToken();
    expect(buildSseSetCookie(token)).toContain('SameSite=Strict');
  });

  test('Set-Cookie includes the token value', () => {
    const { token } = mintSseSessionToken();
    expect(buildSseSetCookie(token)).toContain(`${SSE_COOKIE_NAME}=${token}`);
  });

  test('Set-Cookie Max-Age matches TTL', () => {
    const { token } = mintSseSessionToken();
    // 30 分钟 = 1800 秒
    expect(buildSseSetCookie(token)).toContain('Max-Age=1800');
  });

  test('Set-Cookie does NOT set Secure (local HTTP daemon)', () => {
    const { token } = mintSseSessionToken();
    // 如果加上 Secure，浏览器就无法再通过 HTTP 把 cookie
    // 发回 127.0.0.1 本地守护进程。将来如果 gstack 切到 HTTPS，
    // 再考虑加 Secure。
    expect(buildSseSetCookie(token)).not.toContain('Secure');
  });

  test('Clear-Cookie has Max-Age=0', () => {
    expect(buildSseClearCookie()).toContain('Max-Age=0');
    expect(buildSseClearCookie()).toContain('HttpOnly');
  });
});

describe('SSE session cookie: extract from request', () => {
  function mockReq(cookieHeader: string | null): Request {
    const headers = new Headers();
    if (cookieHeader !== null) headers.set('cookie', cookieHeader);
    return new Request('http://127.0.0.1/activity/stream', { headers });
  }

  test('extracts the token when cookie is present', () => {
    const req = mockReq(`${SSE_COOKIE_NAME}=abc123`);
    expect(extractSseCookie(req)).toBe('abc123');
  });

  test('returns null when no cookie header', () => {
    const req = mockReq(null);
    expect(extractSseCookie(req)).toBeNull();
  });

  test('returns null when cookie header has no gstack_sse', () => {
    const req = mockReq('other=x; unrelated=y');
    expect(extractSseCookie(req)).toBeNull();
  });

  test('extracts gstack_sse from a multi-cookie header', () => {
    const req = mockReq(`other=x; ${SSE_COOKIE_NAME}=real-token; trailing=y`);
    expect(extractSseCookie(req)).toBe('real-token');
  });

  test('handles tokens with base64url padding-like chars', () => {
    // 真实 token 只会包含 A-Z、a-z、0-9、_、-
    const req = mockReq(`${SSE_COOKIE_NAME}=AbCd-_xyz`);
    expect(extractSseCookie(req)).toBe('AbCd-_xyz');
  });
});

describe('SSE session cookie: scope isolation (prior learning cookie-picker-auth-isolation)', () => {
  test('the module exposes ONLY view-only functions, no scoped-token hooks', () => {
    // 这是契约保护：如果未来有人把 SSE session token
    // 接进 scoped token 体系（比如导出一个 helper，把它注册到主 token registry），
    // 那么一旦 cookie 泄漏，就可能执行 /command。
    // 因此这个模块绝不能依赖 token-registry。
    expect(MODULE_SRC).not.toContain("from './token-registry'");
    expect(MODULE_SRC).not.toContain('createToken');
    expect(MODULE_SRC).not.toContain('initRegistry');
  });
});
