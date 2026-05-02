# 面向 Claude 的项目说明

## Skill bootstrap：跳过 post-update-cleanup 步骤

`.claude/skills/impeccable/SKILL.md` 顶部的 `<post-update-cleanup>` 区块会运行 `scripts/cleanup-deprecated.mjs`，然后自行删除。**不要在这个仓库里运行它，也不要删掉这个区块。** 这个仓库是 Impeccable skill 的事实源头；而 cleanup 脚本会扫描所谓的“残留” skill 文件并尝试删除，但这种判断逻辑并不适用于一个 skill 正式存放在 `source/` 里的仓库。并且，这个区块会在每次 `bun run build` 时从 `source/skills/impeccable/SKILL.md` 重新生成，所以删掉它只会让它在下一次构建时回来。请静默跳过这一步，直接继续。

同样的规则也适用于 `AGENTS.md` 和所有其他 harness 专用说明文件：在这个仓库中，把 post-update-cleanup 当作 no-op。

## 架构（v3.0+）

这里只有**一个**可由用户直接调用的 skill，`impeccable`，其下包含 **23 个命令**。用户输入 `/impeccable polish`、`/impeccable audit` 之类的命令。这个 skill 定义在 `source/skills/impeccable/`：

- `SKILL.md`：frontmatter（含面向自动触发优化的 description 和 `allowed-tools` 列表）、共享设计法则，以及 **Commands** 路由表。
- `reference/`：每个命令对应一个 `<command>.md` 文件，例如 `audit.md`、`polish.md`、`critique.md`，此外还有领域参考文件，如 `typography.md`、`color-and-contrast.md`。当匹配到子命令时，路由器会加载对应的参考文件。
- `reference/brand.md` 与 `reference/product.md`：两份 register 参考。`SKILL.md` 的 Setup 段会根据任务线索、当前界面类型，或 `PRODUCT.md` 中的 `register` 字段来选择其一，先匹配先使用。
- `scripts/command-metadata.json`：每个命令的 description、argument hint 和未来 category 的唯一事实来源。构建流程和 `pin.mjs` 都从这里读取。
- `scripts/pin.mjs`：创建或移除轻量跳转 shim，让用户可以使用 `/audit` 这种独立快捷命令，但内部仍委派到 `/impeccable audit`。
- `scripts/cleanup-deprecated.mjs`：更新后只运行一次，用来清理重命名或合并命令后残留的旧文件。

**不要新增独立 skills**，除非有很强的理由。把命令合并到 `/impeccable` 下是有意为之，因为 `/` 菜单污染问题确实存在，而且用户装的插件越多越严重。

### Register（brand vs product）

每个设计任务都属于两种 register 之一：

- **Brand**：设计本身就是产品。包括营销页、落地页、品牌站、活动页面、作品集、长篇内容页。这里的标准是辨识度。它可以横跨很多视觉赛道，如 tech-minimal、luxury、editorial-magazine、consumer-warm、brutalist，不要默认只剩一种风格。
- **Product**：设计服务于产品。包括 app UI、后台、dashboard、工具。这里的标准是“被赢得的熟悉感”，让习惯了 Linear / Figma / Notion / Raycast / Stripe 的人一眼就愿意信任它。

项目根目录下的 `PRODUCT.md` 带有一个 `## Register` 段，值只会是 `brand` 或 `product`。`/impeccable teach` 会先问这个 register，因为它会影响后续所有回答。

只有当 brand 和 product 两种路径确实存在差异时，子命令参考文件才需要在顶部附近添加一个简短的 `## Register` 段。不要在子命令中重复 register 文件的内容，直接链接即可。目前存在明显 register 分歧的子命令有：`typeset`、`animate`、`bolder`、`delight`、`colorize`、`layout`、`quieter`。

**a11y 放在 `audit.md` 中**，不要放在 `SKILL.md`、`brand.md` 或 `product.md` 里。模型在设计阶段若被过度提醒无障碍，常会变得过于保守，产出安全但乏味的设计。无障碍检查应由专门的 audit 命令承担。

## CSS

全部使用手写原生 CSS，不用 Tailwind，也没有构建步骤。Bun 的 HTML loader 会自动解析 `<link rel="stylesheet">`，并把 `@import` 链一并内联，所以 `bun run dev` 和 `bun run build` 都能正常工作。

CSS 架构如下：
- `public/css/main.css`：主入口，导入各 partial 并定义 tokens / reset
- `public/css/workflow.css`：Commands 区域、glass terminal、magazine spread 样式
- `public/css/sub-pages.css`：`/docs`、`/anti-patterns`、`/tutorials`、详情页
- `public/css/tokens.css`：OKLCH 颜色 token，如 ink、charcoal、ash、mist、cream、accent

直接修改这些文件后刷新即可。CSS 改动不需要重新构建。

## 颜色 token 规则

- **`--color-ink`**（10% lightness）用于正文，小字号正文也优先使用它。
- **`--color-charcoal`**（25% lightness）用于小文本时会显得发灰发虚。只适合标题或更大的正文。
- **`--color-ash`**（55%）用于次级标签、caption 和关系性元信息。
- **不要使用纯黑或纯白。** 一律使用带色相倾向的 token。

## 不要用 em dash，也不要用 `--`

`CLAUDE.md` 多轮反馈里反复提到：“项目文案不要用 em dashes”，这**不意味着**“用 `--` 双连字符替代”。真正的意思是：**请使用正常标点**，如逗号、冒号、分号、句号、括号。`--` 这种替代法只会让问题更糟。构建校验器 `scripts/build.js` 里的 `validateNoEmDashes` 只能抓真正的 em dash，抓不到 `--` 这个习惯，所以你要自己留意。

## 开发服务器

```bash
bun run dev        # Bun dev server at http://localhost:3000
bun run preview    # Build + Cloudflare Pages local preview
```

开发服务器位于 `server/index.js`，会在模块加载时运行 `generateSubPages`。因此，如果你修改了 `content/site/skills/`、`source/skills/impeccable/`，或子页面生成器相关代码，必须**重启服务器**才能看到变化，而不只是刷新浏览器。CSS 热更新则无需重启。

**遗留 URL 重定向** 位于 `server/index.js`，并且必须与 `scripts/build.js` 中 `_redirects` 的生成逻辑保持同步。当前重定向包括：`/skills` -> `/docs`、`/skills/:id` -> `/docs/:id`、`/cheatsheet` -> `/docs`、`/gallery` -> `/visual-mode#try-it-live`。

## 部署

站点部署在 Cloudflare Pages。静态资源来自 `build/`，API 路由通过 `_redirects` 重写和 Pages Functions 处理。

```bash
bun run deploy     # Build + deploy to Cloudflare Pages
```

## 构建系统

构建系统会把 `source/` 中的 impeccable skill 编译成各 provider 专用格式，输出到 `dist/`：

```bash
bun run build      # Build all providers
bun run rebuild    # Clean and rebuild
```

源文件里会使用一些占位符，在构建时按 provider 替换：
- `{{model}}`：模型名，如 Claude、Gemini、GPT
- `{{config_file}}`：配置文件名，如 `CLAUDE.md`、`.cursorrules`
- `{{ask_instruction}}`：如何向用户提问
- `{{command_prefix}}`：`/` 或 `$`
- `{{available_commands}}`：自动填充的命令列表，来自 `scripts/lib/utils.js` 中的 `IMPECCABLE_SUB_COMMANDS`
- `{{scripts_path}}`：面向 provider 的 skill scripts 目录路径

### Harness 输出目录会被追踪

`.claude/skills/`、`.cursor/skills/`、`.agents/skills/` 以及另外 8 个 harness 目录，**都是有意提交进仓库的**。`npx skills` 安装时会直接读取这些目录，它们也支持以 submodule 方式干净使用。不要把它们 gitignore。修改 `source/skills/` 后，请运行 `bun run build` 刷新这些目录。

harness 目录里的本地状态文件，如 `.claude/scheduled_tasks.lock`、`.claude/settings.local.json`，则是 gitignored。

### 生成型子页面目录会被 gitignore

`public/docs/`、`public/anti-patterns/`、`public/tutorials/`、`public/visual-mode/` 都由 `scripts/build-sub-pages.js` 在 dev server 启动时和 `bun run build` 时生成。之所以 gitignore，是因为生产环境 Cloudflare Pages 会自行构建，没人直接从 git 使用这些产物。

## 测试

```bash
bun run test            # Default suite: unit + static framework fixtures
bun run test:live-e2e   # Opt-in: full-cycle live-mode E2E across framework fixtures
```

单元测试通过 `bun test` 运行。基于 jsdom 的 fixture 测试通过 `node --test` 跑，因为 bun 在 jsdom 场景下太慢。`test` 脚本已自动处理这层分流。

**重要：** `tests/build.test.js` 会对 `scripts/lib/transformers/index.js` 中导出的具名函数执行 `spyOn(transformers, 'transformCursor')`。这些具名导出，如 `transformCursor`、`transformClaudeCode`，就是为了测试 spy 而保留的，即使 `build.js` 自己内部已经直接使用 `createTransformer + PROVIDERS`。**不要把它们当死代码删掉**，之前有人这么做过，结果弄坏了 8 个测试。

### Live-mode E2E

`tests/live-e2e.test.mjs` 会驱动完整用户流程，即 handshake -> pick -> Go -> cycle -> accept -> carbonize cleanup，并对 `tests/framework-fixtures/` 中声明了 `runtime` 的每个 fixture 做实测。每个 fixture 会安装真实依赖、启动真实 dev server，如 Vite、Next、SvelteKit、Astro、Nuxt static，然后由 Playwright Chromium 驱动一个确定性的 fake agent，生成符合 `reference/live.md` 规范的真实变体。

```bash
bun run test:live-e2e                                       # full suite, ~2 min, 19 fixtures
IMPECCABLE_E2E_ONLY=vite8-react-modal bun run test:live-e2e # scope to one fixture
IMPECCABLE_E2E_DEBUG=1 bun run test:live-e2e                # dump page DOM + dev-server tail on failure
```

**一次性准备：** `npx playwright install chromium`

之所以不放进默认的 `bun run test`，是因为它会真实执行每个 fixture 的 `npm install`、启动框架 dev server、整体耗时约 2 分钟，而且依赖 Playwright 的浏览器缓存。凡是改到了 `source/skills/impeccable/scripts/live-*.{mjs,js}`，都应在本地先跑一遍。

agent 本身通过 `tests/live-e2e/agent.mjs` 中的单方法接口可替换：
`generateVariants(event, context) -> { scopedCss, variants[] }`

默认 fake agent 会生成用于覆盖 `range`、`steps`、`toggle` 三类参数的固定变体。真正的 orchestrator，即 wrap、write、accept、carbonize，与具体 agent 是解耦的。

**LLM agent（可选）**：设置 `IMPECCABLE_E2E_AGENT=llm`，就会把 fake agent 替换为 `tests/live-e2e/agents/llm-agent.mjs`，它通过 `@anthropic-ai/sdk` 调用 Claude，默认是 Haiku 4.5。需要环境变量 `ANTHROPIC_API_KEY`；如果没有，测试运行器会明确跳过。也可以用 `IMPECCABLE_E2E_LLM_MODEL=claude-sonnet-4-6` 覆盖模型。缓存默认开启，第一次调用后，后续 fixture 主要走 cache-read。典型通过率约 18/19；modal fixture 的状态丢失问题会被 LLM 延迟放大，偶尔需要重跑。**这条路径会真实调用 API 并产生费用**，除非确实需要，否则不要放进 CI。

新增 fixture 的方法很直接：复制 `tests/framework-fixtures/` 下某个目录，替换源文件，再写一个 `fixture.json`。完整 schema 见 `tests/framework-fixtures/README.md`。

## CLI

CLI 位于本仓库的 `bin/` 和 `src/` 下，以 `impeccable` 这个 npm 包名发布。

```bash
npx impeccable detect [file-or-dir-or-url...]   # detect anti-patterns
npx impeccable detect --fast --json src/         # regex-only, JSON output
npx impeccable live                              # start browser overlay server
npx impeccable skills install                    # install skills
npx impeccable --help                            # show help
```

浏览器检测器 `src/detect-antipatterns-browser.js` 是从主引擎生成的。修改 `src/detect-antipatterns.mjs` 后，需要重新构建：

```bash
bun run build:browser
```

**重要：** 运行 detect CLI 时一定要用 `node`，不要用 `bun`。Bun 的 jsdom 实现极慢，会让包含 HTML 文件的扫描卡上好几分钟。

## 版本管理

这里有 3 个彼此独立版本化的组件。只 bump 真正发生变化的那个：

**CLI**（npm 包）：
- `package.json` -> `version`
- 变更条件：CLI 代码变动，如 `bin/`、`src/detect-antipatterns.mjs`

**Skills**（Claude Code 插件 / skill 定义）：
- `.claude-plugin/plugin.json` -> `version`
- `.claude-plugin/marketplace.json` -> `plugins[0].version`
- 变更条件：skill 内容改动，如 `source/skills/`、reference 文件、command metadata

**Chrome extension**：
- `extension/manifest.json` -> `version`
- 变更条件：extension 代码改动，如 `extension/`

**网站 changelog**（`public/index.html`）：
- 更新 hero 版本链接文本和 changelog 区域中的新条目
- 只记录面向用户的变化，不记录内部构建或工具细节
- 使用最重要的那个版本号，通常是 skills 版本

改完版本后，发布方式见下方 **Releases**。

## Releases

GitHub releases 是按组件打 tag，而不是按统一版本号。tag 前缀分别是 `skill-v`、`cli-v`、`ext-v`。

任意组件的发布流程：

1. bump 对应 manifest 的版本号。
2. 在 `public/index.html` 中加入 changelog 条目。skill 使用 `vX.Y.Z`，CLI 和 extension 分别使用 `CLI vX.Y.Z` 与 `Extension vX.Y.Z`。发布脚本会按这个标签提取说明，所以前缀不能错。
3. 提交并 push 到 `main`。
4. 运行 `bun run release:<skill|cli|ext>`。如需预览，先跑 `node scripts/release.mjs <component> --dry-run`。

如果工作树不干净、HEAD 领先于 origin、tag 已存在、缺少对应 changelog，或 `bun run build` / `bun run build:extension` 会生成未提交改动，发布脚本都会拒绝继续。

skill release 会附带 `dist/universal.zip`。extension release 会先运行 `bun run build:extension`，并附带 `dist/extension.zip`。CLI release 会提醒你单独执行 `npm publish`；extension release 会提醒你把 zip 上传到 Chrome Web Store dashboard。

如果事后只想修 release notes，如改 typo、补感谢或修格式，可用：

```bash
gh release edit <tag> --notes-file <md>
```

如果你想从 changelog 自动重建 release notes，`scripts/release.mjs` 中的 `htmlToMarkdown` 是最合适的参考实现。

## 添加新命令

所有命令都挂在 `/impeccable` 下面。要新增一个命令：

1. 创建 `source/skills/impeccable/reference/<command>.md`，写入该命令的指令内容，即调用时加载给 LLM 的内容。
2. 在 `source/skills/impeccable/SKILL.md` 的 **Sub-command reference table** 中加一行。
3. 在同一文件的 **Command menu** 段中加入命令入口。
4. 把命令名加入 `scripts/lib/utils.js` 的 `IMPECCABLE_SUB_COMMANDS`。
5. 把它加入 `source/skills/impeccable/scripts/pin.mjs` 的 `VALID_COMMANDS`。
6. 把它的 metadata，即 description 与 argumentHint，写入 `source/skills/impeccable/scripts/command-metadata.json`。
7. 把它的 category 加入 `scripts/lib/sub-pages-data.js` 的 `SKILL_CATEGORIES`。
8. 把它的 relationships，即 leadsTo / pairs / combinesWith，加入同一文件的 `COMMAND_RELATIONSHIPS`。
9. 同时更新 `public/js/data.js` 中的 `commandCategories` 和 `commandProcessSteps`，用于首页 carousel。
10. 在 `public/js/components/framework-viz.js` 中更新 `commandSymbols` 与 `commandNumbers`，用于 periodic table。
11. 可选：在 `content/site/skills/<command>.md` 写一个 editorial wrapper，补上简短 `tagline` 和扩展正文。

构建系统会从 router table 自动统计命令总数。每当总数变化时，必须同步更新下列位置中的数字：

- `public/index.html`
- `public/cheatsheet.html` 已不存在；`/cheatsheet` 会重定向到 `/docs`
- `README.md`
- `NOTICE.md`
- `AGENTS.md`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

构建校验器 `scripts/build.js` 中的 `generateCounts` 会检查这些数字是否和 router table 一致。

## 为已有命令补充 editorial 内容

editorial 文件位于 `content/site/skills/<command>.md`，frontmatter 中有一个 `tagline`，正文遵循固定四段结构：

- **When to use it**：这个命令负责的具体场景
- **How it works**：内部过程、阶段或方法
- **Try it**：一到两个具体示例，以及预期输出
- **Pitfalls**：真实失败模式，以及应该改用什么

`tagline` 用于那些需要短标签、对人更友好的 UI 界面。`command-metadata.json` 中的长 description 则仍主要服务于 AI harness 里的自动触发关键词匹配。

理想状态是每个命令最终都有 editorial 文件，但构建并不强制要求。没有 editorial 的命令会回退到 frontmatter description。

## 添加或修改 anti-pattern 检测规则

`src/detect-antipatterns.mjs` 是规则引擎的唯一事实来源。CLI、公开站 overlay、Chrome extension 和首页规则计数都从它派生。有五个位置需要保持同步：

| Where | How it stays in sync |
|---|---|
| `src/detect-antipatterns.mjs`（`ANTIPATTERNS` 数组和 `checkXxx` 逻辑） | 手工编辑 |
| `src/detect-antipatterns-browser.js` | `bun run build:browser` |
| `extension/detector/detect.js` + `extension/detector/antipatterns.json` | `bun run build:extension` |
| `public/js/generated/counts.js`（`DETECTION_COUNT`） | `bun run build` |
| `source/skills/impeccable/SKILL.md` 和 `reference/*.md` | 如规则引入新设计指导，则手工更新 |

修改规则后，务必运行这三类构建和测试：

```bash
bun run build && bun run build:browser && bun run build:extension && bun run test
```

### TDD 顺序，不能跳

1. 在 `tests/fixtures/antipatterns/{rule-id}.html` 写 fixture，左右两列分别是 should-flag 和 should-pass，每个案例都要用唯一标题标识。至少覆盖 3 个命中案例和 3 个误报防护案例。因为 jsdom 不做布局，所以 CSS 必须写明确的像素尺寸。
2. 在 `tests/detect-antipatterns-fixtures.test.mjs` 写一个失败测试，沿用 snippet-substring 模式，即用正则 `/"([^"]+)"/` 去匹配 `SHOULD_FLAG` / `SHOULD_PASS` 列表。先运行并确认它确实失败。3. 在 `ANTIPATTERNS` 数组里加入规则条目：`id`、`category`（AI 味道用 `slop`，真实设计或 a11y 问题用 `quality`）、`name`、`description`，可选 `skillSection` 和 `skillGuideline`。
4. 写纯函数 `checkXxx(opts)`，返回 `[{ id, snippet }]`，里面不要直接访问 DOM。
5. 写两个 adapter：浏览器端的 `checkElementXxxDOM(el)`，使用 `getComputedStyle` 和 `getBoundingClientRect`；jsdom 端的 `checkElementXxx(el, tag, window)`，使用 `parseFloat(style.width)` 代替真实布局。并把两者都接入 `src/detect-antipatterns.mjs` 的两套元素遍历逻辑。最常见的错误就是漏掉一套，表现为“测试通过但线上静默”，或“线上有反应但测试没覆盖”。
6. 在真实页面上验证，如 `http://localhost:3000/fixtures/antipatterns/{rule-id}.html` 和首页，确认没有误报。

### 约定与 jsdom 坑点

- **Snippet 格式**：把标识标题文字包在直双引号里，例如 `'icon tile above h3 "Lightning Fast"'`，这样 fixture test 才能提取。若规则不依赖标题，也要选一个稳定标识。
- **jsdom 不做真实布局**：`getBoundingClientRect()` 会返回 0x0，应从显式 CSS 中读取 `width` 与 `height`。
- **`background:` 简写在 jsdom 中不会自动拆解**：使用现有的 `resolveBackground()` 与 `resolveGradientStops()` 辅助函数。
- **computed color 在 jsdom 中不会自动标准化**：`parseGradientColors()` 已处理 hex 与 rgb 两种形式。

可参考的规则有：`side-tab`、`low-contrast`、`icon-tile-stack`、`flat-type-hierarchy`。

## Evals 框架（独立私有仓库）

eval 框架位于独立私有仓库 `~/code/impeccable-evals/`。它通过让模型分别在“开启 skill”和“关闭 skill”两种状态下生成同一个设计 brief，来衡量 `/impeccable` 对前端设计输出究竟是提升还是削弱。

**如果你在接手 eval 相关工作，请切换到那个仓库，并先读它的 `AGENT.md`。** 那里记录了模型选择、样本量策略、经验教训、常见工作流和注意事项。

```bash
cd ~/code/impeccable-evals
bun run serve            # dashboard on http://localhost:8723
```

eval runner 会从 `../impeccable/source/skills/impeccable/` 读取本仓库的 skill，也会从 `../impeccable/build/_data/dist/*` 读取 staged provider skills。如果你希望 eval 用到的是最新改动，请先在本仓库执行 `bun run build`。

### 改动 skill 顶层结构后，记得更新 eval 仓库中的 `inline-skill.ts`

harness 在 skill-on 模式下会把 `SKILL.md` 直接 inline 到 system prompt 中，并剥离那些对 API 驱动 craft 流程无关的段落。`runner/inline-skill.ts` 中的 strip list 必须与 `SKILL.md` 的顶层 `##` 标题保持同步。自 v3.0 起，应剥离 `## Setup (non-optional)`、`## Commands`、`## Pin / Unpin`，保留 `## Shared design laws`。如果你新增或重命名了顶层段落，记得同步更新那里。