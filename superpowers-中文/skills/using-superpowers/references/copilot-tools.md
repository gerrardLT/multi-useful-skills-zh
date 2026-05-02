# Copilot CLI 工具映射

技能默认使用 Claude Code 的工具名。当你在技能里看到这些名字时，请改用 Copilot CLI 上的等价能力：

| 技能引用 | Copilot CLI 等价物 |
|-----------------|----------------------|
| `Read`（读文件） | `view` |
| `Write`（创建文件） | `create` |
| `Edit`（编辑文件） | `edit` |
| `Bash`（运行命令） | `bash` |
| `Grep`（搜索文件内容） | `grep` |
| `Glob`（按文件名搜索） | `glob` |
| `Skill` 工具（调用技能） | `skill` |
| `WebFetch` | `web_fetch` |
| `Task` 工具（派发子代理） | `task`（见下方 [代理类型](#agent-types)） |
| 多次 `Task` 调用（并行） | 多次 `task` 调用 |
| Task 状态 / 输出 | `read_agent`、`list_agents` |
| `TodoWrite`（任务跟踪） | `sql` + 内置 `todos` 表 |
| `WebSearch` | 无直接等价物 -> 用 `web_fetch` 搭配搜索引擎 URL |
| `EnterPlanMode` / `ExitPlanMode` | 无直接等价物 -> 保持在主会话中 |

## 代理类型

Copilot CLI 的 `task` 工具有一个 `agent_type` 参数：

| Claude Code 代理 | Copilot CLI 等价物 |
|-------------------|----------------------|
| `general-purpose` | `"general-purpose"` |
| `Explore` | `"explore"` |
| 具名插件代理（例如 `superpowers:code-reviewer`） | 会从已安装插件中自动发现 |

## 异步 Shell 会话

Copilot CLI 支持持久化的异步 shell 会话，这在 Claude Code 里没有直接对应能力：

| 工具 | 用途 |
|------|---------|
| `bash` with `async: true` | 启动后台长时间运行的命令 |
| `write_bash` | 向运行中的异步会话发送输入 |
| `read_bash` | 读取异步会话输出 |
| `stop_bash` | 终止异步会话 |
| `list_bash` | 列出所有活跃 shell 会话 |

## 其他 Copilot CLI 工具

| 工具 | 用途 |
|------|---------|
| `store_memory` | 将代码库事实持久化，供未来会话使用 |
| `report_intent` | 更新 UI 状态栏中的当前意图 |
| `sql` | 查询会话内置的 SQLite 数据库（todos、metadata） |
| `fetch_copilot_cli_documentation` | 查询 Copilot CLI 官方文档 |
| GitHub MCP 工具（`github-mcp-server-*`） | 原生 GitHub API 能力（issues、PRs、code search） |