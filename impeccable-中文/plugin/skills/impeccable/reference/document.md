在项目根目录生成 `DESIGN.md`，把当前视觉设计系统记录下来，让后续由 AI 生成的新页面始终保持品牌一致。

`DESIGN.md` 遵循[官方 Google Stitch DESIGN.md 格式](https://stitch.withgoogle.com/docs/design-md/format/)：前部是承载机器可读设计令牌的 YAML frontmatter，后部是按固定顺序组织的六个 Markdown 章节。**令牌是规范本体；正文负责解释如何应用它们。** 不相关的章节可以省略，但**不要调整顺序，也不要改章节名**。章节标题必须与规范逐字一致，这样其他支持 DESIGN.md 的工具（如 Stitch、awesome-design-md、skill-rest 等）才能继续解析。

## Frontmatter：令牌模式

YAML frontmatter 是机器可读层。Stitch 的 linter 会校验它，实时面板也会据此渲染色块。保持精简；每一项都应对应项目里真实使用的令牌。

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

- **令牌引用**使用 `{path.to.token}`（例如 `{colors.primary}`、`{rounded.md}`）。组件可以引用基础令牌；基础令牌之间不能互相引用。
- **Stitch 对颜色的正式校验只接受 hex sRGB**（`#RGB` / `#RGBA` / `#RRGGBB` / `#RRGGBBAA`）；OKLCH/HSL/P3 只会触发警告，不会报硬错误。YAML 本身两种都能写，我们自己的解析器也不依赖具体格式。按项目立场选：
  - 如果项目坚持“只用 OKLCH”，或使用了无法无损回写到 sRGB 的 Display-P3 值，就直接在 frontmatter 里写 OKLCH，并接受 Stitch 的警告。
  - 如果项目需要严格兼容 Stitch，或者后续要走它们的 Tailwind / DTCG 导出链路，就在 frontmatter 里写 hex，把 OKLCH 留在正文里作为权威参考。
  - 没有明确理由时，不要把同一份真相拆成两份。
- **组件子令牌**只允许 8 个属性：`backgroundColor`、`textColor`、`typography`、`rounded`、`padding`、`size`、`height`、`width`。阴影、动效、focus ring、backdrop-filter 都放不进去，这些内容写进 sidecar（Step 4b）。
- **比例尺键名是开放的。** 直接沿用项目已有命名（如 `warm-ash-cream`、`surface-container-low`），不要强行改成 Material 默认名。
- **变体靠命名约定，不靠模式字段。** 例如 `button-primary` / `button-primary-hover` / `button-primary-active` 都作为并列键。

## Markdown 正文：六个章节（顺序固定）

1. `## Overview`
2. `## Colors`
3. `## Typography`
4. `## Elevation`
5. `## Components`
6. `## Do's and Don'ts`

允许在标题中加带情绪的副标题，例如 `## 2. Colors: The [Name] Palette`，Stitch 自己的输出也这么做。但每个标题中必须包含规范要求的字面词：Overview、Colors、Typography、Elevation、Components、Do's and Don'ts。不要新增别的一级章节（如 Layout Principles、Responsive Behavior、Motion、Agent Prompt Guide）；把这些内容并入这六节里最自然的位置。

## 什么时候运行

- 用户刚执行完 `/impeccable teach`，现在需要补上视觉文档。
- 技能发现项目里还没有 `DESIGN.md`，并提示用户创建。
- 已有的 `DESIGN.md` 已经过时，和当前设计不一致。
- 在大改版之前，先把当前状态固化成参考。

如果 `DESIGN.md` 已经存在，**不要静默覆盖**。先把现有文件展示给用户，再按 {{ask_instruction}} 询问是刷新、覆盖还是合并。

## 两条路径

- **Scan mode**（默认）：项目里已经有设计令牌、组件或可渲染页面。先提取，再补足描述性语言。只要有代码可分析，就走这条。
- **Seed mode**：项目还没进入实现阶段（例如刚 teach 完，什么都没做）。询问五个高层答案，写一个标记为 `<!-- SEED -->` 的最小版 `DESIGN.md`。等代码出现后再用 scan mode 重跑。

先扫描再决定（见 Scan mode Step 1）。如果扫描结果是既没有 tokens、也没有组件文件、也没有可渲染页面，就提供 seed mode，不要静默切换。`/impeccable document --seed` 会无视代码状态，强制进入 seed mode。

## Scan mode（方案 C：自动提取，再确认描述语言）

### Step 1：找到设计资产

按优先级搜索代码库：

1. **CSS 自定义属性**：在 CSS 文件中搜索 `--color-`、`--font-`、`--spacing-`、`--radius-`、`--shadow-`、`--ease-`、`--duration-` 声明（通常在 `src/styles/`、`public/css/`、`app/globals.css` 等）。记录名称、值和定义文件。
2. **Tailwind 配置**：如果存在 `tailwind.config.{js,ts,mjs}`，读取 `theme.extend` 中的 colors、fontFamily、spacing、borderRadius、boxShadow。
3. **CSS-in-JS 主题文件**：styled-components、emotion、vanilla-extract、stitches 等，重点找 `theme.ts`、`tokens.ts` 或同类文件。
4. **设计令牌文件**：如 `tokens.json`、`design-tokens.json`、Style Dictionary 输出、W3C token community group 格式。
5. **组件库**：扫描主要的 button、card、input、navigation、dialog 组件，记录变体 API 和默认样式。
6. **全局样式表**：根级 CSS 往往包含基础排版和颜色分配。
7. **已渲染页面**：如果能用浏览器自动化工具，就打开站点，从关键元素（body、h1、a、button、.card）采样计算样式。这能补上令牌没覆盖到的最终值。

### Step 2：把能自动提取的先提取出来

基于发现的令牌生成结构化草稿。对每一类令牌：

- **Colors**：按 Stitch 使用的 Material 风格角色分组为 Primary / Secondary / Tertiary / Neutral。如果项目只有一个强调色，就只写 Primary + Neutral，不要硬编 Secondary 和 Tertiary。
- **Typography**：把观察到的字号和字重映射到 Material 层级（display / headline / title / body / label）。记录字体栈和比例关系。
- **Elevation**：整理阴影词汇表。如果项目是扁平化设计，主要靠色层而不是阴影来表现层次，也完全成立，明确写出来即可。
- **Components**：对常见组件（button、card、input、chip、list item、tooltip、nav），提取形状（圆角）、颜色分配、hover / focus 处理和内边距。
- **Spacing + layout**：折叠进 Overview 或相关组件章节。规范里**没有**单独的 Layout 章节。

### Step 2b：先搭好 frontmatter

根据 Step 2 自动提取到的令牌，先把 YAML frontmatter 起草出来（真正写入发生在 Step 4）。这是机器可读层，实时面板和 Stitch linter 都依赖它。

- **Colors**：每个提取出的颜色一个条目。键名用描述性 slug（如 `warm-ash-cream`、`editorial-magenta`，不要写 `blue-800`）。值使用项目视为权威的格式（OKLCH 或 hex，见上面的 frontmatter 规则）。不要在 frontmatter 和正文里各定义一份不同格式的“真值”。
- **Typography**：每个角色一个条目（`display`、`headline`、`title`、`body`、`label`）。它本身是对象；只写项目真实存在的属性，如 `fontFamily`、`fontSize`、`fontWeight`、`lineHeight`、`letterSpacing`、`fontFeature`、`fontVariation`。
- **Rounded / Spacing**：只写项目真实使用的阶梯，用项目自身的命名方式（`sm` / `md` / `lg`、`surface-sm`、数字阶梯都可以）。
- **Components**：每个变体一个条目（如 `button-primary`、`button-primary-hover`、`button-ghost`）。基础令牌引用用 `{colors.X}`、`{rounded.Y}`。如果某个变体需要 Stitch 8 属性以外的内容（如 shadow、focus ring、backdrop-filter），就把完整片段放进 sidecar。

项目没有的内容直接跳过。空比例尺和凭空编造的令牌只会污染规范。

### Step 3：向用户要定性语言

下面这些内容无法自动提取，需要创意判断。把它们合并成一次 `AskUserQuestion` 交互：

- **创意北极星**：给整个系统起一个单一且有画面感的隐喻名（如 “The Editorial Sanctuary”、“The Golden State Curator”、“The Lab Notebook”）。提供 2-3 个候选，并保持与 PRODUCT.md 的品牌人格一致。
- **Overview 的语气**：情绪形容词、审美哲学，用 2-3 句话说明它应该是什么感觉，同时指出它绝对不该像什么。
- **颜色性格**：给自动提取出的关键颜色起描述性名字（如 “Deep Muted Teal-Navy”，而不是 “blue-800”）。基于色相 / 饱和度为每个关键色给 2-3 个名字备选。
- **层次哲学**：flat / layered / lifted。如果用了阴影，它们扮演的是环境感还是结构感？
- **组件哲学**：用一句话描述 button、card、input 的总体性格，例如 “tactile and confident” 或 “refined and restrained”。

尽量引用 PRODUCT.md 里的原句，让用户看到自己的策略语言被延续。

### Step 4：写入 DESIGN.md

文件开头是 Step 2b 准备好的 YAML frontmatter，后面接下面这个结构。标题必须逐字一致。允许加带风格的副标题，例如 `## 2. Colors: The Coastal Palette`。

```markdown
---
name: [Project Title]
description: [one-line tagline]
colors:
  # ... staged frontmatter from Step 2b
---

# Design System: [Project Title]

## 1. Overview

**创意北极星："[命名隐喻]"**

[2-3 段整体描述：个性、密度、审美哲学。从北极星出发向外展开。说明本系统明确拒绝什么（引自 PRODUCT.md 的反面参考）。以简短的 **关键特征：** 要点列表结束。]

## 2. Colors

[用一句话描述调色板的性格。]

### Primary
- **[描述性名称]** (#HEX / oklch(...))：[此颜色的使用场景和原因。具体说明上下文，而不仅仅是角色。]

### Secondary (可选 — 如果项目只有一个强调色则省略)
- **[描述性名称]** (#HEX)：[角色。]

### Tertiary (可选)
- **[描述性名称]** (#HEX)：[角色。]

### Neutral
- **[描述性名称]** (#HEX)：[文本 / 背景 / 边框 / 分隔线角色。]
- [...]

### 命名规则 (可选，但很有效)
**[规则名称] 规则。** [简短、有力的禁令或信条 — 例如 “单一声音规则。主强调色在任何给定屏幕上使用面积 ≤10%。其稀缺性正是关键。”]

## 3. Typography

**Display 字体：** [字体族]（备用：[备用字体]）
**Body 字体：** [字体族]（备用：[备用字体]）
**Label/Mono 字体：** [字体族，如果不同]

**性格：** [1-2 句话描述字体配对的个性。]

### 层级
- **Display** ([字重], [字号/clamp], [行高])：[用途 — 出现的位置。]
- **Headline** ([字重], [字号], [行高])：[用途。]
- **Title** ([字重], [字号], [行高])：[用途。]
- **Body** ([字重], [字号], [行高])：[用途。如果相关，包含最大行宽如 65–75ch。]
- **Label** ([字重], [字号], [字间距], [大小写，如大写])：[用途。]

### 命名规则 (可选)
**[规则名称] 规则。** [关于字体使用的简短信条。]

## 4. Elevation

[一段话：本系统使用阴影、色调分层还是混合方式？如果“无阴影”，请明确说明，并描述如何传达深度。]

### 阴影词汇表 (如果适用)
- **[角色名称]** (`box-shadow: [精确值]`)：[何时使用。]
- [...]

### 命名规则 (可选)
**[规则名称] 规则。** [例如 “默认扁平规则。静止状态下表面是扁平的。阴影仅作为对状态（悬停、提升、聚焦）的响应出现。”]

## 5. Components

对于每个组件，先给出简短的性格描述，然后指定形状、颜色分配、状态和任何独特行为。

### Buttons
- **形状：** [描述圆角，括号内给出精确值]
- **Primary：** [颜色分配 + 内边距，用语义化和精确术语]
- **Hover / Focus：** [过渡、处理方式]
- **Secondary / Ghost / Tertiary (如果适用)：** [简要描述]

### Chips (如果使用)
- **样式：** [背景、文本颜色、边框处理]
- **状态：** [选中 / 未选中，筛选 / 操作变体]

### Cards / Containers
- **角样式：** [圆角]
- **背景：** [使用的颜色]
- **阴影策略：** [引用 Elevation 章节]
- **边框：** [如果有]
- **内部内边距：** [比例尺]

### Inputs / Fields
- **样式：** [描边、背景、圆角]
- **Focus：** [处理方式 — 发光、边框偏移等]
- **Error / Disabled：** [如果适用]

### Navigation
- **样式、字体、默认/悬停/活动状态、移动端处理。**

### [标志性组件] (可选 — 如果项目有一个值得记录的独特自定义组件)
[描述。]

## 6. Do's and Don'ts

具体、有力的防护栏。每条以“Do”或“Don't”开头。要具体 — 包含精确的颜色、像素值，以及用户在 PRODUCT.md 中提到的命名反模式。**PRODUCT.md 中的每一个反面参考都应在此处作为“Don't”出现，并使用相同的语言**，这样视觉规范就能贯穿战略线。尽可能直接引用 PRODUCT.md：如果 PRODUCT.md 说 *“避免使用带有紫色渐变、霓虹强调、玻璃拟态的暗色模式”*，这里的 Don'ts 应该按名称重复这一点。

### Do:
- **Do** [包含精确值/命名规则的具体规定。]
- **Do** [...]

### Don't:
- **Don't** [具体禁令 — 例如 “使用大于 1px 的 border-left 作为彩色条纹”]
- **Don't** [...]
- **Don't** [...]
```

### Step 4b：写入 DESIGN.json sidecar（只放扩展信息）

Frontmatter 负责基础令牌（colors、typography、rounded、spacing、components）。根目录的 `DESIGN.json` sidecar 用来承载 **Stitch 模式装不下的内容**：每个颜色的色调渐变、阴影 / elevation 令牌、motion 令牌、断点、完整组件 HTML/CSS 片段（面板会把它们渲染进 shadow DOM），以及叙事性内容（北极星、规则、do's/don'ts）。它是 frontmatter 的扩展层，不是重复层。

每次重建 `DESIGN.md` 时都要同步重建 sidecar。如果用户只要求刷新 sidecar（例如实时面板提示 stale），就保留 `DESIGN.md`，只重写 `DESIGN.json`。

#### 模式

```json
{
  "schemaVersion": 2,
  "generatedAt": "ISO-8601 string",
  "title": "Design System: [Project Title]",
  "extensions": {
    "colorMeta": {
      "primary":        { "role": "primary",  "displayName": "Editorial Magenta", "canonical": "oklch(60% 0.25 350)", "tonalRamp": ["...", "...", "..."] },
      "warm-ash-cream": { "role": "neutral",  "displayName": "Warm Ash Cream",    "canonical": "oklch(96% 0.005 350)", "tonalRamp": ["...", "...", "..."] }
    },
    "typographyMeta": {
      "display": { "displayName": "Display", "purpose": "仅用于主标题。" }
    },
    "shadows": [
      { "name": "ambient-low", "value": "0 4px 24px rgba(0,0,0,0.12)", "purpose": "强调元素下方的漫射悬停光晕。" }
    ],
    "motion": [
      { "name": "ease-standard", "value": "cubic-bezier(0.4, 0, 0.2, 1)", "purpose": "状态过渡的默认缓动。" }
    ],
    "breakpoints": [
      { "name": "sm", "value": "640px" }
    ]
  },
  "components": [
    {
      "name": "Primary Button",
      "kind": "button | input | nav | chip | card | custom",
      "refersTo": "button-primary",
      "description": "一句话说明是什么以及何时使用。",
      "html": "<button class=\"ds-btn-primary\">GET STARTED</button>",
      "css": ".ds-btn-primary { background: #191c1d; color: #fff; padding: 16px 48px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; border: none; border-radius: 0; transition: background 0.2s, transform 0.2s; } .ds-btn-primary:hover { background: oklch(60% 0.25 350); transform: translateY(-2px); }"
    }
  ],
``````json
  "narrative": {
    "northStar": "The Editorial Sanctuary",
    "overview": "2-3 paragraphs of the philosophy — pulled from DESIGN.md Overview section.",
    "keyCharacteristics": ["...", "..."],
    "rules": [{ "name": "The One Voice Rule", "body": "...", "section": "colors|typography|elevation" }],
    "dos":   ["Do use ..."],
    "donts": ["Don't use ..."]
  }
}
```

**相对于 schemaVersion 1 的变化。** 旧的 sidecar 文件包含基础令牌数组（`tokens.colors[]`、`tokens.typography[]` 等），这些值现在都迁移到了 frontmatter 中。sidecar 只保留 frontmatter 无法表达的元数据：色阶、当 hex 只是近似值时的 canonical OKLCH、显示名、角色提示等，并以 frontmatter 的 token 名称为键（如 `colorMeta.<token-name>`、`typographyMeta.<token-name>`）。组件仍然保留完整的 HTML/CSS，因为 Stitch 的那 8 个属性装不下它们。

#### 组件转换规则

`html` 和 `css` 字段必须是**自包含、可直接落地**的片段，注入 shadow DOM 后就能正确渲染。面板会直接应用它们，不做后处理，也不提供框架运行时。

1.  **Tailwind 展开。** 如果源代码使用 Tailwind（如 `className="bg-primary text-white rounded-lg px-6 py-3"`），必须把每个 utility 展开成字面 CSS，写进 `css` 字符串。不要依赖 Tailwind class，也不要假设运行环境已经加载了 Tailwind。
2.  **令牌解析。** 如果项目把 tokens 暴露为 `:root` 上的 CSS 自定义属性（如 `--color-primary`、`--radius-md`），就用 `var(--color-primary)` 这种形式引用，它们会穿过 shadow DOM，保持联动。如果 tokens 只存在于 JS 主题对象里（styled-components、CSS-in-JS），就在生成时解析成字面值。
3.  **图标。** 直接内联 SVG。不要引用 Lucide、Heroicons、图标字体或 `<img src="...">`。常见图标一般 16-24px，把 SVG path 数据原样带上。
4.  **状态。** 内联写出 `:hover`、`:focus-visible`，必要时加 `:active`。只有静态默认态会让面板显得死气沉沉。
5.  **不要夹带 reset 噪音。** 只保留组件真正有辨识度的 CSS（背景、颜色、padding、圆角、字体、过渡）。不要重复发送通用 reset（如 `box-sizing: border-box`、`line-height: inherit`、`-webkit-font-smoothing`）。
6.  **类名前缀。** 每个类都加 `ds-` 前缀（如 `ds-btn-primary`、`ds-input-search`），避免同一个 shadow DOM 里多个组件互相污染。

#### 应该包含什么

控制在 **5-10 个组件**，只选最能代表视觉系统的：

-   **规范基础件**：button（每个变体都单独一个组件项）、input / text field、navigation、chip / tag、card。
-   **签名组件**：如果有辨识度很强的 hero CTA、featured card、filter pill，或 PRODUCT.md 明确提到的重要自定义模式，也要包含。
-   **其余的跳过。** 工具性组件、纯表单底座、外层布局壳，不够有视觉特征时不值得写。

如果项目里**还没有组件库**（比如刚起步的 landing page，或空白项目），就根据 tokens 合成一套符合 DESIGN.md 规则的规范基础件。即使是 day zero，`DESIGN.json` 也必须至少能渲染出一些东西。

#### Tonal ramps

为每个颜色令牌生成 8 级 `tonalRamp` 数组，从深到浅，保持同一色相和色度，亮度大约从 15% 递进到 95%。面板会把它渲染成色带。如果项目已经有现成的色阶（如 Material 的 `surface-container-low` 家族，或 Tailwind 风格的 `blue-50..blue-900`），就直接沿用；否则用 OKLCH 合成。

#### Narrative 映射

直接从刚写好的 DESIGN.md 中抽取：

-   `narrative.northStar` → Overview 里的 `**Creative North Star: "..."**`
-   `narrative.overview` → Overview 中解释哲学的那几段正文
-   `narrative.keyCharacteristics` → `**Key Characteristics:**` 下的项目符号列表
-   `narrative.rules` → 各章节中所有 `**The [Name] Rule.** [body]`，并标上 `section`
-   `narrative.dos` / `narrative.donts` → Do's and Don'ts 里的原始项目符号

不要改写。面板会把这些内容作为可折叠的次级上下文展示，Markdown 里的声音要完整延续过去。

### Step 5：确认、细修，并刷新会话缓存

1.  把完整的 `DESIGN.md` 展示给用户，简要指出那些不那么显然但重要的创意选择，例如颜色命名、氛围语言、命名规则。
2.  顺带说明 `DESIGN.json` 也已经一起写好，这样实时面板展示的就是项目真实的 button / input / nav，而不是通用近似件。
3.  提供继续微调的入口，例如：“要不要我改某一节、补漏掉的组件模式，或者收紧 / 放开整体氛围语言？”
4.  **刷新会话缓存。** 最后运行 `node {{scripts_path}}/load-context.mjs`，把新写入的 `DESIGN.md` 载入当前对话。这样本次会话后续命令就能直接使用最新上下文，不必再重复读文件。

## Seed mode

适用于还没有可提取视觉系统的项目。它产出的是最小脚手架，不是完整规范。

### Step 1：确认 seed mode

访谈前先说清楚：

“当前没有可扫描的现成视觉系统。我会先问五个简短问题，生成一份起步版 `DESIGN.md`。等项目有代码后，你可以重新运行 `/impeccable document`，把真实令牌和组件提取进去。可以吗？”

如果用户不想做，直接停止，不写文件。

### Step 2：五个问题

合并成一次 `AskUserQuestion` 交互，选项要具体：

1.  **颜色策略。** 选一个：
    -   Restrained：有色中性 + 单一强调色，占比 ≤10%
    -   Committed：一个高饱和色承担 30–60% 的界面面积
    -   Full palette：3–4 个明确命名的颜色角色共同工作
    -   Drenched：界面本身就是颜色

    然后再补一个色相家族或锚点参考，例如 “deep teal”、“mustard”、“Klim #ff4500 orange”。

2.  **排版方向。** 选一个（具体字体以后再定）：
    -   Serif display + sans body
    -   单一 sans（warm / technical / geometric / humanist 任选一种气质）
    -   Display + mono
    -   Mono-forward
    -   Editorial script + sans

3.  **动效能量。** 选一个：
    -   Restrained：只有状态变化
    -   Responsive：有反馈和过渡，但没有编排
    -   Choreographed：有组织的进场、滚动驱动序列

4.  **三个命名参考。** 品牌、产品、印刷物都行，不要只给形容词。

5.  **一个反参考。** 它绝对不能像什么，也必须是有名字的对象。

### Step 3：写 seed DESIGN.md

仍然使用 Scan mode 的六节结构，但只填访谈能支撑的内容，其余部分老实留白。Seed 是脚手架，不是假装完整。

文件开头先加：

```markdown
<!-- SEED — re-run /impeccable document once there's code to capture the actual tokens and components. -->
```

各章节在 seed mode 下的写法：

-   **Overview**：根据颜色策略、动效能量和参考对象，写出 Creative North Star 和整体哲学，并直接引用用户给出的反参考。
-   **Colors**：把颜色策略写成 Named Rule，例如 *“The Drenched Rule. The surface IS the color.”*。写出色相家族或锚点参考。不写 hex，用 `[to be resolved during implementation]` 标明后补。
-   **Typography**：写用户选择的方向，例如 “Serif display + sans body”。不写具体字体名，用 `[font pairing to be chosen at implementation]` 占位。
-   **Elevation**：根据动效能量推断。Restrained / Responsive 通常是默认扁平；Choreographed 通常更适合分层。用一句话说明。
-   **Components**：整个章节省略，因为还没有实际组件。
-   **Do's and Don'ts**：直接承接 PRODUCT.md 的反参考，以及问题 5 里给出的反参考。

Seed mode 的 frontmatter 只写最少的 `name` 和 `description`，不写 colors、typography、rounded、spacing、components。真实令牌等下一次 scan mode 再落地。同理，seed mode 跳过 `DESIGN.json` sidecar，因为此时没有任何东西可渲染。

### Step 4：确认并刷新会话缓存

1.  把 seed 版 `DESIGN.md` 展示给用户，并明确说明这只是 seed，文件里的标记就是这个承诺。
2.  告诉用户：“等你有代码后，重新执行 `/impeccable document`。下一次会提取真实 tokens，并生成 sidecar。”
3.  运行一次 `node {{scripts_path}}/load-context.mjs`，把 seed 文档装进当前会话，供后续命令直接使用。

## 风格准则

-   **Frontmatter 优先，正文随后。** 令牌放 YAML frontmatter；正文只负责解释上下文。不要在两处重复定义同一个值，frontmatter 才是规范本体。
-   **在 Do's and Don'ts 中点名引用 PRODUCT.md 的反参考。** 如果 PRODUCT.md 写了 “SaaS landing-page clichés” 或 “generic AI tool marketing”，这里的 Don't 就要原样复现这些词，让视觉规范真正承接战略边界。
-   **严格遵守六节规范，不要私增章节。** 如果需要写布局、动效、响应式，把它们并进 Overview 或 Components，而不是新增一级标题。
-   **描述优先于技术缩写。** “轻微弧形边角（8px radius）” 比 “rounded-lg” 更好。技术值写在括号里，但让描述先行。
-   **强调功能而不是装饰。** 每个令牌都要解释“在哪里用、为什么用”，而不是只说明它“是什么”。
-   **精确数值写在括号里。** hex、px/rem、font-weight 等，和描述并列给出。
-   **多用 Named Rules。** `**The [Name] Rule.** [short doctrine]` 这种结构更易记、更容易被引用，对 AI 消费者也更有粘性。Stitch 自己的输出大量使用这种写法（如 “The No-Line Rule”、“The Ghost Border Fallback”）。每节争取 1-3 条。
-   **语气要强。** 像设计总监，不像旁观者。多用 “prohibited”、“forbidden”、“never”、“always”，少用 “consider”、“might”、“prefer”。与 PRODUCT.md 的语气对齐。
-   **反模式测试要具体。** 例如 Stitch 常写：*“If it looks like a 2014 app, the shadow is too dark and the blur is too small.”* 这种一句话审查标准，比一大段原则更有效。
-   **持续参考 PRODUCT.md。** 那里的 anti-references 应该直接驱动这里的 Do's and Don'ts。可以直接引用，也可以精确转述。
-   **颜色按角色分组，不按色相或十六进制排序。** 顺序应始终是 Primary / Secondary / Tertiary / Neutral。

## 常见坑

-   不要把原始 CSS class 名直接贴进文档，要翻成描述性语言。
-   不要把每一个 token 都抓出来，只记录真正复用的部分；一次性值会污染系统。
-   不要发明不存在的组件。如果项目里只有 buttons 和 cards，就只写它们。
-   没问用户就不要覆盖已有 `DESIGN.md`。
-   不要和 PRODUCT.md 重复内容。`DESIGN.md` 只负责视觉。
-   不要新增 “Layout Principles”、“Motion”、“Responsive Behavior” 这类一级标题。规范只有六节，不是九节。额外内容要折叠进正确位置。
-   不要哪怕轻微地改章节名。“Colors” 就是 “Colors”，不要写成 “Color Palette & Roles”；“Typography” 也不要改成 “Typography Rules”。很多工具依赖精确匹配。
-   不要在 frontmatter 和正文里重复写一份 token 数值。如果 `colors.primary` 在 frontmatter 里已经是 hex，正文可以命名并解释它的用途，但不要再声称另一套不同的数值。frontmatter 才是规范本体。
-   不要在 frontmatter 顶层发明 Stitch 模式外的字段（比如 `motion:`、`breakpoints:`、`shadows:`）。Stitch 的 Zod 模式只接受 `colors`、`typography`、`rounded`、`spacing`、`components`。其他内容都应该进 sidecar 的 `extensions`。
```