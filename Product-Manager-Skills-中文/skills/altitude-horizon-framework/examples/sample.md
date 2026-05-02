# Altitude-Horizon Framework 示例

这个文件展示了如何在一个真实的 PM 晋升为 Director 的场景中使用该框架。

---

## 示例 1：正确使用级联上下文图

### 场景

CEO 给出的公司优先级是：`Win larger enterprise deals this year.`

一位新晋 Director 下面有 3 个 PM 在问：`What does that mean for our roadmaps this quarter?`

### 已完成的上下文级联

```markdown
## Context Cascade

**Company Priority:** Win larger enterprise deals this year.

**Business Unit Translation:** Increase average contract value and reduce time-to-security-approval for enterprise prospects.

**Product Portfolio Translation:**
- Product A: strengthen admin controls and role permissions
- Product B: improve API documentation and integration reliability
- Product C: close SOC 2 and SSO adoption gaps

**Team Accountabilities:**
- Team A owns admin controls and audit logs
- Team B owns API docs, SDK quality, and integration examples
- Team C owns security certifications and SSO implementation quality

**Why this matters:**
Enterprise growth does not mean "build random enterprise features."
It means removing blockers that stall enterprise deals and procurement.
```

### 为什么这样有效

- 将模糊的战略翻译成了具体的团队职责
- 保持了应有的高度：先讲产品组合和成果，再讲待办事项细节
- 使权衡取舍变得可见：哪些事情现在改变，哪些以后再变

---

## 示例 2：反模式（英雄综合征）

### 场景

一位 PM 因为路线图承诺与销售部门产生冲突，向上升级。

### Director 的回应（弱）

`I will jump into the account call and handle this for you.`

### Director 的回应（强）

`Walk me through your current framing. I will coach your next move, then you lead the conversation.`

### 为什么第一种回应会失败

- 它解决了眼前的痛苦，却强化了依赖
- 让 Director 停留在 PM 级别的冲突处理中
- 阻碍了 PM 在利益相关者领导力方面的成长

### 更好的后续动作

1. 复盘 PM 当前的框架
2. 对齐一个清晰的主信息和一个后备立场
3. 让 PM 主讲，Director 仅作支持
4. 会后复盘，下次聚焦改进一个行为点

---

## 示例 3：高度校准检查

在做重大决策前，先做这个快速自检：

- 我现在是在团队/待办事项高度做决定，还是在产品组合高度？
- 以我当前角色，这个决定本来应该由谁来负责？
- 如果我介入，我是在建立系统清晰度，还是在救火式地替人执行？
- 团队现在到底缺的是哪一层上下文翻译？

如果大部分答案都指向执行救火，那你很可能已经滑入英雄综合征了。