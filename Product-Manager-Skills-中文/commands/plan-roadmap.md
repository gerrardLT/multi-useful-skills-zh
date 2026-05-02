---
name: plan-roadmap
description: 将战略与已验证的机会转化为一份包含明确权衡的、有序的路线图。
argument-hint: "<时间范围、目标与候选举措>"
uses:
  - roadmap-planning
  - epic-hypothesis
  - prioritization-advisor
  - user-story-mapping
  - epic-breakdown-advisor
outputs:
  - 优先级排序后的路线图
  - 史诗假设
  - 发布切片与排序依据
---

# /plan-roadmap

生成一份同时反映战略、风险与交付现实的路线图。

## 调用方式

```text
/plan-roadmap Q3-Q4 plan for enterprise reporting and permissions
```

## 工作流

1.  使用 `roadmap-planning` 建立路线图背景。
2.  将举措转化为 `epic-hypothesis`。
3.  使用 `prioritization-advisor` 选择合适的排序框架。
4.  使用 `user-story-mapping` 切分出交付切片。
5.  使用 `epic-breakdown-advisor` 拆分过大的史诗。

## 检查点

-   确保每个路线图条目都关联明确的成果
-   明确说明为何某些条目当前未被优先排序
-   记录依赖关系与排序风险

## 下一步

-   对最高优先级的路线图切片运行 `/write-prd`
-   对高不确定性的举措运行 `/discover`