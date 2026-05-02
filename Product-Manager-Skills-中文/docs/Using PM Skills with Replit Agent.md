# 用 Replit Agent 使用 PM Skills

如果你刚接触 PM Skills，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

Replit Agent 非常适合那些希望进行迭代式构建循环，同时又需要产品框架护栏的产品经理。

## 最适合谁

- 希望在一个地方完成产品经理与构建者协作的人
- 需要持久化会话指令的人
- 想要快速进行原型到迭代循环的人

## 10 分钟配置

1. 为你的项目打开 Replit Agent。
2. 进入 Agent Settings -> System Prompt。
3. 粘贴一个技能（先从 `user-story` 开始）。

示例系统提示：

```text
你是一名 PM 助手兼开发者。
在生成代码或 UI 之前，先应用这个 User Story skill：
[Paste skills/user-story/SKILL.md]

在用户故事和验收标准确认之前，不要生成代码。
```

## 内联方案

```text
在开始构建之前应用这个 skill：
[Paste skills/user-story/SKILL.md]

功能：面向移动端用户的推送通知偏好设置。
```

## 推荐工作流

1. 先用 `problem-statement` 或 `pol-probe` 进行框架定义。
2. 用 `user-story` 定义范围。
3. 在 Replit Agent 中进行构建。
4. 用 `epic-breakdown-advisor` 拆分后续工作。

## 常见陷阱

- 未确认假设就直接交付。
- 跳过用户故事的验收标准。
- 在系统提示中塞入过多技能。

## 官方资料

- Replit 文档主页: [https://docs.replit.com/](https://docs.replit.com/)
- Replit Agent 文档: [https://docs.replit.com/replitai/agent](https://docs.replit.com/replitai/agent)
- Replit 通用 Agent 指南: [https://docs.replit.com/replitai/general-agent](https://docs.replit.com/replitai/general-agent)
- Replit Agent 中的网页搜索: [https://docs.replit.com/replitai/web-search](https://docs.replit.com/replitai/web-search)

## PM Skills 相关链接

- 平台索引: [`Platform Guides for PMs.md`](Platform%20Guides%20for%20PMs.md)
- 一页式入门: [`../START_HERE.md`](../START_HERE.md)
