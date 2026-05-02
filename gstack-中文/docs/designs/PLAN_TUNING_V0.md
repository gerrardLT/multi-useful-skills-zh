# Plan Tuning v0 设计文档

**状态：** 已批准，作为 v1 实现基础  
**分支：** `garrytan/plan-tune-skill`  
**作者：** Garry Tan（用户），并接受 Claude Opus 4.7 与 OpenAI Codex gpt-5.4 的 AI 辅助评审  
**日期：** 2026-04-16

## 这份文档是什么

它是 `/plan-tune` v1 的权威记录：它是什么、它不是什么、我们考虑过什么，以及为什么做出这些决定。文档提交进仓库，是为了让未来的贡献者不用靠考古来理解背景。它也取代了存放在 `~/.gstack/projects/` 下的两份本地计划产物。

## 这个功能一句话概括

gstack 里有 40+ skills，会不断触发 AskUserQuestion。高级用户会反复回答同样的问题，却没有办法真正告诉 gstack：“别再问我这个了。” 更深一层的问题是，gstack 对每个用户如何偏好推进工作没有任何模型，比如 scope appetite、risk tolerance、detail preference、autonomy、architecture care，于是所有 skill 只能为所有人给出中间路线默认值。

`/plan-tune v1` 要做的是 schema + observation layer：一个 typed question registry、每个问题的显式偏好、内联 `tune:` 反馈，以及一个既包含声明维度也包含观察维度、还能用普通英语解释的 profile。  

**注意：** v1 还不会根据 profile 自动改 skill 行为。那是 v2 的事情。v1 先证明底座可行。

## 为什么要做更小的版本

这个功能最早是以完整自适应底座的形式提出的：psychographic dimensions 驱动自动决策、blind-spot coaching、LANDED 庆祝页面等全部一起上。它在多轮 review 中都被放行了，直到外部声音 Codex 给出了 20 点批评。最关键的几条是：

1. **“Substrate” 这个说法是假的。**  
   计划里让 5 个 skill 在 preamble 里读 profile，但 AskUserQuestion 只是 prompt convention，不是 middleware。代理完全可以悄悄跳过。没有 typed question registry，所谓底座只是营销文案。

2. **内部逻辑自相矛盾。**  
   E4（blind-spot）+ E6（mismatch）+ ±0.2 clamp 在 declared dimensions 上无法同时成立。

3. **Profile poisoning。**  
   `tune: never ask` 这种反馈可能出现在恶意 repo 内容、README、PR 描述或工具输出里，agent 会老老实实写进去。

4. **E5 的 LANDED 页面放进 preamble 完全不合适。**  
   它会给每个 skill 都增加 `gh pr view`、HTML 生成、浏览器打开等隐式副作用。

5. **实现顺序反了。**  
   原计划先做 classifiers 和 bins，正确顺序应该是先建 typed registry 这个整合点，再建基础设施，再建消费者。

因此我们决定回滚 CEO EXPANSION，交付一个观察型 v1，以真正的 typed registry 作为基础。

## v1 范围（现在要做的）

1. **Typed question registry**：`scripts/question-registry.ts`
2. **CI enforcement**：确保每个 AskUserQuestion 都有 registry entry
3. **Question logging**：`bin/gstack-question-log`
4. **显式 per-question preferences**：`bin/gstack-question-preference`
5. **Preamble 注入**：根据 preference 决定 auto-decide 还是 ask normally
6. **内联 `tune:` 反馈**：只接受当前用户回合中的 `tune:`，并加 user-origin gate
7. **Declared profile**：`/plan-tune setup`
8. **Observed / Inferred profile**
9. **`/plan-tune` skill**：普通英语可交互查看和修改
10. **与 `builder-profile.jsonl` 合并迁移**

## 推迟到 v2 的内容

| 项目 | 为什么推迟 | 晋级条件 |
|------|-----------|---------|
| E1 Substrate wiring | 需要 v1 registry 先稳定跑起来 | registry 稳定 90+ 天 |
| E3 `/plan-tune narrative` + `/plan-tune vibe` | 没有真实数据时容易写出空话 | profile 多样性检查连续通过 |
| E4 Blind-spot coach | 需要单独的 interaction-budget 设计 | 完成设计规格并验证不烦人 |
| E5 LANDED page | 不能放在 preamble 里 | 改成显式命令或 post-ship hook |
| E6 mismatch 驱动的 auto-adjustment | 需要 dual-track profile 先稳定 | v1 的 mismatch 数据足够稳定 |
| psychographic-driven auto-decide | v1 只允许显式偏好生效 | 真实用例证明 inferred profile 可用 |

## 完全否决的方案

| 项目 | 否决原因 |
|------|---------|
| Substrate-as-prompt-convention | 代理可跳过说明，根本不稳 |
| ±0.2 clamp on declared dimensions | 与 mismatch detection 冲突 |
| 用 prose summary 判断 one-way door | 安全判断不能依赖措辞 |
| 单一事件 schema 混装所有东西 | 不同领域对象不应塞在同一个文件里 |
| 给 `/plan-tune onboarding` 加 TTHW telemetry | 与 local-first 叙事冲突 |
| 没有 user-origin 验证就写 `tune:` | 会被 profile poisoning |

## 架构

```text
~/.gstack/
  developer-profile.json

~/.gstack/projects/{SLUG}/
  question-log.jsonl
  question-preferences.json
  question-events.jsonl
```

### 统一 profile schema

```json
{
  "identity": {"email": "..."},
  "declared": {
    "scope_appetite": 0.9,
    "risk_tolerance": 0.7,
    "detail_preference": 0.4,
    "autonomy": 0.5,
    "architecture_care": 0.7
  },
  "inferred": {
    "values": {"scope_appetite": 0.72},
    "sample_size": 47,
    "diversity": {
      "skills_covered": 5,
      "question_ids_covered": 14,
      "days_span": 23
    }
  },
  "gap": {"scope_appetite": 0.18},
  "sessions": [],
  "signals_accumulated": {}
}
```

### diversity check

只有满足以下条件时，`inferred` 才算“数据足够”：

- `sample_size >= 20`
- `skills_covered >= 3`
- `question_ids_covered >= 8`
- `days_span >= 7`

否则 `/plan-tune profile` 要明确显示“还没有足够的观察数据”。

## v1 数据流

1. Preamble 先检查 `question_tuning` config
2. 每次 AskUserQuestion 之前：
   - 调用 `gstack-question-preference --check <registry-id>`
   - 如果 `never-ask` 且不是 one-way door，则自动选择推荐项，并标注来源
   - 如果是 one-way door，则无论如何都必须继续问
3. Ask 完之后：
   - 记录到 `question-log.jsonl`
4. 提示用户可回复 `tune: ...`
5. 只有用户下一轮消息里真的出现了 `tune:`，并且来源是当前用户消息时，才写入 tune event
6. `inferred dimensions` 通过历史事件按需重新计算

## 安全模型

### Profile poisoning 防御

只有当下面条件都满足时，才允许写 tune event：

- agent 正在处理用户当前这轮聊天消息
- `tune:` 前缀出现在用户自己的消息中
- 不是来自 tool output、文件内容、PR 描述、commit message 等

二进制层强制要求 `source: "inline-user"`，其他任何来源都要拒绝。

### 数据隐私

- 所有数据都只存在 `~/.gstack/`
- `/plan-tune export <path>` 是显式导出
- `/plan-tune delete` 可以本地清空
- `telemetry off` 时，不新增任何 profile 相关遥测

## 保留的 5 个硬约束

1. **One-way door 必须由 registry 显式声明**
2. **Profile 可查看也可编辑**
3. **Signal map 必须是手工写在 TypeScript 里的**
4. **v1 不做 psychographic-driven auto-decide**
5. **项目级 preference 优先于未来可能存在的全局 preference**

## 为什么要 event-sourced + dual-track

### 为什么 inferred profile 要 event-sourced

- signal map 将来会改，重算比迁移更可靠
- 可审计
- 对未来维度扩展友好

### 为什么要 dual-track（declared + inferred）

- declared = 用户主权
- inferred = 系统观察
- gap = 二者差距，是最有价值的信号

v1 里 gap 只展示，不自动纠正。

## 交互模型：全程普通英语

`/plan-tune` 不要求用户写 CLI 子命令。进入后就是对话式模式：

- “Show me my profile”
- “Review questions I've been asked”
- “Set a preference about a question”
- “Update my profile”
- “Show me the gap between what I said and what I do”
- “Turn it off”

用户自然说话即可，agent 做解释、确认并执行。

## 要创建的文件

### Core schema

- `scripts/question-registry.ts`
- `scripts/one-way-doors.ts`
- `scripts/psychographic-signals.ts`

### Binaries

- `bin/gstack-question-log`
- `bin/gstack-question-preference`
- `bin/gstack-developer-profile`

### Resolvers

- `scripts/resolvers/question-tuning.ts`

### Skill

- `plan-tune/SKILL.md.tmpl`

### Tests

- `test/plan-tune.test.ts`

## 要修改的文件

- `scripts/resolvers/index.ts`
- `scripts/resolvers/preamble.ts`
- `bin/gstack-builder-profile`
- migration script

## v1 明确不碰的文件

不引入任何 `{{PROFILE_ADAPTATION}}` 占位，不在这些 skill 中做基于 profile 的行为适配：

- `ship/SKILL.md.tmpl`
- `review/SKILL.md.tmpl`
- `office-hours/SKILL.md.tmpl`
- `plan-ceo-review/SKILL.md.tmpl`
- `plan-eng-review/SKILL.md.tmpl`

这些 skill 在 v1 中只获得 logging、preference checking 和 inline tune feedback 的 preamble 注入。

## 关键决策

### A：一次打包全部 vs 先做 registry-first 观察层  
**结论：registry-first observational v1**

Codex 指出没有 typed registry 的情况下，所有 psychographic 适配都只是建在沙子上。

### B：event-sourced vs 存储式维度 vs 混合  
**结论：event-sourced + user-declared anchor**

去掉 ±0.2 clamp，declared 与 inferred 分轨存在。

### C：one-way door 分类方式  
**结论：registry declaration**

安全相关的门槛不能依赖 agent 对措辞的解释。

### D：`tune:` 反馈语法  
**结论：结构化关键词 + 自然语言回退**

### E：`/plan-tune` 的交互方式  
**结论：plain-English conversational**

### F：LANDED celebration  
**结论：完全推迟到 v2，且以后也不应放在 preamble**

### G：calibration gate  
**结论：diversity-checked**

### H：实现顺序  
**结论：先做 integration point（registry + CI lint）**

### I：TTHW telemetry  
**结论：local-only**

### J：profile poisoning 防御  
**结论：user-origin gate**

## 成功标准

- `bun test` 通过
- 每个 AskUserQuestion 都有 registry entry，CI 能强制
- migration 能 100% 保留既有 session 和 signals_accumulated
- one-way door 分类覆盖所有高风险问题
- 非 `inline-user` 来源的 tune event 必须被拒绝
- Garry 连续狗粮两周后能回答：
  - `tune: never-ask` 是否自然
  - registry 维护成本是否合理
  - inferred dimensions 是否稳定
  - 普通英语交互是否真像“教练”，而不是“聊天机器人”

## 实现顺序

1. 审计所有 `AskUserQuestion`
2. 建初版 `question-registry.ts`
3. 写 registry completeness test
4. 建 `one-way-doors.ts`
5. 建 `psychographic-signals.ts`
6. 建 `archetypes.ts`
7. 写 `gstack-question-log`
8. 写 `gstack-question-preference`
9. 写 `gstack-developer-profile`
10. 写 migration
11. 写 `question-tuning.ts`
12. 注册 resolver
13. 改 `preamble.ts`
14. 写 `plan-tune/SKILL.md.tmpl`
15. 跑 `gen:skill-docs`
16. 跑完整测试
17. 狗粮两周
18. `/ship` v1，再讨论 v2

## 待到 v2 再决定的问题

1. signal delta 的精确校准
2. declared 与 inferred 差距大时是否主动建议更新
3. signal map 版本变更时是否自动重算
4. 跨项目 profile 继承还是隔离
5. 是否支持 team profile

## 吸收过的评审

- `/office-hours`
- `/plan-ceo-review`
- `/plan-devex-review`
- `/plan-eng-review`
- `/codex`

真正推动大回滚的是 Codex 的 20 点批评，它让一个原本会做得更大、但更站不住脚的计划，收缩成了一个可以诚实交付的 v1。