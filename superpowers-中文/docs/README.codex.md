# 适用于 Codex 的 Superpowers

这是一份通过原生技能发现机制，在 OpenAI Codex 中使用 Superpowers 的说明。

## 快速安装

直接告诉 Codex：

```text
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.codex/INSTALL.md
```

## 手动安装

### 前置条件

- OpenAI Codex CLI
- Git

### 步骤

1. 克隆仓库

```bash
git clone https://github.com/obra/superpowers.git ~/.codex/superpowers
```

2. 创建 `skills` 符号链接

```bash
mkdir -p ~/.agents/skills
ln -s ~/.codex/superpowers/skills ~/.agents/skills/superpowers
```

3. 重启 Codex

4. **启用子代理能力**（可选）

像 `dispatching-parallel-agents` 和 `subagent-driven-development` 这类技能需要 Codex 的多代理能力。将以下配置添加到你的 Codex 配置文件中：

```toml
[features]
multi_agent = true
```

### Windows

请使用 `junction` 而不是 `symlink`，这样即使不开启开发者模式也能工作：

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
cmd /c mklink /J "$env:USERPROFILE\.agents\skills\superpowers" "$env:USERPROFILE\.codex\superpowers\skills"
```

## 工作原理

Codex 内置了技能发现能力。它会在启动时扫描 `~/.agents/skills/`，解析 `SKILL.md` 的 frontmatter，并按需加载技能。Superpowers 通过一个符号链接暴露给 Codex：

```text
~/.agents/skills/superpowers/ -> ~/.codex/superpowers/skills/
```

`using-superpowers` 技能会被自动发现，并负责强制执行技能使用纪律，无需额外配置。

## 使用方式

技能会被自动发现。Codex 会在以下情况下激活它们：

- 你直接提到某个技能名，例如 “use brainstorming”
- 当前任务符合技能描述
- `using-superpowers` 技能指示 Codex 去使用它

### 个人技能

你也可以在 `~/.agents/skills/` 中创建自己的技能：

```bash
mkdir -p ~/.agents/skills/my-skill
```

创建 `~/.agents/skills/my-skill/SKILL.md`：

```markdown
---
name: my-skill
description: 适用于[触发条件]
---

# My Skill

[Your skill content here]
```

`description` 字段就是 Codex 判断何时自动激活技能的依据，因此最好将其写成清晰的触发条件描述。

## 更新

```bash
cd ~/.codex/superpowers && git pull
```

由于是通过符号链接暴露技能，更新会立即生效。

## 卸载

```bash
rm ~/.agents/skills/superpowers
```

**Windows（PowerShell）：**

```powershell
Remove-Item "$env:USERPROFILE\.agents\skills\superpowers"
```

如果你愿意，也可以顺手删除克隆下来的仓库：`rm -rf ~/.codex/superpowers`。Windows 对应命令是：

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.codex\superpowers"
```

## 故障排查

### 技能没有显示

1. 检查符号链接：`ls -la ~/.agents/skills/superpowers`
2. 检查技能文件是否存在：`ls ~/.codex/superpowers/skills`
3. 重启 Codex。技能是在启动时发现的。

### Windows junction 问题

通常 `junction` 不需要额外权限就能工作。如果创建失败，可以尝试以管理员身份运行 PowerShell。

## 获取帮助

- 问题反馈：https://github.com/obra/superpowers/issues
- 主文档：https://github.com/obra/superpowers