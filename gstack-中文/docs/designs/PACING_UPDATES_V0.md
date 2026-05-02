# Pacing Updates v0 - 设计文档

**状态：** V1.1 计划（尚未实现）。
**提取自：** 在实现过程中，从 [PLAN_TUNING_V1.md](./PLAN_TUNING_V1.md) 中拆出；当时的评审强度已经证明，pacing 这条工作流存在无法靠修改计划文本修补的结构性缺口。
**作者：** Garry Tan（用户），并结合 Claude Opus 4.7 + OpenAI Codex gpt-5.4 的 AI 辅助评审。
**评审计划：** CEO + Codex + DX + Eng 循环，与 V1 使用相同强度。

## 致谢

这个计划的存在要归功于 **[Louise de Sadeleer](https://x.com/LouiseDSadeleer/status/2045139351227478199)**。她在架构评审里说的 “yes yes yes”，并不只是指术语太多（这部分 V1 已处理），更关乎节奏与主导权。评审过程中，打断式决策太多，而且持续太久。V1.1 处理的是其中 “节奏” 这一半。

## 问题

Louise 阅读 gstack review 输出时的疲劳感，来自两个来源：

1.  **术语密度** - 技术术语出现时没有解释。*V1 已处理（ELI10 写法）。*
2.  **打断次数** - `/autoplan` 会运行 4 个阶段（CEO + Design + Eng + DX），每个阶段有 5-10 个 AskUserQuestion 提示。总计大约会出现 30-40 次提示，持续约 45 分钟。非技术用户在大约 10-15 次打断后就会失去耐心。**这正是 V1.1 要解决的。**

单纯翻译并不能解决打断太多的问题。被翻译过的打断，本质上仍然是打断。真正的修复要改变的是**什么时候**把发现抛给用户，而不只是**怎么措辞**。

## 为什么要拆出来（来自 V1 第三轮 eng review + Codex 第二轮评审发现的结构缺口）

在 V1 规划期间，原本已经草拟过一条 pacing 工作流：对 findings 排序、自动接受 two-way doors、每个 review phase 最多 3 个 AskUserQuestion 提示、为自动接受项增加 Silent Decisions 区块，以及 `flip <id>` 命令让用户事后重新打开已自动接受的决策。结果第三轮 eng-review 与第二轮 Codex review 暴露出 10 个无法靠计划文本修正的缺口：

1.  **会话状态模型未定义。** Pacing 需要按 phase 记录状态，比如哪些 findings 已展示、哪些被自动接受、哪些允许用户 flip。V1 里只有用于 glossing 的 per-skill-invocation state，并没有能承载 per-phase pacing memory 的 backing store。
2.  **question-log 缺少 phase 标识符。** Silent Eng #8 想在单个 phase 超过 3 个 prompts 时发出警告。但 V0 的 `question-log.jsonl` 没有 `phase` 字段。V1 说 “no schema change”，这和目标本身矛盾。
3.  **Question registry 不等于 finding registry。** V0 的 `scripts/question-registry.ts` 只覆盖 *questions*，而它们是在定义 skill 时注册的。Review findings 是 *运行时动态发现* 的。通过 registry 做 `door_type: one-way` 约束，覆盖不到评审过程中临时生成的 findings。对于 agent 在 review 中现场产出的 findings，one-way-door 安全性无法被强制执行。
4.  **仅靠 prose 中的 pacing 规则，无法反转现有控制流。** V1 计划在 preamble prose 里加一条 “先排序 findings，再提问” 的规则。但像 `plan-eng-review/SKILL.md.tmpl` 这种现有 skill template，本身就内置了按 section 逐段 STOP/AskUserQuestion 的序列。Preamble 里的 prose 规则，无法可靠覆盖一个硬编码在 section 级别的 STOP。这里变化的本质是执行顺序，而不是 prompt 措辞。
5.  **Flip 机制没有实现。** “回复 `flip <id>` 来修改” 只是 prose。没有 command parser、没有状态存储，也没有 replay 行为。如果会话被压缩，而 Silent Decisions block 又离开了当前上下文，原决策就彻底丢失了。
6.  **迁移提示本身也是一种打断。** V1 升级后的 migration prompt 会询问用户是否恢复 V0 prose，它本身就占用了 V1.1 想要压低的 interruption budget。所以 V1.1 必须明确：它是否豁免于预算之外，还是要算作第一个 interrupt。
7.  **首次运行的 preamble 提示也会计数。** Lake intro、telemetry、proactive、routing injection——Louise 在第一次运行时全都看到了。它们在第一个真实 skill 运行前就已经造成了多次打断。V1.1 必须审查其中哪些对新用户是刚需，哪些可以延后到第 N 次会话再出现。
8.  **排序公式没有用真实数据校准。** V1 曾考虑过 `product 0-8`（有缺陷，因为只会得到 `{0,1,2,4,8}` 的分布），后来又考虑过 `sum 0-6` 且阈值大于等于 4。但两者都没有对照真实 finding 分布做验证。V1.1 应该先对 V0 的 question-log 做埋点分析，看看真实 findings 长什么样，再进行校准。
9.  **“所有 one-way doors 都必须展示” 与 “每个 phase 最多 3 个提示” 是矛盾的。** One-way door 的上限应当是无上限，因为它关乎安全；two-way door 的上限才是 3。原计划同时写了这两条规则，却没有明确优先级。V1.1 必须明确：one-way doors 不受 phase budget 限制。
10. **验证值未定义。** V1 计划里写了 “Silent Decisions block 预期有 >=N 条”，但 N 没定义；throughput JSON 里的 `active: true` 字段也没有被定义。V1.1 需要把这些值具体化。

## V1.1 的范围

1.  **定义会话状态模型。** 明确 per-skill-invocation、per-phase、per-conversation 的边界。Backing store 很可能是 `~/.gstack/sessions/<session_id>/pacing-state.json`，记录每个 phase 中哪些 findings 已展示、哪些被自动接受。清理策略沿用 preamble 里已有的 session tracking TTL。

2.  **为 question-log.jsonl schema 增加 `phase` 字段。** 把每个 AskUserQuestion 标记为来自哪个 review phase（CEO / Design / Eng / DX / other）。迁移方案：现有记录默认值为 `"unknown"`。属于非破坏性 schema 扩展。

3.  **扩展 registry 对动态 findings 的覆盖。** 两种方案，在 CEO review 时二选一：
    - (a) 扩展 `scripts/question-registry.ts`，允许 runtime registration（即使是临时 ID，也能被记录与分类）。
    - (b) 增加独立的运行时分类器 `scripts/finding-classifier.ts`，通过模式匹配把 finding 文本映射到 risk tier。

4.  **把 pacing 从 preamble prose 移入 skill-template 控制流。** 更新每个 review skill template，使其执行顺序变为：先在内部完整跑完 phase，再用 `gstack-pacing-rank` binary 对 findings 排序，然后最多发出 3 个 AskUserQuestion prompts，其余放入 Silent Decisions block。这不再是 preamble 规则，而是各模板中的显式顺序。

5.  **实现 flip 机制。** 新增 binary `bin/gstack-flip-decision`。Command parser 从用户消息中识别 `flip <id>`。随后从 `pacing-state.json` 中查回原始决策，并重新打开为显式 AskUserQuestion。新的用户选择会被持久化。

6.  **确定迁移提示的预算规则。** 明确规定：一次性的 migration prompts 不计入每个 phase 的 interruption budget。理由是它们发生在 review phases 开始前，而非 phases 内部。

7.  **审计首次运行的 preamble。** 逐一审计 lake intro、telemetry、proactive、routing injection。对于每一项，判断它对首次用户是否是 load-bearing，还是可以延后。一个可能结果是：除了 lake intro 之外，其余都延后到 session 2+；并通过 `/plan-tune first-run` 命令让用户自愿调出。

8.  **校准排序阈值。** 利用已有历史的 V0 question-log 做埋点分析，测量近期 CEO + Eng + DX + Design reviews 中 `severity × irreversibility × user-decision-matters` 的真实分布。再根据真实数据选阈值。目标是：约 20% findings 需要显式抛出，约 80% 自动接受。

9.  **明确规则：one-way doors 不设上限。** 在 skill template prose 中硬编码：`"one-way doors surface regardless of phase interruption budget."`。只有 two-way findings 才遵守每个 phase 最多 3 个的限制。

10. **给出具体验证值。** 比如为 Silent Decisions 定义 N（如非平凡 plan 预期 >=5 条），并为 throughput JSON schema 定义具体字段名。

## V1.1 的验收标准

-   **打断次数：** Louise（或类似的非技术协作者）重新完整跑一遍 `/autoplan`，计划复杂度与 V0 baseline 相当。AskUserQuestion 总数要降到 V0 baseline 的 **<=50%**。（V1 会保留该 baseline transcript，供 V1.1 做校准。）
-   **One-way-door 覆盖率：** 100% 的安全关键决策都会单独浮出展示，即 `door_type: one-way` 或由 classifier 标记的动态 findings。没有上限限制。
-   **Flip 往返：** 用户输入 `flip test-coverage-bookclub-form`。原本自动接受的决策会重新作为 AskUserQuestion 弹出。用户新选择会持久化进 Silent Decisions block，或者在切换为显式展示时从其中移除。
-   **Per-phase 可观测性：** `/plan-tune` 可以读取 question-log.jsonl 中新增的 `phase` 字段，并展示任何 session 的 per-phase AskUserQuestion 数量。
-   **首次运行减少：** 新用户在第一个真实 skill 运行前，只看到 **<=1** 个 meta-prompt（lake intro），而不是 V1 的 4 个（lake + telemetry + proactive + routing）。
-   **人工重跑：** Louise 与 Garry 分别进行独立的定性复审，模式与 V1 相同。

## 对 V1 的依赖

V1.1 建立在 V1 的基础设施之上：
-   `explain_level` config key 与 preamble echo pattern（A4）
-   jargon list 与 Writing Style section（V1.1 的 interruption language 也应遵守 ELI10）
-   V0 dormancy 的 negative tests（V1.1 同样不会唤醒 5D psychographic machinery）
-   V1 捕获的 Louise transcript（用作验收标准校准基线）

V1.1 **不依赖** 任何 V2 项目，如 E1 substrate wiring、narrative/vibe 等。

## 评审计划

-   **前期工作：** 先抓取当前 V0 question-log 的真实分布，作为 Scope #8 的校准输入。
-   **CEO review。** 先挑战基本前提：pacing 真的是正确修复方向吗，还是 V1.1 应该考虑直接移除 phases？例如把 CEO + Design + Eng + DX 折叠成单次统一 review。Scope mode 大概率仍是 SELECTIVE EXPANSION，也就是以 pacing 为核心，只捎带少量相关优化。
-   **Codex review。** 对 V1.1 计划做一次独立审查。预计会重点盯住控制流变更（Scope #4），因为这正是 V1 最难落地的部分。
-   **DX review。** 重点关注 flip 机制的体验：`flip <id>` 是否足够可发现、命令语法是否自然、错误路径是否清晰。
-   **Eng review ×N。** 预计仍然会像 V1 一样，跑多轮。

## V1.1 不会碰的内容

以下 V2 项目继续延期：
-   confusion-signal detection
-   基于 5D psychographic 的 skill adaptation（V0 E1）
-   `/plan-tune narrative` 与 `/plan-tune vibe`（V0 E3）
-   per-skill 或 per-topic explain levels
-   team profiles
-   基于 AST 的 “delivered features” 指标