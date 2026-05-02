在项目根目录生成一个 `DESIGN.md` 文件，以捕获当前视觉设计系统，使 AI agent 在生成新界面时能保持品牌一致性。
DESIGN.md 遵循 [官方 Google Stitch DESIGN.md 格式](https://stitch.withgoogle.com/docs/design-md/format/)：使用 YAML frontmatter 承载机器可读的设计 tokens，后面接一个 markdown 正文，且正文必须严格包含固定顺序的六个章节。*Tokens 是规范层，prose 负责解释如何应用它们。* 某些章节在不相关时可以省略，但**不要重排顺序，也不要改章节名**。章节标题必须与规范逐字一致，这样文件才能继续被其他支持 DESIGN.md 的工具（Stitch 本身、awesome-design-md、skill-rest 等）正确解析。
## frontmatter：token schema

YAML frontmatter 是机器可读层。Stitch 的 linter 校验它，live panel 也是从这里渲染 token tiles。保持精炼；每一项都应该对应项目里真实使用的 token。
```yaml
---
name: <project title>
description: <one-line tagline>
colors:
  primary: "#b8422e"
  neutral-bg: "#faf7f2"
  # ...one entry per extracted color; key = descriptive slug
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "normal"
  body:
    # ...
rounded:
  sm: "4px"
  md: "8px"
spacing:
  sm: "8px"
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "16px 48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
---
```

关键规则：
- **Token refs** 使用 `{path.to.token}`（例如 `{colors.primary}`、`{rounded.md}`）。组件可以引用基础 token；基础 token 之间不能互相引用。
- **Stitch 会把颜色校验为 hex sRGB**（`#RGB` / `#RGBA` / `#RRGGBB` / `#RRGGBBAA`）；OKLCH / HSL / P3 会触发 linter warning，但不是 hard error。YAML 无论哪种格式都接受字符串，我们自己的 parser 也不限定格式。根据项目姿态来选：a）如果项目坚持 “OKLCH-only” 或使用无法可靠 round-trip 到 sRGB 的 Display-P3 值，那就直接在 frontmatter 里写 OKLCH，并接受 Stitch 的 warning；b）如果项目更在意严格通过 Stitch 校验，或计划使用他们的 Tailwind / DTCG 导出链路，那就在 frontmatter 中写 hex，并在 prose 中把 OKLCH 作为规范参考。没有明确理由时，绝不要把事实来源拆成两份。
- **组件子 token** 只允许 8 个属性：`backgroundColor`、`textColor`、`typography`、`rounded`、`padding`、`size`、`height`、`width`。阴影、动效、focus ring、backdrop-filter 等都放不进去，应该放进 sidecar（第 4b 步）。
- **Scale keys 可以自由命名。** 使用项目原本采用的命名（如 `warm-ash-cream`、`surface-container-low`），不要强行改成 Material 默认词汇。
- **Variants 只是命名约定，不是 schema。** 比如 `button-primary` / `button-primary-hover` / `button-primary-active` 作为同级 key。
## markdown 正文：六个章节（顺序必须完全一致）

1. `## Overview`
2. `## Colors`
3. `## Typography`
4. `## Elevation`
5. `## Components`
6. `## Do's and Don'ts`

允许像 `## 2. Colors: The [Name] Palette` 这种带有风格副标题的写法——Stitch 自己就会这么做——但每个标题里的关键字（Overview、Colors、Typography、Elevation、Components、Do's and Don'ts）必须原样出现。不要新增额外的顶层章节（例如 Layout Principles、Responsive Behavior、Motion、Agent Prompt Guide）。把这些内容折叠到它们自然归属的六个规范章节里。
## 何时运行

- 用户刚运行了 `/impeccable teach`，需要把视觉层也文档化。
- skill 发现不存在 `DESIGN.md`，并提醒用户创建它。
- 现有 `DESIGN.md` 已经过时（设计发生漂移）。
- 大型重设计之前，需要先把当前状态作为参考记录下来。

如果已经存在 `DESIGN.md`，**不要静默覆盖**。先把现有文件展示给用户，并 {{ask_instruction}} 询问是刷新、覆盖还是合并。
## 两条路径

- **Scan mode**（默认）：项目里已经有 design tokens、组件或可渲染输出。先提取，再确认描述性语言。适用于已有代码可分析的情况。
- **Seed mode**：项目尚未实现（刚做完 teach，几乎没有代码）。通过五个高层问题写一份最小版 DESIGN.md，并标记 `<!-- SEED -->`。等以后有代码了，再用 scan mode 重跑一遍。

无论如何都先扫描一次（Scan mode 第 1 步）再做判断。如果扫描发现没有 tokens、没有组件文件，也没有可渲染的网站，那就提供 seed mode 选项——不要静默切换。`/impeccable document --seed` 会在有无代码都存在的情况下强制进入 seed mode。
## Scan mode（方法 C：自动提取，再确认描述性语言）

### 第 1 步：找到设计资产

按以下优先级搜索代码库：

1. **CSS 自定义属性** —— 在 CSS 文件中 grep `--color-`、`--font-`、`--spacing-`、`--radius-`、`--shadow-`、`--ease-`、`--duration-` 声明（通常位于 `src/styles/`、`public/css/`、`app/globals.css` 等）。记录名称、值，以及它定义在哪个文件里。
2. **Tailwind config** —— 如果存在 `tailwind.config.{js,ts,mjs}`，读取其中的 `theme.extend`，提取 colors、fontFamily、spacing、borderRadius、boxShadow。
3. **CSS-in-JS theme 文件** —— 如 styled-components、emotion、vanilla-extract、stitches：寻找 `theme.ts`、`tokens.ts` 或等价文件。
4. **Design token 文件** —— 如 `tokens.json`、`design-tokens.json`、Style Dictionary 输出、W3C token community group 格式。
5. **组件库** —— 扫描主要按钮、卡片、输入框、导航、对话框组件。记录它们的 variant API 和默认样式。
6. **全局样式表** —— 根 CSS 文件通常包含基础排版和颜色分配。
7. **可见渲染结果** —— 如果当前环境有浏览器自动化工具，就加载线上站点，从关键元素（body、h1、a、button、card）上采样 computed styles。这样可以抓到 token 没暴露出来的真实值。

### 第 2 步：自动提取那些可以自动提取的内容

基于发现到的 tokens 构建一个结构化草稿。对每类 token：

- **Colors**：按 Primary / Secondary / Tertiary / Neutral 分组（这是 Stitch 采用的 Material 衍生角色体系）。如果项目只有一个强调色，那就写成 Primary + Neutral，不要凭空发明 Secondary / Tertiary。
- **Typography**：把观察到的字号和字重映射到 Material 层级（display / headline / title / body / label）。记录字体栈和尺度比例。
- **Elevation**：整理阴影词汇表。如果项目是纯平的，靠 tonal layering 而不是 shadow 来表达层次，这也是有效答案——要明确写出来。
- **Components**：对每个常见组件（button、card、input、chip、list item、tooltip、nav），提取形状（圆角）、颜色分配、hover / focus 处理和内部 padding。
- **Spacing + layout**：折叠进 Overview 或相关 Components 章节。规范里**没有**单独的 Layout 章节。

### 第 2b 步：搭好 frontmatter 草稿

根据第 2 步自动提取到的 tokens，现在就起草 YAML frontmatter（第 4 步会把它写到 DESIGN.md 顶部）。这是机器可读层——live panel 和 Stitch linter 都会消费它。

- **Colors**：每个提取到的颜色写一个条目。Key 使用描述性 slug（如 `warm-ash-cream`、`editorial-magenta`，不要写成 `blue-800`）。Value 使用项目实际视为 canonical 的格式（OKLCH 或 hex——见上面 frontmatter 规则）。不要分裂事实来源：frontmatter 里只能有一种格式，不要在 prose 中再用另一个值重定义同一 token。
- **Typography**：每个角色写一个条目（`display`、`headline`、`title`、`body`、`label`）。Typography 是对象；只包含项目真实存在的属性（`fontFamily`、`fontSize`、`fontWeight`、`lineHeight`、`letterSpacing`、`fontFeature`、`fontVariation`）。
- **Rounded / Spacing**：只写项目真实使用的尺度步进，key 名跟着项目原本的命名体系走（`sm` / `md` / `lg`，或 `surface-sm`，或数字步进）。
- **Components**：每个 variant 一个条目（`button-primary`、`button-primary-hover`、`button-ghost`）。通过 `{colors.X}`、`{rounded.Y}` 引用基础 token。如果某个 variant 需要 Stitch 那 8 个属性之外的内容（如 shadow、focus ring、backdrop-filter），就在 sidecar 里承载完整 snippet。

项目没有的内容就跳过。空尺度 key 或伪造 token 只会污染规范。

### 第 3 步：向用户询问定性语言

以下内容需要创造性输入，无法自动提取。把它们合并成一次 `AskUserQuestion` 互动：

- **Creative North Star**：为整套系统起一个命名隐喻（如 “The Editorial Sanctuary”、“The Golden State Curator”、“The Lab Notebook”）。提供 2-3 个选项，且这些选项必须尊重 PRODUCT.md 中的品牌人格。
- **Overview voice**：氛围形容词。2-3 句的审美哲学、anti-references（这套系统不应给人什么感觉）。
- **Color character**（针对自动提取出的颜色）：为关键色提供描述性命名（如 “Deep Muted Teal-Navy”，而不是 “blue-800”）。根据色相 / 饱和度，为每个关键色提供 2-3 个备选名。
- **Elevation philosophy**：是 flat / layered / lifted？如果存在阴影，它们的角色是 ambient 还是 structural？
- **Component philosophy**：用一句话描述按钮、卡片、输入框的感觉（如 “tactile and confident” vs. “refined and restrained”）。

尽可能引用 PRODUCT.md 中的一句话，这样用户能看到自己的战略语言被延续到了视觉层。

### 第 4 步：写入 DESIGN.md

文件顶部以第 2b 步整理好的 YAML frontmatter 开头（schema 已在本 reference 开头说明），正文则采用下面这套结构。章节标题必须逐字匹配。像 `## 2. Colors: The Coastal Palette` 这样的风格副标题是允许的。
```markdown
---
name: [Project Title]
description: [one-line tagline]
colors:
  # ... staged frontmatter from Step 2b
---

# Design System: [Project Title]

## 1. Overview

**Creative North Star: "[Named metaphor in quotes]"**

[2-3 paragraph holistic description: personality, density, aesthetic philosophy. Start from the North Star and work outward. State what this system explicitly rejects (pulled from PRODUCT.md's anti-references). End with a short **Key Characteristics:** bullet list.]

## 2. Colors

[Describe the palette character in one sentence.]

### Primary
- **[Descriptive Name]** (#HEX / oklch(...)): [Where and why this color is used. Be specific about context, not just role.]

### Secondary (optional - omit if the project has only one accent)
- **[Descriptive Name]** (#HEX): [Role.]

### Tertiary (optional)
- **[Descriptive Name]** (#HEX): [Role.]

### Neutral
- **[Descriptive Name]** (#HEX): [Text / background / border / divider role.]
- [...]

### 已命名的 Rules (optional, powerful)
**The [Rule Name] Rule.** [Short, forceful prohibition or doctrine - e.g. "The One Voice Rule. The primary accent is used on <=10% of any given screen. Its rarity is the point."]

## 3. Typography

**Display Font:** [Family] (with [fallback])
**Body Font:** [Family] (with [fallback])
**Label/Mono Font:** [Family, if distinct]

**Character:** [1-2 sentence personality description of the pairing.]

### Hierarchy
- **Display** ([weight], [size/clamp], [line-height]): [Purpose - where it appears.]
- **Headline** ([weight], [size], [line-height]): [Purpose.]
- **Title** ([weight], [size], [line-height]): [Purpose.]
- **Body** ([weight], [size], [line-height]): [Purpose. Include max line length like 65-75ch if relevant.]
- **Label** ([weight], [size], [letter-spacing], [case if uppercase]): [Purpose.]

### 已命名的 Rules (optional)
**The [Rule Name] Rule.** [Short doctrine about type use.]

## 4. Elevation

[One paragraph: does this system use shadows, tonal layering, or a hybrid? If "no shadows", say so explicitly and describe how depth is conveyed instead.]

### Shadow Vocabulary (if applicable)
- **[Role name]** (`box-shadow: [exact value]`): [When to use it.]
- [...]

### 已命名的 Rules (optional)
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
- **Focus:** [treatment - glow, border shift, etc.]
- **Error / Disabled:** [if applicable]

### Navigation
- **Style, typography, default/hover/active states, mobile treatment.**

### [Signature Component] (optional - if the project has a distinctive custom component worth documenting)
[Description.]

## 6. Do's and Don'ts

Concrete, forceful guardrails. Lead each with "Do" or "Don't". Be specific - include exact colors, pixel values, and named anti-patterns the user mentioned in PRODUCT.md. **Every anti-reference in PRODUCT.md should show up here as a "Don't" with the same language**, so the visual spec carries the strategic line through. Quote PRODUCT.md directly where possible: if PRODUCT.md says *"avoid dark mode with purple gradients, neon accents, glassmorphism"*, the Don'ts here should repeat that by name.

### Do:
- **Do** [specific prescription with exact values / named rule].
- **Do** [...]

### Don't:
- **Don't** [specific prohibition - e.g. "use border-left greater than 1px as a colored stripe"].
- **Don't** [...]
- **Don't** [...]
```

### 第 4b 步：写入 DESIGN.json sidecar（只放扩展信息）

frontmatter 承载基础 token（colors、typography、rounded、spacing、components）。位于 `DESIGN.json` 的 sidecar 用来承载 **Stitch schema 放不下的东西**：每个颜色的 tonal ramp、shadow / elevation tokens、motion tokens、breakpoints、完整组件 HTML/CSS 片段（panel 会把它们渲染进 shadow DOM），以及 narrative（north star、rules、do's/don'ts）。它是对 frontmatter 的扩展，而不是重复。

每次重新生成 DESIGN.md 时，也要同步重建 sidecar。如果用户只要求刷新 sidecar（例如 live panel 提示它已过期），那就保留 DESIGN.md，只重写 DESIGN.json。
#### Schema

```json
{
``````json
{
  "schemaVersion": 2,
  "generatedAt": "ISO-8601 字符串",
  "title": "设计系统：[项目标题]",
  "extensions": {
    "colorMeta": {
      "primary":        { "role": "primary",  "displayName": "编辑洋红", "canonical": "oklch(60% 0.25 350)", "tonalRamp": ["...", "...", "..."] },
      "warm-ash-cream": { "role": "neutral",  "displayName": "暖灰奶油色",    "canonical": "oklch(96% 0.005 350)", "tonalRamp": ["...", "...", "..."] }
    },
    "typographyMeta": {
      "display": { "displayName": "展示", "purpose": "仅用于主标题。" }
    },
    "shadows": [
      { "name": "ambient-low", "value": "0 4px 24px rgba(0,0,0,0.12)", "purpose": "强调元素下方的漫射悬停光晕。" }
    ],
    "motion": [
      { "name": "ease-standard", "value": "cubic-bezier(0.4, 0, 0.2, 1)", "purpose": "状态转换的默认缓动。" }
    ],
    "breakpoints": [
      { "name": "sm", "value": "640px" }
    ]
  },
  "components": [
    {
      "name": "主要按钮",
      "kind": "button | input | nav | chip | card | custom",
      "refersTo": "button-primary",
      "description": "一句话说明是什么以及何时使用。",
      "html": "<button class=\"ds-btn-primary\">GET STARTED</button>",
      "css": ".ds-btn-primary { background: #191c1d; color: #fff; padding: 16px 48px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; border: none; border-radius: 0; transition: background 0.2s, transform 0.2s; } .ds-btn-primary:hover { background: oklch(60% 0.25 350); transform: translateY(-2px); }"
    }
  ],
  "narrative": {
    "northStar": "编辑圣殿",
    "overview": "2-3 段关于设计哲学的描述 - 摘自 DESIGN.md 的概述部分。",
    "keyCharacteristics": ["...", "..."],
    "rules": [{ "name": "唯一声音规则", "body": "...", "section": "colors|typography|elevation" }],
    "dos":   ["请使用 ..."],
    "donts": ["请勿使用 ..."]
  }
}
```

**相比 schemaVersion 1 的变化。** 旧版 sidecar 里有 token 基础数组（`tokens.colors[]`、`tokens.typography[]` 等）。现在这些值都放进 frontmatter 了。sidecar 只保留那些 frontmatter 无法承载的元数据——如色调渐变、当 hex 只是近似值时对应的 canonical OKLCH、显示名称、角色提示——并且它们都通过 frontmatter 的 token 名来索引（如 `colorMeta.<token-name>`、`typographyMeta.<token-name>`）。组件仍然保留完整 HTML/CSS，因为 Stitch 的那 8 个属性装不下这些内容。

#### 组件转换规则

`html` 和 `css` 字段必须是**自包含、可直接落地的片段**，注入到 shadow DOM 后能直接正确渲染。panel 会原样使用它们——不会再做后处理，也不会提供 framework runtime。

1. **Tailwind 展开。** 如果源代码使用 Tailwind（如 `className="bg-primary text-white rounded-lg px-6 py-3"`），必须把每个 utility 全部展开成 `css` 字符串中的字面 CSS 属性。**不要**引用 Tailwind class，也**不要**假设 Tailwind CSS bundle 会被加载。每个组件都要自包含。
2. **Token 解析。** 如果项目通过 `:root` 上的 CSS 自定义属性暴露 tokens（如 `--color-primary`、`--radius-md`），就用 `var(--color-primary)` 来引用——它们会穿透 shadow DOM，并保持实时绑定。如果 tokens 只存在于 JS theme object 中（如 styled-components、CSS-in-JS），那就在生成时直接解析成字面值。
3. **图标。** 一律内联为 SVG。不要引用 Lucide / Heroicons 包、图标字体，或 `<img src="...">`。常见图标通常是 16-24px，直接复制 SVG path 数据即可。
4. **状态。** 要把 `:hover`、`:focus-visible`，以及有意义时的 `:active` 规则都内联进去。只有静态默认态会让 panel 看起来像死的；带 hover + focus 的 CSS 会让它有生命力。
5. **避免 reset 膨胀。** 只提取组件里**有辨识度的** CSS（background、color、padding、border-radius、typography、transition）。跳过通用 reset（如 `box-sizing: border-box`、`line-height: inherit`、`-webkit-font-smoothing`）。panel 已经提供中性画布，不要重复塞一堆 reset。
6. **作用域 class 名。** 每个类名前都加 `ds-` 前缀（如 `ds-btn-primary`、`ds-input-search`），防止组件 CSS 在同一个 shadow DOM 中互相冲突。

#### 应该包含什么？

目标是保留一个紧凑但足够代表系统的 **5-10 个组件**：
- **规范原语**（项目里有的话总是应该包含）：button（每个 variant 单独一个组件条目）、input / text field、navigation、chip / tag、card。
- **签名型组件**（如果足够有辨识度就应该包含）：hero CTA、featured card、filter pill、以及 PRODUCT.md 中用户明确提到的重要自定义模式。
- **其余跳过。** utility components、表单底层构件、wrapper 布局——除非视觉上非常鲜明，否则不值得记录。

如果项目**还没有组件库**（例如只有一个简单 landing page，或是全新项目），就根据 tokens 合成一套 canonical primitives，采用与 DESIGN.md 规则一致的最佳实践默认值。也就是说，即使在 day zero，DESIGN.json 里也要有可以被渲染的东西。

#### 色调渐变

对每个颜色 token，都生成一个 8 步的 `tonalRamp` 数组——从深到浅，保持相同 hue 和 chroma，按从约 15% 到 95% 的 lightness 阶梯变化。panel 会把它渲染成色条。如果项目本身已经定义了 tonal scale（如 Material 的 `surface-container-low` 家族，或 Tailwind 风格的 `blue-50..blue-900`），就直接使用这些值。否则就在 OKLCH 中合成。

#### 叙述映射

直接从你刚写好的 DESIGN.md 中提取：

- `narrative.northStar` -> Overview 里的 `**创意北极星："..."**`
- `narrative.overview` -> Overview 中的哲学段落
- `narrative.keyCharacteristics` -> `**关键特征：**` 下的项目符号列表
- `narrative.rules` -> 各章节里所有的 `**The [Name] Rule.** [body]`，并附带 `section`
- `narrative.dos` / `narrative.donts` -> Do's and Don'ts 中的项目符号列表，原样复制。

不要改写。panel 会把这些内容作为可折叠的次级上下文显示出来，因此 markdown 中的那套语气应当完整延续。

### 第 5 步：确认、微调，并刷新会话缓存

1. 把完整的 DESIGN.md 展示给用户。简短点出其中那些不那么显而易见但很关键的创意决策（如描述性颜色命名、氛围语言、Named Rules）。
2. 说明 `DESIGN.json` 也已经一并写好——live panel 现在会渲染这个项目真实的 button / input / nav primitives，而不是泛化近似物。
3. 提供微调选项："Want me to revise a section, add component patterns I missed, or adjust the atmosphere language?"
4. **刷新会话缓存。** 最后再执行一次 `node {{scripts_path}}/load-context.mjs`，让新写入的 DESIGN.md 进入当前对话。这样本会话后续命令都会自动使用最新版本，而不需要再次读取。

## Seed mode

适用于还没有可提取视觉系统的项目。它产出的是一个最小脚手架，而不是完整规范。

### 第 1 步：确认 seed mode

开始访谈前先说明："There's no existing visual system to scan. I'll ask five quick questions to seed a starter DESIGN.md. You can re-run `/impeccable document` once there's code, to capture the real tokens and components. OK?"

如果用户想跳过，就直接停止。不写文件。

### 第 2 步：五个问题

把它们合并成一次 `AskUserQuestion` 互动。选项必须具体。

1. **颜色策略。** 四选一：
   - Restrained - 染色中性色 + 一个强调色，不超过约 10%
   - Committed - 一个高饱和色承担表面 30-40% 的面积
   - Full palette - 3-5 个有名字的角色色，并且每个都被刻意使用
   - Drenched - 表面本身就是颜色

   然后再问：一个 hue family 或 anchor reference（如 “deep teal”、“mustard”、“Klim #ff4500 orange”）。

2. **排版方向。** 四选一（具体字体稍后再定）：
   - Serif display + sans body
   - Single sans（warm / technical / geometric / humanist - 选一种感觉）
   - Display + mono
   - Mono-forward
   - Editorial script + sans

3. **动效能量。** 三选一：
   - Restrained - 只处理状态变化
   - Responsive - 有反馈和过渡，但没有编排式 choreography
   - Choreographed - 有编排式入场和滚动驱动序列

4. **三个具名参考。** 可以是品牌、产品、印刷物。不要给形容词。

5. **一个 anti-reference。** 它绝对不应该是是什么感觉。也必须是具名对象。

### 第 3 步：写 seed DESIGN.md

沿用 scan mode 的六章节规范。把访谈里回答过的内容写进去，其他位置诚实地留成占位符。seed 是脚手架，不是编造出来的完整 spec。

文件开头要加上：
```markdown
<!-- SEED - re-run /impeccable document once there's code to capture the actual tokens and components. -->
```

各章节在 seed mode 下的写法：
- **Overview**：根据回答组织 Creative North Star 和哲学描述（颜色策略 + 动效能量 + 参考对象）。直接引用用户的 anti-reference。
- **Colors**：把颜色策略写成 Named Rule（如 *"The Drenched Rule. The surface IS the color."*）。记录 hue family 或 anchor reference。不写 hex 值——标成 `[to be resolved during implementation]`。
- **Typography**：记录用户选择的排版方向（例如 “Serif display + sans body”）。此时不定具体字体，写成 `[font pairing to be chosen at implementation]`。
- **Elevation**：根据动效能量进行推断。Restrained / Responsive -> 默认 flat；Choreographed -> layered。写一段话即可。
- **Components**：整节省略——因为还没有组件。
- **Do's and Don'ts**：直接继承 PRODUCT.md 里的 anti-references，再加上第 5 题提到的 anti-reference。

Seed mode 下，frontmatter 只写最小字段：`name` 和 `description`，不要写 colors、typography、rounded、spacing 或 components。真正的 tokens 等下一次 scan mode 再落地。出于同样原因，seed mode 也跳过 `DESIGN.json` sidecar：此时没有可渲染的东西。

### 第 4 步：确认并刷新会话缓存

1. 把 seed DESIGN.md 展示给用户，并明确指出它是 seed（这个 marker 本身就是承诺）。
2. 告诉用户："Re-run `/impeccable document` once you have some code. That pass will extract real tokens and generate the sidecar."
3. 执行一次 `node {{scripts_path}}/load-context.mjs`，让这份 seed 在当前会话剩余时间里生效。

## 风格指南

- **frontmatter 先于 prose。** Tokens 写在 YAML frontmatter 里；prose 负责解释它们。不要在两个地方重复定义同一个 token 值——frontmatter 才是规范层。
- **在 Do's and Don'ts 里点名 PRODUCT.md 的 anti-references。** 如果 PRODUCT.md 列出 “SaaS landing-page clichés” 或 “generic AI tool marketing” 作为反例，那么 DESIGN.md 里的 Don'ts 也应逐字重复这些短语，让视觉规范把战略立场贯彻下去。
- **遵循 spec，不要发明新章节。** 六个章节名是固定的。如果你还想记录 Layout / Motion / Responsive 内容，就把它们折叠进 Overview（哲学层规则）或 Components（组件行为层）。
- **描述性优先于技术性**：像 “Gently curved edges (8px radius)” 这种写法比 “rounded-lg” 更好。技术值放在括号里，但前面先给感受描述。
- **功能性优先于装饰性**：对每个 token，要解释它**在哪里**、**为什么**被使用，而不只是它**是什么**。
- **精确值放括号里**：hex、px / rem、font weights——始终在描述旁边给出数字。
- **使用 Named Rules**：`**The [Name] Rule.** [short doctrine]`。这类规则更容易记、容易引用，对 AI 消费者来说也比普通 bullet list 更粘。Stitch 自己的产品也大量采用这种写法（如 “The No-Line Rule”、“The Ghost Border Fallback”）。每项目标是 1-3 条。
- **语气要强。** 要像设计总监说话。用 “prohibited”、“forbidden”、“never”、“always”，不要用 “consider”、“might”、“prefer”。与 PRODUCT.md 保持同样的语气强度。
- **使用具体反模式测试语句。** Stitch 会写出类似 *"If it looks like a 2014 app, the shadow is too dark and the blur is too small."* 这样的句子。一句可审计测试语句，胜过一整段抽象原则。
- **引用 PRODUCT.md。** 那里的 anti-references 应直接影响这里的 Do's and Don'ts。可以直接引用，也可以准确转述。
- **按角色分组颜色**，而不是按 hex 顺序或色相顺序。规范顺序是 Primary / Secondary / Tertiary / Neutral。

## 常见陷阱

- 不要直接粘贴原始 CSS class 名。要翻译成描述性语言。
- 不要把每个 token 都提出来。只保留那些真正复用的；一次性 token 只会污染系统。
- 不要编造并不存在的组件。如果项目里只有按钮和卡片，那就只记录这些。
- 未经询问，不要覆盖已有的 DESIGN.md。
- 不要复制 PRODUCT.md 的内容。DESIGN.md 只负责视觉层。
- 不要增加 “Layout Principles” 或 “Motion” 或 “Responsive Behavior” 这种顶层章节。规范只有六个，不是九个。把这些内容折叠到合适的位置。
- 不要害怕轻微地改章节名。必须是 “Colors”，不是 “Color Palette & Roles”；必须是 “Typography”，不是 “Typography Rules”。工具链解析依赖精确标题。
- 不要在 frontmatter 和 prose 之间重复 token 值。如果某个颜色已经在 `colors.primary` 里写成 hex，那 prose 里可以给它命名、解释其角色，但不要再写一个不一致的 hex。frontmatter 才是规范值。
- 不要在 Stitch schema 之外发明 frontmatter token 组（例如顶层 `motion:`、`breakpoints:`、`shadows:`）。Stitch 的 Zod schema 顶层只接受 `colors`、`typography`、`rounded`、`spacing`、`components`。其余内容都应进入 sidecar 的 `extensions`。