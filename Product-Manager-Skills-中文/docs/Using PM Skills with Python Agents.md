# 用 Python Agents 使用 PM Skills

如果你的团队正在用 Python 构建 agents，并且你想把 PM Skills 变成系统的一部分，就用这份指南。

如果你第一次来到这里，先看 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

## 最适合谁

- 一起构建内部 agent 工作流的 PM + 工程师组合
- 需要确定性、可测试 PM 输出流水线的团队
- 想把 AI 接进现有工具的 product ops 团队

## PM 友好的模式

把每个 `SKILL.md` 文件理解为一份 agent 必须遵守的可复用政策文档。

1. 加载一个 skill 文件。
2. 加入业务上下文。
3. 先要求澄清问题。
4. 要求结构化输出章节。
5. 记录 assumptions 和 risks。

## 最小集成示例

```python
from pathlib import Path

skill = Path("skills/prd-development/SKILL.md").read_text(encoding="utf-8")
context = "Improve onboarding completion for self-serve SMB users by Q3."

prompt = f"""
严格把这个 PM skill 当作你的工作框架来使用：
{skill}

业务背景：
{context}

先提出最多 3 个澄清问题。
然后输出 markdown 格式结果。
最后给出 assumptions、risks 和 next steps。
"""

# Send `prompt` to your model client.
```

## PM 在不写代码的情况下怎么参与

- 定义 output acceptance criteria。
- 创建 example inputs 和 expected outputs。
- 批准哪些 skills 可以进入生产工作流。
- 审查 error cases 和 edge-case behavior。

## 常见问题

- agent 没有任何 skill governance 就直接运行。
- 一个调用里混太多 skills。
- 没有输出质量的评价 rubric。

## 官方资料

- OpenAI API docs overview: [https://platform.openai.com/docs/overview](https://platform.openai.com/docs/overview)
- OpenAI agents guide: [https://platform.openai.com/docs/guides/agents](https://platform.openai.com/docs/guides/agents)
- Anthropic API getting started: [https://docs.anthropic.com/en/api/getting-started](https://docs.anthropic.com/en/api/getting-started)
- LangChain docs intro: [https://python.langchain.com/docs/introduction/](https://python.langchain.com/docs/introduction/)

## PM Skills 相关链接

- 一页式入门: [`../START_HERE.md`](../START_HERE.md)
- 平台选择器: [`Platform Guides for PMs.md`](Platform%20Guides%20for%20PMs.md)
