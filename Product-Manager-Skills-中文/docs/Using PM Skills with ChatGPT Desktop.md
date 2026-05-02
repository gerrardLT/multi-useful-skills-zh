# 用 ChatGPT Desktop 使用 PM Skills

ChatGPT Desktop 非常适合希望快速上手、聊天体验流畅且不想增加过多工具负担的产品经理。

如果你是首次访问，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

## 最适合谁

- 希望始终停留在聊天界面内的产品经理（不使用终端）
- 基于项目协作并希望复用指令的人员
- 需要快速起草、决策支持和生成产出物的人员

## 10 分钟配置

1. 打开 ChatGPT Desktop，创建一个新 Project。
2. 从 `skills/<skill-name>/SKILL.md` 上传 1-3 个 skill 文件。
3. 在 Project instructions 中添加：

```text
Use uploaded skill files as operating standards.
Follow sections in order: Purpose, Key Concepts, Application, Examples, Common Pitfalls, References.
Ask up to 3 clarifying questions when context is missing.
```

4. 执行你的第一个请求：

```text
Use the uploaded prioritization-advisor skill to recommend a framework for our Q3 requests.
```

## 另一种方式：连接 GitHub

如果你的套餐支持 GitHub 连接，也可以直接让 ChatGPT 从这个仓库读取 skill 文件。

```text
Use skills/prd-development/SKILL.md from deanpeters/Product-Manager-Skills to draft a PRD for improving onboarding completion.
```

## 如何保持输出质量

- 保持项目范围紧凑（一个项目只围绕一个核心目标）。
- 仅上传相关的 skills。
- 每个提示都明确成功标准（例如：转化率提升 12%，在 Q3 结束前达成）。

## 常见问题

- 一次上传过多 skills。
- Project instructions 留空。
- 未提供目标受众或约束条件，直接要求输出。

## 官方资料

- ChatGPT 桌面应用：[https://openai.com/chatgpt/desktop/](https://openai.com/chatgpt/desktop/)
- ChatGPT 中的 Projects：[https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt](https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt)
- 创建 GPT：[https://help.openai.com/en/articles/8554397-creating-a-gpt](https://help.openai.com/en/articles/8554397-creating-a-gpt)
- ChatGPT 中的 GitHub 连接器：[https://help.openai.com/en/articles/11487775-connectors-in-chatgpt](https://help.openai.com/en/articles/11487775-connectors-in-chatgpt)

## PM Skills 相关链接

- ChatGPT 总览指南：[`Using PM Skills with ChatGPT.md`](Using%20PM%20Skills%20with%20ChatGPT.md)
- 一页式入门：[`../START_HERE.md`](../START_HERE.md)