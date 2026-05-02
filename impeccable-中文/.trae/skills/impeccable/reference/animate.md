> **还需要额外上下文**：性能约束。

分析一个功能，并有策略地加入动画与微交互，以增强理解、提供反馈，并带来愉悦感。

---

## Register

Brand：强调经过编排的 page-load 序列、错峰 reveal、scroll-driven animation。动效是品牌声音的一部分；一个排练到位的入口时刻，胜过零碎散落的微交互。

Product：大多数过渡控制在 150-250 ms。动效应传达状态——反馈、揭示、加载、视图切换。不要做 page-load choreography；用户正在执行任务，他们不会愿意等待。

---

## 评估动画机会点

分析哪些地方引入动效能真正改善体验：

1. **识别静态区域**：
   - **缺少反馈**：动作发生后没有视觉确认（按钮点击、表单提交等）
   - **切换生硬**：状态瞬时变化，显得突兀（显示 / 隐藏、页面加载、路由切换）
   - **关系不清楚**：空间关系或层级关系不够直观
   - **缺少愉悦感**：功能可用，但没有任何生命感
   - **错失引导机会**：本可用来引导注意力或解释行为的地方没有利用起来

2. **理解上下文**：
   - 产品 / 品牌人格是什么？（活泼还是严肃， energetic 还是 calm）
   - 性能预算是多少？（移动优先？页面本身已经很复杂？）
   - 受众是谁？（对动效敏感的用户？追求速度的 power users？）
   - 最重要的是什么？（一个 hero 动画，还是很多微交互？）

如果这些信息无法从代码库中看出来，就 {{ask_instruction}}

**CRITICAL**：尊重 `prefers-reduced-motion`。必须始终为需要的用户提供非动画替代。

## 规划动画策略

建立一套有目的的动画方案：

- **Hero moment**：哪一个才是那唯一的签名式动画？（页面加载？hero 区？关键交互？）
- **Feedback layer**：哪些交互必须被明确确认？
- **Transition layer**：哪些状态切换需要被柔化？
- **Delight layer**：哪里可以加入一点惊喜和愉悦？

**IMPORTANT**：一个编排到位的整体体验，胜过到处零碎加动画。把注意力集中在高影响力时刻。

## 实施动画

按这些类别系统性加入动效：

### Entrance Animations
- **页面加载编排**：错峰 reveal 元素（100-150ms 延迟），结合 fade + slide
- **Hero 区域**：为主内容设计更有戏剧性的进入（scale、parallax，或有创意的效果）
- **内容 reveal**：使用 intersection observer 做滚动触发动画
- **Modal / drawer 进入**：平滑 slide + fade，backdrop fade，以及正确的 focus 管理

### Micro-interactions
- **按钮反馈**：
  - Hover：微小 scale（1.02-1.05）、颜色变化、阴影增强
  - Click：快速缩小再回弹（0.95 -> 1），或 ripple effect
  - Loading：spinner 或 pulse 状态
- **表单交互**：
  - Input focus：边框颜色过渡，轻微 scale 或 glow
  - Validation：出错时 shake，成功时 check mark，平滑颜色过渡
- **Toggle switches**：平滑 slide + 颜色过渡（200-300ms）
- **Checkboxes / radio**：check mark 动画、ripple effect
- **Like / favorite**：scale + rotation、particle effects、颜色过渡

### State Transitions
- **显示 / 隐藏**：使用 fade + slide，而不是瞬间切换；时长控制在 200-300ms
- **展开 / 收起**：height transition 配合 overflow 处理，图标旋转
- **Loading states**：skeleton fade、spinner 动画、进度条
- **Success / error**：颜色过渡、图标动画、轻微 scale pulse
- **Enable / disable**：opacity 过渡和 cursor 变化

### Navigation & Flow
- **页面切换**：route 之间 crossfade，或 shared element transitions
- **Tab 切换**：滑动指示条，内容 fade / slide
- **Carousel / slider**：平滑 transform、snap points、惯性
- **滚动效果**：parallax 层、带状态变化的 sticky header、scroll progress indicators

### Feedback & Guidance
- **Hover hints**：tooltip fade-in、cursor 变化、元素高亮
- **Drag & drop**：提起效果（shadow + scale）、drop zone 高亮、平滑重排
- **Copy / paste**：粘贴时短暂高亮，“copied” 确认
- **Focus flow**：在表单或工作流中高亮当前路径

### Delight Moments
- **Empty states**：插画上的微妙悬浮动画
- **完成动作**：confetti、check mark flourish、成功庆祝
- **Easter eggs**：留给探索者的小隐藏交互
- **上下文动效**：天气效果、昼夜主题、季节性细节

## 技术实现

为不同动效选择合适手段：

### Timing & Easing

**按用途划分的时长：**
- **100-150ms**：即时反馈（按钮按下、toggle）
- **200-300ms**：状态变化（hover、菜单展开）
- **300-500ms**：布局变化（accordion、modal）
- **500-800ms**：入场动画（page load）

**Easing 曲线（用这些，不要用 CSS 默认值）：**
```css
/* Recommended - natural deceleration */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);    /* Smooth, refined */
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);   /* Slightly snappier */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);     /* Confident, decisive */

/* AVOID - feel dated and tacky */
/* bounce: cubic-bezier(0.34, 1.56, 0.64, 1); */
/* elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6); */
```

**退出动画应比进入动画更快。** 通常使用进入时长的约 75%。

### CSS Animations
```css
/* Prefer for simple, declarative animations */
- transitions for state changes
- @keyframes for complex sequences
- transform and opacity for reliable movement
- blur, filters, masks, clip paths, shadows, and color shifts for premium atmospheric effects when verified smooth
```

### JavaScript Animation
```javascript
/* Use for complex, interactive animations */
- Web Animations API for programmatic control
- Framer Motion for React
- GSAP for complex sequences
```

### Performance
- **动效材料选择**：位移优先使用 transform / opacity，但当 blur、filter、mask、shadow、颜色位移能显著提升效果时，也可以使用
- **布局安全**：避免随意动画化会驱动布局的属性（`width`、`height`、`top`、`left`、margin）
- **will-change**：只在明确知道某处动画昂贵时少量使用
- **约束高开销效果**：让 blur / filter / shadow 的作用区域尽量小且隔离，必要时配合 `contain`
- **监控 FPS**：在目标设备上确保 60fps

### Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**NEVER**：
- 不要使用 bounce 或 elastic easing——它们显得过时，而且会让人注意到“动画本身”
- 不要随意动画化布局属性（`width`、`height`、`top`、`left`、margin），如果 transform、FLIP 或 grid-based 技术已经够用
- 不要让反馈动画超过 500ms——会显得迟钝
- 不要做没有目的的动画——每个动画都必须有存在理由
- 不要忽略 `prefers-reduced-motion`——这是可访问性违规
- 不要什么都动——动画疲劳会让界面令人厌倦
- 除非是刻意设计，否则不要在动画期间阻塞交互

## 验证质量

认真检查这些点：

- **60fps 流畅**：在目标设备上没有卡顿
- **感觉自然**：easing 曲线是有机的，不像机器人
- **时长合适**：不至于太快吓人，也不至于太慢拖沓
- **Reduced motion 正常工作**：动画被正确关闭或简化
- **不阻塞**：用户能在动画期间 / 之后正常交互
- **有增益**：它让界面更清楚或更愉悦，而不是只是装饰

记住：动效应当增强理解并提供反馈，而不是只增加装饰。带着目的做动画，尊重性能约束，并始终考虑可访问性。真正好的动画往往是“无感”的——它只是让一切都变得更对。