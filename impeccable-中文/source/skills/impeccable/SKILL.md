---
name: impeccable
description: "当用户想设计、重设计、塑造、评审、审计、打磨、澄清、提炼、加固、优化、适配、动效、着色、提取，或以其他方式改进前端界面时使用。覆盖网站、落地页、仪表盘、产品 UI、应用外壳、组件、表单、设置页、引导流程和空状态。可处理 UX 评审、视觉层级、信息架构、认知负担、可访问性、性能、响应式行为、主题、反模式、排版、字体、间距、布局、对齐、颜色、动效、微交互、UX 文案、错误状态、边界情况、国际化，以及可复用的设计系统或 tokens。也适用于那些需要变得更大胆、更有趣的平淡设计，需要变得更安静的吵闹设计，对浏览器中的 UI 元素进行实时迭代，或追求技术上足够惊艳的视觉效果。不适用于纯后端或非 UI 任务。"
argument-hint: "[{{command_hint}}] [target]"
user-invocable: true
allowed-tools:
  - Bash(npx impeccable *)
license: Apache 2.0。基于 Anthropic 的前端设计技能。详见 NOTICE.md 了解归属信息。
---

设计并迭代生产级前端界面。目标是交付真实可运行的代码、明确的设计取舍，以及出色的工艺质量。

## 设置（不可跳过）

在进行任何设计工作或文件编辑前，必须先通过这些检查关卡。跳过它们，输出就会忽略项目上下文，收敛成泛化答案。

| 关卡 | 必要检查 | 如果失败 |
|---|---|---|
| 上下文 | 已通过 `node {{scripts_path}}/load-context.mjs` 获取 PRODUCT.md / DESIGN.md 的加载结果。 | 先运行加载器再继续。 |
| 产品 | PRODUCT.md 存在，且不是空文件或占位内容（如 `[TODO]`，或少于 200 字符）。 | 运行 `{{command_prefix}}impeccable teach`，刷新上下文后再恢复任务。绝不能只根据用户原始提示词臆造 PRODUCT.md。 |
| 命令 | 使用子命令时，已加载对应的命令参考文档。 | 先加载参考文档再继续。 |
| 工艺 | `{{command_prefix}}impeccable craft` 已经拿到用户明确确认过的 shape brief。`teach` / PRODUCT.md 永远不算 shape。 | 运行 `{{command_prefix}}impeccable shape`，并等待用户明确确认 brief。 |
| 图像 | 必需的视觉探针 / mock 已生成，或已说明跳过理由。 | 在写代码前，先解决 `shape.md` 或 `craft.md` 里的图像生成关卡。 |
| 变更 | 上述所有活动关卡都已通过。 | 现在还不要编辑项目文件。 |

Codex 风格的 agent 在编辑文件前必须先声明：

```text
IMPECCABLE_PREFLIGHT: context=pass product=pass command_reference=pass shape=pass|not_required image_gate=pass|skipped:<reason> mutation=open
```

对于 `{{command_prefix}}impeccable craft`，只有在用户单独回复确认了 shape 设计 brief，或用户请求里已经给出了一个事先确认过的 brief 时，`shape=pass` 才成立。不要在你自己写完 PRODUCT.md、总结完假设，或刚草拟了一个未确认 brief 后就标记 `shape=pass`。

其他 harness 如果能暴露相同状态，也应遵循同一份检查清单。

### 1. 收集上下文

项目根目录下有两个文件，大小写不敏感：

- **PRODUCT.md**：必需。包含用户、品牌、语气、反参考、战略原则。
- **DESIGN.md**：可选，但强烈建议。包含颜色、排版、层次、组件。

一次性加载两者：

```bash
node {{scripts_path}}/load-context.mjs
```

要消费完整 JSON 输出。绝不要再用 `head`、`tail`、`grep` 或 `jq` 去截断。

如果本次会话的对话历史里已经有输出，就不要重复运行。以下情况例外，需要重新加载：你刚运行了 `{{command_prefix}}impeccable teach` 或 `{{command_prefix}}impeccable document`，或用户手动编辑了其中之一。

`{{command_prefix}}impeccable live` 已经会通过 `live.mjs` 预热上下文；如果你本会话已经跑过 `live.mjs`，就不要再跑 `load-context.mjs`。

如果 PRODUCT.md 缺失、为空，或只是占位内容（如 `[TODO]`，或少于 200 字符）：先运行 `{{command_prefix}}impeccable teach`，然后带着新的上下文恢复用户原始任务。如果原始任务是 `{{command_prefix}}impeccable craft`，那就先进入 `{{command_prefix}}impeccable shape`，再开始任何实现工作。

如果 DESIGN.md 缺失：每个会话只提醒一次，类似 *"运行 `{{command_prefix}}impeccable document` 以获得更贴合品牌的设计输出"*，然后继续。

### 2. 注册

每个设计任务都属于 **品牌** 或 **产品**。

- **品牌**：营销、落地页、活动页、长内容、作品集。设计本身就是产品。
- **产品**：应用 UI、后台、仪表盘、工具。设计服务于产品。

设计前先识别。优先级如下：
1. 任务本身的提示词，例如 “landing page” vs “dashboard”
2. 当前聚焦的界面，即页面、文件或路由
3. PRODUCT.md 中的 `register` 字段

谁先匹配就用谁。

如果 PRODUCT.md 缺少 `register` 字段（旧格式），就根据其中的 “用户” 和 “产品目的” 章节推断一次，并在本次会话里缓存该结果。同时建议用户运行 `{{command_prefix}}impeccable teach`，把这个字段显式补上。

加载对应的参考文档：[reference/brand.md](reference/brand.md) 或 [reference/product.md](reference/product.md)。下面的共享设计法则对两者都适用。

## 共享设计法则

适用于所有设计，不论注册类型是什么。让实现复杂度与审美目标相匹配：极繁需要更复杂的代码，极简需要更高精度。要有创造性地理解，不同项目必须做出不同选择，绝不要收敛成同一套答案。{{model}} 能做出非常出色的作品，不要收着。

### 颜色

- 使用 OKLCH。当亮度接近 0 或 100 时，降低色度，高色度在极端明暗下会显得刺眼。
- 永远不要使用 `#000` 或 `#fff`。让所有中性色都轻微向品牌色偏移一点点（色度到 0.005-0.01 就够）。
- 在选颜色之前，先确定 **颜色策略**。它沿着“承诺度”分成四档：
  - **克制**：染色中性色 + 一个强调色，占比不超过约 10%。是产品的默认策略，也是品牌极简风格的默认策略。
  - **专注**：一个高饱和色承担 30-40% 的界面面积。是强品牌识别页的默认策略。
  - **完整调色板**：有 3-5 个命名角色颜色，并且每个都被有意识地使用。适用于品牌活动页和产品内数据可视化。
  - **沉浸**：表面本身就是颜色。适用于品牌 hero 和活动页面。
- “一个强调色不超过 10%” 只适用于克制策略。专注 / 完整调色板 / 沉浸策略本来就会主动超过这个比例。不要条件反射地把所有设计都压回克制策略。

### 主题

深色或浅色永远都不是默认答案。不是因为“工具类产品深色更酷”就用深色，也不是因为“保守一点更安全”就用浅色。

在做选择前，先写一句具体的物理场景：谁在用它、在哪里、环境光如何、情绪如何。如果这句话还逼不出一个明确答案，说明它还不够具体，需要补细节。

“可观测性仪表盘” 不足以决定主题；“SRE 在凌晨 2 点、昏暗房间里，用 27 英寸显示器扫一眼事故严重级别” 才足够。遵循场景，而不是遵循品类标签。

### 排版

- 正文行长上限控制在 65-75ch。
- 通过字号和字重对比构建层级，相邻层级比例差至少约 1.25。避免扁平型尺寸系统。

### 布局

- 通过变化中的间距建立节奏。到处都用同样的 padding 会显得单调。
- 卡片是最偷懒的答案。只有当它真的是最佳承载方式时才使用。嵌套卡片永远是错的。
- 不要把所有东西都包进 container。大多数内容其实不需要。

### 动效

- 不要给 CSS 布局属性做动画。
- 使用指数式 ease-out 曲线，如 ease-out-quart / quint / expo。不要使用 bounce，也不要使用 elastic。

### 绝对禁令

一旦你准备写出下面任意一种东西，就应该停下来，换一种结构重写。

- **侧条强调边框。** 在卡片、列表项、callout 或 alert 上使用大于 1px 的 `border-left` / `border-right` 作为彩色强调。永远不要故意这么做。改用完整边框、背景色块、前置数字 / 图标，或者干脆什么都不用。
- **渐变文字。** 把 `background-clip: text` 和渐变背景绑在一起。它只有装饰性，没有真正意义。用纯色；强调靠字重或字号。
- **把玻璃拟态当默认答案。** 只有在少数真正有目的的场景下才使用模糊和玻璃卡片，否则不要用。
- **hero 指标模板。** 大数字、小标签、辅助统计、渐变强调。这是典型 SaaS 陈词滥调。
- **一模一样的卡片网格。** 一连串同尺寸卡片，每张都只是 icon + heading + text。
- **第一反应就是 modal。** 大多数时候这是偷懒。先把 inline / progressive alternatives 用尽。

### 文案

- 每个词都必须证明自己有必要存在。不要重述标题，也不要写会把标题再说一遍的开场句。
- **不要用 em dash。** 用逗号、冒号、分号、句号或括号。也不要写 `--`。

### AI slop 测试

如果别人只看一眼这个界面，就能毫不犹豫地说出“这就是 AI 做的”，那它就失败了。跨注册类型的失败信号，就是上面的那些绝对禁令。各自注册类型的特定失败模式写在各自的参考文档里。

**品类反射检查。** 如果别人只看品类名，就能猜出主题和配色，比如 “可观测性 -> 深蓝”、“医疗 -> 白 + 青绿”、“金融 -> 海军蓝 + 金色”、“加密 -> 黑底霓虹”，那就是训练数据的条件反射。回去重写场景句和颜色策略，直到答案不再能从领域名称中被直接猜出来。

## 命令

| 命令 | 类别 | 描述 | 参考文档 |
|---|---|---|---|
| `craft [feature]` | 构建 | 先 shape，再端到端构建一个功能 | [reference/craft.md](reference/craft.md) |
| `shape [feature]` | 构建 | 在写代码前规划 UX/UI | [reference/shape.md](reference/shape.md) |
| `teach` | 构建 | 建立 PRODUCT.md 和 DESIGN.md 上下文 | [reference/teach.md](reference/teach.md) |
| `document` | 构建 | 根据现有项目代码生成 DESIGN.md | [reference/document.md](reference/document.md) |
| `extract [target]` | 构建 | 把可复用 tokens 和组件提取进设计系统 | [reference/extract.md](reference/extract.md) |
| `critique [target]` | 评估 | 带启发式评分的 UX 设计评审 | [reference/critique.md](reference/critique.md) |
| `audit [target]` | 评估 | 技术质量检查（a11y、性能、响应式） | [reference/audit.md](reference/audit.md) |
| `polish [target]` | 优化 | 上线前的最终质量打磨 | [reference/polish.md](reference/polish.md) |
| `bolder [target]` | 优化 | 放大过于安全或平淡的设计 | [reference/bolder.md](reference/bolder.md) |
| `quieter [target]` | 优化 | 压低过于激进或刺激的设计 | [reference/quieter.md](reference/quieter.md) |
| `distill [target]` | 优化 | 提炼本质，移除复杂度 | [reference/distill.md](reference/distill.md) |
| `harden [target]` | 优化 | 让它达到生产可用：错误、i18n、边界情况 | [reference/harden.md](reference/harden.md) |
| `onboard [target]` | 优化 | 设计首次使用流程、空状态与激活路径 | [reference/onboard.md](reference/onboard.md) |
| `animate [target]` | 增强 | 增加有目的的动画与动效 | [reference/animate.md](reference/animate.md) |
| `colorize [target]` | 增强 | 给单色 UI 引入有策略的色彩 | [reference/colorize.md](reference/colorize.md) |
| `typeset [target]` | 增强 | 改善排版层级与字体选择 | [reference/typeset.md](reference/typeset.md) |
| `layout [target]` | 增强 | 修复间距、节奏与视觉层级 | [reference/layout.md](reference/layout.md) |
| `delight [target]` | 增强 | 加入个性与令人记住的细节 | [reference/delight.md](reference/delight.md) |
| `overdrive [target]` | 增强 | 推到超出常规上限的程度 | [reference/overdrive.md](reference/overdrive.md) |
| `clarify [target]` | 修复 | 改善 UX 文案、标签和错误提示 | [reference/clarify.md](reference/clarify.md) |
| `adapt [target]` | 修复 | 适配不同设备和屏幕尺寸 | [reference/adapt.md](reference/adapt.md) |
| `optimize [target]` | 修复 | 诊断并修复 UI 性能问题 | [reference/optimize.md](reference/optimize.md) |
| `live` | 迭代 | 视觉变体模式：在浏览器中选元素并生成替代方案 | [reference/live.md](reference/live.md) |

另外还有两个管理命令：`pin <command>` 和 `unpin <command>`，见下文。

### 路由规则

1. **没有参数**：把上面的表按类别分组，渲染为面向用户的命令菜单，并询问他们想做什么。
2. **第一个词匹配某个 command**：加载对应的参考文档并遵循其指令。command 名后的所有内容都视为 target。
3. **第一个词不匹配任何 command**：按一般设计调用处理。应用设置步骤、共享设计法则和已加载的注册类型参考文档，并把完整参数作为上下文。

到这一步为止，设置（上下文收集、注册类型识别）应当已经完成；子命令不应再次调用 `{{command_prefix}}impeccable`。

如果第一个词是 `craft`，设置仍然要先运行，但后续流程由 [reference/craft.md](reference/craft.md) 接管。如果设置过程中因为阻塞项调用了 `teach`，那就先完成 teach、刷新上下文，然后恢复原始命令和 target。

## Pin / Unpin

**Pin** 会创建一个独立快捷入口，让 `{{command_prefix}}<command>` 直接调用 `{{command_prefix}}impeccable <command>`。**Unpin** 会移除它。该脚本会向项目里所有存在的 harness 目录写入对应内容。

```bash
node {{scripts_path}}/pin.mjs <pin|unpin> <command>
```

合法的 `<command>` 就是上表中的任意命令。汇报脚本结果时请保持简洁：成功时确认新快捷入口已创建，失败时把 stderr 原样转述。