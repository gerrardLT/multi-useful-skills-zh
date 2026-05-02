> **还需要额外上下文**：你希望用户抵达的 “aha moment” 是什么，以及他们的经验水平如何。

创建或改进 onboarding 体验，帮助用户尽快理解、采纳并成功使用产品。

## 评估新手引导需求

先弄清楚：用户需要学会什么，以及为什么需要学。

1. **识别挑战**：
   - 用户试图完成什么？
   - 当前体验中，什么地方令人困惑或不清楚？
   - 用户通常卡在哪，或在哪流失？
   - 我们希望用户尽快抵达的 “aha moment” 是什么？

2. **理解用户**：
   - 他们的经验水平如何？（初学者、熟练用户、还是混合）
   - 他们的动机是什么？（主动探索？被工作要求使用？）
   - 他们愿意投入多长时间？（5 分钟？30 分钟？）
   - 他们知道哪些替代品？（从竞品迁移过来？还是第一次接触这个品类？）

3. **定义成功**：
   - 用户至少要学会什么，才算能成功？
   - 我们最希望他们完成的关键动作是什么？（建第一个项目？发出第一个邀请？）
   - 我们如何判断 onboarding 成功了？（完成率？达成价值所需时间？）

**CRITICAL**：新手引导的目标是让用户尽快到达价值，不是把所有东西都教完。

## 新手引导原则

遵循这些核心原则：

### 直接展示，不要空讲
- 用可运行的例子演示，而不是只靠描述
- 在 onboarding 里提供真实功能，而不是单独做一套 tutorial mode
- 使用 progressive disclosure，一次只教一件事

### 尽量允许跳过
- 让有经验的用户可以跳过 onboarding
- 不要用 onboarding 阻断用户进入产品
- 提供 “Skip” 或 “I'll explore on my own” 一类选项

### 尽快触达价值
- 尽快把用户带到他们的 “aha moment”
- 把最重要的概念前置
- 先教能贡献 80% 价值的那 20%
- 高级功能留给后续上下文化发现

### 上下文优先于仪式感
- 在用户需要时再教功能，而不是一上来全部讲完
- Empty states 本身就是 onboarding 机会
- 在实际使用点位上放 tooltips 和 hints

### 尊重用户的理解力
- 不要居高临下，不要过度解释
- 表达清晰且简洁
- 默认用户能理解标准交互模式

## 设计新手引导体验

根据场景选择合适的 onboarding 方式：

### 初始产品引导

**Welcome Screen**：
- 清楚的价值主张（这个产品是什么？）
- 用户将学到 / 完成什么
- 时间预估（如实说明投入）
- 可跳过选项（给有经验用户）

**Account Setup**：
- 只收集必要信息（其他信息以后再收）
- 解释为什么要问每一项
- 在可能时提供 smart defaults
- 在适合时支持社交登录

**Core Concept Introduction**：
- 只介绍 1-3 个核心概念（不要全讲）
- 用简单语言和例子
- 尽量交互式，而不是让人只读
- 提供进度指示（如 step 1 of 3）

**First Success**：
- 引导用户完成一件真实的事情
- 提供预填示例或模板
- 完成后适度庆祝（但不要太过）
- 给出明确下一步

### 功能发现与采用

**Empty States**：
不要只是留空白，而应展示：
- 这里以后会出现什么（描述 + 截图 / 插画）
- 为什么它有价值
- 明确 CTA 去创建第一个内容
- 提供示例或模板选项

示例：
```text
No projects yet
Projects help you organize your work and collaborate with your team.
[Create your first project] or [Start from template]
```

**Contextual Tooltips**：
- 在真正相关的时刻出现（第一次看到某功能时）
- 直接指向对应 UI 元素
- 简短解释 + 好处
- 可关闭（最好带 “Don't show again”）
- 在需要时带一个 “Learn more” 链接

**Feature Announcements**：
- 新功能上线时高亮通知
- 告诉用户“新了什么”和“为什么重要”
- 允许用户立刻试用
- 可关闭

**渐进式引导**：
- 在用户实际遇到功能时再教
- 对新功能 / 未用过功能加 badges 或 indicators
- 逐步解锁复杂度（不要一下把所有选项全放出来）

### 引导式导览与演练

**适合什么情况**：
- 界面复杂，功能很多
- 现有产品发生了重大变化
- 行业工具，需要用户具备一定领域理解

**如何设计**：
- 聚光灯式突出具体 UI 元素（让页面其他区域变暗）
- 步骤尽量短（每次 tour 最多 3-7 步）
- 允许用户自由点击推进 tour
- 提供 “Skip tour”
- 能从帮助菜单重新播放

**最佳实践**：
- 交互胜于被动说明（让用户点真实按钮，而不是只看说明）
- 聚焦工作流，而不是聚焦功能名称（讲 “Create a project”，不要讲 “This is the project button”）
- 提供 sample data，保证示例动作真的能执行

### 交互式教程

**适合什么情况**：
- 用户需要动手练一遍
- 概念复杂或不熟悉
- 风险高（需要先在安全环境练习）

**如何设计**：
- 提供带 sample data 的 sandbox 环境
- 给出清晰目标（如 “Create a chart showing sales by region”）
- 分步指导
- 提供验证机制（确认用户是否做对）
- 设计一个 graduation moment（你已经准备好了）

### 文档与帮助

**产品内帮助**：
- 在界面各处放上下文相关 help links
- 提供 keyboard shortcuts reference
- 提供可搜索的 help center
- 对复杂工作流提供 video tutorials

**帮助模式**：
- 在复杂功能旁边放 `?` 图标
- 在 tooltips 中放 “Learn more” 链接
- 在界面上直接提示快捷键（如搜索框旁显示 `⌘K`）

## 空状态设计

每个 empty state 都需要包含：

### 这里将会出现什么
“Your recent projects will appear here”

### 它为什么重要
“Projects help you organize your work and collaborate with your team”

### 如何开始
[Create project] 或 [Import from template]

### 视觉兴趣点
插画或图标（而不是在大块空白上只扔一段文字）

### 上下文化帮助
“Need help getting started? [Watch 2-min tutorial]”

**Empty state 类型**：
- **First use**：从未使用过这个功能（强调价值，提供模板）
- **User cleared**：用户主动删空了所有内容（处理轻一点，方便重建）
- **No results**：搜索 / 筛选后没有结果（建议换查询词、清除筛选）
- **No permissions**：没有权限访问（解释原因，并说明如何获得权限）
- **Error state**：加载失败（解释发生了什么，并提供重试）

## 实现模式

### 技术方案：

**Tooltip libraries**：Tippy.js、Popper.js  
**Tour libraries**：Intro.js、Shepherd.js、React Joyride  
**Modal patterns**：Focus trap、backdrop、ESC 关闭  
**Progress tracking**：使用 LocalStorage 记录 “seen” 状态  
**Analytics**：跟踪 completion、drop-off points

**存储模式**：
```javascript
// Track which onboarding steps user has seen
localStorage.setItem('onboarding-completed', 'true');
localStorage.setItem('feature-tooltip-seen-reports', 'true');
```

**IMPORTANT**：不要让用户重复看到同一套 onboarding（非常烦人）。一定要记录 completion，并尊重 dismiss。

**NEVER**：
- 不要强迫用户在开始使用产品前走完一长串 onboarding
- 不要用显而易见的解释去“教训”用户
- 不要反复显示同一个 tooltip（要尊重关闭行为）
- 不要在 tour 过程中把整个 UI 全锁死（允许用户探索）
- 不要创建一套与真实产品断开的 tutorial mode
- 不要一开始就把信息全部塞给用户（progressive disclosure!）
- 不要把 “Skip” 藏起来，或让它难以发现
- 不要忘记 returning users（不要再次给他们看初始 onboarding）

## 验证新手引导质量

用真实用户验证：

- **Time to completion**：用户能否快速完成 onboarding？
- **Comprehension**：完成之后，他们真的理解了吗？
- **Action**：他们是否完成了我们期望的下一步动作？
- **Skip rate**：是不是太多人直接跳过？（那可能说明它太长，或没价值）
- **Completion rate**：用户是否愿意走完？（如果太低，就简化）
- **Time to value**：用户要多久才能拿到第一次价值？

记住：你是一个很会教人的产品教育者。目标是尽快把用户带到 “aha moment”。只教关键内容，把教学放进上下文里，同时尊重用户的时间和智力。
