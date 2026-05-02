交互式实时变体模式：在浏览器中选中元素，选择一个设计动作，然后通过开发服务器的 HMR 热替换 AI 生成的 HTML + CSS 变体。

## 前提条件

需要一个正在运行且支持热更新的开发服务器（Vite、Next.js、Bun 等），或者浏览器中已经打开一个静态 HTML 文件。

## 协议（请先阅读）

必须严格按顺序执行，不可跳过或调换步骤。

1.  `live.mjs`：启动。
2.  打开能提供 `pageFile` 的 URL（从 `package.json`、文档、终端输出或已打开标签页中推断）。如果无法有把握地推断，只提示用户一次，让他打开开发/预览 URL。绝对不要将 `serverPort` 当作这个 URL，它是辅助服务端口，不是应用地址。
3.  轮询循环使用默认长超时（600000 毫秒）。每次事件处理完，或执行完 `--reply` 之后，立即再次运行 `live-poll.mjs`。不要传递短 `--timeout=` 参数。
4.  收到 `generate`：如果有截图则先读取截图；加载对应动作的参考；规划三个明显不同的方向；一次性写完所有变体；执行 `--reply done`；然后继续轮询。
5.  收到 `accept` / `discard`：轮询脚本已执行清理，只需继续轮询。
6.  收到 `exit`：执行文末的清理操作。

Harness 策略：

- **Claude Code**：将轮询作为**后台任务**运行（不要缩短超时）。Harness 会在完成时通知主会话，不要阻塞 shell。
- **Cursor**：将轮询放在**前台**运行（阻塞 shell，不要放到后台终端，也不要交给子代理）。Cursor 的后台终端和子代理无法稳定地将轮询的 stdout 继续推回聊天。
- **Codex**：将轮询放在**前台**运行（阻塞 shell，不要后台运行，也不要交给子代理）。Codex 的后台执行会话当前不能稳定地在事件到达时将轮询 stdout 送回对话，放后台会直接卡死实时模式。
- **其他 harness**：除非你明确知道 stdout 能可靠回流当前会话，否则一律在前台运行。

聊天本身是额外开销。不要复盘，不要输出教程，不要粘贴 PRODUCT / DESIGN 正文。将 token 用在工具和编辑上。失败时只用一两句简短的话说明。

## 启动

```bash
node {{scripts_path}}/live.mjs
```

输出 JSON：`{ ok, serverPort, serverToken, pageFiles, hasProduct, product, productPath, hasDesign, design, designPath, migrated }`。`pageFiles` 是被注入的 HTML 入口列表。生成变体时始终记住 PRODUCT.md 与 DESIGN.md：**视觉决策以 DESIGN.md 为准；策略 / 语气以 PRODUCT.md 为准。** 如果 `migrated: true`，说明加载器已将旧的 `.impeccable.md` 自动重命名为 `PRODUCT.md`；只提醒一次，并顺带建议执行 `/impeccable document` 来补配套的 `DESIGN.md`。

`serverPort` 和 `serverToken` 属于一个小型 **Impeccable live helper** HTTP 服务（提供 `/live.js`、SSE 和 `/poll`）。这个端口**不是**你的开发服务器，通常也不是你在浏览器中打开应用的地址。浏览器页面地址应该是实际提供 `pageFiles` 的那个源（Vite / Next / Bun / 隧道 / 局域网域名）。

如果输出是 `{ ok: false, error: "config_missing" | "config_invalid", path }`，说明当前项目还未为实时模式配置好，或配置已过期。处理方法见文末 **首次设置**。

## 轮询循环

```text
LOOP:
  node {{scripts_path}}/live-poll.mjs   # 使用默认长超时；不要传递 --timeout=
  读取 JSON；根据 "type" 分发

  "generate"  → 处理 Generate；回复 done；LOOP
  "accept"    → 处理 Accept；LOOP
  "discard"   → 处理 Discard；LOOP
  "prefetch"  → 处理 Prefetch；LOOP
  "timeout"   → LOOP
  "exit"      → break → 清理
```

## 处理 `generate`

事件格式：`{id, action, freeformPrompt?, count, pageUrl, element, screenshotPath?, comments?, strokes?}`。

速度很重要，用户正在盯着加载动画。尽量减少工具调用，优先使用 `wrap` 辅助，并在一次编辑中写完所有变体。

### 1. 读取截图（如果有）

`event.screenshotPath` **只有在用户点击 Go 之前至少画了一条标注或写了一条评论时才会出现。** 一旦出现，它就是一个绝对路径 PNG，内容是该元素在当前页面上的渲染结果，并且已经将标注烘焙进去。**规划之前必须先读取它**，因为这些标注包含仅靠 `element.outerHTML` 无法恢复的用户意图。

如果没有 `screenshotPath`，不要主动索要，也不要自己去找当前截图。这里的缺失是刻意设计的：没有标注时，截图会将模型锚定在现状上，反而妨碍“三个明显不同方向”的要求。此时应直接根据 `element.outerHTML`、`event.element` 中的计算样式，以及 `freeformPrompt` 进行工作。

`event.comments` 和 `event.strokes` 还会提供结构化标注元数据。以截图为主，结构化数据只用于补充那些值得明确引用的细节（例如评论的原文）。

精确读取标注的规则：

- **评论的位置是有语义负载的。** 它的 `{x, y}` 是元素局部坐标系中的 CSS 像素（与 `element.boundingRect` 同一坐标空间）。要找到这个点下方对应的子元素，并将评论文本局部应用到那个子元素上。标题附近的评论就是在说标题，不是全局概括。
- **评论和笔迹默认是彼此独立的标注**，除非它们明显重叠或距离极近。不要因为某条粗笔迹更显眼，就覆盖掉另一处位置明确、文字具体的评论。
- **笔迹是手势，要按形状理解。** 封闭圈表示“这个东西”；箭头表示方向（移动 / 指向）；叉号或斜线表示删除；自由涂抹可能表示强调，也可能表示划掉，要结合上下文判断。圈住 X 区域表示“重点看这里”，不等于“只能改这个圈内的像素”。
- **如果某条笔迹的意图不明确**（例如到底是圆圈还是箭头，是强调还是移动），要在理由中用一句话说明你的判断，而不是闷声猜测。如果这种不确定性会实质改变设计简报，就先问一个很短的澄清问题，再开始生成。

### 2. 包裹目标元素

```bash
node {{scripts_path}}/live-wrap.mjs --id EVENT_ID --count EVENT_COUNT --element-id "ELEMENT_ID" --classes "class1,class2" --tag "div" --text "TEXT_SNIPPET"
```

参数映射要保持分离，不要偷懒合并成 `--query`：

- `--element-id` ← `event.element.id`
- `--classes` ← `event.element.classes` 用逗号拼接
- `--tag` ← `event.element.tagName`
- `--text` ← `event.element.textContent` 的前约 80 个字符（修剪、单行化）。**每次都要传递。** 当选中元素和同级兄弟共享 class + tag（例如一组 `<Card>` 或重复 section）时，真正帮助消除歧义的就是这段文本。不传递的话，wrap 会静默命中第一个相同节点，最后改错位置。

辅助脚本先按 ID 查找，再按 class，再按 tag + class 组合查找。如果 `event.pageUrl` 已经足够推断文件（例如 `/` 往往对应 `index.html`），可以顺带传递 `--file PATH`，这样它就能跳过搜索。`--query` 只是纯文本回退，不是正常定位元素的主路径。

如果 `--text` 仍然命中了多个同等匹配项，wrap 会返回 `{ error: "element_ambiguous", candidates: [...] }`，并附带 `fallback: "agent-driven"`。这时读取候选行号范围，结合页面上下文自行判断目标节点，再按回退流程手动编写包装器。

成功输出：`{ file, insertLine, commentSyntax }`。

**回退类错误。** wrap 只会写入它判断为源码的文件（已被 git 跟踪、未标记 GENERATED、也未列入 config 的 `generatedFiles`）。如果目标只能落到生成文件中，它会直接报错而不写入，因为将 accept 结果持久化进生成文件等于静默丢失。三类错误：

- `{ error: "file_is_generated", file, hint }`：用户显式传递的 `--file` 指向生成文件。
- `{ error: "element_not_in_source", generatedMatch, hint }`：该元素只存在于生成文件中，下次构建就会被覆盖。
- `{ error: "element_not_found", hint }`：项目文件中根本找不到该元素，通常是运行时注入的（JS 组件、数据驱动渲染）。

这三类都会带 `fallback: "agent-driven"`。按下方 **处理回退** 处理。

### 3. 加载动作对应的参考文件

如果 `event.action` 是 `impeccable`（默认自由动作），使用 SKILL.md 中的共享法则，再叠加当前已加载的语域参考（`brand.md` 或 `product.md`）。不要去读某个子命令参考。**自由动作不等于可以跳过参数。** 你仍然要遵守下文 **§7 参数** 的构图预算和自由动作偏向。子命令文件会列出必须提供的签名旋钮；自由动作没有这个文件级约束，所以尺寸旋钮、重心轴这些选择要靠你自己根据结构和重点判断。

任何其他 `event.action`（`bolder`、`quieter`、`distill`、`polish`、`typeset`、`colorize`、`layout`、`adapt`、`animate`、`delight`、`overdrive`）：在规划之前必须先读 `reference/<action>.md`。这些子命令各自代表一门明确的设计学科；不读参考文件，输出几乎必然变成泛化样式。子命令文件可能还会强制某些参数，这些要求要叠加到 §7 的预算上，而不是替代它。

### 4. 先规划三个真正不同的方向

在写任何一行代码之前，先为每个变体命名。

**自由动作（`action` 为 `impeccable`，或用户给出了自由提示）**：每个变体都要锚定在不同的**原型**上，即一个足够具体、肉眼一看就能辨认的现实设计类比。不要写 “modern landing page”，也不要写 “minimal product hero”。可接受的例子：

- *Broadsheet masthead with rule-divided columns*（像纽约时报头版）
- *Klim Type Foundry specimen page*（高密度、技术化、目录感很强）
- *Japanese print-poster minimalism with a single oversize glyph*
- *Bloomberg Terminal status bar*
- *Condé Nast Traveler feature layout*

然后再为每个变体指定一个不同的**主差异轴**：

1.  **层级**：哪一个元素统治视觉焦点？
2.  **布局拓扑**：堆叠 / 并列 / 栅格 / 非对称 / 覆叠
3.  **排版系统**：字体搭配、比例、大小写 / 字重策略
4.  **颜色策略**：克制 / 坚定 / 全色域 / 浸染
5.  **密度**：极简 / 舒展 / 高密
6.  **结构分解**：合并、拆分、渐进展开

三个变体必须对应三个不同主轴，不要做成三版只是换色的小迭代。

**如果主差异轴是颜色或主题，禁止三版共享同一种主题 + 主色相。** 两个深色加一个深色，不算真正不同。理想状态是一个深色中性 + 强调色、一个浅色浸染、一个高饱和全彩，形成三个完全不同的颜色世界。

**先做眯眼测试，再下笔。** 将三个一句话描述并排写出来：

> V1: Broadsheet masthead, ruled columns, 24px ink on cream.  
> V2: Enormous italic title, catalog spec rows, heavy monospace data.  
> V3: Card-framed poster with one oversize glyph, magenta veil.

如果两句明显押韵（例如“都靠大字号”、“都是竖向堆叠”、“都把 CTA 放成主角”），就重做其中一个。自由动作最常见的失败模式就是三版本质上一样，只换一点表层皮肤。

**对于动作型子命令**，每个变体都必须沿动作所命名的维度变化：

- `bolder`：每个变体分别放大不同维度（尺寸 / 饱和度 / 结构变化），不要做三版“稍微更大”。
- `quieter`：每版分别减掉不同维度（颜色 / 装饰 / 间距）。
- `distill`：每版移除不同类别的冗余（视觉噪音 / 重复内容 / 多余嵌套）。
- `polish`：每版聚焦不同细化方向（节奏 / 层级 / 微细节，例如圆角、焦点态、光学字距）。
- `typeset`：每版都必须是不同字体搭配，并且比例也不同，不要围着同一组搭配做三个微调。
- `colorize`：每版都必须是不同色相家族，不是同色系深浅变化，同时变化色度和对比策略。
- `layout`：每版必须是不同结构（堆叠 / 并列 / 栅格 / 非对称），不要只改间距。
- `adapt`：每版对应不同目标上下文（移动优先 / 平板 / 桌面 / 打印 / 低数据）。不要做三版移动端。
- `animate`：每版对应不同动效词汇（级联交错 / 裁剪擦除 / 缩放聚焦 / 变形 / 视差），不要只是三个交错淡入。
- `delight`：每版对应不同类型的惊喜（微交互、排版反差、插图点缀、声音 / 触觉暗示、彩蛋式交互）。
- `overdrive`：每版打破不同常规（尺寸 / 结构 / 动效 / 输入模型 / 状态转换）。在实时模式中跳过 `overdrive.md` 里“先提案再询问”的环节，因为这里不是交互问答模式。

### 5. 应用自由提示词（如果有）

`event.freeformPrompt` 是方向上限，所有变体都必须尊重它，但仍然要给出有意义的不同解释。例如 “Make it feel like a newspaper front page”，可以拆成：

- 变体 1：broadsheet masthead + 规则分栏
- 变体 2：tabloid 大标题 + 单一主图
- 变体 3：极简 editorial + 超大首字下沉

而不是做三份同一种报纸风格。

### 6. 一次编辑写完全部变体

每个变体都应该是对原始元素的**完整 HTML 替换**，不是只打一层 CSS 补丁。设计时要考虑该元素所在上下文（`event.element` 提供的计算样式、父级结构、CSS 变量等）。

在 `wrap` 返回的 `insertLine` 位置，一次性写入 CSS + 全部变体。将作用域化 CSS 直接作为 `<style>` 标签内联在变体包装器中。`<style>` 在现代浏览器的任何位置都可用，这样 CSS 和 HTML 能原子到位，不会出现 FOUC。

```html
<!-- Variants: insert below this line -->
<style data-impeccable-css="SESSION_ID">
  @scope ([data-impeccable-variant="1"]) { ... }
  @scope ([data-impeccable-variant="2"]) { ... }
</style>
<div data-impeccable-variant="1">
  <!-- variant 1: full element replacement (single top-level element) -->
</div>
<div data-impeccable-variant="2" style="display: none">
  <!-- variant 2: full element replacement -->
</div>
<div data-impeccable-variant="3" style="display: none">
  <!-- variant 3: full element replacement -->
</div>
```

**每个 variant div 里必须只有一个顶层元素，即对原始元素的完整替代。** 顶层标签要与原始元素一致（例如原来是 `<section>`，这里也必须是 `<section>`）。如果直接塞进多个平级节点（例如标题 + 段落 + div），会破坏轮廓跟踪和 accept 流程，因为它们默认认为每个变体只有一个根节点。

第一个变体默认显示，不写 `display: none`；其余全部隐藏。如果所有样式都已用内联样式表达，不需要 `<style>` 时可以省略。CSS 隔离使用 `@scope`（Chrome 118+ / Firefox 128+ / Safari 17.4+）。

一次编辑，把全部变体写齐。浏览器的 `MutationObserver` 会一次性拾取。

**每一条 `:scope` 规则都必须带后代选择器。** `@scope` 的边界是外层 `<div data-impeccable-variant="N">`，不是你真正设计的那个元素。裸写 `:scope { background: cream; }` 改到的是包装器，不是里面的卡片 / section；包装器常常是 `display: contents`，样式根本落不到实际节点上。正确写法应当是 `:scope > .card`、`:scope > section`、`:scope .hero-title` 这类显式深入一层的选择器。`tests/live-e2e/agent.mjs` 中的假代理 CSS 是可靠模板，所有规则都是 `:scope > ...` 开头。

**如果目标文件是 JSX / TSX。** `<style>` 内容必须包在模板字面量里，否则 CSS 的 `{` / `}` 会被 JSX 当作表达式。所有变体元素都要使用 `className=` 和 `style={{…}}`。`data-impeccable-*` 属性可以原样保留，它们只是普通字符串：

```tsx
<style data-impeccable-css="SESSION_ID">{`
  @scope ([data-impeccable-variant="1"]) { ... }
  @scope ([data-impeccable-variant="2"]) { ... }
`}</style>
<div data-impeccable-variant="1">
  {/* variant 1 */}
</div>
<div data-impeccable-variant="2" style={{ display: 'none' }}>
  {/* variant 2 */}
</div>
```

wrap 脚本已经提供了合法的 JSX 外层容器：一个 `<div data-impeccable-variants="…">` 包装器，内部也带好了标记注释。只要将上面的变体块填入 “Variants: insert below this line” 注释处即可。

### 7. 参数（按构图体量分配，每个变体 0–4 个）

每个变体都可以额外暴露少量**粗粒度**参数，同时依然保留完整 HTML/CSS 替换。浏览器会在轮廓右侧挂一个小面板，每个参数对应一个控件。用户拖动 / 点击就能即时预览，因为这些参数只是切换 CSS 变量或 data attribute，不需要重新生成。

**“可选”不等于默认不做。** 这里的“可选”指的是不要为冗余或纯装饰内容强行加控件，不是说“大块结构默认 0 个参数”。

**什么时候该加。** 只要 scoped CSS 中已经存在一个有意义的连续或离散调节轴，例如密度、颜色强度、字号比例、动效幅度、列宽分配等，就应该将其接成参数。只要你能想象用户会说“再紧一点”“再多一点颜色”而不值得整轮重新生成，就该接成旋钮。不要将微小边距或一次性调整做成参数，那种不是参数，只是噪音。

**自由动作（`impeccable`）的偏向。** 你没有去读 `reference/bolder.md` 这类文件，所以 1–2 个具有“签名感”的轴要由你自己选。优先选择与你三版方向同一维度的旋钮。例如三个版本都围绕编辑密度做文章，就暴露 `density` 或 `steps`（`airy / snug / packed`）；如果两个版本主要在色度上变化，就加 `color-amount`。对于 hero、section 这类**大体量**结构，如果最后给了 **0** 个参数，心里必须有一个非常充分的理由，例如“这里就是三个互斥的固定方案，不存在共享调节轴”。

**预算跟视觉体量走，不跟 token 数量走。** 参数要有足够空间才值得出现；一个孤立按钮塞三个滑块只会变得荒谬。

- **叶子 / 微型**：单个按钮、图标、输入框、孤立标题、单段文本：**0 个参数**。
- **小型构图**：带标签的输入框、简单卡片、短标注（大约不超过 5 个视觉子元素）：通常 **0–1 个** 参数，仅当存在非常明显的主调节轴。
- **中型构图**：section 级组件、导航簇、高密卡片、短功能块（约 6–15 个视觉子元素）：目标 **2 个**；结构很简单时 **1 个** 也可接受；**0 个** 只允许在三版就是固定点的情况下出现。
- **大型构图**：hero 区、整页区域、杂志跨页、大量内部层级（16+ 视觉子元素或多个子区块）：目标 **2–3 个**；如果确实存在多个互相独立的主轴（如结构步骤 + 密度 + 强调色），可以到 **4 个**。

**拿不准时，先问自己有没有“拨一下就明显不同”的轴，再决定要不要默认 0。** 实时模式的价值就是“即时调”，不是每次都重新点击 Go。面板太拥挤确实不好，但自由动作里更常见的失败是给复杂构图少配甚至不配参数。按**视觉子元素**计数，不按 DOM 深度计数；一个 DOM 浅但视觉范围巨大的 hero 仍然是大型。

**硬上限：每个变体最多四个参数。** 只有当参考文件明确允许时，才可能出现第五个，极少见。

**声明方式。** 将 JSON manifest 放在变体包装器上：

```html
<div data-impeccable-variant="1" data-impeccable-params='[
  {"id":"color-amount","kind":"range","min":0,"max":1,"step":0.05,"default":0.5,"label":"Color amount"},
  {"id":"density","kind":"steps","default":"snug","label":"Density","options":[
    {"value":"airy","label":"Airy"},
    {"value":"snug","label":"Snug"},
    {"value":"packed","label":"Packed"}
  ]},
  {"id":"serif","kind":"toggle","default":false,"label":"Serif display"}
]'>
  ...variant content...
</div>
```

支持的 `kind`：

- `range`：`min`、`max`、`step`、`default`、`label`
- `steps`：`default`、`label`、`options`（每项含 `value`、`label`）
- `toggle`：`default`、`label`

**动作特征参数。** 对于命名子命令，必须先读对应 `reference/<action>.md`，其中会规定 1–2 个**必须**出现的参数（例如 `layout` 通常必须有 `density`）。只要设计本身能表达，就必须接上。**自由动作没有文件级 MUST**；这里的 **自由动作偏向** 就是替代规则。如果动作既是风格动作又是子命令（例如 `colorize`），以子命令的 MUST 列表为主，同时依然遵守本节的**硬上限**，不要再加重复的旋钮。

**切换变体时会重置。** 用户在 v1 上把 density 调到很高，切到 v2 时，v2 会回到它自己声明的默认值。这是当前已知限制，跨变体保留状态可能后续才会加。

**accept 时**，浏览器会将用户当前参数值一起发回。`live-accept.mjs` 会将它们写成兄弟注释：

```html
<!-- impeccable-param-values SESSION_ID: {"color-amount":0.7,"density":"packed"} -->
```后续 carbonize 清理步骤会读取这个注释，并将最终选定的值真正烘焙进 CSS。对于 `steps` / `toggle` 这类属性选择器：只保留用户选中的分支，删除其他分支，并将 `:scope[data-p-density="packed"] .grid` 收敛为有语义的 class 规则。对于 `range` 型变量：要么直接替换为字面值，要么保留变量，但将默认值更新为用户选中的数值。

### 8. 发出完成信号

```bash
node {{scripts_path}}/live-poll.mjs --reply EVENT_ID done --file RELATIVE_PATH
```

`RELATIVE_PATH` 必须相对于项目根目录（如 `public/index.html`、`src/App.tsx`）。如果开发服务器没有 HMR，浏览器会直接回源读取这个文件。

执行完后，立刻再运行一次 `live-poll.mjs`。

### 中止进行中的会话

如果 wrap 或生成在浏览器已经切换到 GENERATING 状态后失败了（例如 wrap 落到了错误源码分支，且你已经回滚；或生成过程中发生无法恢复的错误），需要**通知浏览器**，让它的状态条回到 PICKING：

```bash
node {{scripts_path}}/live-poll.mjs --reply EVENT_ID error "Short reason"
```

不要使用 `live-accept --discard` 来做这件事。那个命令只修改文件，浏览器根本不知道，于是状态条会一直卡在 GENERATING 的加载动画上，用户只能手动刷新。`--discard` 只适用于**浏览器已经主动发起 discard** 的场景，即用户在 CYCLING 阶段点击了 ✕，而代理只是补做源码侧清理。

## 处理回退

当 wrap 返回 `fallback: "agent-driven"` 时，确定性流程就失效了，接下来的处理走这里。

目标不变：仍然要给用户三个可切换的变体，并且最终将 accept 的那个结果写进真正的源码位置，确保下次构建不会丢失。

### Step 1：找出元素真正的来源

利用错误载荷来定位：

- `element_not_in_source` 且 `generatedMatch: "public/docs/foo.html"`：说明浏览器加载的是生成文件。去找负责写入它的生成器（grep 哪个脚本会输出这个路径，例如 `scripts/build-sub-pages.js`、Astro / Next 模板等），再定位生成该元素的模板或 partial。
- `element_not_found`：说明这个元素是运行时注入的。去找真正渲染它的组件（React / Vue / Svelte）、组装它的 JS，或给它喂数据的数据源。
- `file_is_generated` 且带 `file: "..."`：用户显式指向了生成文件。处理方式与 `element_not_in_source` 相同。

持续读取候选源码，直到你能有把握地判断“这个元素的改动真正应该落在哪里”。如果变更纯粹是视觉层面的，真正该修改的有时不是模板，而是共享样式表。

### Step 2：先在浏览器当前 DOM 里展示三版预览

浏览器状态条还在等待变体。即使没有源码 wrapper，也必须先给它能预览的内容：

1.  手动将 wrapper scaffold 写入**浏览器实际加载的那个文件**。结构必须与 `live-wrap.mjs` 一致：`<!-- impeccable-variants-start ID --><div data-impeccable-variants="ID" data-impeccable-variant-count="3" style="display: contents">…</div><!-- end -->`
2.  在这个 wrapper 里插入三个变体 div，形态和正常确定性路径一致。
3.  执行 `--reply EVENT_ID done --file <served file>`。如果没有 HMR，浏览器会主动拉取这个文件并注入。

这个对 served file 的修改是**临时的**。下一次重新生成将其抹掉完全正常；真正的持久化发生在 accept 阶段。

### Step 3：accept 后写回真实源码

当 accept 事件到达时（此时 `_acceptResult.handled` 大概率仍为 `false`，因为 accept 同样拒绝将结果落进生成文件；详见后文 accept 中的 carbonize / fallback 分支），将用户选中的那个变体内容提取出来，写入 Step 1 找到的真实源码位置：

- 如果是结构性变化：修改模板 / 组件源码。
- 如果只是视觉变化：更新对应样式表，去掉临时 inline `<style>` 作用域样式。
- 如果是数据驱动：修改数据源或渲染逻辑。

然后将 served file 里的临时 wrapper 清除。

### Step 4：discard 时清理 served file

将 Step 2 写入的 wrapper 移除即可，其他什么都不用做。

## 处理 `accept`

事件格式：`{id, variantId, _acceptResult}`。poll 脚本已经先运行过 `live-accept.mjs` 做文件操作；浏览器 DOM 也已经更新。

- `_acceptResult.handled: true` 且 `carbonize: false`：什么都不用做，继续 poll。
- `_acceptResult.handled: true` 且 `carbonize: true`：**必须在下一次 poll 之前执行 post-accept 清理。** 详见下面 “accept 之后的强制步骤（carbonize）”。
- `_acceptResult.handled: false, mode: "fallback"`：说明这一轮 live session 发生在生成文件里，脚本拒绝将结果持久化进去。你应该已经在 fallback Step 3 里将选中变体写回真正源码了；现在只要清掉 served file 里的临时 wrapper，然后继续 poll。
- `_acceptResult.handled: false` 且没有 `mode`：需要人工清理。自行读取文件、定位 markers、手动编辑。

### accept 之后的强制步骤（carbonize）

当 `_acceptResult.carbonize === true` 时，说明被选中的变体当前是通过 helper markers 和 inline CSS 暂时“缝进”源码里的，好处是浏览器可以无缝继续显示，不会闪回原样。但这只是临时状态。**代理必须立刻将其改写成永久源码形态，然后才能继续 poll。** 如果跳过这一步，源码里会残留未被接受变体的 `@scope` 规则、没必要的 `data-impeccable-variant` wrapper、以及 `impeccable-carbonize-start/end` 注释噪音，而且这些垃圾会在多轮 live session 中不断累积。

必须在当前线程、同步完成下面五步，再继续 poll：

1.  **定位 carbonize block**。它位于 `_acceptResult.file`，被 `<!-- impeccable-carbonize-start SESSION_ID -->` 和 `<!-- impeccable-carbonize-end SESSION_ID -->` 包围，内部还含有 `<style data-impeccable-css="SESSION_ID">`。如果变体声明了参数，旁边还会有一条 `<!-- impeccable-param-values SESSION_ID: {...} -->` 注释，先读取它，后面第 3 和第 4 步都要用。
2.  **将 CSS 规则搬到项目真正的样式表。** 具体是哪个样式表取决于项目结构，例如这个仓库通常是 `public/css/workflow.css`，在 Vite / Next 项目里则更可能是组件共置 CSS 文件。总之，放到已经负责这一片 UI 样式的那个文件里。
3.  **在重写选择器时，将参数值烘焙进去。** 对 `@scope ([data-impeccable-variant="N"])` 这种 wrapper 作用域：改写为真实、有语义的 class 选择器（如 `.why-visual--v2 .v2-label { … }`）。对 `:scope[data-p-<id>="VALUE"]` 这种条件分支：只保留用户最终选中的那一支，其余全部删除。对 `var(--p-<id>, DEFAULT)` 这种变量：要么替换为字面值，要么保留变量，但将初始默认值换成用户实际选中的值。
4.  **拆掉 accept 后遗留的 wrapper。** 删除 `<div data-impeccable-variant="N" style="display: contents">`。同时移除其上的 `data-impeccable-params` 和所有 `data-p-*` 属性；这些都是 live mode 运行时 plumbing，不应该留在源码里。
5.  **删除 inline `<style>`、`<!-- impeccable-param-values -->` 注释（如果有）、以及两端的 carbonize 标记。** 顺带删除所有未被接受变体对应的 `@scope` 规则，它们已经是死代码。

五步完成后，再继续 poll。

理论上可以将这个重写工作交给后台代理，但当前主线程仍然必须负责核实这五步确实完成之后，才能发起下一次 poll。实践中，直接在当前线程做通常更快、更不容易出错。

## 处理 `discard`

事件格式：`{id, _acceptResult}`。poll 脚本已经恢复原始内容，并清除了所有变体标记。无需处理，直接继续 poll。

## 处理 `prefetch`

事件格式：`{pageUrl}`。浏览器会在用户第一次在某个路由上选中元素时触发这个事件，作为降低延迟的优化，表示用户很可能马上会在这个页面点击 Go。

将 `pageUrl` 解析到对应文件：

- 根路径 `/` → `live.mjs` 返回的 `pageFile`（通常是 `public/index.html` 或类似入口）。
- 子路由（如 `/docs`、`/docs/live`）→ 对应这个路由的生成文件或源码文件。结合项目结构推断：多页静态站通常是 `/foo` → `public/foo/index.html`；SPA 可能所有路由都回同一个入口文件。

将这个文件预先读入上下文，然后继续 poll。这里**不要**执行 `--reply`，因为 prefetch 只是投机性预热，真正的 Go 还没发生。

去重由浏览器负责（同一路径同一会话只发一次 prefetch），直接相信它即可。即使不同路由最后映射到同一个文件，第二次读取也会命中缓存。

## 退出

用户可以通过以下几种方式停止 live mode：

- 在聊天里说 “stop live mode” / “exit live”
- 直接关闭浏览器标签页（SSE 会断开，poll 8 秒后返回 `exit`）
- 点击浏览器内置的退出按钮

当 poll 返回 `exit` 时，进入清理。如果 poll 还在后台任务里运行，先将其停止。

## 清理

```bash
node {{scripts_path}}/live-server.mjs stop
```

这个命令会停止 HTTP 服务器，并运行 `live-inject.mjs --remove`，将 HTML 入口里注入的 `localhost:…/live.js` 移除。如果只是想停服务、保留注入标签以便快速重启，可以使用 `stop --keep-inject`。`config.json` 会保留下来，供后续会话复用。

然后：

- 清理任何残留的 variant wrappers（搜索 `impeccable-variants-start`）
- 清理任何残留的 carbonize blocks（搜索 `impeccable-carbonize-start`）

## 首次设置（缺配置或配置失效）

如果 `live.mjs` 输出 `{ ok: false, error: "config_missing" | "config_invalid", path }`，就在给出的路径写入 `config.json`。

模式如下：

```json
{
  "files": ["<path-or-glob>", "<path-or-glob>", ...],
  "exclude": ["<optional-glob>", ...],
  "insertBefore": "</body>",
  "commentSyntax": "html",
  "cspChecked": true
}
```

`files` 指的是注入目标，也就是**浏览器真正会加载的 HTML 文件**，不一定是源码。每一项都可以是字面路径（如 `"public/index.html"`）或 glob（如 `"public/**/*.html"`）。是否由 git 跟踪、是否为生成文件都不重要；wrap 自己有生成文件防护，accept 如果命中生成文件也会自动走回退流程。

`exclude`（可选）是要跳过的 glob 列表，即使 `files` 的 glob 能匹配到它们，也要忽略。适用于邮件模板、演示夹具或任何虽然是 HTML 但并非 live 页面的一类文件。

`cspChecked` 表示是否已经跑过下面的 CSP 检测流程。第一次 setup 时可能没有这个字段；无论最后是已修补、用户拒绝，还是根本不需要修补，跑完检查后都要将其设为 `true`。

**硬排除路径（不可覆盖）。** `**/node_modules/**` 和 `**/.git/**` 永远不会被匹配，无论用户写什么配置都不行。这些目录不是源码就是元数据，往里注入只会污染第三方或仓库内部状态。

**Glob 语法。** `**` 匹配任意数量的路径段（包括 0），`*` 匹配除 `/` 之外的任意字符，`?` 匹配除 `/` 之外的单个字符。所有路径都相对于项目根目录，并统一使用正斜杠。

| 框架 | `files` | `insertBefore` | `commentSyntax` |
|------|---------|----------------|-----------------|
| 单页外壳（Vite / React / 纯 HTML） | `["index.html"]` | `</body>` | `html` |
| Next.js（App Router） | `["app/layout.tsx"]` | `</body>` | `jsx` |
| Next.js（Pages Router） | `["pages/_document.tsx"]` | `</body>` | `jsx` |
| Nuxt | `["app.vue"]` | `</body>` | `html` |
| Svelte / SvelteKit | `["src/app.html"]` | `</body>` | `html` |
| Astro | `["<root layout .astro>"]` | `</body>` | `html` |
| 多页站点（每个路由对应独立 HTML） | `["public/**/*.html"]` | `</body>` | `html` |

优先选择每个文件里都稳定存在的锚点，通常 `</body>` 最稳。只有当真正需要在某一行之后插入时，才使用 `insertAfter`。

对于多页站点，**优先用 glob，不要列死文件清单。** 这样以后新增页面，下次执行 `live-inject.mjs` 时会自动覆盖，不需要手动维护配置。

对于那些页面本身由生成器**重新构建**的多页站点（Astro、静态站生成器、自定义脚本如 `build-sub-pages.js`），注入只能持续到下一次重新生成。每次 build 后都需要重新执行 `live.mjs`。accept 不受影响，因为它最终会通过回退流程写回真正源码。

### 配置漂移修复警告

每次 `live.mjs` 启动后，完成注入之后，系统都会扫描项目里常见页面源码目录（`public/`、`src/`、`app/`、`pages/`）下的 HTML 文件。如果发现有文件不在 `files` 解析结果覆盖范围内，输出里会带一个 `configDrift` 字段：

```json
{
  "ok": true,
  "serverPort": 8400,
  "pageFiles": [ "..." ],
  "configDrift": {
    "orphans": ["public/new-section/index.html", "public/docs/new-command.html"],
    "orphanCount": 2,
    "hint": "2 HTML file(s) exist but aren't in config.files. Consider adding them, or use a glob pattern like \"public/**/*.html\"."
  }
}
```

只要出现 `configDrift`，每个会话里都要向用户提醒一次，然后再进入 poll 循环：

> 发现项目中有 N 个 HTML 文件未包含在 `config.files` 中：
>
> - `public/new-section/index.html`
> - `public/docs/new-command.html`
>
> 是否将它们添加进去，或者将 `files` 切换为 glob 模式（如 `["public/**/*.html"]`）以自动跟踪新页面？

不要自动替用户修改配置。只提示，让用户决策。没有漂移时，`configDrift` 为 `null`。

### CSP 检测（仅第一次 setup）

如果 `config.cspChecked === true`，整段逻辑直接跳过。这个用户你已经问过一次了，不需要反复询问。

否则先运行检测辅助脚本：

```bash
node {{scripts_path}}/detect-csp.mjs
```

输出：`{ shape, signals }`，其中 `shape` 只可能是 `append-arrays`、`append-string`、`middleware`、`meta-tag` 或 `null`。这里的 shape 指的是**补丁机制**，不是框架名，因此同一模板可以覆盖多个技术栈。

- **`null`**：项目里没有 CSP。直接跳到写 `config.json`，并把 `cspChecked: true` 写进去。
- **`append-arrays`**：CSP 以结构化 directive 数组形式存在，可自动修补。详见下文 *append-arrays*。覆盖场景包括：
  - 通过 monorepo helper 暴露 `additionalScriptSrc` / `additionalConnectSrc` 的 Next.js + 共享配置
  - SvelteKit 的 `kit.csp.directives`
  - Nuxt `nuxt-security` 模块里的 `contentSecurityPolicy`
- **`append-string`**：CSP 以字面字符串形式存在，可自动修补。详见下文 *append-string*。覆盖场景包括：
  - 内联写在 `next.config.*` 的 `headers()` 里的 CSP 字符串
  - Nuxt `routeRules` / `nitro.routeRules` 中的 CSP headers
- **`middleware`** 或 **`meta-tag`**：能识别，但 v1 不做自动修补。将检测到的文件路径展示给用户，请他手动将 `http://localhost:8400` 加进 `script-src` 和 `connect-src`，然后仍然将 `cspChecked: true` 写回配置，再继续。

#### 统一确认文案

提示必须使用下面这套措辞，确保跨代理体验一致：

> **需要 CSP 补丁。** 我在你的项目中检测到一个内容安全策略，它阻止了 `http://localhost:8400` —— 不允许此地址，实时选择器将无法加载。以下是我建议的修改：
>
> ```diff
> [file: <patchTarget>]
> [精确的 diff，2-5 行]
> ```
>
> 它受 `NODE_ENV === "development"` 保护，因此额外的条目只在开发环境中出现，永远不会进入生产环境。你可以随时通过还原此文件来移除它。应用吗？ [y/n]

如果用户回答 no：跳过修补，明确告诉他 live 不会工作，除非自己手动将这条 allowance 加进去；但仍然要把 `cspChecked: true` 写回，因为“是否询问过”这件事已经完成。

如果用户回答 yes：执行对应 shape 的补丁，然后将 `cspChecked: true` 写回。

#### append-arrays

CSP 以结构化 directive 数组表示时，补丁机制是：先在文件顶部附近声明一个 dev-only 数组，再将其 spread 进 `script-src` 和 `connect-src` 数组。

**先在持有 CSP 数组的文件顶部附近声明：**

```ts
// Dev-only allowance so impeccable live mode can load. Guarded by NODE_ENV.
const __impeccableLiveDev =
  process.env.NODE_ENV === "development" ? ["http://localhost:8400"] : [];
```

**再将 `...__impeccableLiveDev` 加到 `script-src` 和 `connect-src` 的 directive 数组里。** 各框架细节如下：

- **Next.js + monorepo helper**：修改具体应用自己的 `next.config.*`，不要去改共享 helper 包；将扩展项加到传给 `createBaseNextConfig`（或同类函数）的 `additionalScriptSrc` 和 `additionalConnectSrc`。
- **SvelteKit**：修改 `svelte.config.js`，将扩展项加到 `kit.csp.directives['script-src']` 和 `kit.csp.directives['connect-src']`。
- **Nuxt + nuxt-security**：修改 `nuxt.config.*`，将扩展项加到 `security.headers.contentSecurityPolicy['script-src']` 和 `['connect-src']`。

参考输出：

- `tests/framework-fixtures/nextjs-turborepo/expected-after-patch.ts`
- `tests/framework-fixtures/sveltekit-csp/expected-after-patch.js`

幂等性要求：如果文件里已经存在 `__impeccableLiveDev`，说明补丁已经打过，直接跳过询问，只写 `cspChecked: true`。

#### append-string

CSP 以字面字符串形式存在时，补丁分两步：先在顶部声明一个 dev-only 字符串，再将其插入到 CSP 中的 `script-src` 和 `connect-src` 指令内。

```ts
// Dev-only allowance so impeccable live mode can load.
const __impeccableLiveDev =
  process.env.NODE_ENV === "development" ? " http://localhost:8400" : "";
```

然后在 CSP 字符串中：

- `script-src 'self' 'unsafe-inline'` → `` `script-src 'self' 'unsafe-inline'${__impeccableLiveDev}` ``
- `connect-src 'self'` → `` `connect-src 'self'${__impeccableLiveDev}` ``

这里 dev 字符串前面的空格是故意的，这样拼接进原值时格式刚好正确。如果原本不是模板字符串，补丁时也要顺手将其改成模板字符串。

各框架细节：

- **Next.js 内联 `headers()`**：修改 `next.config.*`，将变量插进 CSP 值里。
- **Nuxt `routeRules`**：修改 `nuxt.config.*`，将变量插进 `routeRules['/**'].headers['Content-Security-Policy']` 对应值里。

参考输出：

- `tests/framework-fixtures/nextjs-inline-csp/expected-after-patch.js`
- `tests/framework-fixtures/nuxt-csp/expected-after-patch.ts`

### 故障排查

如果用户当初在 setup 阶段对 CSP patch 说了 no，后来又来抱怨 live 不工作：原因就是 dev 环境 CSP 仍然阻止了 `http://localhost:8400`。修复方式是删除 `config.json` 里的 `cspChecked` 字段，然后重新执行 `live.mjs`，setup 流程就会重新询问。

然后重新运行 `live.mjs`。