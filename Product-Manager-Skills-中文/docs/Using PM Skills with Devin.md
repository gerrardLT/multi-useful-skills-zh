# 用 Devin 使用 PM Skills

如果你刚接触 PM Skills，先看 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

Devin 的自主性很强，因此 PM Skills 特别适合作为实现前的护栏。

## 最适合谁

- 围绕 implementation-ready scope 进行 PM 与工程协作的人
- 希望先制定 spec 再开始编码的人
- 需要 acceptance-criteria 治理的人

## 10 分钟配置

1. 确保 Devin 能访问你的 repo 和 skill 文件。
2. 在 session prompt 中显式引用一个 skill。
3. 要求 Devin 在编码前暂停，等待你的批准。

起步 prompt：

```text
Before writing any code, read skills/user-story/SKILL.md.
Generate user stories with acceptance criteria for this feature: [feature].
Get my confirmation before implementation.
```

## 另一种方式：将 Skill 直接粘贴到 Session Instructions

```text
Apply this PM skill before writing tests or code:
[Paste skills/user-story/SKILL.md]

Current task: implement seat management for enterprise accounts.
Start with stories and wait for approval.
```

## 常见坑

- 放任 autonomous execution 跳过产品验证。
- 在编码前没有 stop/approve checkpoint。
- 缺少 scope boundary。

## 官方资料

- Devin 文档主页：[https://docs.devin.ai/](https://docs.devin.ai/)
- Devin 首次运行指南：[https://docs.devin.ai/get-started/first-run](https://docs.devin.ai/get-started/first-run)
- Devin 集成概览：[https://docs.devin.ai/integrations/overview](https://docs.devin.ai/integrations/overview)
- Devin 交互式规划：[https://docs.devin.ai/work-with-devin/interactive-planning](https://docs.devin.ai/work-with-devin/interactive-planning)
- Devin 斜杠命令：[https://docs.devin.ai/work-with-devin/slash-commands](https://docs.devin.ai/work-with-devin/slash-commands)

## PM Skills 相关链接

- 平台索引：[`Platform Guides for PMs.md`](Platform%20Guides%20for%20PMs.md)
- 一页式入门：[`../START_HERE.md`](../START_HERE.md)