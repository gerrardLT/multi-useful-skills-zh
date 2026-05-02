---
name: epic-hypothesis
description: 把 epic 表达成可验证的假设，明确目标用户、预期结果和验证方式。适用于在 roadmap、discovery 或交付规划前定义重大计划。
intent: >-
  用 if/then 结构把 epic 写成可验证的假设，明确行动或方案、目标受益人、预期结果，以及你如何验证成功。用它把产品开发中的不确定性显式化，设计轻量实验（"tiny acts of discovery"），并在正式投入开发前先建立可衡量的成功标准。
type: component
---

## 目的

用 if/then 结构把 epic 写成可验证的假设，明确行动或方案、目标受益人、预期结果，以及你如何验证成功。用它把产品开发中的不确定性显式化，设计轻量实验（"tiny acts of discovery"），并在正式投入开发前先建立可衡量的成功标准。

这不是需求规格书，而是一条要被验证的假设，不是一项已经承诺一定会交付的功能。

## 关键概念

### 史诗假设框架

这个结构受 Tim Herbig 的 Lean UX 假设格式启发：

**If/Then 假设：**
- **If we** [代表目标 persona 采取某个行动或提供某个方案]
- **for** [目标 persona]
- **Then we will** [实现某个有价值的结果或完成某项 job-to-be-done]

**轻量探索实验：**
- **我们将通过以下方式测试我们的假设：**
  - [实验 1]
  - [实验 2]
  - [按需增加]

**验证指标：**
- **如果我们在** [时间范围] **内观察到以下情况，就认为我们的假设成立：**
  - [可量化结果]
  - [可观察的定性结果]
  - [按需增加]

### 为什么这个结构有效

- **假设驱动：** 强迫你说清楚自己在相信什么，而这件事本来就可能是错的
- **结果导向：** `Then we will` 强调的是用户结果，而不是功能输出
- **实验先行：** 鼓励在正式开发前先做轻量验证
- **可证伪：** 有清晰成功标准，坏主意就能尽早止损
- **风险管理：** 把 epic 视为下注，而不是已定承诺

### 反模式（它不是什么）

- **不是功能规格：** “做一个有 5 张图表的 dashboard” 是功能，不是假设
- **不是保证上线：** 假设本来就可以，也应该被证伪
- **不是输出导向：** “Q2 上线 feature X” 没回答真正问题：它到底有没有带来结果？
- **不是跳过实验：** 如果你直接开做，不做实验，那你并没有在测试假设

### 何时使用

- 在早期探索功能方向时（正式放进 roadmap 前）
- 验证新能力是否有 product-market fit
- 做 backlog prioritization 时（被验证过的 epic 优先级更高）
- 管理 stakeholder 预期时（把工作表述为实验，而不是承诺）

### 何时不使用

- 已经高度验证过的功能，不必绕回来重写假设
- 特别小的改动，没必要过度建模
- 某些实验客观上难以做的场景（少见，但确实存在）

## 应用

完整填写结构请使用 `template.md`。

### 第 1 步：收集上下文

在起草 epic hypothesis 前，先确保你有这些上下文：
- **问题理解：** 这个 epic 在解决什么问题？参考 `skills/problem-statement/SKILL.md`
- **目标 persona：** 谁会受益？参考 `skills/proto-persona/SKILL.md`
- **Jobs-to-be-Done：** 他们真正想完成什么结果？参考 `skills/jobs-to-be-done/SKILL.md`
- **现有替代方案：** 用户现在怎么解决？竞品、手工 workaround，或者干脆什么都不做

**如果缺少上下文：** 先去做 discovery interviews 或 problem validation。

---

### 第 2 步：起草 If/Then 假设

按模板填写：

```markdown
### If/Then 假设

**If we** [代表目标 persona 采取某个行动或提供某个方案]
**for** [目标 persona]
**Then we will** [帮助该 persona 实现某个可取的结果或 job-to-be-done]
```

**质量检查：**
- **`If we` 要具体：** 不要写 “改进产品”，而应写 “当任务被分配时，添加一键 Slack 通知功能”
- **`for` 要是清晰 persona：** 不要写 “用户”，而应写 “管理 3 个以上分布式团队的远程项目经理”
- **`Then we will` 必须是结果：** 不要写 “用户将拥有通知功能”，而应写 “用户对任务分配的响应速度将提高 50%”

**示例：**
- `If we add one-click Google Calendar integration for trial users, then we will increase activation rates by 20% within 30 days`
- `If we provide bulk delete functionality for power users managing 1000+ items, then we will reduce time spent on cleanup tasks by 70%`
- `If we build a dashboard, then users will use it`（太空泛、不可衡量）

---

### 第 3 步：设计轻量探索实验

在做完整 epic 前，先设计轻量实验来验证：

```markdown
### 轻量探索实验

**我们将通过以下方式测试我们的假设：**
- [实验 1：低成本、快反馈]
- [实验 2：另一种低成本、快反馈]
- [按需增加]
```

**实验类型：**
- **原型 + 用户测试：** 用可点击原型测试 5-10 个用户
- **礼宾测试：** 先人工提供这项能力，看用户是否真在意
- **落地页测试：** 只描述功能，看注册意愿或兴趣
- **绿野仙踪测试：** 表面看似自动化，实际先手工完成
- **A/B 测试（若可行）：** 轻量版本对照测试

**质量检查：**
- **快速：** 应该以天或周计，而不是月
- **低成本：** 尽量别一上来就做完整工程实现，优先原型、人工流程或现有工具
- **可证伪：** 实验要有可能证明你是错的

**示例：**
- `Create a Figma prototype of the bulk delete flow and test with 5 power users`
- `Manually send Slack notifications to 10 trial users and track response time`
- `Add a "Request this feature" button to the UI and measure click-through rate`

---

### 第 4 步：定义验证指标

明确成功标准，以及你准备在多久内判断：

```markdown
### 验证指标

**如果我们在** [天数或周数] **内观察到以下情况，就认为我们的假设成立：**
- [具体的量化结果]
- [可观察的定性结果]
- [按需增加]
```

**质量检查：**
- **时间范围要现实：** 不要 “6 个月后看”，也不要 “3 天内看清一切”
- **量化指标要具体：** 不要写 “更多用户”，要写 “激活率提升 20%”
- **定性指标要可观察：** 不要写 “用户喜欢”，要写 “10 个用户里有 8 个说愿意付费”

**示例：**
- `Within 4 weeks, we observe:`
  - `Activation rate increases from 40% to 50%`
  - `75% of surveyed trial users say the integration saved them time`
- `Within 1 year, we observe: Revenue goes up`（太慢，也太模糊）

---

### 第 5 步：执行实验并评估

- **执行实验：** 跑原型、测试、收集数据
- **衡量结果：** 有没有达到验证指标？
- **决策点：**
  - **假设被验证：** 继续拆成 user stories，并进入 roadmap
  - **假设被证伪：** 停掉这个 epic，或换一个假设
  - **结果不确定：** 再做一轮实验，或收紧验证标准

---

### 第 6 步：转化为用户故事（若验证通过）

当假设被验证后，再把 epic 拆成 user stories：

```markdown
### Epic: [Epic 名称]

**用户故事：**
1. [用户故事 1 - 参考 `skills/user-story/SKILL.md`]
2. [用户故事 2]
3. [用户故事 3]
```

## 示例

完整示例见 `examples/sample.md`。

简版示例：

```markdown
**If we** provide one-click Google Calendar integration
**for** trial users managing multiple meetings
**Then we will** increase activation rate from 40% to 50%
```

## 常见陷阱

### 陷阱 1：假设是功能，而非结果
**症状：** “If we build a dashboard, then we will have a dashboard.”

**后果：** 你描述的是输出，不是结果，这样根本测试不了什么。

**解决：** 回到用户结果，例如：`If we build a dashboard showing real-time task status, then PMs will spend 50% less time asking for status updates.`

---

### 陷阱 2：跳过实验
**症状：** “我们验证这个假设的方式，就是先把完整功能做出来。”

**后果：** 你已经先承诺了开发，这不叫验证假设，而是直接承诺功能。

**解决：** 先设计轻量实验，如原型、礼宾测试、落地页，周期以天/周计，不要一上来就做几个月。

---

### 陷阱 3：验证指标模糊
**症状：** “如果用户开心，那就说明假设成立。”

**后果：** 成功标准主观且无法衡量。

**解决：** 写成具体可证伪指标，例如：`80% of surveyed users rate the feature 4+ out of 5` 或 `Response time drops by 50%`

---

### 陷阱 4：不切实际的时间范围
**症状：** “如果 6 个月后收入增长，就算验证成功。”

**后果：** 太慢，等你得到答案时，往往已经把功能做完了。

**解决：** 目标是 2-4 周验证周期。如果那个周期内看不到最终业务指标，就先选领先指标。

---

### 陷阱 5：将 Epic 视为承诺
**症状：** “我们已经和 CEO 说要做这个了，所以必须把它验证出来。”

**后果：** 实验就变成表演，因为不管结果如何你都会做。

**解决：** 在承诺前把 epic 定义成假设。如果 stakeholder 需要确定性，就把“做未验证功能的风险”讲清楚。

## 参考资料

### 相关技能
- `skills/problem-statement/SKILL.md`：假设应建立在已验证的问题上
- `skills/proto-persona/SKILL.md`：定义 `for [persona]` 这一段
- `skills/jobs-to-be-done/SKILL.md`：帮助明确 `then we will` 的结果
- `skills/user-story/SKILL.md`：验证通过的 epic 进一步拆成 user stories
- `skills/user-story-splitting/SKILL.md`：如何把已验证 epic 继续拆解

### 外部框架
- Tim Herbig, *Lean UX Hypothesis Statement*：if/then 假设格式来源
- Jeff Gothelf & Josh Seiden, *Lean UX* (2013)：假设驱动的产品开发
- Alberto Savoia, *Pretotype It* (2011)：用轻量实验验证想法
- Eric Ries, *The Lean Startup* (2011)：Build-Measure-Learn 循环

### Dean 的工作
- Backlog Epic Hypothesis Prompt（受 Tim Herbig 框架启发）

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/backlog-epic-hypothesis.md`

---

**技能类型：** Component
**建议文件名：** `epic-hypothesis.md`
**建议放置位置：** `/skills/components/`
**依赖：** References `skills/problem-statement/SKILL.md`, `skills/proto-persona/SKILL.md`, `skills/jobs-to-be-done/SKILL.md`
**使用者：** `skills/user-story/SKILL.md`, `skills/user-story-splitting/SKILL.md`