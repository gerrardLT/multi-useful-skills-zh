---
name: writing-skills
description: 适用于创建新 skill、编辑现有 skill，或在发布前验证 skill 的时候。
---

# 编写 Skills

## 概览

编写 skill，本质上就是将 TDD 方法应用于流程文档。

首先，设计会让 agent 出错的真实场景，观察它在没有 skill 时如何失败；然后，编写 skill 来修复这些失败；最后，反复修补漏洞，直到它在压力下依然稳固。

个人 skills 通常存放在各 agent 自己的目录中，例如：

- Claude Code：`~/.claude/skills`
- Codex：`~/.agents/skills/`

核心原则：
如果你没有亲眼见过 agent 在没有这个 skill 时如何失败，你就不知道这个 skill 教授的内容是否正确。

必备背景：
请先理解 `superpowers:test-driven-development`。那个 skill 定义了基础的 RED-GREEN-REFACTOR 循环；这里讲解的是如何将这套方法应用到 skill 本身。

官方补充参考：
`anthropic-best-practices.md`

## 什么是 Skill

skill 是一份关于成熟做法、模式或工具的可复用参考。

Skills 是：

- 可复用的技巧
- 可复用的工作模式
- 可复用的工具说明
- 可复用的参考指南

Skills 不是：

- 某一次问题排查的流水账
- 一次性方案记录
- 只对当前项目有效的私有约定

## Skill 的 TDD 映射

| TDD 概念 | Skill 创建中的对应物 |
|---|---|
| Test case | 带压力的 subagent 场景 |
| Production code | `SKILL.md` |
| Test fails | 没有 skill 时，agent 出现违规或错误行为 |
| Test passes | 启用 skill 后，agent 开始遵守 |
| Refactor | 在保持正确的前提下继续堵漏洞 |
| Write test first | 先运行 baseline，再编写 skill |
| Watch it fail | 逐字记录借口和失败模式 |
| Minimal code | 只为真实失败补充最小规则 |

## 什么时候该写 Skill

适合：

- 这套做法并不显而易见
- 你以后还会反复用到
- 它足够通用，不只属于单个项目
- 其他协作者也会受益

不适合：

- 一次性解法
- 已经有清楚官方标准的内容
- 项目私有约定
- 可以直接用脚本、校验器、CI 强制的机械规则

## Skill 类型

### Technique

有明确步骤的方法，例如 `condition-based-waiting`。

### Pattern

一种思考和拆解问题的方式，例如 `flatten-with-flags`。

### Reference

API、语法、工具说明等参考资料。

## 目录结构

```text
skills/
  skill-name/
    SKILL.md
    supporting-file.*
```

原则：

- `SKILL.md` 必须存在
- 重型参考资料可以拆分到独立文件
- 可复用脚本和工具应拆分到独立文件
- 原则、概念、小型示例尽量内联

## `SKILL.md` 结构

frontmatter 至少包含：

- `name`
- `description`

要求：

- 总长度不超过 1024 字符
- `name` 只使用字母、数字、连字符
- `description` 只描述“何时使用”，不要概括流程
- `description` 以“适用于...”开头
- `description` 重点写触发条件、症状和场景

推荐结构：

```markdown
---
name: skill-name
description: 适用于[触发条件]
---

# Skill Name

## Overview

## When to Use

## Core Pattern

## Quick Reference

## Implementation

## Common Mistakes

## Real-World Impact
```

## 搜索优化

未来的 agent 必须先能找到这个 skill。

### 1. description 只写触发条件

坏例子：

```yaml
description: 适用于执行实现计划的时候
description: 适用于实现功能或修复缺陷、并且要先写测试的时候
```

好例子：

```yaml
description: 适用于在当前会话中执行包含独立任务的实现计划
description: 适用于实现任何功能或修复任何缺陷，并且要在写实现代码前先写测试的时候
```

规则：

- 写“什么时候该读它”
- 不要写“它会怎么做”
- 不要把完整 workflow 塞进 description

### 2. 覆盖真实搜索词

要覆盖：

- 错误信息
- 症状词
- 同义词
- 真实命令、库名、文件类型

### 3. 命名要有动作感

好：

- `creating-skills`
- `condition-based-waiting`
- `root-cause-tracing`

弱：

- `skill-creation`
- `async-test-helpers`

### 4. 控制 token 成本

建议：

- 高频入门 skill：尽量少于 150 词
- 高频加载 skill：尽量少于 200 词
- 其他 skill：尽量少于 500 词

做法：

- 细节多时链接到辅助文件
- 重复流程尽量交叉引用
- 保留一个高质量示例，不要堆砌很多近似示例

### 5. 引用其他 Skills

写法：

- `REQUIRED SUB-SKILL: Use superpowers:test-driven-development`
- `REQUIRED BACKGROUND: You MUST understand superpowers:systematic-debugging`

不要：

- 直接贴相对路径作为要求
- 用 `@` 强制提前加载大文件

## Flowchart 何时使用

只在以下情况使用 flowchart：

- 决策点不直观
- 容易半途停下来的流程
- 需要区分 A 还是 B 的判断

不要用 flowchart 表达：

- 纯参考信息
- 代码示例
- 线性步骤
- 没语义的占位标签

## 代码示例

一个高质量示例通常胜过很多普通示例。

要求：

- 完整、可运行
- 注释解释为什么
- 来自真实场景
- 足够清楚，方便迁移

不要：

- 同一 skill 堆砌 5 种语言版本
- 写成空洞模板
- 使用生硬的人造示例

## 文件组织

### 自包含 Skill

```text
defense-in-depth/
  SKILL.md
```

适合内容不多、无需额外参考的 skill。

### 带工具的 Skill

```text
condition-based-waiting/
  SKILL.md
  example.ts
```

适合附带可复用代码或脚本的 skill。

### 带重型参考资料的 Skill

```text
pptx/
  SKILL.md
  pptxgenjs.md
  ooxml.md
  scripts/
```

适合参考资料很大，不适合全部内联。

## 铁律

```text
NO SKILL WITHOUT A FAILING TEST FIRST
```

这条规则对新建和修改 skill 都成立。

没有例外：

- 不是“只补一小段”就能跳过
- 不是“只是文档更新”就能跳过
- 不是“先留着做参考”就能跳过
- 不是“一边测一边顺手改”就能跳过

说删除，就是真的删。

## 如何测试不同类型的 Skill

### 纪律约束型

例如 TDD、完成前验证、先设计后编码。

测试重点：

- 是否理解规则
- 压力下是否仍遵守
- 是否能识别并堵住合理化借口

### Technique 型

例如 `condition-based-waiting`、`root-cause-tracing`。

测试重点：

- 能否正确应用到新场景
- 能否覆盖变体和边界
- 文档是否存在缺口

### Pattern 型

例如复杂度控制、信息隐藏。

测试重点：

- 能否识别何时该用
- 能否真正用它解题
- 能否识别何时不该用

### Reference 型

例如 API 文档、命令参考。

测试重点：

- 能否被找到
- 找到后能否被正确使用
- 常见用法是否被覆盖

## 常见借口

| Excuse | Reality |
|---|---|
| 这个 skill 已经写得很清楚了 | 对你清楚，不等于对 agent 清楚 |
| 它只是参考文档 | 参考文档也会缺失关键用法 |
| 现在测太麻烦 | 后面返工更麻烦 |
| 等出了问题再测 | 那是拿真实工作当测试环境 |
| 我很有把握 | 过度自信最容易埋坑 |

## 把 Skills 做到抗合理化

对于约束型 skill，规则必须能抗借口。

### 显式堵死常见绕法

坏：

```markdown
Write code before test? Delete it.
```

好：

```markdown
Write code before test? Delete it. Start over.

No exceptions:
- Don't keep it as reference
- Don't adapt it while writing tests
- Don't look at it
- Delete means delete
```

### 尽早写明基础原则

```markdown
Violating the letter of the rules is violating the spirit of the rules.
```

### 维护 Rationalization Table

把 baseline 测试里出现过的借口都写进去。

### 维护 Red Flags

让 agent 一出现典型借口就能自检并停下。

### 把违规前症状写进 description

不仅写任务类型，也写“快要犯错时会出现什么症状”。

## Skills 的 RED-GREEN-REFACTOR

### RED

先在没有 skill 时运行压力场景，完整记录：

- 做了什么选择
- 说了哪些借口
- 被什么压力触发

### GREEN

只为这些真实失败补充最小 skill。

### REFACTOR

如果 agent 又造出新借口，就继续补充反制并重测。

完整方法见：
`testing-skills-with-subagents.md`

## 反模式

- 叙事型案例记录
- 多语言样板堆砌
- 在 flowchart 里塞代码
- `helper1`、`step2` 这类泛化标签

## STOP

写完一个 skill 后，必须停下来做部署前验证。

不要：

- 一口气写多个 skill 却不逐个测试
- 当前 skill 还没验证就跳去下一个
- 以“批处理效率更高”为理由跳过测试

## 检查清单

RED：

- [ ] 设计了压力场景
- [ ] 运行过 baseline
- [ ] 记录了失败模式和借口

GREEN：

- [ ] `name` 合规
- [ ] frontmatter 完整
- [ ] `description` 以“适用于...”开头
- [ ] `description` 只写触发条件
- [ ] 有清晰 overview
- [ ] 规则回应了 RED 里出现的真实失败
- [ ] 启用 skill 后重新验证过

REFACTOR：

- [ ] 识别了新的借口
- [ ] 加了显式反制
- [ ] 更新了 rationalization table
- [ ] 更新了 red flags
- [ ] 重测直到足够稳

质量：

- [ ] 只在必要时使用 flowchart
- [ ] 有 quick reference
- [ ] 有 common mistakes
- [ ] 没写成案例流水账

部署：

- [ ] 已提交
- [ ] 足够通用时考虑回馈上游

## 底线

创建 skill，本质上就是“流程文档版 TDD”。

没有 failing test，就没有 skill。