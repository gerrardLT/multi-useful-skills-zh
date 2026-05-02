# 用 Make.com 使用 PM Skills

如果你刚接触 PM Skills，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

Make.com 非常适合构建可重复、无代码的 PM 自动化工作流。

## 最佳适用场景

- 从接收到摘要的自动化流程
- 每周定期生成的 PM 报告
- AI 辅助的任务分流与产出物生成

## 10 分钟快速配置

1.  在 Make.com 中创建一个 scenario。
2.  添加一个 trigger（webhook、表单、定时计划或应用事件）。
3.  添加一个 AI module（Claude/OpenAI），并将 skill 内容放入 system prompt。

## 方案 1：在 System Prompt 中嵌入固定 Skill

1.  将完整的 `SKILL.md` 内容粘贴到 AI module 的 system prompt 中。
2.  将输入数据传递到 user message 字段。

## 方案 2：通过 HTTP 动态获取 Skill

1.  在流程开头添加一个 HTTP step。
2.  从 GitHub 获取原始的 skill 文件。
3.  将返回的内容注入到 AI 的 system prompt 中。

原始 URL 模式示例：
`https://raw.githubusercontent.com/deanpeters/Product-Manager-Skills/main/skills/user-story/SKILL.md`

## 常见 Scenario 模式

1.  Trigger
2.  获取 skill
3.  准备输入
4.  AI step（skill + 输入）
5.  将输出路由到 Slack / Notion / Jira / 电子邮件

## 常见陷阱

- 一个过于庞大的 scenario 试图完成过多任务。
- 在发布输出前没有设置质量检查关卡。
- 没有保留关于假设/不确定性的记录。

## 官方资料

- Make 帮助中心：[https://help.make.com/](https://help.make.com/)
- Make AI Agents 简介：[https://help.make.com/introduction-to-make-ai-agents-new](https://help.make.com/introduction-to-make-ai-agents-new)
- 创建你的第一个 AI agent：[https://help.make.com/create-your-first-ai-agent](https://help.make.com/create-your-first-ai-agent)
- Make AI agent 最佳实践：[https://help.make.com/make-ai-agents-new-best-practices](https://help.make.com/make-ai-agents-new-best-practices)
- Make 开发者文档：[https://developers.make.com/](https://developers.make.com/)

## PM Skills 相关链接

- 平台指南索引：[`Platform Guides for PMs.md`](Platform%20Guides%20for%20PMs.md)
- 一页式入门：[`../START_HERE.md`](../START_HERE.md)