识别并修复性能问题，打造更快、更顺滑的用户体验。

## 评估性能问题

先理解当前性能状态，并找出真正的瓶颈：

1. **测量当前状态**：
   - **Core Web Vitals**：LCP、FID / INP、CLS
   - **加载时间**：Time to Interactive、First Contentful Paint
   - **包体积**：JavaScript、CSS、图片大小
   - **运行时性能**：帧率、内存使用、CPU 使用
   - **网络**：请求数量、payload 体积、waterfall

2. **识别瓶颈**：
   - 到底什么慢？（首屏加载？交互？动画？）
   - 慢的原因是什么？（大图？高开销 JavaScript？布局抖动？）
   - 有多严重？（用户能感知到？会烦？会阻塞？）
   - 谁会受影响？（全部用户？仅移动端？仅慢网环境？）

**CRITICAL**：先测量，再优化。过早优化只会浪费时间。只优化真正重要的地方。

## 优化策略

建立一套系统性改进方案：

### Loading Performance

**优化图片**：
- 使用现代格式（WebP、AVIF）
- 正确尺寸（不要为了 300px 显示去加载 3000px 图片）
- 首屏以下图片使用 lazy loading
- 使用响应式图片（`srcset`、`picture`）
- 压缩图片（80-85% 质量通常肉眼无感）
- 使用 CDN 提升分发速度

```html
<img 
  src="hero.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  loading="lazy"
  alt="Hero image"
/>
```

**减少 JavaScript Bundle**：
- 做 code splitting（按路由、按组件）
- 做 tree shaking（移除未使用代码）
- 删除未使用依赖
- Lazy load 非关键代码
- 对大组件使用 dynamic import

```javascript
// Lazy load heavy component
const HeavyChart = lazy(() => import('./HeavyChart'));
```

**优化 CSS**：
- 删除未使用 CSS
- 把 critical CSS inline，剩余异步加载
- 减少 CSS 文件数量
- 用 CSS containment 隔离独立区域

**优化字体**：
- 使用 `font-display: swap` 或 `optional`
- Subset 字体（只保留需要的字符）
- Preload 关键字体
- 合适时直接使用系统字体
- 限制加载字重数量

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
  unicode-range: U+0020-007F; /* Basic Latin only */
}
```

**优化加载策略**：
- 让关键资源优先（非关键脚本 async / defer）
- Preload 关键资源
- Prefetch 高概率下一页
- 用 service worker 做离线 / 缓存
- 使用 HTTP/2 或 HTTP/3 做多路复用

### Rendering Performance

**避免 Layout Thrashing**：
```javascript
// Bad: Alternating reads and writes (causes reflows)
elements.forEach(el => {
  const height = el.offsetHeight; // Read (forces layout)
  el.style.height = height * 2; // Write
});

// Good: Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight); // All reads
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2; // All writes
});
```

**优化渲染**：
- 对独立区域使用 CSS `contain`
- 尽量压平 DOM 深度（越浅越快）
- 减少 DOM 体量（元素越少越好）
- 对长列表使用 `content-visibility: auto`
- 对超长列表使用虚拟滚动（react-window、react-virtualized）

**减少 Paint & Composite 压力**：
- 位移动画优先用 `transform` 和 `opacity`，但当 blur、filters、masks、clip paths、shadows、颜色位移能明显提高质感时，也可以使用
- 避免随意动画化布局属性（`width`、`height`、`top`、`left`、margin）
- 只在明确昂贵操作上少量使用 `will-change`
- 对高开销 blur / filter / shadow 效果控制作用区域（越小、越隔离越快）

### Animation Performance

**GPU Acceleration**：
```css
/* Good: GPU-accelerated (fast) */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
}

/* Bad: CPU-bound (slow) */
.animated {
  left: 100px;
  width: 300px;
}
```

**Smooth 60fps**：
- 目标是每帧 16ms（60fps）
- JS 动画用 `requestAnimationFrame`
- 对 scroll handlers 做 debounce / throttle
- 优先使用 CSS 动画
- 动画期间避免执行长任务 JavaScript

**Intersection Observer**：
```javascript
// Efficiently detect when elements enter viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is visible, lazy load or animate
    }
  });
});
```

### React / Framework Optimization

**React-specific**：
- 对昂贵组件使用 `memo()`
- 对昂贵计算使用 `useMemo()`、`useCallback()`
- 对长列表做虚拟化
- 对 routes 做 code split
- 避免在 render 中内联创建函数
- 使用 React DevTools Profiler

**Framework-agnostic**：
- 减少无意义的重复渲染
- 对昂贵操作做 debounce
- 对计算结果做 memoize
- Lazy load 路由与组件

### Network Optimization

**减少请求数**：
- 合并小文件
- 图标使用 SVG sprites
- 小型关键资源 inline
- 移除未使用的第三方脚本

**优化 API**：
- 使用分页（不要一次把所有数据全拉）
- 用 GraphQL 只请求所需字段
- 开启响应压缩（gzip、brotli）
- 正确设置 HTTP caching headers
- 静态资源走 CDN

**为慢网优化**：
- 基于连接状态做自适应加载（`navigator.connection`）
- 使用 optimistic UI updates
- 做请求优先级排序
- progressive enhancement

## Core Web Vitals 优化

### Largest Contentful Paint（LCP < 2.5s）
- 优化 hero 图片
- Inline critical CSS
- Preload 关键资源
- 使用 CDN
- 做 server-side rendering

### First Input Delay（FID < 100ms）/ INP（< 200ms）
- 打散长任务
- 延迟非关键 JavaScript
- 重计算放到 web workers
- 缩短 JavaScript 执行时间

### Cumulative Layout Shift（CLS < 0.1）
- 为图片和视频设置尺寸
- 不要把内容注入到现有内容上方
- 使用 `aspect-ratio` CSS 属性
- 为广告 / embeds 预留空间
- 避免会导致布局位移的动画

```css
/* Reserve space for image */
.image-container {
  aspect-ratio: 16 / 9;
}
```

## 性能监控

**可用工具**：
- Chrome DevTools（Lighthouse、Performance panel）
- WebPageTest
- Core Web Vitals（Chrome UX Report）
- Bundle analyzers（webpack-bundle-analyzer）
- 性能监控服务（Sentry、DataDog、New Relic）

**关键指标**：
- LCP、FID / INP、CLS（Core Web Vitals）
- Time to Interactive（TTI）
- First Contentful Paint（FCP）
- Total Blocking Time（TBT）
- Bundle size
- Request count

**IMPORTANT**：要在真实设备和真实网络环境下测。桌面 Chrome + 快网并不具有代表性。

**NEVER**：
- 不测量就开始优化（过早优化）
- 为了性能牺牲可访问性
- 优化到把功能弄坏
- 到处乱用 `will-change`（会创建新图层，占内存）
- Lazy load 首屏内容
- 纠结微优化，却放过大瓶颈（永远先优化最重的瓶颈）
- 忘了移动端性能（通常设备更慢、网络更差）

## 验证改进

确认优化真的起效：

- **Before/after metrics**：对比 Lighthouse 分数
- **Real user monitoring**：跟踪真实用户侧指标是否改善
- **不同设备**：在低端 Android 上测，不要只在旗舰 iPhone 上测
- **慢网环境**：限速到 3G 看体验
- **无回归**：确认功能没有被优化坏
- **用户感知**：它是否真的“感觉更快了”？

记住：性能本身就是功能。更快的体验会让产品显得更灵敏、更精致、更专业。系统性优化，严格测量，并优先处理用户能真实感知到的性能问题。