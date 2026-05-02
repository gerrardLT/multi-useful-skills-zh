# 用 OpenClaw 使用 PM Skills

如果你想要一个开放、自托管的助手环境，并且希望进行可控实验，OpenClaw 会是一个合适的选择。

如果你是第一次接触，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

## 最适合谁

- 想要测试不同 agent 行为的 PM 和团队
- 偏好自托管选项的组织
- 希望与其他 AI 工具进行并排质量对比的人

## 10 分钟配置

1.  首先，在你的环境中运行 OpenClaw。
2.  确保此代码库对 OpenClaw 可访问（通过本地挂载或连接式来源）。
3.  从一个 skill 路径开始：

```text
Use skills/prioritization-advisor/SKILL.md to guide framework selection for our roadmap tradeoffs. Ask questions one at a time, then provide numbered recommendations.
```

## 第一个高价值 Prompt

```text
Using skills/problem-framing-canvas/SKILL.md, help me frame our onboarding drop-off problem before proposing solutions.
```

```text
Run commands/discover.md for: reduce activation drop-off for self-serve SMB users.
```

## 如何保持输出质量

- 在一次对话中，将一个 skill 视为本次会话的操作系统。
- 在提供推荐之前，先要求明确假设和证据缺口。
- 保留显式的决策日志（记录接受了什么、拒绝了什么以及原因）。

## 常见陷阱

- 进行实验时没有设定成功指标。
- 使用不同的 prompt 比较不同的工具，然后直接断言“这个更好”。
- 中途切换 framework，却没有记录原因。

## 官方资料

- OpenClaw 文档：[https://docs.openclaw.ai/](https://docs.openclaw.ai/)
- OpenClaw 安全文档：[https://docs.openclaw.ai/security](https://docs.openclaw.ai/security)
- OpenClaw GitHub：[https://github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
- OpenClaw 官网：[https://openclaw.ai/](https://openclaw.ai/)

## PM Skills 相关链接

- 工具宪章背景：[`PM Tooling Operations Charter.md`](PM%20Tooling%20Operations%20Charter.md)
- 一页式入门：[`../START_HERE.md`](../START_HERE.md)