---
name: context-engineering-advisor
description: 诊断你是在做 context stuffing 还是 context engineering。适用于 AI 工作流显得臃肿、脆弱或难以稳定控制时。
intent: >-
  帮助产品经理判断自己做的是 **context stuffing**（无目的地堆上下文）还是 **context engineering**（为注意力设计结构）。用它识别 context boundary，修正 “Context Hoarding Disorder”，并落地 bounded domains、episodic retrieval、Research -> Plan -> Reset -> Implement 等实践。
type: interactive
theme: ai-agents
best_for:
  - "诊断 AI 工作流里到底是在堆上下文，还是在做真正的上下文设计"
  - "为 AI agents 设计更好的记忆与检索架构"
  - "通过结构化上下文设计提升 AI 输出质量"
scenarios:
  - "我已经给了 AI 很多信息，但输出还是一般，想知道问题在哪"
  - "我想为产品团队的多步 AI workflow 正确设计 context architecture"
estimated_time: "15-20 min"
---

## 目的

帮助产品经理判断自己做的是 **context stuffing** 还是 **context engineering**。用它识别 context boundary，修正 “Context Hoarding Disorder”，并落地 bounded domains、episodic retrieval、Research -> Plan -> Reset -> Implement 等实践。

**关键区别：** context stuffing 假设“信息越多越好”；context engineering 把 AI 的注意力当成稀缺资源来分配。

这不是 prompt 写作问题，而是 **信息架构设计问题**。目标是在不把 AI 淹没在噪音里的前提下，让它更可靠地贴近现实。

## 核心概念

### 范式转变：参数化智能 -> 上下文智能

**根本问题：**
- LLM 只有 **parametric knowledge**，也就是训练时学到的静态知识
- 一旦问到私有数据、实时信息或用户偏好，就只能幻觉或承认不知道
- **context engineering** 的作用，就是在静态训练和动态现实之间补桥

**PM 的角色变化：**
从“做功能的人”变成 **为 AI 搭建信息生态的人**

---

### Context Stuffing 与 Context Engineering 对比

| 维度 | Context Stuffing | Context Engineering |
|-----------|------------------|---------------------|
| 心态 | 量 = 质 | 结构 = 质 |
| 方法 | 全塞进去 | 先问当前到底在做什么决策 |
| 持久性 | 什么都持久化 | 按意图检索 |
| Agent 链条 | 每个 agent 都传全部 | 每个 agent 只拿有边界的上下文 |
| 失败响应 | 不行就多试几次 | 回去修结构 |
| 经济模型 | 上下文像仓库 | 上下文像注意力预算 |

**类比：**
context stuffing 像把整个文件柜搬进会议室；context engineering 像只带今天做决定真正需要的 3 份文件。

---

### 反模式：Context Stuffing

**五个典型信号：**
1. 本能地不断扩大 context window
2. 什么都想保留，以防万一
3. 多 agent 链条之间没有边界
4. 用反复重试掩盖结构不稳定
5. “跑 3 次就能成一次” 这种状态被默认接受

**为什么会失败：**
- 无关信息太多，推理噪音变大
- dead ends 和旧错误会累积，形成 context rot
- 模型容易只看开头和结尾，中间大量信息被忽略
- token 成本上升，但效果不升反降

---

### 真正的 Context Engineering：核心原则

1. **没有形状的上下文，本质上就是噪音**
2. **结构比体积更重要**
3. **按意图检索，不按“完整”检索**
4. **工作上下文要小**
5. **提高单位 token 的有效信息密度**

**一个简化的效率公式：**

```text
Efficiency = (Accuracy × Coherence) / (Tokens × Latency)
```

---

### 五个诊断问题

用下面五个问题判断你是不是在“囤上下文”：

1. **What specific decision does this support?**
2. **Can retrieval replace persistence?**
3. **Who owns the context boundary?**
4. **What fails if we exclude this?**
5. **Are we fixing structure or avoiding it?**

---

### 记忆架构：双层系统

**短期（对话）记忆**
- 存放当前对话上下文
- 生命周期是单次 session
- 旧内容会被压缩、总结或截断

**长期（持久）记忆**
- 存放用户偏好、关键事实、跨会话约束
- 典型实现是 vector database
- 包含两类：
  - **Declarative Memory**：事实
  - **Procedural Memory**：行为模式

---

### Research -> Plan -> Reset -> Implement 循环

这是解决 context rot 的核心循环：

1. **Research**：允许上下文大、乱、杂
2. **Plan**：把研究压缩成高密度 `SPEC.md` / `PLAN.md`
3. **Reset**：清空原上下文窗口
4. **Implement**：只用高密度计划重新开始执行

**为什么有效：**
研究阶段的噪音不会继续污染执行阶段。

---

### 反模式（它不是什么）

- **不是选 AI 工具**
- **不是写更花的 prompt**
- **不是拼命加 token**
- **不是让 AI 取代人类判断**

### 何时使用此技能

**适用：**
- 你总在粘整份 PRD / 全代码库
- AI 输出时好时坏
- token 花得更多，但质量没提升
- 你怀疑自己在做 context stuffing
- 你需要给 AI 产品能力设计上下文架构

**不适用：**
- 你才刚开始用 AI
- 你想要的是工具选型建议
- 你当前 AI 用法已经很稳定

---

### 协作引导的权威来源

默认交互协议使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md)。

本文件定义的是 context engineering 的领域逻辑。如有冲突，以本文件为准。

## 应用

这个交互式技能会通过 **自适应提问** 来判断你是否在做 context stuffing，找出边界问题，并给出可执行修复方案。

---

### 第 0 步：收集上下文

**Agent 提问：**

“在开始诊断前，先说说你现在怎么用 AI：

**当前 AI 使用情况**
- 用什么工具？ChatGPT、Claude、custom agents？
- 用来做什么？PRD、用户研究总结、discovery、分析？
- 你通常怎么给上下文？贴文档、引用文件、用项目记忆？

**症状**
- 输出是否时好时坏？
- 是否要反复 retry？
- 给了很多上下文但回答仍很虚？
- token 成本是否在涨？

**系统架构（如果有）**
- 你有没有 custom agents / workflows？
- agents 之间怎么传上下文？
- 是否使用 RAG、vector DB 或 memory 系统？”

---

### 第 1 步：诊断 Context Stuffing 症状

**Agent 提问：**

“下面这些症状，你中了哪些？可多选。”

1. 我总是把整份文档直接贴进去
2. 明明给了很多信息，AI 还是回答得很虚
3. 我得 retry 3 次以上才拿到可用结果
4. token 成本越来越高，但准确率没变好
5. 我总觉得‘再多给一点上下文也许就好了’
6. 我的 agents 会把所有信息层层全传下去
7. 我没有清楚的 include / exclude 标准
8. 都没有，我当前用得挺稳

**Agent 解读：**
- 0-1：上下文习惯基本健康
- 2-3：已有早期 stuffing 信号
- 4+：典型 Context Hoarding Disorder

---

### 第 2 步：诊断问题 1

**Agent 提问：**

“你现在给 AI 的每一块上下文，到底在支持哪个具体决策？”

如果你说不清具体决策，只是在说“我想让 AI 先理解我的产品”，那大概率已经进入 stuffing。

**最佳实践：**

先补完这句话：

> 我需要这段上下文，因为我正在决定 [某个具体决策]，没有 [某段具体信息] 我就做不了这个决定。

补不出来，就说明这段上下文大概率不该放进去。

---

### 第 3 步：诊断问题 2

**Agent 提问：**

“这段信息是每次都需要，还是可以按需检索？”

**始终需要（适合持久化）**
- 核心产品约束
- 用户偏好
- 关键定义
- 不可违反的规则

**情景式（适合检索）**
- 某个项目的细节
- 历史 PRD
- 老访谈记录
- 特定竞品分析

**经验法则：**
- 80% 以上交互都会用到：持久化
- 20% 以下交互才会用到：检索

---

### 第 4 步：诊断问题 3

**Agent 提问：**

“谁负责定义 context boundary？”

如果没人负责，这个边界就会无限长大。

**推荐做法：** 建一个 `Context Manifest`

```markdown
# Context Manifest

## 始终持久化
- [核心约束]
- [操作术语表]

## 按需检索
- [历史 PRD]
- [访谈记录]

## 排除项
- [过旧会议记录]
- [不相关材料]

## 边界负责人：[姓名]
## 最后审核日期：[日期]
```

---

### 第 5 步：诊断问题 4

**Agent 提问：**

“如果把这段上下文拿掉，具体会坏什么？”

这是最重要的证伪测试。

**好例子：**
- 如果没有 GDPR constraints，AI 可能推荐违法方案

**坏例子：**
- 如果没有这份老 PRD，AI 可能‘理解得没那么全面’

如果你说不出具体 failure mode，这段上下文通常可以删。

---

### 第 6 步：诊断问题 5

**Agent 提问：**

“你是在靠加更多上下文解决问题，还是在逃避更深的结构问题？”

很多 stuffing，本质上是在掩盖这些问题：
- 文档本身结构混乱
- 关键术语没定义
- 约束没文档化
- 多份信息彼此冲突

**真正的修法：**
- 文档混乱 -> 先清理权威来源
- 术语不清 -> 建操作术语表
- 约束缺失 -> 建约束注册表
- 信息冲突 -> 先统一再喂 AI

---

### 第 7 步：定义记忆架构

**Agent 提问：**

“基于前面的判断，我们来设计双层 memory architecture：

**短期记忆**
- 只保留当前 session 必需内容

**长期记忆**
- 保留偏好、约束、术语表、关键事实

**检索策略**
- 对情景式上下文用语义搜索
- 按查询意图检索，不按‘尽可能多’检索

你要我继续做哪一步？
1. 生成上下文架构蓝图
2. 给实施指导
3. 帮你设计检索策略”

---

### 第 8 步：实施 Research -> Plan -> Reset -> Implement

**Agent 提问：**

“接下来把 `Research -> Plan -> Reset -> Implement` 落到你的流程里：

1. **Research**：允许上下文大且混乱
2. **Plan**：压缩成高密度 `PLAN.md`
3. **Reset**：清掉研究阶段上下文
4. **Implement**：在新 session 里只带 `PLAN.md`

你现在更需要哪一种？
1. 一个 `PLAN.md` 模板
2. 一个实际示例
3. 一套落地步骤”

---

### 第 9 步：行动计划与后续步骤

**Agent 总结：**

“基于你的诊断结果，行动计划通常分三层：

**立即修复（本周）**
1. 删掉过不了证伪测试的上下文
2. 下一个 AI 任务就按 Research -> Plan -> Reset -> Implement 跑
3. 建一个最小版 Context Manifest

**基础建设（接下来 2 周）**
1. 建约束注册表
2. 建操作术语表
3. 设计双层记忆架构

**长期优化（接下来 1 个月）**
1. 给情景式上下文上语义检索
2. 明确边界负责人 + 审核节奏
3. 继续压缩 token 用量，提高一致性”

## 示例

### 示例 1：独立 PM

一个独立 PM 每次都把整份 PRD 和全部访谈记录塞进 Claude，结果输出很虚、重试很多次。

**诊断：** 活跃的 Context Hoarding Disorder  
**干预：** 删掉没明确 failure mode 的上下文，补约束注册表，建术语表，并把流程改成 `Research -> Plan -> Reset -> Implement`

---

### 示例 2：多 Agent 工作流

Agent A、B、C 层层传全部上下文，最后 window 爆炸。

**诊断：** agent 编排没有边界  
**干预：** 给每个 agent 限定上下文，只传高密度摘要，不传全部原料

---

### 示例 3：企业 RAG

RAG 一次性返回 50+ chunks，结果上下文窗口被淹没。

**诊断：** 检索没有意图，RAG 变成了另一种 stuffing  
**干预：** 限制 chunk 数量，补元数据，并按查询类型定义检索意图

## 常见陷阱

### 1. 相信“无限上下文”
**失败模式：** 觉得 1M token window 就应该用满

**后果：** 推理噪音上升，效果反而下降。

**修复：** 把 token 当稀缺预算，而不是免费仓库。

---

### 2. 重试而非重构
**失败模式：** 反复重试，而不回头修结构

**后果：** 浪费时间和钱，也掩盖更深层问题。

**修复：** 如果 retry 很常见，先修上下文结构。

---

### 3. 没有边界负责人
**失败模式：** 谁都能往里加内容

**后果：** 半年后每次 query 都变成 100k tokens。

**修复：** 设边界负责人，并建立 Context Manifest。

---

### 4. 混淆始终需要与情景式内容
**失败模式：** 把本应按需检索的历史内容长期常驻

**后果：** 工作上下文被无关信息挤满。

**修复：** 高频信息持久化，低频信息检索。

---

### 5. 跳过 Reset 阶段
**失败模式：** Research 后直接带着全部噪音继续做 Implement

**后果：** context rot 会一路污染后续执行。

**修复：** Reset 是强制步骤，不要跳。

## 参考资料

### 相关技能
- `ai-shaped-readiness-advisor`
- `problem-statement`
- `epic-hypothesis`
- `pol-probe-advisor`

### 外部框架
- Dean Peters: *Context Stuffing Is Not Context Engineering*
- Teresa Torres: *Continuous Discovery Habits*
- Marty Cagan: *Empowered*
- Anthropic: Contextual Retrieval

### 技术参考
- RAG
- Vector Databases
- Contextual Retrieval
- LLM-as-Judge