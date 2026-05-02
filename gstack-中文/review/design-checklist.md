# 设计审查清单（精简版）

> **DESIGN_METHODOLOGY 的子集** — 在此处添加项目时，还要更新 `scripts/gen-skill-docs.ts` 中的 `generateDesignMethodology()`，反之亦然。

## 指示

此清单适用于**差异中的源代码** - 不渲染输出。读取每个更改的前端文件（完整文件，而不仅仅是差异块）并标记反模式。

**触发器：** 仅当差异涉及前端文件时才运行此检查表。使用 `gstack-diff-scope` 检测：

```bash
source <(~/.claude/skills/gstack/bin/gstack-diff-scope <base> 2>/dev/null)
```

如果 `SCOPE_FRONTEND=false`，则默默地跳过整个设计审查。

**DESIGN.md 校准：** 如果存储库根目录中存在 `DESIGN.md` 或 `design-system.md`，请先读取它。所有调查结果均根据项目规定的设计系统进行校准。 DESIGN.md 中明确祝福的模式不会被标记。如果不存在 DESIGN.md，请使用通用设计原则。

---

## 置信度等级

每个项目都标有检测置信度：

- **[HIGH]** — 可通过 grep/pattern 匹配可靠地检测到。明确的调查结果。
- **[MEDIUM]** — 可通过模式聚合或启发式检测。标记为调查结果，但预计会出现一些噪音。
- **[低]** — 需要理解视觉意图。显示为：“可能的问题 - 目视验证或运行 /design-review。”

---

## 分类

**自动修复**（仅机械 CSS 修复 - 高置信度，无需设计判断）：
- `outline: none` 不替换 → 添加 `outline: revert` 或 `&:focus-visible { outline: 2px solid currentColor; }`
- 新 CSS 中的 `!important` → 删除并修复特殊性
- 正文文本上的 `font-size` < 16px → 变为 16px

**询问**（其他一切 - 需要设计判断）：
- 所有 AI 溢出结果、排版结构、间距选择、交互状态差距、DESIGN.md 违规

**低置信度项目** → 显示为“可能：[描述]。目视验证或运行 /design-review。”切勿自动修复。

---

## 输出格式

```
Design Review: N issues (X auto-fixable, Y need input, Z possible)

**AUTO-FIXED:**
- [file:line] Problem → fix applied

**NEEDS INPUT:**
- [file:line] Problem description
  Recommended fix: suggested fix

**POSSIBLE (verify visually):**
- [file:line] Possible issue — verify with /design-review
```

可选：`test_stub` — 使用项目测试框架的此发现的框架测试代码。

如果没有发现问题：`Design Review: No issues found.`

如果前端文件没有更改：静默跳过，没有输出。

---

## 类别

### 1. AI Slop检测（6项）——最高优先级

这些都是人工智能生成的用户界面的明显迹象，受人尊敬的工作室的设计师都不会发布这些信息。

- **[中]** 紫色/violet/indigo 渐变背景或蓝紫色配色方案。查找值在 `#6366f1`–`#8b5cf6` 范围内的 `linear-gradient`，或解析为 Purple/violet 的 CSS 自定义属性。

- **[低]** 3 列特征网格：彩色圆圈图标 + 粗体标题 + 2 行描述，对称重复 3 次。查找包含 3 个子元素的 grid/flex 容器，每个子元素包含一个圆形元素 + 标题 + 段落。

- **[低]** 彩色圆圈中的图标作为部分装饰。查找具有 `border-radius: 50%` + 用作图标装饰容器的背景颜色的元素。

- **[HIGH]** 将所有内容居中：所有标题、描述和卡片上的 `text-align: center`。 Grep 获取 `text-align: center` 密度 — 如果 >60% 的文本容器使用中心对齐，则标记它。

- **[中]** 每个元素上的均匀气泡边框半径：相同的大半径（16px+）均匀地应用于卡片、按钮、输入、容器。聚合 `border-radius` 值 — 如果 >80% 使用相同值 ≥16px，则标记它。

- **[中]** 通用英雄文案：“欢迎来到 [X]”、“解锁...的力量”、“您的一体化解决方案...”、“革新您的...”、“简化您的工作流程”。 Grep HTML/JSX 这些模式的内容。

### 2. 版式（4项）

- **[高]** 正文 `font-size` < 16 像素。 Grep 查找 `body`、`p`、`.text` 或基本样式上的 `font-size` 声明。低于 16px（或当基数为 16px 时为 1rem）的值将被标记。

- **[HIGH]** 差异中引入了 3 个以上的字体系列。计算不同的 `font-family` 声明。如果更改的文件中出现超过 3 个唯一族，则进行标记。

- **[HIGH]** 标题层次结构跳过级别：`h1` 后跟 `h3`，在同一文件 /component 中没有 `h2`。检查 HTML/JSX 的标题标签。

- **[HIGH]** 列入黑名单的字体：Papyrus、Comic Sans、Lobster、Impact、Jokerman。 Grep `font-family` 查找这些名称。

### 3. 间距和布局（4 项）

- **[MEDIUM]** 当 DESIGN.md 指定间距比例时，任意间距值不在 4px 或 8px 比例上。根据规定的比例检查 `margin`、`padding`、`gap` 值。仅在 DESIGN.md 定义比例时进行标记。

- **[MEDIUM]** 没有响应式处理的固定宽度：没有 `max-width` 或 `@media` 断点的容器上的 `width: NNNpx`。移动设备上存在水平滚动的风险。

- **[MEDIUM]** 文本容器上缺少 `max-width`：没有设置 `max-width` 的正文或段落容器，允许行 >75 个字符。检查文本包装器上是否有 `max-width`。

- **[HIGH]** 新 CSS 规则中的 `!important`。在添加的行中查找 `!important`。几乎总是一个应该正确固定的特殊逃生舱口。

### 4.交互状态（3项）

- **[中]** 交互元素（按钮、链接、输入）缺少悬停/focus 状态。检查新的交互元素样式是否存在 `:hover` 和 `:focus` 或 `:focus-visible` 伪类。

- **[HIGH]** `outline: none` 或 `outline: 0` 没有替换焦点指示器。 Grep 查找 `outline:\s*none` 或 `outline:\s*0`。这消除了键盘辅助功能。

- **[低]** 交互式元素上的触摸目标< 44px。检查按钮和链接上的 `min-height`/`min-width`/`padding`。需要从多个属性计算有效大小——仅从代码中可信度较低。

### 5. DESIGN.md 违规（3 项，有条件）

仅当 `DESIGN.md` 或 `design-system.md` 存在时才适用：

- **[中]** 颜色不在规定的调色板中。将更改后的 CSS 中的颜色值与 DESIGN.md 中定义的调色板进行比较。

- **[MEDIUM]** 字体不在规定的版式部分中。将 `font-family` 值与 DESIGN.md 的字体列表进行比较。

- **[中]** 间距值超出规定范围。将 `margin`/`padding`/`gap` 值与 DESIGN.md 的间距比例进行比较。

---

## 删除

请勿标记：
- DESIGN.md 中明确记录的模式作为有意选择
- 第三方/vendor CSS 文件（node_modules、供应商目录）
- CSS 重置或标准化样式表
- 测试夹具文件
- 生成/minified CSS
