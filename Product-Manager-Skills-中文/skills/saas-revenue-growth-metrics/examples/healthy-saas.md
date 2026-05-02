# 示例：健康的 SaaS 指标

**公司:** ProjectHub（面向中型市场的项目管理 SaaS）
**阶段:** Growth stage，Series B 融资后
**客户基础:** 200 个账户，20,000 名用户
**周期:** 月度快照

---

## 收入指标

### MRR / ARR
```
Starting MRR: $2,000,000
+ New MRR: $100,000 (10 new accounts)
+ Expansion MRR: $80,000 (upsells + usage growth)
- Churned MRR: $30,000 (5 accounts churned)
- Contraction MRR: $10,000 (3 accounts downgraded)
Ending MRR: $2,140,000

MRR Growth Rate: 7% MoM
ARR: $25.7M
```

### ARPA / ARPU
```
ARPA = $2,140,000 / 200 accounts = $10,700/month
ARPU = $2,140,000 / 20,000 users = $107/month
Average seats per account = 100 users
```

### 收入构成
```
New MRR: $100K (5% of total)
Expansion MRR: $80K (4% of total)
Churned MRR: $30K (1.5% of total)
Contraction MRR: $10K (0.5% of total)
```

---

## 留存与扩张指标

### Churn Rate
```
Logo Churn: 5 / 200 = 2.5% monthly (~26% annual)
Revenue Churn: $30K / $2M = 1.5% monthly (~17% annual)
```

**分析：** Revenue churn 小于 logo churn，说明流失掉的主要是较小客户，这通常是健康信号。

### NRR
```
Starting ARR: $24M
Expansion: $960K (annual)
Churned: $360K (annual)
Contraction: $120K (annual)
Ending ARR: $24.48M

NRR = $24.48M / $24M = 102%
```

### Quick Ratio
```
Gains = $100K + $80K = $180K
Losses = $30K + $10K = $40K
Quick Ratio = $180K / $40K = 4.5
```

---

## 分析

### 优势

**增长强劲：**
- MRR 环比增长 7%
- 增长结构健康：5% 来自新客，4% 来自扩张

**留存优秀：**
- 2.5% 的 logo churn（低于 5% 警戒线）
- 1.5% 的 revenue churn（好于 logo churn）
- 102% NRR（即使不靠新 logo 也能增长）

**扩张效率高：**
- $80K expansion MRR（占基盘的 4%）
- NRR 主要靠扩张驱动
- 每个账户平均扩张额约为 $400 / 月

**增长可持续：**
- Quick Ratio 4.5（增长远大于流失）
- Revenue churn 正在下降（6 个月前还是 2%）
- 新 cohort 的留存优于旧 cohort

### 机会

**还有扩张空间：**
- NRR 102% 已经不错，但还有提升到 110-120% 的空间
- 目前只有 40% 的客户发生过扩张，可争取推到 60%
- 存在 cross-sell 机会：30% 的客户还没有使用 integrations add-on

**ARPU 优化：**
- 对 mid-market 来说，$107 / user 已经不错，但企业段已经显示出 $200 / user 的潜力
- 可以测试为高级功能引入 premium tier

**进一步降低 churn：**
- 2.5% 的 logo churn 可以接受，但还不算优秀
- 分析显示 70% 的 churn 发生在前 90 天，本质上是 onboarding 问题
- 修复方向：改进 onboarding，目标是把 logo churn 降到 2% 以下

---

## 建议动作

1. **积极扩大 acquisition** - 单位经济模型很强（CAC / LTV 详见 `saas-economics-efficiency-metrics`）
2. **改进 onboarding** - 把前 90 天的早期 churn 从 5% 降到 3%
3. **扩大 cross-sell** - 向尚未购买 integrations add-on 的 30% 客户推进，有望增加 $30K MRR
4. **测试 premium tier** - 已有 20 个 enterprise customers 表现出愿意为高级功能支付 2 倍价格
5. **持续监测 cohort retention** - 继续验证新 cohort 的留存优于旧 cohort 这一趋势

---

## Cohort Retention Trend（正向信号）

| Cohort | Month 6 Retention | Month 12 Retention |
|--------|-------------------|---------------------|
| 12 months ago | 85% | 78% |
| 6 months ago | 88% | TBD |
| Current | 92% (on track) | TBD |

**分析：** 新 cohort 留存持续变好，说明产品改进正在起作用，因此可以更放心地扩大 acquisition。