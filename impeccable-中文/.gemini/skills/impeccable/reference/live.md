交互式 live variant 模式：在浏览器中选择元素，选择一个设计动作，然后通过 dev server 的 HMR 热替换 AI 生成的 HTML + CSS 变体。
## 前置条件

需要有一个正在运行、支持 hot module replacement 的 dev server（Vite、Next.js、Bun 等），或者浏览器中已经打开了一个静态 HTML 文件。
## 契约（只读一次）

按顺序执行。不能跳步骤，不能改顺序。
1. `live.mjs` — 启动。
2. 打开提供 `pageFile` 的 URL（从 `package.json`、文档、终端输出或已打开标签页中推断）。如果你无法有把握地推断，就只告诉用户一次，让他打开自己的 dev / preview URL。绝不要把 `serverPort` 当成这个 URL，它是 helper，不是应用本体。
3. 用默认的长超时（600000 ms）进入 poll loop。每次收到事件或执行完 `--reply` 后，都要立刻再次运行 `live-poll.mjs`。绝不要传短 `--timeout=`。
4. 遇到 `generate`：如果有截图就先读截图；加载对应 action 的 reference；规划三个真正不同的方向；一次编辑写完所有 variants；`--reply done`；然后继续 poll。
5. 遇到 `accept` / `discard`：poll 脚本已经清理好了，直接继续 poll。
6. 遇到 `exit`：执行文本的 cleanup。
Harness 策略：
- **Claude Code**：把 poll 作为**后台任务**运行（不要短超时）。harness 会在完成时通知你，因此主对话可以继续。不要阻塞 shell。
- **Cursor**：把 poll 作为**前台任务**运行（阻塞 shell；不要用后台终端，也不要用 subagent）。Cursor 的后台终端和 subagent 目前无法可靠地把 poll stdout 带回聊天。
- **Codex**：把 poll 作为**前台任务**运行（阻塞 shell；不要用后台任务，也不要用 subagent）。Codex 的后台 exec session 目前不能可靠地在事件到达时把 poll stdout 回传到会话里，所以“发出去不管”的后台 poll 会让 live mode 卡住。
- **其他 harness**：默认前台，除非你明确知道 stdout 能可靠回到当前会话。
聊天本身是额外开销。不要做 recap，不要输出教程，不要粘贴 PRODUCT / DESIGN 正文。把 token 花在工具和编辑上；失败时只用一两句短话说明。
## Start

```bash
node .agents/skills/impeccable/scripts/live.mjs
```

输出 JSON：`{ ok, serverPort, serverToken, pageFiles, hasProduct, product, productPath, hasDesign, design, designPath, migrated }`。`pageFiles` 是 live script 被注入到的 HTML 入口列表。生成 variant 时要把 PRODUCT.md 和 DESIGN.md 放在心里：*视觉决策以 DESIGN.md 为准；战略 / 语气决策以 PRODUCT.md 为准。* 如果 `migrated: true`，说明 loader 已自动把旧的 `.impeccable.md` 重命名为 `PRODUCT.md`；提一次即可，并建议使用 `$impeccable document` 生成对应的 DESIGN.md。
`serverPort` 和 `serverToken` 属于一个小型的 **Impeccable live helper** HTTP server（负责提供 `/live.js`、SSE 和 `/poll`）。这个端口*不是**你的 dev server，也通常不是你打开应用时访问的 URL。浏览器页面的来源，是实际提供某个 `pageFiles` 条目的那个 origin（Vite / Next / Bun / tunnel / 局域网主机名）。
如果输出是 `{ ok: false, error: "config_missing" | "config_invalid", path }`，说明这个项目还没为 live mode 配置好（或者配置已经过期）。参见文本 **First-time setup**。
## Poll loop

```text
LOOP:
  node .agents/skills/impeccable/scripts/live-poll.mjs   # 默认长超时；不要加 --timeout=
  读取 JSON；按 "type" 分发

  "generate"  -> Handle Generate; reply done; LOOP
  "accept"    -> Handle Accept; LOOP
  "discard"   -> Handle Discard; LOOP
  "prefetch"  -> Handle Prefetch; LOOP
  "timeout"   -> LOOP
  "exit"      -> break -> Cleanup
```

## Handle `generate`

事件：`{id, action, freeformPrompt?, count, pageUrl, element, screenshotPath?, comments?, strokes?}`。
速度很重要，用户正在看着 spinner。尽量减少 tool call，优先使用 `wrap` helper，并在一次编辑里写完所有 variants。
### 1. 读取截图（如果存在）

`event.screenshotPath` **只有在用户点击 Go 之前至少放了一个 comment 或 stroke 时才会发送。* 如果存在，它是一个绝对路径，指向带有批注烘焙结果的元素截图 PNG。*必须在规划前读取它*，因为这些批注编码了无法仅从 `element.outerHTML` 中恢复的用户意图。
如果 `screenshotPath` 不存在，不要去要截图，也不要主动寻找当前渲染结果。这种缺失是故意的：如果没有批注，截图会把模型锚定在现有设计上，从而妨碍“三个明显不同方向”的要求。此时应基于 `element.outerHTML`、`event.element` 里的计算样式，以及存在时的 freeform prompt 来工作。
`event.comments` 和 `event.strokes` 会把结构化元数据和视觉内容一起提供。应把截图视为主输入；结构化数据只用于提取值得明确引用的细节（例如 comment 的精确文本）。
精确解读批注：
- **Comment 的位置是有效信息，不是装饰。* 它的 `{x, y}` 是相对于元素本地坐标系的 CSS px（与 `element.boundingRect` 使用同一坐标空间）。要找出该点落在哪个子元素上，并把 comment 文本**局部地**应用到那个子元素。靠近标题的 comment 说的是标题，不是整个界面。
- **Comments 和 strokes 默认彼此独立**，除非它们有明显的重叠或极近的邻接关系。不要让一个很显眼的 stroke 覆盖掉另一个位置更精确的 comment 所表达的意图。
- **Strokes 是手势，要按形状读。* 闭合环 = “这个东西”（强调 / 聚焦）；箭头 = 方向（移动 / 指向）；叉号或斜线 = 删除；自由涂抹 = 视上下文表示强调或删除。圈住区域 X 的闭合环表示“注意 X”，不表示“只能改 X 里面的像素”。
- **如果 stroke 的意图不明确**（是圆还是箭头？是强调还是移动？），就在 rationale 里用一句话说出你的理解，而不是默默猜。如果这种不确定性会实质性改变 brief，就先问一个很短的澄清问题再生成。
### 2. Wrap 元素

```bash
node .agents/skills/impeccable/scripts/live-wrap.mjs --id EVENT_ID --count EVENT_COUNT --element-id "ELEMENT_ID" --classes "class1,class2" --tag "div" --text "TEXT_SNIPPET"
```

参数映射如下，保持分离，不要偷懒合并成 `--query`：
- `--element-id` -> `event.element.id`
- `--classes` -> `event.element.classes` 用逗号拼接
- `--tag` -> `event.element.tagName`
- `--text` -> `event.element.textContent` 的前约 80 个字符（trim，单行）。*每次都要传。* 当被选中的元素与兄弟组件共享相同 classes + tag（如一组 `<Card>` 或重复 section）时，真正起到消歧作用的就是这个字段。没有它，wrap 可能静默命中第一个匹配项，把错误的元素包起来。
helper 的查找顺序是：先 ID，再 classes，再 tag + class 组合。如果 `event.pageUrl` 已经隐含了文件（例如 `/` 通常对应 `index.html`），就传 `--file PATH`，从而跳过搜索。`--query` 只是原始文本搜索的兜底方案，**不要**把它当常规元素查找方式。
如果 `--text` 对多个候选的匹配程度一样高，wrap 会以 `{ error: "element_ambiguous", candidates: [...] }` 退出，并带上 `fallback: "agent-driven"`。这时要读取候选行范围，结合页面上下文判断哪个才是被选中的元素，然后按 fallback 流程手动写 wrapper。
成功输出：`{ file, insertLine, commentSyntax }`。
**Fallback 错误。* Wrap 只会往它判断为 source 的文件里写入（被 git 跟踪、未标记 GENERATED、也不在 config 的 `generatedFiles` 中）。如果它无法安全落到 source 文件，就会报错且不写任何内容，因为把 variant 接收到 generated file 里等同于静默数据丢失。错误形态有三种：
- `{ error: "file_is_generated", file, hint }`：用户显式传入的 `--file` 是生成文件。
- `{ error: "element_not_in_source", generatedMatch, hint }`：这个元素只存在于生成文件里（下一次 build 就会把你的编辑抹掉）。
- `{ error: "element_not_found", hint }`：这个元素根本不在任何项目文件里，通常说明它是运行时注入的（JS 组件、数据驱动渲染等）。
这三种错误都会带上 `fallback: "agent-driven"`。继续看下文 **Handle fallback**。
### 3. 加载 action 对应的 reference

如果 `event.action` 是 `impeccable`（默认的 freeform action），就使用 SKILL.md 的共享规则，再叠加上已加载的 register reference（`brand.md` 或 `product.md`）。不要去加载某个 sub-command reference。*Freeform 不代表可以跳过 parameters！* 你仍然必须遵循下文 **§7 Parameters** 中的 composition budget 和 freeform bias。各个 sub-command 文件会列出必须具备的 signature knobs；freeform 没有这个文件，因此这些 sizing knobs 需要你根据界面权重和主差异轴自己决定。
如果 `event.action` 是其他命名动作（`bolder`、`quieter`、`distill`、`polish`、`typeset`、`colorize`、`layout`、`adapt`、`animate`、`delight`、`overdrive`），就必须先读取 `reference/<action>.md` 再开始规划。每个 sub-command 都编码了特定学科视角；跳过 reference 的结果通常会很泛。那些文件里可能要求特定参数；要把这些要求叠加到 §7 budget 之上，而不是拿它取代 §7。
### 4. 规划三个真正不同的方向

在动手写一行代码前，先给每个 variant 命名。
**对于 freeform（`action` 是 `impeccable`，或用户给了自由提示）**：每个 variant 都必须锚定到一个不同的 **archetype**，也就是一种足够具体、让人一眼能认出来的现实设计类比。不要写成 “modern landing page”，也不要写成 “minimal product hero”。例子：

- *Broadsheet masthead with rule-divided columns*（像 NYT 纸媒版面）
- *Klim Type Foundry specimen page*（高密度、技术化、目录感）
- *Japanese print-poster minimalism with a single oversize glyph*
- *Bloomberg Terminal status bar*
- *Condé Nast Traveler feature layout*

然后让每个 variant 分别押注在一个不同的 **主差异轴** 上：

1. **Hierarchy**：哪个元素最先抓住视线？
2. **Layout topology**：堆叠 / 并排 / 网格 / 非对称 / 叠加
3. **Typographic system**：字体搭配、比例、大小写与字重策略
4. **Color strategy**：Restrained / Committed / Full palette / Drenched
5. **Density**：minimal / comfortable / dense
6. **Structural decomposition**：合并、拆分、渐进式揭露

三个 variants 就是三个**不同的主轴**，不是同一种方案只改改颜色。
**当主差异轴是颜色或主题时，三者不允许共享相同主题 + 主色。* 两个 dark + 一个 dark 不是“不同”。理想情况是一个 dark-neutral-accent、一个 light-drenched、一个 full-palette-saturated，也就是三个不同色彩世界，而不是同一世界里的三种色相。
**眨眼测试（写代码前先做）**。把三个单句描述并列写出来：

> V1: Broadsheet masthead, ruled columns, 24px ink on cream.  
> V2: Enormous italic title, catalog spec rows, heavy monospace data.  
> V3: Card-framed poster with one oversize glyph, magenta veil.

如果其中两个描述会押韵成同一类（“都在用大字”、“都是纵向 section 堆栈”、“都把 CTA 放在最显眼位置”），就重做那个问题 variant。freeform 模式里最常见的失败，就是三个本质相同、只有表面 tweak 的方案。
**对于 action-specific 调用**，每个 variant 都必须沿着 action 所命名的维度来变化：
- `bolder`：每个 variant 分别放大不同维度（尺度 / 饱和度 / 结构变化），不是三个“稍微更大一点”的版本。
- `quieter`：每个 variant 分别降低不同维度（颜色 / 装饰 / 间距）。
- `distill`：每个 variant 删除不同类别的冗余（视觉噪声 / 重复内容 / 多余嵌套结构）。
- `polish`：每个 variant 聚焦不同打磨轴（节奏 / 层级 / 微细节，如圆角、focus state、光学校字距）。
- `typeset`：每个 variant 都必须有不同的字体搭配，且比例也不同。不要做三版同一字体系统的小变体。
- `colorize`：每个 variant 使用不同的色相家族（不是同色系深浅变化），同时变化色度和对比策略。
- `layout`：每个 variant 使用不同结构布局（堆叠 / 并排 / 网格 / 非对称），不要只改 spacing。
- `adapt`：每个 variant 面向不同目标上下文（mobile-first / tablet / desktop / print / low-data），不要做三个移动端版。
- `animate`：每个 variant 使用不同运动词汇（cascade stagger / clip wipe / scale-and-focus / morph / parallax），不要做三个 staggered fade。
- `delight`：每个 variant 表达不同风味的个性（意外微交互 / 字体惊喜 / 插画点缀 / 声音或触觉时刻 / 彩蛋式互动）。
- `overdrive`：每个 variant 打破不同常规（尺度 / 结构 / 动画 / 输入模型 / 状态切换）。跳过 `overdrive.md` 里的 “propose and ask” 步骤，因为 live mode 不允许来回交互确认。
### 5. 应用 freeform prompt（如果有）

`event.freeformPrompt` 是用户可接受方向的上限，所有 variants 都必须尊重它，但仍然要探索明显不同的**诠释方式**。例如 “Make it feel like a newspaper front page”：

- variant 1 = broadsheet masthead + rule-divided columns
- variant 2 = tabloid headline + single dominant image
- variant 3 = minimalist editorial with oversized drop cap

而不是三份语气一样的报纸。
### 6. 在一次编辑中写完所有 variants

对每个 variant 都要做完整的 HTML 替换，而不是只打一层 CSS patch。要考虑元素所处上下文（计算样式、父级结构、`event.element` 里的 CSS variables）。
在 `wrap` 返回的 `insertLine` 位置，*一次编辑*写入 CSS + 全部 variants。把 scoped CSS 和 variant wrapper 放在一起，使用内联 `<style>` 标签；现代浏览器里 `<style>` 放在哪里都可用，这样能保证 CSS 和 HTML 原子化抵达，避免 FOUC。
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

**每个 variant div 内只能有一个顶层元素*，它就是原元素的完整替换版本。标签类型要与原元素保持一致（例如用户选中的是 `<section>`，那你的替换顶层也应是 `<section>`）。如果在 variant div 里直接放多个并列兄弟（如 heading + paragraph + div），会破坏 outline tracking 和 accept flow，因为它们都默认每个 variant 只有一个 child。
第一个 variant 默认可见，因此不加 `display: none`；其他 variants 都要隐藏。如果 variants 全都只用于 inline styles，没有 scoped CSS，就可以省略 `<style>` 标签。CSS 隔离应使用 `@scope`（Chrome 118+ / Firefox 128+ / Safari 17.4+）。
一次编辑、全部 variants，浏览器的 MutationObserver 才能在一次变更里完整接收。
**每条 `:scope` 规则都必须带后代选择器。* `@scope` 的边界是 **variant wrapper `<div data-impeccable-variant="N">`**，不是你真正要设计的那个元素。裸写 `:scope { background: cream; }` 只会给 wrapper 生效，而 wrapper 往往是 `display: contents`，结果真正内容仍然是页面默认样式。必须始终向内走一步，例如：`:scope > .card`、`:scope > section`、`:scope .hero-title` 等。`tests/live-e2e/agent.mjs` 里的测试 agent CSS 是一个准确模板，每条规则都以 `:scope > ...` 开头。
**JSX / TSX 目标文件。* 把 `<style>` 内容包进 template literal，避免 CSS 里的 `{` / `}` 被当成 JSX 表达式；所有 variant 元素都使用 `className=` / `style={{...}}`。`data-impeccable-*` 属性保持原样，它们只是普通字符串。
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
```wrap script 已经为你提供了一个单根 JSX wrapper，也就是一个外部 `<div data-impeccable-variants="...">`，marker comments 也都已放好。只需要把上面的 variants block 填进 “Variants: insert below this line” 那个 comment 下面，源文件就仍然是合法 TSX。
### 7. Parameters（按 composition 尺寸决定，每个 variant 0—4 个）

每个 variant 都可以除了完整 HTML / CSS 替换外，再暴露一些*粗粒度*可调参数。浏览器会在 outline 右侧挂一个小面板，每个 parameter 一项控件。用户拖动 / 点击后会立刻看到反馈，不需要再次生成，因为控件只是在切换 CSS variable 或 data attribute，而这些都已经提前写进了 variant 的 scoped CSS 里。
**“optional” 不代表什么。** Parameters 不是大型方案上的可有可无装饰。这里的 optional 意思是“可以省略那些冗余或纯 cosmetic 的控件”，而不是“反正已经做了三个 variants，所以默认全给 0 个参数”。
**什么时候该加？** 只要 variant 的 scoped CSS 存在一个有意义的连续轴或离散轴，比如 density、color amount、type scale、motion intensity、column weight 等，就应该考虑暴露成参数。如果你能想象用户会一边看一边咕哝“再紧一点”或“再多一点强调色”，而这个调整*不值得重新生成整版**，那就应该把它做成 knob。微调 margin 或一次性小抖动不算 parameter。
**Freeform（action` 是 `impeccable`）的偏置。** 因为你没有加载 `reference/bolder.md` 之类的文件，所以 1—4 个 signature-like axes 需要你**自己选择**。优先选择与你这三个方向同维度的 knobs。比如三版都在探索 editorial density，那就暴露 `density` 或一个 `steps`（airy / snug / packed）；如果两个方向主要差在色度，就加 `color-amount`。对于 hero、section 或其他*大型**界面，如果最后给了 **0 个 params**，你脑子里必须有一句理由（例如“这真的是三个固定点 A/B/C 比较，没有共享的拨盘”），而不是出于习惯。
**预算按元素的视觉权重走，不按 token 预算走。** 控件需要足够空间，用户才能感受到“可调性”；在一个很小的控件上挂三个 slider 只会制造噪声。
- **Leaf / tiny**：单个按钮、图标、输入框、孤立标题、单段文字：**0 个 params**。
- **Small composition**：带 label 的输入、简单卡片、短 callout（大约 ≤ 4 个视觉子元素）：如果有一个特别明显的主轴，可给 **0—1** 个 params，否则就 **0**。
- **Medium composition**：section 组件、导航组、密集卡片、短 feature block（约 6—15 个视觉子元素）：目标是 **2 个*；如果结构简单，**1 个*也可接受；只有在 variants 真的是固定点时才给 **0**。
- **Large composition**：hero section、整页区域、spread layout、内部结构很强的内容块（16+ 个视觉子元素或多个子分区）：目标是 **2—3 个*；当存在多个相互独立的轴（例如结构 `steps` + `density` + 一个 accent）时，可以给到 **4 个*。
**不确定时，先问自己这个 dial 是否存在，而不是默认给零。** 用户随时都能再请求更多 variants，但 live mode 的价值就在于不用再点一次 Go 就能即时调参。面板太拥挤固然不好，但在 dense composition 中*参数给得太少** 才是 freeform 场景里更常见的失败。计数时按*视觉**子元素，不按 DOM 深度；一个很浅但很宽的 hero 仍然是 large。
**每个 variant 的硬上限**：最多 **4 个* parameters，这样面板才不会难以阅读；只有在 reference 明确允许的极少数情况下，才可以给第 5 个。
**如何声明？** 在 variant wrapper 上放一个 JSON manifest：
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

**共有三种类型：**

- `range`：连续滑杆。会在 variant wrapper 上驱动一个 CSS custom property `--p-<id>`。CSS 中用法如 `var(--p-color-amount, 0.5)`。字段有：`min`、`max`、`step`、`default`（number）、`label`。
- `steps`：分段单选。会在 variant wrapper 上驱动一个 data attribute `data-p-<id>`。CSS 中写法如 `:scope[data-p-density="airy"] .grid { ... }`。字段有：`options`（`{value, label}` 数组）、`default`（string）、`label`。
- `toggle`：开关。会同时驱动 CSS var（`--p-<id>: 0|1`）和 data attribute（开启时存在，关闭时不存在）。用哪个更方便就用哪个。字段有：`default`（boolean）、`label`。
**同 action 的 signature params。** 对于命名 sub-command，要读取对应 `reference/<action>.md`，里面会给出 1—4 个*必须具备的* params（例如 `layout` 可能要求 `density`）。只要设计能表达，就必须给。*Freeform 没有文件级 MUST**；本节的 **Freeform（`impeccable`）bias** 就是它的替代规则。如果用户选的既是既有风格又是 sub-command 的 action（例如 `colorize`），那就以该 sub-command 的 MUST 轴为先，同时仍然遵守 **Hard cap**，不要添加重复含义的冗余 knobs。
**切换 variant 时重置。** 用户在 v1 上把 density 调高，切到 v2 后，v2 要从自己声明的默认值开始。这是已知限制，跨 variant 保留参数值以后也许会加。
**在 accept 时**，浏览器会把用户当前选中的参数值一起发回来。`live-accept.mjs` 会把它们写成一个同级 comment：
```html
<!-- impeccable-param-values SESSION_ID: {"color-amount":0.7,"density":"packed"} -->
```

后面的 carbonize cleanup（见下文）会读取这段 comment，并把用户最终选中的值烘焙进最终 CSS。对于 `steps` / `toggle` 的 attribute selector：只保留与选中值匹配的那条分支，删掉其他分支，再把 `:scope[data-p-density="packed"] .grid` 收缩成一个语义化 class 规则。对于 `range` 变量：可以直接替换成字面值，也可以保留变量，但把默认值改成用户选中的值。
### 8. 发送 done 信号

```bash
node .agents/skills/impeccable/scripts/live-poll.mjs --reply EVENT_ID done --file RELATIVE_PATH
```

`RELATIVE_PATH` 必须是相对于项目根目录的路径（例如 `public/index.html`、`src/App.tsx` 等）。如果 dev server 没有 HMR，浏览器会直接去抓这个 source 文件。
然后立刻再次运行 `live-poll.mjs`。
### 中止进行中的 session

如果 wrap 或 generation 在浏览器已经切换到 GENERATING 之后失败了（例如 wrap 命中了错误的 source 分支，而你已经回滚；或者 generation 出现不可恢复错误），你必须通知**浏览器**，让它的状态栏重置回 PICKING：
```bash
node .agents/skills/impeccable/scripts/live-poll.mjs --reply EVENT_ID error "Short reason"
```

不要在这种场景下运行 `live-accept --discard`。那只是一个纯文件变更器，浏览器看不见，所以状态栏会一直卡在 GENERATING 的点点点，用户只能手动刷新。`--discard` 只适用于*浏览器*主动发起 discard（用户在 CYCLING 阶段点了 ✕），而 agent 只需要运行浏览器已经触发的 source-side cleanup。
## Handle fallback

当 wrap 返回 `fallback: "agent-driven"` 时，说明确定性流程不适用了，从这里接手。
目标不变：仍然要给用户三个 variants 供选择，并且把最终 accept 的结果持久化到下一次 build 不会抹掉的位置。不同的是，这次你必须自己判断“真正该改的是哪个 source 文件”。
### 步骤 1：找出元素真正来自哪里？
根据错误 payload 来判断：

- `element_not_in_source` 且 `generatedMatch: "public/docs/foo.html"`：说明浏览器加载的 HTML 是生成出来的。你要去找生成器（例如 grep 谁在写这个路径，可能是 `scripts/build-sub-pages.js`、某个 Astro / Next 模板等），然后定位真正输出这个元素的模板或 partial。
- `element_not_found`：说明元素是运行时注入的。去找到渲染它的组件（React / Vue / Svelte）、组装它的 JS，或者提供数据的源头。
- `file_is_generated` 且带 `file: "..."`：说明用户显式指向了一个生成文件。处理方式和 `element_not_in_source` 相同。
持续读取候选 source，直到你能有把握判断“改这个元素应该落在哪”。如果改动纯粹是视觉层，最终目标 source 也可能是共享 stylesheet，而不是模板本身。
### 步骤 2：先把三个 variants 显示到 DOM 里供预览

浏览器顶部状态栏正在等 variants。即使 source 里没有现成 wrapper，你也还是得先让它看到东西：

1.  手动把 wrapper scaffold 写进**浏览器实际加载的 served file**。结构与 `live-wrap.mjs` 生成的一样：`<!-- impeccable-variants-start ID --><div data-impeccable-variants="ID" data-impeccable-variant-count="3" style="display: contents">...</div><!-- end -->`。
2.  把你的三个 variant div 插到里面，形状与确定性路径一致。
3.  用 `--reply EVENT_ID done --file <served file>` 发送完成信号。此时浏览器的 no-HMR fallback 会去 fetch 并注入。
这次对 served file 的修改是**临时的**，下次重新生成时被覆盖也没关系。真正的持久化发生在 accept 之后。
### 步骤 3：在 accept 时，把结果写回真正的 source

当 accept 事件到来时（通常此时 `_acceptResult.handled` 会是 `false`，因为 accept 也拒绝把内容直接持久化进 generated file，详见后文 Handle accept 里的 carbonize 分支），提取被选中的 variant 内容，写回你在 Step 1 找出的真实 source。
- 结构性改动 -> 改模板 / 组件源代码
- 纯视觉改动 -> 把规则加进合适的 stylesheet，并删除 inline `<style>` scope
- 数据驱动改动 -> 改数据源或渲染逻辑

然后，如果临时 wrapper 还留在 served file 里，就把它删掉。
### 步骤 4：在 discard 时清理 served file

把 Step 2 中插进去的 wrapper 删除即可。无需做别的。
## Handle `accept`

事件：`{id, variantId, _acceptResult}`。poll 脚本已经先跑过 `live-accept.mjs`，该做的确定性文件处理已经发生，浏览器 DOM 也已经更新。
- `_acceptResult.handled: true` 且 `carbonize: false`：无需做任何事，直接继续 poll。
- `_acceptResult.handled: true` 且 `carbonize: true`：*在下一次 poll 之前必须做 post-accept cleanup。* 具体见下方 "Required after accept (carbonize)"。`event._acceptResult.todo` 字段和 stderr banner 都会列出明确步骤；它们不是装饰。
- `_acceptResult.handled: false, mode: "fallback"`：说明这次 session 运行在 generated file 上，脚本拒绝把它持久化在那里。你已经在 Handle fallback Step 3 把被选中的 variant 写进真实 source 了；此时只需要把 served file 里残留的临时 wrapper 清掉，然后继续 poll。
- `_acceptResult.handled: false` 且没有 `mode`：说明要人工清理。读取文件，找到 markers，然后手动编辑。
### Required after accept (carbonize)

当 `_acceptResult.carbonize === true` 时，说明被 accept 的 variant 目前只是被 helper markers 和 inline CSS 临时“缝”进了 source，以便浏览器无缝继续显示。这个 stitch-in **只是临时状态**。agent 必须在继续做任何事情之前，把它重写成永久形式。跳过这一步会把未选中的 `@scope` 规则、无意义的 `data-impeccable-variant` wrapper，以及 `impeccable-carbonize-start/end` 注释噪声留在源码里，而且每次 session 都会继续堆积。
必须在当前线程里同步完成以下五步，然后才能继续 poll。文件没清干净之前，不要重新进入 poll。
1.  **定位 carbonize block**：在 source 文件（`_acceptResult.file`）里找到 `<!-- impeccable-carbonize-start SESSION_ID -->` 和 `<!-- impeccable-carbonize-end SESSION_ID -->` 之间的块，里面会有一个 `<style data-impeccable-css="SESSION_ID">`。如果 variant 声明了 parameters，还会有一条 `<!-- impeccable-param-values SESSION_ID: {...} -->` comment 挨在旁边。先读它，因为第 3、4 步都依赖它。
2.  **把 CSS 规则移入项目真正的 stylesheet**。该写到哪，要按项目结构判断（例如这个仓库里可能是 `public/css/workflow.css`，在 Vite / Next 项目里也可能是组件旁边的同目录 CSS 文件）。原则是写到原本就负责周边样式的文件里。
3.  **在重写 selector 时把参数值一并烘焙进去。** 对于 `@scope ([data-impeccable-variant="N"])` 这种 wrapper：要改写成语义化 class 选择器，直接对 accept 后保留下来的真实 HTML 生效（例如 `.why-visual--v2 .v2-label { ... }`）。对于 `:scope[data-p-<id>="VALUE"]` 这种 selector：只保留与 param-values comment 中用户选择值匹配的分支，其余全部删掉，因为 accept 之后它们都成了 dead code。对于 CSS 中的 `var(--p-<id>, DEFAULT)`：要么直接替换成字面值，要么如果这个参数以后仍值得长期保留，就保留变量，但把初始值改成用户选中的值。
4.  **解包 accept 后的内容。** 删除包在外面的 `<div data-impeccable-variant="N" style="display: contents">`。同时移除其上的 `data-impeccable-params` 和任何 `data-p-*` 属性；这些都只是 live-mode plumbing，不该留在源码里。
5.  **删除 inline `<style>`、`<!-- impeccable-param-values -->` comment（如果有）、以及 `<!-- impeccable-carbonize-start/end -->` markers。** *还要顺手删掉所有不属于 accept 结果的 `@scope` 规则，因为它们都已经没用了。
完成后再继续 poll。
可以用后端 agent 帮你改写，但当前线程必须在发起下一次 poll 之前确认上面五步都做完了。实际上，直接在当前线程里做通常更快、更不容易出错。
## Handle `discard`

事件：`{id, _acceptResult}`。poll 脚本已经把原始内容恢复，并删掉了所有 variant markers。你无需做任何事，直接继续 poll。
## Handle `prefetch`

事件：`{pageUrl}`。浏览器会在用户第一次在某个路由上选中元素时触发这个事件，作用是提前读上下文，减少后续延迟。它意味着：用户很可能马上就会在这个页面上点击 Go。
把 `pageUrl` 映射回底层文件：

- 根路径 `/` -> `live.mjs` 返回的 `pageFile`（通常是 `public/index.html` 或等价入口）
- 子路由（如 `/docs`、`/docs/live`）-> 对应该路由的生成文件或 source 文件。你要结合项目结构判断（多页静态站通常 `/foo` -> `public/foo/index.html`；SPA 则可能所有路由都映射到同一个入口文件）。
把对应文件读入上下文，然后继续 poll。这里*不要**发 `--reply`，因为这只是预热读取，真正的 Go 还没发生。如果你不能有把握地把路由解析到文件，就跳过它，继续 poll。
去重是浏览器负责的（每个唯一 pathname 每次 session 只会 prefetch 一次），相信它就好。如果两个不同路由恰好映射到同一个文件，第二次读取也会命中缓存。
## Exit

用户可以通过以下方式停止 live mode：
- 在聊天中说 “stop live mode” / “exit live”
- 关闭浏览器标签页（SSE 断开后，poll 会在 8 秒后返回 `exit`）
- 点击浏览器中的退出按钮
当 poll 返回 `exit` 时，进入 cleanup。如果 poll 还在后台跑，先把它停掉。
## Cleanup

```bash
node .agents/skills/impeccable/scripts/live-server.mjs stop
```

这个命令会停止 HTTP server，并运行 `live-inject.mjs --remove`，把 HTML 入口里注入的 `localhost:.../live.js` 删掉。如果你只是想停 server 但保留注入标签（方便快速重启），就用 `stop --keep-inject`。`config.json` 会保留，供未来 session 继续使用。
然后：
- 删除任何残留的 variant wrappers（搜索 `impeccable-variants-start` markers）
- 删除任何残留的 carbonize blocks（搜索 `impeccable-carbonize-start` markers）
## First-time setup（config 缺失或无效）

如果 `live.mjs` 输出 `{ ok: false, error: "config_missing" | "config_invalid", path }`，就在它给出的路径写一个 `config.json`。
Schema：
```json
{
  "files": ["<path-or-glob>", "<path-or-glob>", ...],
  "exclude": ["<optional-glob>", ...],
  "insertBefore": "</body>",
  "commentSyntax": "html",
  "cspChecked": true
}
```

`files` 是注入目标，也就是*浏览器实际加载的 HTML 文件**，不一定是 source。每一项都可以是字面路径（如 `"public/index.html"`）或 glob（如 `"public/**/*.html"`）。这些文件是否被跟踪、是否生成，并不重要；wrap 自己会做 generated-file 防护，而 accept 也会通过 fallback 流程回写真正 source。`exclude`（可选）是一个需要跳过的 glob 列表，即使它们本来会被 `files` 匹配到也一样。适合用来排除 email 模板、demo fixtures，或任何不是 live page 的 HTML。
`cspChecked` 用于记录下面那个 CSP 检测步骤是否已经跑过。首次 setup 时它通常不存在；等 CSP 检查完成（无论是已 patch、用户拒绝还是根本不需要）之后，再把它设成 `true`。
**硬性排除路径（不可覆盖）。** `**/node_modules/**` 和 `**/.git/**` 永远不会被匹配，不管用户怎么写。它们都是 vendor / metadata 目录，把注入打进去只会静默污染第三方代码。
**Glob 语法。** `**` 匹配任意数量的路径段（包括 0）；`*` 匹配任意数量但不含 `/` 的字符；`?` 匹配单个非 `/` 字符。路径一律相对于项目根目录，并使用正斜杠。
| 框架 | `files` | `insertBefore` | `commentSyntax` |
|-----------|---------|----------------|-----------------|
| 单页应用（单一外壳）（Vite / React / 纯 HTML） | `["index.html"]` | `</body>` | `html` |
| Next.js (App Router) | `["app/layout.tsx"]` | `</body>` | `jsx` |
| Next.js (Pages) | `["pages/_document.tsx"]` | `</body>` | `jsx` |
| Nuxt | `["app.vue"]` | `</body>` | `html` |
| Svelte / SvelteKit | `["src/app.html"]` | `</body>` | `html` |
| Astro | `["<root layout .astro>"]` | `</body>` | `html` |
| 多页站点（每个路由独立 HTML） | `["public/**/*.html"]` —— 覆盖整个 served 目录的 glob | `</body>` | `html` |

选择一个在每个文件里都存在的锚点（通常 `</body>` 几乎总是可用）。如果你需要匹配某一行*之后**再插入，也可以使用 `insertAfter`。
对于多页站点，*优先用 glob，而不是手写字面文件列表。* 这样以后新增页面时，下一次运行 `live-inject.mjs` 就能自动覆盖，无需手工维护 config。
对于那种页面会被生成器反复重建的多页站（Astro、各种静态站生成器、自定义脚本如 `build-sub-pages.js`），注入只能保留到下一次重新生成之前。每次 build 之后都要重新跑 `live.mjs`。不过这不会影响 accept，因为 accept 仍然会通过 fallback flow 回写到真实 source。
### Drift-heal 警告

每次 `live.mjs` 启动后、注入完成之后，系统都会扫描常见页面 source 根目录（`public/`、`src/`、`app/`、`pages/`）下的 HTML 文件。如果存在任何文件没有被当前 `files` 覆盖，输出里就会带一个 `configDrift` 字段：
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

当 `configDrift` 存在时，每个 session 只向用户提示一次，且要在进入 poll loop 之前说：

> Noticed N HTML file(s) in the project that aren't in `config.files`:
>
> - `public/new-section/index.html`
> - `public/docs/new-command.html`
>
> Add them, or switch `files` to a glob like `["public/**/*.html"]` and let it track new pages automatically?

不要自动替用户更新 config，应让用户自己决定。没有 drift 时，`configDrift` 会是 `null`。
### CSP 检测（仅首次）

如果 `config.cspChecked === true`，就直接跳过这一整节。你已经问过这个用户一次，不需要重复问。
否则，运行检测 helper：
```bash
node .agents/skills/impeccable/scripts/detect-csp.mjs
```

输出是 `{ shape, signals }`，其中 `shape` 可能是 `append-arrays`、`append-string`、`middleware`、`meta-tag` 或 `null`。这里的 shape 是按**补丁机制**命名的，因此一份模板可以覆盖多种框架。
- **`null`**：没有 CSP。直接写入 `config.json`，并把 `cspChecked: true` 设上即可。
- **`append-arrays`**：CSP 以结构化 directive array 的形式存在。可自动打补丁。见下文 *append-arrays*。适用场景包括：
  - 带 `additionalScriptSrc` / `additionalConnectSrc` 选项的 monorepo helper（Next.js + 共享 config package）
  - SvelteKit `kit.csp.directives`
  - Nuxt `nuxt-security` 模块中的 `contentSecurityPolicy`
- **`append-string`**：CSP 以字面值字符串形式存在。可自动打补丁。见下文 *append-string*。适用场景包括：
  - `next.config.*` 的内联 `headers()` 中直接写的 CSP 字符串
  - Nuxt `routeRules` / `nitro.routeRules` headers
- **`middleware`** 或 **`meta-tag`**：比较少见。v1 能检测到，但不会自动 patch。此时要把检测到的文件展示给用户，并请他手动把 `http://localhost:8400` 加进 `script-src` 和 `connect-src`，然后把 `cspChecked: true` 标记上并继续。
#### 同意提示模板

请使用下面这段措辞，以保持跨 agent 体验一致：

> **需要 CSP 补丁。** 我检测到你的项目中有一个 Content Security Policy 阻止了 `http://localhost:8400` —— live picker 在没有许可的情况下无法加载。这是我建议的改动：
>
> ```diff
> [file: <patchTarget>]
> [exact diff, 2–4 lines]
> ```
>
> 它由 `NODE_ENV === "development"` 保护，因此额外的条目只在开发环境中出现，永远不会进入生产环境。你可以随时通过还原此文件来移除它。应用吗？[y/n]

如果用户回答 “no”：跳过 patch，说明 live 直到用户手动加入该 allowance 才能工作，同时仍然把 `cspChecked: true` 写进去（因为这个问题已经问过了）。
如果用户回答 “yes”：按下面对应 shape 的规则打补丁，然后写入 `cspChecked: true`。
#### append-arrays

CSP 以结构化 directive arrays 表达。补丁方式是：先定义一个只在 dev 下生效的数组，然后把它 spread 进 script-src 和 connect-src 对应数组。
**在承载 CSP 数组的文件顶部附近声明：**

```ts
// Dev-only allowance so impeccable live mode can load. Guarded by NODE_ENV.
const __impeccableLiveDev =
  process.env.NODE_ENV === "development" ? ["http://localhost:8400"] : [];
```

**然后把 `...__impeccableLiveDev` 追加到 script-src 和 connect-src 两个 directive array 中。** 各框架细节如下：

- **Next.js + monorepo helper**：改的是**应用自己的** `next.config.*`，而不是那个共享 helper，把它追加到传给 `createBaseNextConfig`（或等价 helper）的 `additionalScriptSrc` 和 `additionalConnectSrc` 中。这样共享包就能保持干净。
- **SvelteKit**：改 `svelte.config.js`，把它追加到 `kit.csp.directives['script-src']` 和 `kit.csp.directives['connect-src']`。
- **Nuxt + nuxt-security**：改 `nuxt.config.*`，把它追加到 `security.headers.contentSecurityPolicy['script-src']` 和 `['connect-src']`。
参考输出：
- `tests/framework-fixtures/nextjs-turborepo/expected-after-patch.ts`（Next.js）
- `tests/framework-fixtures/sveltekit-csp/expected-after-patch.js`（SvelteKit）
幂等性：如果文件里已经存在 `__impeccableLiveDev`，说明补丁已应用。此时无需再问，直接把 `cspChecked: true` 标上即可。
#### append-string

CSP 以字面字符串构建。补丁分两步：先在顶部声明一个 dev-only 字符串，再把它插到 `script-src` 和 `connect-src` 对应片段里。
```ts
// Dev-only allowance so impeccable live mode can load.
const __impeccableLiveDev =
  process.env.NODE_ENV === "development" ? " http://localhost:8400" : "";
```

然后在 CSP 字符串中：
- `script-src 'self' 'unsafe-inline'` -> `` `script-src 'self' 'unsafe-inline'${__impeccableLiveDev}` ``
- `connect-src 'self'` -> `` `connect-src 'self'${__impeccableLiveDev}` ``

（dev 字符串前面特意带一个空格，便于无缝拼接到原值中。如果 CSP 目前不是 template string，就顺手改成 template string。）

各框架细节：
- **Next.js inline `headers()`**：修改 `next.config.*`，把变量拼进 CSP 值。
- **Nuxt `routeRules`**：修改 `nuxt.config.*`，把变量拼进 `routeRules['/**'].headers['Content-Security-Policy']` 对应值中。
参考输出：
- `tests/framework-fixtures/nextjs-inline-csp/expected-after-patch.js`（Next.js）
- `tests/framework-fixtures/nuxt-csp/expected-after-patch.ts`（Nuxt）
### 故障排除

如果用户在 setup 时对 CSP patch 回答 “no”，后来又抱怨 live 不能工作，那原因就是：他的 dev CSP 阻止了 `http://localhost:8400`。修复方式是删除 `config.json` 中的 `cspChecked`，再重新运行 `live.mjs`，这样 setup 就会再次发起询问。
然后重新运行 `live.mjs`。