# PM 工具运营章程

**最后更新：** 2026-02-09  
**目的：** 为构建、测试和分发 PM skills 定义一套务实且重视教学价值的工具栈。

---

## 为什么要有这份文档

我们靠展示能运行的系统来教学，而不只是表达观点。  
这份章程定义了我们使用哪些工具、每个工具最擅长什么工作，以及它们可能在哪些地方带来风险或噪音。

---

## 核心工具栈（推荐）

### 1) VS Code (+ GitHub Copilot)

**最适合：** 团队标准化编辑、指令文件、可复用 prompt 文件，以及适合企业推广的工作方式。  
**适用场景：** 你需要在不同贡献者和仓库之间保持一致行为时。

关键能力：
- 通过工作区级指令文件（`.github/copilot-instructions.md`、`.instructions.md`、`AGENTS.md`）强制执行共享规范。

### 2) Cursor

**最适合：** 快速进行多文件 agent 式编辑，以及理解仓库上下文的重构。  
**适用场景：** 你需要高速起草和重组，同时配合较强的人类审查时。

关键能力：
- 在 `.cursor/rules` 中定义项目规则，以获得可重复的 agent 行为。

### 3) OpenAI Codex + ChatGPT

**最适合：** 本地编码辅助，以及针对已连接仓库的云端委派编码任务。  
**适用场景：** 你需要更深的实现速度、测试执行闭环，以及云端交接选项时。

关键能力：
- Codex web 在处理基于仓库的任务时，需要在 ChatGPT 中连接 GitHub。

### 4) Microsoft 365 Copilot (M365 Copilot)

**最适合：** 在 Word、Excel、PowerPoint、Outlook、Teams 中开展原生企业 PM 工作，并利用基于 Graph 的上下文。  
**适用场景：** 你的团队本来就深度使用 Microsoft 365，并希望把 AI 融入日常产物和协作流程时。

关键能力：
- 基于 Microsoft Graph 提供上下文，同时受租户权限边界约束。

### 5) n8n

**最适合：** 可预测的自动化流水线，以及系统到系统的编排。  
**适用场景：** 你需要带有运营控制能力的可重复工作流（采集、转换、校验、发布）时。

关键能力：
- 基于 Git 的源码控制/环境管理（企业版特性），以及很强的自托管控制面。

### 6) Lovable

**最适合：** 快速产出 UX/原型，并可同步到 GitHub 供后续工程使用。  
**适用场景：** 你需要快速做演示界面，或面向干系人验证概念时。

关键能力：
- 双向 GitHub 同步，但要求仓库路径保持稳定。

### 7) MoltBot (OpenClaw) [Experimental]

**最适合：** 在主流厂商默认模式之外，快速实验不同的 agent 行为和工作流。  
**适用场景：** 你想把它和现有工具栈对比，评估输出质量、速度和可控性时。

关键能力：
- 提供灵活的实验界面，可与 Codex/Claude/Copilot 模式做并行对比。

---

## 实际分工建议

1. **叙述内容 + PM 产物起草：** Microsoft 365 Copilot 和 ChatGPT  
2. **Skill 编写 + 严格合规：** Codex、VS Code、Cursor  
3. **工作流自动化 + 打包：** n8n + 仓库脚本（`add-a-skill`、`build-a-skill`、`find-a-skill`、`test-a-skill`）  
4. **原型/演示界面：** Lovable  
5. **实验性基准跑道：** MoltBot（OpenClaw），用于可控的 A/B 工作流试验  
6. **最终质量关卡：** `scripts/test-a-skill.sh` + metadata checks + 人工审查

---

## 护栏规则

- 优先遵守仓库原生标准，而不是工具默认行为。
- 让指令文件进入版本控制（`AGENTS.md`、`CLAUDE.md`、Copilot/Cursor 指令资源）。
- 所有生成内容在通过测试和人工审查前，都只当作草稿。
- 在企业环境下，优先选择能遵守租户访问控制和最小权限原则的工具。
- 明确记录计划/功能假设，因为可用性会因套餐和发布区域而不同。
- 实验性工具（例如 MoltBot/OpenClaw）在通过同样的一致性检查前，不要放进默认发布路径。

---

## 官方参考资料

- Microsoft 365 Copilot overview: [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview)
- Microsoft 365 Copilot Chat overview: [Microsoft Learn](https://learn.microsoft.com/en-us/copilot/overview)
- n8n docs home: [n8n Docs](https://docs.n8n.io/)
- n8n source control and environments: [n8n Docs](https://docs.n8n.io/source-control-environments/)
- n8n privacy and security responsibilities: [n8n Docs](https://docs.n8n.io/privacy-security/what-you-can-do/)
- Lovable GitHub integration: [Lovable Docs](https://docs.lovable.dev/integrations/github)
- Cursor docs: [Cursor Docs](https://cursor.com/docs)
- VS Code custom instructions: [VS Code Docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- VS Code prompt files: [VS Code Docs](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- Codex with ChatGPT plans: [OpenAI Help](https://help.openai.com/en/articles/11369540-codex-in-chatgpt)
- Apps in ChatGPT: [OpenAI Help](https://help.openai.com/en/articles/11487775-connectors-in-chatgpt/)