---
title: 用 Live Mode 迭代 UI
tagline: "选中一个元素，生成三个变体，采纳其中一个。像在画布上迭代一样，但无需离开代码。"
order: 2
description: "使用 /impeccable live 在开发服务器的真实元素上进行可视化迭代：选中、批注、生成三个变体，采纳你想要的那个，并将其写回源代码。"
---

## 你将完成什么

你将在开发服务器上使用 `/impeccable live`，围绕一个具体的 UI 片段（如 hero、card、section）进行迭代，最终将三个 AI 生成的变体中最喜欢的一个写回源代码，使其成为真实的代码。你将完整体验类似画布的选择、批注和三联轮换流程。

整个过程大约需要十分钟，其中大部分时间花在“决定修改哪一部分”。

## 前置条件

- 已安装 Impeccable（如果尚未安装，请先参阅 [入门指南](/tutorials/getting-started)）。如果你还没有运行过 `/impeccable teach`，请先运行一次：变体的品牌契合度将依赖于 `PRODUCT.md` 和 `DESIGN.md`。
- 一个正在运行且支持 HMR 的开发服务器（Vite、Next.js、SvelteKit、Astro、Nuxt、Bun），或者一个已在浏览器中打开的静态 HTML 文件。
- 一个页面，并且上面至少有一块你想要迭代的 UI。例如 newsletter card、hero、pricing tier，总之要足够小，小到你能在脑海中完整把握它。

## 第 1 步：启动 live mode

在你的 harness 中运行：

```text
/impeccable live
```

这个 skill 会在 8400 端口启动一个本地 helper 服务器，并向你的开发入口文件注入一个 `<script>` 标签以加载 picker。如果你的项目有严格的 Content Security Policy，首次运行时会自动检测，并提供一个一次性的仅限开发环境的补丁，以放行 `script-src` 和 `connect-src`。请接受这个补丁：它受 `NODE_ENV === "development"` 保护，并且你随时可以回滚。

打开你的开发服务器 URL（不是 8400 端口，那个是 helper 服务器，不是应用本身）。页面底部会出现一个深色药丸状按钮，其中的 **Pick** 会高亮显示。

## 第 2 步：选中一个元素

<div class="docs-viz-step">
  <div class="docs-viz-picker-row">
    <div class="docs-viz-picker-target">
      <span class="docs-viz-picker-pin">1</span>
      Newsletter signup
      <span class="docs-viz-picker-note">more playful</span>
    </div>
  </div>
</div>

点击你想要迭代的元素。它周围会出现 picker 轮廓，旁边会弹出一个浅色上下文栏，左侧是命令 chip，右侧是自由输入框。

在点击 Go 之前，你可以做几件事：

- **点击命令 chip**（默认是 `impeccable`，即自由形式操作）。你可以将其改为 `bolder`、`delight`、`layout`、`typeset` 等特定动作，让变体只沿一个维度展开。
- **在自由输入框中写一句话。** 例如 “More playful.”、“Less SaaS.”、“Feel like a newsletter from a magazine.”
- **放置一个评论标记**，方法是直接点击已选中的元素任意位置。这个标记的位置是有效信息：如果评论靠近标题，那么它指的就是标题，而不是整个元素。
- **绘制一条笔画**，方法是在元素上拖拽。闭环 = “这一部分重要”；箭头 = 方向；叉号 = “把这个删掉”。skill 读取的是笔画的形状含义，而不是像素内容。

当简报已经足够清楚时，点击 **Go**。

## 第 3 步：在三个变体之间轮换

<div class="docs-viz-step">
  <div class="docs-viz-variants">
    <div class="docs-viz-variant docs-viz-variant--v1">
      <span class="docs-viz-variant-badge">1 / 3</span>
      <span class="docs-viz-variant-kicker">No. 04</span>
      <p class="docs-viz-variant-title">Letters, <em>occasionally</em>.</p>
      <span class="docs-viz-variant-btn">Send me one</span>
    </div>
    <div class="docs-viz-variant docs-viz-variant--v2 is-active">
      <span class="docs-viz-variant-badge">2 / 3</span>
      <span class="docs-viz-variant-kicker">Dispatch</span>
      <p class="docs-viz-variant-title">Design notes, <br>every other<br>Thursday.</p>
      <span class="docs-viz-variant-btn">Join →</span>
    </div>
    <div class="docs-viz-variant docs-viz-variant--v3">
      <span class="docs-viz-variant-badge">3 / 3</span>
      <span class="docs-viz-variant-kicker">Field Notes</span>
      <p class="docs-viz-variant-title">A monthly letter, for people who still read email.</p>
      <span class="docs-viz-variant-btn">Receive ✶</span>
    </div>
  </div>
</div>

你会先看到一个加载指示器（“Generating variants...”），几秒后，三个变体会直接热替换进页面原位。不是预览图，而是你真实开发服务器上、带真实上下文的真实 DOM。

使用方向键（或上下文栏上的 prev / next 按钮）在三者间切换。右上角计数器会显示 `1 / 3`、`2 / 3`、`3 / 3`。

这三个变体被设计成**真正不同**，而不是同一个想法的三次微调。自由形式的变体会锚定到三个不同的设计原型（如 broadsheet masthead、oversized-glyph poster、catalog-style spec rows 等）。特定动作的变体则沿动作对应的维度变化：`colorize` 会给你三种色相家族，`animate` 会给你三种运动语汇，`layout` 会给你三种结构排布。

如果两个变体让你觉得“其实差不多”，那就是 skill 在 “squint test” 上失败了。你可以直接告诉 picker：“try again, all three felt too similar”，然后获取一组新的变体。

## 第 4 步：采纳其中一个

<div class="docs-viz-step" style="text-align:center">
  <span class="docs-viz-accept-pill">Variant 2 written to source</span>
</div>

当你找到最喜欢的那个后，点击上下文栏上的 **Accept**（或直接按 Enter）。这时会发生三件事：

1. 页面上被选中的元素会被采纳的变体替换。
2. 这个变体会被写回源代码：要么是 picker 注入的那个文件，要么是 live 在第 1 步识别出的真实组件源文件（如果当前元素来自生成的文件）。
3. 如果采纳涉及 CSS，对应的规则会被整理进项目真正的样式表，而不是留成内联样式。

如果将三个变体全部丢弃（按 Escape），原始内容会原样保留。不会留下痕迹，也不会留一堆注释掉的残骸。

## 第 5 步：停止 live mode

当你完成这轮迭代后，停止 helper：

- 在 harness 聊天中说 **"stop live mode"**，或
- 点击 picker 药丸状按钮上的 **×**，或
- 直接关闭浏览器标签页：helper 会在 8 秒后检测到连接断开，并干净退出。

停止时还会顺带移除开发入口中注入的 `<script>` 标签，并停掉 8400 端口上的 helper 服务器。

## 接下来可以尝试

- 在 `/impeccable polish` 之后，再对另一个页面运行 `/impeccable live`，将 polish 后的版本和另外两个方向做 A/B 测试。
- 搭配 [使用 overlay 进行评审](/tutorials/critique-with-overlay) 使用：先运行 critique，修复优先级问题，再用 live 去探索 critique 标记出的那个元素可以如何重新定向。
- 如果你想要的是 shape-then-build 的完整流程（从零开始构建新功能，而不是只修改一个元素），请改用 `/impeccable craft`。

## 常见问题

- **页面上始终没有出现 picker。** 可能是 helper 没有成功启动（查看终端是否有报错），也可能是 CSP 阻止了注入。重新运行 `/impeccable live`，让它重新检查 CSP。如果你第一次运行时拒绝了补丁，请删除 `.impeccable/live/config.json` 里的 `cspChecked` 那一行，然后重新运行。
- **点击 Go 时提示 “element lives in a generated file”。** Live 发现你选中的元素位于编译产物中，而不是真实的源文件。它会将采纳操作路由到回退路径，让变体仍能落入真正的源代码。请按照提示操作，不要强行将变体采纳到生成的文件中。
- **变体看起来不够像你的品牌。** 检查项目根目录是否存在 `PRODUCT.md` 和 `DESIGN.md`。没有它们时，live 会偏向通用默认值。请先运行 `/impeccable teach` 和 `/impeccable document`。
- **helper 端口被占用。** 之前有一个 live session 留下了服务器没有停止。运行 `npx impeccable live stop` 释放端口。