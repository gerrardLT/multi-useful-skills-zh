# 在 Gemini 中使用 PM Skills

如果您刚接触 PM Skills，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

Gemini 可以通过持久项目上下文（`GEMINI.md`）、直接文件上下文，或 AI Studio 指令来使用 PM Skills。

## 适用人群

- 已经在使用 Gemini CLI 或 AI Studio 的团队
- 需要可复用本地上下文的 PM 工作流
- 希望与 Claude 风格配置保持跨工具一致性的人

## 10 分钟配置

1.  在项目根目录创建 `GEMINI.md`。
2.  添加一到两个 PM Skills。
3.  从一个真实任务开始。

示例：

```text
## Active PM Skills
Apply relevant PM frameworks based on task type.

### User Story Skill
[Paste skills/user-story/SKILL.md]

### Prioritization Advisor Skill
[Paste skills/prioritization-advisor/SKILL.md]
```

## Gemini CLI 文件上下文

```bash
gemini --context skills/user-story/SKILL.md \
  "Write user stories for our checkout abandonment epic"
```

```bash
gemini --context skills/user-story/SKILL.md \
  --context skills/prioritization-advisor/SKILL.md \
  "Help me prioritize and then write stories for these 6 features"
```

## Google AI Studio 模式

1.  打开 AI Studio。
2.  将 Skill 内容粘贴到系统指令中。
3.  然后补充您的任务上下文和约束条件。

## 常见问题

- 在一个会话中塞入太多不相关的 Skills。
- Prompt 中没有 KPI 目标或时间线。
- 在给出推荐前跳过澄清问题。

## 官方资源

- Gemini API 快速入门: [https://ai.google.dev/gemini-api/docs/quickstart](https://ai.google.dev/gemini-api/docs/quickstart)
- Google AI Studio: [https://ai.google.dev/aistudio/](https://ai.google.dev/aistudio/)
- Gemini API 概览: [https://ai.google.dev/docs/gemini_api_overview](https://ai.google.dev/docs/gemini_api_overview)
- Gemini CLI 仓库: [https://github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)

## PM Skills 相关链接

- 平台索引: [`Platform Guides for PMs.md`](Platform%20Guides%20for%20PMs.md)
- 一页式入门: [`../START_HERE.md`](../START_HERE.md)