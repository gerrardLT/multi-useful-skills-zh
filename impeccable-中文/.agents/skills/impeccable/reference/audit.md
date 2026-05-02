运行系统化的 **技术性** 质量检查，并生成一份完整报告。不要在这里修问题——把问题记录下来，交给其他命令去处理。

这是一次代码层面的 audit，不是设计 critique。检查那些可测量、可验证的实现问题。

## Diagnostic Scan

围绕 5 个维度做全面检查。每个维度按下方标准打 0-4 分。

### 1. Accessibility（A11y）

**检查内容**：
- **对比度问题**：文字对比度低于 4.5:1（或 AAA 的 7:1）
- **缺失 ARIA**：交互元素没有正确的 role、label 或 state
- **键盘导航**：缺失 focus 指示、tab 顺序混乱、存在键盘陷阱
- **语义化 HTML**：标题层级错误、缺失 landmarks、该用 button 却用了 div
- **Alt text**：图片说明缺失或质量差
- **表单问题**：input 没有关联 label、错误信息差、缺少必填提示

**评分 0-4**：0=无法访问（连 WCAG A 都失败），1=存在重大缺口（几乎没 ARIA、不能键盘导航），2=部分完成（有一些 a11y 工作，但仍有明显缺口），3=良好（基本满足 WCAG AA，仅有小缺口），4=优秀（完全满足 WCAG AA，并接近 AAA）

### 2. Performance

**检查内容**：
- **布局抖动 / thrashing**：在循环中反复读写布局属性
- **高开销动画**：随意动画化布局属性、无边界 blur / filter / shadow 效果，或肉眼可见掉帧的效果
- **缺少优化**：图片没 lazy load、资源未优化、缺失 `will-change`
- **包体积**：不必要的 import、未使用依赖
- **渲染性能**：不必要的重复渲染、缺失 memoization

**评分 0-4**：0=严重问题（布局抖动、完全没优化），1=重大问题（无 lazy loading、高开销动画泛滥），2=部分优化（有些优化但仍有缺口），3=良好（总体已优化，只剩小改进空间），4=优秀（快速、轻量、优化充分）

### 3. Theming

**检查内容**：
- **硬编码颜色**：颜色没有走 design tokens
- **深色模式损坏**：缺少 dark mode variants，或深色主题对比度差
- **Token 使用不一致**：用了错误 token，或混用了不同 token 类型
- **主题切换问题**：切换主题后某些值不会更新

**评分 0-4**：0=没有 theming（几乎全硬编码），1=只有少量 token（大多仍硬编码），2=部分完成（有 token 体系，但使用不一致），3=良好（大多使用 token，只剩少量硬编码），4=优秀（完整 token 系统，dark mode 工作完好）

### 4. Responsive Design

**检查内容**：
- **固定宽度**：硬编码宽度，导致移动端断裂
- **Touch targets**：交互元素小于 44x44px
- **横向滚动**：窄视口下内容溢出
- **文字缩放**：文字放大时布局崩坏
- **缺失断点**：没有 mobile / tablet 变体

**评分 0-4**：0=只支持桌面（移动端直接坏掉），1=重大问题（有少量断点，但大量失败），2=部分完成（移动端能用，但边角粗糙），3=良好（整体响应式成立，只剩小问题，如 touch target 或偶发 overflow），4=优秀（流体适配，多视口稳定，touch target 正确）

### 5. Anti-Patterns（CRITICAL）

对照父级 impeccable skill 中所有 **DON'T** 指南（当前上下文已加载）进行检查。寻找 AI slop 痕迹（AI 配色、渐变文字、玻璃拟态、hero metrics、卡片网格、泛化字体）以及通用设计反模式（彩底灰字、嵌套卡片、bounce easing、重复文案）。

**评分 0-4**：0=AI slop 展览馆（5+ 明显痕迹），1=AI 美学很重（3-4 个痕迹），2=存在一些痕迹（1-2 个明显点），3=总体干净（只剩细微问题），4=没有 AI 痕迹（有辨识度、带设计意图）

## 生成报告

### Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | ? | [最关键的 a11y 问题，若无则写 "--"] |
| 2 | Performance | ? | |
| 3 | Responsive Design | ? | |
| 4 | Theming | ? | |
| 5 | Anti-Patterns | ? | |
| **Total** | | **??/20** | **[Rating band]** |

**Rating bands**：18-20 Excellent（只需少量 polish），14-17 Good（修补薄弱维度），10-13 Acceptable（仍需显著工作），6-9 Poor（需要大幅重做），0-5 Critical（存在根本性问题）

### Anti-Patterns Verdict
**从这里开始。** Pass / fail：这看起来像 AI 生成的吗？把具体痕迹列出来。要足够狠。

### Executive Summary
- Audit Health Score：**??/20**（[rating band]）
- 总问题数（按严重度统计：P0 / P1 / P2 / P3）
- Top 3-5 个关键问题
- 推荐后续步骤

### Detailed Findings by Severity

给每个问题打上 **P0-P3 严重级别**：
- **P0 Blocking**：会阻止任务完成——必须立刻修
- **P1 Major**：会造成显著困难，或违反 WCAG AA——应在发布前修
- **P2 Minor**：会带来烦扰，但有绕行方式——应在下一轮修
- **P3 Polish**：锦上添花，不影响真实用户完成任务——有空再修

对每个问题，记录：
- **[P?] Issue name**
- **Location**：组件、文件、行号
- **Category**：Accessibility / Performance / Theming / Responsive / Anti-Pattern
- **Impact**：它如何影响用户
- **WCAG/Standard**：违反了哪个标准（如果适用）
- **Recommendation**：该怎么修
- **Suggested command**：建议使用哪个命令（优先从：{{available_commands}} 中选择）

### Patterns & Systemic Issues

识别那些说明“系统性缺口”而不是“一次性错误”的重复问题：
- “Hard-coded colors appear in 15+ components, should use design tokens”
- “Touch targets consistently too small (<44px) throughout mobile experience”

### Positive Findings

记录哪些地方做得好——这些是应该保留并复制的正确实践。

## Recommended Actions

按优先级列出推荐命令（先 P0，再 P1，再 P2）：

1. **[P?] `{{command_prefix}}command-name`** - 简短描述（带 audit findings 的具体上下文）
2. **[P?] `{{command_prefix}}command-name`** - 简短描述（带具体上下文）

**规则**：只能从 {{available_commands}} 中推荐。把发现映射到最合适的命令上。如果有任何修复建议，最后一项应以 `{{command_prefix}}impeccable polish` 收尾。

在摘要之后，告诉用户：

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `{{command_prefix}}impeccable audit` after fixes to see your score improve.

**IMPORTANT**：要全面，但更要可执行。太多 P3 问题只会制造噪音。重点放在真正重要的地方。

**NEVER**：
- 只报问题，不解释影响（为什么这件事重要？）
- 给泛泛的建议（必须具体、可执行）
- 省略 positive findings（做得好的地方也要明确肯定）
- 忘记排序（不可能所有问题都是 P0）
- 没验证就把 false positive 当成真实问题报出来

记住：你是技术质量审计员。系统化记录，狠抓优先级，引用明确代码位置，并给出清晰的改进路径。