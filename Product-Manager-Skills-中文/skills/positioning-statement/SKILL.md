---
name: positioning-statement
description: 创建 Geoffrey Moore 风格的定位陈述。适用于澄清服务对象、要解决的问题、所属品类，以及你为何区别于替代方案。
intent: >-
  创建一个 Geoffrey Moore 风格的定位陈述，清晰阐述你的产品为谁服务、解决什么需求、属于什么品类、带来什么益处，以及与替代方案有何不同。当你需要在产品战略上对齐利益相关者、指导信息传递，或检验你的价值主张是否清晰且具有防御性时，请使用此技能。
type: component
theme: strategy-positioning
best_for:
  - "首次清晰定义产品的市场定位"
  - "在信息传递中与特定竞争对手形成差异化"
  - "让你的团队在服务对象、解决的问题以及独特性上达成一致"
scenarios:
  - "我需要为一个面向中端市场 HR 团队的新 B2B SaaS 产品撰写定位陈述"
  - "我们的定位感觉很泛泛，我需要针对两个特定竞争对手来强化它"
estimated_time: "10-15 分钟"
---


## 目的
创建一个 Geoffrey Moore 风格的定位陈述，清晰阐述你的产品为谁服务、解决什么需求、属于什么品类、带来什么益处，以及与替代方案有何不同。当你需要在产品战略上对齐利益相关者、指导信息传递，或检验你的价值主张是否清晰且具有防御性时，请使用此技能。

这不是 tagline，也不是 elevator pitch，而是一个战略澄清工具，逼着你对目标用户、核心需求和差异化做出真正的取舍。

## 关键概念

### Geoffrey Moore 框架
源自《Crossing the Chasm》，Moore 的框架将定位分为两部分：

**价值主张：**
- **For** [目标客户]
- **that need** [未被满足的需求]
- [产品名称]
- **is a** [产品品类]
- **that** [益处陈述]

**差异化陈述：**
- **Unlike** [主要竞争对手或竞争性替代方案]
- [产品名称]
- **provides** [独特差异化]

### 为何此结构有效
- **强制具体化：** 你不能说“为所有人服务”或“不同于所有竞争对手”
- **暴露假设：** 如果你无法填写“Unlike X”，你可能没有可防御的差异化
- **聚焦结果，而非功能：** “That reduces churn by 40%” 优于 “that has analytics”
- **品类锚定认知：** 说“is a CRM” vs. “is a workflow tool” 会改变买家评估你的方式

### 反模式（它不是什么）
- **不是 tagline：** “定位” ≠ “Nike: Just Do It”
- **不是功能列表：** 不要说“that provides AI, automation, and integrations”
- **不是泛泛而谈：** “For businesses that need efficiency” = 定位表演
- **不是空洞的愿景：** “That revolutionizes productivity” 没有具体细节就是噪音

### 何时使用
- 定义新产品或重大转型时
- 对齐高管/创始人/PM/市场部的战略时
- 检验你的差异化是真实的还是想象的时
- 在撰写 PRD、发布计划或销售材料之前

### 何时不该使用
- 用于有固定用户的内部工具（定位是面向市场的）
- 当你仍在验证问题时（在明确问题之后再定位）
- 作为客户研究的替代品（此技能用于综合洞察，而非创造洞察）

---

## 应用

使用 `template.md` 获取完整的填写结构。

### 第 1 步：收集上下文
在起草之前，确保你拥有：
- **目标客户细分：** 人口统计、行为、角色（不仅仅是“SMBs”或“developers”）
- **未被满足的需求：** 痛点、收益、待办任务（如有需要，参考 `skills/jobs-to-be-done/SKILL.md`）
- **产品品类：** 买家在心智中如何归类你的解决方案（CRM、分析平台等）
- **竞争格局：** 直接竞争对手 **以及** 替代行为（例如，“Excel” 通常是真正的竞争对手）

**如果缺少上下文：** 使用探索性访谈、市场研究或客户访谈来填补空白。不要猜测。

---

### 第 2 步：起草价值主张

填写模板：

```markdown
## Value Proposition

**For** [具体的目标客户/用户画像]
- **that need** [未被满足的需求陈述——聚焦痛点、收益、JTBD]
- [产品或服务名称]
- **is a** [产品品类]
- **that** [益处陈述——聚焦结果，而非功能]
```

**质量检查：**
- **目标具体性：** 你能向招聘人员描述这个人吗？如果不能，请收窄范围。
- **需求清晰度：** 这个需求能引起情感共鸣吗？还是泛泛而谈（“需要效率”）？
- **品类契合度：** 这个品类是帮助你还是伤害你？（有时创建新品类是战略性的，但有风险。）
- **结果导向：** 你是在说用户 *得到* 什么，而不是产品 *拥有* 什么吗？

---

### 第 3 步：起草差异化陈述

填写模板：

```markdown
## Differentiation Statement

- **Unlike** [主要竞争对手或竞争性替代方案]
- [产品或服务名称]
- **provides** [独特差异化——结果，而非功能]
```

**质量检查：**
- **竞争对手真实性：** 这是买家考虑的 *真正* 替代方案吗？（而不仅仅是你希望他们拿来比较的对象。）
- **差异化实质：** 竞争对手能在 6 个月内复制这一点吗？如果是，那就不是持久的差异化。
- **结果框架：** 你是在说用户 *实现* 什么不同，而不仅仅是你 *做* 什么不同吗？

---

### 第 4 步：压力测试定位

问这些问题：
1. **客户会认出自己吗？** 大声读出“对于 [目标]”。感觉是具体还是泛泛？
2. **需求可防御吗？** 你能指出验证此需求的研究、访谈或数据吗？
3. **品类是帮助还是伤害？** 它是否将你锚定在正确的竞争对手上？还是限制了你？
4. **差异化可信吗？** 你能用演示、案例研究或数据证明这个主张吗？
5. **这能指导决策吗？** 如果有人问“我们应该构建功能 X 吗？”，这个定位能帮助回答吗？

如果任何答案是“否”或“有点”，请修订。

---

### 第 5 步：沟通与迭代

- **与利益相关者分享：** 创始人、高管、产品、市场、销售
- **与客户测试：** 大声读出来。他们是点头还是困惑？
- **无情地精炼：** 定位从来不是一次草稿就能完成的。删减文字，强化具体性，测试替代方案。

---

## 示例

完整的定位示例见 `examples/sample.md`。

迷你示例摘录：

```markdown
**For** software development teams
- **that need** to reduce email overload and improve real-time collaboration
- Slack
- **is a** team messaging platform
- **that** centralizes communication and makes conversations searchable
```

---

## 常见陷阱

### 陷阱 1：“为所有人服务”
**症状：** “For businesses that want to grow” 或 “For anyone who uses software”

**后果：** 没有人觉得这是 *为他们* 服务的。定位变得隐形。

**修复：** 选择你 *首先* 服务的客户细分。你可以稍后扩展，但定位在狭窄时才有效。

---

### 陷阱 2：益处陈述中的功能蔓延
**症状：** “That provides AI, automation, analytics, and integrations”

**后果：** 听起来像功能列表，而不是益处。买家会忽略。

**修复：** 以结果为导向：“That reduces churn by 30% through predictive analytics.” 功能是“如何”，而不是“为何”。

---

### 陷阱 3：想象中的竞争对手
**症状：** “Unlike outdated legacy systems” 或 “Unlike traditional approaches”

**后果：** 你在与一个稻草人定位。真正的买家不认可这个替代方案。

**修复：** 说出 *实际的* 竞争对手或替代行为。如果买家使用 Excel，就说“Unlike Excel”。如果他们使用竞争对手，就点名。

---

### 陷阱 4：没有证据的差异化
**症状：** “Provides revolutionary AI” 或 “Delivers unmatched speed”

**后果：** 没有证据的主张 = 营销空话。买家会忽略。

**修复：** 使其可证伪：“Provides 10x faster query performance than Snowflake on datasets under 1TB”（可以测试）。

---

### 陷阱 5：品类混淆
**症状：** “Is a next-generation platform for digital transformation”

**后果：** 买家不知道如何评估你。品类 = 心智货架。没有货架 = 没有销售。

**修复：** 选择一个买家已经理解的品类（CRM、分析、消息传递）**或者** 承诺创建新品类（需要大量资金和时间）。

---

## 参考

### 相关技能
- `skills/problem-statement/SKILL.md` — 定义定位所针对的问题
- `skills/jobs-to-be-done/SKILL.md` — 为“that need”陈述提供信息
- `skills/proto-persona/SKILL.md` — 定义“For [target]”细分
- `skills/press-release/SKILL.md` — 定位为新闻稿信息传递提供指导

### 外部框架
- Geoffrey Moore, *Crossing the Chasm* (1991) — 此框架的起源
- April Dunford, *Obviously Awesome* (2019) — 现代定位手册
- Al Ries & Jack Trout, *Positioning: The Battle for Your Mind* (1981) — 基础定位理论

### Dean 的作品
- [链接到相关的 Dean Peters Substack 文章（如适用）]

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/positioning-statement.md`。

---

**技能类型：** 组件
**建议文件名：** `positioning-statement.md`
**建议放置位置：** `/skills/components/`
**依赖：** 引用 `skills/problem-statement/SKILL.md`, `skills/jobs-to-be-done/SKILL.md`, `skills/proto-persona/SKILL.md`