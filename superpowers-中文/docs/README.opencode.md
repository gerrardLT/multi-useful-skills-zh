# 适用于 OpenCode 的 Superpowers

这是一份在 [OpenCode.ai](https://opencode.ai) 中使用 Superpowers 的完整说明。

## 安装

将 `superpowers` 添加到 `opencode.json` 文件的 `plugin` 数组中（全局或项目级配置均可）：

```json
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

然后重启 OpenCode。插件将通过 Bun 自动安装，并自动注册所有技能。

您可以通过以下方式验证：

```text
Tell me about your superpowers
```

### 从旧版 symlink 安装迁移

如果您之前是通过 `git clone` 和 `symlink` 方式安装 superpowers，请先移除旧配置：

```bash
# 删除旧 symlink
rm -f ~/.config/opencode/plugins/superpowers.js
rm -rf ~/.config/opencode/skills/superpowers

# 如有需要，也可以删除之前克隆的仓库
rm -rf ~/.config/opencode/superpowers

# 如果您曾在 opencode.json 中为 superpowers 配置过 skills.paths，也请一并删除
```

然后再按上面的新安装步骤操作即可。

## 使用方式

### 查找技能

使用 OpenCode 原生的 `skill` 工具列出所有可用技能：

```text
use skill tool to list skills
```

### 加载某个技能

```text
use skill tool to load superpowers/brainstorming
```

### 个人技能

您可以在 `~/.config/opencode/skills/` 目录下创建自定义技能：

```bash
mkdir -p ~/.config/opencode/skills/my-skill
```

创建 `~/.config/opencode/skills/my-skill/SKILL.md`：

```markdown
---
name: my-skill
description: 适用于[触发条件]
---

# My Skill

[Your skill content here]
```

### 项目级技能

您也可以在项目内的 `.opencode/skills/` 目录下创建项目专属技能。

**技能优先级：** 项目技能 > 个人技能 > Superpowers 技能

## 更新

每次重启 OpenCode 时，Superpowers 都会自动更新。插件会在每次启动时从 Git 仓库重新安装。

如果您想固定到某个特定版本，可以指定分支或标签：

```json
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git#v5.0.3"]
}
```

## 工作原理

此插件主要执行两项功能：

1.  通过聊天转换钩子注入启动上下文，让每次对话都具备 superpowers 意识。
2.  通过 `config` 钩子注册技能目录，这样 OpenCode 就能发现所有 Superpowers 技能，无需 `symlink`，也不用手工额外配置。

### 工具映射

为 Claude Code 编写的技能会自动适配到 OpenCode：

- `TodoWrite` -> `todowrite`
- 带子代理的 `Task` -> OpenCode 的 `@mention` 系统
- `Skill` 工具 -> OpenCode 原生 `skill` 工具
- 文件操作 -> OpenCode 原生工具

## 故障排查

### 插件没有加载

1.  查看 OpenCode 日志信息：`opencode run --print-logs "hello" 2>&1 | grep -i superpowers`
2.  确认 `opencode.json` 中的插件配置正确无误。
3.  确保您使用的是较新版本的 OpenCode。

### 找不到技能

1.  使用 OpenCode 的 `skill` 工具列出可用技能。
2.  确认插件已成功加载。
3.  每个技能都需要一个带有效 YAML frontmatter 的 `SKILL.md`。

### 启动上下文没有出现

1.  确认您的 OpenCode 版本支持相应的聊天转换钩子。
2.  修改配置后请重启 OpenCode。

## 获取帮助

- 问题反馈与讨论：https://github.com/obra/superpowers/issues
- 主文档：https://github.com/obra/superpowers
- OpenCode 文档：https://opencode.ai/docs/