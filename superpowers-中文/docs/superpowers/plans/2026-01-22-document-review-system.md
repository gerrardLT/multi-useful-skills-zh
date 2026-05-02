# 文档评审系统实现计划

> **面向代理 worker：** 必须使用 `superpowers:subagent-driven-development`（若可用子代理）或 `superpowers:executing-plans` 来实现本计划。  
> **目标：** 为 `brainstorming` 和 `writing-plans` 两个 skill 增加 spec / plan 文档评审回环。  
> **架构：** 在各自 skill 目录中新增 reviewer prompt 模板；在生成文档后扩展 skill 流程，加入 review loop；通过 `Task` 工具派发通用 reviewer 子代理。  
> **技术栈：** Markdown skill 文件、基于 `Task` 工具的子代理派发

**Spec：** `docs/superpowers/specs/2026-01-22-document-review-system-design.md`

---

## Chunk 1：Spec 文档 Reviewer

这一块为 `brainstorming` skill 增加 spec reviewer。

### 任务 1：创建 Spec 文档 Reviewer Prompt 模板

**文件：**

- 新建：`skills/brainstorming/spec-document-reviewer-prompt.md`

- [ ] **步骤 1：创建 reviewer prompt 模板文件**

```markdown
# Spec Document Reviewer Prompt Template

在派发 spec 文档 reviewer 子代理时使用这份模板。

**目的：** 验证 spec 是否完整、一致，并已准备好进入实现计划阶段。  
**触发时机：** spec 写入 `docs/superpowers/specs/` 之后

Task tool (general-purpose):
  description: "Review spec document"
  prompt: |
    You are a spec document reviewer. Verify this spec is complete and ready for planning.

    **Spec to review:** [SPEC_FILE_PATH]

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Completeness | TODOs, placeholders, "TBD", incomplete sections |
    | Coverage | Missing error handling, edge cases, integration points |
    | Consistency | Internal contradictions, conflicting requirements |
    | Clarity | Ambiguous requirements |
    | YAGNI | Unrequested features, over-engineering |

    ## CRITICAL

    Look especially hard for:
    - Any TODO markers or placeholder text
    - Sections saying "to be defined later" or "will spec when X is done"
    - Sections noticeably less detailed than others

    ## Output Format

    ## Spec Review

    **Status:** Approved | Issues Found

    **Issues (if any):**
    - [Section X]: [specific issue] - [why it matters]

    **Recommendations (advisory):**
    - [suggestions that don't block approval]
```

**Reviewer 返回：** `Status`、`Issues`（如有）、`Recommendations`

- [ ] **步骤 2：验证文件创建正确**

运行：`cat skills/brainstorming/spec-document-reviewer-prompt.md | head -20`  
预期：能看到标题和目的说明

- [ ] **步骤 3：提交**

```bash
git add skills/brainstorming/spec-document-reviewer-prompt.md
git commit -m "feat: add spec document reviewer prompt template"
```

---

### 任务 2：把 Review Loop 加入 Brainstorming Skill

**文件：**

- 修改：`skills/brainstorming/SKILL.md`

- [ ] **步骤 1：读取当前 brainstorming skill**

运行：`cat skills/brainstorming/SKILL.md`

- [ ] **步骤 2：在 “After the Design” 之后加入 review loop**

在文档编写完成、进入实现前，加入：

```markdown
**Spec Review Loop:**
After writing the spec document:
1. Dispatch spec-document-reviewer subagent (see spec-document-reviewer-prompt.md)
2. If Issues Found:
   - Fix the issues in the spec document
   - Re-dispatch reviewer
   - Repeat until Approved
3. If Approved: proceed to implementation setup

**Review loop guidance:**
- Same agent that wrote the spec fixes it (preserves context)
- If loop exceeds 5 iterations, surface to human for guidance
- Reviewers are advisory - explain disagreements if you believe feedback is incorrect
```

- [ ] **步骤 3：验证改动**

运行：`grep -A 15 "Spec Review Loop" skills/brainstorming/SKILL.md`  
预期：能看到新加入的 review loop

- [ ] **步骤 4：提交**

```bash
git add skills/brainstorming/SKILL.md
git commit -m "feat: add spec review loop to brainstorming skill"
```

---

## Chunk 2：Plan 文档 Reviewer

这一块为 `writing-plans` skill 增加 plan reviewer。

### 任务 3：创建 Plan 文档 Reviewer Prompt 模板

**文件：**

- 新建：`skills/writing-plans/plan-document-reviewer-prompt.md`

- [ ] **步骤 1：创建 reviewer prompt 模板文件**

```markdown
# Plan Document Reviewer Prompt Template

在派发 plan 文档 reviewer 子代理时使用这份模板。

**目的：** 验证 plan chunk 是否完整、符合 spec，并且任务拆解合理。  
**触发时机：** 每个 plan chunk 写完之后

Task tool (general-purpose):
  description: "Review plan chunk N"
  prompt: |
    You are a plan document reviewer. Verify this plan chunk is complete and ready for implementation.

    **Plan chunk to review:** [PLAN_FILE_PATH] - Chunk N only
    **Spec for reference:** [SPEC_FILE_PATH]

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Completeness | TODOs, placeholders, incomplete tasks, missing steps |
    | Spec Alignment | Chunk covers relevant spec requirements, no scope creep |
    | Task Decomposition | Tasks atomic, clear boundaries, steps actionable |
    | Task Syntax | Checkbox syntax (`- [ ]`) on tasks and steps |
    | Chunk Size | Each chunk under 1000 lines |

    ## CRITICAL

    Look especially hard for:
    - Any TODO markers or placeholder text
    - Steps that say "similar to X" without actual content
    - Incomplete task definitions
    - Missing verification steps or expected outputs

    ## Output Format

    ## Plan Review - Chunk N

    **Status:** Approved | Issues Found

    **Issues (if any):**
    - [Task X, Step Y]: [specific issue] - [why it matters]

    **Recommendations (advisory):**
    - [suggestions that don't block approval]
```

**Reviewer 返回：** `Status`、`Issues`（如有）、`Recommendations`

- [ ] **步骤 2：验证文件已创建**

运行：`cat skills/writing-plans/plan-document-reviewer-prompt.md | head -20`  
预期：能看到标题和目的说明

- [ ] **步骤 3：提交**

```bash
git add skills/writing-plans/plan-document-reviewer-prompt.md
git commit -m "feat: add plan document reviewer prompt template"
```

---

### 任务 4：把 Review Loop 加入 Writing-Plans Skill

**文件：**

- 修改：`skills/writing-plans/SKILL.md`

- [ ] **步骤 1：读取当前 skill 文件**

运行：`cat skills/writing-plans/SKILL.md`

- [ ] **步骤 2：加入按 chunk 评审的章节**

在 `Execution Handoff` 之前加入：

```markdown
## Plan Review Loop

After completing each chunk of the plan:

1. Dispatch plan-document-reviewer subagent for the current chunk
   - Provide: chunk content, path to spec document
2. If Issues Found:
   - Fix the issues in the chunk
   - Re-dispatch reviewer for that chunk
   - Repeat until Approved
3. If Approved: proceed to next chunk (or execution handoff if last chunk)

**Chunk boundaries:** Use `## Chunk N: <name>` headings to delimit chunks. Each chunk should be <= 1000 lines and logically self-contained.
```

- [ ] **步骤 3：把任务语法示例改成 checkbox 格式**

将 `Task Structure` 部分调整为：

```markdown
### Task N: [Component Name]

- [ ] **Step 1:** Write the failing test
  - File: `tests/path/test.py`
  ...
```

- [ ] **步骤 4：验证 review loop 已加入**

运行：`grep -A 15 "Plan Review Loop" skills/writing-plans/SKILL.md`

- [ ] **步骤 5：验证任务语法示例已更新**

运行：`grep -A 5 "Task N:" skills/writing-plans/SKILL.md`

- [ ] **步骤 6：提交**

```bash
git add skills/writing-plans/SKILL.md
git commit -m "feat: add plan review loop and checkbox syntax to writing-plans skill"
```

---

## Chunk 3：更新 Plan 文档头部

### 任务 5：更新 Writing-Plans Skill 中的 Plan Header 模板

**文件：**

- 修改：`skills/writing-plans/SKILL.md`

- [ ] **步骤 1：读取当前 plan header 模板**

运行：`grep -A 20 "Plan Document Header" skills/writing-plans/SKILL.md`

- [ ] **步骤 2：更新头部模板，明确说明 checkbox 语法**

将头部说明改为：

```markdown
> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Tasks and steps use checkbox (`- [ ]`) syntax for tracking.
```

- [ ] **步骤 3：验证改动**

运行：`grep -A 5 "For agentic workers:" skills/writing-plans/SKILL.md`

- [ ] **步骤 4：提交**

```bash
git add skills/writing-plans/SKILL.md
git commit -m "docs: update plan header to reference checkbox syntax"
```