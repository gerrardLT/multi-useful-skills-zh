---
name: discovery-interview-prep
description: 用正确的目标、细分、约束与方法来规划客户发现访谈。适用于为问题验证、流失研究或新产品想法做访谈准备时。
intent: >-
  通过围绕研究目标、客户细分、现实约束和访谈方法做自适应提问，帮助产品经理准备客户发现访谈。用它设计更有效的访谈计划、提炼更精准的问题、避免常见偏差，并在客户访问机会有限时尽量提高学习产出，确保 discovery interviews 得到的是可执行洞察，而不是确认偏差或表层反馈。
type: interactive
theme: discovery-research
best_for:
  - "设计一份客户发现访谈计划"
  - "根据目标和约束选对访谈方法"
  - "在客户访问机会有限时仍做好研究准备"
scenarios:
  - "我需要访谈 5 个 enterprise 客户，了解他们最近 90 天内流失的原因"
  - "我想在 2 周内用冷启动外联验证一个新产品点子"
  - "我想搞清楚为什么用户没在核心功能上完成激活"
estimated_time: "15-20 min"
---

## Purpose

通过围绕研究目标、客户细分、现实约束和访谈方法做自适应提问，帮助产品经理准备客户发现访谈。用它设计更有效的访谈计划、提炼更精准的问题、避免常见偏差，并在客户访问机会有限时尽量提高学习产出。

这不是脚本生成器，而是一套偏策略性的准备流程。输出结果是一份适配场景的访谈计划，包含方法、问题框架和成功标准。

## Key Concepts

### The Discovery Interview Prep Flow

这是一个交互式准备流程，会依次完成：
1. 收集产品 / 问题上下文
2. 明确研究目标
3. 确定目标客户细分与访问限制
4. 推荐合适的方法（JTBD、problem validation、switch interviews 等）
5. 生成访谈框架，包括问题、应避免的偏差和成功标准

### Why This Works

- **Goal-driven：** 访谈方式与研究目标对齐
- **Adaptive：** 会根据产品阶段和访问条件调整方法
- **Bias-aware：** 主动暴露 leading questions、confirmation bias、solution-first thinking
- **Actionable：** 产出能直接拿去用的访谈方案

### 反模式（它不是什么）

- **不是可用性测试脚本：** discovery 是找问题，不是测方案
- **不是销售演示：** 核心是听，不是讲
- **不是大规模问卷：** 重点是 5-10 个深度访谈，而不是 100+ 份 survey

### When to Use This

- 刚开始做 product discovery
- 重新理解既有产品的新市场
- 研究 churn / drop-off
- 在做功能前先验证问题
- 做 customer development sprint 前

### When NOT to Use This

- 你是在测 prototype usability
- 你要做的是大规模定量研究
- 你已经很清楚问题，只差验证方案

---

### Facilitation Source of Truth

默认交互协议使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md)。

本文件定义的是 discovery 访谈的领域逻辑。如有冲突，以本文件为准。

## Application

这个交互式技能会提出 **最多 4 个自适应问题**，并在每一步提供 **3-4 个编号选项**。

---

### 第 0 步：收集上下文（提问前）

**Agent suggests:**

“在我们设计访谈计划前，先把上下文补齐：

**如果你研究的是自己的产品：**
- 问题假设或产品概念
- 目标客户细分
- 已有研究（support tickets、churn data、user feedback）
- 产品官网或定位材料
- 你最想验证的核心假设

**如果你在研究既有问题：**
- 客户投诉、工单、流失原因
- 你对客户为什么离开或卡住的猜测
- 客户会转去什么替代方案

**如果你在探索一个新问题空间：**
- 找相似产品或相邻解决方案
- 收集 competitor materials、G2/Capterra 评论、社区讨论

你可以直接贴这些内容，也可以先给一个简述。” 

---

### Question 1: Research Goal

**Agent asks:**
“这轮 discovery interviews 的主要目标是什么？你最想学到什么？”

1. **Problem validation**：确认这个问题是否真实存在，并且痛到值得解决
2. **Jobs-to-be-Done discovery**：理解客户想完成什么，以及现有方案为什么失败
3. **Retention/churn investigation**：搞清楚客户为什么离开，或为什么没激活
4. **Feature prioritization**：确认哪些问题 / 功能对客户最重要

**或者直接描述你要回答的具体问题。**

---

### Question 2: Target Customer Segment

**Agent asks:**
“你准备访谈谁？尽量具体。”

可根据 Q1 自适应给选项。比如若 Q1 是 `Problem validation`：

1. **经常遇到这个问题的人**
2. **已经尝试过解决它的人**
3. **属于目标细分，但未必意识到这个问题的人**
4. **最近刚经历过这个问题的人**

**或者直接描述：角色、公司规模、行为特征、背景。**

---

### Question 3: Constraints

**Agent asks:**
“这轮访谈有哪些现实约束？”

1. **Limited access**：只能访 5-10 人，且 2 周内要出结果
2. **Existing customer base**：已有客户池，招募容易
3. **Cold outreach required**：没有现成客户，只能从 LinkedIn、广告或社区招募
4. **Internal stakeholders only**：目前只能先访 sales / support 这种代理视角

**或者直接描述预算、时间、访问权限、团队容量。**

---

### Question 4: Interview Methodology

**Agent asks:**
“基于你的目标、目标客户和约束，下面是推荐的方法：”

以 `Problem validation + Limited access` 为例：

1. **Problem validation interviews (Mom Test style)**：围绕过去行为提问，不问假设
2. **Jobs-to-be-Done interviews**：理解客户真正想完成什么，以及他们为何切换
3. **Switch interviews**：访谈最近从竞品切换过来或切走的人
4. **Timeline / journey mapping interviews**：按时间线把完整经历走一遍

用户可选一个、组合多个，或自己指定方法。

---

### Output: Generate Interview Plan

收集完回答后，Agent 生成：

```markdown
# Discovery Interview Plan

**Research Goal:** [Q1]
**Target Segment:** [Q2]
**Constraints:** [Q3]
**Methodology:** [Q4]

## Interview Framework

### Opening (5 minutes)
- 自我介绍，明确这不是销售电话
- 说明本次想理解的是对方的真实经历
- 征得记录 / 录音同意

### Core Questions (30-40 minutes)

1. [问题 1]
   - Follow-up: [...]
   - Avoid: [...]

2. [问题 2]
   - Follow-up: [...]
   - Avoid: [...]

3. [问题 3]
   - Follow-up: [...]
   - Avoid: [...]

4. [问题 4]
   - Follow-up: [...]
   - Avoid: [...]

5. [问题 5]
   - Follow-up: [...]
   - Avoid: [...]

### Closing (5 minutes)
- 复述你听到的关键点
- 问是否能引荐其他受访者
- 感谢对方

## Biases to Avoid

1. Confirmation bias
2. Leading questions
3. Hypothetical questions
4. 把 research 变成 pitch
5. 过多 yes/no questions

## Success Criteria

- 听到的是具体故事，不是泛泛抱怨
- 拿到的是过去行为，不是假想愿望
- 至少 3 次以上独立重复出现同类模式
- 你被某些答案真正“惊到”
- 你能直接引用客户原话

## Interview Logistics

- 招募渠道建议
- 每场 45-60 分钟
- 每天最多 2-3 场
- 每场后立刻写摘要
- 5 场后开始找模式
```

---

## Examples

### Example 1: Good Discovery Interview Prep

**Context:** 用户假设：`Freelancers waste time chasing late payments manually.`

**Q1:** Problem validation  
**Q2:** 经常被拖款的 freelancer  
**Q3:** Cold outreach required  
**Q4:** Problem validation interviews (Mom Test style)

**Generated Plan:** 输出 5 个 Mom Test 风格问题、要避免的偏差，以及明确成功标准。

**Why this works:**
- 目标清晰
- 受访者足够具体
- 方法与目标匹配
- 问题围绕过去行为
- 成功标准可判断

## Common Pitfalls

### Pitfall 1: Asking What Customers Want
**Symptom:** “你希望我们做什么功能？”

**Consequence:** 你拿到的是 feature requests，不是问题本身。

**Fix:** 问过去行为：`Tell me about the last time you struggled with X.`

---

### Pitfall 2: Pitching Instead of Listening
**Symptom:** 花 20 分钟解释你的想法

**Consequence:** 对方会出于礼貌给你好听反馈。

**Fix:** 在最后 5 分钟前，尽量别讲你的方案。

---

### Pitfall 3: Interviewing the Wrong People
**Symptom:** 去访朋友、同事、或根本没痛点的人

**Consequence:** 反馈礼貌但没价值。

**Fix:** 去访那些经常、最近、真实遭遇该问题的人。

---

### Pitfall 4: Stopping at 1-2 Interviews
**Symptom:** 访 2 个人就准备开做

**Consequence:** 很容易落入 confirmation bias。

**Fix:** 至少访 5-10 人，看模式，不看单点。

---

### Pitfall 5: Not Recording Insights
**Symptom:** 全靠记忆

**Consequence:** 容易漏细节、记错原话、看不出模式。

**Fix:** 征得同意后录音，或至少做详尽笔记；访谈结束后立即整理。

## References

### Related Skills
- `problem-statement.md`
- `proto-persona.md`
- `jobs-to-be-done.md`

### External Frameworks
- Rob Fitzpatrick, *The Mom Test*
- Clayton Christensen, *Jobs to Be Done*
- Teresa Torres, *Continuous Discovery Habits*

### Dean's Work
- Problem Framing Canvas

---

**Skill type:** Interactive
**建议文件名：** `discovery-interview-prep.md`
**建议放置位置：** `/skills/interactive/`
**依赖：** Uses `problem-statement.md`, `proto-persona.md`, `jobs-to-be-done.md`