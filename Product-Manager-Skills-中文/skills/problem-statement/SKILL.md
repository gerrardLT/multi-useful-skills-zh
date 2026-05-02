---
name: problem-statement
description: 写出以用户为中心的问题陈述，明确是谁被卡住、他们想完成什么、为什么重要，以及他们的感受。适用于 framing discovery、prioritization 或 PRD 时。
intent: >-
  用一套以共情驱动的框架，从用户视角清楚表达问题：他们是谁、想完成什么、被什么阻碍、为什么会这样，以及这让他们有什么感受。用它在跳进方案前先对齐问题本身，并把产品工作锚定在用户结果上，而不是功能请求上。
type: component
---

## Purpose

用一套以共情驱动的框架，从用户视角清楚表达问题：他们是谁、想完成什么、被什么阻碍、为什么会这样，以及这让他们有什么感受。用它在跳进方案前先对齐问题本身，并把产品工作锚定在用户结果上，而不是功能请求上。

这不是 requirements doc，而是一段以人为中心的问题叙事。它的作用是确保你在解决一个真正值得解决的问题。

## Key Concepts

### The Problem Framing Framework

这个框架结合了 Jobs-to-be-Done 和 empathy mapping，结构如下：

**Problem Framing Narrative:**
- **I am:** [描述正在经历这个问题的人]
- **Trying to:** [这个人真正想实现的结果]
- **But:** [阻碍他们实现结果的障碍]
- **Because:** [问题背后的根因]
- **Which makes me feel:** [情绪影响]

**Context & Constraints:**
- [地理、技术、时间、人口属性等限制]

**Final Problem Statement:**
- [一句简洁、清晰、有共情的问题总结]

### Why This Structure Works

- **Persona-centric：** 强迫你从用户眼里看问题
- **Outcome-focused：** `Trying to` 关注结果，而不是动作
- **Root cause analysis：** `Because` 会逼你穿透表象
- **Emotional validation：** `Which makes me feel` 让问题更像真实人的问题
- **Contextual：** constraints 让问题贴近现实世界

### 反模式（它不是什么）

- **不是伪装成问题的解决方案：** “问题是我们没有 AI analytics”
- **不是公司问题：** “我们收入下滑了” 不是用户问题
- **不是功能请求：** “用户需要一个 dashboard” 也不是问题本身
- **不是泛泛表述：** “用户想要更好的 UX” 没法指导行动

### When to Use This

- 开始 discovery 或 problem validation 时
- 在开始解法前先对齐 stakeholder
- 向 engineering、design、execs 解释为什么这是个值得解决的问题
- 你拿到了一堆 feature requests，但还没搞清底层问题时

### When NOT to Use This

- 你还没做任何用户研究
- 你在处理内部运营问题
- 你需要的是 PRD，而不是问题 framing

## Application

完整填写结构请使用 `template.md`。

### Step 1: Gather User Context

起草前先确保你有这些输入：
- **User interviews or research：** 直接引语、行为观察、痛点
- **Jobs-to-be-Done insights：** 用户“雇佣”你的产品来完成什么
- **Persona clarity：** 到底是谁在经历这个问题
- **Constraints data：** 地理、技术、时间、群体限制

**If missing context：** 先去做 discovery interviews、contextual inquiry 或用户跟访，不要编问题。

---

### Step 2: Draft the Problem Framing Narrative

按用户第一人称来填：

```markdown
## Problem Framing Narrative

**I am:** [描述关键 persona，突出 3-4 个特征]
- [特征 / 痛点 1]
- [特征 / 痛点 2]
- [特征 / 痛点 3]

**Trying to:**
- [一句话写出这个 persona 最在乎的结果]

**But:**
- [描述阻碍结果达成的因素]
- [障碍 1]
- [障碍 2]
- [障碍 3]

**Because:**
- [带着共情描述根因]

**Which makes me feel:**
- [从 persona 视角描述情绪]
```

**Quality checks:**
- **`I am` 要具体：** 你能不能脑补出这个人？
- **`Trying to` 要写结果：** 是 outcome，不是 task
- **`But` 要有深度：** 这是真障碍，还是只是小麻烦？
- **`Because` 要诚实：** 写的是根因，还是只是表象？
- **`Makes me feel` 要真实：** 来自研究，而不是你自己脑补

---

### Step 3: Document Context & Constraints

```markdown
## Context & Constraints

- [列出地理、技术、时间或群体限制]
- [例如 "必须能在弱网甚至离线环境下工作"]
- [例如 "使用者是不熟悉复杂软件的非技术用户"]
- [例如 "决策必须在 24 小时内完成"]
```

**Quality checks:**
- **Relevance：** 这些限制是否真的会影响问题？
- **Specificity：** 是否具体到足以影响设计判断？

---

### Step 4: Craft the Final Problem Statement

把前面的内容压缩成一句话：

```markdown
## Final Problem Statement

[一句简洁、有力、带共情的问题陈述]
```

**Formula：**
`[Persona] needs a way to [desired outcome] because [root cause], which currently [emotional/practical impact].`

**Example：**
`Enterprise IT admins need a way to provision user accounts in under 5 minutes because current processes take 2+ hours with manual approvals, which causes project delays and frustrated end-users.`

**Quality checks:**
- **One sentence：** 如果得拆成多句，说明还不够清晰
- **Measurable：** 你能判断是否解决了吗？
- **Empathetic：** 读起来像真实人的问题吗？
- **Shareable：** 你在会议里说出来，stakeholders 会点头吗？

---

### Step 5: Validate and Socialize

- **Test with users：** 读给真实受此问题影响的人听，他们会不会说 “对，就是这个”
- **Share with stakeholders：** product、engineering、design、execs 是否因此对齐
- **Iterate based on feedback：** 如果有人说“这不是根问题”，继续往下挖

## Examples

完整示例见 `examples/sample.md`。

简版示例：

```markdown
**I am:** A software developer on a distributed team
**Trying to:** Communicate in real-time with my team without losing context
**But:** Email is too slow and IM is ephemeral
**Because:** No tool combines real-time chat with searchable history
**Which makes me feel:** Frustrated and disconnected
```

## Common Pitfalls

### Pitfall 1: Solution Smuggling
**Symptom:** “问题是我们没有某个具体功能。”

**Consequence:** 你在问题还没验证前，就先把方案偷渡进来了。

**Fix:** 回到用户结果本身。先问：`他们真正想完成什么？`

---

### Pitfall 2: Business Problem Disguised as User Problem
**Symptom:** “问题是 churn 太高” 或 “用户想帮我们提高收入”

**Consequence:** 这还是公司问题，不是用户问题。

**Fix:** 继续问：用户为什么流失？他们为什么不愿付更多？从他们的视角重写。

---

### Pitfall 3: Generic Personas
**Symptom:** “我是一个忙碌的专业人士，想更高效。”

**Consequence:** 太泛，几乎所有产品都能这么写。

**Fix:** 写具体场景，例如：`我是一个手工用表格管理 50+ leads 的销售，想在不漏掉高价值机会的前提下排好跟进优先级。`

---

### Pitfall 4: Symptom Instead of Root Cause
**Symptom:** “因为 UI 很混乱。”

**Consequence:** 你写的是症状，不是根因。

**Fix:** 继续问为什么。比如：`因为用户根本没有关于系统如何工作的心智模型。`

---

### Pitfall 5: Fabricated Emotions
**Symptom:** “这让我感到 empowered and delighted。”

**Consequence:** 这更像营销文案，不像真实情绪。

**Fix:** 尽量使用真实访谈语言。常见真实情绪是：`frustrated`、`overwhelmed`、`anxious`、`stuck`

## References

### Related Skills
- `skills/jobs-to-be-done/SKILL.md`
- `skills/proto-persona/SKILL.md`
- `skills/positioning-statement/SKILL.md`
- `skills/user-story/SKILL.md`

### External Frameworks
- Clayton Christensen, *Jobs to Be Done*
- Osterwalder & Pigneur, *Value Proposition Canvas*
- Dave Gray, *Empathy Mapping*

### Dean's Work
- [Link to relevant Dean Peters' Substack articles if applicable]

### Provenance
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/framing-the-problem-statement.md`

---

**Skill type:** Component
**建议文件名：** `problem-statement.md`
**建议放置位置：** `/skills/components/`
**依赖：** References `skills/jobs-to-be-done/SKILL.md`, `skills/proto-persona/SKILL.md`