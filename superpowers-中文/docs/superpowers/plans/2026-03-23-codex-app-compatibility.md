# Codex App 兼容性实施计划
> **面向代理 worker：** 必需技能：使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务逐步实施本计划。步骤使用复选框（`- [ ]`）语法跟踪。

**目标：** 让 `using-git-worktrees`、`finishing-a-development-branch` 及相关技能能在 Codex App 的沙箱 worktree 环境中工作，同时不破坏现有行为。

**架构：** 在两个技能的开头加入只读环境检测（`git-dir` vs `git-common-dir`）。若已位于 linked worktree，则跳过创建；若处于 detached HEAD，则输出 handoff 信息而不是 4 选项菜单；worktree 创建时若遇到权限错误则触发 sandbox fallback。

**技术栈：** Git、Markdown（这些技能文件是说明文档，不是可执行代码）

**规格：** `docs/superpowers/specs/2026-03-23-codex-app-compatibility-design.md`

---

## 文件结构

| 文件 | 职责 | 动作 |
|---|---|---|
| `skills/using-git-worktrees/SKILL.md` | worktree 创建与隔离 | 加入 Step 0 检测 + sandbox fallback |
| `skills/finishing-a-development-branch/SKILL.md` | 分支收尾流程 | 加入 Step 1.5 检测 + cleanup guard |
| `skills/subagent-driven-development/SKILL.md` | 使用子代理执行计划 | 更新 Integration 描述 |
| `skills/executing-plans/SKILL.md` | 内联执行计划 | 更新 Integration 描述 |
| `skills/using-superpowers/references/codex-tools.md` | Codex 平台参考 | 增加环境检测与收尾说明 |

---

### 任务 1：给 `using-git-worktrees` 加入 Step 0

**文件：**
- 修改：`skills/using-git-worktrees/SKILL.md`

- [ ] **步骤 1：通读当前 skill 文件**
- [ ] **步骤 2：在 Overview 和 “Directory Selection Process” 之间插入 Step 0**

Step 0 的核心内容：

```markdown
## Step 0: Check if Already in an Isolated Workspace

Before creating a worktree, check if one already exists:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```
```

行为规则：
- 若 `GIT_DIR != GIT_COMMON`：
  - 不要再创建 worktree
  - 改为执行 project setup + baseline tests
  - 然后按 branch / detached HEAD 状态汇报
  - 直接停止
- 若 `GIT_DIR == GIT_COMMON`：
  - 正常走原 worktree 创建流程
- 若创建过程中因为权限错误失败：
  - 退回到上面的“已在隔离 workspace 中”逻辑

- [ ] **步骤 3：验证插入位置和 markdown 结构**
- [ ] **步骤 4：提交**

```bash
git add skills/using-git-worktrees/SKILL.md
git commit -m "feat(using-git-worktrees): add Step 0 environment detection (PRI-823)"
```

---

### 任务 2：更新 `using-git-worktrees` 的 Integration 细节

**文件：**
- 修改：`skills/using-git-worktrees/SKILL.md`

- [ ] **步骤 1：把 3 条 “Called by” 描述改为：**

```markdown
- **brainstorming** - REQUIRED: Ensures isolated workspace (creates one or verifies existing)
- **subagent-driven-development** - REQUIRED: Ensures isolated workspace (creates one or verifies existing)
- **executing-plans** - REQUIRED: Ensures isolated workspace (creates one or verifies existing)
```

- [ ] **步骤 2：验证 Integration 细节**
- [ ] **步骤 3：提交**

```bash
git add skills/using-git-worktrees/SKILL.md
git commit -m "docs(using-git-worktrees): update Integration descriptions (PRI-823)"
```

---

### 任务 3：给 `finishing-a-development-branch` 加入 Step 1.5

**文件：**
- 修改：`skills/finishing-a-development-branch/SKILL.md`

- [ ] **步骤 1：通读当前 skill 文件**
- [ ] **步骤 2：在 Step 1 和 Step 2 之间插入 Step 1.5**

Step 1.5 要做环境检测：

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

分成三条路径：
- **路径 A：** 外部管理 worktree + detached HEAD
  - 执行 `git add` + `git commit`
  - 不展示 4 选项菜单
  - 输出 handoff 提示，包含：
    - 当前 commit SHA
    - detached HEAD 风险说明
    - 建议 branch name
    - 建议 commit message
  - 跳到 Step 5

- **路径 B：** 外部管理 worktree + 命名 branch
  - 正常进入 Step 2，保留 4 选项菜单

- **路径 C：** 普通环境
  - 正常进入 Step 2

- [ ] **步骤 3：验证插入结果**
- [ ] **步骤 4：提交**

```bash
git add skills/finishing-a-development-branch/SKILL.md
git commit -m "feat(finishing-a-development-branch): add Step 1.5 environment detection (PRI-823)"
```

---

### 任务 4：给 `finishing-a-development-branch` 增加 Step 5 cleanup guard

**文件：**
- 修改：`skills/finishing-a-development-branch/SKILL.md`

- [ ] **步骤 1：找到当前 Step 5**
- [ ] **步骤 2：把 Step 5 改为先重新检测环境**

新逻辑：
```markdown
### 步骤 5: Cleanup Worktree

First, check if worktree is externally managed:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

If `GIT_DIR` differs from `GIT_COMMON`: skip worktree removal.
```

普通环境下，再继续原先的 `git worktree remove` 流程。
- [ ] **步骤 3：验证 Step 5**
- [ ] **步骤 4：提交**

```bash
git add skills/finishing-a-development-branch/SKILL.md
git commit -m "feat(finishing-a-development-branch): add Step 5 cleanup guard (PRI-823)"
```

---

### 任务 5：更新 `subagent-driven-development` 和 `executing-plans` 中的 Integration 行
**文件：**
- 修改：`skills/subagent-driven-development/SKILL.md`
- 修改：`skills/executing-plans/SKILL.md`

- [ ] **步骤 1：统一替换为：**

```text
- **superpowers:using-git-worktrees** - REQUIRED: Ensures isolated workspace (creates one or verifies existing)
```

- [ ] **步骤 2：验证两处都已更新**
- [ ] **步骤 3：提交**

```bash
git add skills/subagent-driven-development/SKILL.md skills/executing-plans/SKILL.md
git commit -m "docs(sdd, executing-plans): update worktree Integration descriptions (PRI-823)"
```

---

### 任务 6：在 `codex-tools.md` 中加入环境检测文档
**文件：**
- 修改：`skills/using-superpowers/references/codex-tools.md`

- [ ] **步骤 1：通读当前文件**
- [ ] **步骤 2：在末尾追加两节**

新增：
```markdown
## Environment Detection
```

以及：
```markdown
## Codex App Finishing
```

内容应说明：
- 如何用 `GIT_DIR` / `GIT_COMMON` / `BRANCH` 做只读检测
- `GIT_DIR != GIT_COMMON` 表示已经在 linked worktree 中
- `BRANCH` 为空表示 detached HEAD
- Codex App 中遇到 sandbox 限制时，代理应提交工作，然后让用户使用：
  - `Create branch`
  - `Hand off to local`

- [ ] **步骤 3：验证新增内容**
- [ ] **步骤 4：提交**

```bash
git add skills/using-superpowers/references/codex-tools.md
git commit -m "docs(codex-tools): add environment detection and App finishing docs (PRI-823)"
```

---

### 任务 7：自动化测试环境检测
**文件：**
- 新建：`tests/codex-app-compat/test-environment-detection.sh`

- [ ] **步骤 1：创建测试目录**
- [ ] **步骤 2：编写检测脚本**
- [ ] **步骤 3：赋予可执行权限并运行**

运行：
```bash
chmod +x tests/codex-app-compat/test-environment-detection.sh
./tests/codex-app-compat/test-environment-detection.sh
```

预期：全部 passed，0 failed

- [ ] **步骤 4：提交**

```bash
git add tests/codex-app-compat/test-environment-detection.sh
git commit -m "test: add environment detection tests for Codex App compat (PRI-823)"
```

---

### 任务 8：最终验证
- [ ] **步骤 1：运行自动化检测测试**
- [ ] **步骤 2：逐个通读 5 个已修改文件**
- [ ] **步骤 3：确认没有意外变更**
- [ ] **步骤 4：运行现有回归测试（若环境允许）**

若某些测试环境不可用，也要明确记录只能在 Claude Code 中手动回归。