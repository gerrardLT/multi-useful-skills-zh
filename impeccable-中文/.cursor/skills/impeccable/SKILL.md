---
name: impeccable
description: 当用户想要设计、重设计、塑造、评审、审计、打磨、澄清、提炼、加固、优化、适配、动画、着色、提取，或以其他方式改进前端界面时使用。覆盖网站、落地页、仪表盘、产品 UI、应用外壳、组件、表单、设置页、引导流程和空状态。可处理 UX 评审、视觉层级、信息架构、认知负荷、可访问性、性能、响应式行为、主题、反模式、排版、字体、间距、布局、对齐、颜色、动效、微交互、UX 文案、错误状态、边界情况、国际化，以及可复用的设计系统或 tokens。也适用于那些需要变得更大胆、更有趣的平淡设计，需要变得更安静的吵闹设计，对浏览器中 UI 元素进行实时迭代，或追求技术上足够惊艳的视觉效果。不适用于纯后端或非 UI 任务。
---

设计并迭代生产级前端界面。真实可运行的代码，明确的设计取舍，出色的工艺质量。

## Setup（不可跳过）

在进行任何设计工作或文件编辑之前，必须通过这些关卡。跳过它们会产生忽略项目上下文的泛化输出。

| Gate | 必要检查 | 如果失败 |
|---|---|---|
| Context | 已通过 `node .agents/skills/impeccable/scripts/load-context.mjs` 获取到 PRODUCT.md / DESIGN.md 的加载结果。 | 先运行 loader 再继续。 |
| Product | PRODUCT.md 存在，并且不是空文件或占位内容（如 `[TODO]` 标记，或少于 200 字符）。 | 运行 `$impeccable teach`，刷新上下文后再继续。绝不能只根据用户原始提示词自行编造 PRODUCT.md。 |
| Command | 使用子命令时，已经加载对应的 command reference。 | 先加载 reference 再继续。 |
| Craft | 对当前任务来说，`$impeccable craft` 已拥有用户确认过的 shape brief。`teach` / PRODUCT.md 永远不算 shape。 | 运行 `$impeccable shape` 并等待用户明确确认 brief。 |
| Image | 必需的视觉探针 / mock 已生成，或已说明跳过理由。 | 在写代码前，先解决 `shape.md` 或 `craft.md` 里的图像生成关卡。 |
| Mutation | 以上所有活动关卡都已通过。 | 现在还不要编辑项目文件。 |

Codex 风格的 agent 在编辑文件前必须先声明：

```text
IMPECCABLE_PREFLIGHT: context=pass product=pass command_reference=pass shape=pass|not_required image_gate=pass|skipped:<reason> mutation=open
```

对于 `$impeccable craft`，只有在用户单独回复批准了 shape 设计 brief，或者用户请求中已经给出了一个明确确认过的 brief 时，`shape=pass` 才成立。不要在自己写完 PRODUCT.md、总结完假设，或草拟了一个尚未确认的 brief 后就标记 `shape=pass`。

其他 harness 如果能暴露相同状态，也应遵循同样的检查清单。

### 1. 收集上下文

项目根目录下有两个文件，大小写不敏感：

- **PRODUCT.md**：必需。包含用户、品牌、语气、反参考、战略原则。
- **DESIGN.md**：可选，但强烈推荐。包含颜色、排版、层次、组件。

一次性加载两者：

```bash
node .agents/skills/impeccable/scripts/load-context.mjs
```

要消费完整的 JSON 输出。绝不要再用 `head`、`tail`、`grep` 或 `jq` 进行截断。

如果本次会话的对话历史里已经有输出，就不要重复运行。以下情况例外，需要重新加载：你刚刚运行了 `$impeccable teach` 或 `$impeccable document`（它们会重写这些文件），或用户手动编辑了其中之一。

`$impeccable live` 已经会通过 `live.mjs` 预热上下文；如果你本会话已经运行过 `live.mjs`，就不要再运行 `load-context.mjs`。

如果 PRODUCT.md 缺失、为空或只是占位内容（如 `[TODO]` 标记，或少于 200 字符）：先运行 `$impeccable teach`，然后带着新的上下文恢复用户原始任务。如果原始任务是 `$impeccable craft`，那就先进入 `$impeccable shape`，再开始任何实现工作。

如果 DESIGN.md 缺失：每个会话只提醒一次（*"Run `$impeccable document` for more on-brand output"*），然后继续。

### 2. Register

每个设计任务都属于 **brand**（营销、落地页、活动页、长内容、作品集，设计本身就是产品）或 **product**（应用 UI、后台、仪表盘、工具，设计服务于产品）之一。

设计之前先识别。优先级如下：1）任务本身的提示词（如 “landing page” vs “dashboard”）；2）当前聚焦的界面（页面、文件或路由）；3）PRODUCT.md 中的 `register` 字段。谁先匹配就用谁。

如果 PRODUCT.md 缺少 `register` 字段（旧格式），就根据其中的 “Users” 和 “Product Purpose” 章节推断一次，并在本次会话里缓存该结果。同时建议用户运行 `$impeccable teach`，把这个字段显式补上。

加载对应的 reference：[reference/brand.md](reference/brand.md) 或 [reference/product.md](reference/product.md)。下面的共享设计法则对两者都适用。

## 共享设计法则

适用于所有设计，无论 register 是什么。让实现复杂度与审美目标相匹配，极繁需要更复杂的代码，极简需要更高精度。要有创造性地理解，不同项目必须做出不同选择，绝不要收敛成同一套答案。GPT 能做出非常出色的作品，不要收着。

### 颜色

- 使用 OKLCH。当亮度接近 0 或 100 时，降低 chroma，高 chroma 在极端明暗下会显得刺眼俗艳。
- 永远不要使用 `#000` 或 `#fff`。让所有中性色都轻微朝品牌色偏移（chroma 到 0.005–0.01 就够了）。
- 在选颜色之前，先确定 **颜色策略**。它沿着承诺度轴分成四档：
  - **Restrained**：染色中性色 + 一个强调色，占比不超过约 10%。是 product 的默认策略，也是 brand 极简风格的默认策略。
  - **Committed**：一个高饱和色承担表面 30–40% 的面积。是强品牌识别页面的默认策略。
  - **Full palette**：有 3–5 个命名角色色，并且都被有意使用。适用于品牌活动页和产品中的数据可视化。
  - **Drenched**：表面本身就是颜色。适用于品牌 hero 和活动页面。
- “一个强调色不超过 10%” 只适用于 Restrained。Committed / Full palette / Drenched 本来就会主动超过这个比例。不要条件反射地把所有设计都压回 Restrained。

### 主题

深色或浅色永远都不是默认选项。不是因为“工具类产品深色更酷”就用深色，也不是因为“保守一点更安全”就用浅色。

在做选择前，先写一句具体的物理场景：谁在使用它、在哪里、环境光怎样、情绪怎样。如果这句话还不能逼出一个明确答案，就说明它还不够具体，需要补细节。

“Observability dashboard” 不足以决定主题；“SRE glancing at incident severity on a 27-inch monitor at 2am in a dim room” 就足够。遵循场景句，而不是遵循品类标签。

### 排版

- 正文行长上限控制在 65–75ch。
- 通过字号和字重对比构建层级（相邻层级比例差至少约 1.25）。避免扁平型尺度系统。

### 布局

- 通过变化中的间距建立节奏。到处都用同样的 padding 会显得单调。
- 卡片是最偷懒的答案。只有当它真的是最佳承载方式时才使用。嵌套卡片永远是错的。
- 不要把所有东西都包进 container。大多数内容其实不需要。

### 动效

- 不要给 CSS 布局属性做动画。
- 使用指数式 ease-out 曲线（ease-out-quart / quint / expo）。不要使用 bounce，也不要用 elastic。

### 绝对禁令

一旦你准备写出下面任意一种东西，就应该停下来，换一种结构重写。

- **侧条强调边框。** 在卡片、列表项、callout 或 alert 上使用大于 1px 的 `border-left` 或 `border-right` 作为彩色强调。永远不要故意这么做。改用完整边框、背景色块、前置数字 / 图标，或者干脆什么都不用。
- **渐变文字。** 把 `background-clip: text` 和渐变背景结合起来。它只有装饰性，没有真正含义。用纯色；强调靠字重或字号。
- **把玻璃拟态当默认答案。** 只把模糊和玻璃卡片用作少数真正有目的的场景，否则就不要用。
- **hero 指标模板。** 大数字、小标签、辅助统计、渐变强调。这是典型 SaaS 陈词滥调。
- **一模一样的卡片网格。** 一连串同尺寸卡片，每张都只是 icon + heading + text。
- **第一反应就是 modal。** 大多数时候这是偷懒。先把 inline / progressive alternatives 用尽。

### 文案

- 每一个词都要证明自己的必要性。不要重复标题，也不要写会把标题重说一遍的开场句。
- **不要用 em dash。** 用逗号、冒号、分号、句号或括号。也不要写 `--`。

### AI slop 测试

如果有人看一眼这个界面，就能毫无疑问地说出“这就是 AI 做的”，那它就失败了。跨 register 的失败信号就是上面的那些绝对禁令。各自 register 的特定失败模式写在各自的 reference 里。

**品类反射检查。** 如果别人只看品类名字，就能猜出主题和配色，比如 “observability -> 深蓝”、“healthcare -> 白 + 青绿”、“finance -> 海军蓝 + 金色”、“crypto -> 黑底霓虹”，那就是训练数据的条件反射。回去重写场景句和颜色策略，直到答案不再能从领域名称中被直接猜出来。

## Commands

| Command | Category | Description | Reference |
|---|---|---|---|
| `craft [feature]` | Build | 先 shape，再端到端构建一个功能 | [reference/craft.md](reference/craft.md) |
| `shape [feature]` | Build | 在写代码前规划 UX/UI | [reference/shape.md](reference/shape.md) |
| `teach` | Build | 设置 PRODUCT.md 和 DESIGN.md 上下文 | [reference/teach.md](reference/teach.md) |
| `document` | Build | 根据现有项目代码生成 DESIGN.md | [reference/document.md](reference/document.md) |
| `extract [target]` | Build | 将可复用 tokens 和组件提取进设计系统 | [reference/extract.md](reference/extract.md) |
| `critique [target]` | Evaluate | 带启发式评分的 UX 设计评审 | [reference/critique.md](reference/critique.md) |
| `audit [target]` | Evaluate | 技术质量检查（a11y、性能、响应式） | [reference/audit.md](reference/audit.md) |
| `polish [target]` | Refine | 上线前的最终质量打磨 | [reference/polish.md](reference/polish.md) |
| `bolder [target]` | Refine | 放大过于安全或平淡的设计表达 | [reference/bolder.md](reference/bolder.md) |
| `quieter [target]` | Refine | 压低过于激进或过度刺激的设计 | [reference/quieter.md](reference/quieter.md) |
| `distill [target]` | Refine | 提炼本质，移除复杂度 | [reference/distill.md](reference/distill.md) |
| `harden [target]` | Refine | 让它达到生产可用：错误、i18n、边界情况 | [reference/harden.md](reference/harden.md) |
| `onboard [target]` | Refine | 设计首次使用流程、空状态与激活路径 | [reference/onboard.md](reference/onboard.md) |
| `animate [target]` | Enhance | 增加有目的的动画与动效 | [reference/animate.md](reference/animate.md) |
| `colorize [target]` | Enhance | 为单色 UI 加入有策略的色彩 | [reference/colorize.md](reference/colorize.md) |
| `typeset [target]` | Enhance | 改善排版层级与字体选择 | [reference/typeset.md](reference/typeset.md) |
| `layout [target]` | Enhance | 修复间距、节奏与视觉层级 | [reference/layout.md](reference/layout.md) |
| `delight [target]` | Enhance | 加入个性与让人记住的细节 | [reference/delight.md](reference/delight.md) |
| `overdrive [target]` | Enhance | 推到超出常规上限的程度 | [reference/overdrive.md](reference/overdrive.md) |
| `clarify [target]` | Fix | 改善 UX 文案、标签和错误消息 | [reference/clarify.md](reference/clarify.md) |
| `adapt [target]` | Fix | 适配不同设备和屏幕尺寸 | [reference/adapt.md](reference/adapt.md) |
| `optimize [target]` | Fix | 诊断并修复 UI 性能问题 | [reference/optimize.md](reference/optimize.md) |
| `live` | Iterate | 视觉变体模式：在浏览器中选择元素并生成替代方案 | [reference/live.md](reference/live.md) |

另外还有两个管理命令，`pin <command>` 和 `unpin <command>`，说明见下文。

### 路由规则

1. **没有参数**：把上面的表格按类别分组渲染为面向用户的命令菜单，并询问他们想做什么。
2. **第一个词匹配某个 command**：加载对应的 reference 文件并遵循其中指令。command 名后的所有内容都视为 target。
3. **第一个词不匹配任何 command**：作为一般设计调用处理。应用 setup 步骤、共享设计法则和已加载的 register reference，并把完整参数作为上下文。

到这一步为止，setup（上下文收集、register 识别）应当已经完成；子命令不应再次调用 `$impeccable`。

如果第一个词是 `craft`，setup 仍然要先运行，但后续流程由 [reference/craft.md](reference/craft.md) 接管。如果 setup 过程中因为阻塞项调用了 `teach`，那就先完成 teach、刷新上下文，然后恢复原始命令和 target。

## Pin / Unpin

**Pin** 会创建一个独立快捷入口，让 `$<command>` 直接调用 `$impeccable <command>`。**Unpin** 会移除它。这个脚本会向项目中所有已存在的 harness 目录写入对应内容。

```bash
node .agents/skills/impeccable/scripts/pin.mjs <pin|unpin> <command>
```

合法的 `<command>` 就是上表中的任意命令。汇报脚本结果时请保持简洁：成功时确认新快捷入口已创建，失败时把 stderr 原样转述。