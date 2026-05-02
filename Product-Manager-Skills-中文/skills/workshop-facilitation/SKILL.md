---
name: workshop-facilitation
description: 以单步、多轮的方式主持 workshop。适用于任何需要稳定节奏、选项和进度跟踪的交互式 skill。
intent: >-
  为交互式 skills 提供标准 facilitation 模式：逐步推进，清晰展示进度，在决策点提供适应性建议，并可预测地处理中断。
type: interactive
theme: workshops-facilitation
best_for:
  - "为任何 PM workshop 或引导式 session 添加结构化 facilitation"
  - "运行带有编号建议和进度跟踪的交互式 session"
  - "确保 workshop 不偏离主题，并以可执行的选择收尾"
scenarios:
  - "我想和产品团队进行一次结构化的 positioning workshop，先设定好 facilitation 协议"
  - "帮我主持 discovery sprint kickoff，需要有清晰的问题、选项和进度标签"
estimated_time: "视 workshop 而定"
---

## 目的

为交互式 skills 提供标准 facilitation 模式：逐步推进，清晰展示进度，在决策点提供适应性建议，并可预测地处理中断。

## 关键概念
- **逐步推进:** 每一轮只提出一个有针对性的问题。
- **会话提示与进入模式:** 开始时先说明预期，再提供 `Guided`、`Context dump` 或 `Best guess` 模式。
- **进度可见性:** 展示面向用户的进度标签，例如 `Context Qx/8` 和 `Scoring Qx/5`。
- **决策点建议:** 仅在需要做出选择时才提供编号选项，而非每轮回答后都提供。
- **快速选择响应选项:** 对于常规的 context/scoring 问题，尽量提供简洁的编号选项；必要时添加 `Other (specify)`。
- **灵活的选择解析:** 接受 `#1`、`1`、`1 and 3`、`1,3` 或自定义文本，并能整合多选。
- **基于上下文的推进:** 根据先前的回答推进流程，不重复询问已明确的问题。
- **中断安全流程:** 遇到元问题时直接回答（例如“还剩几个？”），然后重述当前状态并继续。
- **快速路径:** 如果用户只想一次性获取结果，则跳过多轮 facilitation，直接提供压缩版输出。

## 应用
1. 先简要说明预计时长和问题数量。
2. 让用户选择进入方式：
   - `1` Guided mode（一次一个问题）
   - `2` Context dump（直接粘贴已知上下文，跳过重复问题）
   - `3` Best guess mode（缺失信息由系统推断，并标注假设）
3. 每轮仅处理一个问题，待用户回答后再继续。
4. 问题用直白语言表达；必要时提供一个简短的回答示例。
5. 每轮都显示进度：
   - 上下文收集阶段使用 `Context Qx/8`
   - 评估/打分阶段使用 `Scoring Qx/5`
6. 仅在能实质性提升建议质量时，才追加澄清问题。
7. 对常规 context/scoring 问题，在适当时提供快速选择编号选项：
   - 选项尽量简洁，且尽可能互斥。
   - 如果答案天然开放，则加入 `Other (specify)`。
   - 接受 `1,3` 或 `1 and 3` 这类多选回答。
8. 仅在决策点提供编号建议：
   - 完成上下文综合之后，
   - 完成成熟度/画像综合之后，
   - 进入优先级/行动计划选择时。
9. 接受编号或自定义选择，整合多选后继续推进。
10. 如果被元问题打断，先直接回答，再重述进度和当前待回答问题。
11. 如果用户说 stop/pause，立即暂停，等待明确的 resume 指令。
12. 最后用清晰总结收尾，说明已做出的决策；如果使用了 best guess mode，还需给出 `Assumptions to Validate` 列表。

## 示例
**开场白:**
"先说明一下：这次大概需要 7-10 分钟，问题大约 10 个。你想怎么开始？
1. Guided mode
2. Context dump
3. Best guess mode"

**用户:** "2"

**主持人:** "把你已经知道的内容贴过来。我会跳过已回答部分，只问还缺的。"

**综合后的决策点:**
1. **优先处理 Context Design** (推荐)
2. 优先处理 Agent Orchestration
3. 优先处理 Team-AI Facilitation

**用户:** "1 and 3"

**主持人:** "好。我们先处理 Context Design，同时将 Team-AI Facilitation 作为并行优先项。"

## 常见陷阱
- 一轮里同时问多个问题。
- 每次用户回答完都立刻给建议，导致交互拖沓。
- 只用简写标签，不给自然语言问题。
- 不展示进度，让用户不知道还剩多少。
- 忽视用户明确选的模式或自定义方向。
- 在 best-guess mode 下没有标出假设。

## 参考
- 将其作为交互式 facilitation 行为的唯一准绳。
- 与 `skills/*-workshop/SKILL.md` 和 advisor 风格的交互式 skills 搭配使用。