# 在 ChatGPT 中使用 PM Skills

你可以通过三种方式将此技能仓库与 ChatGPT 配合使用，具体取决于你希望这套配置的可复用程度。

如果你刚接触此仓库，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

如果你主要使用桌面版，请参考 PM-first 指南：[`Using PM Skills with ChatGPT Desktop.md`](Using%20PM%20Skills%20with%20ChatGPT%20Desktop.md)。

如果你想先在本地测试技能，可以使用 Streamlit（beta）playground：

```bash
pip install -r app/requirements.txt
streamlit run app/main.py
```

---

## 方案 1：在 ChatGPT Apps 中连接 GitHub（最适合活跃仓库）

当你希望 ChatGPT 直接读取 GitHub 上的当前文件时，使用此方式。  
具体可用性可能因套餐和地区发布节奏而异。

1. 在 ChatGPT 中打开 **Settings**。
2. 进入 **Apps**（或 **Connected Apps**，取决于 UI 版本）。
3. 连接 **GitHub** 并授权访问。
4. 在聊天中让 ChatGPT 按路径使用此仓库中的技能文件。

示例：

```text
Use skills/prioritization-advisor/SKILL.md from deanpeters/Product-Manager-Skills and guide me through choosing a framework for a B2B roadmap.
```

Command 风格示例：

```text
Run commands/strategy.md from deanpeters/Product-Manager-Skills for: B2B analytics add-on for mid-market ecommerce brands.
```

---

## 方案 2：用 Skill Knowledge 构建 Custom GPT（最适合复用）

如果你想创建一个可复用的 PM 助手，并始终携带选定的技能，请使用此方式。

1. 在 ChatGPT 中新建一个 GPT。
2. 将技能文件上传为 Knowledge。
3. 在 GPT 指令中要求它严格遵循技能结构。
4. 保存并测试。

此仓库需注意：
- ChatGPT 的 GPT Knowledge 依赖上传文件；这些上传文件不会自动与 GitHub 同步。
- 此仓库的源文件格式为 `SKILL.md`。如果你想制作 Claude 风格兼容包，可运行：

```bash
bash scripts/package-claude-skills.sh
```

然后上传 `dist/claude-skills/<skill-name>/Skill.md` 中生成的文件（如果你只用于 ChatGPT，也可以直接上传原始 `SKILL.md` 文件）。

---

## 方案 3：用 ChatGPT Projects + Files（最适合单个项目）

如果你想将文件、对话和指令都围绕一个 initiative 组织在一起，请使用此方式。

1. 在 ChatGPT 中创建一个 Project。
2. 上传一个或多个技能文件（或一组精选技能）。
3. 添加项目指令，要求输出必须符合技能规范。
4. 在此项目中执行你的 PM 任务。

---

## 推荐的 Project / GPT 指令片段

```text
When solving PM tasks, use the uploaded skill files as the operating standard.
Follow each skill's sections in order: Purpose, Key Concepts, Application, Examples, Common Pitfalls, References.
If context is missing, ask up to 3 clarifying questions before drafting.
```

---

## 官方参考

- [Apps in ChatGPT (includes GitHub)](https://help.openai.com/en/articles/11487775-connectors-in-chatgpt/)
- [Creating a GPT](https://help.openai.com/en/articles/8554397-creating-a-gpt)
- [Knowledge in GPTs](https://help.openai.com/en/articles/8843948)
- [Projects in ChatGPT](https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt)