# 客户旅程地图示例

## Meta Dogfooding 示例：Product Manager Skills Repo

这个示例有意把我们自己的仓库旅程画出来，用来体现 dogfooding 的工作原则：我们要求别人使用的 PM 产物和质量标准，先拿自己来跑一遍。

```markdown
## 客户旅程地图：AI-Forward PM Lead (Product Manager Skills)

### 产品
Product Manager Skills（面向 Claude/Codex agentic workflows 的开源 PM skill 库）

### 用户画像
- AI-Forward PM Lead: B2B SaaS 公司（20-300 人）的 PM leader，需要更快推进 discovery/delivery，对 AI hype 保持怀疑，更重视可复用的实战框架和工作流

### 目标
- 提升 PM skills 在真实产品工作流中的有效采纳
- 提高用户从 discovery 到首次成功使用 skill 的首周激活率
- 提高复用率和贡献行为

| **阶段** | **认知** | **考虑** | **决策** | **服务** | **忠诚** |
|---|---|---|---|---|---|
| **用户行为** | 看到 LinkedIn/Substack 帖子，从同行处听说该仓库，搜索适用于 Claude/Codex 的 PM skills | 阅读 README，浏览 skill 目录，与 prompt 库比较，查看文档 | 克隆仓库，选择 1-2 个 skill，运行首个引导流程，评估输出质量 | 在规划/discovery 循环中使用多个 skill，调整输出，在内部分享 | 作为默认 PM 操作层重复使用，推荐给同行，提交 issue/PR |
| **触点** | LinkedIn 帖子、Substack、GitHub 仓库/搜索、社区提及 | README、CLAUDE.md、使用文档、各个 SKILL.md 文件 | 终端/Codex/Claude 会话、skill 文件、辅助脚本、快速入门文档 | Skill 工作流、脚本、文档、发布说明、提交历史 | GitHub issues/PRs、发布说明、文档更新、公告 |
| **用户体验** | 好奇但怀疑：“这实用吗，还是只是 prompt 表演？” | 感兴趣但信息过载：“我应该先用哪个 skill？” | 充满希望但焦虑：“这在我的真实场景中能用吗？” | 当输出可复用时感到宽慰；如果行为不一致则感到沮丧 | 自信且投入：“这给了我的团队一个可重复的优势。” |
| **关键指标** | GitHub 页面浏览量、独立访客、引荐来源组合、每位访客的 star 率 | README 到文档的点击率、文档停留时间、skill 页面打开次数、首次安装意向 | 首次运行成功率、首次可用输出时间、设置流失率、48 小时内回访率 | 周活跃用户（代理）、多 skill 使用率、工作流完成率、破损模式的 issue 率 | 重复贡献者数量、PR 数量/质量、引荐流量、活跃用户留存率 |
| **业务目标** | 触达合格的 PM/PMM/Founder 受众，定位为实用且 agent-ready | 降低认知负荷，帮助用户快速选择正确的首个 skill | 最小化设置摩擦，在首次会话中证明价值 | 保持 skill 间质量一致，提高工作流层面的采纳率 | 通过一致性构建贡献者飞轮和信任 |
| **涉及团队** | 内容/作者、社区、维护者 | 维护者、文档负责人、skill 作者 | 维护者、贡献者、工具/脚本维护者 | Skill 作者、审阅者、维护者 | 核心维护者、贡献者、社区倡导者 |

### 分析
**前 3 个优先机会：**
1. first-skill onboarding path：增加一个 “Start Here (15 min)” 流程，把用户画像映射到首批 3 个推荐 skill
2. consistency guardrails：把共享 facilitation rules 集中管理，并对所有关联 skill 自动检查
3. activation instrumentation：定义轻量指标来衡量首跑成功率和多 skill 采纳率

### 待验证假设
1. 主要用户画像是 B2B SaaS 团队里的 PM leads
2. 大部分 discovery traffic 起点是 GitHub 和社交内容
3. 最大阻力是 “第一个 skill 该用哪个？” 以及跨 skill 一致性
```