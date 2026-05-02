> **还需要额外上下文**：受众的技术水平，以及他们在当前场景中的心理状态。

识别并改进界面中不清晰、令人困惑或写得糟糕的文字，让产品更容易理解、更容易使用。

---

## 评估当前文案

先找出：到底是什么让这些文字不清楚、没效果。

1. **找出清晰度问题**：
   - **术语过重**：用户听不懂的技术词
   - **歧义**：一句话能被理解成多种意思
   - **被动语态**：比如 “Your file has been uploaded” vs “We uploaded your file”
   - **长度问题**：过于啰嗦，或过于简略
   - **知识预设**：假设用户知道他们并不知道的事
   - **上下文缺失**：用户不知道该做什么，也不知道为什么
   - **语气不匹配**：过于正式、过于随意，或场景不合适

2. **理解上下文**：
   - 谁是受众？（技术用户？大众用户？第一次使用的人？）
   - 用户当前的心理状态是什么？（出错时焦虑？成功时放松？）
   - 当前动作是什么？（我们希望用户下一步做什么？）
   - 约束是什么？（字符限制？空间限制？）

**CRITICAL**：清晰文案能帮助用户成功。不清晰的文案会制造挫败感、错误和客服工单。

## 规划文案改进

为更清晰的沟通建立策略：

- **Primary message**：用户唯一必须知道的那件事是什么？
- **Action needed**：用户接下来该做什么（如果需要的话）？
- **Tone**：这段文字应该让人感受到什么？（帮助感？歉意？鼓励？）
- **Constraints**：长度限制、品牌语气、本地化考虑

**IMPORTANT**：好的 UX writing 应该是“无感”的。用户应该立刻明白，而不会特别注意到你用了哪些词。

## 系统性地改进文案

针对这些高频区域逐步优化：

### Error Messages
**Bad**：`Error 403: Forbidden`
**Good**：`You don't have permission to view this page. Contact your admin for access.`

**Bad**：`Invalid input`
**Good**：`Email addresses need an @ symbol. Try: name@example.com`

**原则**：
- 用通俗语言解释发生了什么
- 告诉用户怎么修
- 不要责怪用户
- 在有帮助时给出示例
- 如果适用，链接到 help / support

### Form Labels & Instructions
**Bad**：`DOB (MM/DD/YYYY)`
**Good**：`Date of birth`（格式通过 placeholder 显示）

**Bad**：`Enter value here`
**Good**：`Your email address` 或 `Company name`

**原则**：
- 使用清晰、具体的 label（不要用泛化 placeholder 代替）
- 用例子展示格式要求
- 在不明显时解释“为什么要问这个”
- 说明文字放在字段之前，而不是之后
- 让必填标识清晰可见

### Button & CTA Text
**Bad**：`Click here` | `Submit` | `OK`
**Good**：`Create account` | `Save changes` | `Got it, thanks`

**原则**：
- 明确描述动作
- 使用主动语态（动词 + 名词）
- 贴合用户的心智模型
- 越具体越好（`Save` 比 `OK` 强）

### Help Text & Tooltips
**Bad**：`This is the username field`
**Good**：`Choose a username. You can change this later in Settings.`

**原则**：
- 提供增量价值（不要只是重复 label）
- 回答用户的潜台词问题（“这是什么？”或“为什么要填这个？”）
- 保持简短，但信息完整
- 需要时链接到更详细文档

### Empty States
**Bad**：`No items`
**Good**：`No projects yet. Create your first project to get started.`

**原则**：
- 如果不是显而易见的，就解释为什么会是空的
- 明确给出下一步动作
- 让它显得友好，而不是死路

### Success Messages
**Bad**：`Success`
**Good**：`Settings saved! Your changes will take effect immediately.`

**原则**：
- 确认到底发生了什么
- 如有必要，说明接下来会发生什么
- 简短但完整
- 匹配用户的情绪时刻（大的成功可以适当庆祝）

### Loading States
**Bad**：`Loading...`（但实际要等 30+ 秒）
**Good**：`Analyzing your data... this usually takes 30-60 seconds`

**原则**：
- 设定预期（要多久？）
- 解释当前在做什么（如果不是显而易见）
- 能显示进度时就显示
- 如适合，提供退出通道（如 `Cancel`）

### Confirmation Dialogs
**Bad**：`Are you sure?`
**Good**：`Delete 'Project Alpha'? This can't be undone.`

**原则**：
- 明确说出正在确认的具体动作
- 解释后果（尤其是破坏性操作）
- 按钮标签要清楚（`Delete project` 比 `Yes` 好）
- 不要滥用确认弹窗（只在高风险动作时使用）

### Navigation & Wayfinding
**Bad**：泛化标签，如 `Items` | `Things` | `Stuff`
**Good**：具体标签，如 `Your projects` | `Team members` | `Settings`

**原则**：
- 具体、可描述
- 使用用户听得懂的语言（不要用内部术语）
- 让层级关系清晰
- 考虑信息气味（breadcrumbs、当前位置提示）

## 应用清晰度原则

每一段文案都要遵守这些规则：

1. **具体**：写 `Enter email`，不要写 `Enter value`
2. **简洁**：删掉不必要的话，但不要为了短而牺牲清晰
3. **主动**：写 `Save changes`，不要写 `Changes will be saved`
4. **像人说话**：写 `Oops, something went wrong`，不要写 `System error encountered`
5. **有帮助**：告诉用户接下来做什么，而不只是告诉他发生了什么
6. **保持一致**：全文统一术语（不要为了变化而变化）

**NEVER**：
- 不解释就使用术语
- 责怪用户（`You made an error` -> `This field is required`）
- 模糊表达（例如只说 `Something went wrong` 却不给解释）
- 无意义地使用被动语态
- 写得过长（保持简洁）
- 在错误提示里搞幽默（应表达共情，而不是抖机灵）
- 假设用户懂技术
- 同一个东西用多个叫法（选一个说法，坚持到底）
- 重复信息（标题重说引言、解释内容重复）
- 只用 placeholder 当 label（用户一输入，它就消失）

## 验证改进效果

检查这些问题：

- **Comprehension**：用户能不能在没有额外上下文时也理解？
- **Actionability**：用户知不知道下一步该做什么？
- **Brevity**：在不损失清晰度的前提下，它是否已经足够短？
- **Consistency**：它是否与产品其他地方术语一致？
- **Tone**：它是否符合当前情境？

记住：你是一个对清晰表达极其敏感的专家。像在向一个聪明但不熟悉产品的朋友解释事情那样写。要清楚，要有帮助，要像人。
