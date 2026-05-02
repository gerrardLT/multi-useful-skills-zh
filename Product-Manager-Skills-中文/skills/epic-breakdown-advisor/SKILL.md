---
name: epic-breakdown-advisor
description: 用 Humanizing Work 的拆分模式把 epic 拆成 user stories。适用于 backlog 项过大，无法安全估算、排序或交付时。
intent: >-
  引导产品经理使用 Richard Lawrence 完整的 Humanizing Work 方法论将史诗拆分为用户故事——这是一种系统化、基于流程图的方法，会按顺序应用 9 种拆分模式。用它来识别适用的模式，在保留用户价值的前提下进行拆分，并根据拆分后暴露出的低价值工作来评估是否可以削减。这确保了垂直切片（端到端价值），而非水平切片（技术分层）。
type: interactive
best_for:
  - "将史诗拆分为更小的垂直切片"
  - "为大型待办项选择合适的故事拆分模式"
  - "将模糊的功能块转化为冲刺大小的故事"
scenarios:
  - "将这个入职史诗拆分为更小的用户故事"
  - "在冲刺规划前帮我拆分一个大型报告功能"
  - "对于这个管理工作流史诗，我应该使用哪种故事拆分模式？"
---


## 目的
使用 Richard Lawrence 完整的 Humanizing Work 方法，帮助产品经理把 epic 拆成 user stories：这是一套系统化、基于流程图的方式，会按顺序应用 9 种拆分模式。用它来识别该用哪种模式、在保留用户价值的前提下拆分，并根据拆分后暴露出的低价值工作来评估是否可以削减。这样可以确保做的是 vertical slicing（端到端价值），而不是 horizontal slicing（技术分层拆法）。
这不是随意切块，而是一套经过验证的、方法论明确的流程：先做验证，再按顺序过模式，最后从战略角度评估拆分结果。
## 关键概念

### Core Principles: Vertical Slices Preserve Value
User story 是“从用户视角描述系统行为变化的一段表述”。拆分时必须保留 **vertical slices**，也就是会跨越多个架构层、同时能交付可观察用户价值的工作，而不是拆成只覆盖单个组件的 horizontal slices（例如 “front-end story” + “back-end story”）。
### Three-Step Process
1. **Pre-Split Validation:** 先看 story 是否满足 INVEST（除了 `Small`）。
2. **Apply Splitting Patterns:** 按顺序尝试 9 种拆分模式，直到某一种匹配。
3. **Evaluate Splits:** 选择最能暴露低价值工作、或能拆出更均衡 stories 的方案。
### 9 Splitting Patterns (In Order)
1. **Workflow Steps** - 薄的端到端切片，不是按步骤切块。
2. **Operations (CRUD)** - 把 Create、Read、Update、Delete 拆开。
3. **Business Rule Variations** - 不同业务规则 = 不同 story。
4. **Data Variations** - 不同数据类型/结构。
5. **Data Entry Methods** - 先做简单 UI，再做复杂 UI。
6. **Major Effort** - “先实现一个，再补剩下的”。
7. **Simple/Complex** - 先做最简单核心版，再加复杂变体。
8. **Defer Performance** - 先 “make it work”，再 “make it fast”。
9. **Break Out a Spike** - 不确定性大到挡住拆分时，先做 time-boxed investigation。

### Meta-Pattern (Applies Across All Patterns)
1. 找出核心复杂度。
2. 列出所有变体。
3. 缩减为**一个完整切片**。
4. 把其他变体拆成独立 stories。

### 为什么这有效
- **Prevents arbitrary splitting:** 有方法可依，不靠拍脑袋。
- **Preserves user value:** 每个 story 都必须交付可观察价值。
- **Reveals waste:** 好的拆分能让低价值工作自己浮出来。
- **Repeatable:** 任何 epic 都可以一致应用。
---

### 交互唯一准绳

使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为这个 skill 的默认交互协议。
它定义了：
- session heads-up + entry mode (Guided, Context dump, Best guess)
- one-question turns with plain-language prompts
- progress labels (for example, Context Qx/8 and Scoring Qx/5)
- interruption handling and pause/resume behavior
- numbered recommendations at decision points
- quick-select numbered response options for regular questions (include `Other (specify)` when useful)

这个文件定义的是领域内的评估内容。如有冲突，以本文件的领域逻辑为准。
## 应用

### 第 0 步：Provide Epic Context

**Agent asks:**

请先给出你的 epic：
- Epic title/ID
- Description 或 hypothesis
- Acceptance criteria（尤其是多个 `When/Then` 对）
- Target persona
- Rough estimate

**你可以直接贴 Jira、Linear 内容，或者简要描述。**

---

### 第 1 步：Pre-Split Validation (INVEST Check)

**在正式拆分前，先验证这条 story 是否满足 INVEST（除了 `Small`）：**

**Agent asks questions sequentially:**

**1. Independent?**
“这条 story 是否可以在没有强技术前置依赖的情况下被独立排优先级和开发？”

**Options:**
- Yes - 没有阻塞性依赖。
- No - 依赖其他工作先做（需要标出来）。
---

**2. Negotiable?**
“这条 story 是否仍然给团队留出了协作探索实现细节的空间，而不是把实现方式写死？”

**Options:**
- Yes - 它是对话起点，不是死板规格。
- No - 它太 prescriptive 了（可能得先重写）。
---

**3. Valuable?**
“这条 story 是否能给用户带来可观察价值？（如果不能，不要拆，应该和相关工作合并成一个有意义的增量。）”

**Options:**
- Yes - 用户能感知到某种变化。
- No - 这只是技术任务（不是 user story，不该拆，应该重构）。

**Critical Check:** 如果不满足 `Valuable`，立刻停止。不要拆。应该和其他工作合并，先形成一个有意义的增量。
---

**4. Estimable?**
“你的团队能不能对这条 story 做相对估算？哪怕只是粗估？”

**Options:**
- Yes - 团队能估 days/points。
- No - 不确定性太大（可能得先做 spike）。
---

**5. Testable?**
“这条 story 是否有 QA 能明确验证的 acceptance criteria？”

**Options:**
- Yes - 有清晰的 pass/fail 条件。
- No - 需要先把 acceptance criteria 写清楚，再来拆。
---

**If story passes all checks -> Proceed to Step 2 (Splitting Patterns)**
**If story fails any check -> Fix the issue before splitting**

---

### 第 2 步：Apply Splitting Patterns Sequentially

按顺序过这些模式。对每一个模式都问：“它适用吗？”
---

### Pattern 1: Workflow Steps

**Key insight:** 拆成**薄的端到端切片**，而不是按步骤逐段切。先交付一个覆盖**完整 workflow** 的简单路径，再把中间步骤作为后续 story 叠加。
**Agent asks:**
“你的 epic 是不是一个多步骤 workflow，而且可以先交付一个简单路径，再逐步补中间步骤？”

**Example:**
- **Original:** “Publish content (requires editorial review, legal approval, staging)”
- **Wrong split (step-by-step):** Story 1 = Editorial review，Story 2 = Legal approval，Story 3 = Publish
- **Right split (thin end-to-end):**
  - Story 1: Publish content (simple path: author uploads, content goes live immediately - no reviews)
  - Story 2: Add editorial review step
  - Story 3: Add legal approval step

**每条 story 都交付完整 workflow**，只是复杂度逐步提高。
**Options:**
1. **Yes, multi-step workflow** -> “请描述 workflow steps”。
2. **No, single step** -> 继续 Pattern 2。

**If YES:** agent 生成 thin end-to-end split。
---

### Pattern 2: Operations (CRUD)

**Key insight:** 如果 epic 里出现 `manage` 之类词，通常意味着多个 operation 混在一起。拆成 Create、Read、Update、Delete。
**Agent asks:**
“你的 epic 里有没有 `manage`、`handle`、`maintain` 这类词？如果有，通常说明里面捆了多个 operation（CRUD）。”

**Example:**
- **Original:** “Manage user accounts”
- **Split:**
  - Story 1: Create user account
  - Story 2: View user account details
  - Story 3: Edit user account info
  - Story 4: Delete user account

**Options:**
1. **Yes, contains multiple operations** -> “列出这些 operations（Create/Read/Update/Delete/...）”。
2. **No, single operation** -> 继续 Pattern 3。

**If YES:** agent 按 operation 一条条生成 stories。
---

### Pattern 3: Business Rule Variations

**Key insight:** 当同样功能在不同规则下运行时，不同规则就是不同 story。
**Agent asks:**
“这个 epic 是否对不同场景有不同 business rules（用户类型、地区、套餐、条件）？”

**Example:**
- **Original:** “Flight search with flexible dates (date range, specific weekends, date offsets)”
- **Split:**
  - Story 1: Search by date range (+/- N days)
  - Story 2: Search by specific weekends only
  - Story 3: Search by date offsets (N days before/after)

**Options:**
1. **Yes, different rules** -> “请描述这些 rule variations”。
2. **No, same rules for all** -> 继续 Pattern 4。

**If YES:** agent 按规则变化逐条拆 story。
---

### Pattern 4: Data Variations

**Key insight:** 复杂度来自不同 data types 或 structures。应按需逐步增加变体，而不是一开始就全做。
**Agent asks:**
“这个 epic 是否要处理不同数据类型、格式或结构（例如文件类型、地理层级、用户属性）？”

**Example:**
- **Original:** “Geographic search (counties, cities/towns/neighborhoods, custom provider areas)”
- **Split:**
  - Story 1: Search by county
  - Story 2: Add city/town/neighborhood search
  - Story 3: Add custom provider area search

**Options:**
1. **Yes, different data types** -> “列出这些数据变体”。
2. **No, single data type** -> 继续 Pattern 5。

**If YES:** agent 按数据变体拆 story，先交付最简单的。
---

### Pattern 5: Data Entry Methods

**Key insight:** UI 复杂度和核心功能是两回事。先交付最简单输入方式，之后再补复杂 UI。
**Agent asks:**
“这个 epic 是否包含一些并非核心必要、但会显著增加复杂度的 fancy UI（比如 date picker、autocomplete、drag-and-drop）？”

**Example:**
- **Original:** “Search with calendar date picker”
- **Split:**
  - Story 1: Search by date (basic text input: `YYYY-MM-DD`)
  - Story 2: Add visual calendar picker UI

**Options:**
1. **Yes, fancy UI elements** -> “描述这些 UI enhancements”。
2. **No, basic UI only** -> 继续 Pattern 6。

**If YES:** agent 生成 Story 1 = basic input，Story 2+ = UI enhancements。
---

### Pattern 6: Major Effort

**Key insight:** 当**第一版基础设施实现**承担了绝大部分复杂度，而后续扩展都很轻时，用“先实现一个 + 后续补剩下的”。
**Agent asks:**
“这个 epic 是否属于：第一版 infrastructure 很难，但加更多变体很容易？”

**Example:**
- **Original:** “Accept credit card payments (Visa, Mastercard, Amex, Discover)”
- **Split:**
  - Story 1: Accept Visa payments (先把完整支付基础设施建起来)
  - Story 2: Add Mastercard, Amex, Discover support（只是小扩展）
**Note:** 第一条 story 在做 heavy lift（payment gateway、安全、合规），后续都只是追加变体。
**Options:**
1. **Yes, major effort pattern** -> “哪一个是 first implementation？后续 additions 是什么？”
2. **No, no infrastructure work** -> 继续 Pattern 7。

**If YES:** agent 生成 Story 1 = infrastructure，Story 2 = add remaining。
---

### Pattern 7: Simple/Complex

**Key insight:** 问自己“最简单版本是什么？”先交付最简单、但仍然有价值的核心版，再把变体拆出去。
**Agent asks:**
“这个 epic 最简单、但仍然有价值的版本是什么？能不能先把复杂度剥掉，后面再补？”

**Example:**
- **Original:** “Flight search with max stops, nearby airports, flexible dates”
- **Split:**
  - Story 1: Basic flight search (origin, destination, date)
  - Story 2: Add max stops filter
  - Story 3: Add nearby airports option
  - Story 4: Add flexible dates option

**Options:**
1. **Yes, can identify simplest core** -> “描述 simplest version，以及后续要 defer 的变体”。
2. **No, it's already simple** -> 继续 Pattern 8。

**If YES:** agent 生成 Story 1 = simplest core，Story 2+ = variations。
---

### Pattern 8: Defer Performance

**Key insight:** 把“能工作”和“足够快”拆开。性能、安全、可扩展性等 non-functional requirements 可以放在功能交付之后。
**Agent asks:**
“能不能先交付 functional value，再在后续 story 里优化 performance / security / scalability？”

**Example:**
- **Original:** “Real-time search with <100ms response time”
- **Split:**
  - Story 1: Search works（先有功能，不承诺性能）
  - Story 2: Optimize search to <100ms（加缓存、索引等）
**Options:**
1. **Yes, can defer optimization** -> “functional version 是什么？optimization 是什么？”
2. **No, performance is essential** -> 继续 Pattern 9。

**If YES:** agent 生成 Story 1 = functional，Story 2 = optimize。
---

### Pattern 9: Break Out a Spike

**Key insight:** 当前 1-8 都不适用时，通常说明**不确定性大到挡住了拆分本身**。这时先做 spike。
**Agent says:**
“前 1-8 个模式都不适用，说明这里的核心问题是 **high uncertainty**。在拆分前，先跑一个 **spike** 来降低不确定性。”

**A spike is a time-boxed investigation (not a story), answering questions like:**
- 技术上可不可行？
- 多种实现路径里哪条更靠谱？
- 第三方 API 到底返回什么？

**Agent asks:**
“现在阻塞你拆这个 epic 的最大未知是什么？”

**Options:**
1. **Technical feasibility** - “用我们的技术栈能做出来吗？”
2. **Approach uncertainty** - “有好几种实现方式，不知道哪种最好”。
3. **External dependency** - “还不知道第三方 API 到底提供什么”。
**Agent recommends:**
-> “先跑一个 1-2 天的 spike，回答 [question]。完成后回来，我们再带着更好的理解继续拆分。”
**Spikes 产出的是 learning，不是 shippable code。做完 spike 之后，从 Pattern 1 重新开始。**

---

### 第 3 步：Evaluate Split Quality

**拆完后，用下面标准评估：**

**Agent asks:**

**1. 这次拆分是否暴露出了低价值工作，可以降级或删除？**
- 好的拆分会暴露 80/20：大部分价值常常集中在少数功能上。
- 例如：把 “Flight search” 拆成 4 条后，你发现 “flexible dates” 几乎没人用 -> 可以 defer 或 kill。

**2. 这次拆分是否让 stories 的大小更均衡？**
- 更均衡的故事能让 Product Owner 在优先级调整时更灵活。
- 例如：1 个 10 天 epic，不如拆成 5 个 2 天 stories。

**如果这次拆分不满足上述任一条，换一个 pattern 再试。**

---

### Meta-Pattern Application

**Across all patterns, follow this sequence:**
1. **Identify core complexity** - 真正难在哪？
2. **List variations** - 有哪些不同情况/规则/变体。
3. **Reduce to one complete slice** - 先选一个最简单、但仍完整的端到端价值切片。
4. **Make other variations separate stories** - 其他变体再拆成独立故事。
---

### Cynefin Domain Considerations

**拆法还要根据复杂度领域来调整。**

**Agent asks:**
“这个 epic 周围有多大不确定性？”

**Options:**File: Product-Manager-Skills-中文/skills/epic-breakdown-advisor/SKILL.md [chunk 2/2]
Rules:
- Only improve Chinese translation coverage in documentation.
- Keep required English technical terms when translating them would break meaning.
- Preserve formatting exactly.
- If the file is already properly translated, return it unchanged.

Document content:
1. **低不确定性（明显/复杂领域）** - “我们知道该做什么，只是工程量问题”   -> 找出所有故事，再按价值/风险排优先级

2. **高不确定性（复杂领域）** - “我们不确定客户真正想要什么，也不确定什么方案会有效”   -> 先识别 1-2 条 **learning stories**；不要急着把所有东西穷举出来（因为工作本身会教你什么最重要）
3. **混沌** - “一切都在着火，优先级每天都在变”   -> **先不要拆分**；先把系统稳定下来
---

### 输出：生成故事分解

```markdown
# 史诗分解计划

**史诗：** [原始史诗]
**拆分前验证：** 通过 INVEST（除 Small 外）
**应用的拆分模式：** [模式名称]
**理由：** [为何此模式适用]

---

## 故事分解

### 故事 1：[标题]（最简单的完整切片）

**摘要：** [以用户价值为中心的标题]

**用例：**
- **作为** [角色]
- **我想要** [操作]
- **以便** [结果]

**验收标准：**
- **假设：** [前置条件]
- **当：** [操作]
- **那么：** [结果]

**为何优先：** [交付核心价值；更简单的变体随后跟进]
**预估工作量：** [天数/点数]

---

### 故事 2：[标题]（第一个变体）

[重复...]

---

### 故事 3：[标题]（第二个变体）

[重复...]

---

## 拆分评估

**此次拆分是否揭示了低价值工作？**
- [分析：哪些故事可以被降级/消除？]

**此次拆分是否产生了大小相近的故事？**
- [分析：故事的工作量是否大致相等？]

---

## INVEST 验证（每个故事）

- **独立性：** 故事可以按任意顺序开发
- **可协商性：** 实现细节可以协作发现
- **价值性：** 每个故事都交付可观察的用户价值
- **可估性：** 团队可以估算每个故事的大小
- **小型化：** 每个故事在 1-5 天内完成
- **可测试性：** 每个故事都有明确的验收标准

---

## 后续步骤

1. **与团队评审：** PM、设计、工程是否一致认同？
2. **检查是否需要进一步拆分：** 如果仍有故事 >5 天，**从模式 1 重新开始**继续拆分。
3. **确定优先级：** 哪条故事最先交付价值？
4. **考虑消除：** 这次拆分是否暴露出可删除或后移的低价值工作？

---

**如果故事仍然太大，请从模式 1 开始重新应用拆分模式。**
```

---

## 示例

### 示例 1：应用模式 1（工作流步骤 - 薄端到端）

**史诗：** “发布博客文章（需要编辑审核、法律批准、暂存）”

**拆分前验证：** 通过 INVEST

**模式 1：** “这有工作流步骤吗？” -> 是

**错误拆分（逐步）：**
1. 编辑审核故事
2. 法律批准故事
3. 发布故事
-> 问题：故事 1 本身不交付用户价值。
**正确拆分（薄端到端）：**
1. **发布文章（简单路径）** - 作者上传，文章立即上线（无审核）。
2. **添加编辑审核** - 发布前必须先经编辑审核。
3. **添加法律批准** - 发布前必须经法律和编辑双重审核。

**为何有效：** 每条故事都交付**完整工作流**，只是复杂度逐步提高。
---

### 示例 2：应用模式 2（CRUD 操作）

**史诗：** “管理用户资料”

**模式 2：** “这说了‘管理’吗？” -> 是（通常就是 CRUD）。
**拆分：**
1. 创建用户资料
2. 查看用户资料详情
3. 编辑用户资料信息
4. 删除用户资料

**拆分评估：**
- **揭示低价值工作：** 分析后发现“删除资料”使用频率极低 -> 可以推迟。
- **大小相近的故事：** 每条 1-2 天。
---

### 示例 3：应用模式 7（简单/复杂）

**史诗：** “航班搜索（支持最大中转次数、附近机场、灵活日期）”

**模式 7：** “最简单的版本是什么？” -> 基础搜索。

**拆分：**
1. 基础航班搜索（出发地、目的地、日期） - **核心价值**
2. 添加最大中转次数过滤器 - **增强功能**
3. 添加附近机场选项 - **增强功能**
4. 添加灵活日期选项 - **增强功能**

**拆分评估：**
- **揭示低价值工作：** 用户研究显示“灵活日期”使用很少 -> 可以砍掉或推迟。
- **大小相近的故事：** 故事 1 = 3 天，后面各 1 天。
---

### 示例 4：迭代拆分（多模式应用）

**史诗：** “结账流程（含折扣：会员、VIP、首次；支付：Visa、Mastercard、Amex）”

**第一轮 - 模式 1（工作流）：** 是
- 故事 1：将商品加入购物车
- 故事 2：应用折扣
- 故事 3：完成支付

**检查故事 2（“应用折扣”）：** 仍然 >4 天 -> 继续拆分。
**对故事 2 进行第二轮 - 模式 3（业务规则）：** 是
- 故事 2a：应用会员折扣（10%）
- 故事 2b：应用 VIP 折扣（20%）
- 故事 2c：应用首次折扣（5%）

**检查故事 3（“完成支付”）：** 仍然 5 天 -> 继续拆分。
**对故事 3 进行第三轮 - 模式 6（主要工作量）：** 是
- 故事 3a：接受 Visa 支付（先建立支付基础设施）
- 故事 3b：添加 Mastercard、Amex 支持

**最终分解：** 6 条故事，每条都控制在 1-2 天。
---

## 常见陷阱

### 陷阱 1：跳过拆分前验证
**症状：** 不做 INVEST 检查，直接开始拆分。

**后果：** 很可能把一条根本不该拆的东西拆了（例如它根本不 `Valuable`，只是技术任务）。

**修复：** 一定要先完成步骤 1（INVEST），再进入步骤 2（拆分模式）。
---

### 陷阱 2：逐步工作流拆分（模式 1 应用错误）
**症状：** 故事 1 = “编辑审核”，故事 2 = “法律批准”。

**后果：** 每条故事都不交付端到端价值。
**修复：** 每条故事都必须覆盖**完整工作流**，只是在复杂度上逐步递进。
---

### 陷阱 3：水平切片（技术分层）
**症状：** “故事 1：构建 API。故事 2：构建 UI。”
**后果：** 两条故事都没有用户可感知的价值。
**修复：** 做“垂直切片”——每条故事都要包含前端 + 后端，交付可观察的用户行为。
---

### 陷阱 4：强行套用不合适的模式
**症状：** “虽然没有流程顺序，但我们还是按 workflow 拆。”
**后果：** 拆出来的东西会很随意，也没有意义。
**修复：** 如果某个模式不适用，就明确说“否”，然后继续下一个。
---

### 陷阱 5：不重新拆分过大的故事
**症状：** 史诗拆成了 3 条，但每条仍然 >5 天。
**后果：** 故事还是太大，无法进入 sprint。

**修复：** 对每条仍然过大的故事，**从模式 1 重新开始**继续拆分。
---

### 陷阱 6：忽略拆分评估（步骤 3）
**症状：** 只拆，不评估这次拆分有没有暴露低价值工作。
**后果：** 你会错过削减浪费的机会。
**修复：** 拆完后一定要问：“这次拆分有没有暴露出可以砍掉或推迟的工作？”
---

## 练习与技能发展

**人性化工作建议：** 团队通常需要 **2.5-3 小时**、分多次练习，才能真正熟练。
**练习方法：**
1. **回顾最近完成的功能**（回头看时，模式往往更明显）
2. **将已完成工作重新走一遍流程图** - 当时更适合哪个模式？
3. **为同一功能尝试多种拆法**
4. **建立团队共同词汇**，沉淀本领域常见的模式示例

**不要跳过练习。** 这种能力是通过复盘过去交付物长出来的，不是只靠想象未来工作。
---

## 参考

### 相关技能
- `user-story-splitting.md` - 9 种模式的详细说明
- `user-story.md` - 用户故事的书写格式
- `epic-hypothesis.md` - 原始史诗的表达方式
### 外部框架
- Richard Lawrence & Peter Green, *The Humanizing Work Guide to Splitting User Stories* - 完整方法论
- Bill Wake, *INVEST in Good Stories* (2003) - 故事质量标准

### 来源
- https://www.humanizingwork.com/the-humanizing-work-guide-to-splitting-user-stories/

---

**技能类型：** 交互式
**建议文件名：** `epic-breakdown-advisor.md`
**建议放置位置：** `/skills/interactive/`
**依赖：** 使用 `user-story-splitting.md`, `user-story.md`, `epic-hypothesis.md`