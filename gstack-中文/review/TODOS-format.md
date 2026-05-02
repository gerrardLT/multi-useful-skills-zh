# TODOS.md 格式参考

规范 TODOS.md 格式的共享参考文档。由 `/ship`（步骤 5.5）和 `/plan-ceo-review`（TODOS.md 更新部分）引用，以确保 TODO 项结构一致。

---

## 文件结构

```markdown
# TODOS

## <技能/组件>     ← 例如，## Browse, ## Ship, ## Review, ## Infrastructure
<项目按优先级排序，P0 在前，然后是 P1, P2, P3, P4>

## 已完成
<已完成的项目，附带完成注释>
```

**部分：** 按技能或组件组织（`## Browse`、`## Ship`、`## Review`、`## QA`、`## Retro`、`## Infrastructure`）。在每个部分中，按优先级对项目进行排序（P0 在顶部）。

---

## TODO 项目格式

每个项目在其部分下都是一个 H3：

```markdown
### <标题>

**What:** 工作内容的单行描述。

**Why:** 它解决的具体问题或解锁的价值。

**Context:** 足够详细的背景信息，以便三个月后接手的人能理解动机、当前状态以及从何处开始。

**Effort:** S / M / L / XL
**Priority:** P0 / P1 / P2 / P3 / P4
**Depends on:** <前置条件，或 "None">
```

**必填字段：** What、Why、Context、Effort、Priority
**可选字段：** Depends on、Blockers

---

## 优先级定义

- **P0** — 阻塞：必须在下一次发布之前完成
- **P1** — 关键：应在本周期内完成
- **P2** — 重要：当 P0/P1 清除后执行
- **P3** — 锦上添花：在采用后根据使用数据重新评估
- **P4** — 未来某天：好主意，但不紧迫

---

## 已完成的项目格式

项目完成后，将其移动到 `## 已完成` 部分，保留其原始内容并附加：

```markdown
**Completed:** vX.Y.Z (YYYY-MM-DD)
```