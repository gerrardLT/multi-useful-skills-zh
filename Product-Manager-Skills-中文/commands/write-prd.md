---
name: write-prd
description: 通过串联问题框架、需求定义和故事脚手架，创建一份可直接用于决策的PRD。
argument-hint: "<feature, initiative, or product change>"
uses:
  - prd-development
  - problem-statement
  - proto-persona
  - user-story
  - user-story-splitting
outputs:
  - 结构化PRD
  - 核心用户画像与需求
  - 初始可执行故事
---

# /write-prd

生成一份能顺畅从战略走到交付的 PRD。

## 调用方式

```text
/write-prd Team inbox redesign for faster triage in customer support
```

## 工作流

1.  使用 `problem-statement` 定义问题背景。
2.  使用 `proto-persona` 对齐用户假设。
3.  使用 `prd-development` 搭建完整文档。
4.  使用 `user-story` 起草初始故事。
5.  使用 `user-story-splitting` 拆分过大的条目。

## 检查点

- 在撰写需求前，先确认 scope 边界。
- success criteria 应可衡量，并与结果指标挂钩。
- 在风险部分至少明确指出一个 anti-pattern。

## 下一步

- 运行 `/plan-roadmap` 规划交付顺序。
- 如果 scope 超出当前容量，运行 `/prioritize` 进行优先级排序。