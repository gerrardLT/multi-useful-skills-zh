---
name: finishing-a-development-branch
description: 当实现已经完成、所有测试都通过，并且你需要决定如何集成这份工作时使用；它会通过展示结构化选项，指导合并、PR 或清理流程
---

# 收尾一个开发分支

## 概览

这个技能用于在开发工作完成后，将收尾动作变得清晰、可控、可选择。

**核心原则：** 先验证测试 -> 再展示选项 -> 再执行选择 -> 最后清理。  
**开始时先说明：** `I'm using the finishing-a-development-branch skill to complete this work.`

## 流程

### 第 1 步：验证测试

**在展示选项之前，先确认测试全部通过。**

```bash
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：**

```text
测试失败（<N> 个失败）。完成前必须修复：

[显示失败详情]

在测试通过之前，无法继续合并/创建 PR。
```

立刻停止，不进入下一步。

### 第 2 步：确认基线分支

```bash
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

如果不确定，也可以直接确认一句：

```text
此分支是从 main 分出来的 - 对吗？
```

### 第 3 步：展示选项

必须原样展示这 4 个选项：

```text
实现已完成。你想怎么做？

1. 本地合并回 <base-branch>
2. 推送并创建 Pull Request
3. 保持分支现状（我稍后处理）
4. 丢弃此工作

选择哪个选项？
```

**不要额外解释。** 选项要保持简洁。

### 第 4 步：执行用户选择

#### 选项 1：本地合并

```bash
git checkout <base-branch>
git pull
git merge <feature-branch>
<test command>
git branch -d <feature-branch>
```

然后进入第 5 步清理 worktree。

#### 选项 2：推送并创建 PR

```bash
git push -u origin <feature-branch>

gh pr create --title "<title>" --body "$(cat <<'EOF'
## 概要
<2-3 条关于变更内容的要点>

## 测试计划
- [ ] <验证步骤>
EOF
)"
```

然后进入第 5 步清理 worktree。

#### 选项 3：保持现状

回报：

```text
保留分支 <name>。Worktree 保留在 <path>。
```

**不要清理 worktree。**

#### 选项 4：丢弃此工作

**必须先要求明确确认：**

```text
这将永久删除：
- 分支 <name>
- 所有提交：<commit-list>
- 位于 <path> 的 Worktree

输入 'discard' 以确认。
```

只有当用户输入完全匹配的 `discard`，才能继续。

确认后执行：

```bash
git checkout <base-branch>
git branch -D <feature-branch>
```

然后进入第 5 步清理 worktree。

### 第 5 步：清理 Worktree

**适用于选项 1、2、4。**

先判断当前是否在 worktree 中：

```bash
git worktree list | grep $(git branch --show-current)
```

如果是：

```bash
git worktree remove <worktree-path>
```

**对于选项 3：** 保留 worktree。

## 快速参考

| 选项 | 合并 | 推送 | 保留 Worktree | 清理分支 |
|--------|-------|------|---------------|----------------|
| 1. 本地合并 | 是 | - | - | 是 |
| 2. 创建 PR | - | 是 | 是 | - |
| 3. 保持现状 | - | - | 是 | - |
| 4. 丢弃 | - | - | - | 是（强制） |

## 常见错误

**跳过测试验证**

- 问题：会把有问题的代码合进主干，或提一个会失败的 PR
- 修复：在展示选项前，永远先跑测试

**提出开放式问题**

- 问题：“接下来怎么做？” 太模糊
- 修复：严格给出这 4 个结构化选项

**自动清理 worktree**

- 问题：用户可能还需要它，尤其是选项 2、3
- 修复：只在选项 1、2、4 的合适阶段处理

**丢弃前不确认**

- 问题：可能误删工作成果
- 修复：必须要求输入 `discard`

## 红旗信号

**绝不要：**

- 在测试失败时继续
- 合并后不验证结果就结束
- 未确认就删除工作
- 未经明确请求就 force-push

**始终要做：**

- 在给出选项前验证测试
- 只展示这 4 个选项
- 对选项 4 获取明确输入确认
- 仅在合适分支路径下清理 worktree

## 集成关系

**会被以下技能调用：**

- `subagent-driven-development`：所有任务完成后
- `executing-plans`：所有批次完成后

**经常配套使用：**

- `using-git-worktrees`：清理由其创建的 worktree