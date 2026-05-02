# 使用 Slash Commands 的 PM Skills 101

**适用平台：** Claude Code（主力） / Cursor / Windsurf / Gemini CLI  
**仓库：** [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills)

如果你刚接触 PM Skills，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。
---

## 什么是 Slash Command？
Slash command 是一种快捷方式，你可以用一个关键词，直接从 CLI 或聊天界面调用一个 skill，或者任意 prompt。
你不再需要这样：
```
claude "Read skills/user-story/SKILL.md and write user stories for: our checkout abandonment epic"
```

而是这样输入：
```
/pm-story our checkout abandonment epic
```

核心价值就这么简单：一次按键，一个框架，稳定输出。
这里有两类最值得了解：

| 类型 | 它是什么 | 谁控制它 |
|---|---|---|
| **内置命令** | Claude Code 原生命令，例如 `/init`、`/review`、`/compact` | Anthropic |
| **自定义命令** | 你把 `.md` 文件放进 `.claude/commands/` 后自定义出来的命令 | 你自己 |

对 PM 工作来说，真正有杠杆的是自定义命令。
---

## 第 1 部分：Claude Code 内置命令

这些命令是 Claude Code 自带的，在你构建自己的命令前，先掌握它们很值。
### 会话管理

| 命令 | 它的作用 | PM 用例 |
|---|---|---|
| `/init` | 读取项目根目录并生成一个 `CLAUDE.md` | 项目刚开始时运行一次，自动探测上下文；之后你再手动添加 skill 引用 |
| `/clear` | 清空对话历史，重新开始 | 当你在同一 session 中从一个 epic 切到另一个领域时使用，避免上下文串味 |
| `/compact` | 总结历史对话，释放上下文窗口 | 当长会话开始退化时使用，保留 skills，清除噪音 |

### 代码与审查
| 命令 | 它的作用 | PM 用例 |
|---|---|---|
| `/review` | 审查 staged 的 git changes | 如果你在做 PRD-as-code 或 docs-as-code 工作流，这个很有用 |
| `/help` | 列出可用命令和选项 | 新会话开场的好帮手 |

### 关键工作流提示
`/init` -> 然后编辑 `CLAUDE.md` 加入你的 skill 引用 -> 当你切换上下文时用 `/clear`。
这个三步模式，是干净的 Claude Code PM session 的基础。
---

## 第 2 部分：自定义 Slash Commands

这部分才是 PM Skills 变成一等工具的地方。
### 它如何工作

1. 在项目根目录创建一个 `.claude/commands/` 文件夹
2. 往里面放一个 `.md` 文件，文件名就是命令名
3. Claude Code 会自动注册它
4. 你输入 `/<filename>`，Claude 就执行这个文件里的 prompt 内容

`.md` 文件里可以包含：
- 静态 prompt 文本
- `$ARGUMENTS` 占位符（接收命令名后你输入的全部内容）
- 对项目中其他文件的引用
### 目录结构

```text
your-project/
.claude/
  commands/
    pm-story.md
    pm-prd.md
    pm-probe.md
    pm-prioritize.md
    pm-epic.md
    pm-problem.md
CLAUDE.md
skills/ (or link to your Product-Manager-Skills clone)
```

---

## 第 3 部分：可直接拿来用的 PM Skill Commands

把下面这些文件复制到你项目的 `.claude/commands/` 中。每个命令都把一个 PM skill 封装成一个单命令入口。
---

### `/pm-story` - 写 User Stories

**文件：** `.claude/commands/pm-story.md`

```markdown
Read skills/user-story/SKILL.md and apply it to write user stories for:

$ARGUMENTS

For each story, produce:
- User story in "As a / I want / So that" format
- 2-3 Gherkin acceptance criteria (Given / When / Then)
- Story size estimate (S/M/L)
- Any assumptions or open questions

Flag anything that looks like it needs splitting before it's sprint-ready.
```

### `/pm-prd` - 启动 PRD

**文件：** `.claude/commands/pm-prd.md`

```markdown
Read skills/prd-development/SKILL.md and begin the PRD development workflow for:

$ARGUMENTS

Start with Phase 1: problem statement and context.
Ask me the questions you need before generating any sections.
Do not skip to the solution until we've agreed on the problem.
```

### `/pm-probe` - 设计 POL Probe

**文件：** `.claude/commands/pm-probe.md`

```markdown
Read skills/pol-probe/SKILL.md and apply it to design a validation experiment for this hypothesis:

$ARGUMENTS
```

### `/pm-prioritize` - 推荐 Prioritization Framework

**文件：** `.claude/commands/pm-prioritize.md`

```markdown
Read skills/prioritization-advisor/SKILL.md and run the interactive prioritization advisor.

Context: $ARGUMENTS

Ask me the questions needed to recommend the right framework for my situation.
Do not recommend a framework until you've asked at least 3 clarifying questions.
```

### `/pm-epic` - 拆 Epic

**文件：** `.claude/commands/pm-epic.md`

```markdown
Read skills/epic-breakdown-advisor/SKILL.md and apply it to split this epic:

$ARGUMENTS
```

### `/pm-problem` - 框 Problem Statement

**文件：** `.claude/commands/pm-problem.md`

```markdown
Read skills/problem-statement/SKILL.md and help me frame a problem statement for:

$ARGUMENTS
```

### `/pm-roadmap` - 启动 Roadmap Planning

**文件：** `.claude/commands/pm-roadmap.md`

```markdown
Read skills/roadmap-planning/SKILL.md and begin the roadmap planning workflow.

Context: $ARGUMENTS
```

---

## 第 4 部分：`$ARGUMENTS` 用法提示

`$ARGUMENTS` 会捕获你在命令名后输入的所有内容。
**给上下文，不要只给话题名：**
```
# 太薄
/pm-story checkout

# 更好
/pm-story checkout abandonment for returning customers who have saved payment info
```

**你也可以传结构化上下文：**
```
/pm-prioritize
  product: B2B SaaS
  stage: post-PMF, scaling
  team: 4 PMs
  constraint: hard Q2 launch date
  backlog size: ~60 items
```

**你也可以引用项目文件：**
```
/pm-prd see docs/briefs/notifications-brief.md for full context
```

---

## 第 5 部分：在一个 Session 里组合命令
一个典型的 PM 流程可以这样串：

```bash
/pm-problem enterprise users can't self-serve seat management
/pm-probe admins want self-serve seat management but IT blocks it for compliance reasons
/pm-story seat management - admin can add, remove, and reassign seats without contacting support
/pm-epic seat management epic - covers add seats, remove seats, reassign, bulk actions, audit log
/pm-prioritize we have 8 seat management stories and a hard Q3 date
```

每个命令都延续同一个 session 的上下文，不需要你反复重述。
---

## 第 6 部分：其他平台里的等价玩法
自定义 slash commands 是 Claude Code 原生能力。其他平台可以用等价方式模拟。
### 平台：Cursor
用 `prompts/` 文件夹 + `@file` 引用，效果最接近。
### Windsurf
和 Cursor 类似，用 rules 文件 + `@filename`。
### Gemini CLI
用 `GEMINI.md` + `@file` 引用模式来替代。
### ChatGPT / Codex
没有真正的自定义 slash commands，就用 Project / GPT instructions + 自然语言调用。
### n8n / LangFlow
没有 slash commands，但你可以做一个 keyword router，把 `/pm-story` 这种前缀映射到对应 skill。
---

## 快速参考卡

### Claude Code 内置命令
| 命令 | 何时使用 |
|---|---|
| `/init` | 新项目开始 |
| `/clear` | 中途切换上下文 |
| `/compact` | 会话过长变慢 |
| `/review` | 检查 docs-as-code / spec 改动 |
| `/help` | 忘了当前有哪些可用命令 |

### 常用 PM 自定义命令
| 命令 | 它调用的 Skill |
|---|---|
| `/pm-story` | `user-story` |
| `/pm-prd` | `prd-development` |
| `/pm-probe` | `pol-probe` |
| `/pm-prioritize` | `prioritization-advisor` |
| `/pm-epic` | `epic-breakdown-advisor` |
| `/pm-problem` | `problem-statement` |
| `/pm-roadmap` | `roadmap-planning` |

---

## 更多资源

- **Skills 仓库：** `github.com/deanpeters/Product-Manager-Skills`
- **Claude Code 文档：** `docs.anthropic.com/claude-code`
- **CLAUDE.md 参考：** skills 仓库里的 `docs/Using PM Skills with Claude.md`
- **AGENTS.md：** 仓库根目录里的多 agent orchestration 模式
- **自己做命令：** 复制任意示例，把 skill path 换成你自己的