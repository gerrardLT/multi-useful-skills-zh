# 用 Bolt 使用 PM Skills

如果你刚接触 PM Skills，建议先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

Bolt 适合快速制作原型，而 PM Skills 能将原型从“氛围级”提升至“可决策级”。

## 最适合谁

- 希望快速验证产品想法的产品经理
- 以原型优先为核心的探索循环
- 希望在生成 UI/代码前先明确问题框架的人

## 10 分钟配置

1. 新建一个 Bolt 项目。
2. 在让 Bolt 开始构建前，先粘贴一个 PM Skill。
3. 建议从 `problem-statement` 或 `pol-probe` 开始。

起步模式：

```text
在生成任何代码之前，请应用此 PM Skill：
[粘贴 skills/problem-statement/SKILL.md]

问题背景：[你的问题]
请先提出澄清性问题。
```

## 第一个高价值 Prompt

```text
应用下方的用户故事技能来定义我们要构建的内容，
然后生成一个满足故事 #1 的原型。

[粘贴 skills/user-story/SKILL.md]
功能：面向企业管理员的自助座位管理。
```

## 最适合 Bolt 的 Skills

- `problem-statement`
- `pol-probe`
- `user-story`
- `proto-persona`

## 常见坑

- 没有进行问题框架定义，直接说“给我做个 X”。
- 将第一个原型视为已验证的战略。
- 跳过验收标准。

## 官方资料

- Bolt 支持文档：[https://support.bolt.new/](https://support.bolt.new/)
- Bolt 快速入门：[https://support.bolt.new/building/quickstart](https://support.bolt.new/building/quickstart)
- 构建你的第一个应用：[https://support.bolt.new/building/build-your-first-app](https://support.bolt.new/building/build-your-first-app)
- Bolt 教程：[https://support.bolt.new/building/video-tutorials](https://support.bolt.new/building/video-tutorials)

## PM Skills 相关链接

- 平台指南索引：[`Platform Guides for PMs.md`](Platform%20Guides%20for%20PMs.md)
- 一页式入门：[`../START_HERE.md`](../START_HERE.md)