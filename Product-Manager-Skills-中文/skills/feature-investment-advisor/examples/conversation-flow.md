# 示例：Feature Investment Advisor 对话流程

这个示例展示了如何完整使用 feature-investment-advisor skill。
---

## 场景：评估一个 Time Tracking Add-On

### 第 0 步：Initial Request

**User:**
"我们该不该给项目管理工具做一个付费的 time tracking add-on？"

---

### 第 0 步：Context Gathering

**Agent:**
"我们来评估这个功能投入的财务影响。请提供：
**Feature description:**
- 这个功能是什么？（1-2 句话）
- Target customer segment（SMB、mid-market、enterprise、all）
**Current business context:**
- Current MRR/ARR
- Current ARPU/ARPA
- Current monthly churn rate
- Gross margin %

**Constraints:**
- Development cost estimate（team size x time）
- 有没有持续性的 COGS 或 OpEx 影响？
如果没有精确数字，估算值也可以。"

---

**User:**
"这是我们的背景：

**Feature:**
Time tracking add-on，包含 start/stop timers、time reports 和 invoice export。目标覆盖所有客群。
**Business context:**
- MRR: $2M（1,000 个客户）
- ARPA: $2,000/month
- ARPU: $200/month（平均每个账户 10 个用户）
- Monthly churn: 3%
- Gross margin: 80%

**Development:**
- 2 engineers x 3 months = 大约 $100K 开发成本
- 基本没有显著持续 COGS（计算成本很低）
- 可能每月增加 10-20 个 support tickets"

---

### 第 1 步：Revenue Connection

**Agent:**
"这个功能会怎样影响收入？请选择最贴近的一项：

1. **Direct monetization (new revenue stream)** - 我们会收费（新套餐、付费 add-on、usage-based fee）
2. **Retention improvement (reduce churn)** - 解决关键 churn 原因，减少流失
3. **Conversion improvement (trial-to-paid)** - 帮助免费/试用用户转付费
4. **Expansion enabler (upsell/cross-sell)** - 打开 upsell 路径或促进 usage expansion
5. **No direct revenue impact** - 只是 table stakes、平台改进或战略价值
选一个编号，或直接描述你自己的 revenue connection。"

---

**User:**
"1 - Direct monetization。我们打算按 $5/user/month 收费。"

---

**Agent:**
"明白。你的计划是按 $5/user/month 给 time tracking 收费。
**接着补几个问题：**

1. **你们总共有多少用户？**
   - Current: 1,000 accounts x 10 users/account = 10,000 users

2. **你预期 adoption rate 是多少？**
   - Conservative (10-15%)
   - Base case (20-25%)
   - Optimistic (30-40%)
   - 或者直接给你自己的估算

3. **你们验证过 willingness-to-pay 吗？**
   - Surveyed customers
   - Prototype tested
   - No validation yet"

---

**User:**
"我们总共有 10,000 users。
我用 base case：20% adoption（2,000 users）。
我们调研过 50 个客户，其中 30% 说愿意为 time tracking 支付 $5-10/user，所以 20% 看起来算保守。"

---

**Agent calculates:**
```text
Total Users: 10,000
Adoption Rate: 20%
Users Adopting: 2,000
Price: $5/user/month

Monthly Revenue: 2,000 x $5 = $10,000/month
Annual Revenue: $120,000/year
Gross Profit: $120,000 x 80% = $96,000/year
```

**Agent:**
"很好。按 20% adoption、$5/user 计算：
**Revenue Impact:**
- Monthly: $10,000 MRR
- Annual: $120,000 ARR
- Gross profit（80% margin）: $96,000/year

接下来我们看成本。"

---

### 第 2 步：Cost Structure

**Agent:**
"你刚才提到：
- Dev cost: $100K（2 engineers x 3 months）
- COGS: 很低
- Support: 10-20 tickets/month

我确认一下完整成本结构：

**One-time development:** $100,000

**Ongoing monthly costs:**
- COGS (compute, storage): $___
- Support（估算 15 tickets/month x $50/ticket）: $750/month = $9K/year
- Total ongoing: $9K/year

这样理解对吗？"

---

**User:**
"对。COGS 基本可以忽略（大概 $100/month 的 compute），support 大概 $750/month。"

---

**Agent calculates:**
```text
Development Cost (one-time): $100,000

Ongoing Annual Costs:
- COGS: $100/month x 12 = $1,200/year
- Support: $750/month x 12 = $9,000/year
- Total: $10,200/year

Net Annual Profit:
$120,000 revenue - $10,200 ongoing costs = $109,800/year gross profit
After initial dev cost recovery: $109,800 - $100,000 = $9,800 in year 1
```

**Agent:**
"明白。成本结构如下：

**Costs:**
- One-time dev: $100,000
- Ongoing: $10,200/year（COGS + support）
**Net Impact:**
- Year 1: $109,800 revenue - $100,000 dev - $10,200 ongoing = -$200（基本打平）
- Year 2+: $109,800/year profit（不再计开发成本）

**Payback Period:** 大约 11 个月"

---

### 第 3 步：Constraints

**Agent:**
"这项功能还有哪些约束或时机因素？

1. **Time-sensitive competitive threat** - 竞品刚上了这个，我们正在丢单
2. **Limited budget/team capacity** - 这个季度只能做一个 major feature
3. **Dependencies on other work** - 先依赖平台改造或其他功能
4. **No major constraints** - 产能和时间都比较灵活

选一个编号，或直接描述你的约束。"

---

**User:**
"2 - 我们这季度只能做一个 major feature。另一个候选是 Gantt chart view（开发成本差不多，但没有明确 monetization，更像 retention play）。"

---

**Agent:**
"收到。你现在是在二选一：
- Time tracking（direct monetization，120K ARR）
- Gantt chart（retention / 竞争型功能，偏间接收益）

我来帮你算一下这个 trade-off。"

---

### 第 4 步：Recommendation

**Agent:**
"基于你的输入，我的分析和建议如下：
---

## Recommendation: **现在就做 Time Tracking**

### Financial Case: Strong

**Revenue Impact:**
- $10K MRR / $120K ARR
- 2,000 users x $5/user（20% adoption）
- Gross margin: 80%
- Net annual profit: $109,800（扣除持续成本后）
**Costs:**
- Development: $100,000（一次性）
- Ongoing: $10,200/year（COGS + support）
**ROI:**
- Year 1: 基本打平（-$200）
- Year 2: 2.2:1 ROI（$109,800 profit / $100K investment）
- Payback: 11 months

**Contribution Margin:**
- Revenue: $120K/year
- Variable costs: $10.2K/year
- Contribution margin: 91.5%（非常好）
---

### 为什么 This Makes Sense

**1. 回本快（11 个月）**
- 不到一年就能收回投入
- 风险较低——即便 adoption 只有 15%，依然有盈利空间

**2. 高毛利收入**
- add-on revenue 有 80% gross margin
- 持续成本很低（每年只有 ~$10K）
- 很容易 scale（用户越多，收入越高，成本变化不大）

**3. 需求已做初步验证**
- 30% 的受访客户表示愿意支付 $5-10/user
- 20% adoption 仍然算保守
**4. Direct revenue > indirect retention（相比 Gantt chart）**
- Gantt chart = retention play（间接收益，不易测）
- Time tracking = direct revenue（可测、可预测）
- 如果只能做一个，优先选收益更清晰的
---

### Comparison: Time Tracking vs. Gantt Chart

| Metric | Time Tracking | Gantt Chart |
|--------|---------------|-------------|
| Revenue Impact | $120K ARR（可测） | 间接（依赖 churn reduction） |
| Development Cost | $100K | $100K（差不多） |
| Payback Period | 11 months | Unknown（取决于 retention 改善） |
| ROI (Year 2) | 2.2:1 | Depends on retention improvement |
| Risk | Low（需求已有验证） | Medium（还是 hypothesis） |

**Verdict:** Time tracking 的 ROI 更清晰，应优先做。
**BUT:** 如果 churn 访谈表明 Gantt chart 是 top 3 流失原因，那就值得重算。
---

### Next Steps

1. **Build MVP (Weeks 1-8)**
   - Core time tracking（start/stop timers）
   - Time reports（基础版）
   - 如果 scope 太紧，invoice export 延后到 v2

2. **Beta Test (Weeks 9-10)**
   - 先放给 50-100 个客户
   - 验证 $5/user 定价
   - 看 adoption（目标：20%+）
3. **Broad Launch (Week 11)**
   - 如果 beta adoption >15%，就全量推
   - 如果 <15%，就调整 pricing 或 positioning

4. **Monitor Metrics (Ongoing)**
   - 每周跟 adoption（目标：20%）
   - 看 support load（应保持 <20 tickets/month）
   - 跟踪 add-on 带来的 MRR 增长

5. **Re-evaluate Gantt Chart (Q2)**
   - 如果 time tracking adoption 达到 20%，下季度再做 Gantt
   - 如果 adoption 很低，先搞清为什么，再决定要不要继续扩功能
---

### Decision Criteria to Proceed

**Build if:**
- Beta adoption >15%
- Support load 可控（<30 tickets/month）
- 定价验证通过（客户能接受 $5/user）
**Pause/pivot if:**
- Beta adoption <10%（要么价格太高，要么需求太弱）
- Support costs >$2K/month（不可持续）
- Churn increases（功能反而制造混乱）

---

### Sensitivity Analysis (What If?)

**如果 adoption 只有 15%（不是 20%）：**
- Revenue: $90K/year
- Payback: 14 months（仍可接受）
- ROI: 1.6:1 in year 2（仍为正）
**如果 adoption 到 30%（乐观情况）：**
- Revenue: $180K/year
- Payback: 7 months（非常好）
- ROI: 3.6:1 in year 2（很强）

**如果 dev cost 能降到 $75K：**
- Payback: 8 months
- ROI: 2.9:1 in year 2

**Bottom line:** 即使保守场景也能赚钱。可以做。

---

## Want to explore further?

1. **看详细数学拆解**
2. **和 Gantt chart 做对比**（如果你有 churn 数据）
3. **调整假设**（pricing、adoption、cost）
4. **导出这份 recommendation**（给 stakeholder 看）"

---

**User:**
"很有帮助。能把详细 math breakdown 给我看一下吗？"

---

**Agent:**
"当然。完整财务拆解如下：

### Detailed Calculations

**Revenue:**
```text
Total Users: 10,000
Adoption Rate: 20%
Users Adopting: 10,000 x 20% = 2,000 users

Price per User: $5/month
Monthly Revenue: 2,000 x $5 = $10,000 MRR
Annual Revenue: $10,000 x 12 = $120,000 ARR
```

**Costs:**
```text
Development (one-time):
  2 engineers x 3 months x $16,667/eng-month = $100,000

Ongoing Monthly Costs:
  COGS (compute): $100/month
  Support: 15 tickets/month x $50/ticket = $750/month
  Total: $850/month

Ongoing Annual Costs:
  $850 x 12 = $10,200/year
```

**Profit:**
```text
Gross Margin: 80%
Gross Profit (Annual): $120,000 x 80% = $96,000/year

After Ongoing Costs:
  $120,000 revenue - $10,200 costs = $109,800 net profit/year

Year 1 (with dev cost):
  $109,800 - $100,000 dev = $9,800 net profit

Year 2+ (no dev cost):
  $109,800 net profit/year
```

**ROI:**
```text
Year 1 ROI:
  $9,800 profit / $100,000 investment = 0.098:1 (basically breakeven)

Year 2 ROI:
  $109,800 profit / $100,000 investment = 1.098:1

Cumulative 2-Year Profit:
  Year 1: $9,800
  Year 2: $109,800
  Total: $119,600 profit on $100K investment = 2.2:1 ROI
```

**Payback Period:**
```text
Monthly net profit = $109,800 / 12 = $9,150/month

Payback = $100,000 / $9,150 = 10.9 months (11 months)
```

**Contribution Margin:**
```text
Revenue: $120,000/year
Variable Costs: $10,200/year (COGS + support)
Contribution Profit: $109,800/year
Contribution Margin: $109,800 / $120,000 = 91.5%
```

这样看会更清楚吗？"

---

**User:**
"会。再问一个：如果我们收 $10/user，而不是 $5/user，会怎样？"

---

**Agent:**
"好问题。我们按 $10/user 重算一下：

### Scenario: $10/user（价格翻倍）

**Assumptions:**
- 价格更高，adoption 可能下降
- Conservative: 15% adoption（比 $5/user 的 20% 略低）
- Optimistic: 20% adoption（和原方案一样）

**Conservative (15% adoption at $10/user):**
```text
Users: 10,000 x 15% = 1,500 users
Revenue: 1,500 x $10 = $15,000 MRR = $180,000 ARR
Net Profit: $180,000 - $10,200 = $169,800/year
Year 1 Profit: $169,800 - $100,000 = $69,800
Payback: 7 months
ROI (Year 2): 2.7:1
```

**Optimistic (20% adoption at $10/user):**
```text
Users: 10,000 x 20% = 2,000 users
Revenue: 2,000 x $10 = $20,000 MRR = $240,000 ARR
Net Profit: $240,000 - $10,200 = $229,800/year
Year 1 Profit: $229,800 - $100,000 = $129,800
Payback: 5 months
ROI (Year 2): 3.3:1
```

### Recommendation on Pricing

**$10/user 更好，前提是：**
- adoption 还能保持在 >15%
- 更高 ARPU 没有严重拖垮 adoption
- 更快回本（5-7 个月，而不是 11 个月）
**Test Approach:**
1. Beta 先按 $10/user 上线给 50 个客户
2. 如果 adoption >15%，就继续维持 $10/user
3. 如果 adoption <10%，再降到 $7/user 或 $5/user

**我的建议：** 先从 $10/user 开始。价格后降比后涨容易。"

---

**User:**
"可以，我被说服了。我们就按 $10/user 做 time tracking。"

---

**Agent:**
"很好。下面是一段可以直接发给 stakeholder 的总结：
---

## Feature Investment Decision: Time Tracking Add-On

**Decision:** Build now（Q1 priority）
**Pricing:** $10/user/month（先在 beta 里测，再决定是否调整）
**Target:** 15-20% adoption（1,500-2,000 users）
**Financial Projections:**
- Year 1 Revenue: $180-240K ARR
- Year 1 Net Profit: $70-130K（扣除 $100K dev cost 后）
- Payback: 5-7 months
- Year 2 ROI: 2.7-3.3:1

**Next Steps:**
1. Kickoff: Week 1（2 engineers，3 months）
2. Beta launch: Week 10（50-100 客户，验证 $10/user pricing）
3. Broad launch: Week 12（前提是 beta adoption >15%）
4. Monitor: 每周跟 adoption、support load、MRR growth

**Success Criteria:**
- 上线 3 个月内 adoption >15%
- Support <30 tickets/month
- 6 个月内新增 $15K+ MRR

Good luck with the build!

---

要不要我顺手给你做个 feature brief 或 PRD template？"

---

**User:**
"不用，这样就够了。谢谢。"

**Agent:**
"不客气。祝你们做 time tracking 顺利。如果后面还要评估别的 feature，随时回来。"