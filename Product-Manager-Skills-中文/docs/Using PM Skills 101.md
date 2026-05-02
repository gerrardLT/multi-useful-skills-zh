# 使用 PM Skills 101

**仓库：** [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills)
**可用技能：** 47 | **版本：** 0.65 | **兼容：** Claude, Codex, ChatGPT, Cowork, n8n, LangFlow, Lovable, OpenClaw, Cursor, Windsurf, Bolt, Replit, Make.com, Devin, CrewAI, Gemini

---

## 什么是 Skill？
Skill 是一个结构化的 markdown 文件（`SKILL.md`），它教会 AI agent 如何正确执行某项特定的 PM 任务，并且每次都能按正确方式完成，无需你从零开始重新解释流程。
你不再只是说一句 *"Write a PRD"* 然后听天由命，agent 会预先知道：
- 文档该如何组织
- 该问干系人什么问题
- 该用什么框架，以及什么时候用
- 什么才算好，以及什么应该避免
**Skills = 更少解释，更多战略工作。**

### Prompts vs. Skills

| Prompts | Skills |
|---|---|
| 每个任务都要临时写一次指令 | 可复用框架，加载一次就能复用 |
| 你得不断重复自己 | Agent 能记住最佳实践 |
| “Write a PRD for X” 然后赌结果 | Agent 知道结构，也会主动提更聪明的问题 |
| 每次输出都不稳定 | 输出更一致、更专业 |

---

## 三种 Skill 类型

Skills 被组织成三层，层层递进。
### Component Skills（1）： 模板与产物
**适用场景：** 你需要某个具体交付物的标准模板。
**耗时：** 10-20 分钟
**示例：** “写一个 user story” -> `user-story` skill

### Interactive Skills（10）： 引导式探索
**适用场景：** 你在执行前，需要先判断该走哪种方法。
**耗时：** 30-60 分钟
**示例：** “我该用哪种 prioritization framework？” -> `prioritization-advisor` skill 会根据你的上下文问 3-5 个问题，然后推荐 RICE、ICE、Kano 等框架。

### Workflow Skills（1）： 端到端流程
**适用场景：** 你需要把完整 PM 工作流从头跑到尾。
**耗时：** 数天到数周
**示例：** “让干系人对产品战略达成一致” -> `product-strategy-session` skill 会引导你走完 positioning -> problem framing -> solution exploration -> roadmap。

---

## 按平台安装指南
详细平台说明见各自文档；这一页只做入门总览。
### Claude.ai / Claude Desktop
- 通过粘贴、上传或 ZIP 加载 `SKILL.md`
- 适合非技术型 PM
- 先看 [`INSTALL-CLAUDE-DESKTOP.md`](INSTALL-CLAUDE-DESKTOP.md)

### Claude Code
- 通过 plugin marketplace 使用
- 适合终端工作流
- 先看 [`INSTALL-CLAUDE-CODE.md`](INSTALL-CLAUDE-CODE.md)

### 平台：Codex / ChatGPT
- 可通过本地仓库、GitHub 连接或 Skills CLI 使用
- 先看 [`Using PM Skills with Codex.md`](Using%20PM%20Skills%20with%20Codex.md)
- ChatGPT 用户再看 [`Using PM Skills with ChatGPT.md`](Using%20PM%20Skills%20with%20ChatGPT.md)

### 其他平台
- Cursor / Windsurf / Bolt / Replit / Make.com / n8n / CrewAI / Gemini 等平台，都有对应说明文档。
- 索引见 `docs/Platform Guides for PMs.md`

---

## 快速参考
### 最常见的起始 Skills

| 任务 | Skill | 类型 |
|---|---|---|
| 写 user story | `user-story` | Component |
| 拆解大型 epic | `epic-breakdown-advisor` | Interactive |
| 选择 prioritization framework | `prioritization-advisor` | Interactive |
| 在开做前验证假设 | `pol-probe` + `pol-probe-advisor` | Component + Interactive |
| 框定客户问题 | `problem-statement` | Component |
| 写完整 PRD | `prd-development` | Workflow |
| 规划季度 roadmap | `roadmap-planning` | Workflow |
| 做 customer discovery | `discovery-process` | Workflow |
| 评估 AI readiness | `ai-shaped-readiness-advisor` | Interactive |

### 本地常用脚本

```bash
# 按关键词或类型找 skill
./scripts/find-a-skill.sh --keyword pricing --type interactive

# 为单个 skill 打 ZIP
./scripts/zip-a-skill.sh --skill user-story

# 构建精选 starter pack
./scripts/zip-a-skill.sh --preset core-pm --output dist/skill-zips

# 做 conformance 校验
./scripts/test-a-skill.sh --skill user-story --smoke
```

---

## 更多资源

- **完整文档：** `github.com/deanpeters/Product-Manager-Skills/docs/`
- **平台索引：** `docs/Platform Guides for PMs.md`
- **Claude Code slash command 指南：** `docs/Using PM Skills with Slash Commands 101.md`
- **核心平台指南：** `docs/Using PM Skills with Claude.md`、`docs/Using PM Skills with Codex.md`、`docs/Using PM Skills with ChatGPT.md`
- **非技术型入门指南：** `docs/PM Skills Rule-of-Thumb Guide.md`
- **自己构建 skill：** `./scripts/build-a-skill.sh`
- **Streamlit playground：** `streamlit run app/main.py`