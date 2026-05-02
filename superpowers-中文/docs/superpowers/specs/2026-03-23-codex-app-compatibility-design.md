# Codex App 兼容性：适配 Worktree 与收尾 Skill

让 superpowers skills 能在 Codex App 的沙箱 worktree 环境中正常工作，同时不破坏现有 Claude Code 或 Codex CLI 的行为。

**工单：** PRI-823

## 动机

Codex App 会在它自己管理的 git worktree 中运行代理，通常是 detached HEAD，目录位于 `$CODEX_HOME/worktrees/` 下，并带有 Seatbelt 沙箱，阻止 `git checkout -b`、`git push` 和网络访问。当前有 3 个 superpowers skill 默认假定 git 权限不受限：

- `using-git-worktrees`
- `finishing-a-development-branch`
- `subagent-driven-development`

而 Codex CLI 并没有这个冲突，因为它没有内建的 worktree 管理能力。问题专属于 Codex App。

## 实测结论

在 Codex App 中于 2026-03-23 测试：

| 操作 | workspace-write 沙箱 | full access 沙箱 |
|---|---|---|
| `git add` | 可用 | 可用 |
| `git commit` | 可用 | 可用 |
| `git checkout -b` | **被阻止** | 可用 |
| `git push` | **被阻止** | 可用 |
| `gh pr create` | **被阻止** | 可用 |
| `git status/diff/log` | 可用 | 可用 |

额外发现：
- `spawn_agent` 子代理与父线程共享文件系统
- App 顶部总会有 “Create branch” 按钮
- App 自带的收尾流程是：Create branch → Commit modal → Commit and push / Commit and create PR
- macOS 上 `network_access = true` 当前是失效的

## 设计：只读环境探测

使用 3 条只读 git 命令：

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

基于这三个值推导两个信号：

- **IN_LINKED_WORKTREE：** `GIT_DIR != GIT_COMMON`
- **ON_DETACHED_HEAD：** `BRANCH` 为空

### 决策矩阵

| Linked Worktree? | Detached HEAD? | 环境 | 动作 |
|---|---|---|---|
| 否 | 否 | Claude Code / Codex CLI / 正常 git | 保持原有完整 skill 行为 |
| 是 | 是 | Codex App worktree（workspace-write） | 跳过 worktree 创建；收尾时输出交接信息 |
| 是 | 否 | Codex App（Full access）或人工 worktree | 跳过 worktree 创建；保留完整收尾流程 |
| 否 | 是 | 不常见（手工 detached HEAD） | 正常创建 worktree；收尾时警告 |

## 变更

### 1. `using-git-worktrees/SKILL.md`

增加 **Step 0**：

- 在真正创建 worktree 之前先执行环境检测
- 若 `GIT_DIR != GIT_COMMON`，说明已经在隔离 workspace 中
- 这时不要再创建新的 worktree，而是：
  1. 执行 project setup
  2. 验证 baseline tests
  3. 按 branch / detached HEAD 两种情况汇报
- 然后直接停止

另外加入 **sandbox fallback**：
- 若 `GIT_DIR == GIT_COMMON`，但在 `git worktree add -b` 时出现权限错误，则退化为 Step 0 的行为

### 2. `finishing-a-development-branch/SKILL.md`

增加 **Step 1.5: Detect Environment**：

- **Path A：** 外部管理的 worktree + detached HEAD  
  不展示原来的 4 选项菜单，改为：
  - 确保所有工作已 `git add` + `git commit`
  - 展示当前 commit SHA
  - 明确说明当前无法在此环境里创建 branch / push / 开 PR
  - 告知用户若不创建 branch，detached HEAD 上的提交可能会丢
  - 提供建议 branch name 和 commit message

- **Path B：** 外部管理的 worktree + 命名分支  
  仍然正常展示 4 选项菜单

- **Path C：** 正常环境  
  保持原行为

同时在 **Step 5 cleanup** 前重新检测环境：
- 若 `GIT_DIR != GIT_COMMON`，跳过 `git worktree remove`

### 3. `subagent-driven-development/SKILL.md` 与 `executing-plans/SKILL.md`

两处 Integration 描述都改成：

```text
- superpowers:using-git-worktrees - REQUIRED: Ensures isolated workspace (creates one or verifies existing)
```

### 4. `codex-tools.md`

在末尾新增两节：

**Environment Detection**
- 说明如何用只读 git 命令判断当前是否已经在 linked worktree 里
- 说明 `BRANCH` 为空意味着 detached HEAD

**Codex App Finishing**
- 说明当 sandbox 阻止 branch/push 时，代理应该提交完工作，然后让用户使用 App 的原生控制：
  - `Create branch`
  - `Hand off to local`

## 不会改变的内容

- 子代理 prompt 模板不改
- `executing-plans` 运行逻辑不改，只改一行描述
- `dispatching-parallel-agents` 不改
- `.codex/INSTALL.md` 不改
- 4 选项 finishing 菜单在 Claude Code / Codex CLI 中仍保留
- 完整 worktree 创建流程在普通环境中仍保留

## 范围总结

| 文件 | 变更 |
|---|---|
| `skills/using-git-worktrees/SKILL.md` | 新增约 12 行 |
| `skills/finishing-a-development-branch/SKILL.md` | 新增约 20 行 |
| `skills/subagent-driven-development/SKILL.md` | 改 1 行 |
| `skills/executing-plans/SKILL.md` | 改 1 行 |
| `skills/using-superpowers/references/codex-tools.md` | 新增约 15 行 |

## 未来考虑

如果未来第三个 skill 也需要相同检测逻辑，可以再抽成共享参考文档，例如 `references/environment-detection.md`。当前还没必要。

## 测试计划

### 自动化测试

1. 正常 repo 检测：确认 `IN_LINKED_WORKTREE=false`
2. linked worktree 检测：创建测试 worktree，确认 `IN_LINKED_WORKTREE=true`
3. detached HEAD 检测：`git checkout --detach` 后确认 `ON_DETACHED_HEAD=true`
4. finishing skill 交接输出：在受限环境下确认展示 handoff，而不是 4 选项菜单
5. cleanup guard：确认在 linked worktree 中不会调用 `git worktree remove`

### 手工 Codex App 测试

1. 在 worktree thread 中检测（workspace-write）
2. 在 worktree thread 中检测（full access）
3. 验证 finishing skill 的 handoff 格式
4. 走完整生命周期
5. 在 Local thread 中验证 sandbox fallback

### 回归

- 现有 Claude Code 的 skill-triggering 测试应继续通过
- 现有 subagent-driven-development 集成测试应继续通过
- 普通 Claude Code 会话中的完整 worktree 创建与 4 选项收尾流程应继续可用