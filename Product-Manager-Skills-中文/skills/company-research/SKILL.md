---
name: company-research
description: 生成一份公司研究简报，包含高管观点、产品战略和组织背景。适用于准备面试、竞品分析、合作评估或市场进入研究。
intent: >-
  Create a comprehensive company profile that extracts executive insights, product strategy, transformation initiatives, and organizational dynamics from publicly available sources. Use this to understand competitive landscape, evaluate partnership opportunities, benchmark best practices, prepare for interviews, or inform market entry decisions by understanding how successful companies think about product management and strategy.
type: component
---


## 目的
基于公开资料创建一份完整的公司画像，提炼高管观点、产品战略、转型举措和组织运作方式。可用于理解竞争格局、评估合作机会、对标最佳实践、准备面试，或通过理解优秀公司如何思考产品管理与战略来支持市场进入决策。
这不是表面研究，而是聚焦产品管理视角和高管愿景的战略情报收集。
## 关键概念

### 高管洞察框架
这个框架会从多个维度整合公司情报：
**核心组成部分：**
1. **公司概况：** 基本信息、发展历程、行业背景
2. **高管引述：** CEO、COO、VP Product、Group PM 的战略观点
3. **产品洞察：** 产品战略、近期发布、创新重点
4. **转型策略：** 数字化、AI、Agile 转型
5. **组织影响：** PM 如何影响战略与跨职能协作
6. **未来路线图：** 未来计划与预期挑战
7. **产品驱动增长 (PLG)：** PLG 策略与数据驱动决策
### 为什么这有效
- **高管视角：** 捕捉领导层的思考，而不仅仅是营销文案
- **以产品为中心：** 聚焦 PM 相关洞察（战略、流程、文化）
- **多来源整合：** 汇总访谈、财报电话会、博客、案例研究
- **战略情报：** 支撑竞品定位、合作评估或面试准备

### 反模式（它不是什么）
- **不是财务分析：** 重点是产品战略，不是估值或股价表现
- **不是 SWOT 分析：** 这里记录的是他们的观点，不是优劣势评估
- **不是表层抓取：** 不要只看 “About Us”，要去找高管访谈、产品博客、财报实录
### 何时使用
- 竞品分析（理解竞争对手如何做 PM）
- 合作评估（判断文化匹配度和战略方向）
- 面试准备（理解公司文化和产品理念）
- 对标最佳实践（向优秀公司学习）
- 市场进入决策（理解 incumbents 是如何运作的）
### 何时不要使用
- 不适合做内部分析（这是外部研究）
- 当找不到一手资料时不适合用（高管从未公开表达过）
- 不能替代用户研究（这是公司视角，不是客户视角）
---

## 应用

完整填写结构化模板 `template.md`。
### 第 1 步：定义研究范围

先明确你研究什么、为什么研究：

```markdown
## Research Objective
- **Company Name:** [例如 "Stripe"]
- **Research Purpose:** [例如 "为竞品定位理解支付平台产品战略"]
- **Key Questions:**
  - [Question 1: 例如 "Stripe 如何思考平台可扩展性？"]
  - [Question 2: 例如 "他们如何看待开发者体验？"]
  - [Question 3: 例如 "他们如何平衡 roadmap 与企业客户定制需求？"]
```

---

### 第 2 步：收集公司概况

记录公司的基础信息：
```markdown
### Company Overview

**Basic Information:**
- **Name:** [Official company name]
- **Headquarters:** [Location]
- **Industry:** [Primary industries, e.g., "Fintech, Payment Processing, Developer Tools"]
- **Founded:** [Year]
- **Size:** [Employees, revenue if public, funding if private]

**Brief History:**
- [Key milestones that shaped current market position]
- [Example: "2010: Founded by Patrick and John Collison. 2011: Launched 7-line integration. 2018: Launched Stripe Atlas. 2021: $95B valuation."]
```

**Sources to check:**
- 公司官网（About、Press、Blog）
- LinkedIn company page
- Crunchbase / PitchBook（融资、估值）
- Wikipedia（历史）

---

### 第 3 步：提取高管关于战略愿景的引述

寻找关键高管近年的公开表达：
```markdown
### Executive Quotes on Strategic Vision

**Quote from the CEO:**
- "[Recent quote discussing long-term vision and market approach]"
- **Source:** [Link to interview, earnings call, blog post, conference talk]
- **Date:** [When the quote was made]
- **Context:** [Brief explanation of what prompted this quote]

**Quote from the COO:**
- "[Recent quote focusing on operational strategies and challenges]"
- **Source:** [Link]
- **Date:** [When]

**Quote from the VP of Product Management:**
- "[Recent quote detailing product strategy and innovation focus]"
- **Source:** [Link]
- **Date:** [When]

**Quote from the Group Product Manager:**
- "[Recent quote discussing specific product initiatives and customer engagement]"
- **Source:** [Link]
- **Date:** [When]
```

**Sources to check:**
- 财报电话会实录（如果是上市公司）
- 播客访谈（如 Lenny's Podcast、Masters of Scale、How I Built This）
- 大会演讲（YouTube、公司博客）
- 高管博客文章
- LinkedIn posts
- 行业媒体（TechCrunch、The Verge 等）

**Quality checks:**
- **Recent：** 优先过去 12-24 个月的发言
- **Substantive：** 要找战略/理念层面的表达，而不是普通 PR 话术
- **Attributed：** 一定标注来源和日期

---

### 第 4 步：记录产品洞察

归纳产品战略和近期发布：

```markdown
### Detailed Product Insights

**Product Strategy Overview:**
- [Describe overall product strategy, emphasizing integration of market needs with technological capabilities]
- [Example: "Stripe's product strategy centers on developer experience: reduce integration complexity, provide powerful primitives, enable rapid experimentation"]

**Recent Product Launches and Innovations:**
1. **[Product/Feature 1]** - [Description and market impact]
   - [Example: "Stripe Tax (2021): Automated sales tax calculation. Removed compliance barrier for global expansion."]
2. **[Product/Feature 2]** - [Description and impact]
3. **[Product/Feature 3]** - [Description and impact]

**Product Philosophy:**
- [Key principles that guide product decisions]
- [Example: "Start with developer needs, not enterprise sales. Build for 10x scale before you need it. Default to public APIs."]
```

**Sources to check:**
- 产品博客或 changelog
- Product Hunt 发布
- Release notes
- 产品团队博客或案例研究

---

### 第 5 步：识别转型策略

记录公司如何演进：
```markdown
### Transformation Strategies and Initiatives

**Digital Transformation:**
- [Describe approach to digital transformation, emphasizing integration of cutting-edge technology with existing processes]
- [Example: "Migrated from monolith to microservices architecture (2019-2022). Enabled 10x faster feature deployment."]

**AI Transformation:**
- [Explain how AI is incorporated into core processes, product offerings, and market positioning]
- [Example: "Launched Radar for fraud detection (ML-powered). Reduced false positives by 40%, processing $640B annually."]

**Agile Transformation:**
- [Detail adoption of Agile methodologies, highlighting improvements in collaboration, project management, product delivery]
- [Example: "Adopted Shape Up methodology (6-week cycles, no sprints). Improved focus, reduced meeting overhead."]
```

**Sources to check:**
- Engineering blog
- 案例研究或 white papers
- 工程/产品负责人大会分享
- 关于流程变化的 LinkedIn posts

---

### 第 6 步：理解产品管理的组织影响

记录 PM 在这家公司内部是怎么运作的：

```markdown
### Organizational Impact of Product Management

**Role of Product Management in Strategic Decisions:**
- [Discuss how PM influences strategic decisions]
- [Example: "PMs own P&L for their product area. Directly influence company roadmap through quarterly planning process. CEO reviews roadmap with PM leads, not just VPs."]

**Cross-Functional Collaboration:**
- [Outline collaboration between PM and other departments]
- [Example: "PMs co-located with engineering (not in separate 'product' org). Weekly design reviews with Design VP. Monthly GTM sync with Sales/Marketing."]

**PM Career Paths:**
- [If available, describe how PMs grow and advance]
- [Example: "IC track: PM -> Senior PM -> Staff PM -> Principal PM. Manager track: PM -> Group PM -> Director -> VP."]
```

**Sources to check:**
- PM 招聘 JD（能看出职责、结构、团队关系）
- LinkedIn profiles（看 PM 职业路径）
- PM 博客或访谈
- Glassdoor reviews（了解内部文化）

---

### 第 7 步：分析未来路线图与挑战

判断公司未来要往哪里走：

```markdown
### Future Product Roadmap and Challenges

**Upcoming Product Initiatives:**
- [Detail planned initiatives and alignment with strategic goals]
- [Example: "Expanding into embedded finance (Stripe Capital, Stripe Treasury). Goal: Become financial infrastructure for the internet, not just payments."]

**Anticipated Market Challenges:**
- [Identify potential challenges and PM team plans to address them]
- [Example: "Challenge: Increasing competition from Square, PayPal. Response: Double down on developer experience, global expansion (70+ countries)."]

**Competitive Threats:**
- [Document acknowledged or observed competitive pressures]
```

**Sources to check:**
- 财报电话会（前瞻表述）
- Analyst reports
- 行业新闻（竞品融资、市场变化）

---

### 第 8 步：记录产品驱动增长洞察

如果适用，补充 PLG 相关内容：
```markdown
### Product-Led Growth Insights

**Implementation of PLG Strategies:**
- [Describe how the company employs PLG to enhance customer acquisition, retention, expansion]
- [Example: "Self-serve onboarding: 7-line code integration. No sales calls required for <$1M ARR. 90% of customers start with free tier."]

**Data-Driven Product Decisions:**
- [Explain role of data analytics in shaping product decisions and driving growth]
- [Example: "Instrumented every API call. PMs have real-time dashboards. Feature adoption tracked within 24 hours of launch."]
```

**Sources to check:**
- 产品分析博客
- 增长团队博客
- 激活、留存、扩张相关案例研究

---

### 第 9 步：综合关键要点

总结最重要的洞察：

```markdown
### Key Takeaways

**Strategic Principles:**
1. **[Principle 1]** - [What you learned about their approach]
2. **[Principle 2]** - [What you learned]
3. **[Principle 3]** - [What you learned]

**Product Management Lessons:**
1. **[Lesson 1]** - [Applicable insight for your context]
2. **[Lesson 2]** - [Applicable insight]
3. **[Lesson 3]** - [Applicable insight]

**Questions for Further Research:**
- [Unanswered question 1]
- [Unanswered question 2]
```

---

## 示例

完整示例见 `examples/sample.md`。
简短示例：

```markdown
**Company Name:** Stripe
**Research Purpose:** Understand payment platform product strategy
**Key Questions:** Developer experience? Platform extensibility?
```

## 常见陷阱

### 陷阱 1：表面研究
**症状：** “Stripe 是一家支付公司，他们做支付。”
**后果：** 没有任何战略洞察。
**修复：** 继续往下挖，去找高管访谈、工程博客、产品理念文章。
---

### 陷阱 2：无来源引用
**症状：** “CEO 说公司聚焦创新”
**后果：** 无法验证，可信度很低。
**修复：** 一定带上来源和日期，例如： “CEO said X (Source: Lenny's Podcast, Episode 185, Sept 2023).”
---

### 陷阱 3：混淆观点与事实
**症状：** “Stripe 的产品战略很好，因为他们很重视开发者”
**后果：** 这是分析，不是研究。
**修复：** 记录他们**做了什么**，而不是评价这件事“好不好”。分析放到 `Key Takeaways`。
---

### 陷阱 4：信息过时
**症状：** 使用 5 年前的引述或战略

**后果：** 洞察失效，因为公司战略会变化。
**修复：** 优先使用最近 12-24 个月的资料。
---

### 陷阱 5：忽视负面信号
**症状：** 只写成功，不写挑战和失败

**后果：** 画像不完整。
**修复：** 把 `Anticipated Market Challenges` 和竞争威胁也写进去。
---

## 参考

### Related Skills
- `skills/positioning-statement/SKILL.md` - 用公司研究理解竞争定位
- `skills/pestel-analysis/SKILL.md` - 公司研究可补充市场环境判断
- `skills/proto-persona/SKILL.md` - 高管引述可能暴露目标 persona

### External Frameworks
- Competitive intelligence frameworks
- Strategic analysis methodologies

### Dean's Work
- Executive Insights Company Profile Template

### Provenance
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/company-profile-executive-insights-research.md`

---

**Skill type:** Component
**建议文件名：** `company-research.md`
**建议放置位置：** `/skills/components/`
**依赖：** References `skills/positioning-statement/SKILL.md`, `skills/pestel-analysis/SKILL.md`