# 面向产品经理的 Context Engineering

**信息架构：现代产品管理中的 Context Engineering 与 Orchestrator 模型**

数字产品领域正在经历一次结构性转变，规模上可比桌面时代向移动时代的迁移。在这个阶段，一个人工智能（AI）功能是否有效，不再只取决于底层 Large Language Model（LLM）的原始能力，而取决于这个模型被锚定到现实世界的精度。这个锚定过程，就是 context engineering 的领域。它已经迅速上升为当代产品经理最关键的技术能力之一。生成式 AI 早期，大家关注的是 prompt engineering，也就是通过精心编写指令来获得更好的输出。但随着领域成熟，一个更深层的事实越来越清楚：输入环境的质量，决定了输出的智商。对产品经理来说，这意味着角色正从静态功能的构建者，转向动态信息生态的 orchestrator。

**范式转移：从 Parametric Knowledge 到 Contextual Intelligence**

要理解 context engineering，首先要承认标准 Large Language Model 的天然局限。这类系统主要依赖 parametric knowledge，也就是训练阶段写进权重里的信息。这些知识是静态的、不可归因的，而且训练一结束往往就开始过时。当产品经理要求 LLM 处理实时数据、企业私有信息或特定用户偏好时，模型会进入一种“认知失调”状态。它要么承认自己不知道，要么更危险地编造一个听起来合理但实际上错误的答案，也就是 hallucination。

Context engineering 通过在模型的静态训练知识与用户的动态现实之间搭建桥梁，来解决这个根本缺口。它是对 AI 模型在生成回答前所接触到的信息环境进行系统化设计和管理的方法。这已经超越了早期聊天机器人时代那种无状态、单轮交互的模式，转向可进行复杂推理的有状态、多轮系统。产品经理在其中的职责，是充当这个“世界观”的首席架构师，确保模型在正确的时间，以正确的格式，拿到恰好需要的信息。

**Context Engineering 的核心原则**

Context engineering 的实践，本质上是从“写 prompt”转向“设计数据管道”。它覆盖提供给模型的整个信息生态，包括对话历史、长期用户记忆、检索文档（RAG）、可用工具定义，以及系统级 guardrail。

| **维度** | **Prompt Engineering** | **Context Engineering** |
|-----------------------|---------------------------------------------------|--------------------------------------------------------|
| **操作范围** | 单次输入输出；即时指令。 | 完整生态：memory、history、RAG 和 tools。 |
| **思维方式** | 创意写作、文案微调、静态引导。 | 系统设计、架构设计、pipeline 流。 |
| **主要目标** | 为一次性任务诱导特定回答。 | 确保稳定、可靠、可扩展的表现。 |
| **数据特性** | 静态且短暂。 | 动态且可跨会话持久化。 |

随着组织扩大 AI 投入，关注点会从“怎么问”转向“模型看到了什么”。这会形成一套 context-engineered system 的需求层级。最底层是 accuracy 和 reliability；没有相关 context，agent 就可能选错工具或 hallucinate。可靠性建立后，焦点会转向质量，此时 signal-to-noise ratio 极其关键。最后，orchestrator 还必须管理 performance、cost 和 latency 的权衡，因为 context window 里每多一个 token，推理成本和时间都会增加。

**“无限上下文”叙事的风险：Context Stuffing vs. Engineering**

产品社区里长期存在一种张力：一边是 AI 提供商的营销叙事，一边是生产系统里的工程现实。超大 context window，甚至上百万 token，让很多团队采用了“context stuffing”策略。做法很简单粗暴：把尽可能多的信息都塞进 prompt，比如整个代码库或一个巨大的客户数据库，假设模型自然就会“知道”全部内容。

研究者和行业专家，包括 Dean Peters，都认为 context stuffing 和 context engineering 根本不是一回事。当模型被无关数据淹没时，它的有效智商会急剧下降。主要原因是“Reasoning Noise”效应：成千上万个不相关文件或数据点会争夺模型注意力，主动削弱它做多跳逻辑推理的能力。像 Llama 4 Scout 这类 benchmark 已显示，当 context window 超过某个阈值（通常约 32k token）后，准确率可能跌破 20%，让更大的窗口在高精度任务中几乎失效。

**Context Rot 与 Attention Bias 现象**

除了推理退化，context stuffing 还会带来“Context Rot”。随着会话推进，无关数据、错误路径和过去的失误会不断积累到 context window 中。这些噪音会让模型偏离原始目标。与此同时，模型还存在“Lost in the Middle”现象：它们通常更重视上下文开头的信息（primacy bias）和结尾的信息（recency bias），却经常忽略中间位置的关键指令或数据。

经济成本同样严重。虽然 token 价格下降了，但并不是零。对于大型工程组织来说，“把整个 repo 都塞进去”的策略，会让每一次微小查询都变成一笔不小的资本开销，却没有相应的推理准确性回报。因此，顶级团队逐渐收敛到“Context Compaction”这门纪律上，目标是在每个 token 中尽可能提高有效信息密度。

**Context 效率的定量分析**

扮演 orchestrator 角色的产品经理，必须建立对 context 效率的定量直觉。输入量与输出质量的关系并不是线性的；很多时候，它更像一条钟形曲线，表现先上升，再随着噪音增加而下降。

\$\$Efficiency = \\frac{Accuracy \\times Coherence}{Tokens \\times Latency}\$\$

这个公式意味着：最有效的系统，是用尽可能少、但信号最强的信息，支撑一次优质决策。比如，有研究表明，只使用 Retrieval-Augmented Generation（RAG）并投入总 token 的 25%，就能保留约 95% 的准确率，相比把全部 context 都塞进去，延迟和成本都显著下降。

**Teresa Torres 框架：AI 时代的 Continuous Discovery**

AI 并没有让产品管理的基本原则过时，反而把它们放大了。产品发现领域的重要专家 Teresa Torres 认为，技术虽然让“构建”变得更容易，但决定“该构建什么”仍是核心挑战。她把传统 discovery 习惯与五个新纪律整合在一起：Context Engineering、Orchestration、Observability、Evals 和 Maintenance。

**Discovery Habits 与 Opportunity Solution Tree**

Opportunity Solution Tree（OST）仍然是“让你保持诚实的那棵树”。它把业务结果与被验证的客户需求（opportunities）以及多个 solution idea 连接起来。在 AI 时代，OST 能防止团队陷入一个常见失败模式：做出一个“华而不实、却没人需要的玩具”。它逼着团队在投入全面开发前，先识别一个 AI 功能背后最危险的假设。

| **Discovery 步骤** | **标准做法** | **AI 时代的适配** |
|-------------------------|-----------------------------------------------|------------------------------------------------------------------------|
| **Outcome Setting** | 定义可衡量的业务目标。 | 识别那些真正“AI-shaped”的问题，即规模或一致性很关键的问题。 |
| **Opportunity Mapping** | 通过访谈识别未满足的客户需求。 | 聚焦 AI 能真正解决的阻力点，比如综合、自动化。 |
| **Solutioning** | 头脑风暴功能方案。 | 把复杂任务拆解为 agentic workflow。 |
| **Assumption Testing** | 测试价值、可用性和可行性。 | 用 AI 原型工具快速进行行为验证。 |

Torres 强调，PM 必须能识别“AI-shaped problems”，也就是那些过去因过度依赖人工而难以规模化、或者用非 AI 方案始终做不好的问题。一旦发现机会，重点就不再是打磨完整功能，而是创造“低成本测试”。可能是 concierge 版本，也可能是某个元素的轻量原型，用来在工程团队搭建完整基础设施之前，先推翻最危险的假设。

**AI 产品经理的五项纪律**

Torres 给出的五项能力，为现代 PM 提供了一张很完整的路线图。

1. **Context Engineering：** 识别模型想要准确完成任务，具体需要哪些事实、偏好和数据源。
2. **Orchestration：** 设计模型调用顺序。PM 要避免“sloppy prompting”，而是把复杂目标拆成单任务模型调用，因为这样质量更高。
3. **Observability：** 实现 tracing 和 logging，看清模型的输入、输出和决策路径。这样团队才能“调试”AI 的推理过程。
4. **Evals（Evaluation）：** 建立自动化测试，识别重复性错误并衡量质量。这是用户体验层面的“单元测试”。
5. **Maintenance：** 规划持续更新，因为模型会漂移，用户数据也会变化。AI 产品从来不是“做完就完”。

**Marty Cagan 与风险管理：Empowered Teams vs. Feature Factories**

产品角色的进一步转型，也可以从 Marty Cagan 的工作中看得更清楚。Cagan 区分了两种团队：一种是以产出衡量的“feature team”，另一种是以业务结果衡量的“empowered product team”。在 AI 时代，feature team 型 PM 面临很高的淘汰风险，因为很多以交付为中心的任务，比如写 user story 和 acceptance criteria，已经能被 AI agent 自动化。

**AI 时代的四大产品风险**

Cagan 把 empowered team 需要管理的风险分为四类：Value、Usability、Feasibility 和 Viability。AI 会让每一类都多出新的层次：

- **Value Risk：** AI 方案提供的增量价值，是否足以覆盖其成本？它真的比客户自己用一个通用 chatbot 更好吗？
- **Usability Risk：** 用户能否直观地使用这个 AI 体验？要注意，“chat”并不总是最佳 UX。
- **Feasibility Risk：** 团队是否理解 AI 的“物理规律”？能否在既定时间线和 token 预算内把技术落地？
- **Viability Risk：** 这个方案能卖出去吗？是否涉及法律限制、数据隐私问题？运行模型的运营成本（OpEx）对业务来说是否可持续？

PM 作为 orchestrator 的职责，就是在整个组织里管理这些风险。这要求 PM 摆脱“文书型 clerk”的思维，转向“decision scientist”。因为当软件构建成本越来越低，最稀缺也最有价值的资源，就变成了“识别哪些问题值得解决”的能力。

**产品角色的身份危机**

这场转型正在产品社区里引发身份危机。Meta 前设计负责人 Julie Zhuo 指出，所谓“product development 的死亡”，也就是传统 pod 结构（designer、PM、engineer）的松解，意味着领导者必须重新思考，当每个人都成了“builder”时，团队该如何组织。现在 3-4 人的小团队，借助 AI，就能做出过去 30-50 人创业团队才能达到的影响力。在这种环境下，PM 的职责不再是“路由信息”，而是“策展想法”，并保持很高的“product taste”，也就是分辨 AI 输出是“真的优秀”还是“只是勉强够用”的能力。

**构建技术性的 Context 架构：RAG、Memory 与 Provenance**

对同时也是 builder 的产品经理而言，理解 context 的技术实现，是指导工程投入的前提。最先进的 AI 产品架构，不再以 prompt 字符串为中心，而是围绕推理时如何填充 context window 的整个数据管道。

**Contextual Memory 的层级**

一个稳健的 context engineering 策略，通常会把 memory 拆成短期和长期两层。

1. **短期（Conversational）Memory：** 管理一次交互中的即时历史，让 AI 能理解后续追问。难点在于空间管理；较早的对话常常需要被总结或截断，以免挤占 context window。
2. **长期（Persistent）Memory：** 在跨会话层面保存用户偏好和关键事实，从而实现深度个性化。通常会借助向量数据库，以语义相关性来嵌入和检索这些 memory。

Google 关于 context engineering 的白皮书把这进一步拆成两类记忆内容：Declarative Memory（例如“我是素食者”这种事实）和 Procedural Memory（例如“我调试时总是先看日志”这种行为模式）。现代产品的一个突破点在于，LLM 现在已经可以自己生成 memory。在会话过程中，模型会识别哪些“signal”值得记住，把它们与已有数据合并，并自动更新数据库，这个过程被称为“LLM-powered ETL”。

**Grounding 与 Provenance**

为了建立信任，AI 系统必须扎根于事实，而不是只依赖语言模式。Provenance 指的是追踪某段 memory 或某条事实来源的元数据：来自哪次会话、哪份文档、系统对此的置信度多高。在生产系统里，这就是“信任层”，它让开发者和用户都能核验 AI 的说法。

| **特性** | **标准 RAG** | **Contextual Retrieval（Anthropic）** |
|------------------------|----------------------------------------------------------------------|----------------------------------------------------------------------------|
| **数据切块** | 把文档按固定 token 大小切开。 | 在 embedding 前，先给每个 chunk 加上解释性上下文。 |
| **检索准确率** | 容易丢失上下文（例如“revenue grew 3%”，但这是哪家公司？）。 | 通过给每个 chunk 预加相关背景，维持高信号。 |
| **失败率** | 更高，因为 fragment 脱离原始上下文。 | 在大型知识库里能把失败率降低 35%。 |
| **实现方式** | 更容易搭建。 | 在索引阶段需要额外一次 LLM 调用（例如 Claude Haiku）。 |

Anthropic 的 “Contextual Retrieval” 技术，就是基础设施层面 context engineering 的典型代表。它会给每个数据 chunk 前面都加上一句简短说明，比如“这一段来自 Acme Corporation 2023 年 Q2 业绩文件”，这样 embedding 模型和关键词检索机制都能以更高置信度找到正确数据。

**Orchestrator PM：战略执行与“机器人经理”**

从一个管理功能交付的 builder，转向一个管理 revenue 和 agent 的 orchestrator，是这个时代最关键的变化。这门新纪律有时被称为“Revenue R&D”。它关注的不是简单执行人工任务，而是构建“让冷启动销售电话变得不必要的引擎”。

**Spec-Driven Development 与 “Reset” 阶段**

在 agentic workflow 中，PM 的核心产物不再只是 PRD，而是作为 Source of Truth 的 “Spec” 或 “Plan”，供一组 agent 使用。对于耗时超过一小时的任务，orchestrator 会强制生成 `SPEC.md` 或 `PLAN.md`。这相当于稳定器，能约束 agent 的 context，避免它一头扎进“rabbit hole”。

对 PM 来说，context engineering 最具战术价值的一个落地方法，就是 “Research -> Plan -> Reset -> Implement” 循环。

1. **Research：** agent 收集数据，context window 变大、变乱，里面充满噪音和无效分支。
2. **Plan：** agent 把这些数据综合成一个高密度计划。
3. **Reset：** 清空整个 context window，重置 agent 的记忆，避免 rot。
4. **Implement：** agent 在一个全新的 session 中，只以这个高密度计划作为上下文重新开始执行。

**“Product Whisperer”：与 AI 协作**

Orchestrator PM 不会把 AI 只当成被命令的工具，而会把它当成一个需要校准的合作伙伴，这种观念有时被称为 “AI Product Whisperer”。这意味着，你不是只用 AI 执行，而是用它一起探索。PM 会“低声提示”技术系统，让它扮演怀疑者，比如问：“一个沮丧的客户会怎么理解这件事？”也会让它通过模拟副作用来对策略做压力测试。

这种合作同样延伸到用户研究综合上。AI 的确可以加速笔记综合和测试想法生成，但 Torres 也提醒，如果完全不做人工复核，就会失去 empathy 和 context。Orchestrator 会先用 AI 从多份访谈快照中识别模式，再把这些模式归为 OST 中的机会簇，同时持续把 AI 的总结与 “story-based interviewing” 收集到的原始行为证据交叉核验。

**质量运营化：Evals、Traces 与 Performance 层级**

要让 AI 产品从“脆弱 demo”变成“稳健生产系统”，orchestrator 必须建立严格的评估框架。质量不是静态状态，而是一个持续监控的指标。

**错误分析与失败分类法**

Torres 建议以 error analysis 为 eval 的基础。PM 每周都应该查看数十条完整 trace，也就是一次请求的输入和输出，并给它们打标，归类失败模式。这样就能形成一套“failure mode taxonomy”，反过来指导团队应该构建哪些自动化 eval。

- **定量指标：** accuracy、latency、token efficiency，以及亚秒级 retrieval 时间。
- **定性评估：** coherence、事实准确性，以及用户满意度评分。
- **合规 eval：** 确保 AI 遵守监管要求（例如 EU AI Act）与品牌语调规范。

**信息生态的 Benchmarking**

Orchestrator 还必须对 context engineering pipeline 的不同配置做 benchmark。例如，Zep 的 “LoCoMo” benchmark 会评估单次检索效果，从而同时优化准确率、延迟和 token 效率，并能在 200ms 内达到 80% 准确率。这正是 orchestrator 应该向工程团队要求的技术精度水平。

| **Eval 类型** | **方法** | **收益** |
|---------------------|-----------------------------------------------------------|-----------------------------------------------------|
| **Golden Datasets** | 20-100 个真实输入/期望输出样本。 | 衡量整体成功率和一致性。 |
| **Code Assertions** | 输出必须满足的规则（例如必须包含日期）。 | 不依赖 LLM 就能抓住结构性失败。 |
| **LLM-as-Judge** | 用更强模型（GPT-4o）给较小模型打分。 | 对语气和相关性提供快速自动反馈。 |
| **Human Evals** | PM / Designer 人工审查 trace。 | 对“taste”和“product sense”的终极把关。 |

**战略护城河：情绪共鸣与专有 Context**

当 AI 让构建更便宜、更快时，公司的竞争优势也在转移。差异化不再主要来自技术实现本身，因为 AI 已经把这部分商品化了。真正的差异化，来自“选择解决哪些问题”。

**打造“情绪护城河”**

Orchestrator PM 通过识别那些真正“打动人心”的高回报机会来创造价值。这依赖于 AI 无法复制的人类活动：处理组织政治、建立团队心理安全感、进行伦理取舍。这条“软技能护城河”正是产品管理里人类依然不可替代的原因。

**Context 作为竞争护城河**

填充 AI context 的那些数据，比如多年客户互动沉淀下来的专有洞察、独特领域知识，以及高信号用户画像，会成为最主要的差异化来源。比如 Productboard Spark 就是在真实产品 context 上锚定 AI 输出：PRD、客户研究综合、竞争分析。这样每一个 insight 都建立在公司自身战略之上，而不是泛化的互联网数据之上。

**结论：AI Product Orchestrator 的前进路径**

从 builder 转向 orchestrator，意味着产品经理的一次职业进化。这是脱下“协调者”外壳、换上“decision scientist”身份的过程。产品管理的未来，在于既掌握 AI 的“物理规律”——也就是 context engineering 这门精细艺术，又加倍投入于“以人为中心的领导力”，确保技术服务于真正有意义的目标。

想成为合格的 orchestrator，PM 必须停止“盲目上线”，开始用 Torres 和 Cagan 所倡导的严格方法验证每一个假设。他们必须超越“context stuffing”，转向“context compaction”，确保 AI 系统既保持高智商，又在经济上可持续。归根到底，PM 的职责是：当 AI 负责执行功能时，人类团队仍然牢牢掌控结果、伦理和产品的战略方向。这场旅程才刚开始，而掌握这些新纪律的 orchestrator，将引领下一波高影响力的产品创新。
