/**
 * cookie-picker 路由处理器测试。
 *
 * 直接用 mock 的 BrowserManager 对象测试 HTTP 胶水层。
 * 主要覆盖鉴权（一次性 code 兑换、session cookie、Bearer token）、
 * CORS 头，以及 JSON 响应格式。
 */

import { describe, test, expect } from 'bun:test';
import { handleCookiePickerRoute, generatePickerCode, hasActivePicker } from '../src/cookie-picker-routes';

// ─── Mock BrowserManager ──────────────────────────────────────

function mockBrowserManager() {
  const addedCookies: any[] = [];
  const clearedDomains: string[] = [];
  return {
    bm: {
      getPage: () => ({
        context: () => ({
          addCookies: (cookies: any[]) => { addedCookies.push(...cookies); },
          clearCookies: (opts: { domain: string }) => { clearedDomains.push(opts.domain); },
        }),
      }),
    } as any,
    addedCookies,
    clearedDomains,
  };
}

function makeUrl(path: string, port = 9470): URL {
  return new URL(`http://127.0.0.1:${port}${path}`);
}

function makeReq(method: string, body?: any, headers?: Record<string, string>): Request {
  const opts: RequestInit = { method, headers: { ...headers } };
  if (body) {
    opts.body = JSON.stringify(body);
    (opts.headers as any)['Content-Type'] = 'application/json';
  }
  return new Request('http://127.0.0.1:9470', opts);
}

/** 辅助函数：兑换一次性 code，并返回 session cookie 值。 */
async function getSessionCookie(bm: any, authToken: string): Promise<string> {
  const code = generatePickerCode();
  const url = makeUrl(`/cookie-picker?code=${code}`);
  const req = new Request('http://127.0.0.1:9470', { method: 'GET' });
  const res = await handleCookiePickerRoute(url, req, bm, authToken);
  expect(res.status).toBe(302);
  const setCookie = res.headers.get('Set-Cookie') || '';
  const match = setCookie.match(/gstack_picker=([^;]+)/);
  expect(match).not.toBeNull();
  return match![1];
}

// ─── Tests ──────────────────────────────────────────────────────

describe('cookie-picker-routes', () => {
  describe('CORS', () => {
    test('OPTIONS 会返回 204 和正确的 CORS 头', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/browsers');
      const req = new Request('http://127.0.0.1:9470', { method: 'OPTIONS' });

      const res = await handleCookiePickerRoute(url, req, bm);

      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://127.0.0.1:9470');
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    test('JSON 响应会带上包含端口的正确 CORS origin', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/browsers', 9450);
      const req = new Request('http://127.0.0.1:9450', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://127.0.0.1:9450');
    });
  });

  describe('JSON responses (with auth)', () => {
    test('GET /cookie-picker/browsers 返回 JSON', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/browsers');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      const body = await res.json();
      expect(body).toHaveProperty('browsers');
      expect(Array.isArray(body.browsers)).toBe(true);
    });

    test('GET /cookie-picker/domains 缺少 browser 参数时返回 JSON 错误', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/domains');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(400);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      const body = await res.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('code', 'missing_param');
    });

    test('POST /cookie-picker/import 在 JSON 非法时返回 JSON 错误', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/import');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'POST',
        body: 'not json',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(400);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      const body = await res.json();
      expect(body.code).toBe('bad_request');
    });

    test('POST /cookie-picker/import 缺少 browser 字段时返回 JSON 错误', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/import');
      const req = makeReq('POST', { domains: ['.example.com'] }, { 'Authorization': 'Bearer test-token' });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('missing_param');
    });

    test('POST /cookie-picker/import 缺少 domains 时返回 JSON 错误', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/import');
      const req = makeReq('POST', { browser: 'Chrome' }, { 'Authorization': 'Bearer test-token' });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('missing_param');
    });

    test('POST /cookie-picker/remove 在 JSON 非法时返回 JSON 错误', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/remove');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'POST',
        body: '{bad',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(400);
      expect(res.headers.get('Content-Type')).toBe('application/json');
    });

    test('POST /cookie-picker/remove 缺少 domains 时返回 JSON 错误', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/remove');
      const req = makeReq('POST', {}, { 'Authorization': 'Bearer test-token' });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('missing_param');
    });

    test('GET /cookie-picker/imported 返回带域名列表的 JSON', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/imported');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      const body = await res.json();
      expect(body).toHaveProperty('domains');
      expect(body).toHaveProperty('totalDomains');
      expect(body).toHaveProperty('totalCookies');
    });
  });

  describe('routing', () => {
    test('未知路径返回 404（已鉴权）', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/nonexistent');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(404);
    });
  });

  describe('one-time code exchange', () => {
    test('有效 code 会返回带 session cookie 的 302 重定向', async () => {
      const { bm } = mockBrowserManager();
      const code = generatePickerCode();
      const url = makeUrl(`/cookie-picker?code=${code}`);
      const req = new Request('http://127.0.0.1:9470', { method: 'GET' });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toBe('/cookie-picker');
      const setCookie = res.headers.get('Set-Cookie') || '';
      expect(setCookie).toContain('gstack_picker=');
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('SameSite=Strict');
      expect(setCookie).toContain('Path=/cookie-picker');
      expect(setCookie).toContain('Max-Age=3600');
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });

    test('code 不能重复使用', async () => {
      const { bm } = mockBrowserManager();
      const code = generatePickerCode();
      const url = makeUrl(`/cookie-picker?code=${code}`);

      // 第一次使用：应成功
      const req1 = new Request('http://127.0.0.1:9470', { method: 'GET' });
      const res1 = await handleCookiePickerRoute(url, req1, bm, 'test-token');
      expect(res1.status).toBe(302);

      // 第二次使用：应被拒绝
      const req2 = new Request('http://127.0.0.1:9470', { method: 'GET' });
      const res2 = await handleCookiePickerRoute(url, req2, bm, 'test-token');
      expect(res2.status).toBe(403);
    });

    test('无效 code 返回 403', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker?code=not-a-valid-code');
      const req = new Request('http://127.0.0.1:9470', { method: 'GET' });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(403);
    });

    test('GET /cookie-picker 在缺少 code 和 session 时返回 403', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker');
      const req = new Request('http://127.0.0.1:9470', { method: 'GET' });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(403);
    });
  });

  describe('active picker tracking', () => {
    test('一次性 code 在被消费前会让 picker 保持激活', async () => {
      const realNow = Date.now;
      Date.now = () => realNow() + 3_700_000;
      try {
        expect(hasActivePicker()).toBe(false); // clears any stale state from prior tests
      } finally {
        Date.now = realNow;
      }

      const { bm } = mockBrowserManager();
      const code = generatePickerCode();
      expect(hasActivePicker()).toBe(true);

      const res = await handleCookiePickerRoute(
        makeUrl(`/cookie-picker?code=${code}`),
        new Request('http://127.0.0.1:9470', { method: 'GET' }),
        bm,
        'test-token',
      );

      expect(res.status).toBe(302);
      expect(hasActivePicker()).toBe(true); // session is now active
    });

    test('无效 session 探测清理过期状态后，picker 会变为未激活', async () => {
      const { bm } = mockBrowserManager();
      const session = await getSessionCookie(bm, 'test-token');
      expect(hasActivePicker()).toBe(true);

      const realNow = Date.now;
      Date.now = () => realNow() + 3_700_000;
      try {
        const res = await handleCookiePickerRoute(
          makeUrl('/cookie-picker'),
          new Request('http://127.0.0.1:9470', {
            method: 'GET',
            headers: { 'Cookie': `gstack_picker=${session}` },
          }),
          bm,
          'test-token',
        );

        expect(res.status).toBe(403);
        expect(hasActivePicker()).toBe(false);
      } finally {
        Date.now = realNow;
      }
    });
  });

  describe('session cookie auth', () => {
    test('有效 session cookie 可以访问 HTML', async () => {
      const { bm } = mockBrowserManager();
      const session = await getSessionCookie(bm, 'test-token');

      const url = makeUrl('/cookie-picker');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'GET',
        headers: { 'Cookie': `gstack_picker=${session}` },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('text/html');
    });

    test('HTML 响应不应包含鉴权 token', async () => {
      const { bm } = mockBrowserManager();
      const authToken = 'super-secret-auth-token-12345';
      const session = await getSessionCookie(bm, authToken);

      const url = makeUrl('/cookie-picker');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'GET',
        headers: { 'Cookie': `gstack_picker=${session}` },
      });

      const res = await handleCookiePickerRoute(url, req, bm, authToken);
      const html = await res.text();

      expect(html).not.toContain(authToken);
      expect(html).not.toContain('AUTH_TOKEN');
    });

    test('数据路由接受 session cookie', async () => {
      const { bm } = mockBrowserManager();
      const session = await getSessionCookie(bm, 'test-token');

      const url = makeUrl('/cookie-picker/browsers');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'GET',
        headers: { 'Cookie': `gstack_picker=${session}` },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      const body = await res.json();
      expect(body).toHaveProperty('browsers');
    });

    test('无效 session cookie 访问 HTML 时返回 403', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'GET',
        headers: { 'Cookie': 'gstack_picker=fake-session' },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-token');

      expect(res.status).toBe(403);
    });
  });

  describe('auth gate security', () => {
    test('GET /cookie-picker/browsers 在未鉴权时返回 401', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/browsers');
      const req = new Request('http://127.0.0.1:9470', { method: 'GET' });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-secret-token');

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
    });

    test('POST /cookie-picker/import 在未鉴权时返回 401', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/import');
      const req = makeReq('POST', { browser: 'Chrome', domains: ['.example.com'] });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-secret-token');

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
    });

    test('GET /cookie-picker/browsers 在有效 Bearer 鉴权下可正常工作', async () => {
      const { bm } = mockBrowserManager();
      const url = makeUrl('/cookie-picker/browsers');
      const req = new Request('http://127.0.0.1:9470', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-secret-token' },
      });

      const res = await handleCookiePickerRoute(url, req, bm, 'test-secret-token');

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      const body = await res.json();
      expect(body).toHaveProperty('browsers');
    });
  });
});
