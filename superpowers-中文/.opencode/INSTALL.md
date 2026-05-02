# 在 OpenCode 中安装 Superpowers

## 前提条件

- 已安装 [OpenCode.ai](https://opencode.ai)

## 安装

将 `superpowers` 添加到 `opencode.json`（全局或项目级）的 `plugin` 数组中：

```json
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

然后重启 OpenCode。插件会自动安装并注册所有 skills。

可通过以下命令验证：

```text
Tell me about your superpowers
```

## 从旧的符号链接安装方式迁移

如果你之前通过 `git clone` 加符号链接的方式安装过 superpowers，请先移除旧配置：

```bash
# 删除旧 symlink
rm -f ~/.config/opencode/plugins/superpowers.js
rm -rf ~/.config/opencode/skills/superpowers

# 如有需要，也可以删除之前克隆的仓库
rm -rf ~/.config/opencode/superpowers

# 如果你曾在 opencode.json 里为 superpowers 配过 skills.paths，也一并删掉
```

然后按照上面的新安装步骤重新配置。

## 使用

使用 OpenCode 原生的 `skill` 工具：

```text
use skill tool to list skills
use skill tool to load superpowers/brainstorming
```

## 更新

每次重启 OpenCode 时，Superpowers 都会自动更新。

如果要固定某个版本：

```json
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git#v5.0.3"]
}
```

## 故障排查

### 插件未加载

1.  检查日志：`opencode run --print-logs "hello" 2>&1 | grep -i superpowers`
2.  确认 `opencode.json` 里的插件配置写法正确
3.  确保你使用的是较新的 OpenCode 版本

### 找不到 Skills

1.  用 `skill` 工具列出当前已发现的内容
2.  检查插件是否已经加载

### 工具映射

当 skills 引用 Claude Code 工具时：

- `TodoWrite` -> `todowrite`
- `Task` with subagents -> `@mention` 语法
- `Skill` tool -> OpenCode 原生 `skill` 工具
- File operations -> 当前环境的原生文件工具

## 获取帮助

- 提交问题：https://github.com/obra/superpowers/issues
- 完整文档：https://github.com/obra/superpowers/blob/main/docs/README.opencode.md