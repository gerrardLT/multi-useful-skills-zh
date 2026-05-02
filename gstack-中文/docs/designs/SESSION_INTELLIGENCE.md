# 会话智能层

## 问题

Claude Code 的上下文窗口是短暂的。每次会话都从零开始。
当自动压缩在约 167K tokens 触发时，它只会保留一个通用摘要，
却会丢掉文件读取内容、推理链路以及中间决策。

gstack 已经会生成很多能落盘保存的高价值产物：CEO 计划、工程评审、
设计评审、QA 报告、经验沉淀。这些文件里包含了塑造当前工作的决策、
约束和上下文。但 Claude 并不知道这些文件存在。压缩之后，那些支撑了
每一步决策的计划和评审会悄无声息地从上下文里消失。

整个生态已经在做类似方向的事。claude-mem（9K+ stars）会捕获工具使用情况，
并在未来会话中注入上下文。Claude HUD 会展示实时 agent 状态。
Anthropic 自己的 `claude-progress.txt` 模式，则让 agent 在每次新会话开始时读取一个进度文件。

但还没有人真正解决一个很具体的问题：让 **skill 产出的 artifacts**
在上下文压缩后依然存活。因为别人并没有 gstack 这种 artifact 架构。

## 洞察

gstack 已经会把结构化产物写入 `~/.gstack/projects/$SLUG/`：
- CEO 计划：`ceo-plans/`
- 设计评审：`design-reviews/`
- 工程评审：`eng-reviews/`
- Learnings：`learnings.jsonl`
- Skill usage：`../analytics/skill-usage.jsonl`

缺的不是存储，而是“感知”。preamble 需要告诉 agent：
“这些文件存在。里面记录了你已经做出的决策。压缩之后，请重新读取它们。”

## 架构

```text
Claude Context Window
(ephemeral, ~167K token limit)

Compaction fires -> summary only
        |
reads on start / after compaction
        |
~/.gstack/projects/$SLUG/
(persistent, survives everything)

ceo-plans/      -> /plan-ceo-review
eng-reviews/    -> /plan-eng-review
design-reviews/ -> /plan-design-review
checkpoints/    -> /checkpoint (new)
timeline.jsonl  -> every skill (new)
learnings.jsonl -> /learn
        |
rolled up weekly
        |
/retro
Timeline: 3 /review, 2 /ship, ...
Health trends: compile 8/10 -> 9/10
Learnings applied: 4 this week
```

## 功能

### Layer 1：上下文恢复（preamble，所有 skills）

在 preamble 里加大约 10 行说明文字。压缩后或上下文退化时，
agent 去检查 `~/.gstack/projects/$SLUG/` 里的近期计划、评审和 checkpoints。
先列目录，再读取最新文件。

成本几乎为零。收益是所有 skill 产出的计划和评审都能跨过压缩存活。

### Layer 2：会话时间线（preamble，所有 skills）

每个 skill 都往 `timeline.jsonl` 追加一行 JSONL：时间戳、skill 名称、
branch、关键结果。`/retro` 负责渲染它。

这样项目中由 AI 辅助完成的工作历史就可见了。
例如：“本周：3 次 /review、2 次 /ship、1 次 /investigate，
跨越 feature-auth 和 fix-billing 两个分支。”

### Layer 3：跨会话注入（preamble，所有 skills）

当一个新会话在某个 branch 上启动，且存在近期 artifacts 时，
preamble 打印一行摘要：
“上次会话：实现了 JWT auth，5 个任务完成了 3 个。
Plan: ~/.gstack/projects/$SLUG/checkpoints/latest.md”

这样 agent 在读取任何文件前，就已经知道你上次停在哪里。

### Layer 4：`/checkpoint`（可选 skill）

手动保存当前工作快照：正在做什么、在改哪些文件、做了哪些决策、
还剩什么没做。适合在离开工位前、执行复杂操作前、做工作区交接时，
或几天后回来继续时使用。

### Layer 5：`/health`（可选 skill）

代码质量仪表盘：type-check、lint、测试套件、死代码扫描。
输出一个 0-10 的综合分数，并持续追踪。`/retro` 展示趋势，
`/ship` 可以根据可配置阈值做 gate。

## 复利效应

这些功能单独看都成立，合在一起就会形成复利：

Session 1：`/plan-ceo-review` 生成计划，并保存到磁盘。
Session 2：agent 在 preamble 后读取这份计划，不再重复追问已定决策。
Session 3：`/checkpoint` 保存进度。时间线显示 2 次 `/review`、1 次 `/ship`。
Session 4：压缩在重构中途触发。agent 重新读取 checkpoint，
           恢复关键决策、类型信息和剩余工作，继续推进。
Session 5：`/retro` 汇总本周信息。健康度趋势从 6/10 -> 8/10。
           时间线显示跨 3 个 branch 共触发了 12 次 skill。

项目的 AI 历史不再是短暂的。它会持续存在、持续累积，
并让每一次未来会话都更聪明。这就是会话智能层。

## 它不是什么

- 不是 Claude 内建 compaction 的替代品
  那套机制负责会话状态；我们负责 gstack artifacts
- 不是像 claude-mem 那样的完整 memory system
  那类系统负责基于 SQLite 的跨会话记忆；我们负责结构化的 skill artifacts
- 不是数据库，也不是服务
  它只是磁盘上的 markdown 文件

## 研究来源

- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic: Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [claude-mem](https://github.com/thedotmack/claude-mem)
- [Claude HUD](https://github.com/jarrodwatts/claude-hud)
- [CodeScene: Agentic AI coding best practices](https://codescene.com/blog/agentic-ai-coding-best-practice-patterns-for-speed-with-quality)
- [Post-compaction recovery via git-persisted state (Beads)](https://dev.to/jeremy_longshore/building-post-compaction-recovery-for-ai-agent-workflows-with-beads-207l)