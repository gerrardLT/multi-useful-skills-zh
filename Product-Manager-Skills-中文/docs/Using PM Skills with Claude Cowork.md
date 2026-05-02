# 在 Claude Cowork 中使用 PM Skills

如果您的 PM 团队主要在共享工作区中协作，并希望跨会话复用同一套指导，Claude Cowork 会很适合。

如果您是首次接触，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

## 最适合谁

- 在共享工作区中协作的 PM 团队
- 希望在多个项目中复用同一套 Skills 的人
- 偏好对话式工作流、较少终端操作的人

## 10 分钟配置

1.  在 Cowork 中将此 repo 作为工作区打开。
2.  将 `skills/` 文件夹添加为知识源（如果您的工作区支持知识模块）。
3.  从一个交互式 Skill 开始：

```text
Use skills/prioritization-advisor/SKILL.md and guide me to a framework choice for our Q3 roadmap. Ask questions one at a time.
```

## 第一个高价值提示

```text
Using skills/problem-statement/SKILL.md, draft a user-centered problem statement for onboarding abandonment.
```

```text
Run skills/discovery-process/SKILL.md for enterprise churn. Keep it phase-by-phase and stop after each phase for my approval.
```

## 如何保持输出质量

- 从一个 Skill 开始，不要一开始就使用五个。
- 让 Cowork 在给出建议前先列出假设。
- 对工作流 Skills 使用阶段检查点。
- 让每个提示只绑定一个业务目标。

## 常见陷阱

- 将 Cowork 当作普通聊天，不提供 Skill 文件上下文。
- 在一个提示中混合多个目标（例如：战略 + 发布计划 + 定价）。
- 跳过可衡量的成功标准。

## 官方资料

- 在 Claude 中使用 Skills：[https://support.claude.com/en/articles/12512180-using-skills-in-claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- Model Context Protocol（更深层次的集成）：[https://docs.anthropic.com/en/docs/mcp](https://docs.anthropic.com/en/docs/mcp)

## PM Skills 相关链接

- Claude 总览指南：[`Using PM Skills with Claude.md`](Using%20PM%20Skills%20with%20Claude.md)
- 一页式入门：[`../START_HERE.md`](../START_HERE.md)