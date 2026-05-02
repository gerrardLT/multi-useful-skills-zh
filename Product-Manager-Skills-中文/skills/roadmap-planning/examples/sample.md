# 路线图示例

### 示例 1：好的路线图规划（SaaS 产品）

**背景：** 年度规划，需要让路线图与留存和企业扩张目标对齐。

**阶段 1 - 收集信息：**
- 业务目标：将流失率从 15% 降至 8%，将企业客户成交数从每季度 2 单提升到 5 单
- 客户问题：onboarding 流程容易让人困惑、企业 SSO 缺失、移动端访问体验不佳
- 技术方面：需要先升级数据管道，才能支持高级报表功能

**阶段 2 - 定义史诗：**
- 定义了 12 个带假设的 epics，例如 guided onboarding、enterprise SSO、mobile workflows、advanced reporting 等
- 估算工作量：Onboarding = M（3 周），SSO = M（4 周），Mobile = L（2 个月）

**阶段 3 - 优先级排序：**
- 使用 RICE 框架（由 `prioritization-advisor.md` 推荐）
- 评分结果：Onboarding（24,000）、SSO（675）、Mobile（2,000）、Reporting（1,000）
- 战略性手动调整：提高了 SSO 的优先级，因为它对企业扩张至关重要

**阶段 4 - 排序：**
- Q1: Guided Onboarding、Enterprise SSO、Mobile Workflows
- Q2: Advanced Reporting（依赖 Q1 的 Data Pipeline）、Slack Integration
- Q3: Mobile App（依赖 API Redesign）

**阶段 5 - 沟通：**
- 向高层汇报：`Q1 focuses on retention (onboarding) and enterprise expansion (SSO)`
- 反馈：`Can we add pricing page redesign to Q2?` -> 随后对路线图进行了调整
- 发布：内部路线图（Confluence）、外部路线图（Now/Next/Later）

**结果：** 一份清晰、对齐且带有战略叙事的路线图。

---

### 示例 2：糟糕的路线图规划（功能清单）

**背景：** 产品经理独自根据各方诉求创建路线图。

**阶段 1 - 收集信息：** 跳过（没有回顾业务目标）

**阶段 2 - 定义史诗：** 只是列出销售、市场、客服提出的功能

**阶段 3 - 优先级排序：** 谁喊得最响谁优先

**阶段 4 - 排序：** 毫无依据地把功能扔进 Q1、Q2、Q3

**阶段 5 - 沟通：** 向高层展示一份功能列表

**为什么会失败：**
- 没有战略叙事，回答不了“为什么做这些”
- 没有框定客户问题
- 没有假设，也没有成功指标
- 路线图看起来只是随机功能的堆积

**用路线图规划工作流修正：**
- **阶段 1:** 回顾业务目标，如降低流失、提升企业扩张
- **阶段 2:** 把功能请求转成带假设的 epics
- **阶段 3:** 用 RICE 按影响和投入排序，而不是按政治声音排序
- **阶段 4:** 按依赖关系和业务目标进行逻辑排序
- **阶段 5:** 用叙事方式呈现：`Q1 = Retention, Q2 = Enterprise Expansion`

---