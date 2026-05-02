---
title: Brand vs product，先选择合适的 register
tagline: "两个世界，两套默认值。选对之后，后续的每个命令都会自动适配。"
order: 3
description: "Impeccable 将 brand work（落地页、campaign、作品集）和 product work（应用 UI、dashboard、工具）视为两个默认值完全不同的世界。了解如何选择 register，以及它如何影响所有读取它的命令。"
---

## 先看分叉点

同一个元素，分别用不同的 register 运行一次。这里以一个 newsletter 注册表单为例，制作两个版本。

<div class="docs-viz-hero docs-viz-hero--plain">
  <div class="docs-viz-register">
    <div class="docs-viz-register-side">
      <div class="docs-viz-register-label">
        <span class="docs-viz-register-name">Brand</span>
        <span class="docs-viz-register-lane">Editorial-magazine</span>
      </div>
      <div class="docs-viz-register-frame docs-viz-register-frame--brand">
        <span class="docs-viz-reg-kicker">No. 04 &nbsp;·&nbsp; Dispatch</span>
        <h3 class="docs-viz-reg-title">Letters, occasionally.</h3>
        <p class="docs-viz-reg-body">A postcard from the editor, once a month. No tracking pixels, no "just checking in."</p>
        <span class="docs-viz-reg-btn">Send me one</span>
      </div>
      <div class="docs-viz-register-notes">
        <span>Serif display, italic display weight</span>
        <span>Drenched in the primary hue</span>
        <span>Monospaced kicker, editorial voice</span>
      </div>
    </div>
    <div class="docs-viz-register-side">
      <div class="docs-viz-register-label">
        <span class="docs-viz-register-name">Product</span>
        <span class="docs-viz-register-lane">Utility / app shell</span>
      </div>
      <div class="docs-viz-register-frame docs-viz-register-frame--product">
        <span class="docs-viz-reg-kicker">Newsletter</span>
        <h3 class="docs-viz-reg-title">Subscribe to updates</h3>
        <p class="docs-viz-reg-body">Product changes and release notes, once a month. Unsubscribe at any time.</p>
        <span class="docs-viz-reg-btn">Subscribe</span>
      </div>
      <div class="docs-viz-register-notes">
        <span>Neutral sans, semibold for hierarchy</span>
        <span>Restrained palette, accent only on state</span>
        <span>Short, scannable, mobile-readable copy</span>
      </div>
    </div>
  </div>
  <p class="docs-viz-caption">下表会列出差异点；这里先直接看像素层面的区别。</p>
</div>

## 为什么 register 很重要

每个设计任务本质上都属于两个世界中的一个：

- **Brand**：设计本身就是产品。营销站、落地页、作品集、长篇内容页、campaign surface 都属于这一类。门槛是“足够有辨识度”。字体、动效、密度和颜色都要朝着“在这一类目里独一无二”的方向推进。
- **Product**：设计是为产品服务的。应用 UI、管理后台、dashboard、工具都属于这一类。门槛是“被用户信任的熟悉感”。熟悉 Linear、Figma、Notion、Raycast 或 Stripe 的用户，应该一眼就能判断这个产出是靠谱的。

如果你让同一个 AI 在不指明世界观的情况下同时去做 dashboard 和 campaign page，它大概率会把两者平均化。Brand 页面会显得过于谨慎，product 页面又会显得过于精致。Impeccable 用 register 来避免这件事。

Impeccable 会把 register 作为 `PRODUCT.md` 里的一个单独字段来追踪：

```markdown
## Register

product
```

就是这么简单：只写一个裸值，`brand` 或 `product`。所有对 register 敏感的命令（`typeset`、`animate`、`colorize`、`layout`、`bolder`、`quieter`、`delight`）都会根据这里的值加载不同的 reference 文件。

## 两个世界如何分叉

这不是完整清单，完整差异都在 `brand.md` 和 `product.md` reference 文件里；这里只先勾勒它们的形状：

| 维度 | Brand | Product |
|---|---|---|
| **Type lanes** | Editorial-magazine、luxury、brutalist、consumer-warm、tech-minimal，都可以大胆使用。要敢于尝试。 | 集合更窄：neutral sans + 可选 mono，尺寸围绕高密度阅读优化；fluid type 主要保留给营销面。 |
| **Motion** | 编排式入场、滚动驱动序列、装饰性时刻都可以成立。 | 更克制。只服务状态变化。动画服务反馈，而不是气氛。 |
| **Color** | Full palette、Committed、Drenched 都是可选项。 | 默认更 restrained。强调色承担语义，颜色不是装饰。 |
| **Density** | 取决于叙事需要。大留白和密集规则分栏都可以成立。 | Comfortable 到 dense。每个像素都要有理由。 |
| **References** | 必须来自正确赛道的现实参考。比如 *Klim specimen pages* 或 *Broadsheet masthead*，而不是 “modern SaaS”。 | 类别中的最佳工具型参考。比如 *Linear*、*Figma*、*Notion*、*Raycast*、*Stripe*。 |

同一个命令 `/impeccable typeset`，在这两个世界里会抓取不同的字体策略；同一个 `/impeccable animate`，会采用不同动效语汇；同一个 `/impeccable layout`，会假设不同的密度默认值。你不需要重新学习命令，只需要在一开始回答一次 register 问题，后续命令就会自动适配。

## 第 1 步：决定，或者继承

如果你还没运行 `/impeccable teach`，现在就跑：

```text
/impeccable teach
```

Teach 的第一个问题就是 register。

Teach 会先扫描你的代码库，再形成一个假设：像 `/`、`/pricing`、`/blog`、hero sections、滚动叙事内容，通常更偏 brand；像 `/app`、`/dashboard`、`/settings`、表单和表格，则更偏 product。它会先带着这个判断开场，而不是完全冷启动：

> From the codebase, this looks like a product surface, does that match your intent, or should we treat it differently?

如果项目确实同时覆盖两边（例如一个产品带着一块很重的营销落地页），teach 会询问哪一类是**主表面**。Register 是按项目设置的，不是按页面设置的；但必要时你仍可以对单个任务做覆盖。

## 第 2 步：确认 register 已经写进去

打开 `PRODUCT.md`，找到 `## Register` 这一节。它应该是一个裸值，而不是一段解释：

```markdown
## Register

brand
```

如果这个 section 缺失（比如你还在用 pre-v3.0 的旧版 `PRODUCT.md`），就重新运行 `/impeccable teach`。它会检测到这个空缺，并只补这个字段，而不是把整场访谈重问一遍。

## 第 3 步：在需要时对单个任务覆盖

大多数时候，register 只设一次，然后就可以忘掉。但一个 product 项目有时也会临时需要一块 brand surface（例如发布落地页、投资人 one-pager），而不想因此把整个项目都切换过去。

你有两个选择：

- **直接在 brief 里点明。** 例如：`/impeccable craft a launch landing for v2, brand register for this one page.` 这样本次任务会临时按 brand 处理，不影响其他页面。
- **设置 per-surface register。** 如果这种覆盖会长期存在，就在 `PRODUCT.md` 里加一段显式说明，例如：`## Register overrides: /launch is brand.` 后续读取 PRODUCT.md 的命令就会尊重它。

## 接下来可以试什么

- 运行一个对 register 敏感的命令，直接观察分叉：在 product 项目和 brand 项目上分别运行 `/impeccable typeset the pricing page`，你会看到不同的字族、不同的比例和不同的搭配方式。
- 如果你还没装 Impeccable，可以和 [getting started](/tutorials/getting-started) 配合着一起走。
- 在 teach 之后立刻运行 `/impeccable document`，把视觉层（颜色、组件）也同步进 DESIGN.md。

## 常见问题

- **Register 总是滑向错误的一边。** 如果你明明设了 `product`，但命令总在产出 brand 气质的结果，就检查两件事：`PRODUCT.md` 是否在项目根目录，以及 `## Register` 下是不是一个裸值（不要解释、不要 prose，只写那个词）。命令只能读取文件里真实存在的内容。
- **Teach 的初始假设是错的。** 那就直接不同意。Teach 是在询问你，不是在命令你。
- **项目真的就是 50/50。** 先选主表面，然后对少数那一边使用 per-task overrides。试图在 PRODUCT.md 里把两边平均化，产出通常会比坚定站队到一边更差。