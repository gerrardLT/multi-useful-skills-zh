# Persona-Based Design Testing

通过 5 个截然不同的用户原型来测试界面。每个 persona 都会暴露出不同的失败模式，而这些模式，单一“设计总监视角”往往看不出来。

**How to use**：从中选出最适合当前界面的 2-3 个 personas。让他们各自走一遍主要用户动作。报告时要写具体 red flags，而不是泛泛担忧。

---

## 1. Impatient Power User - "Alex"

**Profile**：熟悉同类产品的专家型用户。追求效率，讨厌被手把手喂。要么找到捷径，要么直接离开。

**Behaviors**：
- 跳过所有 onboarding 和说明
- 第一时间寻找键盘快捷键
- 尝试批量选择、批量编辑和自动化
- 对任何显得多余的必做步骤都非常不耐烦
- 只要感觉慢或被“说教”，就会放弃

**Test Questions**：
- Alex 能在 60 秒内完成核心任务吗？
- 常见动作有没有键盘快捷键？
- Onboarding 能彻底跳过吗？
- Modals 是否支持键盘关闭（Esc）？
- 是否存在“power user 路径”（快捷键、批量操作）？

**Red Flags**（要具体报告这些）：
- 强制 tutorial 或无法跳过的 onboarding
- 主动作没有键盘导航支持
- 慢吞吞且无法跳过的动画
- 明明天然适合批量操作，却被强迫逐项处理
- 对低风险动作仍然要求重复确认

---

## 2. Confused First-Timer - "Jordan"

**Profile**：从未使用过这一类产品。每一步都需要引导。比起自己摸索，他更可能直接放弃。

**Behaviors**：
- 会认真阅读所有说明
- 对任何不熟悉的东西都犹豫才敢点
- 不停寻找 help 或 support
- 会误解术语和缩写
- 会按最字面的方式理解每一个 label

**Test Questions**：
- 用户能否在 5 秒内看明白第一步该做什么？
- 所有图标是否都有文字标签？
- 在决策点上是否有上下文化帮助？
- 术语是否默认了先验知识？
- 每一步是否都有清晰的 “back” 或 “undo”？

**Red Flags**（要具体报告这些）：
- 纯图标导航，没有文字标签
- 技术术语没有解释
- 看不到明显 help 入口或引导
- 完成某个动作后，不知道下一步该干嘛
- 没有告诉用户某个动作是否真的成功了

---

## 3. Accessibility-Dependent User - "Sam"

**Profile**：依赖 screen reader（VoiceOver / NVDA）和纯键盘导航。可能存在低视力、肢体障碍，或认知差异。

**Behaviors**：
- 按线性顺序 tab 过整个界面
- 严重依赖 ARIA labels 和标题结构
- 看不到 hover states，也不能依赖纯视觉提示
- 需要足够对比度（文本至少 4.5:1）
- 可能会把浏览器 zoom 到 200%

**Test Questions**：
- 整个主流程能否只靠键盘完成？
- 所有交互元素都可聚焦，并且有可见 focus 指示吗？
- 图片是否有有意义的 alt text？
- 颜色对比度是否满足 WCAG AA（文本 4.5:1）？
- 状态变化（loading、success、errors）是否会被 screen reader 宣告？

**Red Flags**（要具体报告这些）：
- 只能点击、没有键盘替代路径的交互
- 缺失或不可见的 focus indicator
- 只靠颜色表达含义（红 = error，绿 = success）
- 表单字段或按钮没有 label
- 带时限的动作没有延长选项
- 自定义组件打断了 screen reader 的流

---

## 4. Deliberate Stress Tester - "Riley"

**Profile**：会故意把界面推到 happy path 外的严谨用户。喜欢测边界、试怪输入、找体验缺口。

**Behaviors**：
- 会刻意测试边界情况（empty states、超长字符串、特殊字符）
- 会用意料之外的数据提交表单（emoji、RTL 文本、超长值）
- 会通过中途刷新、回退、开多个标签页等方式尝试把流程弄坏
- 会专门看 UI 承诺的东西和实际结果是否一致
- 会系统性记录问题

**Test Questions**：
- 在边界条件下会发生什么（0 项、1000 项、超长文本）？
- 错误状态能否优雅恢复，还是会把 UI 留在坏状态？
- 中途刷新后会怎样？状态是否保存？
- 是否存在“看起来能用、实际上结果是坏的”功能？
- 对意外输入（emoji、特殊字符、从 Excel 粘贴）处理得怎样？

**Red Flags**（要具体报告这些）：
- 某些功能看起来能用，但会静默失败或给出错误结果
- 错误处理暴露技术细节，或把 UI 留在损坏状态
- Empty states 什么有用信息都不提供（只有 “No results”）
- 流程在刷新或导航后丢失用户数据
- 类似交互在不同地方表现不一致

---

## 5. Distracted Mobile User - "Casey"

**Profile**：单手用手机、人在移动中，经常被打断，甚至可能正处于慢网环境。

**Behaviors**：
- 主要靠拇指操作，更偏好位于屏幕下半区的动作
- 会在流程中途被打断，稍后再回来
- 经常在应用之间切换
- 注意力短，耐心低
- 尽可能少打字，更偏好点击和选择

**Test Questions**：
- 主操作是否位于拇指易达区（屏幕下半部）？
- 用户离开再回来时，状态会保留吗？
- 在慢网（3G）下是否还能正常工作？
- 表单是否能尽量利用 autocomplete 和 smart defaults？
- Touch targets 是否至少达到 44x44pt？

**Red Flags**（要具体报告这些）：
- 重要动作放在屏幕顶部，拇指够不到
- 没有状态保留，切标签页或被打断后进度丢失
- 明明可以选择，却强迫大量文本输入
- 每一页都加载沉重资源（没有 lazy loading）
- 点击目标太小，或彼此挨得太近

---

## Selecting Personas

按界面类型来选 personas：

| Interface Type | Primary Personas | Why |
|---------------|-----------------|-----|
| Landing page / marketing | Jordan, Riley, Casey | 首印象、信任感、移动端 |
| Dashboard / admin | Alex, Sam | 高效使用、可访问性 |
| E-commerce / checkout | Casey, Riley, Jordan | 移动端、边界情况、清晰度 |
| Onboarding flow | Jordan, Casey | 容易困惑、容易被打断 |
| Data-heavy / analytics | Alex, Sam | 效率、键盘导航 |
| Form-heavy / wizard | Jordan, Sam, Casey | 清晰度、可访问性、移动端 |

---

## Project-Specific Personas

如果 `{{config_file}}` 中存在 `## Design Context` 章节（由 `impeccable teach` 生成），就基于那里的 audience 和 brand 信息，再派生出 1-2 个项目专属 personas：

1. 读取 target audience 描述
2. 找出一个不在上述 5 个预设 persona 里的主要用户原型
3. 使用下面模板创建 persona：

```text
### [Role] - "[Name]"

**Profile**: [2-3 key characteristics derived from Design Context]

**Behaviors**: [3-4 specific behaviors based on the described audience]

**Red Flags**: [3-4 things that would alienate this specific user type]
```

只有当真正存在 Design Context 数据时，才创建项目专属 persona。不要凭空编受众细节——如果没有上下文，就只使用上面那 5 个预设 personas。
