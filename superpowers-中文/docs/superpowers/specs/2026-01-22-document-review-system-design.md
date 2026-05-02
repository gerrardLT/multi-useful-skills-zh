# 文档评审系统设计

## 概览

在 superpowers 工作流中增加两个新的评审阶段：

1. **Spec Document Review** - 在 brainstorming 之后、writing-plans 之前
2. **Plan Document Review** - 在 writing-plans 之后、implementation 之前

两者都遵循与实现阶段评审相同的迭代循环模式。

## Spec Document Reviewer

**目的：** 验证 spec 是否完整、一致，并已可进入 implementation planning。

**位置：** `skills/brainstorming/spec-document-reviewer-prompt.md`

**检查内容：**

| 类别 | 检查要点 |
|----------|------------------|
| 完整性 | TODO、占位符、`TBD`、未完成段落 |
| 覆盖度 | 缺失的错误处理、边界情况、集成点 |
| 一致性 | 内部矛盾、互相冲突的需求 |
| 清晰度 | 表述含糊的需求 |
| YAGNI | 未被请求的功能、过度设计 |

**输出格式：**
```
## Spec Review

**Status:** Approved | Issues Found

**Issues (if any):**
- [Section X]: [issue] - [why it matters]

**Recommendations (advisory):**
- [suggestions that don't block approval]
```

**评审循环：** 如果发现问题 -> brainstorming agent 修复 -> 再评审 -> 重复，直到通过。

**派发机制：** 使用 Task tool，设置 `subagent_type: general-purpose`。reviewer prompt template 提供完整 prompt，brainstorming skill 的 controller 负责派发 reviewer。

## Plan Document Reviewer

**目的：** 验证计划是否完整、是否符合 spec，以及任务拆分是否合理。

**位置：** `skills/writing-plans/plan-document-reviewer-prompt.md`

**检查内容：**

| 类别 | 检查要点 |
|----------|------------------|
| 完整性 | TODO、占位符、未完成任务 |
| Spec 对齐 | 计划覆盖了 spec 需求，且没有范围蔓延 |
| 任务分解 | 任务是否足够原子、边界是否清晰 |
| 任务语法 | 任务与步骤是否使用 checkbox 语法 |
| Chunk 大小 | 每个 chunk 是否低于 1000 行 |

**Chunk 定义：** chunk 是 plan 文档中一组逻辑相关任务的集合，通过 `## Chunk N: <name>` 标题分隔。writing-plans skill 会按照逻辑阶段创建这些边界，例如 `"Foundation"`、`"Core Features"`、`"Integration"`。每个 chunk 都应足够独立，以便单独评审。

**Spec 对齐校验：** reviewer 会同时收到：
1. 计划文档（或当前 chunk）
2. 用于参考的 spec 文档路径

reviewer 会读取这两者并对比需求覆盖情况。

**输出格式：** 与 spec reviewer 相同，但范围仅限当前 chunk。

**评审流程（按 chunk 逐个进行）：**
1. writing-plans 完成 chunk N
2. controller 将 chunk N 内容和 spec 路径派发给 plan-document-reviewer
3. reviewer 读取 chunk 和 spec，返回结论
4. 如果有问题：writing-plans agent 修复 chunk N，然后回到第 2 步
5. 如果通过：继续到 chunk N+1
6. 重复，直到所有 chunks 都通过

**派发机制：** 与 spec reviewer 相同，使用 Task tool 和 `subagent_type: general-purpose`。

## 更新后的工作流

```
brainstorming -> spec -> SPEC REVIEW LOOP -> writing-plans -> plan -> PLAN REVIEW LOOP -> implementation
```

**Spec Review Loop：**
1. Spec 完成
2. 派发 reviewer
3. 如果有问题：修复 -> 回到 2
4. 如果通过：继续

**Plan Review Loop：**
1. Chunk N 完成
2. 为 chunk N 派发 reviewer
3. 如果有问题：修复 -> 回到 2
4. 如果通过：进入下一个 chunk 或 implementation

## Markdown 任务语法

任务和步骤使用 checkbox 语法：

```markdown
- [ ] ### Task 1: Name

- [ ] **Step 1:** Description
  - File: path
  - Command: cmd
```

## 错误处理

**评审循环终止：**
- 不设硬性迭代上限，循环会持续到 reviewer 通过为止
- 如果超过 5 轮，controller 应将情况抛给人工寻求指导
- 人类可以选择：继续迭代、带着已知问题通过、或终止

**分歧处理：**
- Reviewer 只是 advisory，它负责指出问题，但不直接 block
- 如果 agent 认为 reviewer 反馈不正确，应在修复说明中解释原因
- 如果同一问题在 3 轮后仍存在分歧，应抛给人工

**Reviewer 输出格式错误：**
- Controller 应校验 reviewer 输出是否包含必需字段，如 Status，以及有问题时的 Issues
- 如果格式错误，则附带期望格式说明重新派发
- 连续 2 次格式错误后，抛给人工

## 需要修改的文件

**新文件：**
- `skills/brainstorming/spec-document-reviewer-prompt.md`
- `skills/writing-plans/plan-document-reviewer-prompt.md`

**修改文件：**
- `skills/brainstorming/SKILL.md` - 在 spec 写完后加入评审循环
- `skills/writing-plans/SKILL.md` - 加入按 chunk 进行的评审循环，并更新任务语法示例