```markdown
---
name: <项目标题>
description: <一句话标语>
colors:
  primary: "#b8422e"
  neutral-bg: "#faf7f2"
  # ...每个提取的颜色一个条目；键 = 描述性短标识
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
- **Token 引用** 使用 `{path.to.token}`（例如 `{colors.primary}`、`{rounded.md}`）。组件可以引用基础 token；基础 token 之间不能互相引用。
- **Stitch 会将颜色校验为 hex sRGB**（`#RGB` / `#RGBA` / `#RRGGBB` / `#RRGGBBAA`）；OKLCH / HSL / P3 会触发 linter 警告，但不是硬错误。YAML 无论哪种格式都接受字符串，我们自己的 parser 也不限定格式。根据项目姿态来选：a）如果项目坚持“OKLCH-only”或使用无法可靠 round-trip 到 sRGB 的 Display-P3 值，那就直接在 frontmatter 里写 OKLCH，并接受 Stitch 的 warning；b）如果项目更在意严格通过 Stitch 校验，或计划使用他们的 Tailwind / DTCG 导出链路，那就在 frontmatter 中写 hex，并在 prose 中把 OKLCH 作为规范参考。没有明确理由时，绝不要把事实来源拆成两份。
- **组件级 token** 只允许 8 个属性：`backgroundColor`、`textColor`、`typography`、`rounded`、`padding`、`size`、`height`、`width`。阴影、动效、focus ring、backdrop-filter 等都放不进去，应该放进 sidecar（第 4b 步）。
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

1. **CSS 自定义属性**——在 CSS 文件中 grep `--color-`、`--font-`、`--spacing-`、`--radius-`、`--shadow-`、`--ease-`、`--duration-` 声明（通常位于 `src/styles/`、`public/css/`、`app/globals.css` 等）。记录名称、值，以及它定义在哪个文件里。
2. **Tailwind config**——如果存在 `tailwind.config.{js,ts,mjs}`，读取其中的 `theme.extend`，提取 colors、fontFamily、spacing、borderRadius、boxShadow。
3. **CSS-in-JS theme 文件**——如 styled-components、emotion、vanilla-extract、stitches：寻找 `theme.ts`、`tokens.ts` 或等价文件。
4. **Design token 文件**——如 `tokens.json`、`design-tokens.json`、Style Dictionary 输出、W3C token community group 格式。
5. **组件库**——扫描主要按钮、卡片、输入框、导航、对话框组件。记录它们的 variant API 和默认样式。
6. **全局样式表**——根 CSS 文件通常包含基础排版和颜色分配。
7. **可见渲染结果**——如果当前环境有浏览器自动化工具，就加载线上站点，从关键元素（body、h1、a、button、card）上采样 computed styles。这样可以抓到 token 没暴露出来的真实值。

### 第 2 步：自动提取那些可以自动提取的内容

基于发现到的 tokens 构建一个结构化草稿。对每类 token：

- **Colors**：按 Primary / Secondary / Tertiary / Neutral 分组（这是 Stitch 采用的 Material 衍生角色体系）。如果项目只有一个强调色，那就写成 Primary + Neutral，不要凭空发明 Secondary / Tertiary。
- **Typography**：把观察到的字号和字重映射到 Material 层级（display / headline / title / body / label）。记录字体栈和尺寸比例。
- **Elevation**：整理阴影词汇表。如果项目是纯平的，用 tonal layering 而不是 shadow 来表达层次，这也是有效答案——要明确写出来。
- **Components**：对每个常见组件（button、card、input、chip、list item、tooltip、nav），提取形状（圆角）、颜色分配、hover / focus 处理和内部 padding。
- **Spacing + layout**：折叠进 Overview 或相关 Components 章节。规范里**没有**单独的 Layout 章节。

### 第 2b 步：搭好 frontmatter 草稿

根据第 2 步自动提取到的 tokens，现在就起草 YAML frontmatter（第 4 步会把它写到 DESIGN.md 顶部）。这是机器可读层——live panel 和 Stitch linter 都会消费它。

- **Colors**：每个提取到的颜色写一个条目。Key 使用描述性 slug（如 `warm-ash-cream`、`editorial-magenta`，不要写成 `blue-800`）。Value 使用项目实际视为 canonical 的格式（OKLCH 或 hex——见上面 frontmatter 规则）。不要分裂事实来源：frontmatter 里只能有一种格式，不要在 prose 中再用另一个值重定义同一 token。
- **Typography**：每个角色写一个条目（`display`、`headline`、`title`、`body`、`label`）。Typography 是对象；只包含项目真实存在的属性（`fontFamily`、`fontSize`、`fontWeight`、`lineHeight`、`letterSpacing`、`fontFeature`、`fontVariation`）。
- **Rounded / Spacing**：只写项目真实使用的尺寸步进，key 名跟着项目原本的命名体系走（`sm` / `md` / `lg`，或 `surface-sm`，或数字步进）。
- **Components**：每个 variant 一个条目（`button-primary`、`button-primary-hover`、`button-ghost`）。通过 `{colors.X}`、`{rounded.Y}` 引用基础 token。如果某个 variant 需要 Stitch 那 8 个属性之外的内容（如 shadow、focus ring、backdrop-filter），就在 sidecar 里承载完整 snippet。

项目没有的内容就跳过。空尺度 key 或伪造 token 只会污染规范。

### 第 3 步：向用户询问定性语言

以下内容需要创造性输入，无法自动提取。把它们合并成一次 `AskUserQuestion` 互动：

- **Creative North Star**：为整套系统起一个命名隐喻（如“The Editorial Sanctuary”、“The Golden State Curator”、“The Lab Notebook”）。提供 2-3 个选项，且这些选项必须尊重 PRODUCT.md 中的品牌人格。
- **Overview voice**：氛围形容词。2-3 句的审美哲学、anti-references（这套系统不应给人什么感觉）。
- **Color character**（针对自动提取出的颜色）：为关键色提供描述性命名（如“Deep Muted Teal-Navy”，而不是“blue-800”）。根据色相/饱和度，为每个关键色提供 2-3 个备选名。
- **Elevation philosophy**：是 flat / layered / lifted？如果存在阴影，它们的角色是 ambient 还是 structural？
- **Component philosophy**：用一句话描述按钮、卡片、输入框的感觉（如“tactile and confident” vs. “refined and restrained”）。

尽可能引用 PRODUCT.md 中的一句话，这样用户能看到自己的战略语言被延续到了视觉层。

### 第 4 步：写入 DESIGN.md

文件顶部以第 2b 步整理好的 YAML frontmatter 开头（schema 已在本 reference 开头说明），正文则采用下面这套结构。章节标题必须逐字匹配。像 `## 2. Colors: The Coastal Palette` 这样的风格副标题是允许的。

```markdown
---
name: [项目标题]
description: [一句话标语]
colors:
  # ... 来自第 2b 步的暂存 frontmatter
---

# Design System: [项目标题]

## 1. Overview

**Creative North Star: "[带引号的命名隐喻]"**

[2-3 段整体描述：个性、密度、审美哲学。从 North Star 出发向外展开。说明这套系统明确拒绝什么（从 PRODUCT.md 的 anti-references 中提取）。以简短的 **Key Characteristics:** 要点列表结束。]

## 2. Colors

[用一句话描述调色板的特征。]

### Primary
- **[描述性名称]** (#HEX / oklch(...)): [此颜色的使用场景和原因。具体说明上下文，而不仅仅是角色。]

### Secondary (可选 - 如果项目只有一个强调色则省略)
- **[描述性名称]** (#HEX): [角色。]

### Tertiary (可选)
- **[描述性名称]** (#HEX): [角色。]

### Neutral
- **[描述性名称]** (#HEX): [文本/背景/边框/分隔线角色。]
- [...]

### 已命名的 Rules (可选，强大)
**The [规则名称] Rule.** [简短、有力的禁令或信条 - 例如 "The One Voice Rule. The primary accent is used on <=10% of any given screen. Its rarity is the point."]

## 3. Typography

**Display Font:** [字体族] (with [后备字体])
**Body Font:** [字体族] (with [后备字体])
**Label/Mono Font:** [字体族, 如果不同]

**Character:** [1-2 句话描述这对字体组合的个性。]

### Hierarchy
- **Display** ([字重], [尺寸/clamp], [行高]): [用途 - 出现的位置。]
- **Headline** ([字重], [尺寸], [行高]): [用途。]
- **Title** ([字重], [尺寸], [行高]): [用途。]
- **Body** ([字重], [尺寸], [行高]): [用途。如果相关，包含最大行宽如 65-75ch。]
- **Label** ([字重], [尺寸], [字间距], [大小写如果大写]): [用途。]

### 已命名的 Rules (可选)
**The [规则名称] Rule.** [关于字体使用的简短信条。]

## 4. Elevation

[一段话：这套系统使用阴影、色调分层，还是混合？如果“没有阴影”，请明确说明，并描述如何传达深度。]

### Shadow Vocabulary (如果适用)
- **[角色名称]** (`box-shadow: [精确值]`): [何时使用。]
- [...]

### 已命名的 Rules (可选)
**The [规则名称] Rule.** [例如 "The Flat-By-Default Rule. Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus)."]

## 5. Components

对于每个组件，先写一句简短的特征描述，然后指定形状、颜色分配、状态和任何独特行为。

### Buttons
- **Shape:** [描述圆角，括号内写精确值]
- **Primary:** [颜色分配 + padding，用语义化和精确术语]
- **Hover / Focus:** [过渡、处理方式]
- **Secondary / Ghost / Tertiary (如果适用):** [简要描述]

### Chips (如果使用)
- **Style:** [背景、文本颜色、边框处理]
- **State:** [选中/未选中，筛选/操作变体]

### Cards / Containers
- **Corner Style:** [圆角]
- **Background:** [使用的颜色]
- **Shadow Strategy:** [参考 Elevation 章节]
- **Border:** [如果有]
- **Internal Padding:** [比例]

### Inputs / Fields
- **Style:** [描边、背景、圆角]
- **Focus:** [处理方式 - 发光、边框偏移等]
- **Error / Disabled:** [如果适用]

### Navigation
- **样式、排版、默认/hover/active 状态、移动端处理。**

### [签名组件] (可选 - 如果项目有一个值得记录的独特自定义组件)
[描述。]

## 6. Do's and Don'ts

具体、有力的防护栏。每条以“Do”或“Don't”开头。要具体 - 包含精确的颜色、像素值，以及用户在 PRODUCT.md 中提到的命名反模式。**PRODUCT.md 中的每个 anti-reference 都应在这里作为“Don't”出现，并使用相同的语言**，这样视觉规范就能贯穿战略线。尽可能直接引用 PRODUCT.md：如果 PRODUCT.md 说 *"avoid dark mode with purple gradients, neon accents, glassmorphism"*，这里的 Don'ts 就应该按名称重复。

### Do:
- **Do** [包含精确值/命名规则的具体规定。]
- **Do** [...]

### Don't:
- **Don't** [具体禁令 - 例如 "use border-left greater than 1px as a colored stripe"]。
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
      "primary":        { "role": "主色",  "displayName": "编辑洋红", "canonical": "oklch(60% 0.25 350)", "tonalRamp": ["...", "...", "..."] },
      "warm-ash-cream": { "role": "中性色",  "displayName": "暖灰奶油色",    "canonical": "oklch(96% 0.005 350)", "tonalRamp": ["...", "...", "..."] }
    },
    "typographyMeta": {
      "display": { "displayName": "展示字体", "purpose": "仅用于主标题。" }
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
      "name": "主按钮",
      "kind": "button | input | nav | chip | card | custom",
      "refersTo": "button-primary",
      "description": "一句话说明是什么以及何时使用。",
      "html": "<button class=\"ds-btn-primary\">GET STARTED</button>",
      "css": ".ds-btn-primary { background: #191c1d; color: #fff; padding: 16px 48px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; border: none; border-radius: 0; transition: background 0.2s, transform 0.2s; } .ds-btn-primary:hover { background: oklch(60% 0.25 350); transform: translateY(-2px); }"
    }
  ],
  "narrative": {
    "northStar": "编辑圣所",
    "overview": "2-3 段关于设计哲学的文字 - 摘自 DESIGN.md 的概述部分。",
    "keyCharacteristics": ["...", "..."],
    "rules": [{ "name": "唯一声音规则", "body": "...", "section": "colors|typography|elevation" }],
    "dos":   ["请使用 ..."],
    "donts": ["请勿使用 ..."]
  }
}
```

**相较于 schemaVersion 1 的变化。** 旧版 sidecar 中包含 token 基础数组（`tokens.colors[]`、`tokens.typography[]` 等）。现在这些值都放入了 frontmatter。sidecar 只保留那些 frontmatter 无法承载的元数据——例如 tonal ramps、当 hex 只是近似值时对应的 canonical OKLCH、显示名称、角色提示——并且它们都通过 frontmatter 的 token 名称来索引（如 `colorMeta.<token-name>`、`typographyMeta.<token-name>`）。组件仍然保留完整的 HTML/CSS，因为 Stitch 的 8 个属性装不下这些内容。

#### 组件转换规则

`html` 和 `css` 字段必须是**自包含、可直接落地的片段**，注入 shadow DOM 后能直接正确渲染。面板会原样使用它们——不会再做后处理，也不会提供框架运行时。

1. **Tailwind 展开。** 如果源代码使用 Tailwind（如 `className="bg-primary text-white rounded-lg px-6 py-3"`），必须将每个 utility 全部展开为 `css` 字符串中的字面 CSS 属性。**不要**引用 Tailwind class，也**不要**假设 Tailwind CSS bundle 会被加载。每个组件都要自包含。
2. **Token 解析。** 如果项目通过 `:root` 上的 CSS 自定义属性暴露 tokens（如 `--color-primary`、`--radius-md`），就用 `var(--color-primary)` 来引用——它们会穿透 shadow DOM，并保持实时绑定。如果 tokens 只存在于 JS theme object 中（如 styled-components、CSS-in-JS），那就在生成时直接解析成字面值。
3. **图标。** 一律内联为 SVG。不要引用 Lucide / Heroicons 包、图标字体，或 `<img src="...">`。常见图标通常是 16-24px，直接复制 SVG path 数据即可。
4. **状态。** 要把 `:hover`、`:focus-visible`，以及有意义时的 `:active` 规则都内联进去。只有静态默认态会让 panel 看起来像死的；带 hover + focus 的 CSS 会让它有生命力。
5. **避免 reset 膨胀。** 只提取组件里**有辨识度的** CSS（background、color、padding、border-radius、typography、transition）。跳过通用 reset（如 `box-sizing: border-box`、`line-height: inherit`、`-webkit-font-smoothing`）。panel 已经提供中性画布，不要重复塞一堆 reset。
6. **作用域 class 名。** 每个类名前都加 `ds-` 前缀（如 `ds-btn-primary`、`ds-input-search`），防止组件 CSS 在同一个 shadow DOM 中互相冲突。

#### 应该包含什么？

目标是保留一个紧凑但足以代表系统的 **5-10 个组件**：
- **规范原语**（项目里有的话总是应该包含）：button（每个 variant 单独一个组件条目）、input / text field、navigation、chip / tag、card。
- **签名型组件**（如果足够有辨识度就应该包含）：hero CTA、featured card、filter pill、以及 PRODUCT.md 中用户明确提到的重要自定义模式。
- **其余跳过。** utility components、表单底层构件、wrapper 布局——除非视觉上非常鲜明，否则不值得记录。

如果项目**还没有组件库**（例如只有一个简单 landing page，或是全新项目），就根据 tokens 合成一套 canonical primitives，采用与 DESIGN.md 规则一致的最佳实践默认值。也就是说，即使在 day zero，DESIGN.json 里也要有可以被渲染的东西。

#### Tonal ramps

对每个颜色 token，都生成一个 8 步的 `tonalRamp` 数组——从深到浅，保持相同 hue 和 chroma，按从约 15% 到 95% 的 lightness 阶梯变化。panel 会把它渲染成色条。如果项目本身已经定义了 tonal scale（如 Material 的 `surface-container-low` 家族，或 Tailwind 风格的 `blue-50..blue-900`），就直接使用这些值。否则就在 OKLCH 中合成。

#### Narrative 映射

直接从你刚写好的 DESIGN.md 中提取：

- `narrative.northStar` -> Overview 里的 `**创意北极星："..."**`
- `narrative.overview` -> Overview 中的哲学段落
- `narrative.keyCharacteristics` -> `**关键特性：**` 下的项目符号列表
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

5. **一个 anti-reference。** 它绝对不应该是哪种感觉。也必须是具名对象。

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
- **使用 Named Rules**：`**The [Name] Rule.** [short doctrine]`。这类规则更容易记、容易引用，对 AI 消费者来说也比普通 bullet list 更粘。Stitch 自己的产品也大量采用这种写法（如 “The No-Line Rule”、“The Ghost Border Fallback”）。每节目标是 1-3 条。
- **语气要强**：要像设计总监说话。用 “prohibited”、“forbidden”、“never”、“always”，不要用 “consider”、“might”、“prefer”。与 PRODUCT.md 保持同样的语气强度。
- **使用具体反模式测试语句**：Stitch 会写出类似 *"If it looks like a 2014 app, the shadow is too dark and the blur is too small."* 这样的句子。一句可审计测试语句，胜过一整段抽象原则。
- **引用 PRODUCT.md**：那里的 anti-references 应直接影响这里的 Do's and Don'ts。可以直接引用，也可以准确转述。
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