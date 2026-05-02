# Epic Hypothesis 示例

## 示例 1：好的 Epic Hypothesis

```markdown
### Epic Hypothesis: Google Calendar Integration for Trial Users

#### If/Then Hypothesis

**If we** provide one-click Google Calendar integration during onboarding
**for** trial users who manage multiple meetings and tasks daily
**Then we will** increase activation rate (defined as completing setup + creating first task) from 40% to 50%

#### Tiny Acts of Discovery Experiments

**We will test our assumption by:**
1. Creating a clickable Figma prototype of the integration flow and testing with 10 trial users
2. Adding a "Connect Google Calendar" CTA to the onboarding flow (but it's non-functional) and measuring click-through rate
3. Manually syncing Google Calendar for 5 trial users and surveying them after 1 week on perceived value

#### Validation Measures

**We know our hypothesis is valid if within 4 weeks we observe:**
- Click-through rate on the CTA is > 60% (quantitative)
- 8 out of 10 prototype testers say they'd use this feature regularly (qualitative)
- Manually synced users report saving 10+ minutes per day on task entry (qualitative)
```

---

## 示例 2：糟糕的 Epic Hypothesis（太模糊）

```markdown
### Epic Hypothesis: Improve Dashboard

#### If/Then Hypothesis

**If we** improve the dashboard
**for** users
**Then we will** make the product better

#### Tiny Acts of Discovery Experiments

**We will test our assumption by:**
1. Building the dashboard

#### Validation Measures

**We know our hypothesis is valid if we observe:**
- Users like it
```

**为什么这个假设不好：**
- `Improve the dashboard` 不具体（到底改善什么？）
- `users` 不是用户画像（是哪些用户？全部用户吗？）
- `make the product better` 不可衡量
- 实验方式是“直接构建”，而非轻量验证
- 验证标准是主观表达（`users like it` 不可证伪）

**如何修正：**
- 把假设写具体：“If we add real-time task status updates to the dashboard for project managers, then we will reduce time spent checking task progress from 20 min/day to 5 min/day”
- 把用户画像写清楚：“for project managers managing 10+ team members”
- 设计实验：“做 dashboard 原型，找 5 位 PM 测试，测节省时间”
- 写清验证标准：“8 out of 10 PMs report saving 10+ min/day”

---

## 示例 3：被否定的假设（但过程是好的）

```markdown
### Epic Hypothesis: Slack Integration for Notifications

#### If/Then Hypothesis

**If we** send Slack notifications when tasks are assigned
**for** remote project managers
**Then we will** reduce task response time from 4 hours to 1 hour

#### Tiny Acts of Discovery Experiments

**We will test our assumption by:**
1. Manually send Slack notifications to 10 project managers for 2 weeks
2. Measure response time before/after
3. Survey users on perceived value

#### Validation Measures

**We know our hypothesis is valid if within 2 weeks we observe:**
- Average response time drops from 4 hours to 1 hour (quantitative)
- 8 out of 10 users say Slack notifications helped them respond faster (qualitative)

---

**Results after 2 weeks:**
- Average response time: 3.5 hours (minimal improvement)
- User feedback: "I already get too many Slack notifications. I ignore most of them."
- **Decision: Hypothesis INVALIDATED. Users don't want more Slack noise. Pivot to in-app notifications or email digests.**
```

**为什么这个过程是好的：**
- 假设真的被测试了，而不是直接开发
- 实验很轻（手动发 Slack 消息，而不是先做完整集成）
- 结果明确说明假设错了
- 团队在浪费工程资源前就砍掉了这个 epic