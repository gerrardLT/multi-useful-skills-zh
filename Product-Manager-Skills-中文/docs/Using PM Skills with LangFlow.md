# 用 LangFlow 使用 PM Skills

LangFlow 是一个可视化工作流构建器。如果你更喜欢拖拽式编排，而不是写代码，它会很合适。

如果你第一次来到这里，先看 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

## 最适合谁

- 想用可视化方式设计流程的 PM
- 在运行可重复提示词流程的团队
- 想把发现阶段结构化交接至产物生成的人

## 10 分钟配置

1. 安装 LangFlow（通常 Desktop 版最省事）。
2. 创建一个 flow，包含：
   - Input node
   - Prompt Template node
   - Model node
   - Output node
3. 在 Prompt Template 中，粘贴一个来自 `skills/<skill-name>/SKILL.md` 的 skill，再加上你的业务上下文。
4. 先用一个明确结果目标跑第一次测试。

给 Prompt Template 的起始 prompt：

```text
Use the following PM skill as the operating framework:
[PASTE SKILL CONTENT]

Business context:
[YOUR CONTEXT]

Ask up to 3 clarifying questions first.
Then produce markdown output with assumptions, risks, and next steps.
```

## 典型 PM Flows

- Intake -> problem framing -> recommendation summary
- Discovery notes -> synthesized insight themes
- Initiative brief -> PRD first draft
- Roadmap inputs -> prioritization recommendation

## 怎么保持输出质量

- 每个 flow 只绑定一个业务决策。
- 保存并版本化你的 prompt template。
- 对外分享前加最后一层人工审查。

## 常见坑

- 大而全的一体化 flow，难以调试。
- 中途切换 skill 框架，却没记录原因。
- 将首次运行结果视为最终交付物。

## 官方资料

- LangFlow docs home: [https://docs.langflow.org/](https://docs.langflow.org/)
- Install LangFlow: [https://docs.langflow.org/get-started-installation](https://docs.langflow.org/get-started-installation)
- LangFlow quickstart: [https://docs.langflow.org/get-started-quickstart](https://docs.langflow.org/get-started-quickstart)
- Workflow API: [https://docs.langflow.org/workflow-api](https://docs.langflow.org/workflow-api)
- LangFlow MCP server: [https://docs.langflow.org/mcp-server](https://docs.langflow.org/mcp-server)

## PM Skills 相关链接

- 一页式入门: [`../START_HERE.md`](../START_HERE.md)
- Tooling charter 背景: [`PM Tooling Operations Charter.md`](PM%20Tooling%20Operations%20Charter.md)