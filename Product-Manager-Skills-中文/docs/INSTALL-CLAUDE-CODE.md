# 在 Claude Code 中安装 PM Skills

Claude Code 用户通常应优先使用现成的插件市场路径。这样能让终端工作流更简洁，也符合本仓库已支持的 Claude Code 安装方式。

## 快速安装

在 Claude Code 中，添加插件市场并安装所需的技能：

```text
/plugin marketplace add deanpeters/Product-Manager-Skills
/plugin install jobs-to-be-done@pm-skills
/reload-plugins
```

然后按名称调用技能：

```text
Use the jobs-to-be-done skill to analyze this customer problem.
```

## 为何不直接使用 Claude Desktop ZIP？

ZIP 包是为 Claude Desktop 和 Claude Web 的技能上传流程准备的。Claude Code 已有更优路径：插件市场。

以下情况请使用插件市场：

- 您主要在终端中工作。
- 您希望逐个安装技能。
- 您希望 Claude Code 通过插件系统发现技能。

仅当您需要配置 Claude Desktop 或 Claude Web 时，才使用 ZIP 包。

## 常用命令

```text
/plugin marketplace add deanpeters/Product-Manager-Skills
/plugin install user-story@pm-skills
/plugin install prd-development@pm-skills
/plugin install product-strategy-session@pm-skills
/reload-plugins
```

## 更多安装路径

- Claude Desktop/Web: [`INSTALL-CLAUDE-DESKTOP.md`](INSTALL-CLAUDE-DESKTOP.md)
- Codex: [`INSTALL-CODEX.md`](INSTALL-CODEX.md)
- 维护者打包流程: [`RELEASE-PACKAGING.md`](RELEASE-PACKAGING.md)