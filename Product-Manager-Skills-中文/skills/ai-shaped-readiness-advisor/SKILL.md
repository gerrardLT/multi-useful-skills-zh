---
name: ai-shaped-readiness-advisor
description: 评估你的产品工作到底只是 AI-first，还是已经进入 AI-shaped。适用于评估 AI 成熟度，并决定团队下一步该建设什么能力。
intent: >-
  评估你的产品工作是 **"AI-first"**（使用 AI 更快地自动化现有任务）还是 **"AI-shaped"**（围绕 AI 能力从根本上重新设计产品团队的工作方式）。用它来评估你在 **2026 年产品经理必备的 5 项核心能力** 上的准备程度，识别差距，并获得关于下一步应优先建设哪项能力的具体建议。
type: interactive
theme: ai-agents
best_for:
  - "评估你的团队是 AI-first 还是真正的 AI-shaped"
  - "确定接下来应建设 5 项 AI 能力中的哪一项"
  - "诚实地了解你的产品组织的 AI 成熟度"
scenarios:
  - "我的团队在使用 AI 工具，但我不确定我们是在以不同方式工作，还是仅仅在自动化相同的任务"
  - "我想评估我的产品组织的 AI 成熟度，并确定下个季度应优先投资何处"
estimated_time: "15-20 min"
---

## 目的

评估你的产品工作究竟是 **"AI-first"**（用 AI 更快地自动化现有任务），还是 **"AI-shaped"**（围绕 AI 能力从根本上重构产品团队的工作方式）。用它来判断你在 **2026 年 PM 必备的 5 项核心能力** 上的准备度，识别缺口，并获得关于“下一项最该先建设的能力”的具体建议。
**关键区别：** AI-first 只是“小聪明”（比如用 Copilot 更快写 PRD）。AI-shaped 才是生存能力（建立人和 AI 都信任的 durable reality layer、编排 AI workflow、压缩学习周期）。
这不是关于 AI 工具，而是关于**围绕 AI 作为 co-intelligence 对组织进行重构**。这个交互式 skill 会带你做成熟度评估，然后给出下一步建议。

## 关键概念

### AI-First vs. AI-Shaped

| 维度 | AI-First (小聪明) | AI-Shaped (生存能力) |
|-----------|-----------------|----------------------|
| **心态** | 自动化现有任务 | 重构工作的完成方式 |
| **目标** | 加快产品生成 | 压缩学习周期 |
| **AI 角色** | 任务助手 | 战略级 co-intelligence |
| **优势** | 暂时性的效率提升 | 可防御的竞争护城河 |
| **示例** | "Copilot 写 PRD 快 2 倍" | "AI agent 在 48 小时内验证假设，而不是 3 周" |

**核心洞察：** 如果竞争对手只需多堆一点人力，就能复制你的 AI 用法，那它就不是差异化，而只是效率提升。而效率通常几个月内就会变成基本盘。

---

### 5 项核心 PM 能力 (2026)

下面这 5 项能力定义了什么叫 AI-shaped 的产品工作。你会逐项评估自己的成熟度。

#### 1. **上下文设计**
构建一个人和 AI 都能信任的 durable **"reality layer"**，把 AI 的注意力当成稀缺资源来设计和分配。
**包含内容：**
- 记录什么是真实的，什么是假设 - 不可变约束（技术、监管、战略）
- 操作术语表（共享定义）
- 证据标准（什么算验证）- **上下文边界**（什么该持久化，什么该按需检索）
- **记忆架构**（短期会话记忆 + 长期持久记忆）- **检索策略**（语义检索、上下文检索）

**关键原则：** *"如果你无法指出证据、约束和定义，你就没有上下文。你只有感觉。"*

**关键区别：上下文堆砌 vs. 上下文工程**
- **上下文堆砌 (AI-first):** 无意图地往里塞大量内容（“把整份 PRD 都贴进去”）
- **上下文工程 (AI-shaped):** 为注意力而设计结构（边界清晰、按意图检索）

**5 个诊断问题：**
1. 这段上下文支撑的是哪个具体决策？
2. 这件事能用检索代替持久化吗？
3. 谁拥有这个上下文边界？
4. 如果把它排除掉，会坏什么事？
5. 我们是在修结构，还是在逃避结构？

**AI-first 版本：** 把 PRD 直接粘到 ChatGPT；没有上下文边界；默认“越多越好”。
**AI-shaped 版本：** 用 CLAUDE.md、证据数据库、约束注册表供 AI agents 自动引用；采用双层记忆架构；通过 Research -> Plan -> Reset -> Implement 循环防止上下文腐化。

**深入探讨：** 详见 [`context-engineering-advisor`](../context-engineering-advisor/SKILL.md)，里面专门讲如何诊断上下文堆砌，以及如何实现记忆架构。

---

#### 2. **Agent 编排**
把 AI 用成可重复、可追踪的 workflow，而不是一次性 prompt。
**包含内容：**
- 定义清晰的 workflow 循环：research -> synthesis -> critique -> decision -> log rationale
- 每一步都能“展示其工作”（可追踪推理）
- workflow 稳定运行（相同输入 = 可预期流程）
- prompts 和 agents 做版本管理

**关键原则：** 一次性 prompt 是战术；编排好的 workflow 才是战略。
**AI-first 版本：** “让 ChatGPT 帮我分析一下这些用户反馈”。
**AI-shaped 版本：** 一个自动化 workflow，能吃进反馈、标注主题、生成假设、发现矛盾并记录决策。

---

#### 3. **成果加速**
用 AI 压缩的是**学习周期**，而不只是加快任务完成速度。
**包含内容：**
- 消除验证滞后（PoL 几天内跑完，而不是几周）
- 减少审批延迟（AI 先按约束预校验）
- 降低会议开销（用异步 AI synthesis 替代状态会议）

**关键原则：** 少做，但做得更有目的。AI 的作用是移除瓶颈，而不是制造更多工作。
**AI-first 版本：** “AI 写 user stories 更快了”。
**AI-shaped 版本：** “AI overnight 跑完可行性检查，省掉了 2 周 technical discovery”。

---

#### 4. **团队-AI 协同**
重构团队系统，让 AI 作为 **co-intelligence** 运作，而不是当成甩锅工具。
**包含内容：**
- 审查规范（谁来检查 AI 输出、什么时候查、怎么查）
- 证据标准（AI 必须给出来源，不能胡编）
- 决策权限（AI 负责建议，人负责决策，边界清晰）
- 心理安全（团队可以质疑 AI，而不觉得自己“很笨”）

**关键原则：** AI 放大判断力，而不是替代责任。
**AI-first 版本：** 把“我用了 AI”当成劣质输出的借口。
**AI-shaped 版本：** 有明确 review protocol，AI 输出默认只是草稿，必须经人类验证。

---

#### 5. **战略差异化**
超越效率本身，创造**可防御的竞争优势**。
**包含内容：**
- 新的客户能力（用户现在能做哪些以前做不到的事？）
- Workflow 重连（竞争对手不彻底重构流程就复制不了）
- 经济学竞争对手无法匹配（通过 AI 获得 10x 级成本优势）

**关键原则：** *"如果竞争对手可以通过堆人力来复制它，那它就不是差异化。"*

**AI-first 版本：** “我们用 AI 把文档写得更好”。
**AI-shaped 版本：** “我们能在 2 天内验证产品假设，而行业通常要 3 周，因此每个季度能交付 6 倍经过验证的功能”。

---

### 反模式（它不是什么）

- **不是讨论 AI 工具：** 用 Claude 还是 ChatGPT 不重要，重要的是 workflow 有没有被重构
- **不只是谈速度：** 如果 PRD 本来就不是瓶颈，那 PRD 写快 2 倍不具备战略意义
- **不是自动化一切：** 自动化坏流程，只会把坏流程放大
- **不是替代人：** AI-shaped 组织强化人的判断，不是消灭人的判断

---

### 何时使用这个 Skill

**适用于：**
- 你已经在用 AI 工具，但没有看到战略层面的优势
- 你怀疑自己只是“AI-first”（效率），但希望走向“AI-shaped”（转型）
- 你需要判断下一项最该建设的 AI 能力
- 领导问你“我们到底是怎么用 AI 的？”而你发现自己答不出战略性回答
- 你想评估团队是否准备好进入 AI-powered 的产品工作方式

**不适用于：**
- 你还完全没开始用 AI（先把基础工具用起来）
- 你只是想找工具推荐（这里讲的是组织设计，不是 tooling）
- 你想要具体的“怎么写 prompt”指南（那用别的 skill）

---

### 交互唯一准绳

使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为这个 skill 的默认交互协议。
它定义了：
- session heads-up + entry mode (Guided, Context dump, Best guess)
- one-question turns with plain-language prompts
- progress labels (for example, Context Qx/8 and Scoring Qx/5)
- interruption handling and pause/resume behavior
- numbered recommendations at decision points
- quick-select numbered response options for regular questions (include `Other (specify)` when useful)

这个文件定义的是领域内的评估内容。如有冲突，以本文件的领域逻辑为准。

## 应用

这个交互式 skill 会通过**自适应提问**来评估你在 5 项能力上的成熟度，然后建议下一步优先级。

### 交互协议（必需）

1. 每轮只问**一个问题**。
2. 等用户回答后，再问下一题。
3. 用自然语言提问（不要用缩写标签直接当主题）。必要时可给示例回答格式。
4. 每轮都展示进度，用用户能理解的标签：
   - `Context Qx/8` 用于背景收集
   - `Scoring Qx/5` 用于成熟度打分
   - 合适时说明还剩几题
5. 除非用户主动要内部结构，否则不要在对用户的问题里用 `Step 0` 这类内部阶段标签。
6. 成熟度打分题先给精简的 1-4 选项；只有用户要时再展开完整 rubric。
7. Context 问题适合时提供简洁的编号选项，并附 `Other (specify)`；接受 `1,3`、`1 and 3` 这类多选。
8. **只有在决策点**才给编号建议，不要每答一题就给建议。
9. 决策点包括：
   - 完整背景总结之后
   - 5 个维度的成熟度画像出来之后
   - 选择优先级和行动路径时
10. 给建议时必须清晰编号（`1.`、`2.`、`3.`），并接受 `#1`、`1`、`1 and 3`、`1,3` 或自定义文字选择。
11. 如果用户选了多个选项，要整合成一条组合路径继续。
12. 如果用户给的是自定义文字，要映射到最接近的合法路径，不要要求用户重新输入。
13. 必须处理中断：如果用户问元问题（“还剩几题？”“为什么叫这个标签？”“先暂停”），先直接回答，再重述当前进度并继续当前待回答的问题。
14. 如果用户说停下或暂停，立刻暂停，等明确恢复后再继续。
15. 如果用户说“一次问一个问题”，那整个 session 都保持这个模式，除非用户明确改口。
16. 在进入任何评估问题前，先简单说明大概时长和长度，并让用户选择进入模式。

---

### Session Start: Heads-Up + Entry Mode (Mandatory)

**Agent opening prompt (use this first):**

“先提醒一下：这个流程通常需要 7-10 分钟，总共最多 13 个问题（8 个 context + 5 个 scoring）。
你想怎么进行？
1. Guided mode: 我一题一题问。
2. Context dump: 你把已知背景一次性贴出来，我跳过重复问题。
3. Best guess mode: 如果信息不全，我会做合理假设、标注出来，并继续往下走。

接受 `#1`、`1`、`1 and 3`、`1,3` 或自定义文字。

**Mode behavior:**

- **If Guided mode:** 按 Step 0 原样执行，然后进入 scoring。
- **If Context dump:** 先让用户贴一次背景，做摘要并找出缺口，然后：
  - 已经回答过的 context 问题一律跳过
  - 只补最少缺失背景（0-2 个澄清问题）
  - 只要 context 足够，就进入 scoring
- **If Best guess mode:** 先问最小可行输入（role/team + primary goal），然后：
  - 对缺失信息做合理默认推断
  - 每一条推断都标成 `Assumption`
  - 每条假设都给 `High`、`Medium`、`Low` 的置信度
  - 遇到未知也继续推进，不阻塞

如果用了 context dump 或 best guess mode，最终总结时要增加 **Assumptions to Validate** 小节。

---

### 第 0 步：收集上下文

**Agent asks:**

按照下面顺序，一次只问一个问题：

1. “你们现在在用哪些 AI 工具？”
2. “你的团队现在通常怎么用 AI：一次性 prompts、可复用 templates，还是多步 workflows？”
3. “现在是谁在稳定使用 AI：只有你自己、PM 团队，还是跨职能团队？”
4. “你们团队大约有多少 PM、工程师和设计师？”
5. “你们目前处于什么阶段：startup、growth，还是 enterprise？”
6. “你们的决策方式更像 centralized、distributed，还是 consensus-driven？”
7. “你希望通过 AI 建立什么竞争优势？”
8. “当前拖慢学习和迭代的最大瓶颈是什么？”

第 8 题结束后，用 4 行做总结：
- Current AI usage pattern
- Team context
- Strategic intent
- Primary bottleneck

---

### 第 1 步：上下文设计成熟度

**Agent asks:**

我们先评估你的**上下文设计**能力，也就是你是否建立了一个人都能信任的“reality layer”，以及你现在做的是**上下文堆砌**（无意图地堆量）还是**上下文工程**（为注意力设计结构）。
**下面哪一项最符合你们当前状态？**

1. **Level 1 (AI-First / 上下文堆砌):** “每次需要时我都把整份文档贴进 ChatGPT。没有共享知识库，也没有上下文边界。”
   - Reality: 一次性 prompting，没有持久性；默认“越多越好”
   - Problem: AI 没有记忆；你不断重复自己；上下文堆砌会稀释注意力
   - **上下文工程差距：** 5 个诊断问题一个都答不出来；凡事都想“先存着再说”。

2. **Level 2 (新兴 / 早期结构):** “我们有一些文档（PRD、strategy memo），但很分散，也没统一格式。已经开始感觉到上下文堆砌的问题（回答变泛、不断重试）。”
   - Reality: 有上下文，但还没按 AI 消费方式组织；没有检索策略
   - Problem: AI 找不到、也不敢信任信息；always-needed 和 episodic context 混在一起
   - **上下文工程差距：** 没有上下文边界 owner；没有 persist 和 retrieve 的区分。

3. **Level 3 (转型中 / 上下文工程初现):** “我们开始用 CLAUDE.md 和 project instructions。也有 constraints registry。正在区分什么该 persist、什么该 retrieve。并尝试 Research -> Plan -> Reset -> Implement 循环。”
   - Reality: 结构化上下文已开始出现，但还不完整；上下文边界已定义，但执行不彻底
   - Problem: 覆盖不均；有些领域写得很清楚，有些仍靠感觉；检索方式也不一致
   - **上下文工程进展：** 5 个诊断问题里能答出 3-4 个；上下文边界 owner 已明确；开始用双层记忆

4. **Level 4 (AI-Shaped / 上下文工程精通):** “我们维护了一个 durable reality layer：constraints registry（50+ 条）、证据数据库、操作术语表（50+ 个术语）。我们有双层记忆架构（短期会话 + 通过 vector DB 的长期记忆）。上下文边界定义清晰且有 owner。AI agents 会自动引用这些。我们也用 Research -> Plan -> Reset -> Implement 防止上下文腐化。”
   - Reality: 人都能信任的完整、可版本管理的上下文；按意图检索，而不是为了完整性全塞进去
   - Outcome: AI 在高置信条件下工作；减少幻觉和返工；优化 token 使用；没有上下文堆砌
   - **上下文工程精通：** 5 个诊断问题全部答得出来；上下文边界每季度审计；还能量化效率：`(Accuracy x Coherence) / (Tokens x Latency)`

**Select your level:** [1, 2, 3, or 4]

**Note:** 如果你选 Level 1-2，且明显受上下文堆砌困扰，建议搭配 [`context-engineering-advisor`](../context-engineering-advisor/SKILL.md) 一起使用，先诊断并修复 Context Hoarding Disorder。
**User response:** [Selection]

**Agent records:** Context Design maturity = [Level X]

---

### 第 2 步：Agent 编排成熟度

**Agent asks:**

接下来评估 **Agent 编排**，也就是你现在到底有可重复的 AI workflows，还是还停留在一次性 prompt？
**下面哪一项最符合你们当前状态？**

1. **Level 1 (AI-First):** “我按需直接在 ChatGPT 里输入 prompt。没有保存过 workflow，也没有模板。”
   - Reality: 战术性、临时性使用
   - Problem: 结果不一致，无法规模化，也没法审计

2. **Level 2 (新兴):** “我保存了几个会复用的 prompt。也许有一些 custom GPTs 或 Claude Projects。”
   - Reality: prompt 可复用，但还不是完整 workflow
   - Problem: 每一步都得手动做，没有 orchestration3. **Level 3 (Transitioning):** "我们构建了一些多步骤工作流（研究 -> 综合 -> 批评），会在 Notion 或 Linear 里跟踪。"
   - 现实：工作流已存在，但仍需手动串联。
   - 问题：每一步仍需人工介入，未完全自动化。

4. **Level 4 (AI-Shaped):** "我们有自动化编排的 AI 工作流：研究 -> 综合 -> 批评 -> 决策 -> 记录理由。每一步都可追踪、可版本管理。"
   - 现实：工作流稳定运行；每一步都能展示其工作过程。
   - 结果：可靠、可审计、可规模化的 AI 流程。

**选择你的级别：** [1, 2, 3, 或 4]

**用户响应：** [选择]

**Agent 记录：** Agent 编排成熟度 = [级别 X]

---

### 第 3 步：成果加速成熟度

**Agent 提问：**

接下来是**成果加速**，也就是你是在用 AI 压缩学习周期，还是仅仅让任务更快完成？
**下面哪一项最符合你们当前状态？**

1. **Level 1 (AI-First):** "AI 帮我更快写文档（PRD、用户故事）。每周能省几小时。"
   - 现实：产出生成效率更高。
   - 问题：文档本身并非瓶颈；学习周期没有变化。

2. **Level 2 (Emerging):** "AI 帮我们做研究和综合（比如总结用户反馈、分析竞品）。研究时间确实变短了。"
   - 现实：学习速度有一定提升。
   - 问题：仍是串行流程；AI 未真正消除验证滞后。

3. **Level 3 (Transitioning):** "我们用 AI 更快地跑实验（概念验证探针、可行性检查）。验证时间从几周缩到几天。"
   - 现实：学习周期正在变短。
   - 问题：尚未系统化；仅在部分实验中使用。

4. **Level 4 (AI-Shaped):** "AI 在系统性移除瓶颈：隔夜可行性检查、异步综合替代会议、自动按约束预校验。学习周期加快了 5-10 倍。"
   - 现实：学习方式被根本重构。
   - 结果：交付已验证功能的速度，比竞争对手快 6 倍。

**选择你的级别：** [1, 2, 3, 或 4]

**用户响应：** [选择]

**Agent 记录：** 成果加速成熟度 = [级别 X]

---

### 第 4 步：团队-AI 协作成熟度

**Agent 提问：**

现在评估**团队-AI 协作**，也就是你有没有将 AI 作为共同智能来重构团队系统？
**下面哪一项最符合你们当前状态？**

1. **Level 1 (AI-First):** "我私下用 AI。团队不知道，或者几乎不用。没有共享规范。"
   - 现实：仅是个人工具使用，没有团队整合。
   - 问题：输出质量不一致，且没有 AI 输出的责任归属。

2. **Level 2 (Emerging):** "团队里有些人开始用 AI，但各用各的。偶尔会分享提示词，但没有正式的审查规范。"
   - 现实：团队开始接触 AI，但还没有共同的工作方式。
   - 问题：质量参差不齐；有人很依赖 AI，有人完全排斥；没有证据标准。

3. **Level 3 (Transitioning):** "我们开始建立一些共享规范：AI 输出默认是草稿，需要审查；部分场景要求引用来源；团队能公开讨论 AI 的优劣。"
   - 现实：AI 开始进入团队系统，但规则还不完整。
   - 问题：不同人执行标准不一致；决策权限还不够清晰。

4. **Level 4 (AI-Shaped):** "我们已经编纂了完整规范：审查协议、证据标准、决策权限和升级路径。团队既会用 AI，也敢挑战 AI。"
   - 现实：AI 已成为团队运营模式的一部分。
   - 结果：质量稳定、责任清晰、心理安全高，AI 真正在放大集体判断力。

**选择你的级别：** [1, 2, 3, 或 4]

**用户响应：** [选择]

**Agent 记录：** 团队-AI 协作成熟度 = [级别 X]

---

### 第 5 步：战略差异化成熟度

**Agent 提问：**

最后评估**战略差异化**，也就是你到底是在做效率提升，还是已经建立了别人难以复制的优势？
**下面哪一项最符合你们当前状态？**

1. **Level 1 (AI-First):** "我们主要是用 AI 提升内部效率，比如写文档、做总结、产出更快。"
   - 现实：价值主要在内部提效。
   - 问题：竞争对手很容易复制，无法形成护城河。

2. **Level 2 (Emerging):** "我们开始尝试一些新能力或更快流程，但别人只要多投点人，也能赶上。"
   - 现实：开始出现差异化苗头，但防御性不强。
   - 问题：容易被抄袭；竞争优势不稳定。

3. **Level 3 (Transitioning):** "我们已经通过 AI 重写了一部分工作流，速度和成本结构都出现明显领先，但还没有完全验证护城河。"
   - 现实：差异化开始变得真实。
   - 问题：还需要验证客户是否真正感知价值，以及竞争对手是否真的难以模仿。

4. **Level 4 (AI-Shaped):** "我们已经建立了至少一项竞争对手很难通过堆人复制的能力。要赶上我们，他们得重构整个组织。"
   - 现实：差异化体现在客户能力、工作流或经济模型上。
   - 结果：真正形成护城河，而不只是快一点。

**选择你的级别：** [1, 2, 3, 或 4]

**用户响应：** [选择]

**Agent 记录：** 战略差异化成熟度 = [级别 X]

---

### 第 6 步：生成整体画像

**Agent 计算：**
- 5 个维度的平均分
- 最低维度
- 哪些维度存在依赖阻塞

**整体评估逻辑：**
- **AI-First：** 平均在 1-1.5（大部分是 Level 1）
- **Emerging：** 平均在 2-2.5（大部分是 Level 2）
- **Transitioning：** 平均在 3-3.5（大部分是 Level 3）
- **AI-Shaped：** 平均在 3.5-4（大部分是 Level 4）

---

### 第 7 步：识别优先级差距

**Agent 提问：**

基于你的成熟度画像，下一步应该优先补哪项能力？
**Agent 分析依赖关系：**

**依赖逻辑：**
1. **上下文设计是基础** - 如果只有 Level 1-2，它必须是优先级 #1（Agent 编排和成果加速都依赖它）。
2. **Agent 编排支撑成果加速** - 如果上下文设计已经达到 3+，但 Agent 编排还是 1-2，就先补编排。
3. **团队-AI 协作是并行能力** - 可以和其他能力一起建设，但组织要规模化必须补。
4. **战略差异化需要其他维度达到 3+** - 基础能力没搭起来前，不要先冲这一项。

**Agent 建议：**

基于你的画像，我建议你先补 **[能力名称]**，原因如下：

**选项 1：上下文设计（如果 Level 1-2）**
- **为什么：** 没有持久的上下文，AI 就只能靠感觉工作。所有工作流都会很脆弱。
- **影响：** 打开 Agent 编排和成果加速的空间。
- **下一步：** 建 CLAUDE.md、约束注册表、操作术语表。

**选项 2：Agent 编排（如果上下文已 3+，但编排是 1-2）**
- **为什么：** 你已经有上下文，但还没有可重复的工作流。要规模化，必须编排。
- **影响：** 把一次性提示词变成可靠、可追踪的工作流。
- **下一步：** 记录最常见的 AI 工作流、给提示词做版本管理、加入可追溯性。

**选项 3：成果加速（如果上下文 + 编排都已 3+）**
- **为什么：** 你的基础设施已经有了，现在该压缩学习周期。
- **影响：** 真正的战略优势来自学习速度。
- **下一步：** 找出学习链路中最大的瓶颈，用 AI 工作流把它消除。

**选项 4：团队-AI 协作（如果使用是个人层面，非团队层面）**
- **为什么：** 如果只有你自己是 AI 形态，团队没跟上，那永远规模化不起来。
- **影响：** 这是组织转型，不只是个人提效。
- **下一步：** 建审查规范、证据标准、决策权限框架。

**选项 5：战略差异化（如果其他所有维度都已 3+）**
- **为什么：** 基础打好了，现在该真正建护城河。
- **影响：** 创造可防御的竞争优势。
- **下一步：** 找出竞争对手无法轻易复制的工作流，并设计 AI 赋能的客户能力。

**你想聚焦哪一项？**

**选项：**
1. **接受建议** - [Agent 提供详细行动计划]
2. **选择不同优先级** - [Agent 警告依赖关系但允许覆盖]
3. **同时聚焦多项** - [如果可行，Agent 建议并行路径]

**用户响应：** [选择]

---

### 第 8 步：生成行动计划

**Agent 根据所选优先级提供定制化行动计划：**

---

#### 如果优先级 = 上下文设计

**目标：** 建立一个人和 AI 都能信任的持久“现实层”，从上下文填充走向上下文工程。
**前置阶段：诊断上下文填充（如需要）**
如果你还在 Level 1-2，先诊断上下文填充：
1. 跑一遍 5 个诊断问题（见 [`context-engineering-advisor`](../context-engineering-advisor/SKILL.md)）。
2. 找出哪些内容你不该持久化，而应该检索。
3. 指定上下文边界负责人。
4. 建上下文清单（什么是始终需要的，什么是情景性的）。

**阶段 1：记录约束（第 1 周）**
1. 建一个约束注册表：
   - 技术约束（API、数据模型、性能限制）。
   - 监管约束（GDPR、HIPAA 等）。
   - 战略约束（哪些东西我们会做/不会做）。
2. 对每条约束应用第 4 个诊断问题：“如果我们排除这个，会失败什么？”
3. 格式要让 AI 代理能解析（YAML、JSON，或带前置元数据的 Markdown）。
4. 放进 Git 做版本管理。

**阶段 2：构建操作术语表（第 2 周）**
1. 列出团队最常用的 20-30 个术语（如“用户”、“客户”、“激活”、“流失”）。
2. 每个术语给出单一定义（不要写成“视情况而定”）。
3. 补充边缘情况和例外。
4. 写进 CLAUDE.md 或项目说明。
5. 这将成为你的**长期持久记忆**（陈述性记忆）。

**阶段 3：建立证据标准 + 上下文边界（第 3 周）**
1. 定义什么算验证：
   - 用户反馈：“X 位用户说 Y”（附引述）。
   - 分析数据：“指标 Z 变化了 N%”（附仪表盘链接）。
   - 竞争情报：“竞争对手 A 推出了 B”（附来源）。
2. 拒绝这类表达：“我认为”、“我们感觉”、“似乎”。
3. 用 5 个诊断问题定义上下文边界：
   - 每块上下文支撑什么具体决策？
   - 能不能检索，而不是持久化？
   - 谁拥有这个上下文边界？
4. 创建上下文清单。
5. 写进团队操作文档。

**阶段 4：实现记忆架构 + 工作流（第 4 周）**
1. **搭建双层记忆：**
   - **短期（对话式）：** 对旧对话做摘要/截断。
   - **长期（持久化）：** 约束注册表 + 操作术语表（必要时用向量数据库做检索）。
2. **执行“研究 -> 计划 -> 重置 -> 实施”循环：**
   - 研究：允许混乱地收集上下文。
   - 计划：综合成高密度的 SPEC.md 或 PLAN.md。
   - 重置：清空上下文窗口。
   - 实施：只拿计划作为上下文执行。
3. 更新 AI 提示词，让它们自动引用约束注册表和术语表。
4. 测试：要求 AI 在给建议时引用约束。
5. 量化：有多少 AI 输出引用了证据、有多少在幻觉；令牌使用效率如何。

**成功标准：**
- 约束注册表有 20+ 条。
- 操作术语表有 20-30 个术语。
- 证据标准已写清并共享。
- 上下文清单已建立（始终需要 vs. 情景性）。
- 已指定上下文边界负责人。
- 双层记忆架构已实现。
- “研究 -> 计划 -> 重置 -> 实施”至少在 1 个工作流上跑通。
- AI 代理能自动引用这些内容。
- 令牌使用下降 30%+（更少上下文填充）。
- 输出一致性上升（更少重复重试）。

**相关技能：**
- **[`context-engineering-advisor`](../context-engineering-advisor/SKILL.md)**（交互式） - 深入诊断上下文填充并实现记忆架构。
- `problem-statement.md` - 在定义问题前先定义约束。
- `epic-hypothesis.md` - 用证据写假设。

---

#### 如果优先级 = Agent 编排

**目标：** 把一次性提示词变成可重复、可追踪的 AI 工作流。
**阶段 1：映射当前工作流（第 1 周）**
1. 选一个最常用的 AI 用例（例如“分析用户反馈”）。
2. 记录你现在每一步怎么做：
   - 把反馈贴进 ChatGPT。
   - 让它总结主题。
   - 手动分类。
   - 写总结。
3. 找痛点（手动交接、结果不一致）。

**阶段 2：设计编排工作流（第 2 周）**
1. 定义工作流循环：
   - **研究：** AI 读取全部反馈（结构化输入）。
   - **综合：** AI 提炼主题（附证据）。
   - **批评：** AI 标出矛盾或弱信号。
   - **决策：** 人类审查后决定下一步。
   - **记录：** AI 记录理由和来源。
2. 每一步都必须可追踪（显示来源、推理）。

**阶段 3：构建和测试（第 3 周）**
1. 用合适方式实现：
   - Claude Projects（简单场景）。
   - Custom GPTs（中等复杂）。
   - API 编排（复杂场景）。
2. 用 3 个历史案例试跑，并和人工流程比较。
3. 评估：节省了多少时间、一致性是否提高、是否更可追踪。

**阶段 4：文档化和规模化（第 4 周）**
1. 用 Git 管理提示词版本。
2. 为团队写清工作流步骤。
3. 让 2 位同事试跑，观察结果。
4. 根据反馈迭代。

**成功标准：**
- 至少 1 个工作流可以稳定运行（相同输入 -> 可预测流程）。
- 每一步可追踪（AI 会引用来源）。
- 团队不依赖你本人也能复用这个工作流。

**相关技能：**
- `pol-probe-advisor.md` - 用编排工作流运行验证实验。

---

#### 如果优先级 = 成果加速

**目标：** 用 AI 压缩学习周期，而不只是提升任务速度。
**阶段 1：识别瓶颈（第 1 周）**
1. 画出当前学习周期（例如：假设 -> 实验 -> 分析 -> 决策）。
2. 给每一步计时。
3. 找出最慢的一步（通常是验证滞后、审批延迟或会议开销）。

**阶段 2：设计 AI 干预（第 2 周）**
1. 问：“如果这一步在隔夜完成，会怎样？”
   - 可行性检查：AI 2 小时跑完，而不是 2 天。
   - 用户研究综合：AI 1 小时分析完，而不是 1 周。
   - 审批预检查：开会前先让 AI 按约束预校验。
2. 设计一个最小 AI 工作流来干掉这个瓶颈。

**阶段 3：运行试点（第 3 周）**
1. 在 1 个真实项目上试运行。
2. 对比周期时间：前 vs 后。
3. 校验质量：AI 是保持了严谨，还是只是抄了近路？

**阶段 4：规模化（第 4 周）**
1. 如果成功（周期缩短 50%+ 且质量不下降），复制到另外 3 个项目。
2. 写文档。
3. 培训团队。

**成功标准：**
- 至少 1 个项目的学习周期缩短 50%+。
- 质量没有因走捷径而下降。
- 团队采纳了这个加速工作流。

**相关技能：**
- `pol-probe.md` - 用 AI 更快跑概念验证探针。
- `discovery-process.md` - 用 AI 压缩发现周期。

---

#### 如果优先级 = 团队-AI 协作

**目标：** 重构团队系统，让 AI 成为共同智能，而不是责任盾牌。
**阶段 1：建立审查规范（第 1 周）**
1. 写清规则：“AI 输出是草稿，不是终稿”。
2. 定义审查协议：
   - 谁来审查 AI 输出？（同事、负责人 PM、跨职能伙伴）。
   - 什么时候审查？（对外发布前、决策前）。
   - 审查什么？（准确性、完整性、证据引用）。
3. 分享给团队，拿到认同。

**阶段 2：设定证据标准（第 2 周）**
1. AI 必须引用来源（不允许幻觉）。
2. 拒绝“我认为”或“似乎”。
3. 要求写成：“根据 [来源]，[事实]”。
4. 写进团队操作文档。

**阶段 3：定义决策权限（第 3 周）**
1. 明确：AI 负责建议，人负责决策。2. 记录谁有权限 override AI 建议（PM、team lead、cross-functional consensus）
3. 制定 escalation path（如果 AI 和人冲突怎么办）

**Phase 4: Build Psychological Safety (Week 4)**
1. 组织一个练习：分享一次你发现的 AI 错误（把发现错误正常化）
2. 奖励 critical thinking（例如 “Good catch on that AI hallucination!”）
3. 避免使用： "Why didn't you just use AI?" 这类羞辱式表达
**Success Criteria:**
- Review norms 已文档化，并被团队实际执行
- Evidence standards 已 codify
- Decision authority 清晰
- 团队愿意公开质疑 AI 输出

**Related Skills:**
- `problem-statement.md` - 用 evidence 来做 problem framing
- `epic-hypothesis.md` - 编写可验证、基于证据的假设

---

#### If Priority = Strategic Differentiation

**Goal:** 建立可防御竞争优势，而不只是效率提升。
**Phase 1: Identify Moat Opportunities (Week 1)**
1. 问： "我们能用 AI 做什么，是竞争对手靠加人也复制不了的？"
   - 新客户能力（例如 "AI advisor suggests personalized roadmap"）
   - Workflow rewiring（例如"2 天内验证产品想法，而不是 3 周"）
   - Economics shift（例如"通过 AI automation，以 SMB 价格交付 enterprise 级能力"）
2. 先列 5 个候选机会
3. 按 defensibility 排优先级（多难复制？）
**Phase 2: Design AI-Enabled Capability (Week 2)**
1. 选最强的那个候选
2. 设计端到端 workflow：
   - 客户体验到什么？
   - AI 在背后做什么？
   - 哪些部分必须保留人类判断？
3. 画一个 MVP（minimum viable moat）
**Phase 3: Build and Test (Weeks 3-4)**
1. 做 prototype（可以是 PoL probe，不一定要上生产）
2. 找 5 个客户测试
3. 判断：这件事是否创造了竞争对手难以匹配的价值？

**Phase 4: Validate Moat (Week 5)**
1. 问： "竞争对手会怎么复制它？"
   - 如果答案是“多招点人”，那它不是 moat
   - 如果答案是“他们得把组织重构一遍”，那你才真有 moat
2. 记录竞争分析
3. 决定：完整投入、pivot，还是 kill

**Success Criteria:**
- 至少识别出 1 项 AI-enabled 能力，竞争对手难以轻易复制
- 已和客户验证（客户能感知到价值）
- 已确认 defensibility（有竞争分析支撑）
**Related Skills:**
- `positioning-statement.md` - 讲清你的 AI-driven differentiation
- `jobs-to-be-done.md` - 理解客户究竟“雇佣”你的 AI 能力去完成什么任务

---

### 第 9 步：Track Progress (Optional)

**Agent offers:**

你要不要我顺手给你做一个 AI-shaped 转型进度跟踪器？

**Tracker includes:**
- Current maturity levels（baseline）
- Target maturity levels（目标状态）
- Action plan milestones（来自 Step 8）
- Review cadence（weekly、monthly）
**Options:**
1. **Yes, create tracker** - [Agent generates Markdown checklist]
2. **No, I'll track separately** - [Agent provides summary]

---

## 示例

### 示例 1：Early-Stage Startup (AI-First -> Emerging)

**Context:**
- Team: 2 PMs, 5 engineers
- AI Usage: ChatGPT 写 PRD，偶尔用 Copilot
- Goal: 比大公司更快

**Assessment Results:**
- Context Design: Level 1（没有结构化 context）
- Agent Orchestration: Level 1（一次性 prompts）
- Outcome Acceleration: Level 1（文档更快，但学习周期没变）
- Team-AI Facilitation: Level 2（团队有人在用，但没有规范）
- Strategic Differentiation: Level 1（只有效率提升）

**Recommendation:** 先补 **Context Design**。
**Action Plan (Week 1-4):**
- Week 1: 建 constraints registry（10 条技术约束）
- Week 2: 建 operational glossary（5 个术语）
- Week 3: 建 evidence standards
- Week 4: 把 context 写进 CLAUDE.md

**Outcome:** 4 周后，Context Design -> Level 3，为下个季度补 Agent Orchestration 打开条件。

---

### 示例 2：Growth-Stage Company (Transitioning -> AI-Shaped)

**Context:**
- Team: 10 PMs, 50 engineers, 5 designers
- AI Usage: 用 Claude Projects 做 research，也开始搭 custom workflows
- Goal: 在 IPO 前建立可防御的 AI 优势

**Assessment Results:**
- Context Design: Level 3（有结构，但不完整）
- Agent Orchestration: Level 3（有一些 workflow，但仍需手动交接）
- Outcome Acceleration: Level 2（有一些提升，但不系统）
- Team-AI Facilitation: Level 3（规范开始出现，但未 codify）
- Strategic Differentiation: Level 2（有新能力，但容易被抄）

**Recommendation:** 先补 **Outcome Acceleration**（基础已经有了，现在该压缩学习周期）。
**Action Plan (Week 1-4):**
- Week 1: 找出瓶颈（discovery cycle 需要 3 周）
- Week 2: 设计 AI workflow 来跑 overnight feasibility checks
- Week 3: 在 1 个项目上试点（把周期缩到 5 天）
- Week 4: 扩展到 3 个项目
**Outcome:** 学习周期 5x 提速 -> 与竞争对手拉开战略距离 -> Outcome Acceleration Level 4 + Strategic Differentiation Level 3。

---

### 示例 3：Enterprise Company (AI-First, Scattered Usage)

**Context:**
- Team: 50 PMs, 300 engineers
- AI Usage: 各 PM 自己用不同工具，没有统一方式
- Goal: 标准化 AI 使用，并建立跨职能 workflows

**Assessment Results:**
- Context Design: Level 2（有文档，但不是按 AI 方式组织）
- Agent Orchestration: Level 1（没有共享 workflows）
- Outcome Acceleration: Level 1（只有效率提升）
- Team-AI Facilitation: Level 1（私下使用，没有规范）
- Strategic Differentiation: Level 1（没有形成优势）

**Recommendation:** 先补 **Team-AI Facilitation**（分布式团队在补基础设施前，必须先建立共享规范）。
**Action Plan (Week 1-4):**
- Week 1: 建立 review norms（AI outputs are drafts）
- Week 2: 设定 evidence standards（AI 必须引用来源）
- Week 3: 定义 decision authority（AI 提建议，lead 决定）
- Week 4: 先和 3 个团队试点，收反馈
**Outcome:** Team-AI Facilitation -> Level 3，为后续 Context Design 和 Agent Orchestration 打基础。

---

## 常见陷阱

### 1. **Mistaking Efficiency for Differentiation**
**Failure Mode:** "We use AI to write PRDs 2x faster - we're AI-shaped!"

**Consequence:** 竞争对手 3 个月内就能复制，没有长期优势。
**Fix:** 问自己： “如果竞争对手多加 2 倍人力，能不能追平我们？” 如果能，那这只是效率（table stakes），不是差异化。

---

### 2. **Skipping Context Design**
**Failure Mode:** 在没有 durable context 的前提下，直接搭 Agent Orchestration workflows。
**Consequence:** AI workflow 会非常脆，context 一变就崩。
**Fix:** Context Design 是基础，不要跳过。先建 constraints registry、glossary 和 evidence standards。

---

### 3. **Individual Usage, Not Team Transformation**
**Failure Mode:** "I'm AI-shaped, but my team isn't."

**Consequence:** 永远 scale 不起来；你一休假 workflow 就死。
**Fix:** 优先补 Team-AI Facilitation。共享规范比个人提效更重要。

---

### 4. **Focusing on Tools, Not Workflows**
**Failure Mode:** "我们该用 Claude 还是 ChatGPT？"

**Consequence:** 工具争论会分散注意力，让你错过真正需要重构的工作方式。
**Fix:** 工具不重要，workflow 才重要。重点放在如何重构工作，而不是换哪个 AI。

---

### 5. **Speed Over Learning**
**Failure Mode:** "AI helps us ship faster!"

**Consequence:** 如果你没有压缩学习周期，那你只是更快地交付错误的东西。
**Fix:** Outcome Acceleration 关注的是更快学习，而不是更快开发。目标是几天内验证假设，而不是几周。

---

## 参考

### Related Skills
- **[context-engineering-advisor](../context-engineering-advisor/SKILL.md)** (Interactive) - **深入扩展 Context Design 能力：** 诊断 context stuffing、实现 memory architecture、应用 Research -> Plan -> Reset -> Implement 循环
- **[problem-statement](../problem-statement/SKILL.md)** (Component) - 基于证据的问题 framing（Context Design）
- **[epic-hypothesis](../epic-hypothesis/SKILL.md)** (Component) - 带 evidence standards 的可验证假设
- **[pol-probe-advisor](../pol-probe-advisor/SKILL.md)** (Interactive) - 用 AI 压缩验证周期（Outcome Acceleration）
- **[discovery-process](../discovery-process/SKILL.md)** (Workflow) - 把 AI-shaped 原则用于 discovery
- **[positioning-statement](../positioning-statement/SKILL.md)** (Component) - 讲清 AI-driven differentiation（Strategic Differentiation）

### External Frameworks
- **Dean Peters** - [*AI-First Is Cute. AI-Shaped Is Survival.*](https://deanpeters.substack.com/p/ai-first-is-cute-ai-shaped-is-survival) (Dean Peters' Substack, 2026)
- **Dean Peters** - [*Context Stuffing Is Not Context Engineering*](https://deanpeters.substack.com/p/context-stuffing-is-not-context-engineering) (Dean Peters' Substack, 2026) - 针对能力 #1（Context Design）的深入文章

### Further Reading
- **Ethan Mollick** - *Co-Intelligence*（关于 AI 作为 co-intelligence，而不是替代品）
- **Shreyas Doshi** - 关于用 AI 放大 PM judgment 的 Twitter threads
- **Lenny Rachitsky** - 采访 AI-forward PM 的 Newsletter