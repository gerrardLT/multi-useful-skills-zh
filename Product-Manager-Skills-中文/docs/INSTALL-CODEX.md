# 在 Codex 中安装 PM Skills

Codex 可以从项目本地的 `.agents/skills` 文件夹使用这些 skills，也可以直接从这个仓库的克隆副本中使用。

## 使用 Codex ZIP 的快速安装

1.  打开 [Product Manager Skills Releases page](https://github.com/deanpeters/Product-Manager-Skills/releases/latest)。
2.  下载 [`pm-skills-codex.zip`](https://github.com/deanpeters/Product-Manager-Skills/releases/latest/download/pm-skills-codex.zip)。
3.  解压到你的项目目录或仓库根目录。
4.  确认项目里现在有：

```text
.agents/
  skills/
    <skill-name>/
      SKILL.md
AGENTS.md
```

5.  在这个仓库里打开 Codex。
6.  让 Codex 使用一个具名 skill。

示例：

```text
Use the jobs-to-be-done skill to analyze this customer problem.
```

## 高级安装：克隆整个仓库

高级用户可以直接克隆整个仓库，并从 repo 根目录运行 Codex。这样 Codex 就能访问：

- `skills/`
- `commands/`
- `catalog/`
- 仓库脚本和文档

如果你想提交贡献、查看完整库内容，或者使用 command 工作流，这是最好的路径。

## 说明

- 把 `skills/` 当作源技能库。
- 把生成出来的 `dist/` 产物当作可下载包。
- 如果你要给 Claude Desktop/Web 用，请改用 Claude ZIP 包。见 [`INSTALL-CLAUDE-DESKTOP.md`](INSTALL-CLAUDE-DESKTOP.md)。
- 如果你要给 Claude Code 用，请改用 plugin marketplace。见 [`INSTALL-CLAUDE-CODE.md`](INSTALL-CLAUDE-CODE.md)。