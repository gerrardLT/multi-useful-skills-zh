# Creation Log：Systematic Debugging Skill

这是一个关于如何抽取、结构化并做稳一个关键 skill 的参考示例。

## 源材料

从 `/Users/jesse/.claude/CLAUDE.md` 中抽取出的调试框架：
- 四阶段系统化流程（Investigation -> Pattern Analysis -> Hypothesis -> Implementation）
- 核心要求：**永远先找根因，绝不只修症状**
- 规则本身就是为了抵抗时间压力和合理化借口而设计的

## 抽取决策

**保留的内容：**
- 完整的四阶段框架及全部规则
- 反捷径条款（`"NEVER fix symptom"`、`"STOP and re-analyze"`）
- 抗压语言（`"even if faster"`、`"even if I seem in a hurry"`）
- 每个阶段的具体操作步骤

**去掉的内容：**
- 项目专属上下文
- 同一规则的重复表达
- 叙事型解释（压缩成原则）

## 结构设计（遵循 `skill-creation/SKILL.md`）

1. **丰富的 when_to_use** - 写入了症状和反模式
2. **类型：technique** - 它是一个带步骤的具体流程
3. **关键词** - `"root cause"`、`"symptom"`、`"workaround"`、`"debugging"`、`"investigation"`
4. **Flowchart** - 用来表达 “fix failed” 时，是重新分析还是继续叠更多修复
5. **按阶段拆解** - 采用便于扫描的 checklist 格式
6. **反模式章节** - 清楚写出不能做什么（对这个 skill 尤其关键）

## 防弹化元素

这个框架被设计成能在高压下抵抗合理化：

### 语言选择
- 用 `"ALWAYS"` / `"NEVER"`，而不是 `"should"` / `"try to"`
- 用 `"even if faster"` / `"even if I seem in a hurry"`
- 用 `"STOP and re-analyze"` 强制显式停顿
- 用 `"Don't skip past"` 直接命中常见错误动作

### 结构性防御
- **强制 Phase 1** - 不能直接跳进实现
- **单一假设规则** - 强迫思考，防止 shotgun fixes
- **明确失败分支** - 针对 `"IF your first fix doesn't work"` 给出强制动作
- **反模式章节** - 把那些“看起来很合理的捷径”直接点出来

### 冗余加强
- “必须找根因”同时出现在 overview、when_to_use、Phase 1 和 implementation rules 中
- `"NEVER fix symptom"` 在不同上下文里出现了 4 次
- 每个阶段都写了显式的 “don't skip” 指导

## 测试方式

按照 `skills/meta/testing-skills-with-subagents` 的方法，设计了 4 个验证测试：

### 测试 1：学术场景（无压力）
- 简单 bug，没有时间压力
- **结果：** 完全遵守，完整完成调查

### 测试 2：时间压力 + 明显的 quick fix
- 用户“很赶”，而且表面修法看起来很简单
- **结果：** 抵抗了捷径诱惑，完整走流程，并找到了真正根因

### 测试 3：复杂系统 + 高不确定性
- 多层系统故障，不确定是否真能定位根因
- **结果：** 仍然进行系统化调查，追到了所有层，最后找到了源头

### 测试 4：第一次修复失败
- 初始假设不成立，很容易继续叠更多修复
- **结果：** 停下、重新分析、形成新假设（没有走 shotgun 路线）

**全部测试通过。** 没发现新的合理化借口。

## 迭代记录

### 初始版本
- 完整四阶段框架
- 反模式章节
- 针对 “fix failed” 决策的 flowchart

### 增强 1：加入 TDD 引用
- 增加了指向 `skills/testing/test-driven-development` 的链接
- 补充了一条说明：TDD 的“最小实现”不等于调试里的“根因优先”
- 用来避免方法论混淆

## 最终结果

这个 skill 已经做到了：
- 明确强制根因调查
- 能抵抗时间压力下的合理化
- 为每个阶段提供了具体步骤
- 把反模式显式列出
- 在多种压力场景下做过测试
- 澄清了它和 TDD 的关系
- 可直接投入使用

## 关键洞察

**最重要的防弹化设计：** 反模式章节里明确写出那些“当下看起来很合理”的捷径。比如当 Claude 心里冒出“我先补一个 quick fix 吧”时，看到 skill 里已经把这种思路列为错误，会立刻制造认知阻力。

## 使用示例

当你遇到 bug：
1. 加载 skill：`skills/debugging/systematic-debugging`
2. 先读 overview（10 秒）- 提醒自己根因优先
3. 按 Phase 1 checklist 开始调查
4. 如果中途想跳步 - 看见 anti-pattern，停下
5. 走完整套流程 - 找到真正根因

**投入时间：** 5-10 分钟  
**节省时间：** 避免后面几小时的“打地鼠式补症状”

---

*Created: 2025-10-03*  
*Purpose: 作为 skill 抽取与防弹化的参考示例*
