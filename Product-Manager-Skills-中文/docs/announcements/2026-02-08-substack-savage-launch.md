# Substack 草稿（犀利版 + 技术版）- 2026 年 2 月 8 日

## 标题

为你的 Agent 赋能产品管理技能（因为“把 Prompt 写得更好”并不等于系统）

## 副标题

从 Prompt 轮盘赌，走向可复用的 PM 工作操作系统。

## 草稿

我先帮你少走点弯路。

如果你的 AI 工作流是“打开聊天框，写一段自以为很猛的 Prompt，然后开始祈祷”，那你根本没有工作流。
你只是有一台老虎机。

做玩具任务也许还行。
拿来做真正的产品管理工作，就很糟糕。

所以我做了这个：
[Product Manager Skills](https://github.com/deanpeters/Product-Manager-Skills)

这不是 Prompt 大杂烩。
而是一套 Skills 系统。

我做了 20 年 PM，此前还做了 15 年软件工程师。现在我只关心一件事：
当日程已经炸锅、干系人不耐烦、团队中午前还必须出结论时，这套东西到底能不能用？

我现在的使命，就是把梯子放下来，帮下一代 PM 更快爬上来。
这也是为什么我为自己过去 3.5 年在 [Productside](https://productside.com/) 做的工作感到自豪。

## 我们是怎么走到这里的（按版本）

- **v0.05（2026 年 2 月 1 日）：** 起点是**我自己的 Prompting 仓库**，以及和 Claude 一起做的早期 Chatbot 工作流探索。  
  [Product Manager Prompts](https://github.com/deanpeters/product-manager-prompts)
- **v0.1（2026 年 2 月 4 日）：** 基于**我挑选出的 Substack 文章**。先由 Claude 起草，再由 Codex 清理和打磨，使其达到更广泛 Skills 市场分发所需的标准。  
  [Dean Peters on Substack](https://deanpeters.substack.com/)
- **v0.2（2026 年 2 月 8 日）：** **灵感来自** Productside 的 Optimal Product Management 和 Digital Product Management 课程里讲授的那些指标，以及 AI Product Management 课程中的 “build-a-whatever” / “test-a-whatever” 活动与模板。模式不变：Claude 打草稿，Codex 负责交付。  
  [Productside Product Management Courses](https://productside.com/product-management-courses/)

## 这个仓库本质上是什么

三层结构：

- **Component skills：** 可复用的产物与模板
- **Interactive skills：** 用于辅助决策的引导式提问流程
- **Workflow skills：** 端到端编排流程

说白了就是：
少一点“帮我写个 PRD 吧”，多一点“按一套有纪律、权衡清晰的流程来做事”。

## 双 Agent 工作流（很多人都在问）

核心方法就是：

1. **Claude 负责勾勒**结构、选项和第一版草稿。
2. **Codex 负责定稿**，包括实现、跑测试、修边角问题、执行合规要求。

为什么这样拆？

- Claude 适合快速生成第一版结构。
- Codex 适合做文件级精修、验证和标准执行。

可以理解为：一个 Agent 负责创意速度，另一个 Agent 负责生产级收尾。

在这个仓库里，“完成”意味着通过明确关卡，而不是“聊天里看起来还不错”。

```bash
# Strict conformance for all skills
python3 scripts/check-skill-metadata.py

# Deep check for one skill
./scripts/test-a-skill.sh --skill finance-based-pricing-advisor --smoke
```

如果没通过，它就不是“基本完成”。
它就是没完成。

## 技术现实（不玩虚的）

现在你可以用可预测的辅助脚本来构建、查找和测试 Skills：

```bash
# Build a skill through a guided wizard
./scripts/build-a-skill.sh

# Find existing skills by type + keyword
./scripts/find-a-skill.sh --keyword pricing --type interactive

# Test one skill with conformance + smoke checks
./scripts/test-a-skill.sh --skill finance-based-pricing-advisor --smoke

# Convert raw content into skills (AI-assisted)
./scripts/add-a-skill.sh research/your-framework.md
```

没错，这里有严格的一致性校验，因为“差不多就行”正是质量开始腐烂的地方。

## 最小示例

连 Metadata 都被当成契约来对待：

```yaml
---
name: feature-investment-advisor
description: Evaluate feature investments using revenue impact, cost structure, ROI, and strategic value.
type: interactive
---
```

结构一旦松散，就会校验失败。
理应如此。

## 实用 Prompt 模式

让 Agent 使用 Skill 时，不要给模糊指令。
要给清晰的执行上下文：

```text
Use skills/feature-investment-advisor/SKILL.md.
Run the interactive flow step-by-step.
Ask one question at a time.
At the end, give me:
1) recommendation
2) assumptions
3) key risks
4) what data would change the decision.
```

光这一个改动，就能消掉很多“AI 糊状物”。

## 为什么这很重要

大多数 PM 表现不佳，并不是因为不努力。
而是因为他们背后的系统太空泛、太泛化、也太脆弱。

Prompts 有用，但大多只是一次性的糖分刺激。
Skills 才是可复用的操作系统。

如果你是新 PM，它应该能帮你更快成长。
如果你经验丰富，我很期待你的质疑和贡献。

不吹概念。
不装 PM。
只做真正能用的框架。

从这里开始：
[Product Manager Skills](https://github.com/deanpeters/Product-Manager-Skills)