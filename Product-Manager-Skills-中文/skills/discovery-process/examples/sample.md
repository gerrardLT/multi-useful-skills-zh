# Discovery Process 示例

### 示例 1：高质量的 Discovery Process（SaaS 留存问题）

**Context:** 一款 SaaS 产品月 churn 为 15%，假设问题出在 onboarding。

**Phase 1 - Frame Problem:**
- 跑了 `problem-framing-canvas.md`：问题 = “用户因为缺少引导而放弃 onboarding”
- Problem statement: “60% 的非技术用户会在前 24 小时内流失”

**Phase 2 - Research Planning:**
- 跑了 `discovery-interview-prep.md`：选择了 “switch interviews”（已流失用户）
- 招募了 10 位最近 30 天内流失的客户

**Phase 3 - Conduct Research:**
- 访谈了 10 位流失客户
- 提问： “带我回顾一下你第一次使用这个产品的过程。你卡在哪一步了？”
- 第 6 场后出现清晰模式：同一个痛点反复出现（空白 dashboard，不知道下一步做什么）

**Phase 4 - Synthesize:**
- Affinity mapping：8/10 提到 “不知道先做什么”
- 客户原话： “我登录进去，看到一个空 dashboard，心里只剩一句 ‘然后呢？’”
- Pain point: “缺少 onboarding guidance”（frequency: 8/10，intensity: HIGH）

**Phase 5 - Generate Solutions:**
- 跑了 `opportunity-solution-tree.md`：得出 3 个方案（guided checklist、tooltips、人工 onboarding）
- 实验：用 Figma 做 guided checklist prototype，找 10 位新注册用户测试
- Result: 有 checklist 时 9/10 完成第一步动作；没有时只有 4/10

**Phase 6 - Decide:**
- Decision: GO（问题和方案都验证了）
- 写出 epic hypothesis： “如果加入 guided onboarding checklist，activation rate 会从 40% 提升到 60%”
- 放进 roadmap（Q1 priority）

**Outcome:** 4 周内验证了问题和方案，对 build decision 有很高信心。

---

### 示例 2：糟糕的 Discovery Process（直接跳到方案）

**Context:** 产品团队想做一个 mobile app。

**Phase 1 - Frame Problem:** 跳过（默认问题就是 “我们需要 mobile app”）

**Phase 2-3 - Research:** 跳过（没有用户访谈）

**Phase 5 - Generate Solutions:** 跳过（方案早就定好了）

**Phase 6 - Decide:** GO（完全没验证）

**Outcome:** 花了 6 个月做出 mobile app，采用率很低，后来才发现：其实 responsive web 在 2 周内就能满足 80% 的 use cases。

**Fix with discovery process:**
- **Phase 1:** 重新定义问题： “Mobile-first 用户无法在移动场景下完成关键 workflow”
- **Phase 3:** 访谈 10 位 mobile-first 用户： “你最需要在手机上完成哪些流程？”
- **Phase 4:** 洞察 = 用户只需要 2-3 个核心 mobile workflows，而不是整套 app
- **Phase 5:** 测 responsive web + mobile-optimized flows（2 周实验）
- **Phase 6:** Result = responsive web 就解决了问题，省下 5 个月开发时间