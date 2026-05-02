# gstack x OpenClaw 集成

gstack 与 OpenClaw 集成作为方法源，而不是移植的代码库。
OpenClaw 的 ACP 运行时原生生成 Claude Code 会话。 gstack 提供了
规划纪律和方法，使这些会议变得更好。

这是一个编码为提示文本的轻量级协议。没有守护进程。没有 JSON-RPC。
没有兼容性矩阵。提示符就是桥。

## 架构

```
  OpenClaw                               gstack repo
  ─────────────────────                    ──────────────
  Orchestrator: messaging,                 Source of truth for
  calendar, memory, EA                     methodology + planning
       │                                        │
       ├── Native skills (conversational)       ├── Generates native skills
       │   office-hours, ceo-review,            │   via gen-skill-docs pipeline
       │   investigate, retro                   │
       │                                        ├── Generates gstack-lite
       ├── sessions_spawn(runtime: "acp")       │   (planning discipline)
       │       │                                │
       │       └── Claude Code                  ├── Generates gstack-full
       │           └── gstack installed at      │   (complete pipeline)
       │               ~/.claude/skills/gstack  │
       │                                        └── docs/OPENCLAW.md (this file)
       └── Dispatch routing (AGENTS.md)
```

## 调度路由

OpenClaw 在生成时决定使用哪一层 gstack 支持：

|等级|什么时候|提示符前缀|
|------|------|---------------|
|**简单的**|单文件编辑、拼写错误、配置更改|没有注入 gstack 上下文|
|**中等的**|多文件功能、重构|附加 gstack-lite CLAUDE.md|
|**重的**|需要特定的 gstack 技能|“加载gstack。运行/X”|
|**满的**|完整的功能、目标、项目|附加 gstack-full 管道|
|**计划**|“帮我规划一个克劳德代码项目”|附加 gstack-plan 管道|

### 决策启发式

- 可以用 <10 行代码完成吗？ -> **简单**
- 它是否涉及多个文件，但方法很明显？ -> **中**
- 用户是否指定了特定技能（/cso、/review、/qa）？ -> **重**
- 它是一个功能、项目还是目标（而不是任务）？ -> **完整**
- 用户是否想为 Claude Code 计划一些事情但尚未实施？ -> **计划**

### 调度路由指南（适用于 AGENTS.md）

完整的准备粘贴部分位于 `openclaw/agents-gstack-section.md` 中。
将其复制到您的 OpenClaw AGENTS.md 中。

关键行为规则（这些规则高于调度层）：

1. **始终生成，从不重定向。** 当用户要求使用任何 gstack 技能时，
始终生成克劳德代码会话。切勿告诉用户打开 Claude Code。
2. **解析存储库。** 如果用户命名存储库，请设置工作目录。如果
未知，询问哪个仓库。
3. **自动计划运行端到端。** 生成，让它运行完整的管道，报告回来
在聊天中。用户永远不应该离开 Telegram。

### CLAUDE.md 碰撞处理

当在已经有 CLAUDE.md 的存储库中生成 Claude 代码时，APPEND
gstack-lite/full 作为新部分。不要替换存储库的现有说明。

## gstack 为 OpenClaw 生成什么

所有工件都位于 `openclaw/` 目录中，并由
`bun run gen:skill-docs --host openclaw` 生成：

### gstack-lite（中层）
`openclaw/gstack-lite-CLAUDE.md` — ~15 条规划规则：
1. 修改前读取每个文件
2. 编写 5 行计划：什么、为什么、哪些文件、测试用例、风险
3. 使用决策原则解决歧义
4. 报告完成前的自我审查
5. 完成报告：发货内容、做出的决定、任何不确定的事情

A/B 测试：2 倍时间，明显更好的输出。

### gstack-full（完整层）
`openclaw/gstack-full-CLAUDE.md` — 链接现有的 gstack 技能：
1. 阅读 CLAUDE.md 并了解该项目
2. 运行 /autoplan（CEO + 工程师 + 设计审核）
3. 执行批准的计划
4. 运行 /ship 创建 PR
5. 报告 PR URL 和决定

### gstack-plan（计划层）
`openclaw/gstack-plan-CLAUDE.md` — 全面审查挑战，未实施：
1. 运行 /office-hours 生成设计文档
2. 运行 /autoplan（CEO + 工程师 + 设计 + DX 评论 + 法典对抗）
3. 将审核后的计划保存到 `plans/<project-slug>-plan-<date>.md`
4. 报告反馈：计划路径、总结、关键决策、建议的下一步

协调器将计划链接保存到它自己的内存存储（大脑存储库，
知识库，或 AGENTS.md 中配置的任何内容）。当用户在
准备构建，生成一个引用已保存计划的完整会话。

### 本土方法论技能
发布到 ClawHub。使用 `clawhub install` 安装：
- `gstack-openclaw-office-hours` — 产品询问（6 个强制问题）
- `gstack-openclaw-ceo-review` — 战略挑战（10 部分回顾，4 种模式）
- `gstack-openclaw-investigate` — 操作调试（4 阶段方法）
- `gstack-openclaw-retro` — 运营回顾（每周回顾）

源代码位于 gstack 存储库中的 `openclaw/skills/` 中。这些都是手工制作的
针对 OpenClaw 对话环境的 gstack 方法的改编。
没有 gstack 基础设施（没有浏览、没有遥测、没有序言）。

## 生成会话检测

当 Claude Code 在 OpenClaw 生成的会话中运行时，`OPENCLAW_SESSION`
应设置环境变量。 gstack 检测到这一点并进行调整：
- 跳过交互式提示（自动选择推荐选项）
- 跳过升级检查和遥测提示
- 专注于任务完成和散文报告

在session_spawn中设置环境变量：`env: { OPENCLAW_SESSION: "1" }`

## 安装

对于 OpenClaw 用户：告诉您的 OpenClaw 代理“为 openclaw 安装 gstack”。

代理人应该：
1. 将 gstack-lite CLAUDE.md 安装到其编码会话模板中
2. 安装 4 项本机方法技能
3. 将调度路由添加到 AGENTS.md
4. 通过测试生成进行验证

对于 gstack 开发人员：`./setup --host openclaw` 输出此文档。
实际的工件是由 `bun run gen:skill-docs --host openclaw` 生成的。

## 我们不做什么

- 无调度守护进程（ACP 处理会话生成）
- 无爪甲继电器（无需安全层）
- 没有双向学习桥梁（大脑存储库是知识库）
- 无 JSON 模式或协议版本控制
- gstack 中没有 SOUL.md（OpenClaw 有自己的）
- 没有完整的技能移植（编码技能仍然是克劳德代码的本机）