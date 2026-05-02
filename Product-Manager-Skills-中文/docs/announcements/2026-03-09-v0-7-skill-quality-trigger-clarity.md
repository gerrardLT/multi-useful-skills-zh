# v0.7 发布公告（2026 年 3 月 9 日）- 更锋利的 Skills，更快的发现路径

## 帖子元数据

- **Post Title:** Product Manager Skills v0.7 - 更清晰的 Skill 触发、更好的发现体验、第一天就更有价值
- **Post Subtitle:** 当你正处在真实工作中时，现在更容易找到、信任并运行正确的 PM skill。
- **Opening (first 160 chars):** v0.7 用更清晰的触发语、更强的 metadata 和更简单的自然语言发现流程，帮你更快找到合适的 PM skill。
- **Primary Link:** [Product Manager Skills repo](https://github.com/deanpeters/Product-Manager-Skills)

---

## 短版宣传帖

我们一直在推动这个库边增长边保持锋利。

v0.7 只聚焦一件事：

帮你更快找到*正确的* PM skill。

## 这对你有什么价值
- 更少搜索成本
- 更准确的激活
- 更容易建立信任
- 更友好的发现体验
- 从问题出发，而不是从分类体系出发

## 改了什么
- 整个技能库都换成了更锋利、以触发场景为导向的 skill 描述
- 新增 `intent` metadata，让每个 skill 既能保持简洁触发语，也能保留更完整的仓库内用途说明
- 对 metadata 质量的校验更严格，不再只检查文件结构
- 标准库检查中加入了 trigger readiness 审计
- `find-a-skill.sh` 新增 trigger-oriented 模式，让发现流程不只靠关键词，而能利用真实使用线索
- Streamlit（beta）新增 `Find My Skill` 模式，你可以直接用自然语言描述需求，然后拿到推荐优先的 skills 列表

## 为什么做这个版本

发布地址：[Product Manager Skills v0.7](https://github.com/deanpeters/Product-Manager-Skills)

---

## 长文草稿

### 标题
Product Manager Skills v0.7: Find the Right Skill Faster

### 副标题
为什么更好的触发语和更好的发现能力，比单纯增加更多 skills 更重要

### 正文

一个 skills 库随着时间变差，最常见的方式之一就是发生细微漂移。

不是明显崩坏。
不是文件缺失。
不是一眼就能看出的 bug。

而是漂移。

描述能解释一个 skill 是什么，却不能说明什么时候该用它。
框架本身很好，也完全成立，但越来越难被发现。
Metadata 对维护者有用，却帮不到那些想快速解决真实 PM 问题的人。
应用明明能运行 skills，但仍然没能先帮用户回答最基本的问题：

"Which skill should I use here?"

v0.7 就是在补上这个缺口。

我们一直在努力，让这个仓库不只是变大，更要持续符合标准。
因为一个拥有 46 个 skill 的库，只有在质量能和数量一起累积时，才会一直有价值。

这个版本聚焦五件事：

1. **更清晰的触发语**
   - 我们重写了 skill 描述，让它们更能回答两个问题：
     - 这个 skill 是做什么的？
     - 什么时候应该用它？
   - 实际上，这意味着更多 `Use when...` 风格的描述，减少模糊的一句话简介。
   - 这很重要，因为 skill 的激活和发现依赖的是清晰的触发语言，而不是聪明的命名。

2. **触发元数据与深层含义的更清晰分离**
   - 我们把 `intent` 加入为仓库标准的 frontmatter 字段。
   - `description` 现在保持简短、清晰、以触发场景为导向。
   - `intent` 用来承载更完整、面向仓库语境的 skill 本质用途说明。
   - 这样既提升了用户的发现体验，也保留了贡献者和维护者需要的深层含义。

3. **更高的标准，强制执行**
   - 我们扩展了校验范围，让仓库检查的不只是结构。
   - 新增审计现在可以发现：
     - 薄弱或模糊的触发描述
     - 过度裁剪或有风险的描述
     - frontmatter 中缺失的触发示例
   - 这意味着质量不再那么依赖记忆、个人品味或运气。

4. **随着库增长，更好的发现能力**
   - 我们为 `scripts/find-a-skill.sh` 增加了面向 trigger 的发现模式。
   - 现在它可以跨 `description`、`best_for` 和 `scenarios` 搜索，并把这些线索直接展示在结果列表中。
   - 这很重要，因为用户很少按分类体系思考，他们通常按场景思考：
     - “我需要决定这个要不要做”
     - “我需要做 discovery”
     - “我需要一个 PRD”
     - “我需要测试定价”

5. **为真实用户打造更友好的 Streamlit 路径**
   - 我们扩展了 Streamlit（beta）应用，把它拆分成 `Learn`、`Find My Skill` 和 `Run Skills` 三种模式。
   - 新的 `Find My Skill` 模式允许用户直接用自然语言描述情况，拿到推荐优先的匹配项，理解为什么合适，然后立刻预览或运行。
   - 这很重要，因为大多数人不是从分类体系开始的，而是从需求开始：
     - “帮我创建一个 PRD”
     - “我需要给路线图下注优先级”
     - “Activation 在下滑，我需要知道下一步该做什么”

v0.7 交付内容：
- Trigger-oriented description cleanup across the skill library
- New `intent` frontmatter field across all skills
- `scripts/check-skill-triggers.py` for trigger-readiness auditing
- Updated `scripts/test-library.sh` to include trigger auditing
- Updated skill-authoring docs and templates so future additions follow the tighter standard
- New `find-a-skill.sh --mode trigger` for discovery by real-world use case language
- Updated Streamlit (beta) app with `Learn`, `Find My Skill`, and `Run Skills` modes
- Added recommended-first skill suggestions and clearer preview/run actions in the Streamlit finder
- Cross-checked trigger improvements against Anthropic's [Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)

这对你为什么重要：

- **你能更快找到正确的 skill**
  - 更少靠文件名来翻找
  - 更多按用例和场景匹配
  - 当你想从“我到底要做什么”开始时，应用里的路径更简单

- **你能获得更可靠的激活效果**
  - Skills 的描述方式更容易让 agents 正确选中它们

- **你能更信任这个库**
  - 现在质量检查会自动强化标准执行

- **仓库会随着增长变得更强**
  - Skills 变多不一定意味着更混乱
  - v0.7 是在为“规模不要演变成熵增”提前投资

如果说 v0.65 是为了让更多人更容易进入这个库，那么 v0.7 就是为了让他们进来之后，这个库的行为更清晰、更干净。

这类版本的价值，会在每次有人问下面这个问题时持续兑现：

"Which skill should I use here?"

而他们能更快得到更好的答案。

这就是标准。