---
tagline: "把安全的设计往更有冲击力的方向推，但别滑进混乱。"
---

## 何时使用

当一个界面看起来和其他所有界面都差不多时，就拿出 `/impeccable bolder`。通用无衬线、中等字重、柔软阴影、克制强调色、合理但毫无记忆点的间距。这样的设计不一定错，但就是太安全。只要项目本身承受得住存在感，而当前状态又毫无存在感，就该用它。

不要把它用在那些用户要盯着看几个小时的 dashboards 上。Boldness 应该出现在营销页、hero 时刻、内容型 feature 上，而不是 operator tools。

## 它是怎么工作的

这个 skill 会沿四个轴放大界面，但不破坏可用性：

1. **Scale**：display type 会被推到 `clamp(3rem, 6vw, 6rem)` 甚至更高。标题要有填满视口的气势，而不是犹犹豫豫地缩在里面。
2. **Weight contrast**：用 light 300 对 heavy 800，而不是 medium 对 regular。要有真正的张力，不要只是象征性地区分一下。
3. **Color commitment**：强调色要满血出现，而不是被稀释。背景也可以明确表态（ink、accent、cream），而不是一律像纸。
4. **Compositional confidence**：非对称、出格、pullquote、悬挂标点、尺度跳跃。布局本身要有声音。

这个 skill 不会凭空往里加更多东西，它只是放大已经存在的那些元素。如果设计里本来就有 3 种颜色，bolder 不会加第 4 种，而是更坚定地使用那 3 种。

## 试试看

```text
/impeccable bolder the landing page hero
```

预期变化：

- Hero heading 从 3rem 提升到 `clamp(3.5rem, 7vw, 6.5rem)`，使用 display font，字重 700
- Subhead 从 regular 改成 italic，字号 1.5rem，并向标题左侧光学外移 8px
- 背景从普通 paper 改成 cream-to-paper 渐层，形成更温暖的容器
- CTA button 改为实心填充，移除 drop shadow，减小 border radius，hover 时做颜色反转
- Supporting image 稍微脱离网格，并用负 top margin 制造非对称关系

## 常见误区

- **用在了错误的页面上。** Product dashboards、settings、forms 不应该被做得 bold，它们应该是清晰的。那种场景更适合 `/impeccable layout` 或 `/impeccable polish`。
- **把 bold 误解成 loud。** Bold 是坚定、自信；loud 是在大喊大叫。Bolder 做的是前者。如果结果开始显得攻击性太强，就接着跑 `/impeccable quieter`。
- **在同一轮里同时配 `/impeccable delight`。** Delight 最适合建立在稳定视觉基线上。先 bold，先稳定，再 delight。