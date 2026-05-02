---
name: discover
description: 运行完整的发现流程闭环，涵盖从问题界定到机会映射及验证规划的全过程。
argument-hint: "<问题、机会或功能领域>"
uses:
  - discovery-process
  - problem-framing-canvas
  - discovery-interview-prep
  - opportunity-solution-tree
  - pol-probe-advisor
outputs:
  - 发现计划
  - 优先级排序的假设
  - 验证实验待办列表
---

# /discover

运行完整的发现流程闭环，无需手动串联多个技能。

## 调用方式

```text
/discover Reduce onboarding drop-off for new SMB users
```

## 工作流

1. 使用 `problem-framing-canvas` 界定问题。
2. 使用 `discovery-interview-prep` 规划访谈与证据收集。
3. 使用 `opportunity-solution-tree` 绘制机会与解决方案地图。
4. 使用 `pol-probe-advisor` 选择验证探针。
5. 最后使用 `discovery-process` 汇总为可执行计划。

## 检查点

- 进入方案设计前，先确认目标用户与业务成果
- 优先对风险最高的 2-3 个假设进行排序
- 投入开发前，优先选择最快的验证实验

## 下一步

- 对最有希望且已验证的方案运行 `/write-prd`
- 当多个方案均通过验证时，运行 `/prioritize`