---
name: finance-metrics-quickref
description: 快速查询 SaaS 财务指标、公式和 benchmark。适用于分析过程中需要立刻确认某个指标定义、公式或 benchmark 时。
intent: >-
  Quick reference for any SaaS finance metric without deep teaching. Use this when you need a fast formula lookup, benchmark check, or decision framework reminder. For detailed explanations, calculations, and examples, see the related deep-dive skills.
type: component
best_for:
  - "Quick metric lookups during product or finance reviews"
  - "Checking formulas and benchmarks without reading a long explainer"
  - "Refreshing decision rules for common SaaS metrics"
scenarios:
  - "What is the formula for NRR and what is a good benchmark?"
  - "Give me a quick reference for CAC payback and Rule of 40"
  - "I need a fast SaaS metrics cheat sheet for a business review"
---


## 目的

针对任意 SaaS 财务指标提供快速参考，不做深入教学。适用于你需要快速查公式、对 benchmark 做 sanity check，或回顾某个决策框架的时候。若需要详细解释、计算过程与示例，请看相关的深度 skill。
这不是教学工具，而是一份为速度优化的 cheat sheet。扫一眼，找到，套用。

## 关键概念

### Metric Categories

这些指标分成四类：
1. **Revenue & Growth** - 顶层收入（revenue、ARPU、ARPA、MRR/ARR、churn、NRR、expansion）
2. **Unit Economics** - 单客层面的盈利能力（CAC、LTV、payback、margins）
3. **Capital Efficiency** - 现金管理（burn rate、runway、OpEx、net income）
4. **Efficiency Ratios** - 增长与盈利的平衡（Rule of 40、magic number）

### 何时使用这个 Skill

**适合使用的情况：**
- 你需要快速查一个公式或 benchmark
- 你在准备 board meeting 或 investor call
- 你在评估一个决策，想确认哪些指标最关键
- 你想快速识别 red flags

**不适合使用的情况：**
- 你需要详细的计算指导（用 `saas-revenue-growth-metrics` 或 `saas-economics-efficiency-metrics`）
- 你是第一次学习这些指标（先看深度 skill）
- 你需要示例和常见误区（相关 skill 中有）

---

## 应用

### All Metrics Reference Table

| **Metric** | **Formula** | **What It Measures** | **Good Benchmark** | **Red Flag** |
|------------|-------------|----------------------|-------------------|--------------|
| **Revenue** | Total sales before expenses | 顶层收入 | Growth rate >20% YoY（因阶段而异） | 收入增长慢于成本增长 |
| **ARPU** | Total Revenue / Total Users | 单个用户平均收入 | 因业务模式而异；重点看趋势 | cohort-over-cohort 持续下降 |
| **ARPA** | MRR / Active Accounts | 单个客户账户平均收入 | SMB: $100-$1K; Mid: $1K-$10K; Ent: $10K+ | 高 ARPA + 低 ARPU（seat monetization 不足） |
| **ACV** | Annual Recurring Revenue per Contract | 年化合同价值 | SMB: $5K-$25K; Mid: $25K-$100K; Ent: $100K+ | ACV 持续下降（无意间下沉市场） |
| **MRR/ARR** | MRR x 12 = ARR | 可预测的 recurring revenue | 增长和质量都要看；要拆分看构成 | New MRR 下降，且 churn 稳定或变差 |
| **Churn Rate** | Customers Lost / Starting Customers | 取消订阅客户占比 | 月度 <2% 很好，<5% 可接受；年度 <10% 很好 | cohort-over-cohort churn 上升 |
| **NRR** | (Start ARR + Expansion - Churn - Contraction) / Start ARR x 100 | 收入留存与扩张能力 | >120% 很优秀，100-120% 较好，80-100% 勉强 | NRR <100%（base 在收缩） |
| **Expansion Revenue** | Upsells + Cross-sells + Usage Growth | 来自现有客户的新收入 | 占总收入 20-30% | Expansion <10% of MRR |
| **Quick Ratio** | (New MRR + Expansion MRR) / (Churned MRR + Contraction) | 收入增量与流失量的比值 | >4 优秀，2-4 健康，<2 漏桶严重 | Quick Ratio <2 |
| **Gross Margin** | (Revenue - COGS) / Revenue x 100 | 扣除直接成本后的收入占比 | SaaS: 70-85% 较好，<60% 值得警惕 | Gross margin <60% 或持续下降 |
| **CAC** | Total S&M Spend / New Customers | 获取一个客户的成本 | 因业务不同而异：Ent $10K+ 可接受；SMB <$500 | CAC 上升而 LTV 持平 |
| **LTV** | ARPU x Gross Margin % / Churn Rate | 单个客户的总收入价值 | 至少应为 CAC 的 3x；不同 segment 不同 | cohort-over-cohort LTV 下降 |
| **LTV:CAC** | LTV / CAC | Unit economics 效率 | 3:1 健康，<1:1 不可持续，>5:1 可能投资不足 | LTV:CAC <1.5:1 |
| **Payback Period** | CAC / (Monthly ARPU x Gross Margin %) | 回收 CAC 所需月份数 | <12 个月很好，12-18 可接受；>24 值得警惕 | Payback >24 个月（现金陷阱） |
| **Contribution Margin** | (Revenue - All Variable Costs) / Revenue x 100 | 扣除全部可变成本后的真实贡献 | SaaS 中 60-80% 较好，<40% 值得警惕 | Contribution margin <40% |
| **Burn Rate** | Monthly Cash Spent - Revenue | 每月现金消耗 | 早期 net burn <$200K 可控；增长期 <$500K | Net burn 持续加速 |
| **Runway** | Cash Balance / Monthly Net Burn | 现金还能撑几个月 | 12+ 个月较好，6-12 可接受；<6 危险 | Runway <6 个月 |
| **OpEx** | S&M + R&D + G&A | 经营成本 | 增速应慢于 revenue | OpEx 增长快于 revenue |
| **Net Income** | Revenue - All Expenses | 实际利润/亏损 | 早期为负可接受；成熟期 margin 应达 10-20%+ | 亏损扩大但没有换来增长 |
| **Rule of 40** | Revenue Growth % + Profit Margin % | 增长与效率的平衡 | >40 健康，25-40 尚可，<25 值得警惕 | Rule of 40 <25 |
| **Magic Number** | (Q Revenue - Prev Q Revenue) x 4 / Prev Q S&M | S&M 效率 | >0.75 高效，0.5-0.75 可接受，<0.5 需修 GTM | Magic Number <0.5 |
| **Operating Leverage** | Revenue Growth vs. OpEx Growth | 规模化效率 | Revenue growth 应高于 OpEx growth | OpEx 增速快于 revenue |
| **Gross vs. Net Revenue** | Net = Gross - Discounts - Refunds - Credits | 真正留下来的收入 | Refunds <10%；discounts <20% | Refunds >10%（产品问题信号） |
| **Revenue Concentration** | Top N Customers / Total Revenue | 对大客户的依赖程度 | Top customer <10%；Top 10 <40% | Top customer >25%（生存级风险） |
| **Revenue Mix** | Product/Segment Revenue / Total Revenue | 收入组合结构 | 理想状态下单产品不超过 60% | 单产品 >80%（过度单一） |
| **Cohort Analysis** | Group customers by join date; track behavior | 业务是在变好还是变坏 | 新 cohort 表现应不差于旧 cohort | 新 cohort 表现更差 |
| **CAC Payback by Channel** | CAC / Monthly Contribution (by channel) | 按获客渠道看的 payback | 用于渠道间比较 | 某个渠道明显更差 |
| **Gross Margin Payback** | CAC / (Monthly ARPU x Gross Margin %) | 用实际利润口径算 payback | 通常是简单 payback 的 1.5-2 倍 | 用 margin 算出的 payback >36 个月 |
| **Unit Economics** | Revenue per unit - Cost per unit | 每个“单位”的盈利能力 | 必须有正贡献 | Contribution margin 为负 |
| **Segment Payback** | CAC / Monthly Contribution (by segment) | 按客户 segment 的 payback | 用于决定资源分配 | 某 segment 不盈利 |
| **Incrementality** | Revenue caused by action - Baseline | 某行动带来的真实增量 | 应通过 holdout test 测量 | 把本来就会发生的收入当成功劳 |
| **Working Capital** | Cash timing between revenue and collection | 现金流与收入确认的时间差 | 年付 upfront 优于月付 | 付款周期过长拖垮 runway |

---

### Quick Decision Frameworks

用这些框架把指标组合起来，处理常见 PM 决策。

#### Framework 1: Should We Build This Feature?

**要问：**
1. **Revenue impact?** 是直接收入（pricing、add-on）还是间接收入（retention、conversion）？
2. **Margin impact?** COGS 是多少？会不会稀释 margin？
3. **ROI?** 收入影响 / 开发成本

**适合构建的条件：**
- 第一年的 ROI >3x（直接 monetization），或
- 对 LTV 的影响 >10x 开发成本（retention 场景），或
- 战略价值大于短期 ROI

**不适合构建的条件：**
- 即便按乐观采用率算，contribution margin 仍为负
- Payback period 超过平均客户生命周期

**要看的指标：** Revenue、Gross Margin、LTV、Contribution Margin

---

#### Framework 2: Should We Scale This Acquisition Channel?

**要问：**
1. **Unit economics?** CAC、LTV、LTV:CAC ratio
2. **Cash efficiency?** Payback period
3. **Customer quality?** 按渠道看的 cohort retention、NRR
4. **Scalability?** Magic Number、可触达规模

**适合放大的条件：**
- LTV:CAC >3:1，并且
- Payback <18 个月，并且
- 客户质量不低于其他渠道，并且
- Magic Number >0.75

**不适合放大的条件：**
- LTV:CAC <1.5:1，并且
- 也看不到明确改善路径

**要看的指标：** CAC、LTV、LTV:CAC、Payback Period、NRR、Magic Number

---

#### Framework 3: Should We Change Pricing?

**要问：**
1. **ARPU/ARPA impact?** 单客收入会不会提升？
2. **Conversion impact?** 会帮助还是伤害 trial-to-paid conversion？
3. **Churn impact?** 会制造 churn risk 还是降低 churn？
4. **NRR impact?** 会促进 expansion 还是制造 contraction？

**适合实施的条件：**
- 在考虑 churn risk 后，net revenue impact 仍为正
- 能先在部分 segment 上测试，再决定是否全面 rollout

**不适合改价的条件：**
- churn risk 高，且没有足够 expansion 对冲
- 在投入前无法测试假设

**要看的指标：** ARPU、ARPA、Churn Rate、NRR、CAC Payback

---

#### Framework 4: Is the Business Healthy?

**按阶段看：**

**Early Stage (Pre-$10M ARR)：**
- Growth Rate >50% YoY
- LTV:CAC >3:1
- Gross Margin >70%
- Runway >12 months

**Growth Stage ($10M-$50M ARR)：**
- Growth Rate >40% YoY
- NRR >100%
- Rule of 40 >40
- Magic Number >0.75

**Scale Stage ($50M+ ARR)：**
- Growth Rate >25% YoY
- NRR >110%
- Rule of 40 >40
- Profit Margin >10%

**要看的指标：** Revenue Growth、NRR、LTV:CAC、Rule of 40、Magic Number、Gross Margin

---

### Red Flags by Category

#### Revenue & Growth Red Flags
| **Red Flag** | **What It Means** | **Action** |
|--------------|-------------------|------------|
| cohort-over-cohort churn 上升 | Product-market fit 在恶化 | 停止放大获客；先修 retention |
| NRR <100% | base 在收缩 | 先修 expansion 或先降 churn，再扩张 |
| revenue churn > logo churn | 丢的是大客户 | 调查高价值客户为何离开 |
| Quick Ratio <2 | 漏桶严重（几乎只是勉强跑赢流失） | 扩大获客前先修 retention |
| Expansion revenue <10% of MRR | 没有 upsell/cross-sell 引擎 | 建立 expansion 路径 |
| Top 10 客户收入占比 >50% | 生存级依赖风险 | 分散客户结构 |

#### Unit Economics Red Flags
| **Red Flag** | **What It Means** | **Action** |
|--------------|-------------------|------------|
| LTV:CAC <1.5:1 | 在亏钱买收入 | 扩张前先降 CAC 或提高 LTV |
| Payback >24 months | 现金陷阱（回本太慢） | 谈年付 upfront 或降低 CAC |
| Gross margin <60% | 每一美元收入的盈利能力偏低 | 提价或降低 COGS |
| CAC 上升而 LTV 持平 | Unit economics 在恶化 | 优化 conversion 或缩短 sales cycle |
| Contribution margin <40% | 扣掉可变成本后仍不赚钱 | 降低可变成本或提价 |

#### Capital Efficiency Red Flags
| **Red Flag** | **What It Means** | **Action** |
|--------------|-------------------|------------|
| Runway <6 months | 生存危机 | 立刻融资或削减 burn |
| Net burn 在加速但 revenue 没增长 | 烧得更快但没有结果 | 降本或提高收入紧迫度 |
| OpEx 增速快于 revenue | 负向 operating leverage | 冻结招聘；优化支出 |
| Rule of 40 <25 | 既烧钱又没增长 | 提高增长或收敛到盈利 |
| Magic Number <0.5 | S&M 引擎失灵 | 扩大投入前先修 GTM 效率 |

---

### 何时该用哪个指标

**做功能优先级：**
- Revenue impact -> Revenue、ARPU、Expansion Revenue
- Margin impact -> Gross Margin、Contribution Margin
- ROI -> LTV impact、Development cost

**评估渠道：**
- Acquisition cost -> CAC、CAC by Channel
- Customer value -> LTV、NRR by Channel
- Payback -> Payback Period、CAC Payback by Channel
- Scalability -> Magic Number

**做定价决策：**
- Monetization -> ARPU、ARPA、ACV
- Impact -> Churn Rate、NRR、Expansion Revenue
- Efficiency -> CAC Payback（定价变化会不会影响它？）

**看业务健康度：**
- Growth -> Revenue Growth、MRR/ARR Growth
- Retention -> Churn Rate、NRR、Quick Ratio
- Economics -> LTV:CAC、Payback Period、Gross Margin
- Efficiency -> Rule of 40、Magic Number、Operating Leverage
- Survival -> Burn Rate、Runway

**做 board / investor reporting：**
- 关键指标：ARR、Revenue Growth %、NRR、LTV:CAC、Rule of 40、Magic Number、Burn Rate、Runway
- 阶段侧重：早期更强调 growth + unit economics；成长阶段强调 Rule of 40 + Magic Number；规模阶段强调 profitability + efficiency

---

## 示例

### 示例 1：Feature Investment Sanity Check

你在决定是否要做一个 premium export 功能。
1. 使用 Framework 1（Should We Build This Feature?）
2. 拉出 baseline metrics：ARPU、Gross Margin、LTV、Contribution Margin
3. 分别建 optimistic、base、downside 三种采用率情景
4. 如果 downside 情况下 contribution margin 变负，就否掉

Quick output:
- Base case ROI: 3.8x
- Contribution margin impact: +4 points
- Decision: 现在就做，并在上线后 90 天回看 churn 和 expansion

### 示例 2：Channel Scale Decision

Paid social 带来了很多注册，但 retention 很弱。
1. 使用 Framework 2（Should We Scale This Acquisition Channel?）
2. 检查 CAC、LTV:CAC、Payback Period 和 NRR by channel
3. 不要和公司整体平均值比，要和表现最好的渠道比

Quick output:
- LTV:CAC: 1.6:1
- Payback: 26 months
- NRR: 88%
- Decision: 不要放大；先限制投放并做定向优化测试

---

## 常见陷阱

- 用公司整体混合平均值，而不是按 cohort 或 channel 看指标
- 在 Quick Ratio 很弱、retention 持续恶化时还去扩大获客
- 只看高 LTV:CAC，却不检查 payback 和 runway 影响
- 只根据 ARPU lift 决定涨价，却不建 churn 和 contraction 模型
- 跨不同公司阶段或业务模式乱比 benchmark
- 跟踪了很多指标，但没有明确的决策问题

---

## 参考

### Related Skills (Deep Dives)
- `saas-revenue-growth-metrics` - 关于 revenue、retention、growth metrics 的详细说明（13 个指标）
- `saas-economics-efficiency-metrics` - 关于 unit economics 与 capital efficiency 的详细说明（17 个指标）
- `feature-investment-advisor` - 用这些指标评估功能 ROI
- `acquisition-channel-advisor` - 用这些指标评估渠道可行性
- `finance-based-pricing-advisor` - 用这些指标评估定价变更
- `business-health-diagnostic` - 用这些指标诊断业务健康度

### External Resources
- **Bessemer Venture Partners:** "SaaS Metrics 2.0" - 全面的 SaaS benchmark- **David Skok (Matrix Partners):** "SaaS Metrics" 博客系列 - 深入理解 unit economics
- **Tomasz Tunguz (Redpoint):** SaaS benchmark 研究与博客
- **ChartMogul, Baremetrics, ProfitWell:** 提供指标定义的 SaaS analytics 平台
- **SaaStr:** 年度 SaaS benchmark 调查

### 来源
- 改编自 `research/finance/Finance_QuickRef.md`
- 公式来自 `research/finance/Finance for Product Managers.md`
- 决策框架来自 `research/finance/Finance_For_PMs.Putting_It_Together_Synthesis.md`