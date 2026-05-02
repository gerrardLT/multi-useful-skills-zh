---
name: prioritize
description: 用符合你当前情境的方式，为 initiative 做优先级判断。
argument-hint: "<候选举措、约束条件与决策背景>"
uses:
  - prioritization-advisor
  - feature-investment-advisor
  - acquisition-channel-advisor
  - finance-based-pricing-advisor
  - recommendation-canvas
outputs:
  - 排序后的选项
  - 决策依据
  - 明确的权衡与后续行动
---

# /prioritize

用符合你当前情境的方式，为 initiative 做优先级判断。

## 调用方式

```text
/prioritize Q2 backlog for activation, retention, and pricing experiments
```

## 工作流

1. 用 `prioritization-advisor` 选择合适框架。
2. 用 `feature-investment-advisor` 评估功能层面的回报。
3. 用 `acquisition-channel-advisor` 纳入渠道质量因素。
4. 用 `finance-based-pricing-advisor` 评估定价影响。
5. 用 `recommendation-canvas` 固化最终建议。

## 检查点

- 把可逆决策和不可逆决策分开
- 找出哪些假设可能颠覆排序结果
- 为每个排序结论明确 confidence level

## 下一步

- 对高风险优先项运行 `/discover`
- 对已批准 initiative 运行 `/plan-roadmap`