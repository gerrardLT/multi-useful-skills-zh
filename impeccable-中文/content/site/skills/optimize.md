---
tagline: "从 LCP 到 bundle size，定位并修复 UI 性能问题。"
---

## 何时使用

`/impeccable optimize` 适合那些“感觉慢”的界面。首屏要很久才出来、滚动掉帧、图片很晚才出现、交互有延迟、bundle 里塞了 800KB JavaScript。当 Web Vitals 变差，或者用户开始抱怨“这东西好卡”时，就该用它。

不要把它当成过早优化工具。如果 LCP 已经是 1.1s，INP 也只有 80ms，那就停下。此时设计工作比继续挤性能更重要。

## 它是怎么工作的

这个 skill 会沿着五个性能维度推进：

1. **Loading 与 Web Vitals**：LCP、INP、CLS。找出是谁阻塞了首屏渲染、是谁拖慢了交互响应、是谁导致了布局跳动。
2. **Rendering**：不必要的 re-renders、缺失 memoization、昂贵的 reconciliation、循环中的 layout thrash。
3. **Animations**：是否在动画 layout properties；是否只动 transforms 与 opacity；这里的 `will-change` 到底是在帮忙还是添乱。
4. **Images 与 assets**：lazy loading、响应式图片（`srcset`、`sizes`）、现代格式（WebP、AVIF）、是否设置尺寸以防 CLS。
5. **Bundle size**：无用 imports、过大的依赖、缺失 code-splitting、dead code。

这个 skill 会先测量 before，再测量 after。每个修复都必须有量化结果。如果某个改动没有推动指标，就会被回滚。

## 试试看

```text
/impeccable optimize the homepage
```

预期结果大概长这样：

```text
LCP: 3.2s -> 1.4s
  - Hero image preloaded (-800ms)
  - Removed render-blocking font stylesheet (-240ms)
  - Deferred analytics script (-180ms)

INP: 240ms -> 90ms
  - Debounced scroll handler
  - Memoized expensive list render
  - Removed synchronous layout read in event loop

CLS: 0.18 -> 0.02
  - Set dimensions on hero image and logo
  - Reserved space for async header badge

Bundle: 340KB -> 180KB
  - Removed unused lodash import (52KB)
  - Code-split the playground route (78KB)
  - Dropped deprecated icon set (30KB)
```

## 常见误区

- **还没测量就先优化。** 没有 baseline metrics，你根本不知道什么改动真的有用。运行 `/impeccable optimize` 时，最好带上明确的 Web Vitals 数字，而不是凭感觉。
- **追逐太小的收益。** 为了把 INP 再改善 20ms 而花一周，通常并不值。性能优化有明显的边际递减，要知道什么时候该停。
- **每次改完不重新测。** 实际构建结果可能会以 skill 没预测到的方式把事情弄得更糟。必须重新验证。