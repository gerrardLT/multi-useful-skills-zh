---
name: executing-plans
description: 当你已经有一份书面实现计划，并准备在独立会话里按评审检查点执行它时使用
---

# 执行计划

## 概览

加载计划，进行批判性审查，执行全部任务，并在完成后汇报。

**开始时先说明：** "I'm using the executing-plans skill to implement this plan."

**注意：** 告诉你的人类搭档，Superpowers 在能够使用 subagents 的平台上效果会明显更好。如果当前平台支持 subagents，应优先使用 `superpowers:subagent-driven-development`，而不是这个 skill。

## 流程

### 第 1 步：加载并审查计划
1. 读取计划文件
2. 做批判性审查，识别其中的问题、疑点或风险
3. 如果有疑虑：在开始前先和人类搭档沟通
4. 如果没有疑虑：创建 `TodoWrite`，然后继续

### 第 2 步：执行任务

对每一个任务：
1. 标记为 `in_progress`
2. 严格按每一步执行（计划已经拆成了细粒度步骤）
3. 按要求运行验证
4. 标记为 `completed`

### 第 3 步：完成开发

当所有任务都已完成并验证通过后：
- 先说明："I'm using the finishing-a-development-branch skill to complete this work."
- **必需的子 skill：** 使用 `superpowers:finishing-a-development-branch`
- 按该 skill 的要求完成验证、展示选项并执行最终选择

## 什么时候要停下来并求助

**出现以下情况时，立刻停止执行：**
- 遇到阻塞（缺少依赖、测试失败、指令不清）
- 计划存在严重缺口，导致无法开始
- 你看不懂某条指令
- 验证反复失败

**不要猜，应该请求澄清。**

## 什么时候要回到前面的步骤

**以下情况要返回审查阶段（第 1 步）：**
- 搭档根据你的反馈修改了计划
- 基本实现路径需要重新思考

**不要硬顶着 blocker 往前冲**，停下来提问。

## 记住

- 先批判性审查计划
- 严格按计划执行
- 不要跳过验证
- 当计划要求引用其他 skills 时，要照做
- 被阻塞时就停，不要猜
- 未经用户明确同意，不要在 `main/master` 分支上直接开始实现

## 集成关系

**必需的工作流 skills：**
- **`superpowers:using-git-worktrees`** - 必需：开始前先建立隔离工作区
- **`superpowers:writing-plans`** - 生成本 skill 要执行的计划
- **`superpowers:finishing-a-development-branch`** - 所有任务完成后，用于收尾开发工作
