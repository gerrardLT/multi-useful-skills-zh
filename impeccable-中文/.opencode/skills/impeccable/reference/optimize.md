识别并修复性能问题，打造更快、更顺滑的用户体验。

## 评估性能问题

首先理解当前性能状态，并找出真正的瓶颈：

1.  **测量当前状态**：
    *   **Core Web Vitals**：LCP、FID / INP、CLS
    *   **加载时间**：Time to Interactive、First Contentful Paint
    *   **包体积**：JavaScript、CSS、图片大小
    *   **运行时性能**：帧率、内存使用、CPU 使用
    *   **网络**：请求数量、payload 体积、waterfall

2.  **识别瓶颈**：
    *   到底什么慢？（首屏加载？交互？动画？）
    *   慢的原因是什么？（大图？高开销 JavaScript？布局抖动？）
    *   有多严重？（用户能感知到吗？会感到烦躁吗？会阻塞操作吗？）
    *   谁会受影响？（所有用户？仅移动端用户？仅慢网络环境用户？）

**关键**：先测量，再优化。过早优化只会浪费时间。只优化真正重要的地方。

## 优化策略

建立一套系统性改进方案：

### 加载性能

**优化图片**：
*   使用现代格式（WebP、AVIF）
*   使用正确尺寸（不要为了 300px 显示去加载 3000px 图片）
*   首屏以下图片使用懒加载
*   使用响应式图片（`srcset`、`picture`）
*   压缩图片（80-85% 质量通常肉眼无感）
*   使用 CDN 提升分发速度

```html
<img 
  src="hero.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  loading="lazy"
  alt="Hero image"
/>
```

**减少 JavaScript 包体积**：
*   进行代码分割（按路由、按组件）
*   进行 tree shaking（移除未使用代码）
*   删除未使用的依赖
*   懒加载非关键代码
*   对大组件使用动态导入

```javascript
// 懒加载重量级组件
const HeavyChart = lazy(() => import('./HeavyChart'));
```

**优化 CSS**：
*   删除未使用的 CSS
*   将关键 CSS 内联，剩余部分异步加载
*   减少 CSS 文件数量
*   使用 CSS containment 隔离独立区域

**优化字体**：
*   使用 `font-display: swap` 或 `optional`
*   对字体进行子集化（只保留需要的字符）
*   预加载关键字体
*   合适时直接使用系统字体
*   限制加载的字重数量

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* 立即显示回退字体 */
  unicode-range: U+0020-007F; /* 仅基本拉丁字符 */
}
```

**优化加载策略**：
*   让关键资源优先加载（非关键脚本使用 async / defer）
*   预加载关键资源
*   预获取高概率访问的下一页
*   使用 service worker 实现离线访问 / 缓存
*   使用 HTTP/2 或 HTTP/3 实现多路复用

### 渲染性能

**避免布局抖动**：
```javascript
// 差：交替读写（导致重排）
elements.forEach(el => {
  const height = el.offsetHeight; // 读（强制布局）
  el.style.height = height * 2; // 写
});

// 好：批量读取，然后批量写入
const heights = elements.map(el => el.offsetHeight); // 全部读取
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2; // 全部写入
});
```

**优化渲染**：
*   对独立区域使用 CSS `contain`
*   尽量压平 DOM 深度（越浅越快）
*   减少 DOM 体量（元素越少越好）
*   对长列表使用 `content-visibility: auto`
*   对超长列表使用虚拟滚动（react-window、react-virtualized）

**减少绘制与合成压力**：
*   位移动画优先使用 `transform` 和 `opacity`，但当模糊、滤镜、遮罩、裁剪路径、阴影、颜色偏移能明显提升质感时，也可以使用
*   避免随意动画化布局属性（`width`、`height`、`top`、`left`、margin）
*   只在明确昂贵的操作上少量使用 `will-change`
*   对高开销的模糊 / 滤镜 / 阴影效果控制其作用区域（区域越小、越隔离，速度越快）

### 动画性能

**GPU 加速**：
```css
/* 好：GPU 加速（快） */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
}

/* 差：CPU 绑定（慢） */
.animated {
  left: 100px;
  width: 300px;
}
```

**流畅的 60fps**：
*   目标是每帧 16ms（60fps）
*   JS 动画使用 `requestAnimationFrame`
*   对滚动事件处理函数进行防抖 / 节流
*   优先使用 CSS 动画
*   动画期间避免执行长任务 JavaScript

**Intersection Observer**：
```javascript
// 高效检测元素何时进入视口
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 元素可见，进行懒加载或动画
    }
  });
});
```

### React / 框架优化

**React 特定优化**：
*   对昂贵组件使用 `memo()`
*   对昂贵计算使用 `useMemo()`、`useCallback()`
*   对长列表进行虚拟化
*   对路由进行代码分割
*   避免在渲染函数内联创建函数
*   使用 React DevTools Profiler

**框架无关优化**：
*   减少无意义的重复渲染
*   对昂贵操作进行防抖
*   对计算结果进行记忆化
*   懒加载路由与组件

### 网络优化

**减少请求数**：
*   合并小文件
*   图标使用 SVG sprites
*   小型关键资源内联
*   移除未使用的第三方脚本

**优化 API**：
*   使用分页（不要一次拉取所有数据）
*   使用 GraphQL 只请求所需字段
*   开启响应压缩（gzip、brotli）
*   正确设置 HTTP 缓存头
*   静态资源使用 CDN

**为慢网络优化**：
*   基于连接状态进行自适应加载（`navigator.connection`）
*   使用乐观 UI 更新
*   对请求进行优先级排序
*   渐进式增强

## Core Web Vitals 优化

### Largest Contentful Paint（LCP < 2.5s）
*   优化首屏大图
*   内联关键 CSS
*   预加载关键资源
*   使用 CDN
*   进行服务端渲染

### First Input Delay（FID < 100ms）/ INP（< 200ms）
*   拆分长任务
*   延迟加载非关键 JavaScript
*   将重计算任务放到 Web Workers
*   缩短 JavaScript 执行时间

### Cumulative Layout Shift（CLS < 0.1）
*   为图片和视频设置尺寸
*   不要把内容注入到现有内容上方
*   使用 `aspect-ratio` CSS 属性
*   为广告 / 嵌入内容预留空间
*   避免会导致布局偏移的动画

```css
/* 为图片预留空间 */
.image-container {
  aspect-ratio: 16 / 9;
}
```

## 性能监控

**可用工具**：
*   Chrome DevTools（Lighthouse、Performance 面板）
*   WebPageTest
*   Core Web Vitals（Chrome UX Report）
*   包体积分析工具（webpack-bundle-analyzer）
*   性能监控服务（Sentry、DataDog、New Relic）

**关键指标**：
*   LCP、FID / INP、CLS（Core Web Vitals）
*   Time to Interactive（TTI）
*   First Contentful Paint（FCP）
*   Total Blocking Time（TBT）
*   包体积
*   请求数量

**重要**：要在真实设备和真实网络环境下测试。桌面端 Chrome + 快速网络并不具有代表性。

**切勿**：
*   不测量就开始优化（过早优化）
*   为了性能牺牲可访问性
*   优化到把功能弄坏
*   到处乱用 `will-change`（会创建新图层，占用内存）
*   懒加载首屏内容
*   纠结微优化，却放过大瓶颈（永远先优化最重的瓶颈）
*   忘记移动端性能（通常设备更慢、网络更差）

## 验证改进

确认优化真的起效：

*   **前后指标对比**：对比 Lighthouse 分数
*   **真实用户监控**：跟踪真实用户侧指标是否改善
*   **不同设备**：在低端 Android 上测试，不要只在旗舰 iPhone 上测试
*   **慢网络环境**：限速到 3G 看体验
*   **无功能回归**：确认功能没有被优化破坏
*   **用户感知**：它是否真的“感觉更快了”？

记住：性能本身就是功能。更快的体验会让产品显得更灵敏、更精致、更专业。进行系统性优化，严格测量，并优先处理用户能真实感知到的性能问题。