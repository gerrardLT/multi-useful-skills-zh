---
name: skill-authoring-workflow
description: 将原始 PM 内容转成合规、可发布的 skill。适用于创建或更新 repo skill 且不破坏标准时。
intent: >-
  以不混乱的方式创建或更新 PM skills。这个工作流会把粗糙笔记、工作坊内容或半成品 prompt 堆，转成真正能通过校验、也确实属于本仓库的合规 `skills/<skill-name>/SKILL.md` 资产。
type: workflow
best_for:
  - "根据笔记或源材料创建新的 repo skill"
  - "在保持标准完整的前提下更新已有 skill"
  - "在 commit 前跑完整个编写与校验工作流"
scenarios:
  - "帮我把这些 workshop notes 变成一个新的 PM skill"
  - "我需要更新一个已有 skill，但又不能破坏 repo 标准"
  - "在这个 repo 里编写新 skill 应该走什么工作流？"
---

## 目的

以不混乱的方式创建或更新 PM skills。这个工作流会把粗糙笔记、工作坊内容或半成品 prompt 堆，转成真正能通过校验、也确实属于本仓库的合规 `skills/<skill-name>/SKILL.md` 资产。

适用于你想发布一个新 skill，又不想靠“我觉得看起来差不多”这种轮盘赌方式时。

## 关键概念

### 优先使用仓库原生工具

先用仓库原生工具和标准，不要先发明自定义流程：
- `scripts/find-a-skill.sh`
- `scripts/add-a-skill.sh`
- `scripts/build-a-skill.sh`
- `scripts/test-a-skill.sh`
- `scripts/check-skill-metadata.py`

### 选择正确的创建路径

- **引导式向导（`build-a-skill.sh`）：** 适合你有想法，但还没有最终文案时。
- **内容优先生成器（`add-a-skill.sh`）：** 适合你已经有源内容时。
- **手动修改 + 校验：** 适合收紧和修整已有 skill。

### 完成标准（无一例外）

只有在以下条件全部满足时，skill 才算完成：
1. Frontmatter 合法（`name`、`description`、`intent`、`type`）
2. 章节顺序符合规范
3. Metadata 限制得到满足（`name` <= 64 chars，`description` <= 200 chars）
4. Description 同时说明了 skill 做什么，以及什么时候该用
5. Intent 提供更完整、面向仓库语境的摘要，而不是取代面向触发的 description
6. 交叉引用都能正常解析
7. README 目录计数和表格已经更新（如果有新增/删除 skill）

### 引导流程的唯一准则

当你把这个工作流当作引导式对话来运行时，使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为交互协议。

它定义了：
- session heads-up + 进入模式（Guided、Context dump、Best guess）
- 一次只问一个问题，并使用通俗语言
- 进度标签（例如 Context Qx/8 和 Scoring Qx/5）
- 中断处理与暂停/恢复行为
- 在决策点给出编号推荐
- 常规问题使用编号式快速选项（适合时包含 `Other (specify)`）

这个文件定义的是工作流顺序和领域输出要求。如果两者有冲突，以本文件的工作流逻辑为准。

## 应用

### Phase 1: 预检（避免重复劳动）

1. 搜索是否已有重叠技能：

```bash
./scripts/find-a-skill.sh --keyword "<topic>"
```

2. 判断类型：
- **Component**：单个产物/模板
- **Interactive**：3-5 个自适应问题 + 编号选项
- **Workflow**：多阶段编排流程

### Phase 2: 生成草稿

如果你已经有源材料：

```bash
./scripts/add-a-skill.sh research/your-framework.md
```

如果你想走引导式提示：

```bash
./scripts/build-a-skill.sh
```

### Phase 3: 收紧 Skill

手动检查以下内容：
- 清晰说明“什么时候使用”
- 至少一个具体示例
- 至少一个明确反模式
- 没有废话或空泛顾问腔

### Phase 4: 严格校验

在考虑 commit 之前，先跑严格检查：

```bash
./scripts/test-a-skill.sh --skill <skill-name> --smoke
python3 scripts/check-skill-metadata.py skills/<skill-name>/SKILL.md
python3 scripts/check-skill-triggers.py skills/<skill-name>/SKILL.md --show-cases
```

### Phase 5: 接入仓库文档

如果这是一个新 skill：
1. 把它加到正确的 README 分类表里
2. 更新 skill 总数和分类计数
3. 确认链接路径都能正常解析

### Phase 6: 可选打包

如果目标是上传到 Claude 自定义 skill：

```bash
./scripts/zip-a-skill.sh --skill <skill-name>
# 或者打包一个分类：
./scripts/zip-a-skill.sh --type component --output dist/skill-zips
# 或者使用精选 starter 预设：
./scripts/zip-a-skill.sh --preset core-pm --output dist/skill-zips
```

## 示例

### 示例：把 Workshop Notes 变成一个 Skill

输入：`research/pricing-workshop-notes.md`  
目标：新的 interactive advisor

```bash
./scripts/add-a-skill.sh research/pricing-workshop-notes.md
./scripts/test-a-skill.sh --skill <new-skill-name> --smoke
python3 scripts/check-skill-metadata.py skills/<new-skill-name>/SKILL.md
```

预期结果：
- 新的 skill 文件夹已创建
- Skill 通过结构与 metadata 校验
- README 目录条目已新增或更新

### 反模式示例

“我们写了个很酷的 skill，跳过了校验，忘了更新 README 计数，然后就直接发布了。”

结果：
- 引用损坏
- 目录数字不一致
- 贡献者和用户都会困惑

## 常见坑

- 交付的是感觉，不是标准。
- 任务本质上是 component template，却误选了 `workflow`。
- 描述过长，超出上传限制。
- 描述只说这个 skill 是什么，却没说 Claude 什么时候该触发它。
- 描述悄悄碰到 200-char 限制，结果中途被截断。
- 让 `intent` 变成弱触发描述的替代品。
- 新增 skill 后忘了更新 README 计数。
- 把生成内容当最终稿，没做人工审查。

## 参考

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `docs/Building PM Skills.md`
- `docs/Add-a-Skill Utility Guide.md`
- Anthropic's [Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
- `scripts/add-a-skill.sh`
- `scripts/build-a-skill.sh`
- `scripts/find-a-skill.sh`
- `scripts/test-a-skill.sh`
- `scripts/check-skill-metadata.py`
- `scripts/check-skill-triggers.py`
- `scripts/zip-a-skill.sh`