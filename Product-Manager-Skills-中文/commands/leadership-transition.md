---
name: leadership-transition
description: 指导产品经理向总监、副总裁/首席产品官转型的规划，包含角色适配诊断与入职引导。
argument-hint: "<当前角色、目标角色及转型场景>"
uses:
  - altitude-horizon-framework
  - director-readiness-advisor
  - vp-cpo-readiness-advisor
  - executive-onboarding-playbook
outputs:
  - 转型诊断
  - 角色准备度计划
  - 30-60-90天领导力行动方案
---

# /leadership-transition

用于准备或正在经历产品领导力跃迁时。

## 调用方式

```text
/leadership-transition Senior PM moving into first Director role at a scaling SaaS
```

## 工作流

1. 使用 `altitude-horizon-framework` 建立领导力模型基准。
2. 使用 `director-readiness-advisor` 诊断当前准备度。
3. 若涉及高管跃迁，再使用 `vp-cpo-readiness-advisor`。
4. 使用 `executive-onboarding-playbook` 制定执行计划。

## 检查点

- 识别转型摩擦实际发生的层级（范围、视野、系统、叙事）
- 与相关方对齐决策权与期望
- 为前30-60-90天定义基于证据的里程碑

## 下一步

- 每季度重新运行一次以进行校准
- 若需同步重置产品方向，可结合 `/strategy` 使用