---
name: Impeccable
description: 暖纸编辑圣所 - 坚定的衬线展示字体，单一果断的洋红色，静止的平面。

# 颜色使用 OKLCH，遵循 §2 中的 `The OKLCH-Only Rule`。Stitch 的 linter 仅验证
# hex sRGB，因此它会对这些条目发出警告 - 这是为了单一真相来源和完整广色域保真度而做出的刻意权衡。我们自己的解析器接受字符串。
colors:
  editorial-magenta: "oklch(60% 0.25 350)"
  editorial-magenta-deep: "oklch(52% 0.25 350)"
  warm-ash-cream: "oklch(96% 0.005 350)"
  crisp-paper-white: "oklch(98% 0 0)"
  deep-graphite: "oklch(10% 0 0)"
  soft-charcoal: "oklch(25% 0 0)"
  mid-ash: "oklch(55% 0 0)"
  paper-mist: "oklch(92% 0 0)"
  magenta-whisper: "oklch(60% 0.25 350 / 0.15)"
  magenta-veil: "oklch(60% 0.25 350 / 0.25)"

typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 300
    lineHeight: 1
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.125rem, 2.5vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-lead:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  supporting:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
    letterSpacing: "0.05em"
  micro-label:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.1em"
  mono:
    fontFamily: "Space Grotesk, monospace"
    fontSize: "0.75rem"
    fontWeight: 400

rounded:
  none: "0"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"

spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  "2xl": "80px"
  "3xl": "120px"

components:
  button-primary:
    backgroundColor: "{colors.deep-graphite}"
    textColor: "{colors.crisp-paper-white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "16px 48px"
  button-primary-hover:
    backgroundColor: "{colors.editorial-magenta}"
    textColor: "{colors.crisp-paper-white}"
  input-text:
    backgroundColor: "transparent"
    textColor: "{colors.deep-graphite}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.warm-ash-cream}"
    textColor: "{colors.deep-graphite}"
    rounded: "{rounded.md}"
    padding: "24px"
  card-feature:
    backgroundColor: "{colors.crisp-paper-white}"
    textColor: "{colors.deep-graphite}"
    rounded: "{rounded.lg}"
    padding: "48px"
  nav-link:
    textColor: "{colors.deep-graphite}"
    typography: "{typography.body}"
  nav-link-hover:
    textColor: "{colors.editorial-magenta}"
---

# 设计系统：Impeccable

## 1. 概述：编辑圣所

**创意北极星："编辑圣所"**

Impeccable 的网站读起来更像一本印刷设计刊物，而不是标准 SaaS 落地页。它依赖有立场的排版、充足的留白，以及一个能从暖纸背景中果断切出的单一强调色。整个界面的气质是**审慎、从容、专业**，像一个已经做过无数次判断的人做出来的东西，对当下 AI 工具审美没有兴趣。

这套视觉哲学可以概括为**为工艺服务的克制**。每个元素都必须证明自己的存在价值。没有任何装饰可以脱离功能单独存在。色彩以暖纸调中性色为主体，只允许一个鲜明声部。排版采用庄重的斜体 serif 搭配干净中性的 sans。动效只留给那些确实在表达状态的时刻。这个网站本身就是 demo，它必须通过和它要求用户对自己作品执行的同一套反模式审计。

这套系统明确拒绝围绕该产品常见的 AI 工具视觉词汇：深色模式配紫色渐变、霓虹强调、玻璃拟态、黑底青光、SaaS hero-metric 布局，以及整齐复制的卡片功能网格。拿不准时，宁可比营销页少做一点，也要比作品集多做一点。

**关键特征：**
- 暖白纸张基调，带几乎不可察觉的洋红偏色，用来形成潜意识层面的色彩统一。
- 单一而果断的洋红强调色，任意一屏中的占比都不超过 10%。稀缺感本身就是设计。
- Display 文案使用斜体 serif；正文使用干净中性的 sans，行高始终在 1.6 以上。
- 主 CTA 尖锐、全大写、带字距，不接受“圆角矩形加默认阴影”的现成答案。
- 表面在静止状态下一律保持平。阴影只在 hover、抬升、focus 等状态变化时出现。
- 使用杂志尺度的不对称间距节奏，并且刻意跳过 4px 这一档。

## 2. 颜色：暖纸调色板

这是一套双和弦色板：一边是带近乎不可见洋红偏色的暖纸中性色，另一边是同色相家族里的单一果断强调色。核心系统里没有 secondary 或 tertiary accents，这种克制本身就是教条。

### 主色
- **Editorial Magenta** (oklch(60% 0.25 350))：唯一鲜明的声部。用于主 CTA、激活导航状态、实时状态指示器，以及少量编辑式强调。绝不做渐变，绝不做大面积背景铺色，也绝不做文字填充。稀缺性就是设计选择。

### 中性色
- **Warm Ash Cream** (oklch(96% 0.005 350))：主页面背景。接近白色，但带有几乎感知不到的洋红偏色，与 Editorial Magenta 形成潜意识层面的统一。用于 `body` 以及标准表面。
- **Crisp Paper White** (oklch(98% 0 0))：纯背景色。用于反相文案场景（深底白字 CTA）以及需要最大对比度的表面。几乎从不作为整页背景，因为单独使用会显得过冷。
- **Deep Graphite** (oklch(10% 0 0))：正文与标题的主文字色。比纯黑更柔和，在暖纸背景上读起来是“自信但不攻击”的感觉。同时也是主 CTA 的背景色。
- **Soft Charcoal** (oklch(25% 0 0))：次级文字，用于标语、引导段落和辅助文案。相对 Deep Graphite 明显后退，但不会被洗淡。
- **Mid Ash** (oklch(55% 0 0))：三级文字，用于微型标签、图注、元信息行，以及 “works with” 一类标签。小尺寸下读起来像有意后退的元数据。
- **Paper Mist** (oklch(92% 0 0))：发丝级边框、分区分隔线，以及那些几乎不可见的结构缝隙。

### 强调色 Alpha 变体
- **Editorial Magenta Deep** (oklch(52% 0.25 350))：Editorial Magenta 的 hover / active 状态。只轻微压暗，用来确认交互，而不是高声喊叫。
- **Magenta Whisper** (oklch(60% 0.25 350 / 0.15))：hover 时位于强调元素下方的柔和辉光背景，也可用于微妙的选中高亮。
- **Magenta Veil** (oklch(60% 0.25 350 / 0.25))：稍强一点的半透明色，用于 focus ring 和强调包裹层。

### 命令类别色调 (fenced - do not extend)
这是一套独立的 6 色色调，只用于 impeccable 的 23 个 commands 的“元素周期表式”可视化中。它们早于 OKLCH 系统出现，并且只存在于那一个组件里。**不要把这套颜色扩展到其他地方。**

- **Create** (bg `#fdf2f8` / border `#ec4899` / text `#be185d`)
- **Evaluate** (bg `#fdf4ff` / border `#d946ef` / text `#a21caf`)
- **Refine** (bg `#eff6ff` / border `#3b82f6` / text `#1d4ed8`)
- **Simplify** (bg `#fffbeb` / border `#f59e0b` / text `#b45309`)
- **Harden** (bg `#f0fdf4` / border `#22c55e` / text `#15803d`)
- **System** (bg `#f5f5f4` / border `#78716c` / text `#44403c`)

### 命名规则

**单一声部规则 (The One Voice Rule)。** Editorial Magenta 是系统中唯一允许鲜明存在的颜色。无论某个布局多么“想要”第二个强调色，都不能加。如果需要第二个强调点，就用尺度或字重，而不是再加一个 hue。

**纸张而非白色规则 (The Paper-Not-White Rule)。** 页面背景必须是 Warm Ash Cream，而不是 Crisp Paper White。纯白只留给特定的反相表面。温度在这里是承重结构，没有它，网站就会显得泛化，而那个果断的洋红也会从“果断”变成“刺眼”。

**仅限 OKLCH 规则 (The OKLCH-Only Rule)。** 所有新增颜色都必须用 OKLCH 声明。legacy 的 hex 值只允许存在于上面的 fenced Command Category Tints 中。不要把新的 hex 色值引入系统。

## 3. 排版：斜体与墨迹之声

**展示字体:** Cormorant Garamond (带 Georgia 回退)
**正文字体:** Instrument Sans (带 system-ui 回退)
**标签/等宽字体:** Space Grotesk (用作几何感 mono，而不是代码块字体)

**特性:** display 字体是一套经过提炼的 transitional serif，并且使用的是 **italic** 版本。它庄重，但不古板，借用了长篇编辑类标题的传统。正文使用的是干净中性的 sans，并带一点微妙的几何暖意，适合承载长段文字而不制造额外视觉负担。所谓 “mono” 则是一套当代 grotesque，专门保留给小标签和元信息，在这些位置上，它那种接近机器界面的气质，刚好能强化命令行产品的故事感。

### 层级

- **Display** (display family, weight 300, italic, clamp(2.5rem, 7vw, 4.5rem), line-height 1)：仅用于 hero 标题。轻字重加斜体让它读起来更像作者签名，而不是营销标题。
- **Headline** (display family, weight 400, clamp(1.75rem, 4vw, 2.5rem), line-height 1.2)：用于章节标题，是更具编辑感的大型时刻。
- **Title** (display family, weight 400, italic, clamp(1.125rem, 2.5vw, 1.75rem), line-height 1.3)：用于 hero 标语 / section leads，是更安静的第二显示声部。
- **Body** (body family, weight 400, 1rem, line-height 1.6)：正文段落。行长限制在 65-75ch 内以保证可读性。
- **Body Lead** (body family, weight 400, 1rem-1.0625rem, line-height 1.6-1.65)：每页 1-2 段 lead 段落，行距略更舒展。
- **Supporting** (body family, weight 400, 0.875rem, line-height 1.6)：图注、脚注和辅助说明。
- **Label** (body family, weight 500, 0.9rem, `text-transform: uppercase`, `letter-spacing: 0.05em`)：CTA 标签。短、硬、直接。
- **Micro-Label** (body family, weight 500, 0.625-0.6875rem, `text-transform: uppercase`, `letter-spacing: 0.1em`)：如 “Works with”、“What's Included”、“v3.0 Changelog”。
- **Monospace Meta** (mono family, weight 400-500, 0.6875-0.8125rem)：用于行内文中的命令名，以及元素周期表风格卡片上的标签。

### 命名规则

**斜体即声部规则 (The Italic-Is-Voice Rule)。** 斜体是 display 文字的一种“声音选择”，而不是正文中的强调方式。正文里的强调应当通过字重，或通过切换到 mono family 完成（参见命令菜单中的 `<em>`）。如果在段落里把斜体当强调，会稀释整套 display voice。

**1.6 行高规则 (The 1.6 Leading Rule)。** 正文行高全站统一为 1.6。不是 1.5，不是 1.7，也不是所谓 “relaxed”。网站之所以读起来平静、像一份编辑出版物，1.6 是在真正干活的那条承重规则。

**仅标题流体规则 (The Fluid-Headlines-Only Rule)。** 只有标题使用 `clamp()` 进行流体缩放。正文一律使用固定 `rem`。流体正文看起来聪明，实际读起来很别扭，它会让行长脱离规范。

## 4. 层级

默认保持纯平。深度通过**状态响应**来表达，而不是通过结构性投影来表达。所有表面都停留在 Warm Ash Cream 这层基础色调上；只有当元素被 hover、被刻意抬升，或需要从复杂背景中获得环境分离时，阴影才会出现。

### 阴影词汇表

- **柔和悬停抬升** (`0 4px 24px -4px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)`)：卡片和交互表面的默认 hover 响应。阴影发散、略向下偏移。
- **抬升卡片** (`0 20px 40px rgba(0,0,0,0.08)`)：用于有意抬升的内容，如 featured cards、安装区块。alpha 很低，绝不会读起来像一团黑影。
- **强调辉光** (`0 20px 60px var(--color-accent-dim)`)：用于那一两个真正该有磁性的时刻，在元素下方打出洋红偏色的环境光。这是阴影词汇表中的“稀有香料”，不能滥用。
- **工具提示 / 弹出框** (`0 0 20px rgba(0,0,0,0.15)` 或 `0 2px 8px rgba(0,0,0,0.1)`)：用于小型浮层 UI 的紧致阴影。

### 命名规则

**默认平坦规则 (The Flat-By-Default Rule)。** 所有表面在静止状态下都应是平的。如果你发现自己想给一个既不交互、也不需要抬升的元素加阴影，那就说明你在下意识调用 Material Design 肌肉记忆。此时应该先考虑 Paper Mist 发丝级边框，或者干脆什么都不用。

**低 Alpha 规则 (The Low-Alpha Rule)。** 系统里的所有阴影，最强那层 blur 的 alpha 都不能超过约 0.15。更高的 alpha 会立刻让人联想到 2014 年那种 Material Design drop shadow，这是“没有真正设计过”的直接信号。

**仅强调色使用带色阴影规则 (The Tinted-Shadow-Only-For-Accent Rule)。** 结构用中性阴影（黑色 alpha），带色阴影（magenta-dim）只留给刻意的 accent-glow 时刻。绝不能为了装饰而把普通阴影染色。

## 5. 组件

### 按钮

- **形状:** 默认保持平和方正（`border-radius: 0`）。尖角是一个明确的编辑式选择，它主动拒绝了大多数 AI 邻近营销页那种“圆角矩形加投影”的默认答案。
- **主按钮 (hero-cta-combined):** Deep Graphite 背景，Crisp Paper White 文字。Padding 为 16px / 48px（`--spacing-sm` / `--spacing-xl`）。全大写，`letter-spacing: 0.05em`，字重 500。静止状态下没有边框，也没有阴影。
- **悬停:** `transform: translateY(-2px)`，背景切换为 Editorial Magenta。过渡为 200ms linear ease。它像一次小而自信的抬升，不会弹跳。
- **焦点:** 保留浏览器默认 focus ring，并叠加 hover 处理。键盘 focus 必须清晰可见。
- **次级:** 作为正文中的 inline text link 出现，字重 500，hover 时切换到 Editorial Magenta。**系统中不存在 boxed secondary button**，整个站点都在避免“等权重 CTA 一层层堆叠”的模式。
- **标签 (picker overlay):** 3-5px 圆角，小 padding，mono 字体标签。只用于 live-mode 的动作选择器。

### 卡片与容器

- **角样式:** 使用受控的圆角词汇：4px（chips / inline callouts）、8px（标准卡片和卡片 CTA）、12px（feature cards、安装区块）、16px（大型内容框架）。系统里没有一个统一的 “rounded-lg” 默认值。圆角大小要和组件重量匹配。
- **背景:** 主要使用 Warm Ash Cream 或 Crisp Paper White，视层次而定。更深一层的嵌套表面可以提升到 Paper Mist，作为几乎不可察觉的色调变化。
- **阴影:** 静止状态下默认纯平，具体阴影策略见层级部分。
- **边框:** 只有在需要结构分离而又不想用阴影时，才使用 1px 的 Paper Mist 发丝边框。
- **内部 Padding:** 普通卡片为 16-32px；大型编辑式框架为 48px 以上。padding 必须匹配视觉重量，而不是一律统一。

### 输入框 / 字段

这个网站本质上是编辑型表面，因此输入控件非常克制：

- **邮箱 / 文本字段:** 4-6px 圆角，Paper Mist 发丝边框，透明背景。focus 时边框切换为 Editorial Magenta，并带 Magenta Whisper 的柔和 glow。
- **组合框 / 选择器 (filter controls):** 继承同一套描边词汇，但 padding 更小，chevron glyph 使用 Mid Ash。
- **系统中没有复杂的自定义 checkbox / radio 样式**，除了 live-mode 命令选择器所需的最小变体。

### 导航

- **网站头部:** 62px 的紧凑导航条。左侧是品牌锁定组合（单色 mark + wordmark），右侧是链接簇。
- **排版:** 使用 body family，字重 500，0.9-1rem，保持正常大小写。导航应像可读的语言，而不是一串信号灯。
- **默认状态:** Deep Graphite on Warm Ash Cream。
- **悬停 / 激活:** 通过 200ms 平滑过渡切换到 Editorial Magenta。静止时不显示下划线；若需要 active indicator，则使用一条细而明确的强调色下划线。
- **移动端:** 当横向空间不足时，收起为图标触发的 drawer。

### 命令元素周期表 (签名组件)

这是值得单独记录的签名型组件：23 个 commands 被排成一张元素周期表式网格，每个 tile 尺寸约 56x64px，带有类别色背景、类别色边框、左上角 atomic number（mono family，7px）、中央 symbol（display family，weight 500，20px），以及下方的 mono 标签。hover 时 tile 会向上抬升 2px，并出现带类别色倾向的阴影。这里是系统中唯一一处真正把 Category Tint 词汇表用作彩色表面，而不只是文字强调。

### 布局与间距 (从规范中缺失的布局部分折叠而来)

- **最大宽度:** 内容区块最大宽度 900px（`--width-content`）；页面级容器最大宽度 1400px（`--width-max`）。而 prose 本身还要继续限制到 65-75ch。
- **间距比例:** 8 / 16 / 24 / 32 / 48 / 80 / 120px（`--spacing-xs` 到 `--spacing-3xl`）。4px 这一档被故意跳过，因为这是一套编辑尺度，不是 app UI 尺度。
- **节奏:** 一级 section 之间的间距在 80-120px；section 内部内容组之间是 24-48px；紧凑簇内部则是 6-16px。
- **网格:** 不采用传统列网格。hero 区使用不对称的双栏切割。feature sections 使用 `repeat(auto-fit, minmax(280px, 1fr))`，而不是靠断点死切列数。
- **动效:** 颜色 / 透明度 150ms，transform 300-400ms，编排式入场 600-1200ms。统一使用 `--ease-out`（`cubic-bezier(0.16, 1, 0.3, 1)`）或 `--ease-out-quint`。`prefers-reduced-motion` 会折叠掉所有非必要过渡。

## 6. 应做与不应做

### 应做:

- **应** 把 Warm Ash Cream（而不是 Crisp Paper White）当作默认页面背景。温度是承重结构，见纸张而非白色规则。
- **应** 让 Editorial Magenta 在任意一屏中的占比不超过 10%。稀缺性正是它看起来果断而不是嘈杂的原因，见单一声部规则。- **Do** 所有新颜色都用 OKLCH 定义。hex 只留给 Command Category Tints 的围栏代码块。
- **Do** 将斜体 display type 视为一种声音，而非段落内强调。正文中的强调应通过字重实现。
- **Do** 标题使用 `clamp()` 实现流体缩放；正文使用固定 `rem`，参见 The Fluid-Headlines-Only Rule。
- **Do** 保持主 CTA 尖锐且方正。`border-radius: 0`、全大写、带字距。这就是编辑式签名。
- **Do** 在过渡中统一使用 `--ease-out`（`cubic-bezier(0.16, 1, 0.3, 1)`）或 `--ease-out-quint`。仅允许 expo-out 系列感觉。
- **Do** 让表面在静止状态下保持纯平。仅在 hover 或有意抬升时使用阴影，参见 The Flat-By-Default Rule。
- **Do** 所有动画都需尊重 `prefers-reduced-motion`。
- **Do** 通过 `max-width` 将正文行宽限制在 65-75ch 内。

### Don't:

- **Don't** 使用纯黑（`#000`）或纯白（`#fff`）。必须使用带色中性色（Deep Graphite / Warm Ash Cream / Crisp Paper White）。
- **Don't** 在卡片、列表项、callout 或 alert 上使用大于 1px 的 `border-left` 或 `border-right` 彩色条。永远不要。这是最容易识别的 AI 仪表盘痕迹之一。
- **Don't** 将 `background-clip: text` 与渐变结合。渐变文字全站禁用。如需强调，请使用字重或字号，绝不能用渐变填充。
- **Don't** 默认使用深色模式。此站点采用浅色模式，因为编辑式阅读本质上是浅色活动。带发光强调的深色模式，正是 Impeccable 要反抗的 AI 工具审美。
- **Don't** 使用玻璃拟态（模糊半透明卡片、玻璃边框、作为装饰的 glow 背景）。它已被 PRODUCT.md 明确列入 anti-reference。
- **Don't** 增加第二个强调色。如果某个布局“需要”第二个强调点，请使用尺度或字重，而非色相。
- **Don't** 使用带泛化投影的圆角矩形。那是“看起来像任何一种 AI 输出”的指纹。
- **Don't** 使用 bounce 或 elastic easing。真实物体的减速是平滑的，expo-out 才是这里的签名。
- **Don't** 动画化布局属性（`width`、`height`、`padding`、`margin`）。仅使用 `transform` 和 `opacity`。
- **Don't** 卡片嵌套卡片。请压平层级。
- **Don't** 使用一模一样的卡片网格（同尺寸卡片，icon + heading + text 无尽重复）。
- **Don't** 使用 hero-metric 模板（大数字 + 小标签 + 辅助统计 + 渐变强调）。这是典型 SaaS 陈词滥调。
- **Don't** 扩展 Command Category Tints 的词汇表。那套 hex 颜色只允许存在于周期表可视化中。
- **Don't** 在 UI 文案中犹豫。像 “maybe consider” 和 “could be helpful” 这样的措辞在产品内是禁止的，要匹配 PRODUCT.md 里 expert-decisive 的声音。
- **Don't** 在 8 / 16 / 24 / 32 / 48 / 80 / 120 这套尺度之外再引入新的 spacing token。如果某处确实需要一个特殊像素值，请直接写字面值，不要污染 token scale。