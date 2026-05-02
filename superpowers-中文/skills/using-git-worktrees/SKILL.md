---
name: using-git-worktrees
description: 当开始一项需要与当前工作区隔离的功能开发，或在执行实现计划之前使用；它会通过智能目录选择和安全校验创建隔离的 git worktree
---

# 使用 Git Worktrees

## 概览

Git worktree 能在共享同一仓库的前提下创建隔离工作区，让你可以在多个分支上同时工作，而无需频繁切换。

**核心原则：** 系统化目录选择 + 安全校验 = 可靠隔离。

**开始时先说明：** "我正在使用 using-git-worktrees 技能来设置一个隔离的工作区。"

## 目录选择流程

按以下优先级顺序执行：

### 1. 检查现有目录

```bash
# 按优先级顺序检查
ls -d .worktrees 2>/dev/null     # 首选（隐藏目录）
ls -d worktrees 2>/dev/null      # 备选
```

**如果找到了：** 就用这个目录。如果两个都存在，`.worktrees` 优先。

### 2. 检查 `CLAUDE.md`

```bash
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```

**如果其中指定了偏好：** 直接使用，不要再问用户。

### 3. 询问用户

如果不存在目录，并且 `CLAUDE.md` 里也没有偏好：

```text
未找到 worktree 目录。我应该在哪里创建 worktrees？

1. .worktrees/ （项目本地，隐藏目录）
2. ~/.config/superpowers/worktrees/<project-name>/ （全局位置）

您希望选择哪一种？
```

## 安全校验

### 对项目内目录（`.worktrees` 或 `worktrees`）

**在创建 worktree 前，必须验证该目录已被忽略：**

```bash
# 检查目录是否被忽略（遵循本地、全局和系统 gitignore）
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**如果没有被忽略：**

根据 Jesse 的规则 “立即修复损坏的东西”：
1. 向 `.gitignore` 添加合适的规则
2. 提交这次变更
3. 再继续创建 worktree

**为什么这很关键：** 这样才能避免把 worktree 内容意外提交进仓库。

### 对全局目录（`~/.config/superpowers/worktrees`）

不需要校验 `.gitignore`，因为它完全在项目外部。

## 创建步骤

### 1. 识别项目名

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
```

### 2. 创建 Worktree

```bash
# 确定完整路径
case $LOCATION in
  .worktrees|worktrees)
    path="$LOCATION/$BRANCH_NAME"
    ;;
  ~/.config/superpowers/worktrees/*)
    path="~/.config/superpowers/worktrees/$project/$BRANCH_NAME"
    ;;
esac

# 创建 worktree 并新建分支
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

### 3. 运行项目初始化

自动识别并运行合适的初始化命令：

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### 4. 验证干净基线

运行测试，确保新建的 worktree 以干净状态开始：

```bash
# 示例 - 使用项目对应的命令
npm test
cargo test
pytest
go test ./...
```

**如果测试失败：** 报告失败情况，并询问用户是继续还是先调查。

**如果测试通过：** 报告工作区已就绪。

### 5. 报告位置

```text
Worktree 已就绪，位于 <full-path>
测试通过 (<N> 个测试，0 个失败)
准备好实现 <feature-name>
```

## 快速参考

| 情况 | 操作 |
|-----------|--------|
| `.worktrees/` 存在 | 使用它（并验证已被忽略） |
| `worktrees/` 存在 | 使用它（并验证已被忽略） |
| 两者都存在 | 使用 `.worktrees/` |
| 两者都不存在 | 先看 `CLAUDE.md` -> 再问用户 |
| 目录未被忽略 | 加入 `.gitignore` 并提交 |
| 基线测试失败 | 报告失败并询问 |
| 没有 `package.json` / `Cargo.toml` | 跳过依赖安装 |

## 常见错误

### 跳过忽略校验

- **问题：** worktree 内容会被跟踪，污染 git status
- **修复：** 在创建项目内 worktree 前，始终先执行 `git check-ignore`

### 想当然地决定目录位置

- **问题：** 造成不一致，违背项目约定
- **修复：** 严格遵循优先级：现有目录 > `CLAUDE.md` > 询问用户

### 在测试失败时继续

- **问题：** 你无法区分新 bug 和已有问题
- **修复：** 报告失败，并获得明确许可后再继续

### 硬编码初始化命令

- **问题：** 在使用不同工具链的项目中会失效
- **修复：** 根据项目文件自动识别（`package.json` 等）

## 示例工作流

```text
你：我正在使用 using-git-worktrees 技能来设置一个隔离的工作区。

[检查 .worktrees/ - 存在]
[验证忽略状态 - git check-ignore 确认 .worktrees/ 已被忽略]
[创建 worktree: git worktree add .worktrees/auth -b feature/auth]
[运行 npm install]
[运行 npm test - 47 个测试通过]

Worktree 已就绪，位于 /Users/jesse/myproject/.worktrees/auth
测试通过 (47 个测试，0 个失败)
准备好实现认证功能
```

## 红旗信号

**绝不要：**
- 在未确认目录已被忽略时创建项目内 worktree
- 跳过基线测试验证
- 在测试失败时不问就继续
- 在目录位置有歧义时自行假定
- 跳过 `CLAUDE.md` 检查

**始终要做：**
- 按目录优先级执行：现有目录 > `CLAUDE.md` > 询问用户
- 对项目内目录验证其已被忽略
- 自动检测并运行项目初始化
- 验证测试基线干净

## 集成关系

**会被以下 skills 调用：**
- **`brainstorming`**（第 4 阶段）- 当设计获批并准备进入实现时，必须使用
- **`subagent-driven-development`** - 执行任何任务前必须使用
- **`executing-plans`** - 执行任何任务前必须使用
- 任何需要隔离工作区的 skill

**经常配套使用：**
- **`finishing-a-development-branch`** - 工作完成后用于清理和收尾，属于必需配套项