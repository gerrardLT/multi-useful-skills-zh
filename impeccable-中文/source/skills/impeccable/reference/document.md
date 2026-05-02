# Design System: [Project Title]

## 1. Overview

**Creative North Star: "[Named metaphor in quotes]"**

[2-3 paragraph holistic description: personality, density, aesthetic philosophy. Start from the North Star and work outward. State what this system explicitly rejects (pulled from PRODUCT.md's anti-references). End with a short **Key Characteristics:** bullet list.]

## 2. Colors

[Describe the palette character in one sentence.]

### Primary
- **[Descriptive Name]** (#HEX / oklch(...)): [Where and why this color is used. Be specific about context, not just role.]

### Secondary (optional — omit if the project has only one accent)
- **[Descriptive Name]** (#HEX): [Role.]

### Tertiary (optional)
- **[Descriptive Name]** (#HEX): [Role.]

### Neutral
- **[Descriptive Name]** (#HEX): [Text / background / border / divider role.]
- [...]

### Named Rules (optional, powerful)
**The [Rule Name] Rule.** [Short, forceful prohibition or doctrine — e.g. "The One Voice Rule. The primary accent is used on ≤10% of any given screen. Its rarity is the point."]

## 3. Typography

**Display Font:** [Family] (with [fallback])
**Body Font:** [Family] (with [fallback])
**Label/Mono Font:** [Family, if distinct]

**Character:** [1-2 sentence personality description of the pairing.]

### Hierarchy
- **Display** ([weight], [size/clamp], [line-height]): [Purpose — where it appears.]
- **Headline** ([weight], [size], [line-height]): [Purpose.]
- **Title** ([weight], [size], [line-height]): [Purpose.]
- **Body** ([weight], [size], [line-height]): [Purpose. Include max line length like 65–75ch if relevant.]
- **Label** ([weight], [size], [letter-spacing], [case if uppercase]): [Purpose.]

### Named Rules (optional)
**The [Rule Name] Rule.** [Short doctrine about type use.]

## 4. Elevation

[One paragraph: does this system use shadows, tonal layering, or a hybrid? If "no shadows", say so explicitly and describe how depth is conveyed instead.]

### Shadow Vocabulary (if applicable)
- **[Role name]** (`box-shadow: [exact value]`): [When to use it.]
- [...]

### Named Rules (optional)
**The [Rule Name] Rule.** [e.g. "The Flat-By-Default Rule. Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus)."]

## 5. Components

For each component, lead with a short character line, then specify shape, color assignment, states, and any distinctive behavior.

### Buttons
- **Shape:** [radius described, exact value in parens]
- **Primary:** [color assignment + padding, in semantic + exact terms]
- **Hover / Focus:** [transitions, treatments]
- **Secondary / Ghost / Tertiary (if applicable):** [brief description]

### Chips (if used)
- **Style:** [background, text color, border treatment]
- **State:** [selected / unselected, filter / action variants]

### Cards / Containers
- **Corner Style:** [radius]
- **Background:** [colors used]
- **Shadow Strategy:** [reference Elevation section]
- **Border:** [if any]
- **Internal Padding:** [scale]

### Inputs / Fields
- **Style:** [stroke, background, radius]
- **Focus:** [treatment — glow, border shift, etc.]
- **Error / Disabled:** [if applicable]

### Navigation
- **Style, typography, default/hover/active states, mobile treatment.**

### [Signature Component] (optional — if the project has a distinctive custom component worth documenting)
[Description.]

## 6. Do's and Don'ts

Concrete, forceful guardrails. Lead each with "Do" or "Don't". Be specific — include exact colors, pixel values, and named anti-patterns the user mentioned in PRODUCT.md. **Every anti-reference in PRODUCT.md should show up here as a "Don't" with the same language**, so the visual spec carries the strategic line through. Quote PRODUCT.md directly where possible: if PRODUCT.md says *"avoid dark mode with purple gradients, neon accents, glassmorphism"*, the Don'ts here should repeat that by name.

### Do:
- **Do** [specific prescription with exact values / named rule].
- **Do** [...]

### Don't:
- **Don't** [specific prohibition — e.g. "use border-left greater than 1px as a colored stripe"].
- **Don't** [...]
- **Don't** [...]```markdown
**相对 schemaVersion 1 的变化。** 旧 sidecar 里包含基础令牌数组（`tokens.colors[]`、`tokens.typography[]` 等），这些值现在都迁到 frontmatter。sidecar 只保留 frontmatter 无法表达的元数据：色阶、当 hex 只是近似值时的 canonical OKLCH、显示名、角色提示等，并以 frontmatter 的 token 名称为键（如 `colorMeta.<token-name>`、`typographyMeta.<token-name>`）。组件仍然保留完整 HTML/CSS，因为 Stitch 那 8 个属性装不下它们。

#### 组件转换规则

`html` 和 `css` 字段必须是**自包含、可直接落地**的片段，注入 shadow DOM 后就能正确渲染。面板会直接应用它们，不做后处理，也不提供框架运行时。

1.  **Tailwind 展开。** 如果源代码使用 Tailwind（如 `className="bg-primary text-white rounded-lg px-6 py-3"`），必须把每个 utility 展开成字面 CSS，写进 `css` 字符串。不要依赖 Tailwind class，也不要假设运行环境已经加载了 Tailwind。
2.  **令牌解析。** 如果项目把 tokens 暴露为 `:root` 上的 CSS 自定义属性（如 `--color-primary`、`--radius-md`），就用 `var(--color-primary)` 这种形式引用，它们会穿过 shadow DOM，保持联动。如果 tokens 只存在于 JS 主题对象里（styled-components、CSS-in-JS），就在生成时解析成字面值。
3.  **图标。** 直接内联 SVG。不要引用 Lucide、Heroicons、图标字体或 `<img src="...">`。常见图标一般 16-24px，把 SVG path 数据原样带上。
4.  **状态。** 内联写出 `:hover`、`:focus-visible`，必要时加 `:active`。只有静态默认态会让面板显得死。
5.  **不要夹带 reset 噪音。** 只保留组件真正有辨识度的 CSS（背景、颜色、padding、圆角、字体、过渡）。不要重复发送通用 reset（如 `box-sizing: border-box`、`line-height: inherit`、`-webkit-font-smoothing`）。
6.  **类名前缀。** 每个类都加 `ds-` 前缀（如 `ds-btn-primary`、`ds-input-search`），避免同一个 shadow DOM 里多个组件互相污染。

#### 应该包含什么

控制在 **5-10 个组件**，只选最能代表视觉系统的：

-   **规范基础件**：button（每个变体都单独一个组件项）、input / text field、navigation、chip / tag、card。
-   **签名组件**：如果有辨识度很强的 hero CTA、featured card、filter pill，或 PRODUCT.md 明确提到的重要自定义模式，也要包含。
-   **其余的跳过。** 工具性组件、纯表单底座、外层布局壳，不够有视觉特征时不值得写。

如果项目里**还没有组件库**（比如刚起步的 landing page，或空白项目），就根据 tokens 合成一套符合 DESIGN.md 规则的规范基础件。即使是 day zero，`DESIGN.json` 也必须至少能渲染出一些东西。

#### 色调阶梯

为每个颜色令牌生成 8 级 `tonalRamp` 数组，从深到浅，保持同一色相和色度，亮度大约从 15% 递进到 95%。面板会把它渲染成色带。如果项目已经有现成的色阶（如 Material 的 `surface-container-low` 家族，或 Tailwind 风格的 `blue-50..blue-900`），就直接沿用；否则用 OKLCH 合成。

#### 叙事映射

直接从刚写好的 DESIGN.md 中抽取：

-   `narrative.northStar` → Overview 里的 `**Creative North Star: "..."**`
-   `narrative.overview` → Overview 中解释哲学的那几段正文
-   `narrative.keyCharacteristics` → `**Key Characteristics:**` 下的项目符号列表
-   `narrative.rules` → 各章节中所有 `**The [Name] Rule.** [body]`，并标上 `section`
-   `narrative.dos` / `narrative.donts` → Do's and Don'ts 里的原始项目符号

不要改写。面板会把这些内容作为可折叠的次级上下文展示，Markdown 里的声音要完整延续过去。

### 步骤 5：确认、细修，并刷新会话缓存

1.  把完整的 `DESIGN.md` 展示给用户，简要指出那些不那么显然但重要的创意选择，例如颜色命名、氛围语言、命名规则。
2.  顺带说明 `DESIGN.json` 也已经一起写好，这样实时面板展示的就是项目真实的 button / input / nav，而不是通用近似件。
3.  提供继续微调的入口，例如：“要不要我改某一节、补漏掉的组件模式，或者收紧 / 放开整体氛围语言？”
4.  **刷新会话缓存。** 最后运行 `node {{scripts_path}}/load-context.mjs`，把新写入的 `DESIGN.md` 载入当前对话。这样本次会话后续命令就能直接使用最新上下文，不必再重复读文件。

## 种子模式

适用于还没有可提取视觉系统的项目。它产出的是最小脚手架，不是完整规范。

### 步骤 1：确认种子模式

访谈前先说清楚：

“当前没有可扫描的现成视觉系统。我会先问五个简短问题，生成一份起步版 `DESIGN.md`。等项目有代码后，你可以重新运行 `/impeccable document`，把真实令牌和组件提取进去。可以吗？”

如果用户不想做，直接停止，不写文件。

### 步骤 2：五个问题

合并成一次 `AskUserQuestion` 交互，选项要具体：

1.  **颜色策略。** 选一个：
    -   克制型：有色中性 + 单一强调色，占比 ≤10%
    -   专注型：一个高饱和色承担 30–60% 的界面面积
    -   全色板型：3–4 个明确命名的颜色角色共同工作
    -   浸润型：界面本身就是颜色

    然后再补一个色相家族或锚点参考，例如 “深青色”、“芥末黄”、“Klim #ff4500 橙”。

2.  **排版方向。** 选一个（具体字体以后再定）：
    -   衬线展示字体 + 无衬线正文字体
    -   单一无衬线字体（温暖 / 技术 / 几何 / 人文主义 任选一种气质）
    -   展示字体 + 等宽字体
    -   等宽字体为主
    -   编辑手写体 + 无衬线字体

3.  **动效能量。** 选一个：
    -   克制型：只有状态变化
    -   响应型：有反馈和过渡，但没有编排
    -   编排型：有组织的进场、滚动驱动序列

4.  **三个命名参考。** 品牌、产品、印刷物都行，不要只给形容词。

5.  **一个反参考。** 它绝对不能像什么，也必须是有名字的对象。

### 步骤 3：写种子版 DESIGN.md

仍然使用扫描模式的六节结构，但只填访谈能支撑的内容，其余部分老实留白。种子是脚手架，不是假装完整。

文件开头先加：

```markdown
<!-- SEED — re-run /impeccable document once there's code to capture the actual tokens and components. -->
```

各章节在种子模式下的写法：

-   **概述**：根据颜色策略、动效能量和参考对象，写出创意北极星和整体哲学，并直接引用用户给出的反参考。
-   **颜色**：把颜色策略写成命名规则，例如 *“浸润规则。表面本身就是颜色。”*。写出色相家族或锚点参考。不写 hex，用 `[to be resolved during implementation]` 标明后补。
-   **排版**：写用户选择的方向，例如 “衬线展示字体 + 无衬线正文字体”。不写具体字体名，用 `[font pairing to be chosen at implementation]` 占位。
-   **层次**：根据动效能量推断。克制型 / 响应型通常是默认扁平；编排型通常更适合分层。用一句话说明。
-   **组件**：整个章节省略，因为还没有实际组件。
-   **该做与不该做**：直接承接 PRODUCT.md 的反参考，以及问题 5 里给出的反参考。

种子模式的 frontmatter 只写最少的 `name` 和 `description`，不写 colors、typography、rounded、spacing、components。真实令牌等下一次扫描模式再落地。同理，种子模式跳过 `DESIGN.json` sidecar，因为此时没有任何东西可渲染。

### 步骤 4：确认并刷新会话缓存

1.  把种子版 `DESIGN.md` 展示给用户，并明确说明这只是种子，文件里的标记就是这个承诺。
2.  告诉用户：“等你有代码后，重新执行 `/impeccable document`。下一次会提取真实 tokens，并生成 sidecar。”
3.  运行一次 `node {{scripts_path}}/load-context.mjs`，把种子文档装进当前会话，供后续命令直接使用。

## 风格准则

-   **Frontmatter 优先，正文随后。** 令牌放 YAML frontmatter；正文只负责解释上下文。不要在两处重复定义同一个值，frontmatter 才是规范本体。
-   **在该做与不该做中点名引用 PRODUCT.md 的反参考。** 如果 PRODUCT.md 写了 “SaaS 落地页陈词滥调” 或 “通用 AI 工具营销”，这里的“不该做”就要原样复现这些词，让视觉规范真正承接战略边界。
-   **严格遵守六节规范，不要私增章节。** 如果需要写布局、动效、响应式，把它们并进概述或组件，而不是新增一级标题。
-   **描述优先于技术缩写。** “轻微弧形边角（8px radius）” 比 “rounded-lg” 更好。技术值写在括号里，但让描述先行。
-   **强调功能而不是装饰。** 每个令牌都要解释“在哪里用、为什么用”，而不是只说明它“是什么”。
-   **精确数值写在括号里。** hex、px/rem、font-weight 等，和描述并列给出。
-   **多用命名规则。** `**The [Name] Rule.** [short doctrine]` 这种结构更易记、更容易被引用，对 AI 消费者也更有粘性。Stitch 自己的输出大量使用这种写法（如 “无描边规则”、“幽灵边框回退”）。每节争取 1-3 条。
-   **语气要强。** 像设计总监，不像旁观者。多用 “禁止”、“绝不”、“必须”、“总是”，少用 “可以考虑”、“或许”、“倾向于”。与 PRODUCT.md 的语气对齐。
-   **反模式测试要具体。** 例如 Stitch 常写：*“如果它看起来像 2014 年的应用，那阴影就太深，模糊半径就太小。”* 这种一句话审查标准，比一大段原则更有效。
-   **持续参考 PRODUCT.md。** 那里的反参考应该直接驱动这里的该做与不该做。可以直接引用，也可以精确转述。
-   **颜色按角色分组，不按色相或十六进制排序。** 顺序应始终是 Primary / Secondary / Tertiary / Neutral。

## 常见坑

-   不要把原始 CSS class 名直接贴进文档，要翻成描述性语言。
-   不要把每一个 token 都抓出来，只记录真正复用的部分；一次性值会污染系统。
-   不要发明不存在的组件。如果项目里只有 buttons 和 cards，就只写它们。
-   没问用户就不要覆盖已有 `DESIGN.md`。
-   不要和 PRODUCT.md 重复内容。`DESIGN.md` 只负责视觉。
-   不要新增 “布局原则”、“动效”、“响应式行为” 这类一级标题。规范只有六节，不是九节。额外内容要折叠进正确位置。
-   不要哪怕轻微地改章节名。“颜色” 就是 “颜色”，不要写成 “调色板与角色”；“排版” 也不要改成 “排版规则”。很多工具依赖精确匹配。
-   不要在 frontmatter 和正文里重复写一份 token 数值。如果 `colors.primary` 在 frontmatter 里已经是 hex，正文可以命名并解释它的用途，但不要再声称另一套不同的数值。frontmatter 才是规范本体。
-   不要在 frontmatter 顶层发明 Stitch 模式外的字段（比如 `motion:`、`breakpoints:`、`shadows:`）。Stitch 的 Zod 模式只接受 `colors`、`typography`、`rounded`、`spacing`、`components`。其他内容都应该进 sidecar 的 `extensions`。
```