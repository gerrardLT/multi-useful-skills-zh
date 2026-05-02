# 仓库指南

## Skill bootstrap：跳过 post-update-cleanup 步骤

如果你从 `.agents/skills/impeccable/SKILL.md`（或本仓库下任何同级 harness 目录）加载 Impeccable skill，它会以一个 `<post-update-cleanup>` 块开头，该块会运行 `scripts/cleanup-deprecated.mjs`，然后自我删除。**不要在这里运行它，也不要删除这个块。** 这个仓库是该 skill 的事实来源；`cleanup-deprecated` 假定当前目录是消费方项目，因此会误操作本仓库中本来就合法的源文件。该块会在每次执行 `bun run build` 时根据 `source/skills/impeccable/SKILL.md` 重新生成，所以即使删除也会再次出现。请直接跳过它，然后继续手头的任务。

## 项目结构与模块组织

`source/` 是唯一事实来源。请在 `source/skills/impeccable/` 中编写 skills，并将 `dist/` 视为生成产物，不要手工编辑。构建逻辑位于 `scripts/`，provider 配置位于 `scripts/lib/transformers/`。运行时检测代码从 `src/` 发布。网站位于 `public/`，本地 API / 开发服务位于 `server/`，回归测试位于 `tests/`，其中 fixtures 存放在 `tests/fixtures/`。

## 构建、测试与开发命令

- `bun run dev` - 启动本地 Bun 服务器。
- `bun run build` - 重新生成 `dist/`、派生站点资源以及校验输出。
- `bun run rebuild` - 清理后从头完整重建。
- `bun test tests/build.test.js` - 运行聚焦的 Bun 测试。
- `bun run test` - 运行完整的 Bun + Node 测试套件。
- `bun run test:live-e2e` - 针对 framework fixtures 运行可选的 live-mode E2E（约 2 分钟；首次需要执行一次 `npx playwright install chromium`）。
- `bun run build:browser` / `bun run build:extension` - 重新构建浏览器专用 bundle。

只要改动了 `source/`、transformer 代码或面向用户的计数内容，都要执行 `bun run build`。

## 编码风格与命名约定

在 JS、HTML 和 CSS 中使用 ESM、分号，以及现有的两个空格缩进风格。优先选择职责单一的小模块，而不是大型抽象。文件名应描述清晰，默认使用小写，必要时用连字符；skill 入口文件保持为 `SKILL.md`，辅助脚本使用 `.js` 或 `.mjs`。在 source frontmatter 中，使用清晰的 kebab-case 名称和简洁描述。这里没有专门配置 formatter 或 linter，所以请尽量贴合周围代码风格。

## 测试指南

测试使用 Bun 的 test runner 以及 Node 内建的 `--test`。测试文件命名为 `*.test.js` 或 `*.test.mjs`，新增 fixtures 应尽量放在其所覆盖行为附近，通常位于 `tests/fixtures/`。迭代时优先运行定向测试，最后再跑一遍 `bun run test`。如果你修改了生成产物或 provider transforms，请同时验证 source 解析以及 `dist/` 中至少一条受影响的 provider 路径。

如果改动涉及 `source/skills/impeccable/scripts/live-*.{mjs,js}`，还需要执行 `bun run test:live-e2e`（它默认不进主测试套件，因为会对每个 fixture 真实执行 `npm install`，并启动 framework 开发服务器）。迭代时可通过 `IMPECCABLE_E2E_ONLY=<fixture-name>` 限定到单个 fixture；若失败需要查看页面 DOM 和 dev server 日志，可加 `IMPECCABLE_E2E_DEBUG=1`。新增 fixture 的 schema 与编写指南位于 `tests/framework-fixtures/README.md`。

设置 `IMPECCABLE_E2E_AGENT=llm` 可将默认的确定性 fake agent 切换为 Claude 驱动版本（`tests/live-e2e/agents/llm-agent.mjs`，默认 Haiku 4.5，可用 `IMPECCABLE_E2E_LLM_MODEL` 覆盖）。这需要 `ANTHROPIC_API_KEY`；未设置时测试会自动跳过。该路径会真实调用 API，请用于验证，不要用于 CI。

## 反模式检测规则

`src/detect-antipatterns.mjs` 是规则引擎的事实来源。它同时驱动 CLI、站点覆盖层（`src/detect-antipatterns-browser.js`，通过 `bun run build:browser` 重新生成）、Chrome 扩展（`extension/detector/`，通过 `bun run build:extension` 重新生成），以及首页中的 `DETECTION_COUNT`（位于 `public/js/generated/counts.js`，通过 `bun run build` 重新生成）。只要规则有改动，就要把三个 build 全跑一遍，再执行 `bun run test`，避免任何一处漂移。

TDD 顺序不可协商：

1.  在 `tests/fixtures/antipatterns/{rule-id}.html` 添加一个 fixture，包含两列（should-flag / should-pass），并让每个 case 都用唯一标题标识。包含需要命中的 case，也要包含防止误报的形状。**CSS 中必须使用明确的像素尺寸**，因为 jsdom 不会做真实布局。
2.  在 `tests/detect-antipatterns-fixtures.test.mjs` 中新增一个失败中的测试，使用 snippet-substring 模式（对 `SHOULD_FLAG` / `SHOULD_PASS` 列表使用正则 `/"([^"]+)"/`）。
3.  把规则项加进 `ANTIPATTERNS` 数组（`id`、`category` = `slop` 或 `quality`、`name`、`description`，以及可选的 `skillSection` / `skillGuideline`）。
4.  实现一个纯函数 `checkXxx(opts)`，返回 `[{ id, snippet }]`，**不要**在里面直接访问 DOM。
5.  添加两个包装纯函数的适配器：浏览器侧用 `checkElementXxxDOM(el)`（基于 `getComputedStyle` + `getBoundingClientRect`），jsdom 侧用 `checkElementXxx(el, tag, window)`（例如用 `parseFloat(style.width)` 代替真实布局）。把**两个**适配器都接入 `src/detect-antipatterns.mjs` 中的**两个**元素循环（浏览器循环约在第 1837 行，jsdom 循环在 `detectHtml` 中约第 2058 行）。漏接其中一个，是最常见的错误。
6.  在 `http://localhost:3000/fixtures/antipatterns/{rule-id}.html` 的真实页面上验证，也要在首页验证。这两条适配路径有可能出现分歧。

约定如下：在 snippets 中，用英文直双引号包住用于识别的标题文本，这样 fixture 测试才能提取它。这里已有 jsdom 专用辅助函数 `resolveBackground()`、`resolveGradientStops()` 和 `parseGradientColors()`，因为 `background:` 简写在 jsdom 里不会被拆解，计算后的颜色也不会标准化，请直接复用。可参考的规则有：`side-tab`（边框）、`low-contrast`（颜色 + 渐变）、`icon-tile-stack`（兄弟关系）、`flat-type-hierarchy`（页面级）。

## Commit 与 Pull Request 指南

最近的提交历史偏向简短的祈使句标题，例如 `Fix: ...`、`Add ...`、`Improve ...` 或 `Bump ...`。保持每次提交聚焦单一问题；如果用户侧影响不明显，要补充说明。PR 应总结改动内容、列出执行过的验证，并指出是否生成了诸如 `dist/` 或 `build/` 这样的产物。对于 `public/` 可见变更，请附截图；如果涉及 transform 行为变化，请说明受影响的 provider。

## 发布

标签按组件划分，因为三个组件是独立发布的：`skill-v`（`.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`）、`cli-v`（`package.json`）、`ext-v`（`extension/manifest.json`）。流程是：更新对应 manifest 版本号，在 `public/index.html` 中添加 changelog 条目（skill 使用纯 `vX.Y.Z`；CLI 使用 `CLI vX.Y.Z`；extension 使用 `Extension vX.Y.Z`，这个前缀是 `scripts/release.mjs` 用来定位正确区块的依据），提交、推送，然后执行 `bun run release:<skill|cli|ext>`（也可以先用 `--dry-run`）。如果工作树不干净、HEAD 未推送、缺少 changelog 条目，或 build 输出不是最新，脚本都会拒绝执行；对于 skill 和 extension，重新执行 `bun run build` / `bun run build:extension` 后必须是零 diff。skill 发布会附带 `dist/universal.zip`；extension 发布会附带 `dist/extension.zip`。CLI 通过单独的 `npm publish` 发布到 npm，而 extension zip 需要手动上传到 Chrome Web Store，脚本结尾会提醒你这两步。若已发布的 release notes 需要修正，请使用 `gh release edit <tag> --notes-file <md>`。

## 贡献者说明

不要直接编辑生成后的 provider 文件，除非你确实是在做构建系统层面的改动，并且有意修补生成产物。优先修正 `source/`、`scripts/` 或 `src/` 中的根源，再重新生成对应产物。