# 用 CrewAI 使用 PM Skills

如果你刚接触 PM Skills，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

当你将 PM Skills 映射给专门的 agent 角色时，CrewAI 的效果最佳。

## 适用场景

- 多 agent PM 工作流
- 结构化委派（discovery、validation、stories、prioritization）
- 希望采用可重复编排模式的团队

## 快速配置指南

1. 创建你的 CrewAI agents。
2. 将每个 skill 作为 backstory / context 加载给对应的 specialist agent。
3. 先从 sequential process 开始，避免一开始就引入 hierarchical 的复杂性。

## 映射模式

- Discovery Agent -> `discovery-process`
- Story Writer Agent -> `user-story`
- Prioritization Agent -> `prioritization-advisor`
- Validation Agent -> `pol-probe`
- Strategy Lead Agent -> `product-strategy-session`

## 最小代码示例

```python
story_writer = Agent(
    role="PM Story Writer",
    goal="Convert epics into sprint-ready stories",
    backstory=open("skills/user-story/SKILL.md").read(),
    llm=your_llm,
)
```

```python
write_stories_task = Task(
    description="Write user stories for: {epic_description}",
    agent=story_writer,
    expected_output="As-a/I-want/So-that stories with Gherkin criteria",
)
```

## 常见问题

- 给单个 agent 加载过多的 frameworks。
- 每个 task 缺乏明确的 output contract。
- 过早尝试 hierarchical orchestration。

## 官方资源

- CrewAI 文档主页: [https://docs.crewai.com/](https://docs.crewai.com/)
- CrewAI 快速入门: [https://docs.crewai.com/en/quickstart](https://docs.crewai.com/en/quickstart)
- CrewAI CLI 概念: [https://docs.crewai.com/en/concepts/cli](https://docs.crewai.com/en/concepts/cli)
- CrewAI AGENTS.md 指南: [https://docs.crewai.com/en/guides/coding-tools/agents-md](https://docs.crewai.com/en/guides/coding-tools/agents-md)

## PM Skills 相关链接

- 编排指导: [`../AGENTS.md`](../AGENTS.md)
- 平台索引: [`Platform Guides for PMs.md`](Platform%20Guides%20for%20PMs.md)