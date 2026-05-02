---
name: finance-based-pricing-advisor
description: 用 ARPU、转化率、流失风险、NRR 和回本周期评估定价调整。适用于判断某个定价动作是否应该上线。
intent: >-
  使用 ARPU/ARPA 分析、转化影响、流失风险、NRR 影响以及 CAC 回收期影响，评估定价变更（涨价、新 tier、add-on、折扣）的**财务影响**。用它对拟议的定价变更做出基于数据的 go/no-go 判断，并给出配套计算与风险评估。
type: interactive
best_for:
  - "评估涨价、折扣或新套餐"
  - "在定价变更前估算流失和转化风险"
  - "对变现变更做出上线/不上线决策"
scenarios:
  - "下季度我们应该对新客户涨价15%吗？"
  - "评估为我们的 SaaS 产品推出新的高级套餐"
  - "帮我评估年度折扣是否会提升收入"
---


## 目的

使用 ARPU/ARPA 分析、转化影响、流失风险、NRR 影响以及 CAC 回收期影响，评估定价变更（涨价、新 tier、add-on、折扣）的**财务影响**。用它对拟议的定价变更做出基于数据的 go/no-go 判断，并给出配套计算与风险评估。
**这是什么：** 对你已经在考虑的定价决策做财务影响评估。
**这不是什么：** 不是完整的 pricing strategy 设计，不是 value-based pricing framework，不是 willingness-to-pay research，不是 competitive positioning，不是 psychological pricing，不是 packaging architecture，也不是 monetization model selection。若是这些主题，请看未来的 `pricing-strategy-suite` skills。
这个 skill 假设你已经有一个明确的定价变更想法，现在要评估它在财务上是否可行。
## 关键概念

### Pricing Impact Framework

用来从财务角度评估定价变更的一套系统方法：

1. **Revenue Impact** - 这个变化会如何影响 ARPU/ARPA？
   - 涨价带来的直接收入提升
   - 转化下降或流失上升带来的收入损失
   - 净收入影响

2. **Conversion Impact** - 它会如何影响 trial-to-paid 或销售转化？
   - 更高价格可能降低 conversion rate
   - 更好的 packaging 可能提升转化
   - 这些都要验证假设

3. **Churn Risk** - 现有客户会不会因价格变化而流失？
   - grandfathering 策略（保护老客户）
   - 分 segment 的 churn risk（SMB vs. enterprise）
   - churn elasticity（客户对价格有多敏感）

4. **Expansion Impact** - 它会创造还是阻碍扩张机会？
   - 新 premium tier = upsell 路径
   - usage-based pricing = 客户增长时自然扩张
   - add-ons = cross-sell 机会

5. **CAC Payback Impact** - 定价变化会不会影响 unit economics？
   - 更高 ARPU = 更快 payback
   - 更低转化 = 更高的有效 CAC
   - 对 LTV:CAC ratio 的净影响

### Pricing Change Types

**直接 monetization 变更：**
- 涨价（对所有客户涨价，或只对新客户涨价）
- 新 premium tier（建立 upsell 路径）
- 付费 add-on（把原本免费的功能单独收费）
- usage-based pricing（按用量收费）

**折扣策略：**
- 年付折扣（改善现金流）
- 量大折扣（做更大单）
- 促销定价（临时降价）

**Packaging 变更：**
- Feature bundling（把功能打包进不同 tier）
- Unbundling（把功能拆成 add-on）
- 定价 metric 变化（seats -> usage，或反过来）

### 反模式（它不是什么）

- **不是 value-based pricing：** 这个 skill 是评估某个已提出的变更，不是回答“我们该收多少钱？”
- **不是 WTP research：** 它分析影响，不是回答“客户愿意付多少钱？”
- **不是 competitive positioning：** 这是财务分析，不是市场定位分析
- **不是 packaging architecture：** 它评估单个变化，不是重做整套 tier 设计

### 何时使用这个框架

**适合使用的情况：**
- 你已经有一个明确的定价变更要评估（比如“要不要涨价 20%？”）
- 你需要量化 revenue、churn 和 conversion 之间的权衡
- 你在多个定价方案之间做选择（test A vs. B）
- 你需要向 leadership 或 board 展示定价变更的影响

**不适合使用的情况：**
- 你是在从零设计 pricing strategy（应使用 value-based pricing frameworks）
- 你还没验证 willingness-to-pay（先做 customer research）
- 你没有 baseline metrics（ARPU、churn、conversion rates）
- 变动太小，不足以产生实际影响（<5% 涨价，或影响客户 <10%）

---

### 交互唯一准绳

Use [`workshop-facilitation`](../workshop-facilitation/SKILL.md) as the default interaction protocol for this skill.

It defines:
- session heads-up + entry mode (Guided, Context dump, Best guess)
- one-question turns with plain-language prompts
- progress labels (for example, Context Qx/8 and Scoring Qx/5)
- interruption handling and pause/resume behavior
- numbered recommendations at decision points
- quick-select numbered response options for regular questions (include `Other (specify)` when useful)

This file defines the domain-specific assessment content. If there is a conflict, follow this file's domain logic.

## 应用

这个 interactive skill 会问**最多 4 个自适应问题**，并在决策点提供 **3-5 个编号选项**。
---

### 第 0 步：收集上下文

**Agent asks:**

“我们来评估这个定价变更的财务影响。请提供：
**当前定价：**
- 当前 ARPU 或 ARPA
- 当前 pricing tiers（如果适用）
- 当前月 churn rate
- 当前 trial-to-paid conversion rate（如果相关）

**拟议中的定价变更：**
- 你在考虑什么变化？（涨价、新 tier、add-on 等）
- 新价格（如果已知）
- 受影响的客户 segment（全部、新客户、特定 tier）

**业务背景：**
- 总客户数（或 MRR/ARR）
- CAC（用于评估 payback 影响）
- NRR（用于评估 expansion 背景）

如果没有精确数字，也可以给估值。”

---

### 第 1 步：Identify Pricing Change Type

**Agent asks:**

“你在考虑的是哪一种定价变更？

1. **Price increase** - 给新客户、老客户或两者涨价
2. **New premium tier** - 增加更高价的新 tier，并附带额外功能
3. **Paid add-on** - 将新的或已有功能单独收费
4. **Usage-based pricing** - 按用量收费（seats、API calls、storage 等）
5. **Discount strategy** - 年付折扣、量大定价或促销定价
6. **Packaging change** - 重组功能打包、改变定价 metric，或重做 tier 结构

选一个数字，或直接描述你的具体定价变更。”

**Based on selection, agent adapts questions:**

---

#### If Option 1 (Price Increase):

**Agent asks:**

“**涨价细节：**

- 当前价格：$___
- 新价格：$___
- 涨幅：___%

**谁会受影响？**
1. 仅新客户（老客户 grandfather）
2. 所有客户（老客户 + 新客户）
3. 特定 segment（如仅 SMB、仅新 plan）

**何时生效？**
- 立即
- 下个 billing cycle
- 渐进式 rollout（先测试）”

---

#### If Option 2 (New Premium Tier):

**Agent asks:**

“**Premium tier 细节：**

- 当前最高 tier 价格：$___
- 新 premium tier 价格：$___
- premium tier 的关键功能：[list]

**预期采用率：**
- 当前客户中预计有多少 % 会升级？___%
- 新客户中预计有多少 % 会直接选 premium？___%

**Cannibalization risk：**
- premium tier 会不会蚕食当前最高 tier？”

---

#### If Option 3 (Paid Add-On):

**Agent asks:**

“**Add-on 细节：**

- Add-on 名称：___
- 价格：$___ /month 或 /user
- 现在是免费功能，还是新功能？

**预期采用率：**
- 预计有多少 % 的客户愿意为它付费？___%
- 如果它原来免费，现在是否已被广泛使用？
- 改成付费后会不会伤害 retention？”

---

#### If Option 4 (Usage-Based Pricing):

**Agent asks:**

“**Usage pricing 细节：**

- 用量 metric：（seats、API calls、storage、transactions 等）
- 定价：每 [unit] $___
- 是否有 free tier 或最低消费？（例如前 1,000 次 API calls 免费）

**预期影响：**
- 平均客户用量：___ units/month
- 预期 ARPU 变化：current -> $new

**Expansion potential：**
- 客户用量增长时，ARPU 会不会跟着提升？”

---

#### If Option 5 (Discount Strategy):

**Agent asks:**

“**折扣细节：**

- 折扣类型：（年付预付、量大折扣、促销）
- 折扣幅度：___% off
- 持续时间：（长期、限时）

**Trade-off：**
- 更低价格 vs. 更好的现金流（年付预付）
- 更低价格 vs. 更大的 deal size（量大）
- 更低价格 vs. 更强的紧迫感（促销）”

---

#### If Option 6 (Packaging Change):

**Agent asks:**

“**Packaging change 细节：**

- 你要改什么？（bundling、unbundling、pricing metric）
- 当前 packaging：[describe]
- 新 packaging：[describe]

**预期影响：**
- ARPU 变化：current -> $new
- Conversion 变化：___% -> ___%
- Churn risk：（low、medium、high）”

---

### 第 2 步：Assess Expected Impact

**Agent asks:**

“现在我们把影响量化一下。基于这个定价变更，请估算：

**Revenue impact：**
- 当前 ARPU：$___
- 预计新 ARPU：$___
- ARPU 提升：___%

**Conversion impact：**
- 当前 conversion rate：___%
- 预计新 conversion rate：___%
- Conversion 变化：[increase / decrease / no change]

**Churn risk：**
- 当前月 churn：___%
- 变更后预期 churn：___%
- Churn risk：[low / medium / high]

**Expansion impact：**
- 它会不会创造扩张机会？（比如可升级的新 tier、usage 增长）
- 预期 NRR 变化：___% -> ___%

可以给估值。我们会建 conservative、base、optimistic 三种情景模型。”

---

### 第 3 步：Evaluate Current State

**Agent asks:**

“为了判断这个定价变更是否合理，我需要你当前的 baseline：
**当前指标：**
- MRR 或 ARR：$___
- 客户数：___
- ARPU/ARPA：$___
- 月 churn rate：___%
- NRR：___%
- CAC：$___
- LTV：$___

**增长背景：**
- 当前增长率：___% MoM 或 YoY
- 目标增长率：___%

**竞争背景：**
- 你的定价低于、接近还是高于市场？
- Competitive pressure：（low、medium、high）”

---

### 第 4 步：Deliver Recommendations

**Agent synthesizes:**
- Revenue impact（ARPU lift x customer base）
- Conversion impact（受影响的新客户）
- Churn impact（受影响的老客户）
- Net revenue impact
- CAC payback impact
- Risk assessment

**Agent offers 3-4 recommendations:**

---

#### Recommendation Pattern 1: Implement Broadly

**When:**
- Net revenue impact 明显为正（>10% ARPU lift，<5% churn risk）
- Conversion impact 很小
- Value justification 充分

**Recommendation:**

“**实施这个定价变更** - 财务理由充分

**Revenue Impact：**
- 当前 MRR：$___
- ARPU 提升：___%（current -> $new）
- 预期 MRR 增长：$___/month（___%）

**Churn Risk：Low**
- 预期 churn 增加：___% -> ___%（___ 个百分点）
- 因 churn 导致的 MRR 损失：$___/month
- **净 MRR 影响：$___/month**

**Conversion Impact：**
- 当前 conversion：___%
- 预计 conversion：___%（变化 ___%）
- 对新客户获取的影响：[minimal / manageable]

**CAC Payback Impact：**
- 当前 payback：___ 个月
- 新 payback：___ 个月（因 ARPU 提升而更快）

**为什么这样可行：**
[基于数字的具体推理]

**如何实施：**
1. **Grandfather 现有客户**（如果你在涨价）
   - 保护现有客户群，避免 churn
   - 新价格只给新客户
2. **清晰传达价值**
   - 强调功能、结果和 ROI
   - 用已交付的价值来支撑价格
3. **监控指标（前 30-60 天）**
   - Conversion rate（应保持在 ___% 范围内）
   - Churn rate（应保持 <___%）
   - Customer feedback

**预期时间线：**
- Month 1：新客户带来 +$___ MRR
- Month 3：累计 +$___ MRR
- Month 6：$___ MRR
- Year 1：$___ ARR

**成功标准：**
- Conversion rate 保持 >___%
- Churn rate 保持 <___%
- NRR 提升到 >___%”

---

#### Recommendation Pattern 2: Test First (A/B Test)

**When:**
- 影响不确定（conservative 和 optimistic 差距很大）
- 存在中等程度的 churn 或 conversion 风险
- 客户基数足够大，可以分组测试

**Recommendation:**

“**先在一个 segment 上测试，再决定是否全面 rollout** - 影响仍不确定

**为什么要测：**
- ARPU lift 估算：___%（置信区间较宽）
- Churn risk：Medium（___% -> ___%）
- Conversion impact：不确定（预计 ___% -> ___%）

**测试设计：**

**Cohort A（Control）：**
- 当前定价：$___
- 样本量：新客户的 ___%（或 ___ 个客户）

**Cohort B（Test）：**
- 新定价：$___
- 样本量：新客户的 ___%（或 ___ 个客户）

**时长：** 60-90 天（需要统计显著性）

**要跟踪的指标：**
- Conversion rate（A vs. B）
- ARPU（A vs. B）
- 30-day retention（A vs. B）
- 90-day churn（A vs. B）
- NRR（A vs. B）

**决策标准：**

**满足以下条件就全面 rollout：**
- Conversion rate（B）≥ control（A）的 ___%
- Churn rate（B）比 control 高得不超过 ___%
- Net revenue（B）比 control 高 ___% 以上

**以下情况不要 rollout：**
- Conversion 下降 >___%
- Churn 上升 >___%
- Net revenue impact 为负

**预期时间线：**
- Week 1-2：上线测试
- Week 8-12：累积足够数据得到统计显著性
- Month 3：决定 rollout 或终止

**风险：** Medium。测试能在大规模 rollout 前先对冲风险。”

---

#### Recommendation Pattern 3: Modify Approach

**When:**
- 原方案风险较大
- 存在更好的替代方案
- 需要调整定价方式来改善结果

**Recommendation:**

“**调整方案** - 原始提案存在风险

**原始提案：**
- [Price increase / New tier / Add-on / etc.]
- 预计 ARPU 提升：___%
- Churn risk：High（___% -> ___%）
- Net revenue impact：不确定或为负

**问题：**
[具体问题，例如：“20% 涨价很可能导致 10% churn，抵消收入增长”]

**替代方案：**

**Option 1：更小幅度涨价**
- 不涨 ___%，改为涨 ___%
- 更低的 churn risk（___% vs. ___%）
- 仍有正向净收入：$___/month

**Option 2：老客户 grandfather，只对新客户涨价**
- 保护现有 base（零 churn risk）
- 只对新客户提价
- ARPU 随时间逐步改善

**Option 3：value-based pricing（对高价值 segment 多收）**
- SMB 定价不变
- Enterprise 定价上调 ___%
- 更低的 churn risk（enterprise 更稳定）

**推荐：**
[带理由的具体方案]

**为什么更好：**
- Churn risk 更低
- 收入上行空间相近
- 更容易对外沟通

**如何实施：**
[替代方案的具体步骤]”

---

#### Recommendation Pattern 4: Don't Change Pricing

**When:**
- Net revenue impact 为负或非常有限
- Churn risk 高，且没有足够收益对冲
- 出于竞争或战略原因不适合动价格

**Recommendation:**

“**不要改定价** - 风险大于收益

**原因：**
- 预期收入提升：$___/month（___%）
- 预期 churn 影响：$___/month（___%）
- **净收入影响：$___/month** 或仅为边际改善

**问题：**
[具体问题，例如：“因 churn 导致的收入损失超过了涨价收益”]

**若想让涨价成立，需要满足：**

**要让涨价可行：**
- Churn rate 必须低于 ___%（当前是 ___%）
- 或 conversion rate 必须高于 ___%（当前是 ___%）
- 或你需要降低 CAC，来对冲 conversion 下降

**替代策略：**

**相比涨价，更值得做的是：**
1. **先改善 retention** - 把 churn 从 ___% 降到 ___%（收入影响相近，但风险更低）
2. **从现有客户中做扩张** - 通过 upsell 把 NRR 从 ___% 提高到 ___%
3. **降低 CAC** - 提升获客效率（通常比直接改价更好）

**何时再重新评估定价：**
- retention 改善后（churn <___%）
- willingness-to-pay 验证完成后（WTP research）
- 竞争格局变化后

**结论：** 当前先维持价格，把重点放在 [retention / expansion / acquisition efficiency]。”

---

### 第 5 步：Sensitivity Analysis (Optional)

**Agent offers:**

“想看 if-what 场景吗？1. **乐观情况** - 更高的 ARPU 提升、更低的流失率
2. **悲观情况** - 更低的 ARPU 提升、更高的流失率
3. **盈亏平衡分析** - 流失率达到多少会让这次变更刚好打平？

或者你也可以继续追问。

**Agent 可以提供：**
- 情景建模（乐观 / 悲观 / 盈亏平衡）
- 敏感性表格（如果流失率是 X%，收入影响就是 Y）
- 与其他定价策略的比较

---

## 示例

示例对话流程请见 `examples/` 文件夹。下面是简短示例：

### 示例 1：涨价（良好情况）

**场景：** 仅对新客户涨价 20%

**当前状态：**
- ARPU：$100/月
- 客户数：1,000
- MRR：$100K
- 流失率：5%/月
- 每月新客户：50

**拟议变更：**
- 新客户价格：$120/月（+20%）
- 现有客户：继续保持 $100

**影响：**
- 新客户 ARPU：$120（+20%）
- 流失风险：低（老客户已受保护）
- 转化影响：很小（预计下降 <5%）

**建议：** 可以实施。净收入影响 +$12K/年，风险较低。

---

### 示例 2：涨价（高风险）

**场景：** 对所有客户涨价 30%

**当前状态：**
- ARPU：$50/月
- 客户数：5,000
- MRR：$250K
- 流失率：7%/月（本来偏高）

**拟议变更：**
- 所有客户：$65/月（+30%）

**影响：**
- ARPU 提升：30% = +$75K MRR
- 流失风险：高（7% -> 预计 8%）
- 因流失带来的损失：3% x 5,000 x $65 = -$9.75K MRR/月

**净影响：** +$75K - $9.75K = +$65K MRR（但会加剧流失问题）

**建议：** 不建议改价。先改善留存（先把 7% 流失率降下来），再谈涨价。

---

### 示例 3：新增高级层级

**场景：** 增加一个 $500/月的高级层级

**当前状态：**
- 最高层级：$200/月，100 位客户
- ARPA：$200

**拟议变更：**
- 新层级：$500/月，附带高级功能
- 预期采用率：当前最高层级客户中 10% 会升级（50 位客户）

**影响：**
- 追加销售营收：50 x ($500 - $200) = +$15K MRR
- 蚕食风险：低（高级功能足以支撑溢价）
- NRR 影响：从 105% 提升到 110%

**建议：** 可以实施。它建立了扩张路径，同时蚕食风险很低。

---

## 常见陷阱

### 陷阱 1：忽视流失影响
**症状：** “我们涨价 30%，就能多赚 $X！”（完全没有建立流失模型）
**后果：** 流失吞噬了收入增长，净影响转负。
**修正：** 建立流失情景模型（保守、基准、乐观），把流失导致的收入损失算进净影响。

---

### 陷阱 2：不保护现有客户
**症状：** “我们要立刻给所有客户涨价”
**后果：** 老客户觉得被背叛，流失激增。
**修正：** 保护现有客户。涨价先只对新客户生效。

---

### 陷阱 3：测试缺乏统计效力
**症状：** “我们测了 10 个客户，结果很好！”
**后果：** 10 个客户没有统计意义，结果只是噪音。
**修正：** 用足够大的样本量测试（每个队列 100+ 客户），并持续 60-90 天。

---

### 陷阱 4：涨价缺乏价值支撑
**症状：** “我们要涨价，因为我们需要更多收入”
**后果：** 客户只看到价格上涨，看不到价值提升，于是流失。
**修正：** 把涨价和价值提升绑定起来（新功能、更好的支持、交付成果）。

---

### 陷阱 5：忽视 CAC 回收期影响
**症状：** “ARPU 变高肯定更好！”
**后果：** 如果转化率掉了 30%，有效 CAC 会急剧升高，回收期反而变差。
**修正：** 计算 CAC 回收期的影响。更高 ARPU 配上更低转化率，可能会让回收期更差而不是更好。

---

### 陷阱 6：年付折扣损害利润
**症状：** “年付给 30% 折扣！”（现金流变好，但 LTV 被破坏）
**后果：** 客户锁定低价一年，单客收入下降。
**修正：** 年付折扣控制在 10-15%。兼顾现金流提升与 LTV 保护。

---

### 陷阱 7：模仿定价（基于竞争对手）
**症状：** “竞品涨价了，所以我们也该涨”
**后果：** 你的客户、价值主张和成本结构都不同，别人适用的不一定适合你。
**修正：** 竞品只能作为参考数据点，不能直接替你做决定。定价决策仍应回到你的单位经济学。

---

### 陷阱 8：过早优化
**症状：** “我们来 A/B 测试 47 个价格点！”
**后果：** 陷入分析瘫痪，在 5% 的定价小优化上浪费几个月，却错过其他 50% 的增长机会。
**修正：** 层级、打包、附加组件这类大的定价变化，通常比微调更重要。先从这里开始。

---

### 陷阱 9：忘记扩张收入
**症状：** “我们要在获客阶段就把 ARPU 最大化”
**后果：** 入门价格过高，导致客户根本进不来，错失后续扩张机会。
**修正：** 考虑“先落地再扩张”策略。更低的入门价，配合追加销售带来的更高扩张收入。

---

### 陷阱 10：没有定价变更沟通计划
**症状：** “下个月我们要涨价”（没有任何客户沟通计划）
**后果：** 客户被突然袭击，直接流失；差评与口碑损伤也会跟着来。
**修正：** 提前 30-60 天沟通定价变化。强调价值，不要只讲价格。

---

## 参考

### 相关技能
- `saas-revenue-growth-metrics` - 定价分析中会用到的 ARPU、ARPA、churn、NRR 指标
- `saas-economics-efficiency-metrics` - 定价变更对 CAC 回收期的影响
- `finance-metrics-quickref` - 快速查找与定价相关的公式
- `feature-investment-advisor` - 评估是否值得做支持定价变更的功能
- `business-health-diagnostic` - 为定价决策补充更广的业务背景

### 外部框架（全面定价策略）
以下内容**不在本技能范围内**，但和更完整的定价工作相关：

- **基于价值的定价** - 按交付价值定价，而不是按成本
- **Van Westendorp 价格敏感度** - WTP 研究方法
- **联合分析** - 功能与价格权衡研究
- **好-更好-最好打包** - 层级结构设计
- **价格锚定与诱饵定价** - 心理定价手法
- **Patrick Campbell (ProfitWell):** 定价研究与基准

### 未来技能（全面定价）
针对这里**未涵盖**的主题，可参考未来的 `pricing-strategy-suite`：
- `value-based-pricing-framework` - 如何按价值定价
- `willingness-to-pay-research` - WTP 研究方法
- `packaging-architecture-advisor` - 层级与捆绑设计
- `pricing-psychology-guide` - 锚定、诱饵、框架
- `monetization-model-advisor` - 按席位、用量、结果定价的选择

### 出处
- 改编自 `research/finance/Finance_For_PMs.Putting_It_Together_Synthesis.md`（决策框架 #3）
- 定价场景来自 `research/finance/Finance for Product Managers.md`