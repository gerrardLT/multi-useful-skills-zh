# Teach Flow

收集项目的设计上下文，并在项目根目录写入两个互补文件：

- **PRODUCT.md**（战略层）：register、目标用户、产品目的、品牌人格、anti-references、战略设计原则。回答“是谁 / 是什么 / 为什么”。
- **DESIGN.md**（视觉层）：视觉主题、色板、排版、组件、布局。遵循 [Google Stitch DESIGN.md 格式](https://stitch.withgoogle.com/docs/design-md/format/)。回答“它看起来怎样”。

其他所有 impeccable 命令在开始任何工作前，都会先读取这两个文件。

## 第 1 步：加载当前状态

先运行共享 loader，这样你才知道当前已经存在什么：

```bash
node {{scripts_path}}/load-context.mjs
```

输出会告诉你 PRODUCT.md 和 / 或 DESIGN.md 是否已经存在。如果 `migrated: true`，说明旧版 `.impeccable.md` 已自动重命名为 `PRODUCT.md`。把这一点向用户提一次即可。

决策树：
- **两个文件都不存在**（空项目，或尚未建立上下文）：执行第 2-4 步（编写 PRODUCT.md），然后根据是否有代码可分析来决定 DESIGN.md。
- **PRODUCT.md 存在，但 DESIGN.md 缺失**：跳到第 5 步——询问是否要运行 `/impeccable document` 生成 DESIGN.md。
- **PRODUCT.md 存在，但没有 `## Register` 章节**（旧版）：补上它。先根据代码库推断一个假设（见第 2 步），与用户确认后，再写入该字段。
- **两个文件都存在**：{{ask_instruction}} 询问用户想刷新哪个文件。用户不想改的那个就跳过。
- **只有 DESIGN.md 存在**（少见情况）：执行第 2-4 步生成 PRODUCT.md。

绝不要静默覆盖已有文件。一定先确认。

如果 teach 是被其他命令作为 setup 阻塞项触发的，例如 `{{command_prefix}}impeccable craft landing page`，就先在这里暂停原命令。完成 teach 后，重新运行 loader，然后带着最新上下文恢复原始命令。对于 craft，下一步应恢复到 shape；teach 只负责建立项目上下文，不能替代针对当前任务的 shape 访谈和确认过的设计 brief。

## 第 2 步：探索代码库

在提问之前，先尽可能彻底地扫描项目，看看能自己发现什么：

- **README 与文档**：项目目的、目标受众、任何明确写出的目标
- **Package.json / 配置文件**：技术栈、依赖、现有设计库
- **现有组件**：当前使用的设计模式、间距、排版
- **品牌资源**：logo、favicon、已定义的颜色值
- **Design tokens / CSS 变量**：现有色板、字体栈、间距尺度
- **任何 style guide 或品牌文档**

同时，还要基于这些发现形成一个 **register 假设**：

- Brand 信号：`/`、`/about`、`/pricing`、`/blog/*`、`/docs/*`、hero 区块、大字号排版、滚动驱动章节、长得像落地页的内容。
- Product 信号：`/app/*`、`/dashboard`、`/settings`、`/(auth)`、表单、数据表格、侧边 / 顶部导航、app-shell 组件。

此时 register 还只是一个假设，不是最终决定——第 3 步会确认它。

记录你已经学到了什么，以及还有哪些地方不清楚。这个探索结果会同时为 PRODUCT.md 和 DESIGN.md 服务。

## 第 3 步：提战略问题（用于 PRODUCT.md）

{{ask_instruction}} 只询问那些你无法从代码库中推断出来的内容。

### 访谈模式，不是确认模式

如果仓库是空的，或用户给的 brief 很稀薄，就先做一轮简短访谈，再去提议 PRODUCT.md。**不要**把一句话的请求扩写成一份完整推断版 PRODUCT.md，然后让用户一键确认。

- 如果当前 harness 有结构化提问工具，就用它。否则直接在对话里提问，并停下来等待回答。
- **每轮只问 2-3 个问题**，然后等待回答。
- 你可以把推断出的答案作为假设或备选项提出，但不能把它们当作既定事实。
- 除非所有必需答案都能直接从仓库文档里发现，否则至少要完成一轮真实的用户问答后，才能起草 PRODUCT.md。
- 第 1 轮应该确定 register、用户 / 目的，以及期望结果。
- 第 2 轮应该确定品牌人格或参考对象、anti-references，以及可访问性需求。

### 最小可行访谈

问到足够完成 PRODUCT.md 为止。最低限度需要覆盖：register 确认、用户与目的、品牌人格、anti-references，以及可访问性需求；除非这些答案都能直接从仓库上下文中发现。至少完成一轮访谈后，你可以提出推断版答案，但在写 PRODUCT.md 之前，用户必须确认它们。绝不能仅凭最初的任务提示词自行生成 PRODUCT.md。

### Register（先问这个——它会塑造后面的全部内容）

每个设计任务都属于 **brand**（营销、落地页、活动页、长内容、作品集——设计本身就是产品）或 **product**（应用 UI、后台、仪表盘、工具——设计服务于产品）之一。

如果第 2 步已经产生了比较清晰的假设，就用它起手：*"From the codebase, this looks like a [brand / product] surface - does that match your intent, or should we treat it differently?"*

如果信号确实是分裂的（例如一个产品同时有很重的营销落地页），{{ask_instruction}} 询问哪个 register 代表 **主要** 界面。后续单个任务可以再覆盖这个 register，但 PRODUCT.md 只承载一个默认值。

### 用户与目的
- 谁在使用它？他们使用时处于什么情境？
- 他们想完成什么工作？
- 对于 brand：界面应唤起什么情绪？（信任、愉悦、平静、紧迫）
- 对于 product：他们处于什么工作流中？任意一屏上的主要任务是什么？

### 品牌与人格
- 你会用哪 3 个词来形容这个品牌人格？
- 哪些参考网站或应用体现了正确的感觉？具体是哪里对？
  - 对于 brand，要推动用户提供真正位于正确赛道上的现实参考（如 tech-minimal、editorial-magazine、consumer-warm、brutalist-grid 等），而不是泛泛的 “modern” 形容词。
  - 对于 product，要推动用户给出品类中的最佳工具参考（如 Linear、Figma、Notion、Raycast、Stripe）。
- 它明确 **不应该** 看起来像什么？是否有 anti-references？

### 可访问性与包容性
- 有哪些特定可访问性要求？（WCAG 等级、已知用户需求）
- 是否需要考虑 reduced motion、色盲或其他适配？

如果答案已经很明确，就跳过对应问题。**不要在这里问颜色、字体、圆角或视觉样式**——这些属于 DESIGN.md，而不是 PRODUCT.md。

## 第 4 步：编写 PRODUCT.md

只有在用户确认了第 3 步中的战略答案之后，才能写 PRODUCT.md。如果某个推断答案仍不确定或未被确认，那就在写之前先问清楚。

将内容综合为一份战略文档：

```markdown
# Product

## Register

product

## Users
[他们是谁、所处情境、要完成的任务]

## Product Purpose
[这个产品做什么、为什么存在、成功意味着什么]

## Brand Personality
[语气、声音、三词人格、情绪目标]

## Anti-references
[它不应该长成什么样。列出具体的反例网站或要避免的模式。]

## Design Principles
[从对话中提炼出的 3-5 条战略原则。像 “practice what you preach”、“show, don't tell”、“expert confidence” 这种原则，而不是 “use OKLCH” 或 “magenta accent” 这种视觉规则。]

## Accessibility & Inclusion
[WCAG 等级、已知用户需求、特别考虑]
```

Register 必须直接写成裸值 `brand` 或 `product`。不要加解释文字，不要加评论。

写入 `PROJECT_ROOT/PRODUCT.md`。如果 `.impeccable.md` 曾经存在，loader 已经帮你重命名了——应在现有内容基础上合并，而不是从零重写。

## 第 5 步：决定 DESIGN.md

无论如何都要提供 `/impeccable document` 这个选项。分两条路径：

- **已有代码**（有 CSS tokens、组件、运行中的网站）："我可以生成一份 DESIGN.md，把你的视觉系统（颜色、排版、组件）记录下来，让后续变体始终保持品牌一致。现在要做吗？"
- **尚未实现**（空项目）："I can seed a starter DESIGN.md from five quick questions about color strategy, type direction, motion energy, and references. You can re-run once there's code, to capture the real tokens. Want to do that now?"

如果用户同意，就委托给 `/impeccable document`（它会自动判断是 scan 还是 seed）。加载对应 reference，并遵循那套流程。

如果用户选择跳过，就提醒他们以后任何时候都可以运行 `/impeccable document`。

## 第 6 步：确认并收尾

总结：
- 已捕获的 register（brand / product）
- 已写入哪些内容（PRODUCT.md、DESIGN.md，或两者）
- PRODUCT.md 中将指导未来工作的 3-5 条战略原则
- 如果 DESIGN.md 还没生成，提醒用户以后如何生成

**关键：重新运行 loader，刷新会话上下文。** 写完 PRODUCT.md 后，最后再执行一次 `node {{scripts_path}}/load-context.mjs`，并让完整 JSON 输出进入对话。这能确保本会话后续命令读取到的是刚写好的 PRODUCT.md，而不是之前陈旧的版本。

如果 teach 是被其他 impeccable 命令作为阻塞项触发的（例如用户运行 `/impeccable polish` 时没有 PRODUCT.md），现在就带着新上下文恢复那个原始任务。

可选地，{{ask_instruction}} 询问用户是否希望把 PRODUCT.md 的简要摘要追加到 {{config_file}}，方便 agent 引用。如果用户同意，就在那里附加一个简短的 **Design Context** 指针章节。
