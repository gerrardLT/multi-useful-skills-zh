---
name: customer-journey-map
description: 围绕阶段、触点、动作、情绪和指标创建客户旅程图。适用于诊断断裂体验，或让团队对完整客户流程形成一致认知。
intent: >-
  Create a comprehensive customer journey map that visualizes how customers interact with your brand across all stages—from awareness to loyalty—documenting their actions, touchpoints, emotions, KPIs, business goals, and teams involved at each stage. Use this to identify pain points, align cross-functional teams, and systematically improve the customer experience to achieve business objectives.
type: component
theme: workshops-facilitation
best_for:
  - "Mapping the full customer experience across all touchpoints"
  - "Aligning cross-functional teams on the end-to-end customer journey"
  - "Identifying pain points and opportunities by stage with measurable KPIs"
scenarios:
  - "I need to map the customer journey for our B2B SaaS onboarding experience from signup to first value"
  - "Create a journey map for a PM leader evaluating our skills repo — from discovery through loyalty"
estimated_time: "20-30 min"
---


## 目的
创建一份完整的客户旅程图，展示客户如何在各个阶段与你的品牌互动——从认知到忠诚——记录每个阶段的行为、触点、情绪、KPI、业务目标和参与团队。用它来识别痛点、对齐跨职能团队，并系统性改进客户体验以实现业务目标。
这不是用户流程图，而是一个将客户同理心和业务指标结合起来、可直接指导改进动作的战略产物。

## 关键概念

### Customer Journey Mapping Framework
这个客户旅程图框架改编自 NNGroup 和 Carnegie Mellon 的 PM 课程，通常包含：
**Horizontal structure (stages):**
- **Awareness:** 客户第一次知道你的品牌
- **Consideration:** 客户开始评估你的方案
- **Decision:** 客户做出购买决定
- **Service:** 客户购买后开始使用产品/服务
- **Loyalty:** 客户成为复购者和推荐者
**Vertical structure (for each stage):**
- **Customer Actions:** 客户做了什么？
- **Touchpoints:** 客户通过哪里/以什么方式接触你
- **Customer Experience:** 客户的情绪和想法
- **KPIs:** 用来衡量该阶段成功与否的指标
- **Business Goals:** 你在这个阶段想达成什么？
- **Teams Involved:** 哪些团队负责这个阶段

### 为什么这有效
- **以同理心驱动：** 关注客户情绪，而不只是行为
- **帮助跨职能对齐：** 明确每个阶段由哪些团队影响
- **指标导向：** 把客户体验和可衡量结果连起来
- **暴露缺口：** 更容易看到痛点和机会
- **可落地：** 有清晰 KPI 和目标，便于排列优先级
### 反模式（它不是什么）
- **不是 user story map：** 旅程图覆盖更广（所有触点，而不只是产品使用过程）
- **不是 service blueprint：** 对内部流程细节要求没那么深，更聚焦客户体验
- **不是静态文档：** 客户行为变化后，旅程图也应持续更新
### 何时使用
- 理解跨所有触点的客户体验（而不只是产品内部）
- 对齐营销、销售、产品、支持等跨职能团队
- 识别痛点并给改进项排序
- 帮助新成员快速理解客户视角
- 审视端到端客户体验
### 何时不要使用
- 不适合深入拆产品内部复杂流程（那更适合 story mapping）
- 在 persona 还没定义前不适合用（你得先知道在画谁的旅程）
- 不适合当成一次性练习（旅程图需要持续更新）

---

## 应用

完整填写结构见 `template.md`。
### 第 1 步：Prepare Prerequisites

开始绘制前，请确保具备：
1. **Key stakeholders:** Marketing、sales、product、customer service 代表
2. **Buyer personas:** 包含人口属性、心理特征、目标与挑战的完整 persona（参考 `skills/proto-persona/SKILL.md`）
3. **Defined stages:** 你的购买流程主阶段（通常是 Awareness、Consideration、Decision、Service、Loyalty）
4. **Touchpoint inventory:** 所有客户会接触你品牌的地方（网站、社交、邮件、门店、支持等）
**If missing:** 先做 discovery interviews、persona 定义，或 touchpoint audit。
---

### 第 2 步：Set Clear Objectives

明确你想通过这张图达到什么目标：

```markdown
## Objectives
- [Goal 1: e.g., "Identify top 3 pain points causing drop-off between Awareness and Consideration"]
- [Goal 2: e.g., "Align marketing and sales on customer motivations at each stage"]
- [Goal 3: e.g., "Understand emotional journey to inform messaging strategy"]
```

**Quality checks:**
- **Specific:** 不要写 “understand customers”，而要写 “找出 Consideration 阶段流失的原因”
- **Actionable:** 结果要能指导决策，而不只是做记录
---

### 第 3 步：Choose a Buyer Persona

一次只选择一个 persona（不同 persona 要分别出图）：
```markdown
## Persona
- [Persona name and brief description]
- [Example: "Manager Mike: 35-42, Director of Product at mid-sized B2B SaaS, struggles with data-driven prioritization, values time savings over feature depth"]
```

**Why one persona per map:** 不同 persona 的旅程不同，混在一张图里会让信息失真。
---

### 第 4 步：Map Each Stage

对每个阶段（Awareness、Consideration、Decision、Service、Loyalty）记录以下内容：

#### Customer Actions
客户在这个阶段做了什么：

```markdown
### Stage: [Stage Name, e.g., Awareness]

**Customer Actions:**
- [Action 1: e.g., "See LinkedIn ad about product management tools"]
- [Action 2: e.g., "Hear about tool from PM peer at conference"]
- [Action 3: e.g., "Google 'best product roadmap software'"]
```

**Quality checks:**
- **Observable:** 这是你能观察或度量的行为
- **Specific:** 不要写 “research products”，而要写 “Google 'best roadmap software' 并阅读对比文章”
---

#### Touchpoints
客户通过哪里/如何与你互动：
```markdown
**Touchpoints:**
- [Touchpoint 1: e.g., "LinkedIn Ads"]
- [Touchpoint 2: e.g., "Word-of-mouth at PM conferences"]
- [Touchpoint 3: e.g., "Google organic search results"]
- [Touchpoint 4: e.g., "Review sites (G2, Capterra)"]
```

**Quality checks:**
- **Comprehensive:** 同时覆盖数字和线下触点
- **Specific:** 不要只写 “social media”，而要具体到 “LinkedIn Ads”“Twitter mentions” 等
---

#### Customer Experience
客户在这个阶段的情绪和想法：

```markdown
**Customer Experience:**
- [Emotion 1: e.g., "Curious but skeptical - 'Is this actually better than spreadsheets?'"]
- [Emotion 2: e.g., "Overwhelmed by options - 'Too many tools, how do I choose?'"]
- [Emotion 3: e.g., "Hopeful but cautious - 'Could this save me time?'"]
```

**Quality checks:**
- **Authentic:** 尽量引用真实客户原话
- **Emotional:** 要写感受，而不只是想法
- **Specific:** 不要只写 “interested”，而要写 “好奇但怀疑，担心配置时间太长”
---

#### KPIs
这个阶段的重要指标：

```markdown
**KPIs:**
- [KPI 1: e.g., "Brand awareness (measured via surveys)"]
- [KPI 2: e.g., "LinkedIn ad impressions: 100k/month"]
- [KPI 3: e.g., "Organic search traffic: 5k visitors/month"]
- [KPI 4: e.g., "G2 review views: 2k/month"]
```

**Quality checks:**
- **Measurable:** 能否实际跟踪？
- **Stage-appropriate:** Awareness 的 KPI 不该和 Decision 一样
---

#### Business Goals
你在这个阶段想达成什么：

```markdown
**Business Goals:**
- [Goal 1: e.g., "Increase brand awareness among PMs at B2B SaaS companies"]
- [Goal 2: e.g., "Generate 500 qualified leads/month"]
- [Goal 3: e.g., "Position as top 3 roadmap tool in G2 rankings"]
```

**Quality checks:**
- **Outcome-focused:** 不要写 “run ads”，而要写 “提高认知”
- **Aligned with stage:** Awareness 阶段不要期待直接转化

---

#### Teams Involved
这个阶段由谁负责：
```markdown
**Teams Involved:**
- [Team 1: e.g., "Marketing (ad campaigns, SEO)"]
- [Team 2: e.g., "Content (blog posts, comparison guides)"]
- [Team 3: e.g., "Customer Success (case studies, testimonials)"]
```

**Quality checks:**
- **Cross-functional:** 大部分阶段都会涉及多个团队
- **Specific roles:** 不要只写 “marketing”，而要写 “marketing (ad campaigns, SEO)”
---

### 第 5 步：Visualize the Map

把信息整理成表格或可视化图：

| **Stage** | **Awareness** | **Consideration** | **Decision** | **Service** | **Loyalty** |
|-----------|---------------|-------------------|--------------|-------------|-------------|
| **Customer Actions** | See ad, hear from peers, Google search | Compare features, read reviews, request demo | Free trial signup, test with real data, evaluate ROI | Onboard team, build first roadmap, integrate with Jira | Use daily, recommend to peers, share wins on LinkedIn |
| **Touchpoints** | LinkedIn Ads, conferences, Google, review sites | Website, demo calls, sales emails | Product (free trial), onboarding emails | Product, support chat, knowledge base | Product, community forums, customer success check-ins |
| **Customer Experience** | Curious but skeptical | Excited but overwhelmed by options | Anxious about setup time, hopeful about time savings | Relieved if easy, frustrated if complex | Satisfied and confident, proud of wins |
| **KPIs** | Impressions: 100k/month, traffic: 5k/month | Demo requests: 100/month, trial signups: 50/month | Conversion rate: 20%, time-to-value: <2 hours | Activation rate: 70%, support ticket volume | Retention rate: 85%, NPS: 50, referral rate: 15% |
| **Business Goals** | Increase brand awareness, generate 500 leads/month | Improve lead quality, reduce sales cycle to 30 days | Increase trial-to-paid conversion, optimize onboarding | Reduce churn, improve activation, minimize support costs | Increase LTV, generate referrals, upsell premium features |
| **Teams Involved** | Marketing, Content | Marketing, Sales, Product | Sales, Product, Onboarding | Product, Support, Customer Success | Product, Customer Success, Marketing |

---

### 第 6 步：Analyze and Prioritize

回顾旅程图，并问：
1. **最大的 pain points 在哪里？**（找负面情绪 + 高流失率）
2. **哪个阶段的 KPI 最弱？**（优先处理表现最差的阶段）
3. **团队是否对齐？**（每个阶段对应团队是否知道自己负责什么？）
4. **有哪些机会点？**（哪里的小改动能带来大影响？）
**Prioritization criteria:**
- **Impact:** 修复后对客户体验改善有多大？
- **Feasibility:** 做起来有多难？
- **Alignment:** 是否支持业务目标？
---

### 第 7 步：Test and Refine

- **Update regularly:** 客户行为会变，至少按季度回顾一次
- **Validate with data:** 用 analytics、surveys 和客户访谈验证假设
- **Track improvements:** 做出调整后，用 KPI 看实际效果
---

## 示例

完整示例见 `examples/sample.md`。仓库自举示例见 `examples/meta-product-manager-skills.md`，它用这个仓库自身的客户旅程做 dogfooding。
简短示例：

```markdown
| **Stage** | **Awareness** | **Consideration** | **Decision** |
| **Customer Actions** | Sees LinkedIn ad | Compares on G2 | Starts free trial |
| **Customer Experience** | Curious but skeptical | Overwhelmed | Anxious about setup |
```

---

## 常见陷阱

### 陷阱 1：Generic Emotions
**Symptom:** “客户感觉很开心” 或 “客户很满意”
**Consequence:** 你不知道他们为什么会这样，也就不知道该改什么。
**Fix:** 写具体一点，例如：“庆幸配置只花了 30 分钟，而不是原本担心的 3 小时。”
---

### 陷阱 2：Missing Touchpoints
**Symptom:** 只记录数字触点（网站、app）
**Consequence:** 会漏掉线下接触（会议、口碑、支持电话）。
**Fix:** 物理、数字、人际、自动化触点都要覆盖。
---

### 陷阱 3：Internal Perspective
**Symptom:** 画的是你**希望**客户做什么，而不是他们*实际*在做什么
**Consequence:** 这张图会变成自我想象，而不是现实。
**Fix:** 用客户研究、analytics 和 support tickets 验证。
---

### 陷阱 4：No KPIs or Goals
**Symptom:** 图里有行为和情绪，但没有指标或业务目标
**Consequence:** 无法衡量成功，也无法给改进项排优先级。
**Fix:** 每个阶段都加上 KPI 和 business goals，并确保可衡量。
---

### 陷阱 5：One-and-Done Exercise
**Symptom:** 只做一次，以后再也不更新
**Consequence:** 客户行为一变，这张图就过时了。
**Fix:** 每季度回顾一次。根据新数据、产品变化和市场变化更新。
---

## 参考

### Related Skills
- `skills/proto-persona/SKILL.md` - 定义旅程图对应的 persona
- `skills/jobs-to-be-done/SKILL.md` - 帮助明确客户行为和目标
- `skills/problem-statement/SKILL.md` - 帮助定义各阶段痛点
- `skills/user-story-mapping/SKILL.md` - 互补技能（story mapping 聚焦产品使用，journey mapping 覆盖所有触点）

### External Frameworks
- NNGroup, *Customer Journey Mapping* (2016) - 基础框架
- Carnegie Mellon University, *Product Management Curriculum* - 学术化方法
- Chris Risdon & Patrick Quattlebaum, *Orchestrating Experiences* (2018) - 面向服务设计的旅程图方法

### Dean's Work
- Customer Journey Mapping Prompt Template（基于 NNGroup 和 CMU 框架改编）
### Provenance
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/customer-journey-mapping-prompt-template.md`

---

**Skill type:** Component
**建议文件名：** `customer-journey-map.md`
**建议放置位置：** `/skills/components/`
**依赖：** References `skills/proto-persona/SKILL.md`, `skills/jobs-to-be-done/SKILL.md`, `skills/problem-statement/SKILL.md`