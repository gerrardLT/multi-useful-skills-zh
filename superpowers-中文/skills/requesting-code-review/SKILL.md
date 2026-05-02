---
name: requesting-code-review
description: 在任务完成后、实现重大功能后，或准备合并前使用，用来验证工作是否满足要求
---

# 请求代码评审

派遣 `superpowers:code-reviewer` 子代理，在问题扩散前及时发现它们。评审者将获得你精心构建的评审上下文，而不是你整段的会话历史。这能让评审者专注于工作产物本身，而非你的思考过程，同时也能保留你自己的上下文以继续推进工作。

**核心原则：** 早评审，常评审。

## 何时请求评审

**强制场景：**
- 在 `subagent-driven development` 中每完成一个任务后
- 完成重大功能后
- 合并到 `main` 前

**可选但很有价值：**
- 卡住时（获得新的视角）
- 重构前（先做基线检查）
- 修复复杂 bug 后

## 如何请求评审

**1. 获取 git SHA：**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. 派遣 `code-reviewer` 子代理：**

使用 `Task` 工具，类型选 `superpowers:code-reviewer`，并填充 `code-reviewer.md` 中的模板。

**占位符：**
- `{WHAT_WAS_IMPLEMENTED}` - 你刚刚实现了什么
- `{PLAN_OR_REQUIREMENTS}` - 它应该完成什么
- `{BASE_SHA}` - 起始提交
- `{HEAD_SHA}` - 结束提交
- `{DESCRIPTION}` - 简短概述

**3. 根据反馈采取行动：**
- 立刻修复 Critical 问题
- 在继续之前修复 Important 问题
- Minor 问题可以记下来稍后处理
- 如果评审者有误，要基于技术理由反驳

## 示例

```text
[刚完成任务 2：添加验证函数]

You: 让我在继续前请求代码评审。

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[派遣 superpowers:code-reviewer 子代理]
  WHAT_WAS_IMPLEMENTED: 对话索引的验证与修复函数
  PLAN_OR_REQUIREMENTS: 来自 docs/superpowers/plans/deployment-plan.md 的任务 2
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: 添加了 verifyIndex() 和 repairIndex()，包含 4 种问题类型

[子代理返回]:
  优点：架构清晰，测试真实
  问题：
    Important: 缺少进度指示器
    Minor: 报告间隔使用了魔法数字 (100)
  评估：可以继续

You: [修复进度指示器]
[继续任务 3]
```

## 与工作流的集成

**子代理驱动开发：**
- 每个任务后都做评审
- 在问题累积前及时发现它们
- 修完再进入下一个任务

**执行计划：**
- 每一批任务（例如 3 个）后做评审
- 获取反馈，应用修改，然后继续

**临时开发：**
- 合并前做评审
- 卡住时做评审

## 红旗信号

**切勿：**
- 因为“这很简单”就跳过评审
- 忽略 Critical 问题
- 在 Important 问题未修复时继续推进
- 对有效的技术反馈强辩

**如果评审者有误：**
- 用技术理由反驳
- 展示能证明行为正确的代码或测试
- 请求进一步澄清

模板位置：`requesting-code-review/code-reviewer.md`