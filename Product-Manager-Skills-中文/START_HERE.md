# 从这里开始

如果你是第一次来到这个仓库，那你来对地方了。

你**不需要**是程序员，也能很好地使用 PM Skills。

## v0.65 新增

你提出了需求，我们认真补充了。我们专门整理了一套完整的说明，帮助你安装、集成和使用其中任意一个或全部 skill。

先看这几个：
- `docs/Using PM Skills 101.md`
- `docs/Platform Guides for PMs.md`
- `docs/Using PM Skills with Slash Commands 101.md`

## 0）先读这个（2 分钟）

- 入门指南：`docs/Using PM Skills 101.md`
- 平台选择器：`docs/Platform Guides for PMs.md`

如果你只能记住一点，那就是：

- 先选 **一个 skill**
- 提出 **一个真实业务问题**
- 先要求 AI **提出澄清问题**

## 1）按你的熟悉程度选择

### A）“我只想在聊天里直接获得结果”（非技术）

先看：
- `Claude Desktop`：`docs/Using PM Skills with Claude Desktop.md`
- `ChatGPT Desktop`：`docs/Using PM Skills with ChatGPT Desktop.md`

可直接复制的起始提示词：

```text
请把我上传的 PM skill 当作你的工作框架。
先最多问我 3 个澄清问题。
然后用 Markdown 输出最终结果。
最后补上假设、风险和下一步。
```

### B）“我会用终端”（可控性更高）

先看：
- `Claude Code`：`docs/Using PM Skills with Claude Code.md`
- `Claude /slash commands`：`docs/Using PM Skills with Slash Commands 101.md`
- `Codex`：`docs/Using PM Skills with Codex.md`

可直接复制的起始提示词：

```text
请使用 `skills/prioritization-advisor/SKILL.md`，帮我为 12 个需求和 1 个 sprint 选择合适框架。
一次只问一个问题，然后给我编号式建议。
```

### C）“我需要可复用工作流”（自动化）

先看：
- `n8n`：`docs/Using PM Skills with n8n.md`
- `LangFlow`：`docs/Using PM Skills with LangFlow.md`
- `Python agents`：`docs/Using PM Skills with Python Agents.md`

### D）“我在尝试其他 agent 栈”

先看：
- `OpenClaw`：`docs/Using PM Skills with OpenClaw.md`
- `Claude Cowork`：`docs/Using PM Skills with Claude Cowork.md`

## 2）先选你的第一个结果类型

### 我需要一个 PM 产物

```bash
./scripts/run-pm.sh skill user-story "Write stories for a new account settings page"
```

### 我需要辅助决策

```bash
./scripts/run-pm.sh skill prioritization-advisor "We have 12 requests and one sprint"
```

### 我需要端到端指导

```bash
./scripts/run-pm.sh command discover "Reduce onboarding drop-off for self-serve users"
```

## 3）快速找到合适的 Skill

```bash
./scripts/find-a-skill.sh --keyword onboarding
./scripts/find-a-command.sh --keyword roadmap
./scripts/find-a-command.sh --list-all
```

## 4）如果你卡住了

- 从一个简单请求和一个 skill 文件开始
- 一定要提供真实上下文（用户分群、KPI、时间线）
- 先让 AI 解释假设，再开始产出草稿
- 把 `docs/Using PM Skills 101.md` 当作基础指南

## 5）完整指南

- 新手上手：`docs/Using PM Skills 101.md`
- PM 平台导航：`docs/Platform Guides for PMs.md`
- Claude Code：`docs/Using PM Skills with Claude Code.md`
- Claude /slash commands：`docs/Using PM Skills with Slash Commands 101.md`
- Codex：`docs/Using PM Skills with Codex.md`
- OpenClaw：`docs/Using PM Skills with OpenClaw.md`
- Claude Cowork：`docs/Using PM Skills with Claude Cowork.md`
- Claude Desktop：`docs/Using PM Skills with Claude Desktop.md`
- ChatGPT Desktop：`docs/Using PM Skills with ChatGPT Desktop.md`
- n8n：`docs/Using PM Skills with n8n.md`
- LangFlow：`docs/Using PM Skills with LangFlow.md`
- Python agents：`docs/Using PM Skills with Python Agents.md`
- Cursor：`docs/Using PM Skills with Cursor.md`
- Windsurf：`docs/Using PM Skills with Windsurf.md`
- Bolt：`docs/Using PM Skills with Bolt.md`
- Replit Agent：`docs/Using PM Skills with Replit Agent.md`
- Make.com：`docs/Using PM Skills with Make.com.md`
- Devin：`docs/Using PM Skills with Devin.md`
- CrewAI：`docs/Using PM Skills with CrewAI.md`
- Gemini：`docs/Using PM Skills with Gemini.md`
- ChatGPT（全部方式）：`docs/Using PM Skills with ChatGPT.md`
- Claude（全部方式）：`docs/Using PM Skills with Claude.md`
- 非技术用户快速选择：`docs/PM Skills Rule-of-Thumb Guide.md`
- 多工具协作方式：`docs/PM Tooling Operations Charter.md`