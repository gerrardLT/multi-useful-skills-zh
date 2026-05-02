# Facilitation Scope 维护说明

## 为何需要此文件

Facilitation 行为是共享的。如果它在某个 guided skill 里损坏，通常所有继承同一协议的地方都会一起失效。

使用此文件可以快速识别受影响的 skills，并在整个仓库中一致地应用修复。

## 规范事实源

- `skills/workshop-facilitation/SKILL.md`

需要保留的核心规则：
- 常规的 context / scoring 问题应提供带编号的快速选项（适当时需包含 `Other (specify)`）
- 带编号的 recommendations 仅用于 decision points

## 如何找到受影响的 skills

运行：

```bash
rg -l "workshop-facilitation/SKILL.md" skills/*/SKILL.md | sort
```

这是权威的范围查询。不要仅依赖静态清单。

## 当前范围快照（2026-02-11）

当前引用 facilitation source 的文件有：

- `skills/acquisition-channel-advisor/SKILL.md`
- `skills/ai-shaped-readiness-advisor/SKILL.md`
- `skills/business-health-diagnostic/SKILL.md`
- `skills/context-engineering-advisor/SKILL.md`
- `skills/customer-journey-mapping-workshop/SKILL.md`
- `skills/discovery-interview-prep/SKILL.md`
- `skills/discovery-process/SKILL.md`
- `skills/epic-breakdown-advisor/SKILL.md`
- `skills/feature-investment-advisor/SKILL.md`
- `skills/finance-based-pricing-advisor/SKILL.md`
- `skills/lean-ux-canvas/SKILL.md`
- `skills/opportunity-solution-tree/SKILL.md`
- `skills/pol-probe-advisor/SKILL.md`
- `skills/positioning-workshop/SKILL.md`
- `skills/prd-development/SKILL.md`
- `skills/prioritization-advisor/SKILL.md`
- `skills/problem-framing-canvas/SKILL.md`
- `skills/product-strategy-session/SKILL.md`
- `skills/roadmap-planning/SKILL.md`
- `skills/skill-authoring-workflow/SKILL.md`
- `skills/tam-sam-som-calculator/SKILL.md`
- `skills/user-story-mapping-workshop/SKILL.md`

## 更新检查清单

1.  首先编辑 `skills/workshop-facilitation/SKILL.md`
2.  运行范围查询，并在本地措辞可能已发生漂移时修补受影响的 skills
3.  检查是否存在相互矛盾的语言：

```bash
rg -n "numbered recommendations each turn|numbered recommendations at decision points" skills/*/SKILL.md
```

4.  对改动过的 skills 运行一致性检查：

```bash
python3 scripts/check-skill-metadata.py <changed-skill-paths...>
```