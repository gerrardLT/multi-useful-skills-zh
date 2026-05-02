# Plan Tuning v1 设计文档

**状态：** 已批准实现（2026-04-18）  
**分支：** `garrytan/plan-tune-skill`  
**作者：** Garry Tan（用户），并接受 Claude Opus 4.7 与 OpenAI Codex gpt-5.4 的 AI 辅助评审  
**覆盖范围：** 在 [PLAN_TUNING_V0.md](./PLAN_TUNING_V0.md) 的观察型底座之上，再加入写作风格与 LOC 凭证层  
**相关：** [PACING_UPDATES_V0.md](./PACING_UPDATES_V0.md) - 抽离出的节奏优化设计，作为 V1.1 计划

## 这份文档是什么

它是 `/plan-tune v1` 的权威记录：它是什么、它不是什么、我们考虑过什么、为什么做出这些取舍。提交到仓库里，是为了让未来的贡献者和未来的 Garry 不需要靠考古来追溯背景。

## 致谢

这份计划之所以存在，是因为 **[Louise de Sadeleer](https://x.com/LouiseDSadeleer/status/2045139351227478199)**。她作为一个非技术用户完整体验了一次 gstack 流程，并非常坦率地告诉了我们使用感受：

1. “I was getting a bit tired after a while and it felt a little bit rigid.”  
   指向：*节奏 / 疲劳*
2. “I'm just gonna say yes yes yes”  
   指向：*用户脱离参与*
3. “What I find funny is his emphasis on how many lines of code he produces. AI has produced for him of course.”  
   指向：*LOC 叙事问题*
4. “As a non-engineer this is a bit complicated to understand.”  
   指向：*术语密度和结果导向表达不足*

V1 直接回应第 3 和第 4 点：第一次出现的术语要解释、输出要用结果导向而不是实现导向来表达、句子短、像真实的人在对读者说话。第 1 和第 2 点则被抽离到 [PACING_UPDATES_V0.md](./PACING_UPDATES_V0.md)，作为 V1.1 单独处理。

## 这个功能一句话概括

gstack skill 的输出本身就是产品。如果写出来的文字让一个非技术型创始人读不进去，那他在评审时就会一路“yes yes yes”地点过去。V1 给所有 tier >= 2 skill 增加统一写作标准：第一次出现的行话必须解释（来自一个精挑细选的大约 50 个术语清单）、问题要用结果语言来问（例如“如果这样做，你的用户会坏在哪里？”），而不是实现语言；句子更短，名词更具体。想保留 V0 紧凑文风的高级用户，可以设置 `gstack-config set explain_level terse`。只有两个模式，没有中间档。

此外，README 中“600,000+ lines of production code” 这种容易被看作 LOC vanity 的说法，会被一个更诚实的、由 `scc` 脚本算出来的 2013-vs-2026 产能倍数替换，并附上公开仓库与私有仓库可见性差异等 caveat。

## 为什么我们做的是更小的版本

V1 经过了多轮 scope revision。最后的 scope 比中间任何一版都更小，因为每轮评审都发现了真实问题。

- **Revision 1：四级经验轴（被否决）**  
  原方案是首次运行时问用户属于哪类：资深开发者、工程师但未单独交付过、非技术但在团队里交付过、完全非技术。然后按等级适配 skill。  
  CEO review 否决原因：首次 onboarding 摩擦太大；“我属于哪一级？” 本身就会让最需要帮助的人更困惑；技术能力也不是单轴；很多工程师同样受益于更好的写作标准。

- **Revision 2：默认 ELI10，`terse` 退出（通过）**  
  所有 skill 默认使用新写作标准，高级用户可通过 `explain_level: terse` 回到 V0 风格。Codex 第一轮评审抓出了三个关键问题：静态 Markdown gating、host-aware 路径、README 更新机制，三者都被吸纳。

- **Revision 3：ELI10 + 节奏优化（提出后缩回）**  
  增加了 pacing 方向：给问题排序、自动接受 two-way door、每阶段最多 3 个 AskUserQuestion、Silent Decisions block、可翻转机制等。  
  Eng Review Pass 2 发现评分公式和路径一致性问题；Eng Review Pass 3 与 Codex Pass 2 又暴露了 10+ 个结构性缺口，已经无法靠改 plan 文案来补。

- **Revision 4：只做 ELI10 + LOC（最终版）**  
  用户选择缩小 scope：V1 只发布写作风格层和 LOC receipts，把 pacing 推迟到 V1.1。

主线很明确：每一次 review 都在正确地收窄野心，直到剩余范围不再有结构性缺口。

## V1 范围（现在要做的）

1. 在 `scripts/resolvers/preamble.ts` 中增加 **Writing Style** 章节  
2. 用 `scripts/jargon-list.json` 维护约 50 个高频技术术语  
3. 提供 `gstack-config set explain_level terse` 二元退出开关  
4. host-aware preamble echo  
5. `gstack-config` 校验 `explain_level: default|terse`  
6. 在 README 中移除“600,000+ lines of production code” 的 hero 表述  
7. 增加基于 `scc` 的吞吐量脚本 `scripts/garry-output-comparison.ts`  
8. 增加独立安装脚本 `scripts/setup-scc.sh`  
9. 增加 README 更新管道 `scripts/update-readme-throughput.ts`  
10. `/retro` 中把 logical SLOC 和 weighted commits 放在 raw LOC 之前  
11. 增加升级迁移脚本  
12. 补充文档：CLAUDE.md、CHANGELOG.md、README.md、CONTRIBUTING.md  
13. 增加测试  
14. 增加 V0 休眠态负向测试  
15. 补充 V1 / V1.1 设计文档

## 延后内容

### 推迟到 V1.1

- Review pacing overhaul
- preamble 首次运行元提示审计

### 推迟到 V2 或以后

- confusion-signal detection
- 5D psychographic 驱动的 skill 适配
- `/plan-tune narrative` 与 `/plan-tune vibe`
- 按 skill / topic 粒度的 explain levels
- team profiles
- AST 级的 “delivered features” 指标

## 完全否决的方案

- 四级 declared experience axis
- 新建 `scripts/resolvers/eli10-writing.ts`
- 在运行时压制 Writing Style block
- default 和 terse 之间再做一个中间模式
- 运行时可编辑 jargon list
- 在 `package.json` 中使用不存在的 `devDependencies.optional`
- 把 README anchor 和 CI reject marker 用同一串字符

## 架构

```text
~/.gstack/
  developer-profile.json
  config.yaml                       # + explain_level

scripts/
  jargon-list.json
  garry-output-comparison.ts
  update-readme-throughput.ts
  setup-scc.sh
  resolvers/preamble.ts

docs/
  designs/PLAN_TUNING_V1.md
  designs/PACING_UPDATES_V0.md
  throughput-2013-vs-2026.json

~/.claude/skills/gstack/bin/
  gstack-config

gstack-upgrade/migrations/
  v<VERSION>.sh
```

### 数据流

```text
用户运行 tier>=2 的 skill
  ->
Preamble bash:
  _EXPLAIN_LEVEL=$(${binDir}/gstack-config get explain_level 2>/dev/null || echo "default")
  echo "EXPLAIN_LEVEL: $_EXPLAIN_LEVEL"
  ->
生成后的静态 SKILL.md：
  - 现有 AskUserQuestion Format
  - 新增 Writing Style
  ->
如果 EXPLAIN_LEVEL=terse，或者用户本轮明确说“be terse”，则跳过
  ->
否则应用写作规则
  ->
输出给用户
```

## 安全与隐私

- 不引入新的用户数据
- 不在运行时读取敏感数据
- jargon list 是仓库内提交的静态清单
- migration script 为 one-shot
- `scc` 只跑公开仓库

## 关键决策

### A：四级经验轴 vs 默认 ELI10  
**结论：默认 ELI10**

- 四级轴的问题在于 onboarding 摩擦高，而且技术能力并不是单维度
- 默认 ELI10 + `terse` 退出则没有额外 onboarding 问题，而且对所有人都有提升

### B：新 resolver 文件 vs 扩展现有 preamble  
**结论：直接扩展现有 preamble**

- 新文件会和 preamble 里已有的 “smart 16-year-old” 表达冲突
- 扩展现有 preamble 能保持单一事实来源

### C：运行时 suppression vs 条件性 prose gate  
**结论：条件性 prose gate**

- `gen-skill-docs` 生成的是静态 Markdown，运行时 suppression 只是幻觉
- 只能通过 prose 约定来让 agent 在运行时决定跳过或应用

### D：jargon list 放在哪里  
**结论：仓库拥有、生成时内联**

- 运行时用户自定义与 gen-time inlining 冲突
- 采用仓库内统一清单，改动通过 PR 完成

### E：节奏优化是 V1 还是 V1.1  
**结论：V1.1**

- pacing 方向有太多结构性缺口，不能塞进当前 V1
- V1 先交付写作风格和 LOC 重构

### F：README 更新机制  
**结论：两串字符串**

- `GSTACK-THROUGHPUT-PLACEHOLDER` 用作稳定 anchor
- `GSTACK-THROUGHPUT-PENDING` 用作 CI 拒绝标记

## Review 记录

| Review | 次数 | 状态 | 核心结果 |
|---|---|---|---|
| CEO Review | 1 | CLEAR（但要求控范围） | 从四级经验轴转向默认 ELI10 |
| Codex Review | 2 | ISSUES_FOUND，并推动缩 scope | 第 1 轮发现 25 个问题，第 2 轮继续推动 V1.1 抽离 |
| Eng Review | 3 | CLEAR（SCOPE_REDUCED） | 抓出评分公式、路径、`devDependencies.optional` 等问题 |
| DX Review | 1 | CLEAR（TRIAGE） | 补文档、升级迁移和 hero moment |

## 总结

V1 的本质不是“让 AI 说得更像小白教程”，而是把 gstack 输出从“技术味很重的中性说明”提升为“真正以读者为中心、结果导向、可读且诚实”的产物。  

我们没有试图一次性解决 Louise 提出的全部问题，而是把问题拆开：V1 解决“怎么写”，V1.1 再解决“怎么问、怎么卡节奏”。这也是这次范围收缩真正正确的地方。