# Product Manager Skills - 开发路线图

**最后更新：** 2026-03-06  
**状态：** 阶段1已完成 | 阶段2已完成 | 阶段3已完成 | 阶段4已完成 | 阶段5已完成 | 阶段6已完成 | 阶段7计划中  
**版本：** v0.6（发布于 2026 年 3 月 6 日）

---

## v0.6 导航 + Commands 计划（分阶段）

目标：当这个仓库增长到 60 多个 skills 时，仍然尽可能易于导航和运行，并且不引入插件。

### 阶段1：操作模型（已完成）
- [x] 保持当前架构：`skills/<skill-name>/SKILL.md` 继续作为核心库。
- [x] 保留本地 skill 子类型：`component`、`interactive`、`workflow`。
- [x] 在现有 skills 之上增加 command 架构，作为编排包装器。

退出标准：
- 存在一个 `commands/` 目录，且其中的 command 定义会引用现有 skills。

### 阶段2：导航系统（已完成）
- [x] 为 skills 和 commands 增加自动生成的目录产物。
- [x] 增加快速浏览页（`catalog/skills-by-type.md`、`catalog/commands.md`）。
- [x] 增加 command 发现脚本（`scripts/find-a-command.sh`）。

退出标准：
- 用户可以按类型浏览，并在终端中搜索 skills / commands。

### 阶段3：快速上手（已完成）
- [x] 增加一个单入口快速入门指南（`START_HERE.md`）。
- [x] 增加可直接复制粘贴的“立即开始”使用路径。
- [x] 将快速入门指南接入根目录 README。

退出标准：
- 一个新用户能在 60 秒内跑通一个 skill 或 command。

### 阶段4：Commands v1（已完成）
- [x] 为常见 PM 成果创建高价值 commands（`discover`、`strategy`、`write-prd`、`plan-roadmap`、`prioritize`、`leadership-transition`）。
- [x] 确保每个 command 都包含调用说明、工作流检查点和下一步建议。
- [x] 确保每个 command 只引用本地 skills。

退出标准：
- Command 文件通过元数据 / 引用校验。

### 阶段5：工具 + 校验（已完成）
- [x] 增加 command 元数据验证器（`scripts/check-command-metadata.py`）。
- [x] 增加支持 command 的启动器（`scripts/run-pm.sh`），用于 skill / command 执行脚手架。
- [x] 增加库级测试脚本（`scripts/test-library.sh`）和目录生成器（`scripts/generate-catalog.py`）。

退出标准：
- 一条命令就能校验 skills + commands + 生成出的目录。

### 阶段6：文档整合（已完成）
- [x] 在 README 中增加 skills + commands 的快速入门区块。
- [x] 在平台文档中扩展 command-first 示例。
- [x] 在完成文档清扫后发布 v0.6 发布说明。

退出标准：
- README 与主要使用文档呈现出一条一致的使用路径。

### 阶段7：Streamlit Command 模式（计划中）
- [ ] 为 Streamlit beta 增加 command 浏览 / 执行模式。
- [ ] 展示 command 步骤进度与每步输出。

退出标准：
- Streamlit 用户可以明确地选择运行 skill 或 command。

---

## v0.4 发布

当前状态：42 个 skills，且在交互式与引导式工作流使用中具备标准化的引导行为。

**v0.4 更新：**
- 修复了一个引导行为回归问题：过度追求简洁的改写可能会移除预期的“逐题引导”行为
- 将 `skills/workshop-facilitation/SKILL.md` 设为引导行为的权威来源
- 增加协议特性：开场提醒、上下文转储绕过模式、最佳猜测模式、进度标签和中断处理
- 将这套引导行为权威指导接入所有交互式 skills 以及重引导的工作流 skills
- 由 Codex 诊断并实现了整个仓库的协议修复

---

## v0.3 发布

当前状态：42 个 skills，具备严格的一致性检查和更完整的入门文档。

**v0.3 新增：**
- 增加 `skill-authoring-workflow`（工作流型元技能，用于构建 / 添加 / 验证 / 文档更新流程）
- 增加操作型入门文档：
  - `docs/Using PM Skills with ChatGPT.md`
  - `docs/PM Skills Rule-of-Thumb Guide.md`
  - `docs/PM Tooling Operations Charter.md`
- 为 Claude Desktop/Web 增加更清晰的 GitHub ZIP 安装指引

**基础能力补充（2026-02-08）：**
- 阶段7 Finance 套件（7 个新 skills）
- 自动化工具扩展：`add-a-skill`、`build-a-skill`、`find-a-skill`、`test-a-skill`
- 更严格的元数据与结构一致性校验

> 说明：下面保留了更早期规划快照中的详细阶段表，里面可能仍引用历史文件命名方式。

**最近新增（2026-02-05）：**
- `pol-probe`（组件型）- 用于定义生命迹象验证实验的模板
- `pol-probe-advisor`（交互式）- 用来决定 5 种原型类型中该选哪一种的决策框架
- `ai-shaped-readiness-advisor`（交互式）- 从 5 项能力评估 AI 成熟度（上下文设计、智能体编排、成果加速、团队-AI 引导、战略差异化）
- `context-engineering-advisor`（交互式）- 诊断上下文填充与上下文工程，指导记忆架构、检索策略，以及研究 -> 计划 -> 重置 -> 实施循环

基于 Dean Peters 的 Substack 文章：
- [*Vibe First, Validate Fast, Verify Fit*](https://deanpeters.substack.com/p/vibe-first-validate-fast-verify-fit)
- [*AI-First Is Cute. AI-Shaped Is Survival.*](https://deanpeters.substack.com/p/ai-first-is-cute-ai-shaped-is-survival)
- [*Context Stuffing Is Not Context Engineering*](https://deanpeters.substack.com/p/context-stuffing-is-not-context-engineering)

**重大结构变化（2026-02-05）：**
- 从按类型分目录，重构为按 skill-name 平铺的目录结构
- 所有 skill 文件从 `name.md` 改名为 `SKILL.md`
- 给每个 skill 增加 YAML 前置元数据（name、description、type）
- 更新所有文档以反映新结构

**旧结构：**
```
skills/
├── components/user-story.md
├── interactive/positioning-workshop.md
└── workflows/product-strategy-session.md
```

**新结构（Anthropic 兼容）：**
```
skills/
├── user-story/SKILL.md
├── positioning-workshop/SKILL.md
└── product-strategy-session/SKILL.md
```

**每个 `SKILL.md` 包含：**
```yaml
---
name: skill-name
description: Brief description
type: component|interactive|workflow
---
```

这样就能兼容 `~/.claude/skills/` 目录和标准 Anthropic skills 工具链。

---

<a id="future-skill-candidates"></a>
## 未来 Skill 候选（详细）

这里是 [`README.md`](README.md#future-skills) 中短清单的详细扩展。

### 产品管理中的危险动物
**类型：** 工作流 skill

功能绑架谈判与利益相关方穿梭外交。先判断你面对的是哪种动物（HiPPO、RHiNO、WoLF，等等），再应用对应的遏制、转向或战略撤退战术。有时候，产品管理里最难的不是把东西做出来，而是活过那场每个人都想要不同东西的会议。

### 产品经理定价指南
**类型：** 交互式顾问

帮助你在不陷入恐慌和冷汗的前提下处理定价决策。涵盖价值定价、包装策略、定价页心理学、老用户祖父条款谈判，以及如何在不触发大规模流失的前提下涨价。没有什么比一句“那我们该怎么定价？”更容易让产品经理紧张。

### 经典商业战略框架
**类型：** 组件型 skills 套件

把老派但不过时的战略工具做成智能体就绪形式：Ansoff 矩阵（增长策略）、BCG 矩阵（组合优先级）、波特五力模型（竞争分析）、蓝海战略（无竞争市场空间），以及正确使用的 SWOT。就是那些 MBA 朋友停不下来的框架，只不过这次它们是为了帮助你做决策，而不是装饰幻灯片。

### 产品经理的故事讲述
**类型：** 交互式工作坊

教产品经理如何“带戏”但不“作戏”。涵盖路线图演示的叙事弧线、利益相关方故事讲述模式、演示编排、投资人演讲结构、让人真正感到客户痛点的方法，以及 Hakawati 风格的口头讲述。它建立在职业歌剧经验之上：控场、唱高音、并让观众意犹未尽。

### 产品经理的提示词构建
**类型：** 组件型 skills 套件

工业级提示词工程。包括用于设置上下文和防护栏的团队会话启动器、逐步引导复杂流程的多轮工作流向导，以及把混乱输入反向还原为 PRD 之类产物的模板。因为一次性的提示词属于业余；可复用的提示词系统才属于专业。

### 产品管理的噩梦
**类型：** 交互式诊断

适用于“事情没有按计划发展”的时候。它包括用于发现早期预警信号的遥测、判断严重程度的分诊协议，以及用于遏制与恢复的战术手册。覆盖那些经典噩梦：采用度剧场、功能墓地、指标操纵、发布失忆和技术债野火。还会附带预防策略，避免你成为下一季度恐怖故事的主角。

---

## 总览

这个仓库收录的是从 Dean Peters 的 `product-manager-prompts` 仓库中提炼出来的 PM skills。Skills 被分成三种类型，构成一个三层架构：

```
┌─────────────────────────────────────────┐
│  工作流 Skills                          │
│  (编排多个 skills)                      │
│  例如："product-strategy-session.md"    │
└─────────────────────────────────────────┘
                ↓ 引用
┌─────────────────────────────────────────┐
│  交互式 Skills                          │
│  (多轮提问流程)                         │
│  例如："positioning-workshop.md"        │
└─────────────────────────────────────────┘
                ↓ 使用
┌─────────────────────────────────────────┐
│  组件型 Skills                          │
│  (模板 / 产物)                          │
│  例如："positioning-statement.md"       │
└─────────────────────────────────────────┘
```

---

## Skill 类型说明

### 组件型 Skills
**定义：** 单个交付物或产物（用户故事、史诗、定位陈述、PRD 章节、OKR 等）

**特点：**
- 自包含、可复用的基础构件
- 聚焦“如何把 X 做好”
- 包含模板 + 质量标准 + 示例 + 常见陷阱
- 会被工作流和交互式 skills 引用

**示例：** `user-story.md` - 如何写出合格的用户故事与验收标准

---

### 交互式 Skills
**定义：** 通过连续提问来收集上下文，并给出智能下一步建议的多轮对话流程。

**特点：**
- 一次问一个问题（或少量成组问题）
- 最多限制在 3-5 个问题
- 根据回答来决定后续提问
- 提供**编号式、上下文感知的建议**（3-5 个编号选项）
- 允许用户按数字选择（如 `"1"`、`"2 & 4"`）或给出自定义输入
- 会根据用户选择自适应调整
- 在流程末尾调用组件型 skills

**示例：** `positioning-workshop.md` - 先引导用户完成发现提问，再调用 `positioning-statement.md` 组件生成定位陈述

---

### 工作流 Skills
**定义：** 多步骤流程或框架（发现访谈、路线图规划、利益相关方分析等）

**特点：**
- 编排多个活动
- 引用组件型 skills 与交互式 skills
- 包含决策点与分支逻辑
- 聚焦“如何完成 Y 流程”

**示例：** `product-strategy-session.md` - 引导完成定位 -> 问题陈述 -> 待完成工作 -> 路线图（编排多个组件型与交互式 skills）

---

## 阶段1：核心组件型 Skills（进行中）

**目标：** 构建所有其他 skills 都会引用的原子级构件。

**状态：** Complete = 已完成 | In Progress = 进行中 | Planned = 计划中

| # | Skill | 来源提示词 | 状态 |
|---|-------|--------------|--------|
| 1 | `positioning-statement.md` | `positioning-statement.md` | 已完成 |
| 2 | `problem-statement.md` | `framing-the-problem-statement.md` | 已完成 |
| 3 | `user-story.md` | `user-story-prompt-template.md` | 已完成 |
| 4 | `jobs-to-be-done.md` | `jobs-to-be-done.md` | 已完成 |
| 5 | `proto-persona.md` | `proto-persona-profile.md` | 已完成 |
| 6 | `epic-hypothesis.md` | `backlog-epic-hypothesis.md` | 已完成 |

**理由：** 这 6 个 skill 是基础层。它们被广泛使用、相对成熟，而且会被大多数 PM 产物引用。

---

## 阶段2：扩展型组件型 Skills（计划中）

**目标：** 构建更多支撑性产物，扩展工具箱。

| # | Skill | 来源提示词 | 状态 |
|---|-------|--------------|--------|
| 7 | `press-release.md` | `visionary-press-release.md` | 已完成 |
| 8 | `user-story-splitting.md` | `user-story-splitting-prompt-template.md` | 已完成 |
| 9 | `user-story-mapping.md` | `user-story-mapping.md` | 已完成 |
| 10 | `recommendation-canvas.md` | `recommendation-canvas-template.md` | 已完成 |
| 11 | `storyboard.md` | `storyboard-storytelling-prompt.md` | 已完成 |
| 12 | `eol-message.md` | `eol-for-a-product-message.md` | 已完成 |

---

## 阶段3：研究与分析型组件型 Skills（计划中）

**目标：** 构建更专业、使用频率较低的产物。

| # | Skill | 来源提示词 | 状态 |
|---|-------|--------------|--------|
| 13 | `customer-journey-map.md` | `customer-journey-mapping-prompt-template.md` | 已完成 |
| 14 | `pestel-analysis.md` | `pestel-analysis-prompt-template.md` | 已完成 |
| 15 | `company-research.md` | `company-profile-executive-insights-research.md` | 已完成 |

---

## 阶段4：交互式 Skills（计划中）

**目标：** 构建多轮发现流程，用于收集上下文并调用组件型 skills。

| # | Skill | 用途 | 状态 |
|---|-------|---------|--------|
| 16 | `positioning-workshop.md` | 通过多轮流程发现定位上下文 | 已完成 |
| 17 | `discovery-interview-prep.md` | 指导客户发现访谈准备 | 已完成 |
| 18 | `prioritization-advisor.md` | 基于上下文帮助选择优先级框架 | 已完成 |
| 19 | `tam-sam-som-calculator.md` | 带引用的自适应 TAM/SAM/SOM 估算 | 已完成 |
| 20 | `epic-breakdown-advisor.md` | 指导史诗拆分与故事创建 | 已完成 |
| 21 | `opportunity-solution-tree.md` | 生成机会解决方案树，并完成机会 / 解决方案映射与概念验证选择 | 已完成 |
| 22 | `user-story-mapping-workshop.md` | 引导创建带主干与发布切片的故事地图 | 已完成 |
| 23 | `customer-journey-mapping-workshop.md` | 引导创建包含痛点与机会的客户旅程图 | 已完成 |
| 24 | `problem-framing-canvas.md` | MITRE 问题框架画布（向内看 / 向外看 / 重新框架） | 已完成 |
| 25 | `lean-ux-canvas.md` | Jeff Gothelf 精益用户体验画布 v2（假设驱动规划） | 已完成 |

**说明：** 交互式 skills 应该：
- 最多限制在 3-5 个问题
- 每个决策点提供 3-5 个编号选项
- 支持数字选择、多选或自定义输入
- 对数据驱动型 skill 提供真实世界引用

---

## 阶段5：工作流 Skills（已完成）

**目标：** 把组件型 + 交互式 skills 编排成端到端流程。

| # | Skill | 用途 | 编排对象 | 状态 |
|---|-------|---------|--------------|--------|
| 26 | `product-strategy-session.md` | 端到端产品定位到路线图流程 | 多个组件型 + 交互式 skills | 已完成 |
| 27 | `discovery-process.md` | 从问题到验证的完整发现周期 | 发现、访谈、综合 | 已完成 |
| 28 | `roadmap-planning.md` | 战略路线图制定 | 史诗、OKR、利益相关方映射 | 已完成 |
| 29 | `prd-development.md` | 结构化 PRD 创建流程 | 问题、人物角色、故事、验收标准 | 已完成 |

---

## 暂不转换（降级优先级）

来自 `product-manager-prompts` 的这些提示词**暂不**转成 skills：

- `a-generative-AI-prompt-builder-for-product-professionals.md`（元提示词）
- `Dangerous Animals of Product Management Beast Generator.md`（旧式创意生成器；已被上面更结构化的工作流候选替代）
- `Nightmares of Product Management Movie Title Generator Prompt.md`（娱乐 / 创意用途）
- `futuristic-product-faq.md`（高度垂直）
- `strategic-scrum-team-session-kickoff.md`（工作流，后续可能在阶段5重看）
- `reverse-engineer-IEEE830srs-to-PRD-prompt-template.md`（小众）
- `reverse-engineer-ISO29148-to-PRD-prompt-template.md`（小众）

---

## Skill 依赖图（初稿）

```
positioning-statement.md
├── 引用: problem-statement.md
├── 引用: jobs-to-be-done.md
└── 引用: proto-persona.md

user-story.md
├── 引用: proto-persona.md
└── 引用: problem-statement.md

epic-hypothesis.md
├── 引用: jobs-to-be-done.md
└── 引用: proto-persona.md

user-story-splitting.md
└── 引用: user-story.md

positioning-workshop.md (交互式)
```├── uses: positioning-statement.md
├── uses: proto-persona.md
└── uses: jobs-to-be-done.md

opportunity-solution-tree.md (interactive)
├── uses: problem-statement.md
├── uses: jobs-to-be-done.md
├── uses: epic-hypothesis.md
└── uses: user-story.md

product-strategy-session.md (workflow)
├── uses: positioning-workshop.md
├── uses: problem-statement.md
├── uses: jobs-to-be-done.md
└── uses: roadmap-planning.md
```

---

## 成功标准

### 第一阶段完成条件：
- [ ] 6 个核心 component skills 全部起草完成
- [ ] Skills 遵循 CLAUDE.md 结构（Purpose、Key Concepts、Application、Examples、Pitfalls、References）
- [ ] 相关 skills 之间已增加交叉引用
- [ ] Dean 审核通过质量与深度

### 第二阶段完成条件：
- [ ] 扩展型 component skills 起草完成
- [ ] Skills 能与第一阶段组件集成
- [ ] Story splitting skill 同时适用于 story 与 epic

### 第四阶段完成条件：
- [ ] Interactive skills 使用有边界的多轮流程（3-5 个问题）
- [ ] 每个问题提供编号选项（3-5 个）
- [ ] 能优雅处理数字选择、多选和自定义输入
- [ ] 在 discovery 流程末尾调用 component skills

### 第五阶段完成条件：
- [ ] Workflow skills 能编排 component + interactive skills
- [ ] 决策点与分支逻辑已文档化
- [ ] 端到端流程已通过真实 PM 场景测试

---

## 后续开发说明

### Skill 组合模式
- **Component skills** 不应引用 workflow 或 interactive skills（单向依赖）
- **Interactive skills** 可以引用 component skills，但不能引用 workflow
- **Workflow skills** 可以同时引用 component 与 interactive skills

### 质量标准
- 所有 skill 都必须通过 CLAUDE.md 中的 Quality Checklist：
  - Agent-ready（不需要额外澄清问题）
  - Self-contained（能自己定义术语）
  - Practical（至少有一个具体示例）
  - Opinionated（有明确立场）
  - Skimmable（只看标题和 bullet 就能拿到 80% 的价值）
  - Zero fluff（每个词都必须有价值）

### 需要追踪的 Metadata
- 来源 prompt 文件名
- 创建日期
- 最后更新时间
- 相关 skills（references、used by）
- 被引用的外部框架

---

## 时间线（理想版）

- **第一阶段：** 2026 年 2 月（6 个 skills）- 已完成
- **第二阶段：** 2026 年 3 月（6 个 skills）- 已完成
- **第三阶段：** 2026 年 4 月（3 个 skills）- 已完成
- **第四阶段：** 2026 年 5 月（10 个 interactive skills）- 已完成
- **第五阶段：** 2026 年 6 月起（4 个 workflow skills）- 已完成
- **第六阶段：** 未来（AI PM Orchestrator Skills）

---

## 第六阶段：AI PM Orchestrator Skills（未来）

**目标：** 为 Teresa Torres 框架与《Context Engineering for Product Managers》研究中识别出的剩余 AI PM 学科构建 skills。

**状态：** Planned（尚未开始）

**背景：** 这份综合研究识别出 **5 个关键 AI PM 学科**：
1. **Context Engineering** - 已完成（`context-engineering-advisor`）
2. **Orchestration** - 把复杂目标拆成 agentic workflows
3. **Observability** - 通过 tracing 与 logging 调试 AI 推理
4. **Evals（Evaluation）** - 为 AI 输出建立自动化质量测试
5. **Maintenance** - 随模型漂移持续维护

### 计划中的 Skills（按优先级排序）

| # | Skill | Type | Purpose | Priority |
|---|-------|------|---------|----------|
| 34 | `agent-orchestration-advisor` | Interactive | 指导 PM 把复杂任务拆成多步 agentic workflow（research -> synthesis -> critique -> decision） | High |
| 35 | `ai-product-evals` | Component | 设计评估框架的模板（Golden Datasets、Code Assertions、LLM-as-Judge、Human Evals） | High |
| 36 | `ai-observability-framework` | Component | 在 AI 产品中实现 tracing、logging 与错误分析的指南 | Medium |
| 37 | `ai-maintenance-planning` | Component | 规划模型漂移或用户数据变化后持续更新的模板 | Medium |
| 38 | `ai-product-orchestrator` | Workflow | 完整端到端流程：Discovery -> Context Design -> Orchestration -> Evals -> Maintenance（2-4 周） | Low |

### 优先级理由

**高优先级（Orchestration + Evals）：**
- **Orchestration** 是 Context Engineering 的直接补足（如何组织多步 AI workflow）
- **Evals** 对生产级 AI 产品至关重要（质量衡量）
- 这两者都是当前在构建 AI 功能的 PM 的即时需求

**中优先级（Observability + Maintenance）：**
- **Observability** 更技术一些，但能帮助 PM 调试 AI 系统
- **Maintenance** 偏长期问题（处理数月尺度上的模型漂移）
- 两者都服务于上线后的运营质量

**低优先级（Workflow）：**
- **AI Product Orchestrator** workflow 应该等到 component / interactive skills 被充分打磨后再做
- 它会把这 5 个学科统一编排成完整流程

### 依赖关系

```
context-engineering-advisor (Complete)
    -> enables
agent-orchestration-advisor (Planned)
    -> requires
ai-product-evals (Planned)
    -> supported by
ai-observability-framework (Planned)
    -> maintained via
ai-maintenance-planning (Planned)
    -> all orchestrated by
ai-product-orchestrator (Planned, workflow)
```

### 来源材料

所有第六阶段 skills 都将基于：
- **研究文档：** `/research/Context Engineering for Product Managers.md`
- **Teresa Torres：** *Continuous Discovery Habits*（5 项 AI PM 学科）
- **Marty Cagan：** *Empowered*（AI 时代的 4 大风险）
- **Google / Anthropic：** 关于 context engineering、RAG、memory systems 的技术白皮书

### 备注

- **Agent Orchestration** 与 `ai-shaped-readiness-advisor` 的能力 #2（Agent Orchestration maturity levels）关系很近
- **Evals** 框架会连接到 `pol-probe-advisor`（验证实验）和 `discovery-process`（质量衡量）
- **Observability** 与 **Maintenance** 更偏技术，但对生产级 AI 产品来说是必须项

---

**准备提炼。**