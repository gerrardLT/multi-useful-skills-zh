# v0.75 - 教学优先：让这个仓库回归它真正的用途

**发布日期：** 2026 年 3 月 17 日

---

## 发生了什么

最近有位贡献者出于好意，给一个 skill 提交了改进。他花了时间，消耗了 tokens，也遵守了结构规则。结果做出了一个更紧凑、更高效的 skill，但它反而变差了。原本帮助学习的脚手架没了。反模式被压缩成脚注。示例只展示结果，不再展示推理过程。

这不是他们的错。他们读到的文档，比如 `CONTRIBUTING.md`、`CLAUDE.md`、`AGENTS.md`，告诉了他们 skill 该怎么排版、怎么组织结构、该包含哪些部分，但没有任何一份文档清楚说明 skill 到底*是拿来做什么的*。

这是我们的失误。现在已经修正。

---

## 这个仓库真正的用途

这个仓库不仅是为了给你的 agent 增加 skills，它同样肩负着一个任务：**帮助产品经理把自己的专业能力打磨得更强，并把经验传递给后来者。**

这里的 skills 同时服务这两个目标。它们一方面让 AI agents 能以专业水准完成 PM 工作，另一方面也帮助人类 PM 理解框架背后的*为什么*，这样他们才能解释、调整并传授这些方法。一个 PM 把 skill 交给同事时，对方应该能从中学到东西，而不是只会照抄。把 skill 交给 agent 时，PM 也应该明白 agent 在做什么，并能解释为什么这样做有效。

---

## ABC - Always Be Coaching（始终以教练方式引导）

**ABC: Always Be Coaching** 是这个仓库中每一个 skill、每一次贡献、每一个 agent 都必须遵守的核心原则。

落到实践里，意味着：
- 解释是承重结构，不是装饰
- 反模式和正确模式同样重要，它们能教读者在真实场景里识别问题
- 示例要展示推理，而不只是输出
- 交互式 skills 要通过探索过程进行引导，而不只是收集答案
- 为了让文案更紧凑而删掉学习脚手架，这不是优化，而是缺陷

如果你在修改时不确定删掉的是废话，还是删掉了教学价值，那就先别删。

---

## v0.75 改了什么

### `README.md`
- 任务陈述更新为：“帮助产品经理把自己的专业能力打磨得更强，并帮助他们把经验传递给后来者。”
- 新增 **Design Philosophy** 部分，明确写出双重使命和 ABC 原则
- 重写 “What This Is” 部分，明确两类受众：培养判断力的人类 PM，以及执行工作的 AI agents
- 更新 command 层的说明，明确两类受众都在服务范围内

### `CONTRIBUTING.md`
- 在开头后立刻新增 **Design Philosophy - Read This First** 部分
- 直接点名最常见的贡献错误：为了让文案更紧凑而删减解释
- 在 Quality Checklist 中把 **Pedagogic** 放到第一项
- 在 **What We Won't Accept** 中新增一条：不接受通过删掉教学价值来换效率的修改

### `CLAUDE.md`
- 在 **Your Role** 前新增 **Design Philosophy** 部分
- **Your Role** 更新为：“pedagogic collaborator and skill extraction partner”
- 在 agent 职责中新增：“当解释因为追求简短而被删掉时，要提出反对”
- 更新 **Meta-Reminder**，把 ABC 和“人类学习者”写入核心使命
- 项目状态更新为 v0.75

### `AGENTS.md`
- 在最上方新增 **Operating Philosophy** 部分，放在所有结构性说明之前
- 明确指出一种失败模式：为了简短而牺牲解释，这种行为本身就是有问题的
- 更新 **Skill Quality Expectations**：把 pedagogic-first 放在第一位，并明确反模式不是可选项

---

## 为什么现在做这件事

这不是一次计划内发布。它是被一次暴露出缺口的贡献触发的。教学优先的理念原本就存在于仓库里，比如 `STREAMLIT_INTERFACE.md`、`docs/Add-a-Skill Utility Guide.md`、`MARKETPLACE_STRATEGY.md`，但在 agent 和贡献者动手前最先会读到的文档里，却没有写明这一点。

一个没有写进治理文档的原则，不算真正的原则，只能算一种希望。

现在它已经写进治理文档了。

---

## LinkedIn 文案

> I built this PM skills repo to send the ladder down.
>
> This repo does two things in equal measure: it adds battle-tested skills to your AI agent, and it helps product managers understand *why* the frameworks work - so they can teach the reasoning to colleagues, explain it to stakeholders, and build real judgment, not just faster outputs.
>
> A contributor recently made a well-intentioned improvement that stripped out the learning scaffolding in favor of tighter copy. It wasn't their fault - our docs never clearly said that preserving that value is non-negotiable. I owe them an apology, and I'll work with them to bring in the efficiencies while keeping the teaching.
>
> So we fixed the docs. v0.75 adds an explicit Design Philosophy to CONTRIBUTING.md, CLAUDE.md, AGENTS.md, and README.md. A key governing principle: **ABC - Always Be Coaching.**
>
> A skill that makes you faster but leaves you no smarter is a prompt. We're building something better than that.
>
> 馃憞 Repo link in comments.

---

*本次发布由 Dean Peters 与 Claude Code 共同完成。*