---
tagline: "有目的的动效，用来传达状态，而不是装饰。"
---

## 何时使用

`/impeccable animate` 适用于那些缺乏生命力的界面：状态变化来得又快又突兀、加载状态只是生硬地出现、用户永远不确定自己的点击是否生效。用它来补充那些真正能解释“当前发生了什么”的微小动作：入场、退场、反馈、状态切换之间的过渡。

不要用它来强行添加 bounce 或 elastic spring，只为了显得“更有活力”。那是装饰，而这个 skill 不会提供这类功能。

## 它是如何工作的

这个 skill 会先识别哪些静态时刻本应有动态效果，再以极其克制的方式添加：

1. **入场与退场**：元素进入和离开时，使用 200 到 300ms 的淡入淡出，并辅以轻微的 Y 轴或 scale 变化，绝不修改布局属性。
2. **状态反馈**：hover、active、focus、loading、success 都应通过动态效果传达，而非依赖突兀的切换。
3. **视图切换过渡**：适当时使用共享元素过渡，不适当时则使用淡入淡出。
4. **进度与加载**：使用骨架屏、确定性的进度条，以及一种能明确告知用户“仍在处理中”的动态效果。
5. **减少动态效果**：每一段动画都必须提供 `prefers-reduced-motion` 的回退方案。

缓动函数一律使用指数型（ease-out-quart、quint 或 expo），因为真实世界中的物体会平滑减速。不要使用 bounce、elastic，也不要将 linear 用于任何非进度指示器的地方。

这个 skill 仅对 `transform` 和 `opacity` 进行动画处理。如果你发现自己在对 `width`、`height`、`top` 或 `left` 进行动画，那就说明方向错了。高度过渡请改用 `grid-template-rows`。

## 试试看

```text
/impeccable animate the sign-up flow
```

典型新增内容：

- 邮箱输入框在 `focus-visible` 时出现一个焦点光晕（opacity + shadow，180ms）
- 提交按钮在加载状态下将 spinner 放入按钮内部，而不是在旁边额外挂载一个 spinner
- 成功界面使用 opacity + translateY(8px) 进入，260ms，ease-out-quart
- 错误信息使用 `grid-template-rows` 滑下展开（而非 height），220ms
- 所有过渡都带有 `@media (prefers-reduced-motion: reduce)` 回退方案

## 常见误区

- **笼统地要求“多来点动画”。** Animate 不是一个强度调节旋钮。它只会在动态效果具有沟通价值的地方添加，而不是到处都加。
- **删除 reduced-motion 回退方案。** 这个 skill 会自动添加，且这一点不可协商，是可访问性的底线。