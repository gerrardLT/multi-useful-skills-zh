# 在 Codex 安装 Superpowers

通过原生 skill 发现机制，在 Codex 中启用 Superpowers skills。只需要克隆仓库并创建符号链接。

## 前提条件

- Git

## 安装

1. **克隆 superpowers 仓库**

```bash
git clone https://github.com/obra/superpowers.git ~/.codex/superpowers
```

2. **创建 skills 符号链接**

```bash
mkdir -p ~/.agents/skills
ln -s ~/.codex/superpowers/skills ~/.agents/skills/superpowers
```

**Windows（PowerShell）：**

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
cmd /c mklink /J "$env:USERPROFILE\.agents\skills\superpowers" "$env:USERPROFILE\.codex\superpowers\skills"
```

3. **重启 Codex**

退出并重新启动 CLI，让它发现这些 skills。

## 从旧版 bootstrap 迁移

如果你是在原生 skill 发现机制推出之前安装的 superpowers，需要执行以下操作：

1. **更新仓库**

```bash
cd ~/.codex/superpowers && git pull
```

2. **创建 skills 符号链接**

按上面的第 2 步执行。这是新的发现机制。

3. **删除旧 bootstrap**

从 `~/.codex/AGENTS.md` 中删掉旧的 bootstrap 片段。凡是引用 `superpowers-codex bootstrap` 的内容都不再需要。

4. **重启 Codex**

## 验证

```bash
ls -la ~/.agents/skills/superpowers
```

你应该能看到一个指向 Superpowers skills 目录的符号链接。Windows 上则应看到 `junction`。

## 更新

```bash
cd ~/.codex/superpowers && git pull
```

skills 会通过符号链接立即同步更新。

## 卸载

```bash
rm ~/.agents/skills/superpowers
```

也可以选择删除克隆下来的仓库：

```bash
rm -rf ~/.codex/superpowers
```