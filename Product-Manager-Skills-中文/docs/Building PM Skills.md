# 构建 PM Skills

这份指南说明了：我们如何把真实世界里的 PM 框架和源材料，转成这个仓库里可供 agent 使用的 skills。
Anthropic 的 [Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) 是一个不错的补充参考，适用于检查 trigger 设计、测试和打包要求。优先使用本仓库自己的标准，再把 Anthropic 的指南当作额外质量校验。
## 本地克隆快速开始
适用于直接在本地克隆仓库中工作的贡献者：

```bash
# 1) Clone and enter repo
git clone https://github.com/deanpeters/Product-Manager-Skills.git
cd Product-Manager-Skills

# 2) Build a skill (guided wizard)
./scripts/build-a-skill.sh

# 3) Or generate from source content
./scripts/add-a-skill.sh research/your-framework.md

# 4) Validate strict conformance
./scripts/test-a-skill.sh --skill your-skill-name --smoke

# 5) Optional: Build Claude upload ZIP
./scripts/zip-a-skill.sh --skill your-skill-name
```

如果你新增了 skill，之后记得更新 `README.md` 里的 catalog 条目。
## 三种方式

**1. 自动化（大多数场景推荐）**  
使用 `scripts/add-a-skill.sh`，把原始 PM 内容自动转成正式 skill。这个工具会分析你的内容、建议结构、生成文件、校验 metadata，并更新文档。
```bash
./scripts/add-a-skill.sh research/your-framework.md
```

完整说明见 [`Add-a-Skill Utility Guide.md`](Add-a-Skill%20Utility%20Guide.md)。
**2. 引导向导（Build-a-Bear 风格）**  
使用 `scripts/build-a-skill.sh` 进入多轮交互流程。它会按顺序提示 frontmatter 和每个必需章节，然后写出合规 skill 并完成校验。
```bash
./scripts/build-a-skill.sh
```

**3. 手动方式（本指南）**  
当你需要完全控制结构和内容，或者在迭代已有 skill 时，就按下面的步骤手动创建。
## 配套工具

用这些工具加快发现和质量检查：

```bash
# Find existing skills before creating a new one
./scripts/find-a-skill.sh --keyword pricing --type interactive

# Test one skill with strict conformance + smoke checks
./scripts/test-a-skill.sh --skill your-skill-name --smoke

# Audit trigger wording and sample test prompts
python3 scripts/check-skill-triggers.py skills/your-skill-name/SKILL.md --show-cases
```

## 什么才算 Skill

Skill 是一种可复用框架，能产出明确结果，并且可以跨公司或产品场景复用。
| If it is... | Then it is... |
| --- | --- |
| A repeatable framework with a concrete output | A skill |
| One-off advice or tips | A prompt |
| Long-form context or theory | Research |

## 选择 Skill 类型

选择能完成任务的最小类型。
- Component：单一交付物模板或产物。适合 PRD 章节、user story、statement、canvas。
- Interactive：带有 3-5 个问题和 3-5 个编号推荐的引导式决策流程。
- Workflow：一个多阶段流程，会编排其他 skills，并包含决策点。
## 提炼源材料
使用源材料（文章、书籍、内部 playbook），提炼出让框架真正可运转的最小要素。
- Outcome：这个 skill 帮助产出什么。
- Audience：输出是给谁看的，他们关心什么。
- Steps：最小且可靠的步骤序列，能把人带到结果。
- Decisions：关键分叉点，以及每个分支该怎么做。
- Pitfalls：这个框架试图避免的常见失败模式。
- Definitions：读者可能不懂的术语。
- Examples：至少一个强示例和一个明确反模式。
## 起草 Skill 文件

在 `skills/<skill-name>/SKILL.md` 中创建新文件夹，命名使用小写 kebab-case。每个 skill 都必须遵守标准章节顺序和 frontmatter 字段。
```markdown
---
name: skill-name
description: What it does + when to use it in user language. Prefer "适用于..." and keep it ≤ 200 chars for Claude web uploads.
intent: Longer repo-facing summary of the skill's purpose and why it exists.
type: component
---

## 目的

## 关键概念

## 应用

## 示例

## 常见陷阱

## 参考
```

## 质量标准

- 语言要有立场，而且务实。
- 使用短段落和具体指令。
- 包含一个清晰示例和一个明确反模式。
- 术语首次出现时要给出定义。
- 明确写出权衡。
- 如果你计划上传到 Claude web custom skills，保持 `name` <= 64 chars，`description` <= 200 chars。
- 把 description 当成 trigger metadata，而不是营销文案。它应该说明 skill 做什么，以及 Claude 什么时候该加载它。
- 用 `intent` 承载更完整、面向仓库语境的说明。它应当扩展 purpose，而不是替代简短的 trigger-oriented `description`。
## 可选脚本（确定性辅助）

有些 skills 适合配套小型确定性辅助脚本（计算器、模板生成器）。如果你要加：
- 放在 `skills/<skill-name>/scripts/`。
- 保持确定性（不走网络、没有外部依赖）。
- 在 skill 文件的 Application 里说明使用方法。
## 示例：把 Substack 文章变成 Product Demo Skill

假设源内容是一篇关于 demo 后悔和 stage fright 的文章。目标是帮助 PM 设计一场真正打动听众、并避开常见陷阱的 demo。
**决策：** 如果你想要多阶段执行（briefing、narrative、rehearsal、contingency），它大概率应该是 workflow。如果你只想做一个简短 Q and A 流程，输出 demo 大纲，那它更适合做成 interactive。
示例 workflow frontmatter 和结构：

```markdown
---
name: product-demo
description: Plan and run product demos that land with the audience, avoid demo regret, and include rehearsal and contingency planning。适用于preparing a demo for stakeholders, customers, or executives.
intent: Turn demo prep into a repeatable workflow that sharpens the story, reduces delivery risk, and keeps the audience's decision in view.
type: workflow
---

## 目的
Define the demo goal, anchor the story to the audience, and reduce risk before presenting.

## 关键概念
- Demo regret: When a demo shows features but fails to prove value.
- Stage fright: Performance anxiety that affects delivery and clarity.
- Aha moment: The single proof point the demo must land.

## 应用
1. Intake: audience, goal, time, decision at stake.
2. Narrative: problem, constraint, proof, payoff.
3. Flow: 5-7 minute core path, optional branches.
4. Rehearsal: 2 dry runs, one with interruptions.
5. Contingency: offline backup, screenshots, and failure plan.

## 示例
- Good: 8-minute enterprise demo that anchors on a single outcome and shows proof in the first 2 minutes.
- Anti-pattern: Feature tour with no stated decision or success criterion.

## 常见陷阱
- Overstuffed flow that can only succeed if the demo is perfect.
- No backup path when the system fails.

## 参考
- Stage fright is real. So is product demo regret. (source post)
```

## Repo 检查清单
- 把 skill 放到 `skills/<skill-name>/SKILL.md`，并确保 frontmatter 正确。
- 更新 `README.md` 中的 catalog 计数和表格。
- 在适合的地方链接相关 skills。
- 用 `rg "<skill-name>"` 快速扫描，确认引用是否正确。