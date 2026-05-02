# Superpowers 发布说明

## v5.0.7 (2026-03-31)

### 平台支持：GitHub Copilot CLI

- **会话开始上下文注入** — Copilot CLI v1.0.11 在会话开始钩子输出中增加了对 `additionalContext` 的支持。会话开始钩子现在会检测 `COPILOT_CLI` 环境变量，并发出符合 SDK 标准的 `{ "additionalContext": "..." }` 格式，让 Copilot CLI 用户在会话开始时获得完整的 superpowers 引导。（原始修复由 @culinablaz 在 PR #910 中提供）
- **工具映射** — 添加了 `references/copilot-tools.md`，其中包含完整的 Claude Code 到 Copilot CLI 工具等效表
- **技能和 README 更新** — 在 `using-superpowers` 技能的平台说明和 README 安装部分中添加了 Copilot CLI

### 平台：OpenCode 修复

- **技能路径一致性** — 引导文本不再宣传与运行时路径不匹配的误导性 `configDir/skills/superpowers/` 路径。代理应使用原生的 `skill` 工具，而不是通过路径导航到文件。测试现在使用从单一事实来源派生的一致路径。（#847, #916）
- **引导作为用户消息** — 将引导注入从 `experimental.chat.system.transform` 移至 `experimental.chat.messages.transform`，将其添加到第一条用户消息之前，而不是添加系统消息。避免了系统消息每轮重复导致的 token 膨胀（#750），并修复了与 Qwen 和其他在多个系统消息上出错的模型的兼容性问题（#894）。

## v5.0.6 (2026-03-24)

### 内联自审取代子代理评审循环

代理现在在计划/规范阶段执行内联自审，而不是启动子代理评审循环。这将每个阶段的 token 使用量减少了约 25%，并将端到端时间缩短了约 5 分钟，同时保持了质量。自审清单专注于关键问题：占位符扫描、内部一致性、范围检查和歧义检查。

- **头脑风暴** — 用内联规范自审清单（占位符扫描、内部一致性、范围检查、歧义检查）取代了规范评审循环（子代理调度 + 3 次迭代上限）。
- **编写计划** — 用内联自审清单（规范覆盖、占位符扫描、类型一致性）取代了计划评审循环（子代理调度 + 3 次迭代上限）。
- **编写计划** — 添加了明确的“无占位符”部分，定义了计划失败的情况（TBD、模糊描述、未定义引用、“类似于任务 N”）。
- 通过消除不必要的评审轮次并收紧评审重点，显著减少了 token 使用量并加快了规范和计划的评审速度。

### 服务：头脑风暴

- **会话目录重构** — 头脑风暴服务器会话目录现在包含两个同级子目录：`content/`（提供给浏览器的 HTML 文件）和 `state/`（事件、服务器信息、PID、日志）。之前，服务器状态和用户交互数据与提供的内容一起存储，使其可通过 HTTP 访问。`screen_dir` 和 `state_dir` 路径都包含在服务器启动的 JSON 中。（由 鍚夌敯浠? 报告）

### Bug 修复

- **所有者 PID 生命周期修复** — 头脑风暴服务器的所有者 PID 监控存在两个导致 60 秒内误关闭的错误：(1) 来自跨用户 PID（Tailscale SSH 等）的 EPERM 被视为“进程已终止”，(2) 在 WSL 上，祖父 PID 解析为一个短命子进程，在第一次生命周期检查之前就退出了。通过将 EPERM 视为“存活”并在启动时验证所有者 PID 来修复 — 如果它已经终止，则禁用监控，服务器依赖 30 分钟空闲超时。这也移除了 `start-server.sh` 中针对 Windows/MSYS2 的特定处理，因为服务器现在可以通用处理。（#879）
- **编写技能** — 纠正了关于 SKILL.md 前置元数据“仅支持两个字段”的错误说法；现在说明是“两个必需字段”，并链接到 agentskills.io 规范以获取所有支持的字段（PR #882 由 @arittr 提供）。

### 应用兼容性：Codex

- **codex-tools** — 添加了命名代理调度映射，记录了如何将 Claude Code 的命名代理类型转换为 Codex 的 `spawn_agent` 及其工作者角色（PR #647 由 @arittr 提供）。
- **codex-tools** — 为工作区感知技能添加了环境检测和 Codex App 完成部分（由 @arittr 提供）。
- **设计规范** — 添加了 Codex App 兼容性设计规范（PRI-823），涵盖只读环境检测、工作区安全技能行为和沙盒回退模式（由 @arittr 提供）。

## v5.0.5 (2026-03-17)

### Bug 修复

- **头脑风暴服务器 ESM 修复** — 将 `server.js` 重命名为 `server.cjs`，以便头脑风暴服务器在 Node.js 22+ 上正确启动，因为根 `package.json` 中的 `"type": "module"` 导致 `require()` 失败。（PR #784 由 @sarbojitrana 提供，修复 #774, #780, #783）
- **Windows 上的头脑风暴所有者 PID** — 在 Windows/MSYS2 上跳过 PID 生命周期监控，因为 Node.js 无法看到 PID 命名空间，防止服务器在 60 秒后自行终止。（#770，文档来自 PR #768 由 @lucasyhzlu-debug 提供）
- **stop-server.sh 可靠性** — 在报告成功之前验证服务器进程确实已终止。SIGTERM + 2 秒等待 + SIGKILL 回退。（#723）

### 变更

- **执行交接** — 恢复了用户在计划编写后选择子代理驱动或内联执行的权利。推荐使用子代理驱动，但不再是强制性的。

## v5.0.4 (2026-03-16)

### 审查循环优化

通过消除不必要的审查轮次并收紧审查重点，显著减少了 token 使用量并加快了规范和计划的审查速度。

- **单次整体计划审查** — 计划审查员现在一次性审查完整计划，而不是分块审查。移除了所有与块相关的概念（`## Chunk N:` 标题、1000 行块限制、按块调度）。
- **提高阻塞问题的门槛** — 规范和计划审查员提示现在都包含一个“校准”部分：只标记那些在实施过程中会导致真正问题的问题。轻微的措辞、风格偏好和格式上的吹毛求疵不应阻止批准。
- **减少最大审查迭代次数** — 规范和计划审查循环都从 5 次减少到 3 次。如果审查员校准正确，3 轮就足够了。
- **精简审查员清单** — 规范审查员从 7 个类别精简到 5 个；计划审查员从 7 个精简到 4 个。移除了以格式为重点的检查（任务语法、块大小），转而关注实质内容（可构建性、规范一致性）。

### 平台：OpenCode

- **单行插件安装** — OpenCode 插件现在通过 `config` 钩子自动注册技能目录。不需要符号链接或 `skills.paths` 配置。安装只需在 `opencode.json` 中添加一行。（PR #753）
- **添加了 `package.json`**，以便 OpenCode 可以从 git 将 superpowers 作为 npm 包安装。

### Bug 修复

- **验证服务器确实已停止** — `stop-server.sh` 现在在报告成功之前确认进程已终止。SIGTERM + 2 秒等待 + SIGKILL 回退。如果进程存活则报告失败。（PR #751）
- **通用代理语言** — 头脑风暴伴侣等待页面现在显示“代理”而不是“Claude”。

## v5.0.3 (2026-03-15)

### 平台：Cursor 支持

- **Cursor 钩子** — 添加了 `hooks/hooks-cursor.json`，采用 Cursor 的驼峰式格式（`sessionStart`, `version: 1`），并更新了 `.cursor-plugin/plugin.json` 以引用它。修复了 `session-start` 中的平台检测，首先检查 `CURSOR_PLUGIN_ROOT`（Cursor 也可能设置 `CLAUDE_PLUGIN_ROOT`）。（基于 PR #709）

### Bug 修复

- **在 `--resume` 时停止触发 SessionStart 钩子** — 启动钩子在恢复的会话上重新注入了上下文，而这些会话在其对话历史中已经有上下文。钩子现在仅在 `startup`、`clear` 和 `compact` 时触发。
- **Bash 5.3+ 钩子挂起** — 在 `hooks/session-start` 中用 `printf` 替换了 heredoc（`cat <<EOF`）。修复了在 macOS 上使用 Homebrew bash 5.3+ 时，由于 bash 在 heredoc 中进行大型变量展开时的回归导致的无限挂起。（#572, #571）
- **POSIX 安全钩子脚本** — 在 `hooks/session-start` 中用 `$0` 替换了 `${BASH_SOURCE[0]:-$0}`。修复了在 Ubuntu/Debian 上 `/bin/sh` 是 dash 时出现的“Bad substitution”错误。（#553）
- **可移植 shebang** — 在所有 shell 脚本中用 `#!/usr/bin/env bash` 替换了 `#!/bin/bash`。修复了在 NixOS、FreeBSD 和使用 Homebrew bash 的 macOS 上的执行问题，因为 `/bin/bash` 可能过时或缺失。（#700）
- **Windows 上的头脑风暴服务器** — 自动检测 Windows/Git Bash（`OSTYPE=msys*`, `MSYSTEM`）并切换到前台模式，修复了由 `nohup`/`disown` 进程回收导致的服务器静默失败。（#737）
- **Codex 文档修复** — 在 Codex 文档中用 `multi_agent` 替换了已弃用的 `collab` 标志。（PR #749）

## v5.0.2 (2026-03-11)

### 零依赖头脑风暴服务器

**移除了所有供应商 node_modules — server.js 现在完全自包含**

- 用零依赖的 Node.js 服务器替换了 Express/Chokidar/WebSocket 依赖，使用内置的 `http`、`fs` 和 `crypto` 模块
- 移除了约 1,200 行供应商 `node_modules/`、`package.json` 和 `package-lock.json`
- 自定义 WebSocket 协议实现（RFC 6455 帧、ping/pong、正确的关闭握手）
- 原生 `fs.watch()` 文件监视替代了 Chokidar
- 完整的测试套件：HTTP 服务、WebSocket 协议、文件监视和集成测试

### 服务可靠性：头脑风暴

- **空闲 30 分钟后自动退出** — 当没有客户端连接时服务器关闭，防止孤儿进程
- **所有者进程跟踪** — 服务器监控父线程 PID，并在拥有会话终止时退出
- **活性检查** — 技能在重用现有实例之前验证服务器是否响应
- **编码修复** — 在提供的 HTML 页面上正确设置 `<meta charset="utf-8">`

### 子代理上下文隔离

- 所有委派技能（头脑风暴、调度并行代理、请求代码审查、子代理驱动开发、编写计划）现在都包含上下文隔离原则
- 子代理仅接收其所需的上下文，防止上下文窗口污染

## v5.0.1 (2026-03-10)

### 规范兼容：Agentskills

**头脑风暴服务器移入技能目录**

- 根据 [agentskills.io](https://agentskills.io) 规范，将 `lib/brainstorm-server/` 移至 `skills/brainstorming/scripts/`
- 所有 `${CLAUDE_PLUGIN_ROOT}/lib/brainstorm-server/` 引用都替换为相对的 `scripts/` 路径
- 技能现在完全可跨平台移植 — 不需要特定于平台的环境变量来定位脚本
- `lib/` 目录已移除（是最后剩余的内容）

### 新功能

**Gemini CLI 扩展**

- 通过仓库根目录的 `gemini-extension.json` 和 `GEMINI.md` 提供原生 Gemini CLI 扩展支持
- `GEMINI.md` 在会话开始时 @imports `using-superpowers` 技能和工具映射表
- Gemini CLI 工具映射参考（`skills/using-superpowers/references/gemini-tools.md`）— 将 Claude Code 工具名称（Read, Write, Edit, Bash 等）翻译为 Gemini CLI 等效项（read_file, write_file, replace 等）
- 记录了 Gemini CLI 的限制：不支持子代理，技能回退到 `executing-plans`
- 扩展根目录位于仓库根目录，以实现跨平台兼容性（避免 Windows 符号链接问题）
- 在 README 中添加了安装说明

### 改进

**多平台头脑风暴服务器启动**

- visual-companion.md 中包含按平台的启动说明：Claude Code（默认模式）、Codex（通过 `CODEX_CI` 自动前台）、Gemini CLI（`--foreground` 配合 `is_background`）以及其他环境的回退方案
- 服务器现在将启动 JSON 写入 `$SCREEN_DIR/.server-info`，以便代理即使在后台执行隐藏 stdout 时也能找到 URL 和端口

**头脑风暴服务器依赖项捆绑**

- `node_modules` 供应商到仓库中，以便头脑风暴服务器在全新插件安装后立即工作，无需运行时 `npm`
- 从捆绑依赖中移除了 `fsevents`（仅限 macOS 的原生二进制文件；chokidar 在没有它的情况下也能优雅回退）
- 如果 `node_modules` 缺失，则通过 `npm install` 进行回退自动安装

**OpenCode 工具映射修复**

- `TodoWrite` → `todowrite`（之前错误地映射到 `update_plan`）；已根据 OpenCode 源代码验证

### Bug 修复

**Windows/Linux：单引号破坏 SessionStart 钩子** (#577, #529, #644, PR #585)

- hooks.json 中 `${CLAUDE_PLUGIN_ROOT}` 周围的单引号在 Windows（cmd.exe 不将单引号识别为路径分隔符）和 Linux（单引号阻止变量展开）上失败- 修复：将单引号替换为转义双引号 —— 在 macOS bash、Windows cmd.exe、Windows Git Bash 和 Linux 上均有效，且路径中包含空格时也能正常工作
- 已在 Windows 11 (NT 10.0.26200.0) 上使用 Claude Code 2.1.72 和 Git for Windows 验证

**跳过头脑风暴规范审查循环** (#677)

- 规范审查循环（分派规范文档审查子代理，迭代直至批准）存在于“设计之后”的文本部分，但在检查清单和流程图中缺失
- 由于代理更可靠地遵循图表和检查清单而非文本，规范审查步骤被完全跳过
- 在检查清单中添加了步骤 7（规范审查循环），并在点图中添加了相应节点
- 使用 `claude --plugin-dir` 和 `claude-session-driver` 测试：工作者现在能正确分派审查员

**Cursor 安装命令** (PR #676)

- 修复了 README 中的 Cursor 安装命令：`/plugin-add` → `/add-plugin`（通过 Cursor 2.5 发布公告确认）

**头脑风暴中的用户审查关卡** (#565)

- 在规范完成和编写计划交接之间添加了明确的用户审查步骤
- 用户必须在实施计划开始前批准规范
- 检查清单、流程图和文本均已更新以包含新关卡

**会话启动钩子每个平台仅发出一次上下文**

- 钩子现在检测其运行环境是 Claude Code 还是其他平台
- 为 Claude Code 发出 `hookSpecificOutput`，为其他平台发出 `additional_context` —— 防止重复注入上下文

**令牌分析脚本中的代码检查修复**

- `tests/claude-code/analyze-token-usage.py` 中的 `except:` → `except Exception:`

### 维护

**移除死代码**

- 删除了 `lib/skills-core.js` 及其测试 (`tests/opencode/test-skills-core.js`) —— 自 2026 年 2 月起未使用
- 从 `tests/opencode/test-plugin-loading.sh` 中移除了 skills-core 存在性检查

### 社区

- @karuturi — Claude Code 官方市场安装说明 (PR #610)
- @mvanhorn — 会话启动钩子双发修复，OpenCode 工具映射修复
- @daniel-graham — 裸 except 的代码检查修复
- PR #585 作者 — Windows/Linux 钩子引号修复

---

## v5.0.0 (2026-03-09)

### 破坏性变更

**规范和计划目录结构重组**

- 规范（头脑风暴输出）现在保存到 `docs/superpowers/specs/YYYY-MM-DD-<主题>-design.md`
- 计划（编写计划输出）现在保存到 `docs/superpowers/plans/YYYY-MM-DD-<功能名称>.md`
- 用户对规范/计划位置的偏好设置会覆盖这些默认值
- 所有内部技能引用、测试文件和示例路径均已更新以匹配
- 迁移：如需要，将现有文件从 `docs/plans/` 移动到新位置

**在支持子代理的平台上强制使用子代理驱动开发**

编写计划不再提供子代理驱动和执行计划之间的选择。在支持子代理的平台（Claude Code、Codex）上，必须使用子代理驱动开发。执行计划保留给没有子代理能力的平台，并且现在会告知用户 Superpowers 在支持子代理的平台上效果更好。

**执行计划不再分批执行**

移除了“执行 3 个任务然后停止审查”的模式。计划现在连续执行，仅在遇到阻碍时停止。

**斜杠命令已弃用**

`/brainstorm`、`/write-plan` 和 `/execute-plan` 现在会显示弃用通知，引导用户使用相应的技能。这些命令将在下一个主要版本中移除。

### 新功能

**??? 头脑风暴 ??**

????????????????? 头脑风暴 ????????????????????头脑风暴技能 ???????????????????????? 原型???????????????

- `lib/brainstorm-server/` — 带有浏览器辅助库、会话管理脚本和深色/浅色主题框架模板的 WebSocket 服务器（“Superpowers Brainstorming” 带 GitHub 链接）
- `skills/brainstorming/visual-companion.md` — 服务器工作流、屏幕编辑和反馈收集的渐进式披露指南
- `brainstorming` 技能 ??????????????????????????????????????????????????????????????
- ???????????????????????????????????????
- ?????? `tests/brainstorm-server/`

**文档审查系统**

使用子代理分派对规范和计划文档进行自动审查循环：

- `skills/brainstorming/spec-document-reviewer-prompt.md` — 审查员检查完整性、一致性、架构和 YAGNI
- `skills/writing-plans/plan-document-reviewer-prompt.md` — 审查员检查规范对齐、任务分解、文件结构和文件大小
- 头脑风暴在编写设计文档后分派规范审查员
- 编写计划在每个部分后包含基于分块的计划审查循环
- 审查循环重复进行直至批准或在 5 次迭代后升级
- `tests/claude-code/test-document-review-system.sh` 中的端到端测试
- `docs/superpowers/` 中的设计规范和实施计划

**贯穿技能管道的架构指导**

在头脑风暴、编写计划和子代理驱动开发中添加了为隔离而设计和文件大小感知指导：

- **头脑风暴** — 新增部分：“为隔离和清晰而设计”（明确的边界、定义良好的接口、可独立测试的单元）和“在现有代码库中工作”（遵循现有模式，仅进行有针对性的改进）
- **编写计划** — 新增“文件结构”部分：在定义任务前规划文件和职责。新增“范围检查”后备措施：捕获本应在头脑风暴期间分解的多子系统规范
- **SDD 实施者** — 新增“代码组织”部分（遵循计划的文件结构，报告文件增长的问题）和“当你力不从心时”的升级指导
- **SDD 代码质量审查员** — 现在检查架构、单元分解、计划符合性和文件增长
- **规范/计划审查员** — 架构和文件大小已添加到审查标准
- **范围评估** — 头脑风暴现在评估项目是否过大而不适合单个规范。多子系统请求会被尽早标记并分解为子项目，每个子项目都有自己的规范 → 计划 → 实施循环

**子代理驱动开发改进**

- **模型选择** — 根据任务类型选择模型能力的指导：机械实施用廉价模型，集成用标准模型，架构和审查用强大模型
- **实施者状态协议** — 子代理现在报告 DONE、DONE_WITH_CONCERNS、BLOCKED 或 NEEDS_CONTEXT。控制器相应处理每种状态：使用更多上下文重新分派、升级模型能力、拆分任务或升级给人类

### 改进

**指令优先级层次**

在使用 superpowers 中添加了明确的优先级排序：

1. 用户的明确指令（CLAUDE.md、AGENTS.md、直接请求）— 最高优先级
2. Superpowers 技能 — 覆盖默认系统行为
3. 默认系统提示 — 最低优先级

如果 CLAUDE.md 或 AGENTS.md 说“不要使用 TDD”而技能说“始终使用 TDD”，则用户的指令优先。

**SUBAGENT-STOP 关卡**

在使用 superpowers 中添加了 `<SUBAGENT-STOP>` 块。为特定任务分派的子代理现在会跳过该技能，而不是激活 1% 规则并调用完整的技能工作流。

**多平台改进**

- Codex 工具映射移至渐进式披露参考文件 (`references/codex-tools.md`)
- 添加了平台适配指针，以便非 Claude Code 平台可以找到工具等效项
- 计划标题现在针对“代理工作者”而不是特指“Claude”
- 协作功能要求记录在 `docs/README.codex.md` 中

**编写计划模板更新**

- 计划步骤现在使用复选框语法 (`- [ ] **步骤 N:**`) 进行进度跟踪
- 计划标题引用了子代理驱动开发和执行计划，并具有平台感知路由

---

## v4.3.1 (2026-02-21)

### 新增

**Cursor 支持**

Superpowers 现在可与 Cursor 的插件系统配合使用。包括一个 `.cursor-plugin/plugin.json` 清单文件和 README 中的 Cursor 特定安装说明。SessionStart 钩子输出现在除了现有的 `hookSpecificOutput.additionalContext` 外，还包含一个 `additional_context` 字段，以兼容 Cursor 钩子。

### 修复

**Windows：恢复多语言包装器以确保钩子可靠执行 (#518, #504, #491, #487, #466, #440)**

Claude Code 在 Windows 上对 `.sh` 的自动检测会在钩子命令前添加 `bash`，导致执行失败。修复方法：

- 将 `session-start.sh` 重命名为 `session-start`（无扩展名），这样自动检测就不会干扰
- 恢复了 `run-hook.cmd` 多语言包装器，具有多位置 bash 查找功能（标准 Git for Windows 路径，然后是 PATH 回退）
- 如果找不到 bash 则静默退出，而不是报错
- 在 Unix 上，包装器通过 `exec bash` 直接运行脚本
- 使用 POSIX 安全的 `dirname "$0"` 路径解析（适用于 dash/sh，而不仅仅是 bash）

这修复了 Windows 上路径包含空格、缺少 WSL、MSYS 上 `set -euo pipefail` 脆弱性以及反斜杠损坏导致的 SessionStart 失败问题。

## v4.3.0 (2026-02-12)

此修复应能显著提高 superpowers 技能的遵从性，并应减少 Claude 无意中进入其原生计划模式的可能性。

### 变更

**头脑风暴技能现在强制执行其工作流，而不是描述它**

模型跳过设计阶段，直接跳转到前端设计等实施技能，或者将整个头脑风暴过程压缩成单个文本块。该技能现在使用硬性关卡、强制性检查清单和 graphviz 流程图来强制执行：

- `<HARD-GATE>`：在设计呈现并获得用户批准之前，不允许实施技能、代码或脚手架
- 明确的检查清单（6 项），必须作为任务创建并按顺序完成
- Graphviz 流程图，`writing-plans` 是唯一有效的终止状态
- 针对“这太简单，不需要设计”的反模式提示 —— 这正是模型用来跳过过程的合理化借口
- 设计部分大小基于部分复杂性，而非项目复杂性

**使用 superpowers 工作流图拦截 EnterPlanMode**

在技能流程图中添加了 `EnterPlanMode` 拦截。当模型即将进入 Claude 的原生计划模式时，它会检查是否已进行过头脑风暴，并通过头脑风暴技能进行路由。永远不会进入计划模式。

### 修复

**SessionStart 钩子现在同步运行**

在 hooks.json 中将 `async: true` 更改为 `async: false`。当异步时，钩子可能在模型的第一轮之前未能完成，这意味着使用 superpowers 的指令在第一条消息的上下文中缺失。

## v4.2.0 (2026-02-05)

### 破坏性变更

**Codex：用原生技能发现替换了引导 CLI**

`superpowers-codex` 引导 CLI、Windows `.cmd` 包装器和相关的引导内容文件已被移除。Codex 现在通过 `~/.agents/skills/superpowers/` 符号链接使用原生技能发现，因此旧的 `use_skill`/`find_skills` CLI 工具不再需要。

安装现在只需克隆 + 符号链接（在 INSTALL.md 中记录）。不需要 Node.js 依赖。旧的 `~/.codex/skills/` 路径已弃用。

### 修复

**Windows：修复了 Claude Code 2.1.x 钩子执行问题 (#331)**

Claude Code 2.1.x 更改了 Windows 上钩子的执行方式：它现在会自动检测命令中的 `.sh` 文件并添加 `bash` 前缀。这破坏了多语言包装器模式，因为 `bash "run-hook.cmd" session-start.sh` 会尝试将 `.cmd` 文件作为 bash 脚本执行。

修复：hooks.json 现在直接调用 session-start.sh。Claude Code 2.1.x 会自动处理 bash 调用。还添加了 .gitattributes 以强制 shell 脚本使用 LF 行尾（修复 Windows 检出时的 CRLF 问题）。

**Windows：SessionStart 钩子异步运行以防止终端冻结 (#404, #413, #414, #419)**

同步的 SessionStart 钩子阻止了 TUI 在 Windows 上进入原始模式，冻结了所有键盘输入。异步运行钩子可以防止冻结，同时仍注入 superpowers 上下文。

**Windows：修复了 O(n^2) `escape_for_json` 性能问题**File: superpowers-中文/RELEASE-NOTES.md [chunk 3/5]
Rules:
- Only improve Chinese translation coverage in documentation.
- Keep required English technical terms when translating them would break meaning.
- Preserve formatting exactly.
- If the file is already properly translated, return it unchanged.

Document content:
使用 `${input:$i:1}` 进行逐字符循环在 bash 中由于子字符串复制开销导致时间复杂度为 O(n^2)。在 Windows Git Bash 上这需要 60 多秒。已替换为 bash 参数替换 (`${s//old/new}`)，该方式将每个模式作为单次 C 级别传递运行 — 在 macOS 上快 7 倍，在 Windows 上速度提升显著。

**Codex：修复了 Windows/PowerShell 调用问题 (#285, #243)**

- Windows 不识别 shebang，因此直接调用无扩展名的 `superpowers-codex` 脚本会触发“打开方式”对话框。现在所有调用都以 `node` 为前缀。
- 修复了 Windows 上的 `~/` 路径展开问题 — PowerShell 在将 `~` 作为参数传递给 `node` 时不会展开它。已更改为 `$HOME`，它在 bash 和 PowerShell 中都能正确展开。

**Codex：修复了安装程序中的路径解析问题**

使用 `fileURLToPath()` 代替手动 URL 路径名解析，以正确处理所有平台上包含空格和特殊字符的路径。

**Codex：修复了 writing-skills 中过时的技能路径**

将 `~/.codex/skills/` 引用（已弃用）更新为 `~/.agents/skills/`，以支持原生发现。

### 改进

**实现前现在需要工作树隔离**

将 `using-git-worktrees` 添加为 `subagent-driven-development` 和 `executing-plans` 的必需技能。实现工作流现在明确要求在开始工作前设置隔离的工作树，防止意外直接在主分支上工作。

**主分支保护放宽，需要明确同意**

技能不再完全禁止在主分支上工作，而是允许在用户明确同意的情况下进行。更灵活，同时仍确保用户了解其影响。

**简化了安装验证**

从验证步骤中移除了 `/help` 命令检查和特定的斜杠命令列表。技能主要通过描述你想要做什么来调用，而不是通过运行特定命令。

**Codex：在引导中澄清了子代理工具映射**

改进了关于 Codex 工具如何映射到 Claude Code 等效工具以用于子代理工作流的文档。

### 测试

- 为 subagent-driven-development 添加了工作树要求测试
- 添加了主分支危险警告测试
- 修复了技能识别测试断言中的大小写敏感性问题

---

## v4.1.1 (2026-01-23)

### 修复

**OpenCode：根据官方文档标准化为 `plugins/` 目录 (#343)**

OpenCode 的官方文档使用 `~/.config/opencode/plugins/`（复数）。我们的文档之前使用 `plugin/`（单数）。虽然 OpenCode 接受两种形式，但我们已标准化为官方约定以避免混淆。

变更：
- 在仓库结构中将 `.opencode/plugin/` 重命名为 `.opencode/plugins/`
- 更新了所有平台上的所有安装文档（INSTALL.md, README.opencode.md）
- 更新了测试脚本以匹配

**OpenCode：修复了符号链接说明 (#339, #342)**

- 在 `ln -s` 之前添加了显式的 `rm`（修复了重新安装时的“文件已存在”错误）
- 添加了 INSTALL.md 中缺失的技能符号链接步骤
- 从已弃用的 `use_skill`/`find_skills` 更新为原生 `skill` 工具引用

---

## v4.1.0 (2026-01-23)

### 破坏性变更

**OpenCode：切换到原生技能系统**

Superpowers for OpenCode 现在使用 OpenCode 的原生 `skill` 工具，而不是自定义的 `use_skill`/`find_skills` 工具。这是更清晰的集成，可与 OpenCode 内置的技能发现功能配合使用。

**需要迁移：** 技能必须符号链接到 `~/.config/opencode/skills/superpowers/`（参见更新的安装文档）。

### 修复

**OpenCode：修复了会话开始时的代理重置问题 (#226)**

之前使用 `session.prompt({ noReply: true })` 的引导注入方法会导致 OpenCode 在第一条消息时将选定的代理重置为 "build"。现在使用 `experimental.chat.system.transform` 钩子，它直接修改系统提示，没有副作用。

**OpenCode：修复了 Windows 安装问题 (#232)**

- 移除了对 `skills-core.js` 的依赖（消除了当文件被复制而不是符号链接时出现的损坏的相对导入）
- 为 cmd.exe、PowerShell 和 Git Bash 添加了全面的 Windows 安装文档
- 记录了每个平台正确的符号链接与联结用法

**Claude Code：修复了 Claude Code 2.1.x 的 Windows 钩子执行问题**

Claude Code 2.1.x 更改了 Windows 上钩子的执行方式：它现在会自动检测命令中的 `.sh` 文件并前置 `bash `。这破坏了多语言包装器模式，因为 `bash "run-hook.cmd" session-start.sh` 会尝试将 .cmd 文件作为 bash 脚本执行。

修复：hooks.json 现在直接调用 session-start.sh。Claude Code 2.1.x 会自动处理 bash 调用。还添加了 .gitattributes 以强制 shell 脚本使用 LF 行尾（修复了 Windows 检出时的 CRLF 问题）。

---

## v4.0.3 (2025-12-26)

### 改进

**加强了 using-superpowers 技能以处理明确的技能请求**

解决了一种失败模式，即即使用户明确按名称请求技能（例如，“请使用 subagent-driven-development”），Claude 也会跳过调用技能。Claude 会认为“我知道那是什么意思”并直接开始工作，而不是加载技能。

变更：
- 更新了“规则”，改为“调用相关或请求的技能”而不是“检查技能” - 强调主动调用而非被动检查
- 添加了“在任何响应或操作之前” - 原始措辞只提到“响应”，但 Claude 有时会在没有响应的情况下采取行动
- 添加了调用错误技能也没关系的保证 - 减少犹豫
- 添加了新的危险信号：“我知道那是什么意思” → 知道概念 ≠ 使用技能

**添加了明确的技能请求测试**

在 `tests/explicit-skill-requests/` 中添加了新的测试套件，验证当用户按名称请求技能时，Claude 是否正确调用技能。包括单轮和多轮测试场景。

## v4.0.2 (2025-12-23)

### 修复

**斜杠命令现在仅供用户使用**

为所有三个斜杠命令（`/brainstorm`、`/execute-plan`、`/write-plan`）添加了 `disable-model-invocation: true`。Claude 不再能通过技能工具调用这些命令 — 它们仅限于用户手动调用。

底层技能（`superpowers:brainstorming`、`superpowers:executing-plans`、`superpowers:writing-plans`）仍然可供 Claude 自主调用。此更改防止了当 Claude 调用一个只是重定向到技能的命令时产生的混淆。

## v4.0.1 (2025-12-23)

### 修复

**澄清了如何在 Claude Code 中访问技能**

修复了一种令人困惑的模式，即 Claude 会通过技能工具调用技能，然后尝试单独读取技能文件。`using-superpowers` 技能现在明确指出技能工具会直接加载技能内容 — 无需读取文件。

- 在 `using-superpowers` 中添加了“如何访问技能”部分
- 在说明中将“读取技能” → “调用技能”
- 更新了斜杠命令以使用完全限定的技能名称（例如，`superpowers:brainstorming`）

**在 receiving-code-review 中添加了 GitHub 线程回复指南**（感谢 @ralphbean）

添加了关于在原始线程中回复内联审查评论，而不是作为顶级 PR 评论的说明。

**在 writing-skills 中添加了自动化优于文档的指南**（感谢 @EthanJStark）

添加了指南，说明机械性约束应该自动化，而不是文档化 — 将技能留给需要判断的决策。

## v4.0.0 (2025-12-17)

### 新功能

**subagent-driven-development 中的两阶段代码审查**

子代理工作流现在在每个任务后使用两个独立的审查阶段：

1. **规范符合性审查** - 持怀疑态度的审查员验证实现是否完全符合规范。捕获缺失的需求和过度构建。不会信任实现者的报告 — 会阅读实际代码。

2. **代码质量审查** - 仅在规范符合性通过后运行。审查代码整洁度、测试覆盖率、可维护性。

这捕获了常见的失败模式，即代码编写良好但不符合要求。审查是循环的，不是一次性的：如果审查员发现问题，实现者会修复它们，然后审查员再次检查。

其他子代理工作流改进：
- 控制器向工作者提供完整的任务文本（而不是文件引用）
- 工作者可以在工作之前和期间提出澄清问题
- 报告完成前的自检清单
- 计划在开始时读取一次，提取到 TodoWrite

`skills/subagent-driven-development/` 中的新提示模板：
- `implementer-prompt.md` - 包含自检清单，鼓励提问
- `spec-reviewer-prompt.md` - 对需求进行怀疑性验证
- `code-quality-reviewer-prompt.md` - 标准代码审查

**调试技术与工具整合**

`systematic-debugging` 现在捆绑了支持技术和工具：
- `root-cause-tracing.md` - 通过调用栈向后追踪错误
- `defense-in-depth.md` - 在多个层添加验证
- `condition-based-waiting.md` - 用条件轮询替换任意超时
- `find-polluter.sh` - 用于查找哪个测试造成污染的二分脚本
- `condition-based-waiting-example.ts` - 来自真实调试会话的完整实现

**测试反模式参考**

`test-driven-development` 现在包含 `testing-anti-patterns.md`，涵盖：
- 测试模拟行为而不是真实行为
- 向生产类添加仅用于测试的方法
- 在不理解依赖关系的情况下进行模拟
- 隐藏结构假设的不完整模拟

**技能触发测试**

`tests/skill-triggering/` 中的测试套件验证技能是否在正确的时间被触发。测试了 6 个技能，使用描述性提示来验证技能是否被正确触发。

`tests/claude-code/` 使用 `claude -p` 运行端到端测试，捕获对话记录（JSONL 格式），并使用 `analyze-token-usage.py` 分析技能使用情况。

`tests/subagent-driven-dev/` 包含两个完整的子代理项目：
- `go-fractals/` - 生成 Sierpinski / Mandelbrot 分形的 CLI 工具，10 个任务
- `svelte-todo/` - 使用 localStorage 和 Playwright 的 CRUD 待办事项应用，12 个任务

### 改进

**DOT 图表生成**

添加了 `render-graphs.js` 工具，用于从技能中提取 DOT/GraphViz 图表并渲染为 SVG，以可视化技能流程。

**Description 陷阱**（已记录在 `writing-skills` 中）：我们发现当 skill 的 description 里混入工作流摘要时，它会覆盖 flowchart 的作用。Claude 会直接照着简短 description 走，而不是去读详细 flowchart。修复方式：description 只能写触发条件（如“适用于 X 的时候”），不要塞入流程细节。

**using-superpowers 技能改进**

添加了技能识别部分，解释如何识别何时需要技能。包括常见模式，如“Build X”请求通常需要 `brainstorming` 技能。

**改进了 brainstorming 技能描述**

描述改为祈使句：“在任何创造性工作之前，你必须使用此技能 — 创建功能、构建组件、添加功能或修改行为。”

### 破坏性变更

**技能合并** - 六个独立技能合并：
- `root-cause-tracing`、`defense-in-depth`、`condition-based-waiting` → 打包在 `systematic-debugging/` 中
- `testing-skills-with-subagents` → 打包在 `writing-skills/` 中
- `testing-anti-patterns` → 打包在 `test-driven-development/` 中
- `sharing-skills` 已移除（已过时）

### 其他改进

- **render-graphs.js** - 用于从技能中提取 DOT 图表并渲染为 SVG 的工具
- **using-superpowers 中的合理化表** - 可扫描格式，包括新条目：“我需要更多上下文”、“让我先探索一下”、“这感觉很高效”
- **docs/testing.md** - 使用 Claude Code 集成测试测试技能的指南

---

## v3.6.2 (2025-12-03)

### 修复

- **Linux 兼容性**：修复了多语言钩子包装器 (`run-hook.cmd`) 以使用符合 POSIX 的语法
  - 在第 16 行将 bash 特定的 `${BASH_SOURCE[0]:-$0}` 替换为标准的 `$0`
  - 解决了在 `/bin/sh` 为 dash 的 Ubuntu/Debian 系统上的“Bad substitution”错误
  - 修复了 #141

---

## v3.5.1 (2025-11-24)

### 变更

- **OpenCode 引导重构**：从 `chat.message` 钩子切换到 `session.created` 事件进行引导注入
  - 引导现在在会话创建时通过 `session.prompt()` 注入，使用 `noReply: true`
  - 明确告诉模型 using-superpowers 已经加载，以防止重复加载技能
  - 将引导内容生成整合到共享的 `getBootstrapContent()` 辅助函数中
  - 更清晰的单一实现方法（移除了回退模式）

---## v3.5.0 (2025-11-23)

### 新增

- **OpenCode 支持**：OpenCode.ai 的原生 JavaScript 插件
  - 自定义工具：`use_skill` 和 `find_skills`
  - 用于在上下文压缩时保持技能持久性的消息插入模式
  - 通过 chat.message 钩子自动注入上下文
  - 在 session.compacted 事件时自动重新注入
  - 三级技能优先级：项目 > 个人 > superpowers
  - 项目本地技能支持（`.opencode/skills/`）
  - 共享核心模块（`lib/skills-core.js`）以便与 Codex 代码复用
  - 具有适当隔离的自动化测试套件（`tests/opencode/`）
  - 平台特定文档（`docs/README.opencode.md`，`docs/README.codex.md`）

### 变更

- **重构 Codex 实现**：现在使用共享的 `lib/skills-core.js` ES 模块
  - 消除了 Codex 和 OpenCode 之间的代码重复
  - 技能发现和解析的单一事实来源
  - Codex 通过 Node.js 互操作成功加载 ES 模块

- **改进文档**：重写 README 以清晰解释问题/解决方案
  - 移除了重复章节和冲突信息
  - 添加了完整的工作流描述（头脑风暴 → 计划 → 执行 → 完成）
  - 简化了平台安装说明
  - 强调技能检查协议而非自动激活声明

---

## v3.4.1 (2025-10-31)

### 改进

- 优化了 superpowers 引导过程，消除了冗余的技能执行。`using-superpowers` 技能内容现在直接在会话上下文中提供，并明确指导仅对其他技能使用 Skill 工具。这减少了开销，并防止了代理尽管已从会话开始就拥有内容，却仍手动执行 `using-superpowers` 的令人困惑的循环。

## v3.4.0 (2025-10-30)

### 改进

- 简化了 `brainstorming` 技能，使其回归最初的对话愿景。移除了带有正式检查清单的重量级 6 阶段流程，转而采用自然对话：一次问一个问题，然后以 200-300 字的段落呈现设计并进行验证。保留了文档和实现交接功能。

## v3.3.1 (2025-10-28)

### 改进

- 更新了 `brainstorming` 技能，要求在提问前进行自主侦察，鼓励基于推荐的决策，并防止代理将优先级排序委托回人类。
- 遵循斯特伦克《风格的要素》原则（省略不必要的词，将否定形式转换为肯定形式，改进并列结构），对 `brainstorming` 技能应用了写作清晰度改进。

### Bug 修复

- 澄清了 `writing-skills` 指南，使其指向正确的代理特定个人技能目录（Claude Code 为 `~/.claude/skills`，Codex 为 `~/.codex/skills`）。

## v3.3.0 (2025-10-28)

### 新功能

**实验性 Codex 支持**
- 添加了统一的 `superpowers-codex` 脚本，包含 bootstrap/use-skill/find-skills 命令
- 跨平台 Node.js 实现（适用于 Windows、macOS、Linux）
- 命名空间技能：`superpowers:skill-name` 用于 superpowers 技能，`skill-name` 用于个人技能
- 当名称匹配时，个人技能覆盖 superpowers 技能
- 清晰的技能显示：显示名称/描述，不显示原始 frontmatter
- 有用的上下文：显示每个技能的支持文件目录
- Codex 的工具映射：TodoWrite→update_plan，subagents→手动回退等
- 与最小化 AGENTS.md 的引导集成，实现自动启动
- 完整的安装指南和 Codex 特定的引导说明

**与 Claude Code 集成的主要区别：**
- 单一统一脚本，而非独立工具
- Codex 特定等效项的工具替换系统
- 简化的子代理处理（手动工作而非委托）
- 更新术语：“Superpowers skills” 而非 “Core skills”

### 新增文件
- `.codex/INSTALL.md` - Codex 用户的安装指南
- `.codex/superpowers-bootstrap.md` - 包含 Codex 适配的引导说明
- `.codex/superpowers-codex` - 包含所有功能的统一 Node.js 可执行文件

**注意：** Codex 支持是实验性的。该集成提供了核心 superpowers 功能，但可能需要根据用户反馈进行完善。

## v3.2.3 (2025-10-23)

### 改进

**更新 using-superpowers 技能以使用 Skill 工具而非 Read 工具**
- 将技能调用说明从 Read 工具更改为 Skill 工具
- 更新描述：“使用 Read 工具” → “使用 Skill 工具”
- 更新步骤 3：“使用 Read 工具” → “使用 Skill 工具读取并运行”
- 更新理由列表：“读取当前版本” → “运行当前版本”

Skill 工具是 Claude Code 中调用技能的正确机制。此更新更正了引导说明，以指导代理使用正确的工具。

### 变更文件
- 更新：`skills/using-superpowers/SKILL.md` - 将工具引用从 Read 更改为 Skill

## v3.2.2 (2025-10-21)

### 改进

**加强 using-superpowers 技能以对抗代理的合理化行为**
- 添加了 EXTREMELY-IMPORTANT 块，使用绝对语言说明强制性技能检查
  - “即使有 1% 的可能性适用某个技能，你也必须读取它”
  - “你没有选择。你不能通过合理化来逃避。”
- 添加了 MANDATORY FIRST RESPONSE PROTOCOL 检查清单
  - 代理在任何响应前必须完成的 5 步流程
  - 明确的“不执行此操作即失败”的后果
- 添加了常见合理化部分，包含 8 种具体的规避模式
  - “这只是个简单问题” → 错误
  - “我可以快速检查文件” → 错误
  - “让我先收集信息” → 错误
  - 加上在代理行为中观察到的另外 5 种常见模式

这些更改解决了观察到的代理行为，即尽管有明确指示，他们仍围绕技能使用进行合理化。强制性的语言和预先反驳的论点旨在使不合规行为更加困难。

### 变更文件
- 更新：`skills/using-superpowers/SKILL.md` - 添加了三层强制措施以防止跳过技能的合理化行为

## v3.2.1 (2025-10-20)

### 新功能

**插件现包含代码审查代理**
- 在插件的 `agents/` 目录中添加了 `superpowers:code-reviewer` 代理
- 代理根据计划和编码标准提供系统化的代码审查
- 此前要求用户拥有个人代理配置
- 所有技能引用已更新为使用命名空间 `superpowers:code-reviewer`
- 修复 #55

### 变更文件
- 新增：`agents/code-reviewer.md` - 包含审查检查清单和输出格式的代理定义
- 更新：`skills/requesting-code-review/SKILL.md` - 对 `superpowers:code-reviewer` 的引用
- 更新：`skills/subagent-driven-development/SKILL.md` - 对 `superpowers:code-reviewer` 的引用

## v3.2.0 (2025-10-18)

### 新功能

**头脑风暴工作流中的设计文档**
- 在头脑风暴技能中添加了阶段 4：设计文档
- 设计文档现在在实现前写入 `docs/plans/YYYY-MM-DD-<topic>-design.md`
- 恢复了在技能转换过程中丢失的原始头脑风暴命令的功能
- 文档在工作树设置和实现计划之前编写
- 已通过子代理测试，以验证在时间压力下的合规性

### 破坏性变更

**技能引用命名空间标准化**
- 所有内部技能引用现在使用 `superpowers:` 命名空间前缀
- 更新格式：`superpowers:test-driven-development`（之前仅为 `test-driven-development`）
- 影响所有必需子技能、推荐子技能和必需背景引用
- 与使用 Skill 工具调用技能的方式保持一致
- 更新的文件：brainstorming, executing-plans, subagent-driven-development, systematic-debugging, testing-skills-with-subagents, writing-plans, writing-skills

### 改进

**设计文档与实现计划的命名区分**
- 设计文档使用 `-design.md` 后缀以防止文件名冲突
- 实现计划继续使用现有的 `YYYY-MM-DD-<feature-name>.md` 格式
- 两者都存储在 `docs/plans/` 目录中，命名清晰可辨

## v3.1.1 (2025-10-17)

### Bug 修复

- **修复了 README 中的命令语法** (#44) - 更新了所有命令引用以使用正确的命名空间语法（`/superpowers:brainstorm` 而非 `/brainstorm`）。插件提供的命令由 Claude Code 自动添加命名空间，以避免插件之间的冲突。

## v3.1.0 (2025-10-17)

### 破坏性变更

**技能名称标准化为小写**
- 所有技能 frontmatter 的 `name:` 字段现在使用与目录名匹配的小写 kebab-case
- 示例：`brainstorming`、`test-driven-development`、`using-git-worktrees`
- 所有技能公告和交叉引用已更新为小写格式
- 这确保了目录名、frontmatter 和文档之间命名的一致性

### 新功能

**增强的头脑风暴技能**
- 添加了快速参考表，显示阶段、活动和工具使用情况
- 添加了可复制的工作流检查清单以跟踪进度
- 添加了决策流程图，用于何时重新审视早期阶段
- 添加了全面的 AskUserQuestion 工具指导，包含具体示例
- 添加了“问题模式”部分，解释何时使用结构化问题与开放式问题
- 将关键原则重构为可扫描的表格

**集成 Anthropic 最佳实践**
- 添加了 `skills/writing-skills/anthropic-best-practices.md` - Anthropic 官方技能编写指南
- 在 writing-skills SKILL.md 中引用，提供全面指导
- 提供了渐进式披露、工作流和评估的模式

### 改进

**技能交叉引用清晰度**
- 所有技能引用现在使用明确的需求标记：
  - `**必需背景：**` - 你必须理解的前提条件
  - `**必需子技能：**` - 工作流中必须使用的技能
  - `**互补技能：**` - 可选但有帮助的相关技能
- 移除了旧的路径格式（`skills/collaboration/X` → 仅 `X`）
- 更新了集成部分，包含分类关系（必需 vs 互补）
- 更新了交叉引用文档，包含最佳实践

**与 Anthropic 最佳实践保持一致**
- 修正了描述的语法和语态（完全第三人称）
- 添加了快速参考表以便扫描
- 添加了 Claude 可以复制和跟踪的工作流检查清单
- 在非显而易见的决策点适当使用流程图
- 改进了可扫描的表格格式
- 所有技能都远低于 500 行的建议限制

### Bug 修复

- **重新添加了缺失的命令重定向** - 恢复了在 v3.0 迁移中意外删除的 `commands/brainstorm.md` 和 `commands/write-plan.md`
- 修复了 `defense-in-depth` 名称不匹配问题（原为 `Defense-in-Depth-Validation`）
- 修复了 `receiving-code-review` 名称不匹配问题（原为 `Code-Review-Reception`）
- 修复了 `commands/brainstorm.md` 对正确技能名称的引用
- 移除了对不存在的相关技能的引用

### 文档

**writing-skills 改进**
- 更新了交叉引用指导，使用明确的需求标记
- 添加了对 Anthropic 官方最佳实践的引用
- 改进了展示正确技能引用格式的示例

## v3.0.1 (2025-10-16)

### 变更

我们现在使用 Anthropic 的第一方技能系统！

## v2.0.2 (2025-10-12)

### Bug 修复

- **修复了当本地技能仓库领先于上游时出现的错误警告** - 初始化脚本在本地仓库有领先于上游的提交时，错误地警告“有来自上游的新技能可用”。该逻辑现在正确区分三种 git 状态：本地落后（应更新）、本地领先（无警告）和分叉（应警告）。

## v2.0.1 (2025-10-12)

### Bug 修复

- **修复了插件上下文中的 session-start 钩子执行问题** (#8, PR #9) - 该钩子静默失败，出现“Plugin hook error”，阻止技能上下文加载。修复方法：
  - 当 BASH_SOURCE 在 Claude Code 的执行上下文中未绑定时，使用 `${BASH_SOURCE[0]:-$0}` 作为回退
  - 在过滤状态标志时添加 `|| true` 以优雅地处理空的 grep 结果

---

# Superpowers v2.0.0 发布说明

## 概述

Superpowers v2.0 通过重大的架构转变，使技能更易于访问、维护，并更具社区驱动力。主要变更是**技能仓库分离**：所有技能、脚本和文档已从插件迁移至专用仓库（[obra/superpowers-skills](https://github.com/obra/superpowers-skills)）。这使 superpowers 从一个单体插件转变为管理本地技能仓库克隆的轻量级封装。技能在会话启动时自动更新。用户可通过标准 git 工作流进行分叉和贡献改进。技能库的版本独立于插件。

除了基础设施改进，本次发布新增了九项专注于问题解决、研究和架构的技能。我们重写了核心的**使用技能**文档，采用祈使语气和更清晰的结构，使 Claude 更容易理解何时以及如何使用技能。**查找技能**现在输出可直接粘贴到 Read 工具的路径，消除了技能发现工作流中的摩擦。

用户体验无缝操作：插件自动处理克隆、分叉和更新。贡献者会发现新架构使改进和共享技能变得简单。本次发布为技能作为社区资源快速演进奠定了基础。

## 破坏性变更

### 技能仓库分离

**最大变更：** 技能不再位于插件内。它们已被移至独立仓库 [obra/superpowers-skills](https://github.com/obra/superpowers-skills)。

**这对您意味着：**

- **首次安装：** 插件自动将技能克隆到 `~/.config/superpowers/skills/`
- **分叉：** 设置期间，如果安装了 `gh`，您将获得分叉技能仓库的选项
- **更新：** 技能在会话启动时自动更新（尽可能快进）
- **贡献：** 在分支上工作，本地提交，向上游提交 PR
- **不再有覆盖：** 旧的双层系统（个人/核心）被单仓库分支工作流取代

**迁移：**

如果您已有现有安装：
1. 您旧的 `~/.config/superpowers/.git` 将被备份到 `~/.config/superpowers/.git.bak`
2. 旧技能将被备份到 `~/.config/superpowers/skills.bak`
3. 将在 `~/.config/superpowers/skills/` 创建 obra/superpowers-skills 的全新克隆

### 移除的功能

- **个人 superpowers 覆盖系统** - 被 git 分支工作流取代
- **setup-personal-superpowers 钩子** - 被 initialize-skills.sh 取代

## 新功能

### 技能仓库基础设施

**自动克隆与设置** (`lib/initialize-skills.sh`)
- 首次运行时克隆 obra/superpowers-skills
- 如果安装了 GitHub CLI，提供创建分叉的选项
- 正确设置上游/源远程仓库
- 处理从旧安装的迁移

**自动更新**
- 每次会话启动时从跟踪远程仓库获取
- 尽可能自动快进合并
- 需要手动同步时通知（分支已分叉）
- 使用 pulling-updates-from-skills-repository 技能进行手动同步

### 新技能

**问题解决技能** (`skills/problem-solving/`)
- **collision-zone-thinking** - 强制将不相关的概念结合以产生涌现性见解
- **inversion-exercise** - 翻转假设以揭示隐藏约束
- **meta-pattern-recognition** - 识别跨领域的普遍原理
- **scale-game** - 在极端情况下测试以暴露基本真相
- **simplification-cascades** - 找到能消除多个组件的见解
- **when-stuck** - 调度到正确的问题解决技术

**研究技能** (`skills/research/`)
- **tracing-knowledge-lineages** - 理解思想如何随时间演变

**架构技能** (`skills/architecture/`)
- **preserving-productive-tensions** - 保留多种有效方法，而不是强制过早解决

### 技能改进

**using-skills（原 getting-started）**
- 从 getting-started 重命名为 using-skills
- 使用祈使语气完全重写（v4.0.0）
- 前置关键规则
- 为所有工作流添加了“为什么”解释
- 引用中始终包含 /SKILL.md 后缀
- 更清晰地区分严格规则和灵活模式

**writing-skills**
- 交叉引用指南从 using-skills 移出
- 添加了令牌效率部分（字数目标）
- 改进了 CSO（Claude 搜索优化）指南

**sharing-skills**
- 更新为新的分支和 PR 工作流（v2.0.0）
- 移除了个人/核心拆分引用

**pulling-updates-from-skills-repository**（新增）
- 与上游同步的完整工作流
- 取代了旧的“updating-skills”技能

### 工具改进

**find-skills**
- 现在输出带有 /SKILL.md 后缀的完整路径
- 使路径可直接用于 Read 工具
- 更新了帮助文本

**skill-run**
- 从 scripts/ 移至 skills/using-skills/
- 改进了文档

### 插件基础设施

**会话启动钩子**
- 现在从技能仓库位置加载
- 会话启动时显示完整技能列表
- 打印技能位置信息
- 显示更新状态（已成功更新 / 落后于上游）
- 将“技能落后”警告移至输出末尾

**环境变量**
- `SUPERPOWERS_SKILLS_ROOT` 设置为 `~/.config/superpowers/skills`
- 在所有路径中一致使用

## Bug 修复

- 修复了分叉时重复添加上游远程仓库的问题
- 修复了 find-skills 输出中重复的 "skills/" 前缀
- 从 session-start 中移除了过时的 setup-personal-superpowers 调用
- 修复了钩子和命令中的所有路径引用

## 文档

### README
- 更新为新的技能仓库架构
- 突出显示指向 superpowers-skills 仓库的链接
- 更新了自动更新描述
- 修正了技能名称和引用
- 更新了 Meta 技能列表

### 测试文档
- 添加了全面的测试检查清单 (`docs/TESTING-CHECKLIST.md`)
- 创建了用于测试的本地市场配置
- 记录了手动测试场景

## 技术细节

### 文件变更

**新增：**
- `lib/initialize-skills.sh` - 技能仓库初始化和自动更新
- `docs/TESTING-CHECKLIST.md` - 手动测试场景
- `.claude-plugin/marketplace.json` - 本地测试配置

**移除：**
- `skills/` 目录（82 个文件）- 现在位于 obra/superpowers-skills
- `scripts/` 目录 - 现在位于 obra/superpowers-skills/skills/using-skills/
- `hooks/setup-personal-superpowers.sh` - 已过时

**修改：**
- `hooks/session-start.sh` - 使用 ~/.config/superpowers/skills 中的技能
- `commands/brainstorm.md` - 更新路径为 SUPERPOWERS_SKILLS_ROOT
- `commands/write-plan.md` - 更新路径为 SUPERPOWERS_SKILLS_ROOT
- `commands/execute-plan.md` - 更新路径为 SUPERPOWERS_SKILLS_ROOT
- `README.md` - 为新架构完全重写

### 提交历史

本次发布包含：
- 20+ 次提交用于技能仓库分离
- PR #1：受 Amplifier 启发的问题解决和研究技能
- PR #2：个人 superpowers 覆盖系统（后来被取代）
- 多次技能细化和文档改进

## 升级说明

### 全新安装

```bash
# 在 Claude Code 中
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

插件会自动处理所有事情。

### 从 v1.x 升级

1. **备份您的个人技能**（如果有的话）：
   ```bash
   cp -r ~/.config/superpowers/skills ~/superpowers-skills-backup
   ```

2. **更新插件：**
   ```bash
   /plugin update superpowers
   ```

3. **下次会话启动时：**
   - 旧安装将自动备份
   - 将克隆全新的技能仓库
   - 如果您有 GitHub CLI，您将获得分叉的选项

4. **迁移个人技能**（如果有的话）：
   - 在您的本地技能仓库中创建一个分支
   - 从备份中复制您的个人技能
   - 提交并推送到您的分叉
   - 考虑通过 PR 贡献回来

## 下一步计划

### 对于用户

- 探索新的问题解决技能
- 尝试基于分支的技能改进工作流
- 将技能贡献回社区

### 对于贡献者

- 技能仓库现在位于 https://github.com/obra/superpowers-skills
- 分叉 → 分支 → PR 工作流
- 参见 skills/meta/writing-skills/SKILL.md 了解文档的 TDD 方法

## 已知问题

目前无。

## 致谢

- 问题解决技能受 Amplifier 模式启发
- 社区贡献和反馈
- 对技能有效性的广泛测试和迭代

---

**完整变更日志：** https://github.com/obra/superpowers/compare/dd013f6...main
**技能仓库：** https://github.com/obra/superpowers-skills
**问题反馈：** https://github.com/obra/superpowers/issues