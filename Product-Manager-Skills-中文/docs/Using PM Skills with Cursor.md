# 用 Cursor 使用 PM Skills

如果你刚接触 PM Skills，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

Cursor 非常适合希望获得快速编辑能力与强大文件上下文提示功能的 PM。

## 最适合谁

- 在与代码紧密协作的产品团队中工作的 PM
- 希望拥有可复用项目级 skill 上下文的人
- 想通过 `@file` 按需加载 skills 的人

## 10 分钟配置

1. 在 Cursor 中打开你的项目。
2. 首先决定你需要持久化（persistent）还是按需（on-demand）的 skills。
3. 从一个 skill 开始：`skills/user-story/SKILL.md`。

## 方案 1：用 `.cursorrules` 做持久技能

1. 在项目根目录创建 `.cursorrules` 文件。
2. 粘贴一到两个高频使用的 skills。
3. 保持聚焦，避免一次性塞入 20 个 skills。

示例：

```text
## Active PM Skills

You have access to the following PM frameworks. Apply the relevant one based on the task type.

### User Story Skill
[Paste skills/user-story/SKILL.md]

### Prioritization Advisor Skill
[Paste skills/prioritization-advisor/SKILL.md]
```

## 方案 2：用 `@file` 按需加载

```text
@skills/user-story/SKILL.md
Write user stories for our checkout abandonment epic.
```

```text
@skills/pol-probe/SKILL.md
Design a validation experiment for this hypothesis: [hypothesis]
```

## 方案 3：`prompts/` 文件夹模式

1. 在项目根目录创建 `prompts/` 文件夹。
2. 将选定的 skills 复制进去，并为其起一个更友好的名称。
3. 通过类似 `@prompts/user-story.md` 的方式引用。

## 常见坑

- 一次性加载过多 skills。
- Prompt 过于宽泛，缺乏业务约束。
- 请求中没有可衡量的结果。

## 官方资料

- Cursor 文档首页: [https://cursor.com/docs](https://cursor.com/docs)
- Cursor 规则: [https://docs.cursor.com/en/context/rules](https://docs.cursor.com/en/context/rules)
- Cursor `@` 规则参考: [https://docs.cursor.com/en/context/%40-symbols/%40-cursor-rules](https://docs.cursor.com/en/context/%40-symbols/%40-cursor-rules)
- Cursor 忽略文件: [https://docs.cursor.com/en/context/ignore-files](https://docs.cursor.com/en/context/ignore-files)

## PM Skills 相关链接

- 平台索引: [`Platform Guides for PMs.md`](Platform%20Guides%20for%20PMs.md)
- 一页式入门: [`../START_HERE.md`](../START_HERE.md)