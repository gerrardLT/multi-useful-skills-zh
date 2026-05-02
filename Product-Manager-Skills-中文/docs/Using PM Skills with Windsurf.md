# 用 Windsurf 使用 PM Skills

如果你刚接触 PM Skills，先看 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

当你想要 agentic 多步执行，并且希望项目规则可持久保留时，Windsurf 很合适。

## 最适合谁

- 想在一个 session 里协调多步工作的 PM
- 希望通过 rules 文件保持持久性框架指导的人
- 想通过 `@` 引用按文件调用 skill 的人

## 10 分钟配置

1. 在 Windsurf 中打开你的 workspace。
2. 在项目根目录创建 `.windsurfrules`。
3. 加入一到两个 PM skills。

示例：

```text
## PM Skills Active in This Project

You are a PM assistant with access to the following frameworks.
Apply them when task context matches.

### User Story Skill
[Paste skills/user-story/SKILL.md]

### Problem Statement Skill
[Paste skills/problem-statement/SKILL.md]
```

## 按需调用 Skill

```text
@skills/prioritization-advisor/SKILL.md
Help me rank these 10 features for Q2. Context: post-PMF, 3 squads, hard June date.
```

```text
@skills/epic-breakdown-advisor/SKILL.md
Split this epic: [paste epic description]
```

## 常见坑

- 跑 workflow 时没有 checkpoint 审批。
- 一个 prompt 里混进多个不相关目标。
- 请求上下文里没有 KPI 目标或时间线。

## 官方资料

- Windsurf docs home: [https://docs.windsurf.com/](https://docs.windsurf.com/)
- Cascade memories and context behavior: [https://docs.windsurf.com/plugins/cascade/memories](https://docs.windsurf.com/plugins/cascade/memories)
- Ignore files/context filtering: [https://docs.windsurf.com/context-awareness/windsurf-ignore](https://docs.windsurf.com/context-awareness/windsurf-ignore)

## PM Skills 相关链接

- 平台索引: [`Platform Guides for PMs.md`](Platform%20Guides%20for%20PMs.md)
- 一页式入门: [`../START_HERE.md`](../START_HERE.md)