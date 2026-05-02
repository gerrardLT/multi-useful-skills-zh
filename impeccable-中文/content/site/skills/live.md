---
tagline: "在浏览器中迭代 UI。选中元素，添加注释，获取三个变体。接受其中一个，它就会写回源代码。"
---

<div class="docs-live-callout">
  <span class="docs-live-callout-icon" aria-hidden="true">▶</span>
  <span class="docs-live-callout-text">想查看实际运行效果和动画演示，请访问 <a href="/live-mode">/live-mode</a>。本页是命令运行时你的 AI harness 实际会读取的参考说明。</span>
</div>

<div class="docs-live-callout">
  <span class="docs-live-callout-icon" aria-hidden="true">▶</span>
  <span class="docs-live-callout-text"><strong>状态：alpha。</strong> Live Mode 已经可以端到端运行，值得尝试，但仍需在真实仓库和各类框架配置上继续验证。在少见环境中请预期可能会有瑕疵，也欢迎反馈遇到的问题。</span>
</div>

<div class="docs-viz-hero docs-viz-hero--plain">
  <div class="docs-viz-live-frame">
    <div class="docs-viz-live-chrome">
      <span class="docs-viz-live-dot"></span>
      <span class="docs-viz-live-dot"></span>
      <span class="docs-viz-live-dot"></span>
      <span class="docs-viz-live-url">localhost:3000</span>
    </div>
    <div class="docs-viz-live-stage docs-viz-live-stage--tall">
      <div class="docs-viz-live-target">
        <span class="docs-viz-live-kicker">No. 04</span>
        <h3 class="docs-viz-live-title">偶尔，<em>来信</em>。</h3>
        <p class="docs-viz-live-body">来自编辑的一张明信片，大约每月一次。没有追踪像素，也不会“只是来问候一下”。</p>
        <button class="docs-viz-live-btn" type="button">寄给我</button>
      </div>
      <div class="docs-viz-live-outline" aria-hidden="true"></div>
      <div class="docs-viz-live-ctx" aria-hidden="true">
        <button class="docs-viz-live-ctx-nav" type="button" aria-label="上一个">←</button>
        <span class="docs-viz-live-ctx-counter">2 / 3</span>
        <button class="docs-viz-live-ctx-nav" type="button" aria-label="下一个">→</button>
        <span class="docs-viz-live-ctx-divider"></span>
        <button class="docs-viz-live-ctx-accept" type="button">接受</button>
      </div>
      <div class="docs-viz-live-gbar" aria-hidden="true">
        <span class="docs-viz-live-gbar-brand">/</span>
        <span class="docs-viz-live-gbar-btn is-active">Pick</span>
        <span class="docs-viz-live-gbar-divider"></span>
        <span class="docs-viz-live-gbar-x">✕</span>
      </div>
    </div>
  </div>
  <p class="docs-viz-caption">Live Mode 迭代中：picker 会高亮你选中的元素，context bar 会显示当前是第几个变体，global bar 会固定在页面底部。此时点击“接受”，会将变体 2 写回源代码。</p>
</div>

## 何时使用

当你想像在设计工具中那样可视化迭代一个界面，但最终产物仍然是生产代码时，就该使用 `/impeccable live`。它提供的是一种近似 Figma 画布的流程，但省去了从设计回到实现阶段的往返。

适合用于：

- **在真实元素上探索不同方向。** 一个 hero section、一张 newsletter card、一个 pricing tier。三个真正不同的方案，会直接并排呈现在真实页面和真实上下文中。
- **打磨一个“差一点就对了”的 UI。** 你知道哪里不对劲，但又一时说不清楚。选中元素，随手写一句 “more playful”，或者在碍眼的地方划一道，点击 Go。
- **团队在两个方向之间快速进行 A/B 测试。** 生成变体，不接受任何一个，看完就走。重点是比较，不一定是落地。

它**不适合**全新的绿地功能开发（那应该用 `/impeccable craft`）或整页重做（那应该用 `/impeccable` 本体，或某个专门的 refine 命令）。

## 工作原理

一条命令会在正在运行的 dev server 上叠加一个 picker overlay。你可以选中任意元素。旁边会弹出一个小 context bar。你可以输入自由描述，或者直接点击 action chips（`bolder`、`quieter`、`distill`、`polish`、`typeset`、`colorize`、`layout`、`animate`、`delight`、`overdrive`）。你还可以先在元素上放置 comment pin 或直接绘制 stroke，skill 会将这些视为意图输入。

点击 Go。系统会生成三个**生产质量的变体**，并且每个都锚定到一个真正不同的设计原型（不是同一方案换几种颜色），然后通过你的框架 HMR 热替换进页面。你可以用方向键在三者之间切换。接受其中一个，它就会写回源代码；丢弃全部三个，原样保留。

它支持 Vite、Next.js（包括 monorepo）、SvelteKit、Astro、Nuxt，以及纯静态 HTML。如果你的 dev server 有严格的 Content Security Policy，首次运行时会自动检测，并提供一次性的仅开发环境补丁，让 picker 能加载。视觉决策以 `DESIGN.md` 为准，语气以 `PRODUCT.md` 为准：如果这两个文件都存在，变体就能保持在品牌轨道上，而无需每次重申。

## 试试看

```text
/impeccable live
```

打开你的 dev server URL，选中 newsletter signup card，点击一下 `delight` chip，再点击 Go。你会得到三个在个性维度上明显不同的变体，比如邮票/明信片风格版本、带字体惊喜的版本、带插画点缀的版本，而不是同一处理方式的小幅修改。

或者选中一个 hero，输入 “more editorial, less SaaS”，再点击 Go。三个变体会分别锚定到不同的 editorial 原型（如 broadsheet masthead、catalog-style spec rows、oversized-glyph poster），而不是同一想法的三个浅层变体。

用完后记得停止 live mode：在聊天中说 “stop live mode”，关闭标签页，或者点击 picker bar 上的退出按钮。

## 常见误区

- **在页面内容还只写到一半时就拿它来跑。** Live 变体生成需要上下文。如果元素里还是 placeholder copy、通用 Lorem ipsum、或者样式表未就绪的默认格式，生成结果也会跟着不稳定。先把内容填好。
- **期待它替你做宏观决策。** Live mode 只迭代一个被选中的元素。像“把整个 pricing page 重做”这种任务，应改用 `/impeccable` 或 `/impeccable craft`。
- **忽略 fallback 提示。** 如果元素实际位于生成的文件（编译产物、构建输出）中，picker 会明确说明，并将 accept 路由到真正的源文件。不要强行把 accept 写进生成的文件：下一次 build 会直接覆盖掉。
- **在你既在乎品牌适配、又没有 PRODUCT.md / DESIGN.md 的情况下直接运行。** Live 仍然能生成，但变体会更倾向于泛化默认值。如果结果必须“像你的产品”，就先运行 `/impeccable teach` 和 `/impeccable document`。