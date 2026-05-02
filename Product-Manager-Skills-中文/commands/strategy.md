---
name: strategy
description: 从定位出发，通过机会与路线图决策，构建产品战略。
argument-hint: "<product, market, and strategic question>"
uses:
  - product-strategy-session
  - positioning-workshop
  - problem-statement
  - opportunity-solution-tree
  - roadmap-planning
outputs:
  - Strategy narrative
  - Core strategic choices
  - Sequenced roadmap direction
---

# /strategy

运行一套端到端的产品战略工作流，产出可用于决策的结果。

## 调用方式

```text
/strategy B2B analytics add-on for mid-market ecommerce brands
```

## 工作流

1.  使用 `positioning-workshop` 先澄清客户与品类。
2.  使用 `problem-statement` 锁定核心问题。
3.  使用 `opportunity-solution-tree` 展开机会与方案。
4.  使用 `product-strategy-session` 串起完整战略分析。
5.  使用 `roadmap-planning` 形成有顺序的承诺。

## 检查点

-   将战略选择与执行待办事项分开
-   明确写出权衡取舍与非目标
-   为每个战略押注确认衡量指标与领先指标

## 下一步

-   对发布级排序运行 `/plan-roadmap`
-   对最高优先级的举措运行 `/write-prd`