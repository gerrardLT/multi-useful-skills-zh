回复开头必须是：

```text
━━━━━━━━━━━━ 🚀 OVERDRIVE ━━━━━━━━━━━━━
》》》 Entering overdrive mode...
```

把一个界面推到超出常规的边界。这不只是视觉特效的问题，而是要调动浏览器的全部能力，让界面的任意一部分都显得非同寻常：能扛百万行数据的表格、从触发按钮形变而来的对话框、带流式反馈的实时表单校验、电影感的页面切换。

**这个命令额外重要的一点**：上下文决定了 “非同寻常” 到底意味着什么。创意作品集上加粒子系统可能很惊艳；但把同样的粒子系统扔到设置页上，就只会尴尬。反过来，一个设置页如果能做到瞬时 optimistic save 加带动画的状态切换，那同样也很 extraordinary。先理解项目的人格和目标，再决定什么才是合适的“技术野心”。

### 先提方案，再动手

这个命令最容易翻车。不要直接跳进实现。你**必须**：

1. **先想 2-3 个不同方向**：考虑不同技术路径、不同野心级别和不同审美路线。对每个方向，简短描述它最后看起来和用起来会是什么感觉。
2. **{{ask_instruction}}** 把这些方向展示给用户，并在写任何代码前让用户选一个。说明各自的取舍（浏览器支持、性能成本、复杂度）。
3. 只在用户确认的方向上继续实现。

跳过这一步，极容易做出一个尴尬到必须全部推倒重来的东西。

### 使用浏览器自动化反复迭代

技术野心型效果几乎从来不会第一次就成功。你**必须积极使用浏览器自动化工具**来预览结果、做视觉验证，并据此迭代。不要假设“它看起来应该没问题”，你必须真的去看。预期要经历多轮 refinement。技术上“能跑”和视觉上“真的很 extraordinary”之间的差距，必须靠视觉迭代来填平，而不是只靠代码。

---

## 先判断这里的 “extraordinary” 应该长什么样

正确的技术野心类型完全取决于你正在处理的对象。在选技术前，先问自己：**对这个具体界面的用户来说，什么东西会让他真的说一句 “wow, that's nice”？**

### 对视觉 / 营销型表面
页面、hero 区、落地页、作品集——这里的 “wow” 往往是感官层面的：scroll-driven reveal、shader 背景、电影感页面切换、会响应鼠标的生成艺术。

### 对功能型 UI
表格、表单、对话框、导航——这里的 “wow” 通常体现在 FEEL 上：一个从触发按钮形变而来的 dialog（View Transitions）、一个能以 60fps 渲染 100k 行的 data table（virtual scrolling）、一个带流式校验、几乎瞬时响应的表单、一个带 spring physics 的 drag-and-drop。

### 对性能关键型 UI
这里的 “wow” 是看不见但能感受到的：一个能过滤 50k 项而完全不闪的搜索，一个永远不会阻塞主线程的复杂表单，一个近乎实时处理的图像编辑器。界面就是毫不犹豫。

### 对数据密集型界面
图表和仪表盘——这里的 “wow” 在于流动性：通过 Canvas / WebGL 实现 GPU 加速大数据渲染，在不同数据状态之间平滑过渡，或者力导图自然收敛的过程。

**共同点**：实现中的某个部分，超出了用户对“网页界面”原本的预期。技术是为了服务体验，而不是反过来。

## 工具箱

按“你想达到什么效果”来组织，而不是按技术名字来组织。

### 让过渡像电影镜头
- **View Transitions API**（same-document：全浏览器；cross-document：Firefox 不支持）——用于状态间共享元素形变。比如列表项展开成详情页，按钮形变为 dialog。这是最接近原生 FLIP 动画的东西。
- **`@starting-style`**（全浏览器）——纯 CSS 实现从 `display: none` 到可见状态的进入动画，包括 entry keyframes
- **Spring physics**——用质量、张力和阻尼，而不是 cubic-bezier，得到更自然的运动。可用库包括 motion（原 Framer Motion）、GSAP，或自己写 spring solver。

### 把动画绑到滚动上
- **Scroll-driven animations**（`animation-timeline: scroll()`）——纯 CSS，无需 JS。可做 parallax、进度条、reveal sequences。支持 Chrome / Edge / Safari；Firefox 仍需 flag，所以一定要有静态 fallback。

### 超出 CSS 的渲染能力
- **WebGL**（全浏览器）——shader effects、post-processing、particle systems。常用库有 Three.js、OGL（轻量）、regl。适合 CSS 表达不了的效果。
- **WebGPU**（Chrome / Edge；Safari 部分支持；Firefox 需 flag）——下一代 GPU compute。能力比 WebGL 更强，但浏览器支持有限。一定要回退到 WebGL2。
- **Canvas 2D / OffscreenCanvas**——适合自定义渲染、像素处理，或通过 Web Workers + OffscreenCanvas 把沉重渲染移出主线程。
- **SVG filter chains**——可做 displacement maps、turbulence、morphology 等有机扭曲效果，并且可用 CSS 驱动。

### 让数据“活起来”
- **Virtual scrolling**——只渲染可见行，适合数万行的表格 / 列表。简单场景甚至不需要库；复杂场景可用 TanStack Virtual。
- **GPU-accelerated charts**——对太大而不适合 SVG / DOM 的数据集，用 Canvas 或 WebGL 渲染。可用 deck.gl 或基于 regl 的定制渲染器。
- **Animated data transitions**——数据状态切换时做形变，而不是直接替换。可以用 D3 的 `transition()`，或对 DOM 图表用 View Transitions。

### 动画更复杂的属性
- **`@property`**（全浏览器）——注册带类型的 CSS 自定义属性，让 gradient、color 和复杂值也能做插值动画
- **Web Animations API**（全浏览器）——性能接近 CSS 的 JavaScript 动画系统。可组合、可取消、可反转，是复杂编排的基础

### 冲击性能上限
- **Web Workers**——把计算移出主线程。适合重型数据处理、图像操作、搜索索引等会导致 jank 的东西。
- **OffscreenCanvas**——在 Worker 中直接渲染。主线程保持空闲，而复杂画面在后台进行。
- **WASM**——给计算密集型功能提供接近原生的性能。适用于图像处理、物理模拟、编解码器。

### 与设备交互
- **Web Audio API**——空间音频、音频响应式可视化、声学反馈。必须在用户手势之后启动。
- **Device APIs**——方向、环境光、地理位置。谨慎使用，并始终要经过用户许可。

**NOTE**：这个命令是为了增强界面的“感受”，不是去改变产品“做什么”。实时协作、离线支持或新的后端能力属于产品决策，不属于 UI 增强。重点是让已有功能变得 extraordinary。

## 带着纪律实现

### Progressive enhancement 不可妥协

每一种技术都必须优雅降级。即使没有增强效果，基础体验也必须依然很好。

```css
@supports (animation-timeline: scroll()) {
  .hero { animation-timeline: scroll(); }
}
```

```javascript
if ('gpu' in navigator) { /* WebGPU */ }
else if (canvas.getContext('webgl2')) { /* WebGL2 fallback */ }
/* CSS-only fallback must still look good */
```

### 性能规则

- 目标 60fps。如果掉到 50 以下，就简化。
- 无条件尊重 `prefers-reduced-motion`。必须给出一个同样漂亮的静态替代。
- 对重资源（WebGL contexts、WASM modules）做 lazy initialization，只在接近视口时加载。
- 暂停屏外渲染。看不见的东西就别让它继续跑。
- 在真实的中端设备上测试，不要只在开发机上看。

### 抛光才是真正的差距

“很酷”和“真的 extraordinary”之间的差别，往往在最后 20% 的 refinement：spring 动画里的 easing curve、错峰 reveal 的 timing offset、那些让过渡显得真实的 secondary motion。不要交付第一个能跑的版本——要交付那个看起来像“本来就该如此”的版本。

**NEVER**：
- 不要忽视 `prefers-reduced-motion`——这不是建议，而是可访问性要求
- 不要在中端设备上造成 jank
- 不要在没有可用 fallback 的情况下强推 bleeding-edge API
- 不要在没有明确用户同意的情况下加声音
- 不要用“技术野心”来掩盖设计基本功薄弱；那种问题要先用别的命令修
- 不要把多个 extraordinary moments 叠在一起打架——聚焦才有力量，过量只会制造噪音

## 验证结果

- **The wow test**：把它给一个没见过的人看。他会有反应吗？
- **The removal test**：把这个效果拿掉。体验是不是明显变差，还是根本没人发现？
- **The device test**：在手机、平板、Chromebook 上跑。还顺滑吗？
- **The accessibility test**：打开 reduced motion。还美吗？
- **The context test**：这件事真的适合这个品牌和受众吗？

记住：“技术上 extraordinary” 并不意味着一定要用最新 API。真正重要的是，你让界面做到了用户原本不觉得网页能做到的事。
