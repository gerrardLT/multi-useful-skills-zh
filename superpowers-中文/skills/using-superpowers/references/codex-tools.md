# Codex 工具映射

skills 默认使用 Claude Code 的工具名。当你在 skill 中看到这些名字时，请改用你所在平台上的等价能力：

| Skill references | Codex equivalent |
|-----------------|------------------|
| `Task` tool（派发 subagent） | `spawn_agent`（见下方 [具名 agent 派发](#named-agent-dispatch)） |
| 多次 `Task` 调用（并行） | 多次 `spawn_agent` 调用 |
| Task 返回结果 | `wait` |
| Task 自动完成 | `close_agent` 释放槽位 |
| `TodoWrite`（任务跟踪） | `update_plan` |
| `Skill` tool（调用 skill） | skills 原生加载，直接按说明执行 |
| `Read`、`Write`、`Edit`（文件） | 使用你的原生文件工具 |
| `Bash`（运行命令） | 使用你的原生 shell 工具 |

## Subagent 派发需要开启多 agent 支持

在你的 Codex 配置里（`~/.codex/config.toml`）加入：

```toml
[features]
multi_agent = true
```

这样才能启用 `spawn_agent`、`wait` 和 `close_agent`，供 `dispatching-parallel-agents`、`subagent-driven-development` 等 skills 使用。

## 具名 agent 派发

Claude Code 的 skills 会引用具名 agent 类型，比如 `superpowers:code-reviewer`。  
Codex 没有具名 agent 注册表，`spawn_agent` 只会创建通用 agent，角色来自内置类型（`default`、`explorer`、`worker`）。

当某个 skill 要求你派发具名 agent 类型时：

1.  找到这个 agent 对应的 prompt 文件（例如 `agents/code-reviewer.md`，或 skill 本地的 prompt 模板如 `code-quality-reviewer-prompt.md`）
2.  读出 prompt 内容
3.  填充所有模板占位符（`{BASE_SHA}`、`{WHAT_WAS_IMPLEMENTED}` 等）
4.  使用填充后的内容作为 `message`，派发一个 `worker` agent

| Skill instruction | Codex equivalent |
|-------------------|------------------|
| `Task tool (superpowers:code-reviewer)` | `spawn_agent(agent_type="worker", message=...)`，内容来自 `code-reviewer.md` |
| `Task tool (general-purpose)` with inline prompt | `spawn_agent(message=...)`，直接使用相同 prompt |

### 消息构建

`message` 参数属于用户层输入，而不是 system prompt。为了让指令遵循度更高，建议这样组织：

```text
Your task is to perform the following. Follow the instructions below exactly.

<agent-instructions>
[filled prompt content from the agent's .md file]
</agent-instructions>

Execute this now. Output ONLY the structured response following the format
specified in the instructions above.
```

-   用任务委派式表达（`Your task is...`），不要用人格设定式表达（`You are...`）
-   用 XML 标签包住指令块，模型会把带标签内容视为更权威
-   最后加明确执行指令，避免它只是总结 instructions 而不真正执行

### 什么时候这个 workaround 可以去掉

这个方案是为了弥补 Codex 插件系统目前还不支持在 `plugin.json` 中声明 `agents` 字段。等 `RawPluginManifest` 增加 `agents` 字段后，插件就可以像 `skills/` 一样通过符号链接暴露 `agents/`，届时 skills 就能直接派发具名 agent 类型。

## 环境检测

那些会创建 worktree 或收尾分支的 skills，在继续前应该先用只读 git 命令检测当前环境：

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

-   `GIT_DIR != GIT_COMMON` -> 说明你已经在 linked worktree 中（跳过创建）
-   `BRANCH` 为空 -> detached HEAD（无法在当前沙箱里正常 branch / push / PR）

具体如何使用这些信号，可参见 `using-git-worktrees` 的 Step 0，以及 `finishing-a-development-branch` 的 Step 1。

## Codex App 收尾方式

如果沙箱因为 detached HEAD 或外部管理 worktree 而阻止分支 / push 操作，agent 仍应完成以下事情：
-   把所有工作提交好
-   告知用户使用 App 的原生控件继续

典型控件包括：
-   **"Create branch"** -> 创建分支后，再通过 App UI 完成 commit / push / PR
-   **"Hand off to local"** -> 把工作转交到用户本地 checkout

agent 仍然可以：
-   跑测试
-   stage 文件
-   输出建议的分支名、commit message 和 PR description，供用户直接复用