# Motion Design

## 时长：100 / 300 / 500 规则

很多时候，时长比 easing 还重要。下面这些持续时间对大多数 UI 都很自然：

| 时长 | 适用场景 | 示例 |
|------|----------|------|
| **100-150ms** | 即时反馈 | 按钮按下、开关切换、颜色变化 |
| **200-300ms** | 状态变化 | 菜单展开、tooltip 出现、hover 状态 |
| **300-500ms** | 布局变化 | Accordion、modal、drawer |
| **500-800ms** | 入场动画 | 页面加载、hero reveal |

**退出动画要比进入动画更快。** 通常使用进入时长的 75% 左右即可。

## 缓动：选对曲线

**不要默认用 `ease`。** 它只是一个折中方案，大多数情况下都不是最佳选择。更好的做法是：

| 曲线 | 用途 | CSS |
|------|------|-----|
| **ease-out** | 元素进入 | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **ease-in** | 元素离开 | `cubic-bezier(0.7, 0, 0.84, 0)` |
| **ease-in-out** | 状态切换（来回变化） | `cubic-bezier(0.65, 0, 0.35, 1)` |

**对于 micro-interaction，优先使用指数型曲线。** 它们更自然，因为更接近真实物理（摩擦、减速）：

```css
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
```

**避免 bounce 和 elastic 曲线。** 它们在 2015 年很流行，但现在看起来往往廉价又业余。真实物体停下时不会弹来弹去，而是平顺减速。overshoot 效果会让人注意到动画本身，而不是内容。

## 更高级的动效材质

`transform` 和 `opacity` 是最可靠的默认项，但它们不应该是整个动效调色板。高级界面常常还需要更有气氛的材质：模糊揭示、`backdrop-filter` 面板、饱和度或亮度变化、阴影 bloom、SVG filter、mask、clip path、gradient position 移动，甚至 variable font 或 shader 驱动效果。

要根据效果选择材质：

- **Transform / opacity**：移动、按压反馈、简单 reveal、列表编排
- **Blur / filter / backdrop-filter**：焦点牵引、景深、玻璃或镜头效果、柔化入场、气氛过渡
- **Clip path / masks**：擦除式 reveal、裁切式揭示、编辑感转场、产品级切换
- **Shadow / glow / color filters**：能量感、affordance、focus、温度、激活态
- **Grid-template rows 或 FLIP-style transforms**：展开和重排布局，同时避免直接动画 `height`

真正的硬规则不是“只能用 transform 和 opacity”。真正的硬规则是：不要随便去动画那些会驱动布局重排的属性（例如 `width`、`height`、`top`、`left`、margin），把高成本效果限制在小范围或隔离区域内，并且一定要在真实浏览器和目标视口中验证是否足够流畅。如果 blur / filter 能显著提升高级感，而且仍然跑得顺，就用它。

## 交错动画

用 CSS 自定义属性写 stagger 会更干净：`animation-delay: calc(var(--i, 0) * 50ms)`，并在每个元素上写 `style="--i: 0"` 这类索引值。**但要给总 stagger 时间设上限。** 如果 10 个元素每个延 50ms，总共就已经是 500ms。元素数量多时，要么减小每项延迟，要么限制参与 stagger 的数量。

## 减少动态效果

这不是可选项。前庭相关障碍影响的成年人比例并不低。

```css
.card {
  animation: slide-up 500ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .card {
    animation: fade-in 200ms ease-out;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**该保留什么：** 进度条、加载 spinner（可以减速）、焦点指示这类功能性动画仍应继续工作，只是不要再依赖明显的空间位移。

## 感知性能

**用户并不在乎你的网站“实际有多快”，他们只在乎它“感觉有多快”。** 感知优化有时和真正的性能优化一样有效。

**80ms 阈值：** 人脑会在大约 80ms 内缓冲感官输入来同步感知。低于 80ms 的反馈通常会被感知为瞬时同步。这应该是 micro-interaction 的目标。

**主动时间 vs 被动时间：** 呆盯着 spinner 的被动等待，会比参与中的主动等待更难熬。可以用下面几种方式改变感受：

- **Preemptive start**：数据还在加载时，先立刻开始过渡，例如 iOS 式缩放、skeleton UI。用户会觉得“事情已经在发生”。
- **Early completion**：逐步展示内容，不要等所有东西都到齐。比如视频预缓冲、渐进图像、流式 HTML。
- **Optimistic UI**：先更新界面，再优雅处理失败。像 Instagram 点赞那样，先立刻变化，稍后再同步。适合低风险操作，不适合付款或破坏性动作。

**Easing 也会影响感知时长：** 向完成端加速的 ease-in，会让任务“感觉更短”，因为人对结束时刻权重更高。ease-out 适合入场，但如果你的目标是让等待更短，任务完成阶段的 ease-in 往往更有效。

**注意：** 响应过快有时反而会降低可信度。对于搜索、分析这类复杂操作，用户可能会怀疑“是不是根本没认真做”。有时，轻微延迟反而能传递“系统真的在干活”。

## 性能

不要预先滥用 `will-change`，只有在动画即将发生时再启用，例如 `:hover` 或 `.animating`。滚动触发动画优先使用 Intersection Observer，而不是绑定 scroll 事件；动画只需要触发一次时，结束后就 unobserve。把常用的时长、easing 和过渡模式沉淀成 motion tokens，方便统一。

---

**避免：** 什么都动画化（动画疲劳是真存在的）；把 UI 反馈拖到 500ms 以上；无视 `prefers-reduced-motion`；拿动画去掩盖真实加载慢。
