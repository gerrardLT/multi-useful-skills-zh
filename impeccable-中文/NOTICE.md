# Notice

Impeccable  
Copyright 2025-2026 Paul Bakaus

## Anthropic frontend-design Skill

本项目中的 `impeccable` skill 基于 Anthropic 原有的 frontend-design skill 构建。

**原始作品：** https://github.com/anthropics/skills/tree/main/skills/frontend-design  
**原始许可证：** Apache License 2.0  
**版权：** 2025 Anthropic, PBC

本项目在原始版本基础上扩展了：
- 7 个领域专用 reference 文件（typography、color-and-contrast、spatial-design、motion-design、interaction-design、responsive-design、ux-writing）
- 23 个 commands
- 更丰富的模式与反模式

## Typecraft Guide Skill

本项目中的 `typography.md` reference 融合了一组实用补充内容，这些内容应作者请求，从 ehmo 的 `typecraft-guide-skill` 合并而来，包括：深色模式下的字重与字距补偿、`font-display: optional` 与 `swap` 的取舍、仅预加载关键字重的指导、针对 3 个及以上字重使用 variable fonts、`clamp()` 的最大最小比率约束、响应式 measure / container 耦合、`text-wrap: balance` / `pretty`、`font-optical-sizing: auto`、ALL-CAPS 字距量化，以及段落节奏规则（空行或缩进二选一，绝不同时使用）。

**原始作品：** https://github.com/ehmo/typecraft-guide-skill  
**原始许可证：** 见上游仓库  
**作者：** ehmo