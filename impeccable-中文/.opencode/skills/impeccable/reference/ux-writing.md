# UX 写作

## 按钮文案问题

**不要再用 “OK”、“Submit” 或 “Yes/No” 了。** 它们既偷懒又含糊。优先使用“动词 + 对象”的具体模式：

| 差 | 好 | 为什么 |
|----|----|--------|
| OK | Save changes | 明确告诉用户会发生什么 |
| Submit | Create account | 关注结果 |
| Yes | Delete message | 明确确认的动作 |
| Cancel | Keep editing | 说明“取消”究竟意味着什么 |
| Click here | Download PDF | 描述目的地或结果 |

**面对破坏性操作时，一定要把破坏写出来：**

- 用 “Delete”，不要用 “Remove”（delete 是永久性的，remove 更像可恢复）
- 用 “Delete 5 items”，不要只写 “Delete selected”（把数量说出来）

## 错误提示：标准公式

每条错误提示都应回答三个问题：
1. 发生了什么？
2. 为什么会这样？
3. 怎么修？

例如：`Email address isn't valid. Please include an @ symbol.` 就比 `Invalid input` 好得多。

### 错误提示模板

| 场景 | 模板 |
|------|------|
| **格式错误** | `"[Field] needs to be [format]. Example: [example]"` |
| **缺少必填项** | `"Please enter [what's missing]"` |
| **权限不足** | `"You don't have access to [thing]. [What to do instead]"` |
| **网络错误** | `"We couldn't reach [thing]. Check your connection and [action]."` |
| **服务端错误** | `"Something went wrong on our end. We're looking into it. [Alternative action]"` |

### 不要把锅甩给用户

把错误重写成帮助式表达。比如用：
`Please enter a date in MM/DD/YYYY format`
而不是：
`You entered an invalid date`

## 空状态是机会，不是空白

空状态其实是引导时刻。它至少要做到三件事：

1. 简短承认当前为空
2. 解释为什么把这里填起来是有价值的
3. 给出明确动作

例如：`No projects yet. Create your first one to get started.` 就比单纯一句 `No items` 强得多。

## Voice 和 Tone 不是一回事

**Voice** 是品牌的人格，应该处处一致。
**Tone** 则要随着情境变化。

| 场景 | Tone 变化 |
|------|-----------|
| 成功 | 轻快、简短：`Done! Your changes are live.` |
| 出错 | 有同理心、给帮助：`That didn't work. Here's what to try...` |
| 加载中 | 安抚式：`Saving your work...` |
| 危险确认 | 严肃、明确：`Delete this project? This can't be undone.` |

**不要拿错误提示开玩笑。** 用户本来就已经烦了，给帮助，不要卖萌。

## 为无障碍而写

**链接文案** 必须脱离上下文也有意义，例如 `View pricing plans`，不要写 `Click here`。**Alt text** 要描述信息，而不是描述“这是一张图”，例如 `Revenue increased 40% in Q4`，不要写 `Chart`。纯装饰图应使用 `alt=""`。图标按钮必须带 `aria-label`，为读屏器提供语境。

## 为翻译而写

### 预留扩展空间

德语通常比英语长约 30%。界面需要预留空间：

| 语言 | 扩展幅度 |
|------|----------|
| 德语 | +30% |
| 法语 | +20% |
| 芬兰语 | +30-40% |
| 中文 | -30%（字符少，但宽度不一定更小） |

### 更利于翻译的写法

把数字和句子结构拆开考虑。例如 `New messages: 3` 通常比 `You have 3 new messages` 更稳。整句话应尽量作为一个完整字符串，不要把词拆碎，因为不同语言的语序差异很大。避免缩写，例如写 `5 minutes ago`，不要写 `5 mins ago`。还要给翻译者上下文，告诉他们这些文案出现在哪里。

## 一致性：术语问题

选一个词，就始终用它：

| 不一致 | 一致 |
|--------|------|
| Delete / Remove / Trash | Delete |
| Settings / Preferences / Options | Settings |
| Sign in / Log in / Enter | Sign in |
| Create / Add / New | Create |

建立术语表，并严格执行。术语上的“花样”只会制造困惑。

## 避免冗余文案

如果标题已经说明白了，前言往往就是重复。如果按钮已经足够清楚，就不要再解释一遍。说一次，说准确。

## Loading 状态

要具体。用 `Saving your draft...`，不要只写 `Loading...`。如果等待较长，要么告诉用户预期时间（例如 “This usually takes 30 seconds”），要么展示进度。

## 确认对话框：少用

多数确认弹窗本质上是设计失败，更好的方式往往是支持撤销。真的必须确认时：

- 把动作写清楚
- 把后果说清楚
- 按钮文案要具体，例如 `Delete project` / `Keep project`，不要只写 `Yes` / `No`

## 表单说明

格式提示优先放进 placeholder，而不是额外写一段说明。对于那些不显而易见的字段，则要解释为什么你要问。

---

**避免：** 不解释的术语；责怪用户（例如 “You made an error” 不如 “This field is required”）；模糊错误（“Something went wrong”）；为了“变化”而乱换术语；在错误里讲笑话。