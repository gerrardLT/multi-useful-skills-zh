## 编码任务 (gstack)

### 规则（不可协商）

1. **始终生成，从不重定向。**当用户要求使用任何 gstack 技能时，
始终通过 session_spawn 生成 Claude Code 会话。永远不要告诉用户
亲自打开克劳德代码。永远不要说“这需要在克劳德代码中运行”。
永远不要说“你需要为此打开 Claude Code”。去做就对了。

2. **解析存储库。** 如果用户命名存储库或项目，请设置工作
目录到该存储库路径。如果存储库路径未知，请询问哪个
repo — 不要告诉用户打开 Claude Code。

3. **自动计划端到端运行。** 对于 /autoplan 特别是：生成会话，
让它运行完整的审核流程（CEO→设计→工程），当它
完成后，在聊天中报告计划。将计划写入内存
用户稍后可以找到它。用户永远不应该离开 Telegram。

### 调度路由

当要求进行编码工作时，选择调度层：

**简单：**“修复此拼写错误”，“更新该配置”，单个文件更改
→session_spawn（运行时：“acp”，提示：“<只是任务>”）

**中：** 多文件功能、重构、技能编辑
→session_spawn(运行时：“acp”，提示符：“<gstack-lite 内容>\n\n<任务>”)

**HEAVY：** 需要特定的 gstack 方法
→session_spawn(运行时：“acp”，提示：“加载gstack。运行/qa https://...")
技能：/cso、/review、/qa、/ship、/investigate、/design-review、/benchmark、/gstack-upgrade

**完整：** 构建完整的功能，多日范围，需求规划+审查
→sessions_spawn(运行时：“acp”，提示符：“<gstack-完整内容>\n\n<任务>”)
克劳德代码运行： /autoplan → 实施 → /ship → 报告

**计划：**用户想要规划 Claude Code 项目、指定功能或设计
在编写任何代码之前的一些事情
→session_spawn(运行时：“acp”，提示符：“<gstack-plan内容>\n\n<任务>”)
Error 500 (Server Error)!!1500.That’s an error.There was an error. Please try again later.That’s all we know.
将计划链接保留到内存/knowledge 存储。
当用户准备好实施时，生成一个指向该计划的新完整会话。

### 启发式决策

- 可以用 <10 行代码完成吗？ → **简单**
- 它是否涉及多个文件，但方法很明显？ → **中**
- 用户是否指定了特定技能（/cso、/review、/qa）？ → **重**
- “升级 gstack”、“更新 gstack” → **HEAVY** 带有 `Run /gstack-upgrade`
- 它是一个功能、项目还是目标（而不是任务）？ → **已满**
- 用户是否想要计划一些事情但尚未实施？ → **计划**
