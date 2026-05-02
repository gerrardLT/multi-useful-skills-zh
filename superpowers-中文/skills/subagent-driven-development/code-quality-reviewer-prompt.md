# Code Quality Reviewer Prompt 模板

在派发代码质量 reviewer subagent 时使用这份模板。

**目的：** 验证实现是否构建得足够稳固（干净、可测试、可维护）

**只有在 spec 一致性评审通过后，才允许派发这位 reviewer。**

```text
Task tool (superpowers:code-reviewer):
  Use template at requesting-code-review/code-reviewer.md

  WHAT_WAS_IMPLEMENTED: [from implementer's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
  DESCRIPTION: [task summary]
```

**除了标准代码质量问题外，reviewer 还应额外检查：**
- 每个文件是否都只有一个清晰职责，并且接口边界明确？
- 单元是否被拆分到能够被独立理解和独立测试？
- 实现是否遵循了计划中定义的文件结构？
- 这次实现是否创建了已经偏大的新文件，或显著膨胀了现有文件？（不要抱怨历史遗留文件太大，只关注这次改动新带来的问题）

**Code reviewer 返回内容应包括：** Strengths、Issues（Critical / Important / Minor）、Assessment