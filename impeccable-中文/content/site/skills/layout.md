---
tagline: "修正布局、间距和视觉节奏。"
---

## 何时使用

`/impeccable layout` 适合那种“技术上没错，但整个页面一点都不呼吸”的场景。比如到处都是相等 padding、单调卡片网格、内容直接贴边跑、层级只能靠字号硬撑。当一个布局“感觉哪里不对”，但你一时又说不清为什么时，就该用它。

很典型的触发语句有：“everything feels crowded”“it reads like a wall”“I do not know where to look first”。

## 它是怎么工作的

这个 skill 会沿着五个布局维度逐项检查：

1. **Spacing**：间距 scale 是否一致，还是夹杂着随机的 13px 缝；相关元素是否紧密成组、组与组之间是否留出更大空间；整个页面有没有节奏。
2. **Visual hierarchy**：用户视线能否在 2 秒内落到 primary action 上；层级是否真的在工作，还是所有东西都在喊。
3. **Grid 与结构**：页面背后是否存在一个底层 grid，还是布局完全随机；元素是否与 baseline 对齐。
4. **Rhythm**：页面是否在紧凑和舒展之间形成交替，还是一切都均匀得发闷。
5. **Density**：布局是太挤还是太浪费；当前密度是否匹配内容类型。

修复通常会涉及：重建 spacing scale、引入非对称、把单调 grid 改成带 hero + supporting elements 的混合布局，并真正给 primary action 留出空间。

## 试试看

```text
/impeccable layout the settings page
```

典型变化：

- Spacing scale 统一为 8 / 16 / 24 / 48 / 96px
- Section breaks 调整到 48px，row gaps 到 16px，form field groups 到 8px
- Primary actions 从表单流里被拉出来，并留出 32px 缓冲区
- 删除装饰性 borders，改为空间驱动的分组关系
- Sidebar 与主列比例重新平衡（280 / flex，而不是 25 / 75）

## 常见误区

- **把 arrange 和 distill 混了。** 如果问题在“东西太多”，先跑 `/impeccable distill`。Layout 负责重新安排那些本来就应该存在的内容。
- **期待它轻松救回一个彻底坏掉的 grid。** 如果页面根本没有 grid，layout 会从头搭一个。只是你要预期 diff 会比想象中大。
- **忽视 hierarchy verdict。** 如果 layout 明确告诉你“没有任何东西是真正的主角”，那光靠 spacing 永远修不好。你需要的是内容决策，而不是布局微调。
