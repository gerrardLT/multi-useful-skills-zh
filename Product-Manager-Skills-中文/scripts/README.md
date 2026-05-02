# Scripts 指南（给 PM 用）

这个文件夹里放的是辅助脚本，让你不用写代码也能使用 PM skills 库。
如果你刚接触终端，先从 `Quick Start` 和 `Common Tasks` 里的命令开始。
## Quick Start

1. 在 VS Code 中打开这个 repo。
2. 在 VS Code 中打开终端（`Terminal` -> `New Terminal`）。
3. 确认你当前在 repo 根目录：

```bash
pwd
```

你的路径结尾应该是 `product-manager-skills`。
4. 列出可用脚本：
```bash
ls scripts
```

## Common Tasks

按原样使用下面这些命令，然后把引号中的示例文字替换成你的内容。
### 找到合适的 skill

```bash
./scripts/find-a-skill.sh --keyword onboarding
```

### 按触发语言和示例场景查找
```bash
./scripts/find-a-skill.sh --mode trigger onboarding
```

### 查找可用的 workflow command

```bash
./scripts/find-a-command.sh --keyword roadmap
```

### 从 skill 生成 prompt（最稳妥的起点）

这会打印一个可直接使用的 prompt。很适合你在应用窗口里使用 Claude 或 Codex 时。
```bash
./scripts/run-pm.sh skill prd-development "Create a PRD for improving mobile onboarding" --agent print
```

### 直接在 Claude Code CLI 中运行（如果已安装）

```bash
./scripts/run-pm.sh command discover "Reduce onboarding drop-off for self-serve users" --agent claude
```

### 直接在 Codex CLI 中运行（如果已安装）

```bash
./scripts/run-pm.sh command write-prd "Design requirements for a new admin analytics dashboard" --agent codex
```

### 在提交前校验单个 skill

```bash
./scripts/test-a-skill.sh --skill user-story --smoke
```

### 上传前审计 trigger 文档

```bash
python3 scripts/check-skill-triggers.py skills/user-story/SKILL.md --show-cases
```

### 校验整个库
```bash
./scripts/test-library.sh --smoke
```

### 构建可上传到 Claude 的 skill ZIP

```bash
./scripts/zip-a-skill.sh --skill user-story
```

## 进阶玩法：把脚本串起来
每个脚本单独都能用，串起来之后，就成了一条可重复的 PM 工作流。
### 示例 1：分钟内从想法到 AI prompt

1. 找到相关 command：
```bash
./scripts/find-a-command.sh --keyword onboarding
```

2. 带着你的上下文运行它：
```bash
./scripts/run-pm.sh command discover "Improve activation for self-serve trial users" --agent print
```

### 示例 2：创建、校验并打包一个新 skill

1. 从源笔记生成：
```bash
./scripts/add-a-skill.sh research/your-framework.md
```

2. 校验新 skill：
```bash
./scripts/test-a-skill.sh --skill your-skill-name --smoke
```

3. 构建 Claude 上传 zip：
```bash
./scripts/zip-a-skill.sh --skill your-skill-name
```

### 示例 3：发布前质量关卡

在发布或提 PR 前跑这一条命令：

```bash
./scripts/test-library.sh --smoke
```

## 与 AI 工具串联

同一套脚本链可以跨不同工具使用。核心模式是：
1. 发现（`find-a-skill.sh` 或 `find-a-command.sh`）
2. 生成高质量 prompt（`run-pm.sh`）
3. 在你的 AI 工具里执行
4. 校验输出（`test-a-skill.sh` 或 `test-library.sh`）
### Claude Code

直接从终端运行：

```bash
./scripts/find-a-command.sh --keyword roadmap
./scripts/run-pm.sh command plan-roadmap "Q3 strategy for enterprise expansion" --agent claude
```

### 平台：Codex

直接从终端运行：

```bash
./scripts/find-a-command.sh --keyword discovery
./scripts/run-pm.sh command discover "Diagnose activation drop-off in onboarding" --agent codex
```

### VS Code

终端 + chat 配合使用：
```bash
./scripts/find-a-skill.sh --keyword user-story
./scripts/run-pm.sh skill user-story "Write stories for checkout optimization" --agent print
```

把打印出来的 prompt 粘贴到 VS Code 里的 AI chat 面板。
### 平台：Cursor

使用同样的“打印再粘贴”流程：

```bash
./scripts/find-a-command.sh --keyword prd
./scripts/run-pm.sh command write-prd "Create a PRD for analytics alerts" --agent print
```

把打印出来的 prompt 粘贴到 Cursor chat。
### AntiGravity

除非你的 AntiGravity 环境有自己的 CLI bridge，否则也用打印再粘贴：
```bash
./scripts/find-a-command.sh --keyword strategy
./scripts/run-pm.sh command strategy "Define positioning for AI assistant add-on" --agent print
```

把打印出来的 prompt 粘贴到 AntiGravity。
### 可选：一行命令复制到剪贴板（macOS）
如果你想更快把内容串到任意 chat UI：
```bash
./scripts/run-pm.sh command discover "Improve trial-to-paid conversion" --agent print | pbcopy
```

## 脚本速查表
- `add-a-skill.sh`：从笔记或源内容生成 skills。
- `build-a-skill.sh`：用引导式向导一步步创建 skill。
- `find-a-skill.sh`：按关键词、名称或类型搜索 skills。
- `find-a-skill.sh --mode trigger`：利用 `description`、`best_for`、`scenarios` 等 trigger 导向 frontmatter 搜索。
- `find-a-command.sh`：搜索 workflow commands。
- `run-pm.sh`：把 skills/commands 转成 prompts，或直接在 Claude/Codex CLI 中运行。
- `test-a-skill.sh`：校验单个 skill 的质量和结构。
- `test-library.sh`：同时校验 skills、commands 和 catalog 输出。
- `check-skill-triggers.py`：审计 description 质量和样例触发场景。
- `zip-a-skill.sh`：构建可上传到 Claude web 的 ZIP 文件。
- `package-claude-skills.sh`：高级打包辅助工具（未打包格式）。
- `check-skill-metadata.py`：校验 skill frontmatter 和必需章节。
- `check-command-metadata.py`：校验 command metadata 和 skill 引用。
- `generate-catalog.py`：重建 `catalog/` 索引。
## 故障排查

- `Error: 'claude' command not found`：  
  使用 `--agent print`，然后手动把输出 prompt 粘贴到 Claude。
- `Error: 'codex' command not found`：  
  使用 `--agent print`，然后手动把输出 prompt 粘贴到 Codex。
- `Error: Skill not found`：  
  运行 `./scripts/find-a-skill.sh --list-all`，并使用精确的 skill 名称。
- `Error: Command not found`：  
  运行 `./scripts/find-a-command.sh --list-all`，并使用精确的 command 名称。
- `Permission denied`：  
  运行 `chmod +x ./scripts/*.sh`。
- 路径看起来不对：  
  从 repo 根目录运行命令（`/Users/deanpeters/Code/product-manager-skills`）。
## 安全说明

- 这些脚本的设计目标是可预测、并优先本地执行。
- 如果你不确定，尤其是在共享环境里，请先阅读脚本再运行。
- Repo frontmatter 里包含用于本地编写的 `intent`，但 Claude 上传打包时会移除不支持的键，只保留面向 trigger 的 `description`。
## 相关文档

- [`../README.md`](../README.md)
- [`../docs/Add-a-Skill Utility Guide.md`](../docs/Add-a-Skill%20Utility%20Guide.md)
- [`../docs/Platform Guides for PMs.md`](../docs/Platform%20Guides%20for%20PMs.md)
- [`../docs/Using PM Skills with Claude Code.md`](../docs/Using%20PM%20Skills%20with%20Claude%20Code.md)
- [`../docs/Using PM Skills with Codex.md`](../docs/Using%20PM%20Skills%20with%20Codex.md)
- [`../docs/Using PM Skills with Cursor.md`](../docs/Using%20PM%20Skills%20with%20Cursor.md)