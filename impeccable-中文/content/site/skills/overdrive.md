---
tagline: "把界面推过常规边界。Shaders、physics、60fps、电影感过渡。"
---

## 何时使用

`/impeccable overdrive` 适合那些你明确想“让人哇一下”的时刻。一个用 WebGL 的 hero、一张能吃下一百万行数据的表格、一个从触发器元素形变出来的 dialog、一个带流式实时反馈的表单、一个有电影感的页面过渡。当项目预算允许技术野心，而且最终效果必须显得非凡时，就该用它。

不要把它用在 operator tools、dashboards，或者任何“可靠性明显比 spectacle 更重要”的东西上。Overdrive 会为了效果主动燃烧复杂度，而这种权衡只值得放在真正关键的时刻。

## 它是怎么工作的

这个 skill 不会试图把整个界面都做成“很厉害”，而是只挑一个时刻做成真正 extraordinary，然后把精力全部压上去。之后它会启用那些大多数 AI 生成 UI 从不会碰的技术：WebGL shaders、spring physics、Scroll Timeline、View Transitions、canvas animation、GPU-accelerated filters。所有效果都会被做预算、做 profiling，并以 60fps 为目标进行测试，同时 baked in reduced-motion fallback。

Overdrive 模式会用 `████ ⚡ OVERDRIVE ████` 这样的提示明确标记出来，告诉你当前正在进入更激进的工作模式。你应该预期会有更大的 diff、新的 dependencies，以及比其他 skills 更深的实现深度。

## 试试看

```text
/impeccable overdrive the landing hero
```

一次很具体的运行，可能会把一个静态 hero 替换成：一个由鼠标位置驱动的 WebGL shader 背景、一段用 Scroll Timeline API 滚动揭示的 display headline mask，以及一个会在 CTA 上用 View Transition 形变到下一页的跳转。与此同时，还会提供一个 reduced-motion fallback，把这一切优雅地收回成干净静态的构图。

## 常见误区

- **到处都用。** Overdrive 之所以成立，就是因为它稀有。如果每一页都有电影感时刻，那就没有任何一页是真的电影感。
- **不带 reduced-motion fallback 就发。** 不可谈判。Overdrive 会自动加上，别把它删掉。
- **忽视性能。** 再惊艳的时刻也必须跑到 60fps。如果效果掉帧，就删掉它，或者继续优化。慢吞吞的 spectacle 比一个做好了的简单方案更糟。
- **在基础界面还没打稳时就先跑 overdrive。** 建立在坏底子上的 spectacle 会被看成 distraction，而不是 delight。
