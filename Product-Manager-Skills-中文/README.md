The request was rejected because it was considered high riskFile: Product-Manager-Skills-中文/README.md [chunk 2/4]
Rules:
- 仅改进文档中的中文翻译覆盖。
- 保留必要的英文技术术语，翻译会破坏其含义时则不翻译。
- 完全保留格式。
- 如果文件已正确翻译，则原样返回。

文档内容：
- [`altitude-horizon-framework`](skills/altitude-horizon-framework/SKILL.md)（组件）：核心心智模型：altitude（范围）与 horizon（时间）、从 waiter 到 operator 的转变、四个过渡区、典型失败模式，以及级联上下文图
- [`director-readiness-advisor`](skills/director-readiness-advisor/SKILL.md)（交互式）：为 PM 和新任 Director 提供四类情境下的辅导：准备中、面试中、刚上任、再校准

**基于 Episode 43 - [成为 VP & CPO：在高管层领导产品（第二部分）](https://the-product-porch-43ca35c0.simplecast.com/episodes/becoming-a-vp-cpo-leading-product-at-the-executive-level-part-2)**
- [`executive-onboarding-playbook`](skills/executive-onboarding-playbook/SKILL.md)（工作流）：面向 VP/CPO 转型的 30-60-90 天诊断式剧本：先诊断再行动、挖掘未写明的战略、评估团队、基于证据行动
- [`vp-cpo-readiness-advisor`](skills/vp-cpo-readiness-advisor/SKILL.md)（交互式）：指导 Director 和高层管理者完成 VP/CPO 转型，其中包括在接受职位前评估岗位的 CEO 面试框架

---

### 2026 年 2 月 10 日 - v0.4 引导协议修订

我们发现并修复了交互流程中的一次引导回归。
发生了什么：
- 我们原本预期是带有渐进式上下文处理的逐步引导。
- 但实际中，一条偏向“更短文案”的改写路径削弱了原始引导模式中的部分内容，尤其是“walk through questions”行为。
v0.4 改了什么：
- 在 [`skills/workshop-facilitation/SKILL.md`](skills/workshop-facilitation/SKILL.md) 中标准化了一套规范的引导协议。
- 将这套事实来源接入所有交互式技能和引导密集型的工作流技能。
- 增加了必备的会话提示、`Context dump` 绕过以及 `Best guess` 模式。
- 增加了强化的进度标签、中断处理和决策点推荐规则。
致谢：
- 由 Codex 识别出协议不一致问题，并将修订应用到整个仓库。
公告草稿：[`docs/announcements/2026-02-10-v0-4-facilitation-fix.md`](docs/announcements/2026-02-10-v0-4-facilitation-fix.md)

---

### 2026 年 2 月 8 日 - LinkedIn 发布

**帖子标题：** 为你的 Agent 准备的产品管理技能
**副标题：** 因为“只是提示得更好”不是一种策略。

你是不是还在不断重写 PM prompts，却只得到泛泛的 AI 输出？我做了一个可复用的 PM Skills 仓库，帮助你更快做出更尖锐的决策、文档和结果。
- 完整发布草稿：[`docs/announcements/2026-02-08-linkedin-launch.md`](docs/announcements/2026-02-08-linkedin-launch.md)
- Substack 文章草稿：[`docs/announcements/2026-02-08-substack-savage-launch.md`](docs/announcements/2026-02-08-substack-savage-launch.md)
- 公告索引：[`docs/announcements/README.md`](docs/announcements/README.md)
- 技能仓库：[Product Manager Skills](https://github.com/deanpeters/Product-Manager-Skills)
- 历史 prompts 仓库：[Product Manager Prompts](https://github.com/deanpeters/product-manager-prompts)

---

## 这是什么？
**47 个可直接使用的 PM 技能 + 可复用的命令工作流**，它们会同时教会你和你的 AI agents 如何以专业水准完成产品管理工作，让 PM 理解 *why*，让 agent 执行 *how*。
你不再只是说一句 *"Write a PRD"* 然后碰运气，而是你和你的 agent 都会知道：
- 如何组织 PRD 结构，以及每一部分为什么必须存在
- 该问利益相关者哪些问题，以及你真正想听什么
- 哪种优先级框架适合当前情境（以及每种框架什么时候会失效）
- 如何进行客户发现访谈，以及哪些信号真正重要
- 如何用成熟模式拆解 epics，以及每种拆法的权衡

**结果：** 你能以更高的一致性、更快的速度和更强的战略视角工作，而且还能解释为什么。
**适用平台：** Claude Code、Corkboard、OpenAI Codex、ChatGPT、Gemini，以及任何能读取结构化知识的 AI agent。
---

## 设计理念：教学性与实用性同等重要
这个仓库不只是为了给你的 agent 增加技能，它同样承担着**帮助产品经理把本职工作做得更强，并把梯子递给后来者**的职责。
这里的技能同时服务于两个目标：让 AI agent 能以专业水准做 PM 工作，也让人类 PM 理解这个框架背后的 *why*，从而能解释、调整并继续传递。
**ABC - Always Be Coaching** 是关键原则。每个技能都应该让使用它的人在结束时比开始时懂得更多。
这意味着：
- 技能不只给步骤，也解释推理
- 示例不只展示结果，也展示思路
- 反模式会明确指出失败模式，让你在真实场景里能认出来
- 交互式技能是在带你完成 discovery，而不只是收集答案

**如果一次编辑为了让文案更紧而删掉学习脚手架，那就是缺陷，不是改进。**

---

## 60 秒开始？
第一次来？先看 [`START_HERE.md`](START_HERE.md)。
```bash
# Run a skill (artifact/analysis)
./scripts/run-pm.sh skill prioritization-advisor "We have 12 requests and one sprint"

# Run a command (multi-skill workflow)
./scripts/run-pm.sh command discover "Reduce onboarding drop-off for self-serve users"
```

需要先发现合适的 skill？
```bash
./scripts/find-a-skill.sh --keyword onboarding
./scripts/find-a-command.sh --keyword roadmap
```

---

## 为什么要有 Command Layer

Commands 会让使用 skills 更简单，但不会替代 skills。
- Skills 保持深度与教学性：它们依然是框架、推理和质量的事实来源
- Commands 帮你省掉拼接工作：一条 command 就能按正确顺序串起合适的 skills
- 你起步更快：少花时间想“我先跑哪个 skill？”
- 输出更稳定：commands 负责 checkpoint，最后仍回到 skill 级别的严格性
- 团队 onboarding 更快：新用户可以直接运行 `/discover` 或 `/write-prd`，一边交付，一边理解 skill 体系

简而言之：**skills 提供专业能力，commands 提供推进速度。**

---

## Streamlit（beta）
想在把 skills 接入 agent workflow 前，先本地快速试跑一下？

```bash
pip install -r app/requirements.txt
streamlit run app/main.py
```

在 v0.7 中你可以：
- 用 `Learn` 学习安装与集成路径，而不必离开应用
- 用 `Find My Skill` 通过自然语言描述你的情境
- 在确定自己要什么后，用 `Run Skills` 跑自己的场景

这个 beta 界面仍在持续打磨。欢迎通过 [GitHub Issues](https://github.com/deanpeters/Product-Manager-Skills/issues) 或 [LinkedIn](https://linkedin.com/in/deanpeters) 提反馈。
---

## 安全与评估
在使用任何 skill 之前：
- 先读 skill 文件和所有链接资源。如果包含 `scripts/`，运行前先审阅。
- 坚持最小权限。除非文档明确要求，否则 skill 不应依赖 secrets 或网络访问。
- 用真实 prompt 做一次快速 dry run，再回头微调 `name` 和 `description`，提升可发现性。
- 如果准备打包发布，可先运行 `python3 scripts/check-skill-triggers.py --show-cases` 做一次 trigger-readiness 快速检查。
---

## Optional Scripts（确定性辅助工具）

有些 skill 会带一个 `scripts/` 文件夹，里面放的是用于计算或格式化的确定性辅助工具。它们是可选的，运行前应先审阅，并尽量避免网络调用或外部依赖。
**示例：**
- `skills/tam-sam-som-calculator/scripts/market-sizing.py`
- `skills/user-story/scripts/user-story-template.py`

---

## Skill 创建工具

**想自己创建 skills？** 可以用这些工具：

- `scripts/add-a-skill.sh` - 内容优先，基于笔记/框架做 AI 辅助生成
- `scripts/build-a-skill.sh` - 引导式“build-a-bear”向导，按 section 逐步构建
- `scripts/find-a-skill.sh` - 按 name / type / keyword 搜索 skill，并给出排序结果
- `scripts/find-a-command.sh` - 按 name / keyword / used skills 搜索 command
- `scripts/run-pm.sh` - 快速运行 skill 或 command
- `scripts/test-a-skill.sh` - 执行严格一致性校验和可选 smoke check
- `scripts/check-skill-triggers.py` - 审核 frontmatter 描述中 scenario prompt 是否更利于 Claude 风格触发
- `scripts/test-library.sh` - 校验 skills、commands，并重新生成 catalogs
- `scripts/zip-a-skill.sh` - 按 skill、type 或全部技能打包可上传 `.zip`
- `scripts/generate-catalog.py` - 重新生成 skill / command 导航索引

**刚接触终端？** 看 [`scripts/README.md`](scripts/README.md)，里面有通俗版说明。
**高级用户：** 这些脚本可以串成完整高速流程（idea -> prompt -> validation -> packaging）。
**它能做什么：**
1. 分析你的内容并建议适合的 skill 类型
2. 生成完整 skill 文件和示例
3. 校验 metadata 是否符合 marketplace 要求
4. 自动更新文档。

**用法：**
```bash
# From a file
./scripts/add-a-skill.sh research/your-framework.md

# Guided wizard
./scripts/build-a-skill.sh

# Find a skill
./scripts/find-a-skill.sh --keyword pricing --type interactive

# Find a command
./scripts/find-a-command.sh --keyword roadmap

# Run a command workflow
./scripts/run-pm.sh command write-prd "Mobile onboarding redesign"

# Test one skill
./scripts/test-a-skill.sh --skill finance-based-pricing-advisor --smoke

# Test full library surface
./scripts/test-library.sh

# Build Claude upload zip for one skill
./scripts/zip-a-skill.sh --skill finance-based-pricing-advisor

# Build Claude upload zips for all skills
./scripts/zip-a-skill.sh --all --output dist/skill-zips

# Build Claude upload zips for one category (component|interactive|workflow)
./scripts/zip-a-skill.sh --type component --output dist/skill-zips

# Build curated starter pack
./scripts/zip-a-skill.sh --preset core-pm --output dist/skill-zips

# Show available curated presets
./scripts/zip-a-skill.sh --list-presets

# From clipboard
pbpaste | ./scripts/add-a-skill.sh

# Check available adapters
./scripts/add-a-skill.sh --list-agents
```

**Agent 支持：** Claude Code、Manual mode（适用于任意 CLI），以及通过 `scripts/adapters/ADAPTER_TEMPLATE.sh` 自定义 adapter
**了解更多：** 完整说明见 [`docs/Add-a-Skill Utility Guide.md`](docs/Add-a-Skill%20Utility%20Guide.md)
**本地 clone：** 从 [`docs/Building PM Skills.md#local-clone-quickstart`](docs/Building%20PM%20Skills.md#local-clone-quickstart) 开始
---

## Claude Web 上传检查清单
- frontmatter 中的 `name` 保持 <= 64 字符，`description` 保持 <= 200 字符
- 用 `intent` 承担面向仓库的更丰富说明，同时保持 `description` 简短、偏 trigger-oriented
- skill 文件夹名应与 `name` 值一致
- 使用 `scripts/zip-a-skill.sh --skill <skill-name>`（或 `--type component`、`--preset core-pm`）生成可直接上传的 ZIP
- （高级）如果你需要解压后的可上传目录，可以用 `scripts/package-claude-skills.sh`
- 用 `scripts/check-skill-metadata.py` 校验 metadata
- GitHub ZIP 上传流程见 [`docs/Using PM Skills with Claude.md`](docs/Using%20PM%20Skills%20with%20Claude.md#github-zip-install)

---

## 三层架构：这些 Skills 如何协同工作

这 47 个 skill 被组织成**三种类型**，彼此递进：
```text
┌─────────────────────────────────────────────────────────────┐
│ WORKFLOW SKILLS (6)                                         │
│ Complete end-to-end PM processes                            │
│ Example: "Run a product strategy session"                   │
│ Timeline: 2-4 weeks                                         │
├─────────────────────────────────────────────────────────────┤
│                      orchestrates                           │
├─────────────────────────────────────────────────────────────┤
│ INTERACTIVE SKILLS (20)                                     │
│ Guided discovery with adaptive questions                    │
│ Example: "Which prioritization framework should I use?"     │
│ Timeline: 30-90 minutes                                     │
├─────────────────────────────────────────────────────────────┤
│                      uses                                   │
├─────────────────────────────────────────────────────────────┤
│ COMPONENT SKILLS (21)                                       │
│ Templates for specific PM deliverables                      │
│ Example: "Write a user story"                               │
│ Timeline: 10-30 minutes                                     │
└─────────────────────────────────────────────────────────────┘
```

### Component Skills (21) - 模板与产物
**定义：** 用于创建具体 PM 交付物的可复用模板（user stories、positioning statements、epics、personas、PRD 等）。
**什么时候用：** 当你需要某个具体交付物的标准模板或格式时。
**示例：** “写一个带 acceptance criteria 的 user story” -> 使用 [`user-story.md`](skills/user-story/SKILL.md)

---

### Interactive Skills (20) - 引导式发现
**定义：** 多轮对话流程，AI 会先问你 3-5 个自适应问题，再根据你的上下文给出更聪明的建议。
**什么时候用：** 当你需要先判断该走哪条路，或先收集上下文再执行时。
**示例：** “我该用哪种 prioritization framework？” -> 运行 [`prioritization-advisor.md`](skills/prioritization-advisor/SKILL.md)，它会询问你的产品阶段、团队规模、数据可用性，然后推荐 RICE、ICE、Kano 或其他框架。
**它们怎么工作：**
1. AI 先问 3-5 个关于你情境的问题
2. 你回答（或从编号选项中选择）
3. AI 给出 3-5 个定制建议
4. 你选择其中一个（或组合多个）
5. AI 再调用合适的 component skills 执行

---

### Workflow Skills (6) - 端到端流程
**定义：** 在几天或几周内，编排多个 component 和 interactive skills 的完整 PM 流程。
**什么时候用：** 当你需要从头到尾跑完整 PM workflow 时，例如 strategy session、discovery cycle、roadmap planning、PRD creation。
**示例：** “让利益相关者在产品战略上对齐” -> 运行 [`product-strategy-session.md`](skills/product-strategy-session/SKILL.md)，它会在 2-4 周内引导你完成 positioning -> problem framing -> solution exploration -> roadmap planning。
---

## 全部 47 个 Skills（可点击）既然你已经理解了三种类型，下面是完整目录：

### 组件技能 (21)

| 技能 | 适用场景 |
|-------|----------|
| **[altitude-horizon-framework](skills/altitude-horizon-framework/SKILL.md)** | 理解从 PM 到 Director 的心智转变：altitude（范围）、horizon（时间）、四个过渡区、失败模式与级联上下文图。基于 [The Product Porch E42](https://the-product-porch-43ca35c0.simplecast.com/episodes/from-product-manager-to-director-how-to-make-the-shift-part-1) |
| **[company-research](skills/company-research/SKILL.md)** | 深入分析竞品或公司 |
| **[customer-journey-map](skills/customer-journey-map/SKILL.md)** | 按全部触点绘制客户体验地图（NNGroup 框架） |
| **[eol-message](skills/eol-message/SKILL.md)** | 平稳沟通产品/功能下线 |
| **[epic-hypothesis](skills/epic-hypothesis/SKILL.md)** | 把模糊的 initiative 变成带成功指标的可测试假设 |
| **[finance-metrics-quickref](skills/finance-metrics-quickref/SKILL.md)** | 快速查询 32+ 个 SaaS 财务指标，包括公式、基准和使用场景 |
| **[jobs-to-be-done](skills/jobs-to-be-done/SKILL.md)** | 理解客户真正想完成什么（JTBD 框架） |
| **[pestel-analysis](skills/pestel-analysis/SKILL.md)** | 分析外部因素（Political、Economic、Social、Tech、Environmental、Legal） |
| **[pol-probe](skills/pol-probe/SKILL.md)** | 在正式开发前，用轻量、可丢弃的验证实验测试假设（Dean Peters 的 PoL 框架） |
| **[positioning-statement](skills/positioning-statement/SKILL.md)** | 定义服务对象、解决的问题以及差异化（Geoffrey Moore 框架） |
| **[press-release](skills/press-release/SKILL.md)** | 用未来新闻稿澄清产品愿景（Amazon Working Backwards） |
| **[problem-statement](skills/problem-statement/SKILL.md)** | 在跳向方案前，先用证据框定客户问题 |
| **[product-sense-interview-answer](skills/product-sense-interview-answer/SKILL.md)** | 组织 spoken product-sense 回答，包括假设、分群、痛点优先级和 MVP 权衡 |
| **[proto-persona](skills/proto-persona/SKILL.md)** | 在完整研究前先做基于假设的 persona |
| **[recommendation-canvas](skills/recommendation-canvas/SKILL.md)** | 记录 AI 驱动的产品建议 |
| **[saas-economics-efficiency-metrics](skills/saas-economics-efficiency-metrics/SKILL.md)** | 评估单位经济与资本效率（CAC、LTV、payback、margins、burn rate、Rule of 40、magic number） |
| **[saas-revenue-growth-metrics](skills/saas-revenue-growth-metrics/SKILL.md)** | 计算并解释收入、留存与增长指标（revenue、ARPU、MRR/ARR、churn、NRR、expansion） |
| **[storyboard](skills/storyboard/SKILL.md)** | 用 6 格格式 storyboard 可视化用户旅程 |
| **[user-story](skills/user-story/SKILL.md)** | 写出带 acceptance criteria 的标准 user story（Mike Cohn + Gherkin） |
| **[user-story-mapping](skills/user-story-mapping/SKILL.md)** | 按用户 workflow 组织 stories（Jeff Patton 框架） |
| **[user-story-splitting](skills/user-story-splitting/SKILL.md)** | 用 8 种成熟模式拆解大 story |

---

### 交互技能 (20)

| 技能 | 它做什么 |
|-------|----------|
| **[acquisition-channel-advisor](skills/acquisition-channel-advisor/SKILL.md)** | 通过单位经济、客户质量和可扩展性评估获客渠道，并给出 scale / test / kill 建议 |
| **[ai-shaped-readiness-advisor](skills/ai-shaped-readiness-advisor/SKILL.md)** | 判断你现在是 “AI-first”（自动化任务）还是 “AI-shaped”（重构工作方式），评估 5 项能力，并建议优先建设哪一项 |
| **[business-health-diagnostic](skills/business-health-diagnostic/SKILL.md)** | 用关键指标诊断 SaaS 业务健康状况，识别红旗并排优先级，覆盖增长、留存、效率与资本健康 |
| **[context-engineering-advisor](skills/context-engineering-advisor/SKILL.md)** | 诊断 context stuffing（堆量但无意图）与 context engineering（为注意力做结构）的区别，指导 memory 架构、retrieval 策略，以及 Research -> Plan -> Reset -> Implement 循环 |
| **[customer-journey-mapping-workshop](skills/customer-journey-mapping-workshop/SKILL.md)** | 引导旅程映射，并帮助识别痛点 |
| **[director-readiness-advisor](skills/director-readiness-advisor/SKILL.md)** | 指导 PM 和新 Director 在四类情境中的转型：准备中、面试中、刚上任、再校准。基于 [The Product Porch E42](https://the-product-porch-43ca35c0.simplecast.com/episodes/from-product-manager-to-director-how-to-make-the-shift-part-1) |
| **[discovery-interview-prep](skills/discovery-interview-prep/SKILL.md)** | 按你的研究目标规划客户访谈（Mom Test 风格） |
| **[epic-breakdown-advisor](skills/epic-breakdown-advisor/SKILL.md)** | 用 Richard Lawrence 的 9 种模式把 epic 拆成 user stories |
| **[feature-investment-advisor](skills/feature-investment-advisor/SKILL.md)** | 从收入影响、成本结构、ROI 和战略价值出发评估功能投资，并给出 build / don't build 建议 |
| **[finance-based-pricing-advisor](skills/finance-based-pricing-advisor/SKILL.md)** | 从 ARPU/ARPA、转化、流失风险、NRR、回本周期角度评估定价变化 |
| **[lean-ux-canvas](skills/lean-ux-canvas/SKILL.md)** | 帮你建立假设驱动规划（Jeff Gothelf Lean UX Canvas v2） |
| **[opportunity-solution-tree](skills/opportunity-solution-tree/SKILL.md)** | 生成 opportunities 和 solutions，并推荐最值得测试的 proof-of-concept |
| **[pol-probe-advisor](skills/pol-probe-advisor/SKILL.md)** | 根据你的假设与风险，在 5 种 prototype 类型中推荐最合适的一种（Feasibility、Task-Focused、Narrative、Synthetic Data、Vibe-Coded） |
| **[positioning-workshop](skills/positioning-workshop/SKILL.md)** | 通过自适应提问引导你完成产品定位 |
| **[prioritization-advisor](skills/prioritization-advisor/SKILL.md)** | 为你的情境推荐合适的优先级框架（RICE、ICE、Kano 等） |
| **[problem-framing-canvas](skills/problem-framing-canvas/SKILL.md)** | 带你走完 MITRE Problem Framing（Look Inward / Outward / Reframe） |
| **[tam-sam-som-calculator](skills/tam-sam-som-calculator/SKILL.md)** | 基于真实世界数据与引用估算 TAM/SAM/SOM |
| **[user-story-mapping-workshop](skills/user-story-mapping-workshop/SKILL.md)** | 带你完成含 backbone 与 release slices 的 story map |
| **[vp-cpo-readiness-advisor](skills/vp-cpo-readiness-advisor/SKILL.md)** | 指导 Director 与高层管理者完成 VP/CPO 转型，其中包括接受职位前的 CEO 面试框架。基于 [The Product Porch E43](https://the-product-porch-43ca35c0.simplecast.com/episodes/becoming-a-vp-cpo-leading-product-at-the-executive-level-part-2) |
| **[workshop-facilitation](skills/workshop-facilitation/SKILL.md)** | 为 workshop skills 增加一步一步的 facilitation 与编号建议 |

---

### 工作流技能 (6)

| 技能 | 它做什么 | 时间跨度 |
|-------|----------|----------|
| **[discovery-process](skills/discovery-process/SKILL.md)** | 完整 discovery 周期：frame problem -> research -> synthesize -> validate solutions | 3-4 周 |
| **[executive-onboarding-playbook](skills/executive-onboarding-playbook/SKILL.md)** | 面向 VP/CPO 转型的 30-60-90 天诊断式剧本：先诊断再行动、挖出未写明的战略、评估团队、基于证据行动。基于 [The Product Porch E43](https://the-product-porch-43ca35c0.simplecast.com/episodes/becoming-a-vp-cpo-leading-product-at-the-executive-level-part-2) | 90 天 |
| **[prd-development](skills/prd-development/SKILL.md)** | 结构化 PRD：problem statement -> personas -> solution -> metrics -> user stories | 2-4 天 |
| **[product-strategy-session](skills/product-strategy-session/SKILL.md)** | 完整策略流程：positioning -> problem framing -> solution exploration -> roadmap | 2-4 周 |
| **[roadmap-planning](skills/roadmap-planning/SKILL.md)** | 战略 roadmap：gather inputs -> define epics -> prioritize -> sequence -> communicate | 1-2 周 |
| **[skill-authoring-workflow](skills/skill-authoring-workflow/SKILL.md)** | 完整 workflow：choose add/build path -> validate conformance -> update docs -> package/publish | 30-90 分钟 |

<a id="future-skills"></a>
### 未来的 Agent Skills

**_可能正在规划中的 skills：_**

- **Dangerous Animals of Product Management** - 当你面对 HiPPO、RHiNO、WoLF 这类对象时，用于功能绑架谈判和利益相关者穿针外交。
- **Pricing for Product Managers** - 围绕价值定价、包装策略、涨价和 grandfather clause 谈判的 PM 定价技能。
- **Classic Business Strategy Frameworks** - 把 Ansoff、BCG、Porter's 5 Forces、Blue Ocean、SWOT 做成 agent-ready 形式，帮助你做决策，而不是装饰 slide。
- **Storytelling for Product Managers** - 把叙事弧线、demo 编排和 pitch 结构转成 PM 可用的 storytelling skill。
- **Prompt Building for Product Managers** - 工业级 prompt engineering，包括 team session starter、多轮 workflow wizard 以及面向 PRD 等产物的逆向模板。
- **Nightmares of Product Management** - 当事情失控时，帮助你处理 adoption theater、feature graveyard、指标操纵、launch amnesia、技术债务火海等场景。

更详细的概念说明见 [`PLANS.md`](PLANS.md#future-skill-candidates)。

---

## 怎么使用

**被各种安装选项搞糊涂了？** 先看 [PM Skills Rule-of-Thumb Guide](docs/PM%20Skills%20Rule-of-Thumb%20Guide.md)。

### 最快路径（本地 Repo）
```bash
# Skill mode
./scripts/run-pm.sh skill user-story "Checkout improvements for returning customers"

# Command mode
./scripts/run-pm.sh command plan-roadmap "Q3-Q4 roadmap for enterprise reporting"
```

Command 定义在 [`commands/`](commands/README.md) 中，自动生成的浏览索引在 [`catalog/`](catalog/README.md) 中。

### 与 Claude Desktop 或 Claude.ai 一起使用
1. 打开一个 Claude 对话
2. 分享 skill 文件："Read user-story.md"
3. 让 Claude 应用它："Using the User Story skill, write stories for our checkout flow"

### 与 Claude Code（CLI）一起使用
```bash
cd product-manager-skills
claude "Using the PRD Development workflow, create a PRD for our mobile feature"
```

你也可以通过 `npx skills find <query>` 和 `npx skills add deanpeters/Product-Manager-Skills --list` 来发现并安装到 Claude Code。见 [Using PM Skills with Claude](docs/Using%20PM%20Skills%20with%20Claude.md)。

### 与 OpenAI Codex 一起使用
你可以用本地 workspace 路径、接入 GitHub 的 ChatGPT Codex，或通过 `npx skills` 直接发现和安装。见 [Using PM Skills with Codex](docs/Using%20PM%20Skills%20with%20Codex.md)。

### 与 ChatGPT 一起使用
可以用 GitHub app 连接（旧称 connectors）、Custom GPT Knowledge 上传，或 Project 文件方式。见 [Using PM Skills with ChatGPT](docs/Using%20PM%20Skills%20with%20ChatGPT.md)。

### 与 Cowork 或其他 Agents 一起使用
**Cowork：** 把 skills 作为知识模块导入，并通过自然语言调用。
**其他 agents：** 按你的 agent 文档来加载自定义知识。

---

## 文档

- **[Using PM Skills 101](docs/Using%20PM%20Skills%20101.md)** - 面向 PM 的新手友好说明，避免技术负担过重
- **[Using PM Skills with Claude](docs/Using%20PM%20Skills%20with%20Claude.md)** - Claude Code 用法，以及 Claude Desktop/Web 的 GitHub ZIP 上传步骤
- **[Using PM Skills with Codex](docs/Using%20PM%20Skills%20with%20Codex.md)** - 本地 workspace 用法，以及接入 GitHub 的 ChatGPT Codex
- **[Using PM Skills with ChatGPT](docs/Using%20PM%20Skills%20with%20ChatGPT.md)** - GitHub app 连接、Custom GPT Knowledge 设置，以及基于 Project 的用法
- **[Platform Guides for PMs](docs/Platform%20Guides%20for%20PMs.md)** - 按工具选择的安装入口，覆盖 Claude Code、Codex、OpenClaw、Cowork、Claude Desktop、ChatGPT Desktop、n8n、LangFlow 和 Python agents
- **[Using PM Skills with Claude Code](docs/Using%20PM%20Skills%20with%20Claude%20Code.md)** - 面向 PM 的 Claude Code 快速上手
- **[Using PM Skills with Slash Commands 101](docs/Using%20PM%20Skills%20with%20Slash%20Commands%20101.md)** - 把 PM skills 做成可复用的 Claude slash commands，例如 `/pm-story` 和 `/pm-prd`
- **[Using PM Skills with Claude Desktop](docs/Using%20PM%20Skills%20with%20Claude%20Desktop.md)** - 面向非技术桌面用户的 skill 上传流程
- **[Using PM Skills with ChatGPT Desktop](docs/Using%20PM%20Skills%20with%20ChatGPT%20Desktop.md)** - 以 Project 为中心的桌面工作流
- **[Using PM Skills with n8n](docs/Using%20PM%20Skills%20with%20n8n.md)** - 可复用 PM 自动化的实战模式
- **[Using PM Skills with LangFlow](docs/Using%20PM%20Skills%20with%20LangFlow.md)** - 使用 skill-guided prompt template 的可视化 workflow 设置
- **Additional harness guides:** [Cursor](docs/Using%20PM%20Skills%20with%20Cursor.md), [Windsurf](docs/Using%20PM%20Skills%20with%20Windsurf.md), [Bolt](docs/Using%20PM%20Skills%20with%20Bolt.md), [Replit Agent](docs/Using%20PM%20Skills%20with%20Replit%20Agent.md), [Make.com](docs/Using%20PM%20Skills%20with%20Make.com.md), [Devin](docs/Using%20PM%20Skills%20with%20Devin.md), [CrewAI](docs/Using%20PM%20Skills%20with%20CrewAI.md), [Gemini](docs/Using%20PM%20Skills%20with%20Gemini.md)
- **[Start Here](START_HERE.md)** - 一页式“现在就这么做”入门
- **[Commands](commands/README.md)** - Command 格式、命令列表、校验与发现方式
- **[Catalog Artifacts](catalog/README.md)** - 自动生成的 skill / command 索引，方便快速导航
- **[PM Skills Rule-of-Thumb Guide](docs/PM%20Skills%20Rule-of-Thumb%20Guide.md)** - 面向非技术用户的安装决策说明（本地 repo、ZIP、app 连接）
- **[Marketplace Strategy](MARKETPLACE_STRATEGY.md)** - 面向 PM 的 marketplace 分发策略
- **[Marketplace Submission Runbook](docs/Marketplace%20Submission%20Runbook.md)** - 面向非技术团队的分步提交流程
- **[Marketplace Issue Templates](docs/Marketplace%20Issue%20Templates.md)** - 可复用的 marketplace issue 模板File: Product-Manager-Skills-中文/README.md [chunk 4/4]
Rules:
- Only improve Chinese translation coverage in documentation.
- Keep required English technical terms when translating them would break meaning.
- Preserve formatting exactly.
- If the file is already properly translated, return it unchanged.

Document content:
- **[PM 工具操作宪章](docs/PM%20Tooling%20Operations%20Charter.md)** - 面向 M365 Copilot、Codex、ChatGPT、VS Code/Copilot、Cursor、n8n、Lovable 的教学型工具操作指南
- **[添加技能实用指南](docs/Add-a-Skill%20Utility%20Guide.md)** - 生成与校验新技能的完整自动化指南
- **[构建 PM 技能](docs/Building%20PM%20Skills.md)** - 我们如何将原始材料提炼成 agent-ready 的 PM 技能

---

## 真实使用场景

### “我需要让利益相关者在产品战略上对齐” -> **工作流:** [`product-strategy-session`](skills/product-strategy-session/SKILL.md)，2-4 周，负责从 positioning 编排到 roadmap
### “我需要在开发前先验证一个客户问题” -> **工作流:** [`discovery-process`](skills/discovery-process/SKILL.md)，2-4 周，覆盖访谈 -> 综合 -> 验证
### “我需要在投入开发前快速测试一个假设” -> **交互式:** [`pol-probe-advisor`](skills/pol-probe-advisor/SKILL.md)（推荐最适合的原型类型：Feasibility、Task-Focused、Narrative、Synthetic Data、Vibe-Coded）
 -> **组件:** [`pol-probe`](skills/pol-probe/SKILL.md)（记录验证实验的模板）
### “我想知道我是在战略性地使用 AI，还是只是在提效” -> **交互式:** [`ai-shaped-readiness-advisor`](skills/ai-shaped-readiness-advisor/SKILL.md)（评估 5 项能力：Context Design、Agent Orchestration、Outcome Acceleration、Team-AI Facilitation、Strategic Differentiation）
### “我把整份文档都贴进 AI 里，结果得到很空的回答” -> **交互式:** [`context-engineering-advisor`](skills/context-engineering-advisor/SKILL.md)（诊断 context stuffing 与 engineering 的差异，定义边界，并实施 Research -> Plan -> Reset -> Implement 循环）
### “我需要为一个新功能写 PRD” -> **工作流:** [`prd-development`](skills/prd-development/SKILL.md)，1-4 天，覆盖 problem -> solution -> stories
### “我需要做一个 Q2 roadmap” -> **工作流:** [`roadmap-planning`](skills/roadmap-planning/SKILL.md)，1-2 周，覆盖 epics -> prioritization -> sequencing
### “我需要选择一个 prioritization framework” -> **交互式:** [`prioritization-advisor`](skills/prioritization-advisor/SKILL.md)（通过提问推荐 RICE / ICE / Kano）
### “我需要拆一个很大的 epic” -> **交互式:** [`epic-breakdown-advisor`](skills/epic-breakdown-advisor/SKILL.md)（基于 Richard Lawrence 的 9 种模式）

### “我需要写一个 user story” -> **组件:** [`user-story`](skills/user-story/SKILL.md)（模板 + 示例）
---

## 为什么 Skills 胜过 Prompts

| Prompts | Skills |
|---------|--------|
| 每个任务都要重新写一次指令 | 框架学一次，可反复复用 |
| "Write a PRD for X" | Agent 知道 PRD 结构，会问更聪明的问题，也能处理边界情况 |
| 你要不断重复解释 | Agent 会记住最佳实践 |
| 输出不稳定 | 输出更一致、更专业 |

**Skills = 少解释，多做战略工作。**

---

## 这些 Skills 有什么不一样？
### 经过实战检验的框架
建立在 Geoffrey Moore、Jeff Patton、Teresa Torres、Amazon、Richard Lawrence、MITRE 等成熟方法之上。
### 源于真实客户工作
源于多年在 healthcare、finance、manufacturing 和 tech 场景中的 PM 咨询经验。
### Agent-Ready 格式
不是博客、不是书、不是课程，而是为 AI 理解优化过的**可执行框架**。
### 零废话
每个字都必须有价值。没有填充，没有 buzzword，没有空泛建议。
### 示例丰富
同时给出“好的”和“差的”例子，让你知道什么有效、什么该避开。
---

## Skill 结构（每个文件里有什么）

每个 skill 都遵循同一结构：
```
## 目的
What this skill does and when to use it.

## 关键概念
Core frameworks, definitions, anti-patterns.

## 应用
Step-by-step instructions (with examples).

## 示例
Real-world cases (good and bad).

## 常见陷阱
What to avoid and why.

## 参考
Related skills and external frameworks.
```

**干净、实用、零废话。**

---

## 贡献

发现缺口了？有希望加入的 PM framework？
**可贡献方式：**
- 提一个 issue
- 提交 pull request（我们会帮你整理格式）
- 分享你觉得哪些有效、哪些缺失
详细规则见 [CONTRIBUTING.md](CONTRIBUTING.md)。
---

## 方法论
**原则：**
- **Outcome-driven** 优先于 output-driven（解决问题，而不是只交付功能）
- **Evidence over vibes**（用数据验证，而不是靠感觉）
- **Clarity beats completeness**（简单且可用，胜过全面但混乱）
- **Examples beat explanations**（多展示，少空讲）
**不要 hype，不要 buzzwords，只要真正有效的框架。**

---

## 相关资源

- **[Product Manager Prompts](https://github.com/deanpeters/product-manager-prompts)** - 面向 ChatGPT、Claude、Gemini 的任务型 prompts
- **[Productside](https://productside.com)** - AI 驱动的产品管理培训与咨询
- **[Dean's LinkedIn](https://linkedin.com/in/deanpeters)** - 关于 AI 放大产品工作的文章
---

## License

CC BY-NC-SA 4.0 - 非商业使用，且需 share-alike。
完整内容见 [LICENSE](LICENSE)。
---

## 有问题？

- **GitHub Issues:** [报告 bug 或提出功能建议](https://github.com/deanpeters/Product-Manager-Skills/issues)
- **LinkedIn:** [联系 Dean Peters](https://linkedin.com/in/deanpeters)
- **Productside:** [了解更多 AI PM 咨询](https://productside.com)

---

**v0.78 - 2026 年 4 月 26 日**

本次发布亮点：
- 增加一条命令式发布打包：`./scripts/build-release.sh`
- 增加 Claude Desktop/Web ZIP 包，覆盖 starter、discovery、strategy、delivery、AI PM 和 all-skills 场景
- 增加一个可安装 `.agents/skills` + `AGENTS.md` 的 Codex ZIP
- 增加 GitHub Actions，用于校验、构建、上传产物，并在 `v*` tags 上发布 release assets
- 增加 Claude Desktop/Web、Claude Code、Codex 和 release maintainers 的安装文档
- 更新 README，为“只想直接用这些 skills 的人”提供更清晰的 Start Here 路径

**v0.7 - 2026 年 3 月 9 日**

本次发布亮点：
- 收紧 skill descriptions，让它们同时表达“它做什么”和“什么时候该用”
- 增加 `intent` 作为 repo 标准 frontmatter 字段，把触发型 metadata 和更深层目的分开
- 增加 `scripts/check-skill-triggers.py`，并把 trigger-readiness 审计接入 `test-library.sh`
- 增加 `find-a-skill.sh --mode trigger`，支持通过 `description`、`best_for` 和 `scenarios` 来发现 skills
- 增加 Streamlit (beta) `Find My Skill` 模式，支持用自然语言发现 skill、优先推荐结果，以及直接预览 / 运行
- 更新编写文档与模板，让更强的 metadata 标准能够持续下去

**v0.65 - 2026 年 3 月 8 日**

本次发布亮点：
- 增加完整的 PM-first onboarding 与 setup 指南：`docs/Using PM Skills 101.md`
- 增加平台选择器：`docs/Platform Guides for PMs.md`
- 增加 slash-command playbook：`docs/Using PM Skills with Slash Commands 101.md`
- 增加并链接 Claude Code/Desktop/Cowork、ChatGPT Desktop、OpenClaw、n8n、LangFlow 和 Python agents 的实用平台文档
- 更新 `START_HERE.md` 与文档导航，让新用户更快选对安装路径

**v0.6 - 2026 年 3 月 6 日**

本次发布亮点：
- 增加 `commands/`，作为本地 skills 之上的可复用 workflow wrapper（`discover`、`strategy`、`write-prd`、`plan-roadmap`、`prioritize`、`leadership-transition`）
- 增加 `START_HERE.md`，用于 60 秒 onboarding
- 增加自动生成的 `catalog/` 产物，用于快速导航 skills 与 commands
- 增加发现 / 校验 / 执行工具：`find-a-command.sh`、`run-pm.sh`、`check-command-metadata.py`、`test-library.sh`、`generate-catalog.py`

**v0.5 - 2026 年 2 月 27 日**

本次发布亮点：
- 增加 4 个 Career & Leadership skills，提炼自 The Product Porch 中关于 PM -> Director 和 Director -> VP/CPO 转型的节目
- 在 `app/` 中发布 Streamlit (beta) 本地 playground，支持多 provider / model 选择
- 改进 beta app 的 workflow UX：phase detection、显式 run 控制、每个 phase 的输出跟踪
**v0.4 - 2026 年 2 月 10 日**

本次发布亮点：
- 修复 facilitation protocol 回归问题，此前过度追求简洁的改写可能移除预期的引导式提问行为
- 将 `workshop-facilitation` 提升为 interactive facilitation 的规范 source of truth
- 增加一致的开场 heads-up、context-dump bypass 路径和 best-guess mode
- 将 protocol linkage 应用于所有 interactive skills 和 facilitation-heavy workflow skills

**v0.3 - 2026 年 2 月 9 日**

本次发布亮点：
- 共 42 个 skills，包括 Phase 7 finance skills 和新的 `skill-authoring-workflow`
- 新增 skill 工具链：`add-a-skill`、`build-a-skill`、`find-a-skill`、`test-a-skill`、`zip-a-skill`
- 增加 Claude、Codex、ChatGPT 以及面向非技术用户的 “rule-of-thumb” 安装文档

Built by Dean Peters (Principal Consultant and Trainer at Productside.com) with Anthropic Claude and OpenAI Codex.

*Helping product managers work smarter with AI.*