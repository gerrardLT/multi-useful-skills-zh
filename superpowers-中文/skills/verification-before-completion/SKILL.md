---
name: verification-before-completion
description: 在你准备声称工作已完成、已修复或已通过之前使用，尤其是在提交或创建 PR 前；它要求你先运行验证命令并确认输出，永远先有证据再有结论
---

# 完成前验证

## 概览

在没有验证的情况下宣称工作完成，不是高效，而是不诚实。

**核心原则：** 任何结论之前，先有证据。

**违背这条规则的字面要求，也是在违背它的精神。**

## 铁律

```text
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

如果你没有在当前这条消息对应的工作中实际运行验证命令，你就不能声称它已经通过。

## 闸门函数

```text
在声称任何状态或表达满意之前：

1. IDENTIFY: 哪条命令能证明这个结论？
2. RUN: 完整执行该命令（最新、完整）
3. READ: 阅读完整输出，检查退出码，并统计失败数量
4. VERIFY: 输出是否真的支持这个结论？
   - 如果不支持：带证据说明真实状态
   - 如果支持：带证据说明结论成立
5. ONLY THEN: 只有这时才能做出结论

跳过任一步 = 不是验证，而是在撒谎
```

## 常见失败方式

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | 测试命令输出：0 failures | 之前跑过、或者“应该会过” |
| Linter clean | linter 输出：0 errors | 局部检查、或主观推断 |
| Build succeeds | build 命令：exit 0 | linter 通过、日志看起来没问题 |
| Bug fixed | 原始症状的验证通过 | 代码改了、主观觉得修好了 |
| Regression test works | 完整验证 red-green cycle | 测试只过了一次 |
| Agent completed | VCS diff 显示已有改动 | agent 报告“success” |
| Requirements met | 逐条 checklist 验证 | 仅仅 tests passing |

## 红旗信号：立刻停下

- 使用 “should”、“probably”、“seems to” 之类词
- 在验证前先表达满意（如 “Great!”、“Perfect!”、“Done!”）
- 准备在没有验证的情况下 commit / push / 开 PR
- 盲目信任 agent 的成功报告
- 依赖部分验证
- 心想“就这一次”
- 累了，只想赶紧结束
- **任何暗示成功、但你其实还没跑验证的说法**

## 防止自我合理化

| Excuse | Reality |
|--------|---------|
| "Should work now" | 去跑验证 |
| "I'm confident" | 信心 != 证据 |
| "Just this once" | 没有例外 |
| "Linter passed" | linter != compiler |
| "Agent said success" | 自己独立验证 |
| "I'm tired" | 疲惫 != 借口 |
| "Partial check is enough" | 局部检查什么也证明不了 |
| "Different words so rule doesn't apply" | 精神重于字面 |

## 关键模式

**Tests:**
```text
正确：[Run test command] [See: 34/34 pass] "All tests pass"
错误："Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green)：**
```text
正确：Write -> Run (pass) -> Revert fix -> Run (MUST FAIL) -> Restore -> Run (pass)
错误："I've written a regression test"（但没有做 red-green 验证）
```

**Build:**
```text
正确：[Run build] [See: exit 0] "Build passes"
错误："Linter passed"（linter 并不检查编译）
```

**Requirements:**
```text
正确：Re-read plan -> Create checklist -> Verify each -> Report gaps or completion
错误："Tests pass, phase complete"
```

**Agent delegation:**
```text
正确：Agent reports success -> Check VCS diff -> Verify changes -> Report actual state
错误：直接相信 agent 的报告
```

## 为什么这很重要

根据 24 条失败记忆：
- 你的人类搭档会说 “I don't believe you” -> 信任破裂
- 未定义函数被发布出去 -> 运行时会崩
- 需求没做完整却被交付 -> 功能不完整
- 在错误的“已完成”结论上浪费时间 -> 重定向 -> 返工
- 还会违反这条原则：**“Honesty is a core value. If you lie, you'll be replaced.”**

## 何时应用

**以下场景一律必须应用：**
- 任何形式的成功/完成声明之前
- 任何表达满意的时刻之前
- 任何关于工作状态的正面描述之前
- commit、创建 PR、结束任务之前
- 切换到下一个任务之前
- 派发给 agents 之前

**规则适用于：**
- 完全相同的说法
- 改写、同义表达
- 暗示成功的表述
- **任何会让人觉得“已经完成/正确”的沟通**

## 底线

**验证没有捷径。**

先运行命令，读输出，再做结论。

这不是可协商项。