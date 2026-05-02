---
name: jobs-to-be-done
description: 用结构化 JTBD 格式梳理 customer jobs、pains 和 gains。适用于澄清未满足需求、重新定位产品，或提升 discovery 与 messaging。
intent: >-
  系统性地探索客户试图完成什么（功能性、社交性、情感性任务），他们经历的痛点，以及他们寻求的收益。使用此框架来发现未满足的需求，验证产品构想，并确保你的解决方案回应的是真实的动机——而不仅仅是表面的功能需求。
type: component
---


## 目的
系统性地探索客户到底想完成什么（功能性、社交性、情感性任务），他们正在经历哪些痛点，以及他们想获得哪些收益。用这个框架发现未满足的需求、验证产品想法，并确保你的方案回应的是客户的真实动机，而不只是表层的功能诉求。
这不是问卷，而是一套结构化视角，帮助你理解客户为什么会“雇佣”你的产品，又为什么会“解雇”它。
## 关键概念

### Jobs-to-be-Done Framework
受 Clayton Christensen 和 Value Proposition Canvas（Osterwalder）影响，JTBD 将客户需求拆成三类：

**1. Customer Jobs：**
- **Functional jobs：** 客户需要完成的任务（例如 “send an invoice”）
- **Social jobs：** 客户希望被别人如何看待（例如 “look professional to clients”）
- **Emotional jobs：** 客户希望达到或避免的情绪状态（例如 “feel confident in my work”）

**2. Pains：**
- **Challenges：** 客户面临的障碍
- **Costliness：** 哪些事在时间、金钱或精力上太昂贵
- **Common mistakes：** 客户常犯、而且本可以避免的错误
- **Unresolved problems：** 现有方案没有解决的空白

**3. Gains：**
- **Expectations：** 什么会明显超出当前方案
- **Savings：** 哪些时间、金钱或精力节省会让人惊喜
- **Adoption factors：** 什么会提高迁移/切换的意愿
- **Life improvement：** 一个方案如何让生活更轻松、更愉快

### 为什么这种结构有效
- **把 job 和 solution 分开：** “communicate with my team” 是 job；“email” 是 solution
- **能挖出更底层的动机：** functional job 可能是 “track expenses”，但 emotional job 是 “feel in control of finances”
- **暴露你没看到的竞争：** 客户可能“雇佣”的是意想不到的替代品（纸笔、表格、workaround）
- **按强度排序：** 不是所有 pains 都一样重要，优先看最尖锐的
### 反模式（它不是什么）
- **不是功能愿望清单：** “我想要 AI、automation 和 dashboards” 不是 job
- **不是人口统计信息：** “Millennials want mobile-first” 是 persona 特征，不是 job
- **不是泛泛而谈：** “更高效” 太空泛，要继续深挖是哪些任务、为什么重要
- **不是单维度：** 只看 functional jobs，会漏掉 social/emotional 动机

### 何时使用
- 早期 discovery（还不知道方案之前）
- 验证 product-market fit（你的方案到底在解决哪些 job？）
- 做 roadmap 优先级（哪些 job 最痛、最重要？）
- 竞争分析（客户“雇佣”竞品是为了解决什么？）
- 营销信息设计（围绕 jobs 说话，而不是围绕 features）
### 何时不要使用
- 产品已经做完之后（对 discovery 来说太晚）
- 很小的功能 tweak（不要过度分析）
- 代替 quantitative validation（JTBD 负责形成假设，数据负责验证）

---

## 应用

完整填写结构化 `template.md`。
### 第 1 步：Define the Context
在探索 JTBD 之前，先澄清：
- **Target customer segment：** 你研究的是谁？（参考 `skills/proto-persona/SKILL.md`）
- **Situation：** 这个 job 在什么情境下出现？（例如 “When managing a project deadline...”）
- **Current solutions：** 他们今天用什么？（竞品、workarounds、什么都不做）
**如果这些背景还缺失：** 先做 customer interviews、contextual inquiries，或 “switch interviews”（为什么他们从旧方案切换过来）。
---

### 第 2 步：Explore Customer Jobs

#### Functional Jobs
问：“你想完成哪些任务？”
```markdown
### Functional Jobs:
- [Task 1 customer needs to perform]
- [Task 2 customer needs to perform]
- [Task 3 customer needs to perform]
```

**Examples：**
- “Reconcile monthly expenses for tax filing”
- “Onboard a new team member in under 2 hours”
- “Deploy code to production without downtime”
**Quality checks：**
- **以动词驱动：** Jobs 应该是动作（“send”、“analyze”、“coordinate”）
- **与 solution 无关：** 不要写 “use email to communicate”，而要写 “communicate with remote teammates”
- **足够具体：** “Manage finances” 太宽；“Track business expenses for tax deductions” 才具体
---

#### Social Jobs
问：“你希望别人如何看待你？”
```markdown
### Social Jobs:
- [Way customer wants to be perceived socially 1]
- [Way customer wants to be perceived socially 2]
- [Way customer wants to be perceived socially 3]
```

**Examples：**
- “Be seen as a strategic thinker by my exec team”
- “Appear responsive and reliable to clients”
- “Look tech-savvy to my younger colleagues”
**Quality checks：**
- **与受众绑定：** 客户想给谁留下印象？（老板、客户、同事等）
- **情绪权重高：** Social jobs 往往比 functional jobs 更驱动 adoption

---

#### Emotional Jobs
问：“你想达到或避免什么情绪状态？”
```markdown
### Emotional Jobs:
- [Emotional state customer seeks or avoids 1]
- [Emotional state customer seeks or avoids 2]
- [Emotional state customer seeks or avoids 3]
```

**Examples：**
- “Feel confident I'm not missing important details”
- “Avoid the anxiety of manual data entry errors”
- “Feel a sense of accomplishment at the end of the day”
**Quality checks：**
- **正负都要有：** 包含他们追求的（“feel in control”）和想避开的（“avoid embarrassment”）
- **必须扎根研究：** 不要编情绪，用 customer quotes 支撑

---

### 第 3 步：Identify Pains

#### Challenges
问：“有哪些障碍在阻止你完成这个 job？”
```markdown
### Challenges:
- [Obstacle customer faces 1]
- [Obstacle customer faces 2]
- [Obstacle customer faces 3]
```

**Examples：**
- “Tools don't integrate, forcing manual data entry”
- “No visibility into what teammates are working on”
- “Approval processes take 3+ days, blocking progress”
---

#### Costliness
问：“哪些事花费了太多时间、金钱或精力？”
```markdown
### Costliness:
- [What's too costly in time, money, or effort 1]
- [What's too costly in time, money, or effort 2]
```

**Examples：**
- “Generating monthly reports takes 8 hours of manual work”
- “Hiring a specialist costs $10k, which we can't afford”
- “Learning the current tool requires 20+ hours of training”
---

#### Common Mistakes
问：“你经常会犯哪些本可以避免的错误？”
```markdown
### Common Mistakes:
- [Frequent error 1]
- [Frequent error 2]
```

**Examples：**
- “Forgetting to CC stakeholders on critical emails”
- “Miscalculating tax deductions due to missing receipts”
- “Accidentally overwriting someone else's work in shared files”
---

#### Unresolved Problems
问：“现有方案没能解决哪些问题？”
```markdown
### Unresolved Problems:
- [Problem not solved by current solutions 1]
- [Problem not solved by current solutions 2]
```

**Examples：**
- “Current CRM doesn't track customer health scores”
- “Email doesn't preserve conversation context when people are added mid-thread”
- “Existing tools require technical expertise we don't have”
---

### 第 4 步：Uncover Gains

#### Expectations
问：“什么样的方案会让你爱上它？”
```markdown
### Expectations:
- [What could exceed expectations 1]
- [What could exceed expectations 2]
```

**Examples：**
- “Automatically categorizes expenses without manual tagging”
- “Suggests next steps based on project status”
- “Integrates seamlessly with tools we already use”
---

#### Savings
问：“哪些时间、金钱或精力上的节省会让你惊喜？”
```markdown
### Savings:
- [Way of saving time, money, or effort 1]
- [Way of saving time, money, or effort 2]
```

**Examples：**
- “Reduce report generation from 8 hours to 10 minutes”
- “Eliminate the need for a full-time admin”
- “Cut onboarding time from 2 weeks to 2 days”
---

#### Adoption Factors
问：“什么会让你从当前方案切换过来？”
```markdown
### Adoption Factors:
- [Factor increasing likelihood of adoption 1]
- [Factor increasing likelihood of adoption 2]
```

**Examples：**
- “Free trial with no credit card required”
- “Migration support to import existing data”
- “Testimonials from companies like ours”
---

#### Life Improvement
问：“如果这个 job 更容易完成，你的生活会变好在哪里？”
```markdown
### Life Improvement:
- [How solution makes life easier or more enjoyable 1]
- [How solution makes life easier or more enjoyable 2]
```

**Examples：**
- “I could leave work on time instead of staying late to finish reports”
- “I'd feel less stressed about missing important deadlines”
- “I could focus on strategic work instead of busywork”
---

### 第 5 步：Prioritize and Validate

- **按强度给 pains 排序：** 哪些是尖锐痛点，哪些只是轻微烦恼？
- **区分 must-have 和 nice-to-have gains：** 哪些会驱动 adoption，哪些只是加分项？
- **与 personas 交叉验证：** 不同 persona 的 jobs / pains / gains 是否不同？（参考 `skills/proto-persona/SKILL.md`）
- **用数据验证：** 用更大样本的 survey 去确认 interview 得出的 JTBD 洞察

---

## 示例

完整示例见 `examples/sample.md`。
简短示例：

```markdown
**Functional Jobs:** Coordinate tasks across a distributed team
**Pains - Challenges:** Team members use different tools, creating silos
**Gains - Savings:** Reduce status reporting time from 3 hours to 15 minutes
```

---

## 常见陷阱

### 陷阱 1：Confusing Jobs with Solutions
**症状：** “I need to use Slack” 或 “I need AI-powered analytics”
**后果：** 你已经锚定在 solution 上，而不是底层的 job。
**修正：** 连续问 5 次 “Why?”。
“I need Slack” -> “Why?” -> “To communicate with my team” -> “Why?” -> “To get quick answers” -> “Why?” -> “To avoid project delays.”
---

### 陷阱 2：Generic Jobs
**症状：** “Be more productive” 或 “Save time”
**后果：** 太空泛，无法指导产品决策。
**修正：** 继续具体化。
“Save time” -> “Reduce time spent generating monthly reports from 8 hours to 1 hour.”
---

### 陷阱 3：Ignoring Social/Emotional Jobs
**症状：** 只记录 functional jobs

**后果：** 会漏掉强驱动因素。用户很多时候是因为 emotional/social needs 才购买，而不只是因为 functional needs。
**修正：** 在访谈中显式问 perception 和 emotions。
“How would solving this make you feel?”
“Who would notice if you solved this?”
---

### 陷阱 4：Fabricating JTBD Without Research
**症状：** 靠假设把模板直接填满

**后果：** 你只是在猜。JTBD 只有建立在真实客户洞察上才有价值。
**修正：** 做 “switch interviews”、contextual inquiries 或 problem validation interviews。
---

### 陷阱 5：Treating All Pains as Equal
**症状：** 一口气列出 20 个 pains，但没有优先级

**后果：** 完全不知道该先解决哪个。
**修正：** 按强度排序（acute vs. mild）。直接问：
“If we only solved one pain, which would have the biggest impact?”
---

## 参考

### Related Skills
- `skills/proto-persona/SKILL.md` - 定义哪些人拥有这些 jobs / pains / gains
- `skills/problem-statement/SKILL.md` - JTBD 会为其中的 “Trying to” 和 “But” 提供输入
- `skills/positioning-statement/SKILL.md` - JTBD 会为其中的 “that need” 提供输入

### External Frameworks
- Clayton Christensen, *Competing Against Luck* (2016) - Jobs-to-be-Done 理论来源
- Tony Ulwick, *Outcome-Driven Innovation* (2016) - jobs 与 outcomes 的量化方法
- Alexander Osterwalder, *Value Proposition Canvas* (2014) - customer jobs / pains / gains 框架

### Dean's Work
- [Link to relevant Dean Peters' Substack articles if applicable]

### Provenance
- Adapted from `prompts/jobs-to-be-done.md` in the `https://github.com/deanpeters/product-manager-prompts` repo.

---

**Skill type:** Component
**建议文件名：** `jobs-to-be-done.md`
**建议放置位置：** `/skills/components/`
**依赖：** References `skills/proto-persona/SKILL.md`
**Used by:** `skills/positioning-statement/SKILL.md`, `skills/problem-statement/SKILL.md`, `skills/epic-hypothesis/SKILL.md`