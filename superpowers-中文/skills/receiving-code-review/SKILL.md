---
name: receiving-code-review
description: 在收到代码评审反馈、并准备实现建议前使用，尤其当反馈不够清晰或技术上值得怀疑时；它要求技术严谨和验证，而不是表演式认同或盲目照做
---

# 接收代码评审

## 概览

代码评审需要的是技术评估，而不是情绪表演。

**核心原则：** 实现之前先验证。假设之前先提问。技术正确性高于社交舒适感。

## 响应模式

```text
在收到代码评审反馈时：

1. READ: 先完整读完反馈，不要立刻反应
2. UNDERSTAND: 用自己的话复述要求（或提问确认）
3. VERIFY: 对照代码库现实进行核查
4. EVALUATE: 对 THIS codebase 来说技术上成立吗？
5. RESPOND: 做技术确认，或给出有理有据的反驳
6. IMPLEMENT: 一次处理一项，并逐项测试
```

## 禁止的回应

**绝不要：**
- "You're absolutely right!"（明确违反 `CLAUDE.md`）
- "Great point!" / "Excellent feedback!"（表演式回应）
- "Let me implement that now"（在验证之前）

**应当改为：**
- 复述技术要求
- 提出澄清问题
- 如果对方错了，就基于技术理由反驳
- 或者直接开始动手（行动 > 语言）

## 如何处理不清晰的反馈

```text
如果任何一条反馈不清晰：
  STOP - 暂时不要实现任何东西
  ASK - 先澄清不清楚的项

原因：这些项之间可能有关联。只理解一部分，通常就会做错。
```

**示例：**
```text
your human partner: "Fix 1-6"
You understand 1,2,3,6. Unclear on 4,5.

错误：先实现 1,2,3,6，之后再问 4,5
正确："I understand items 1,2,3,6. Need clarification on 4 and 5 before proceeding."
```

## 按来源区分处理

### 来自你的人类搭档
- **默认可信** - 理解之后就实现
- **如果范围不清晰，仍然要问**
- **不要表演式认同**
- **直接行动，或给出技术性确认**

### 来自外部 Reviewer

```text
在实现之前：
  1. Check: 对 THIS codebase 来说技术上正确吗？
  2. Check: 会不会破坏现有功能？
  3. Check: 当前实现为什么会这样写？
  4. Check: 在所有平台/版本上都成立吗？
  5. Check: reviewer 是否理解了完整上下文？

如果建议看起来不对：
  用技术理由反驳

如果你无法轻易验证：
  直接说明："I can't verify this without [X]. Should I [investigate/ask/proceed]?"

如果它与人类搭档之前的决策冲突：
  先停下来，先和人类搭档讨论
```

**你的人类搭档的规则：** “External feedback - be skeptical, but check carefully”

## 对“更专业做法”的 YAGNI 检查

```text
如果 reviewer 建议“按正确方式完整实现”：
  先 grep 代码库，看看有没有真实使用

  如果没有使用："This endpoint isn't called. Remove it (YAGNI)?"
  如果确实有使用：那再按正确方式实现
```

**你的人类搭档的规则：** “You and reviewer both report to me. If we don't need this feature, don't add it.”

## 实现顺序

```text
对于多条反馈：
  1. 先澄清所有不清楚的项
  2. 然后按以下顺序实现：
     - 阻塞性问题（会坏、涉及安全）
     - 简单修复（typo、imports）
     - 复杂修复（重构、逻辑变更）
  3. 每项单独测试
  4. 验证没有回归
```

## 什么时候应该反驳

在以下情况要反驳：
- 建议会破坏现有功能
- reviewer 缺少完整上下文
- 违反 YAGNI（属于未使用功能）
- 对当前技术栈来说技术上不成立
- 存在遗留/兼容性原因
- 与你的人类搭档的架构决策冲突

**如何反驳：**
- 用技术理由，不要防御性发言
- 提出具体问题
- 引用正在通过的测试或代码
- 如果是架构问题，就把人类搭档拉进来

**如果你不太敢当面反驳，可以用的信号句：** "Strange things are afoot at the Circle K"

## 如何确认正确反馈

当反馈 **确实正确** 时：

```text
正确："Fixed. [Brief description of what changed]"
正确："Good catch - [specific issue]. Fixed in [location]."
正确：[直接修掉，并在代码里体现]

错误："You're absolutely right!"
错误："Great point!"
错误："Thanks for catching that!"
错误："Thanks for [anything]"
错误：任何感谢性表述
```

**为什么不要说谢谢：** 行动会说明一切。直接修掉即可，代码本身就能证明你听进去了。

**如果你发现自己正要打出 "Thanks"：** 删掉它，直接说明修了什么。

## 如何体面地纠正你自己的反驳

如果你之前反驳了，但后来发现自己错了：

```text
正确："You were right - I checked [X] and it does [Y]. Implementing now."
正确："Verified this and you're correct. My initial understanding was wrong because [reason]. Fixing."

错误：长篇道歉
错误：继续辩解自己为什么会反驳
错误：过度解释
```

如实说明修正后的事实，然后继续前进。

## 常见错误

| 错误 | 修正方法 |
|---------|-----|
| 表演式认同 | 直接陈述需求，或直接行动 |
| 盲目实现 | 先对照代码库验证 |
| 批量改、不测试 | 一次一项，并逐项测试 |
| 默认 reviewer 一定对 | 先检查会不会破坏东西 |
| 不敢反驳 | 技术正确性 > 舒适感 |
| 只实现一部分 | 先澄清全部项 |
| 无法验证却继续做 | 说明限制，并请求方向 |

## 真实例子

**表演式认同（错误）：**
```text
Reviewer: "Remove legacy code"
错误："You're absolutely right! Let me remove that..."
```

**技术验证（正确）：**
```text
Reviewer: "Remove legacy code"
正确："Checking... build target is 10.15+, this API needs 13+. Need legacy for backward compat. Current impl has wrong bundle ID - fix it or drop pre-13 support?"
```

**YAGNI（正确）：**
```text
Reviewer: "Implement proper metrics tracking with database, date filters, CSV export"
正确："Grepped codebase - nothing calls this endpoint. Remove it (YAGNI)? Or is there usage I'm missing?"
```

**反馈项不清晰（正确）：**
```text
your human partner: "Fix items 1-6"
You understand 1,2,3,6. Unclear on 4,5.
正确："Understand 1,2,3,6. Need clarification on 4 and 5 before implementing."
```

## GitHub Thread 回复

在 GitHub 上回复行内 review comments 时，要回复到评论 thread 里（`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`），不要发成顶层 PR 评论。

## 底线

**外部反馈 = 需要评估的建议，不是必须服从的命令。**

先验证，先提问，再实现。

不要表演式认同。始终保持技术严谨。