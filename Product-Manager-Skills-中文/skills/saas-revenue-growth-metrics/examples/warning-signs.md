# 示例：预警信号（漏桶）

**Company:** MarketingFlow (SMB marketing automation SaaS)
**Stage:** Early growth, post-Seed
**Customer Base:** 2,000 accounts, 10,000 users
**Period:** Monthly snapshot

---

## 营收指标

### MRR/ARR
```
Starting MRR: $500,000
+ New MRR: $100,000 (200 new accounts)
+ Expansion MRR: $5,000 (minimal upsells)
- Churned MRR: $50,000 (120 accounts churned)
- Contraction MRR: $10,000 (40 accounts downgraded)
Ending MRR: $545,000

MRR Growth Rate: 9% MoM (but driven entirely by new customer acquisition)
ARR: $6.5M
```

### ARPA/ARPU
```
ARPA = $545,000 / 2,000 accounts = $272/month
ARPU = $545,000 / 10,000 users = $54.50/month
Average seats per account = 5 users
```

### 营收构成
```
New MRR: $100K (20% of base - very high)
Expansion MRR: $5K (1% of base - very low)
Churned MRR: $50K (10% of base - crisis level)
Contraction MRR: $10K (2% of base - concerning)
```

---

## 留存与扩张指标

### Churn Rate
```
Logo Churn: 120 / 2,000 = 6% monthly (~50% annual)
Revenue Churn: $50K / $500K = 10% monthly (~69% annual)
```

**分析：** Revenue churn 高于 logo churn，说明流失的是更大的客户。这是危机信号。

### NRR
```
Starting ARR: $6M
Expansion: $60K (annual)
Churned: $600K (annual)
Contraction: $120K (annual)
Ending ARR: $5.34M

NRR = $5.34M / $6M = 89%
```

**分析：** NRR <100%，说明基盘在收缩。老客户流失的收入比扩张出来的还快。

### Quick Ratio
```
Gains = $100K + $5K = $105K
Losses = $50K + $10K = $60K
Quick Ratio = $105K / $60K = 1.75
```

**分析：** Quick Ratio <2，说明是漏桶状态。只是勉强跑赢损失。

---

## Cohort 留存趋势（负面信号）

| Cohort | Month 3 Retention | Month 6 Retention | Month 12 Retention |
|--------|-------------------|-------------------|---------------------|
| 12 months ago | 82% | 75% | 68% |
| 6 months ago | 75% | 65% | TBD |
| Current | 68% (on track) | TBD | TBD |

**分析：** 新 cohort 的流失速度比老 cohort 更快。产品市场匹配正在恶化。

---

## 分析

### 关键问题

**不可持续的流失：**
- 6% 的月度 logo churn，约等于 50% 年化，已经是危机水平
- 10% 的月度 revenue churn，约等于 69% 年化，属于生存威胁
- Revenue churn 高于 logo churn，说明流失的是高价值客户
- 流失率还在继续上升（六个月前还是 4%）

**Cohort 退化：**
- 新客户流失得比老客户更快
- Month 6 retention: 75% -> 65% -> 按当前趋势会到 58%
- 这说明产品市场匹配不是在变好，而是在变差

**没有扩张引擎：**
- Expansion revenue 只有 MRR 的 1%（正常应为 10-30%）
- NRR 只有 89%（在收缩，不是在扩张）
- 只有 5% 的客户曾经发生过扩张

**漏桶：**
- Quick Ratio 只有 1.75（只是略高于损失）
- 每月损失 $60K，只新增 $105K
- 就像在跑步机上：每月必须新增 200 个客户，才能勉强持平

**收入依赖：**
- 90% 的增长来自新客户获取
- 只要获取速度一降，收入会立刻缩水
- 留存已经坏掉了，继续扩张只会更快放大问题

---

### 需要继续追查的根因

**为什么 churn 在上升？**
- 产品质量在下降？
- 客户细分选错了（匹配度差）？
- Onboarding 失败？
- 竞争压力？
- 定价高于实际交付价值？

**为什么新 cohort 更差？**
- 客户获取质量在下降？
- 产品改动破坏了关键使用场景？
- 公司扩张后支持质量在下滑？

**为什么没有扩张？**
- 包装/套餐里没有 upsell 路径？
- 客户没有到达会触发扩张的 “aha moment”？
- 产品无法随着客户需求一起增长？

---

## 建议动作（紧急）

### 停止放大获客

在修好留存之前，不要增加营销支出。放大一个漏桶，只会更快烧钱。

**原因：** 以当前 churn 水平来看，每一美元的获客投入，基本都会在 12 个月内漏掉。先把桶补好。

---

### Priority 1：修留存（第 1-4 周）

**调查 churn：**
1. 访谈 20-30 位已流失客户
2. 按 cohort、use case、客户规模切分 churn
3. 找出前 3 个 churn 原因

**快速补救：**
1. 改善 onboarding（70% 的 churn 发生在前 60 天）
2. 对高风险账户做主动支持（识别使用下滑）
3. 在休眠账户 churn 前先做唤回

**目标：** 8 周内把 logo churn 从 6% 降到 4%，16 周内打到 3%。

---

### Priority 2：建立扩张引擎（第 5-8 周）

**创建 upsell 路径：**
1. 推出 premium tier（高级功能）
2. 推出基于使用量的附加项（更多 seats、更多 integrations）
3. 交叉销售互补功能

**识别扩张候选客户：**
1. 哪些客户使用最重？（优先 upsell）
2. 哪些客户触达了使用上限？（给出扩张方案）

**目标：** 12 周内把 expansion MRR 从基盘的 1% 提升到 5%。

---

### Priority 3：改善 Cohort 留存（持续）

**严格跟踪 cohorts：**
1. 每周看 cohort retention dashboard
2. 把新 cohort 和基线对比（Month 6 为 75%）
3. 只有当新 cohort 留存优于老 cohort 时，才考虑继续放大

**产品改进：**
1. 修 onboarding（缩短 time-to-value）
2. 改善核心 use case（减少 churn 原因）
3. 增加粘性功能（integrations、数据沉淀）

**目标：** 16 周内扭转 cohort 退化趋势。新 cohort 到 Month 6 时，留存应达到 75%+。

---

### 成功标准（修好后再扩张）

在以下条件满足前，不要放大获客：
- [ ] Logo churn <4% monthly（理想是 <3%）
- [ ] Revenue churn <5% monthly
- [ ] NRR >100%（扩张收入超过流失）
- [ ] Quick Ratio >2.5（理想是 >4）
- [ ] New cohorts retain same or better than old cohorts
- [ ] Expansion MRR >5% of total MRR

**时间线：** 预计需要 12-16 周修复，然后再重新评估扩张。

---

## 修好留存后的财务影响

**当前状态（差）：**
- 每月需要新增 200 个客户，才能抵消 churn
- 净增长只有 80 个客户/月
- 90% 的获客预算都浪费在填补 churn

**如果把 churn 修到 3%（好）：**
- 每月只需要新增 60 个客户来抵消 churn
- 净增长会变成 140 个客户/月（效率提升 75%）
- 获客预算能发挥 3 倍价值

**如果把 NRR 修到 110%（很好）：**
- 现有基盘即使没有新客户，每年也能增长 10%
- 所有新获客都变成净增长
- 因为 LTV 提升 2-3 倍，可以接受更高的 CAC

**一句话结论：** 修留存，值回 6-12 个月暂停增长的代价。不要跳过这一步。