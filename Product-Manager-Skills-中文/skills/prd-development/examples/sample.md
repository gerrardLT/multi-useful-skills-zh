# PRD 示例

### 示例 1：好的 PRD（引导式 Onboarding）

上面的各个章节已经给出了一个覆盖全部 10 个部分、结构良好的 PRD 详细示例。

**为什么这个例子有效：**
- 问题陈述清晰，且有证据支撑，如访谈、分析数据、support tickets
- Personas 基于研究，而不是凭空假设
- 解决方案描述的细节层级合适，不会过度规定实现
- 成功指标有明确目标
- 用户故事带有验收标准
- Out of scope 被明确写出

---

### 示例 2：糟糕的 PRD（功能清单）

**问题陈述：**
> "Users want better onboarding."

**解决方案：**
> "Add onboarding."

**需求：**
> "1. Onboarding flow
> 2. Tooltips
> 3. Help docs"

**为什么这个例子失败：**
- 没有证据，谁想要、为什么想要都不清楚
- 没有 persona，“users” 指的是谁根本不明确
- 没有成功指标，无法判断 “better” 到底是什么
- 没有验收标准，不知道 “onboarding flow” 具体意味着什么
- 没有战略背景，不知道为什么现在要做

**用 PRD 工作流修正：**
- **阶段 2:** 根据 discovery interviews 的证据来写问题陈述
- **阶段 3:** 定义 persona，比如 `Solo Entrepreneur Sam`
- **阶段 6:** 定义成功指标，比如 activation rate `40% -> 60%`
- **阶段 7:** 把 “onboarding flow” 拆成带验收标准的用户故事

---