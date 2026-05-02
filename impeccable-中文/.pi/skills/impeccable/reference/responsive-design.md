# 响应式设计

## 移动优先：从一开始就写对

先编写移动端的基础样式，再通过 `min-width` 查询逐层叠加复杂度。桌面优先（`max-width`）意味着移动端会先加载一堆自己根本不需要的样式。

## 断点：由内容驱动

不要追着设备尺寸跑——让内容自己告诉你该在哪里断开。先从窄屏开始，逐步拉宽，等设计开始坏掉的那个点就是断点。通常 3 个断点就够了（640、768、1024px）。配合 `clamp()`，很多值甚至可以不靠断点实现流动变化。

## 检测输入方式，而不只是屏幕大小

**屏幕尺寸并不能告诉你输入方式。** 带触摸屏的笔记本、带键盘的平板都很常见——应该使用 `pointer` 与 `hover` 查询：

```css
/* Fine pointer (mouse, trackpad) */
@media (pointer: fine) {
  .button { padding: 8px 16px; }
}

/* Coarse pointer (touch, stylus) */
@media (pointer: coarse) {
  .button { padding: 12px 20px; }  /* Larger touch target */
}

/* Device supports hover */
@media (hover: hover) {
  .card:hover { transform: translateY(-2px); }
}

/* Device doesn't support hover (touch) */
@media (hover: none) {
  .card { /* No hover state - use active instead */ }
}
```

**关键**：不要依赖 `hover` 承担功能。触屏用户没有 `hover`。

## 安全区域：处理刘海和系统边缘

现代手机有刘海、圆角和 Home Indicator。应使用 `env()`：

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* With fallback */
.footer {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

同时记得在 meta 标签中启用 `viewport-fit`：
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## 响应式图片：把它做对

### 带宽度描述符的 srcset

```html
<img
  src="hero-800.jpg"
  srcset="
    hero-400.jpg 400w,
    hero-800.jpg 800w,
    hero-1200.jpg 1200w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Hero image"
>
```

**工作方式**：
- `srcset` 列出可用图片及其真实宽度（`w` 描述符）
- `sizes` 告诉浏览器图片最终会显示多宽
- 浏览器会根据视口宽度 **以及** 设备像素比自动挑选合适文件

### 使用 Picture 元素进行艺术指导

当你需要的不只是不同分辨率，而是不同裁剪/构图时：

```html
<picture>
  <source media="(min-width: 768px)" srcset="wide.jpg">
  <source media="(max-width: 767px)" srcset="tall.jpg">
  <img src="fallback.jpg" alt="...">
</picture>
```

## 布局适配模式

**导航**：通常分三个阶段——移动端用汉堡菜单 + 抽屉，平板用紧凑横向导航，桌面端用完整带标签的导航。**表格**：在移动端可通过 `display: block` 和 `data-label` 把表格转成卡片结构。**渐进式披露**：对可在移动端折叠的内容，优先使用 `<details>/<summary>`。

## 测试：不要只相信 DevTools

DevTools 设备模拟对于布局很有用，但它漏掉很多真实问题：

- 真实触摸交互
- 真实 CPU / 内存限制
- 真实网络延迟模式
- 字体渲染差异
- 浏览器界面 / 键盘弹出行为

**至少要测这些设备**：一台真实 iPhone、一台真实 Android、如果相关的话再加一台平板。很多性能问题只有在便宜安卓机上才会暴露，在模拟器里永远看不出来。

---

**避免**：桌面优先设计。用设备检测代替特征检测。拆成独立移动端/桌面端代码库。忽视平板与横屏。默认所有移动设备都很强。