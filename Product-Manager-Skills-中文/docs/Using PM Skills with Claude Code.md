# 在 Claude Code 中使用 PM Skills

如果你希望输出可重复、质量稳定，并且能完整访问本地 repo 文件，Claude Code 非常合适。
如果你是第一次来到这里，请先查看 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。
如果你想要一条命令式的 PM 快捷方式，请再查看 [`Using PM Skills with Slash Commands 101.md`](Using%20PM%20Skills%20with%20Slash%20Commands%20101.md)。

## 最适合谁
- 能运行几个终端命令的 PM
- 想要稳定工作流，而不是一次性 prompt 的团队
- 要做 discovery、PRD、roadmap planning 这类深度工作的团队

## 10 分钟配置

1.  先把这个 repo 克隆到本地。
2.  在 repo 文件夹里打开终端。
3.  跑一个入门请求：

```bash
claude "请使用 skills/prioritization-advisor/SKILL.md，帮我为 12 个需求和 1 个 sprint 选择合适框架。一次只问一个问题。"
```

## 第一个高价值 Prompt

按原样用下面这些，再根据上下文替换内容。

```bash
claude "Using skills/user-story/SKILL.md, write user stories for improving checkout completion."
```

```bash
claude "Run commands/write-prd.md for a mobile onboarding redesign focused on reducing time-to-value."
```

## 怎么保持输出质量

- 给出真实约束：客户类型、KPI 目标、时间线。
- 先要求澄清问题。
- 显式写 skill 路径（`skills/<skill-name>/SKILL.md`）。
- 对 interactive skills，在出现选项时尽量用数字回答（`2` 或 `1 & 3`）。

## 常见坑
- Prompt 太宽：比如“write a PRD”但不给上下文。
- 一个 skill 还没跑顺，就一口气混很多 skills。
- 不写 skill 路径，却期待模型自己猜到框架细节。

## 官方资料

- Claude Code 概述: [https://docs.anthropic.com/en/docs/claude-code/overview](https://docs.anthropic.com/en/docs/claude-code/overview)
- Claude Code 快速入门: [https://docs.anthropic.com/en/docs/claude-code/quickstart](https://docs.anthropic.com/en/docs/claude-code/quickstart)
- Claude Code 常见工作流: [https://docs.anthropic.com/en/docs/claude-code/common-workflows](https://docs.anthropic.com/en/docs/claude-code/common-workflows)

## PM Skills 相关链接

- Claude 总览指南: [`Using PM Skills with Claude.md`](Using%20PM%20Skills%20with%20Claude.md)
- Skill 查找器: `./scripts/find-a-skill.sh --keyword <topic>`
- Command 查找器: `./scripts/find-a-command.sh --list-all`