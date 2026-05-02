# Gemini CLI 工具映射

技能默认使用 Claude Code 的工具名。当你在某个技能中看到这些名称时，请使用 Gemini CLI 上的等价工具：

| Skill references | Gemini CLI equivalent |
|-----------------|----------------------|
| `Read`（读文件） | `read_file` |
| `Write`（创建文件） | `write_file` |
| `Edit`（编辑文件） | `replace` |
| `Bash`（运行命令） | `run_shell_command` |
| `Grep`（搜索文件内容） | `grep_search` |
| `Glob`（按文件名搜索） | `glob` |
| `TodoWrite`（任务跟踪） | `write_todos` |
| `Skill` tool（调用技能） | `activate_skill` |
| `WebSearch` | `google_web_search` |
| `WebFetch` | `web_fetch` |
| `Task` tool（派发子代理） | 无直接等价物 -> Gemini CLI 不支持子代理 |

## 不支持子代理

Gemini CLI 没有 Claude Code 的 `Task` 工具对应能力。那些依赖子代理派发的技能（例如 `subagent-driven-development`、`dispatching-parallel-agents`）在 Gemini CLI 中应退回为单会话执行，通常改走 `executing-plans`。

## Gemini CLI 的额外工具

以下工具在 Gemini CLI 中可用，但 Claude Code 没有直接对应：

| Tool | Purpose |
|------|---------|
| `list_directory` | 列出文件和子目录 |
| `save_memory` | 把事实写入 `GEMINI.md`，供跨会话复用 |
| `ask_user` | 向用户请求结构化输入 |
| `tracker_create_task` | 更丰富的任务管理（创建、更新、列出、可视化） |
| `enter_plan_mode` / `exit_plan_mode` | 在实际改动前切换到只读研究模式 |