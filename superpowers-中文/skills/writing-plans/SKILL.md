---
name: writing-plans
description: 适用于你已经有规格说明或多步骤任务，并且需要在写代码前先产出一份具体实现计划的时候。
---

# 编写实现计划

## 概览

写计划时，要假设未来执行它的工程师几乎不了解这套代码库，也不一定擅长测试设计。你要把执行任务所需的上下文、文件、测试、验证方式，全部明确写出来。

目标不是“描述大方向”，而是产出一份可以逐步照着执行的计划。

开始时先明确说明：

`我正在使用编写计划技能来创建实现计划。`

计划默认保存到：

`docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

如果用户指定位置，以用户要求为准。

## 范围检查

如果一个 spec 同时覆盖多个独立子系统，应该优先拆成多份计划。每份计划都应能独立产出可运行、可测试的软件。

## 文件结构先行

在拆任务前，先梳理：

- 会新建哪些文件
- 会修改哪些文件
- 每个文件承担什么职责

原则：

- 职责清晰
- 接口明确
- 优先小文件、聚焦文件
- 经常一起改的文件应彼此靠近
- 尽量遵循现有代码库结构

## 步骤粒度

每一步都应是单个动作，通常 2 到 5 分钟能完成。

例如：

- 写出失败测试
- 运行测试并确认失败
- 写最小实现
- 再跑测试确认通过
- 提交变更

不要把这些合成一步。

## 计划头部模板

每份计划都应以这段开头：

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [一句话说明目标]

**Architecture:** [2-3 句说明方案]

**Tech Stack:** [关键技术或库]

---
```

## 任务模板

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## 不要留占位符

下面这些都属于失败计划：

- `TBD`
- `TODO`
- `implement later`
- `fill in details`
- “加上适当错误处理”
- “补充验证逻辑”
- “处理边界情况”
- “为上面写测试”但不给实际测试代码
- “类似 Task N”

规则：

- 永远写精确文件路径
- 只要涉及代码，就给出真实代码块
- 命令必须可执行
- 命令要带预期输出

## 记住

- 坚持 DRY
- 坚持 YAGNI
- 坚持 TDD
- 频繁提交

## 自审

计划写完后，必须自己回头审一遍。

### 1. Spec 覆盖度

逐条检查 spec，确认每个要求都映射到了某个任务。

### 2. 占位符扫描

检查是否还残留模糊措辞和偷懒表达。

### 3. 类型与命名一致性

后面任务里引用的类型、函数、属性，必须和前面定义的一致。计划里自相矛盾，本身就是 bug。

发现问题就直接改计划，不要带着缺口交付。

## 执行交接

计划保存后，要给用户两个执行选项：

1. `Subagent-Driven`
   推荐。按任务拆分给全新 subagent，中间做评审。

2. `Inline Execution`
   在当前会话里按批次执行，并在检查点做复核。

如果用户选 `Subagent-Driven`：

- 使用 `superpowers:subagent-driven-development`

如果用户选 `Inline Execution`：

- 使用 `superpowers:executing-plans`

## 底线

好计划必须具体、可执行、可验证。

如果执行者还需要自己补全关键细节，那这份计划就还没写完。