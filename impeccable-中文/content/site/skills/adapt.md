---
tagline: "让设计跨屏幕、设备和上下文都能成立，而不是靠砍功能硬适配。"
---

## 何时使用

`/impeccable adapt` 适合把一个原本只为某个场景设计的界面，改造成能在另一个场景里也正常工作的版本。比如：从 desktop 适配到 mobile、从 mobile 适配到 tablet、从 web 适配到 print、从 standalone 适配到 embedded、从 dashboard 适配到 email。当原始设计本身是稳的，但一换 breakpoint、上触屏、进别的容器就散掉时，就该用它。

它不适合“从零开始做响应式”。那种情况应该从 `/impeccable` 入手，一开始就按 responsive-first 方式去塑形。Adapt 更适合那种“我们当时根本没考虑 mobile”的补票式工作。

## 它是怎么工作的

这个 skill 会沿着四个“上下文适配维度”推进：

1. **Breakpoints 与流式布局**：把多栏收成单栏、调整 clamp 区间、在设计真正断掉的地方引入新的 breakpoints。
2. **Touch targets**：最小 44px 点击区域、相邻目标间足够间距、必要时让点击区域大于视觉边界。
3. **导航模式**：desktop sidebar 变成 mobile bottom nav 或 slide-out，密集 toolbar 收进菜单，hover 状态要有对应的触控替代。
4. **内容优先级**：决定什么必须保持可见，什么可以折叠进 disclosure，什么在该上下文下可以彻底移除。

不可谈判的底线是：适配，不是截肢。关键功能不能因为在 mobile 上难摆就直接消失。要么想办法塞进去，要么重做交互，要么重新审视它在 desktop 上是不是真的“关键”。

## 试试看

```text
/impeccable adapt the settings page for mobile
```

预期改动大概会是：

- 三栏 grid 改为单栏，section headers 变成 sticky 分隔
- Sidebar nav 移到内容上方，改成横向滚动条
- Toggles 增加 8px 垂直 padding，满足 44px 触控目标
- Inline help text 改为点击展开，而不是依赖 hover
- “Danger zone” 在 mobile 上保持完全展开，而不是收起，因为里面是不可逆操作，必须让用户看清楚

## 常见误区

- **把功能砍掉。** 如果 mobile 版隐藏了 desktop 版能做的事，那不是适配，而是回归。要为功能据理力争。
- **把 mobile 当成“缩小版 desktop”。** Mobile 是完全不同的上下文：拇指操作、容易被打断、会话时间短。你要适配的是上下文，而不是纯粹的视口宽度。
- **做完 adapt 后不接着跑 `/impeccable harden`。** 响应式布局最容易暴露边界情况。adapt 之后再跑 harden，才能把那些只在 320px 下爆出来的问题抓干净。
