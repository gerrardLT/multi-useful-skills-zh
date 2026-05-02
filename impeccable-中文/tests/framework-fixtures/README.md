# Framework fixtures

用于在不同框架约定下验证 live mode 的代表性项目形态。每个 fixture 都是一小棵目录树，测试 harness 会把它复制进一个临时 git 仓库，然后在其上驱动 `live-inject.mjs`、`live-wrap.mjs`、`live-accept.mjs` 和 `is-generated.mjs`。

Fixtures 还可以选择加入 **runtime E2E** 流程，也就是实际安装依赖、启动框架 dev server，再用 Playwright 浏览器验证 live 握手。详见下文 `runtime` block。

## 目录结构

```text
<fixture>/
  files/              测试复制到 tmp 中的项目树
  gitignore.txt       在 tmp 中会变成 .gitignore（这样我们就能把真实文件提交在这里）
  fixture.json        测试会消费的配置 + 预期结果
```

`fixture.json` schema：

```json
{
  "name": "human-readable label",
  "config": { ...contents for live-inject.mjs config.json ... },
  "sourceFiles": ["paths that is-generated should classify as source (false)"],
  "generatedFiles": ["paths that is-generated should classify as generated (true)"],
  "wrapCases": [
    {
      "name": "description",
      "args": { "classes": "...", "tag": "...", "elementId": "..." },
      "expectedFile": "where wrap should land (relative to fixture root)",
      "expectsError": "optional error code, e.g. element_not_in_source"
    }
  ],
  "csp": {
    "shape": "shared-helper | inline-headers | middleware | meta-tag | null",
    "signals": ["diagnostic hints - paths where CSP was detected"],
    "patchTarget": "which file the agent should modify",
    "expectedAfter": "filename of the reference post-patch output inside this fixture"
  },
  "runtime": {
    "styling": "plain-css | tailwind-v4 | styled-components | ...",
    "install": ["npm", "install"],
    "devCommand": ["npm", "run", "dev"],
    "scheme": "http",
    "ignoreHTTPSErrors": false,
    "readyPattern": "Local:\\s+https?://[^:]+:(\\d+)",
    "readyTimeoutMs": 120000,
    "pickSelector": "h1.hero-title",
    "preActions": [
      { "type": "click", "selector": "[data-testid='open-modal']" },
      { "type": "goto",  "path": "/about" }
    ],
    "reloadProbe": {
      "preActions": [{ "type": "click", "selector": "[data-testid='open-modal']" }],
      "expectSelector": "h1.hero-title"
    },
    "probe": {
      "expectLiveInit": true,
      "expectConsoleClean": true
    }
  }
}
```

`expectedAfter` 文件与 `fixture.json` 放在同一层（不在 `files/` 里），它是给人和 agent 审阅的补丁后参考结果，测试本身不会自动把这个 patch 应用进去。

`runtime` block 是可选的。没有它的 fixtures 只跑静态单元检查（is-generated、inject、wrap、csp-detect）。**带有**它的 fixtures 还会额外跑 `tests/live-e2e.test.mjs` 中的 E2E 套件（`bun run test:live-e2e`），流程如下：

1. 把 fixture stage 到一个临时仓库。
2. 运行 `runtime.install` 安装真实依赖。
3. 启动 `live-server.mjs --background`，再对它运行 `live-inject.mjs --port`。
4. 启动 `runtime.devCommand`，并用 `runtime.readyPattern` 从 stdout 中抓出端口（第一个捕获组必须是端口号）。
5. 用 Playwright Chromium 打开 dev URL，并在 `runtime.readyTimeoutMs` 内断言 `window.__IMPECCABLE_LIVE_INIT__ === true`（这是浏览器侧握手的判定信号）。
6. 清理一切（关闭 Playwright、向 dev server 发 SIGTERM、停止 live-server、删除 tmp）。

## 当前已有 fixtures

| Fixture | Shape |
|---|---|
| `vite-react/` | 被跟踪的 `index.html` shell + `src/App.jsx`。向 shell 注入。 |
| `nextjs-app/` | 以 `app/layout.tsx` 作为 JSX 注入目标（commentSyntax 为 `jsx`）。 |
| `astro/` | 以 `src/layouts/Layout.astro` 作为注入目标。使用 HTML comments。 |
| `sveltekit/` | `src/app.html` shell + `src/routes/+page.svelte`。 |
| `multipage-with-generator/` | `src/` 被跟踪，`dist/` 被 gitignore。用于验证 is-generated guard 和 `element_not_in_source` fallback。 |
| `nextjs-turborepo/` | 带共享 CSP helper（`createBaseNextConfig`）的 monorepo。CSP shape 为 `append-arrays`。 |
| `nextjs-inline-csp/` | app 级别的 `next.config.js`，其中直接写了字面 CSP 字符串。CSP shape 为 `append-string`。 |
| `sveltekit-csp/` | `svelte.config.js` 中的 SvelteKit `kit.csp.directives`。CSP shape 为 `append-arrays`。 |
| `nuxt-csp/` | `nuxt.config.ts` 中通过 `routeRules` 写入字面 CSP header。CSP shape 为 `append-string`。 |

新增 fixture 的方式就是复制一个现有目录，替换文件，再更新 `fixture.json`。
