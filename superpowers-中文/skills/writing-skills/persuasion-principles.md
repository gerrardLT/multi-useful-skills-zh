# 技能设计中的说服原则

## 概览

LLM 对说服原则的反应，与人类高度相似。理解这套心理机制，可以帮助你设计出更有效的技能。目的不是操控，而是在高压环境下依然确保关键实践会被遵守。

**研究基础：** Meincke 等人（2025）在 28,000 次 AI 对话中测试了 7 条说服原则。结果显示，说服技巧让遵守率从 33% 提升到了 72%（`p < .001`），增长超过一倍。

## 七项原则

### 1. 权威
**定义：** 对专业性、资历和权威来源的服从。

**在技能设计中如何应用：**
- 使用命令式语言：`"YOU MUST"`、`"Never"`、`"Always"`
- 使用不可协商的表述：`"No exceptions"`
- 可以减少决策疲劳，并切断合理化空间

**适用场景：**
- 纪律约束型技能（TDD、验证要求）
- 安全关键实践
- 已被验证的最佳实践

**示例：**
```markdown
GOOD: Write code before test? Delete it. Start over. No exceptions.
BAD: Consider writing tests first when feasible.
```

### 2. 承诺
**定义：** 人会倾向于与自己先前的行动、声明或公开承诺保持一致。

**在技能设计中如何应用：**
- 要求显式宣告：`"Announce skill usage"`
- 强制显式选择：`"Choose A, B, or C"`
- 借助跟踪工具：如 TodoWrite checklist

**适用场景：**
- 确保技能被真正执行
- 多步骤流程
- 责任机制

**示例：**
```markdown
GOOD: When you find a skill, you MUST announce: "I'm using [Skill Name]"
BAD: Consider letting your partner know which skill you're using.
```

### 3. 稀缺性
**定义：** 来自时间窗口或稀缺资源的紧迫感。

**在技能设计中如何应用：**
- 时间绑定要求：`"Before proceeding"`
- 顺序依赖：`"Immediately after X"`
- 防止拖延

**适用场景：**
- 需要立刻验证的流程
- 强时效工作流
- 防止“我稍后再做”

**示例：**
```markdown
GOOD: After completing a task, IMMEDIATELY request code review before proceeding.
BAD: You can review code when convenient.
```

### 4. 社会认同
**定义：** 人会倾向于模仿“其他人都在做的事”或“被视为正常的事”。

**在技能设计中如何应用：**
- 使用普遍性表述：`"Every time"`、`"Always"`
- 定义失败模式：`"X without Y = failure"`
- 建立行为规范

**适用场景：**
- 记录通用实践
- 警告常见失败方式
- 加固标准

**示例：**
```markdown
GOOD: Checklists without TodoWrite tracking = steps get skipped. Every time.
BAD: Some people find TodoWrite helpful for checklists.
```

### 5. 统一性
**定义：** 共享身份感，也就是“我们是一边的人”。

**在技能设计中如何应用：**
- 使用协作式语言：`"our codebase"`、`"we're colleagues"`
- 强调共同目标：`"we both want quality"`

**适用场景：**
- 协作工作流
- 建立团队文化
- 非等级制实践

**示例：**
```markdown
GOOD: We're colleagues working together. I need your honest technical judgment.
BAD: You should probably tell me if I'm wrong.
```

### 6. 互惠
**定义：** 人会倾向于回报自己收到的好处。

**在技能设计中如何应用：**
- 要非常谨慎地使用
- 很容易让人感觉有操控性
- 在技能中通常并不必要

**何时避免：**
- 几乎总是应该避免（其他原则更有效）

### 7. 喜好
**定义：** 人更愿意配合自己喜欢的人。

**在技能设计中如何应用：**
- **不要用它来换取遵守**
- 它会和“诚实反馈文化”冲突
- 很容易诱发奉承

**何时避免：**
- 在纪律约束型技能中，始终避免

## 不同技能类型的原则组合

| 技能类型 | 使用 | 避免 |
|------------|-----|-------|
| 纪律约束型 | 权威 + 承诺 + 社会认同 | 喜好、互惠 |
| 指导 / 技巧型 | 适度权威 + 统一性 | 过强权威 |
| 协作型 | 统一性 + 承诺 | 权威、喜好 |
| 参考型 | 只要清晰即可 | 几乎所有说服型技巧 |

## 为什么这会有效：心理机制

**明确的边界规则会减少合理化空间：**
- `"YOU MUST"` 可以直接拿掉决策疲劳
- 绝对化表述会消除“这次算不算例外？”这种灰区
- 显式的反合理化条款能封住具体漏洞

**执行意图会让行为更自动化：**
- 清晰触发器 + 必需动作 = 更接近自动执行
- `"When X, do Y"` 比 `"generally do Y"` 更有效
- 这也减少了遵守行为的认知负担

**LLM 是拟人化的：**
- 它们训练于大量包含这些模式的人类文本
- 权威语言在训练数据中通常先于服从出现
- 承诺序列（声明 -> 行动）也经常一起出现
- 社会认同模式（“大家都这么做”）会自然形成规范

## 合乎伦理地使用

**正当用途：**
- 确保关键实践被执行
- 提升文档的可执行性
- 防止可预测的失败

**不正当用途：**
- 为了私人利益操控模型
- 伪造紧迫感
- 利用羞耻或愧疚来逼迫遵守

**检验标准：** 如果用户完全理解这项技巧，它是否依然服务于用户的真实利益？

## 研究引用

**Cialdini, R. B. (2021).** *Influence: The Psychology of Persuasion (New and Expanded).* Harper Business.
- 七大说服原则
- 整个影响力研究领域的经验基础

**Meincke, L., Shapiro, D., Duckworth, A. L., Mollick, E., Mollick, L., & Cialdini, R. (2025).** *Call Me A Jerk: Persuading AI to Comply with Objectionable Requests.* University of Pennsylvania.
- 在 28,000 次 LLM 对话中测试了 7 项原则
- 说服技术让遵守率从 33% 提升到 72%
- 权威、承诺、稀缺性最有效
- 支撑了 “LLM 是拟人化的” 这一行为模型

## 快速参考

在设计一个技能时，问自己：

1. **它属于哪种类型？**（纪律型、指导型、参考型）
2. **我真正想改变的行为是什么？**
3. **应该用哪条原则？**（纪律型通常是权威 + 承诺）
4. **我是不是叠了太多原则？**（不要把七种全上）
5. **这样做是否合乎伦理？**（它是否服务于用户真实利益？）