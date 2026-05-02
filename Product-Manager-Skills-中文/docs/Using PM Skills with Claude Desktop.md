# 用 Claude Desktop 使用 PM Skills

Claude Desktop 是一个强大的非技术路径：上传打包好的 skills，然后像平常聊天一样使用。

如果你是第一次来到这里，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

## 最适合谁

- 希望通过简单点击完成配置的 PM
- 更喜欢应用工作流而非终端的团队
- 想复用一小组核心 PM skills 的人

## 10 分钟配置

1. 先为单个 skill 打 zip 包：

```bash
./scripts/zip-a-skill.sh --skill user-story
```

2. 在 Claude Desktop 中打开 `Settings -> Capabilities -> Skills`。
3. 上传 `dist/skill-zips/` 目录中的 zip 文件。
4. 用一个实际 prompt 开始：

```text
Use the user-story skill to write stories for improving account setup completion.
```

## 推荐的起步包

- 针对单个明确任务：

```bash
./scripts/zip-a-skill.sh --skill prioritization-advisor
```

- 精选 starter set：

```bash
./scripts/zip-a-skill.sh --preset core-pm --output dist/skill-zips
```

## 如何保持输出质量

- 先上传 1-3 个 skills，不要一开始就上传整个库。
- 对于交互式 skills，要让助手先把问题问完，再要求它输出结论。
- 给出具体约束（segment、KPI、deadline、dependencies）。

## 常见问题

- 直接上传源文件夹，而不是打包好的 zip。
- 以为上传后会与 GitHub 自动同步。
- Prompt 太泛，没有业务上下文。

## 官方资料

- Using Skills in Claude: [https://support.claude.com/en/articles/12512180-using-skills-in-claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- Claude desktop app download: [https://claude.ai/download](https://claude.ai/download)
- Anthropic MCP docs（高级集成）: [https://docs.anthropic.com/en/docs/mcp](https://docs.anthropic.com/en/docs/mcp)

## PM Skills 相关链接

- Claude 总览指南: [`Using PM Skills with Claude.md`](Using%20PM%20Skills%20with%20Claude.md)
- 打包辅助说明: [`../scripts/package-claude-skills.sh`](../scripts/package-claude-skills.sh)