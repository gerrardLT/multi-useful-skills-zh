---
name: using-superpowers
description: 在任何对话开始时使用，用来建立如何查找和使用 skills 的方式，并要求在任何回应之前调用 Skill 工具，包括澄清问题也不例外
---

<SUBAGENT-STOP>
如果你是作为 subagent 被派发来执行某个具体任务的，请跳过这个 skill。
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
如果你觉得某个 skill 哪怕只有 1% 的可能适用于你当前在做的事情，你都绝对必须调用它。

如果某个 SKILL 适用于你的任务，你就没有选择权。你必须使用它。

这不是可以协商的。这不是可选项。你不能靠自我合理化来绕开它。
</EXTREMELY-IMPORTANT>

## 指令优先级

Superpowers skills 会覆盖默认 system prompt 的行为，但 **用户指令始终优先级更高**：

1. **用户的显式指令**（`CLAUDE.md`、`GEMINI.md`、`AGENTS.md`、直接请求）-> 最高优先级
2. **Superpowers skills** -> 在与默认系统行为冲突时覆盖它
3. **默认 system prompt** -> 最低优先级

如果 `CLAUDE.md`、`GEMINI.md` 或 `AGENTS.md` 说“不要用 TDD”，而某个 skill 说“总是使用 TDD”，那就遵从用户指令。控制权在用户手里。

## 如何访问 Skills

**在 Claude Code 中：** 使用 `Skill` 工具。调用 skill 后，它的内容会被加载并呈现给你，然后直接照着执行。绝不要用 Read 工具去读 skill 文件。

**在 Copilot CLI 中：** 使用 `skill` 工具。skills 会从已安装插件中自动发现。`skill` 工具的工作方式与 Claude Code 的 `Skill` 工具相同。

**在 Gemini CLI 中：** skills 通过 `activate_skill` 工具激活。Gemini 会在会话开始时加载 skill 元数据，并在需要时按需激活完整内容。

**在其他环境中：** 查看平台文档，确认 skills 是如何加载的。

## 平台适配

skills 默认使用 Claude Code 的工具名。对于非 CC 平台：参见 `references/copilot-tools.md`（Copilot CLI）和 `references/codex-tools.md`（Codex）中的工具映射。Gemini CLI 用户会通过 `GEMINI.md` 自动加载这些映射。

# 使用 Skills

## 规则

**在做出任何回应或动作之前，先调用相关或被请求的 skills。** 只要有 1% 的可能某个 skill 会适用，你就应该先调用它来确认。即使后来发现调用错了，也没关系，你可以不继续使用它。

```dot
digraph skill_flow {
    "User message received" [shape=doublecircle];
    "About to EnterPlanMode?" [shape=doublecircle];
    "Already brainstormed?" [shape=diamond];
    "Invoke brainstorming skill" [shape=box];
    "Might any skill apply?" [shape=diamond];
    "Invoke Skill tool" [shape=box];
    "Announce: 'Using [skill] to [purpose]'" [shape=box];
    "Has checklist?" [shape=diamond];
    "Create TodoWrite todo per item" [shape=box];
    "Follow skill exactly" [shape=box];
    "Respond (including clarifications)" [shape=doublecircle];

    "About to EnterPlanMode?" -> "Already brainstormed?";
    "Already brainstormed?" -> "Invoke brainstorming skill" [label="no"];
    "Already brainstormed?" -> "Might any skill apply?" [label="yes"];
    "Invoke brainstorming skill" -> "Might any skill apply?";

    "User message received" -> "Might any skill apply?";
    "Might any skill apply?" -> "Invoke Skill tool" [label="yes, even 1%"];
    "Might any skill apply?" -> "Respond (including clarifications)" [label="definitely not"];
    "Invoke Skill tool" -> "Announce: 'Using [skill] to [purpose]'";
    "Announce: 'Using [skill] to [purpose]'" -> "Has checklist?";
    "Has checklist?" -> "Create TodoWrite todo per item" [label="yes"];
    "Has checklist?" -> "Follow skill exactly" [label="no"];
    "Create TodoWrite todo per item" -> "Follow skill exactly";
}
```

## 危险信号

如果你脑子里出现下面这些念头，立刻停下。你正在给自己找借口：

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | 问题也是任务。先检查有没有 skill。 |
| "I need more context first" | 检查 skill 必须发生在澄清问题之前。 |
| "Let me explore the codebase first" | skills 会告诉你该如何探索。先检查。 |
| "I can check git/files quickly" | 文件没有对话上下文。先检查 skill。 |
| "Let me gather information first" | skills 会告诉你该如何收集信息。 |
| "This doesn't need a formal skill" | 如果有对应 skill，就要用。 |
| "I remember this skill" | skill 会演化。读当前版本。 |
| "This doesn't count as a task" | 有行动就是任务。先检查。 |
| "The skill is overkill" | 简单事情也可能变复杂。照样要用。 |
| "I'll just do this one thing first" | 在做任何事情之前先检查。 |
| "This feels productive" | 无纪律的行动会浪费时间，skills 是为了防止这种情况。 |
| "I know what that means" | 知道概念不等于真的用了 skill。去调用它。 |

## Skill 优先级

当多个 skills 都可能适用时，按这个顺序来：

1. **先流程类 skills**（如 `brainstorming`、`debugging`）-> 它们决定该如何处理任务
2. **再实现类 skills**（如 `frontend-design`、`mcp-builder`）-> 它们指导具体执行

"Let's build X" -> 先 `brainstorming`，再实现类 skills。
"Fix this bug" -> 先 `debugging`，再领域相关 skills。

## Skill 类型

**Rigid**（如 TDD、debugging）：必须严格照做，不要擅自弱化纪律。

**Flexible**（如 patterns）：可以根据上下文调整原则。

skill 本身会说明它属于哪一类。

## 用户指令

用户指令定义的是做什么（WHAT），不是怎么做（HOW）。像 “Add X” 或 “Fix Y” 这样的要求，并不意味着你可以跳过工作流。