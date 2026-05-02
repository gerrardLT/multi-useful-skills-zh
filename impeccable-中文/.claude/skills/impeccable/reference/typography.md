# 排版

## 经典排版原则

### 垂直节奏

你的行高应成为所有垂直间距的基础单位。如果正文是 `16px` 字号、`line-height: 1.5`（即 24px），那么间距值最好都是 24px 的倍数。这样会产生一种潜意识层面的和谐感，因为文字与留白共享同一套数学基础。

### 模块化比例与层级

常见错误是：字号过多，而且彼此差距太小（14px、15px、16px、18px……）。这样会让层级变得浑浊不清。

**字号应该更少，但反差更大。** 一套 5 级字号系统已经能覆盖大多数需求：

| 角色 | 典型比例 | 用途 |
|------|----------|------|
| xs | 0.75rem | 图注、法律说明 |
| sm | 0.875rem | 次级 UI、元信息 |
| base | 1rem | 正文 |
| lg | 1.25-1.5rem | 小标题、导语 |
| xl+ | 2-4rem | 大标题、Hero 文案 |

常见比例有：1.25（大三度）、1.333（纯四度）、1.5（纯五度）。选一个，并坚持用下去。

### 可读性与行长

使用 `ch` 单位控制基于字符数的行长（例如 `max-width: 65ch`）。行长与行高通常呈反向关系：窄栏需要更紧的行距，宽栏需要更松的行距。

**一个不那么直觉的点**：深色背景上的浅色文字，需要从三个维度同时补偿，而不只是调一个参数。可以把行高增加 0.05–0.1，略微加一点字间距（0.01–0.02em），必要时把正文权重提高一级（regular → medium）。因为感知中的“字重”会同时在这三个维度上变弱，所以补偿也应是三维的。

**段落节奏**：段间距和首行缩进二选一，不要同时使用。数字产品通常更适合段间距；编辑型 / 长文型内容可以只用首行缩进。

## 字体选择与搭配

具体的字体挑选流程与“下意识排除清单”写在 [reference/brand.md](brand.md) 中的 **Font selection procedure** 和 **Reflex-reject list**（在品牌语调任务中会加载）。本节只补充相关知识：如何避免条件反射式误判、何时使用系统字体，以及字体搭配规则。

### 值得警惕的条件反射

- 技术型 / 工具型 brief 不一定要为了“增加温度”硬上 serif。大多数技术工具本来就应该看起来像技术工具。
- 编辑感 / 高端感 brief 也不必使用所有人都在用的那种表现性 serif。高级感可以是瑞士现代、neo-grotesque、纯粹 monospace，也可以是安静的人文 sans。
- 儿童产品不一定就要配圆体展示字。儿童读物一样会使用真正严肃的字体。
- “现代感” brief 也不意味着必须上 geometric sans。真正现代的做法，很多时候恰恰是不去用大家都在用的那一款。

**系统字体被低估了**：`-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui` 看起来原生、加载极快、可读性也很高。对于性能优先于个性的应用，这是很值得考虑的方案。

### 搭配原则

**一个不太直觉但很重要的事实**：很多时候你根本不需要第二套字体。一个选得好的字族，加上多种字重，往往比两套彼此竞争的字体更能建立清晰层级。只有在你确实需要强对比时，才引入第二套字体（例如展示型标题 + serif 正文）。

搭配时，最好在多个维度上制造对比：
- Serif + Sans（结构对比）
- Geometric + Humanist（气质对比）
- Condensed display + Wide body（比例对比）

**不要把“很像但不一样”的字体配在一起**（例如两套几何无衬线）。这只会制造紧张感，却带不来清晰层级。

### Web 字体加载

常见问题是布局偏移：字体加载得晚，文字重排，用户会看到页面抖动。解决方式如下：

```css
/* 1. 用 font-display: swap 保证先可见 */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;
}

/* 2. 匹配后备字体度量，尽量减少偏移 */
@font-face {
  font-family: 'CustomFont-Fallback';
  src: local('Arial');
  size-adjust: 105%;        /* 缩放以匹配 x-height */
  ascent-override: 90%;     /* 匹配上伸部高度 */
  descent-override: 20%;    /* 匹配下伸部深度 */
  line-gap-override: 10%;   /* 匹配行间距 */
}

body {
  font-family: 'CustomFont', 'CustomFont-Fallback', sans-serif;
}
```

像 [Fontaine](https://github.com/unjs/fontaine) 这样的工具可以自动计算这些 override。

**`swap` 与 `optional` 的区别**：`swap` 会立刻显示后备字体，并在 Web 字体到达后发生 FOUT 替换；`optional` 会在 Web 字体没能赶上一个很短的加载预算（约 100ms）时直接继续使用后备字体，从而完全避免布局偏移。如果“零布局抖动”比“慢网下也必须看到品牌字体”更重要，就选 `optional`。

**只 preload 关键字重**：通常是首屏正文所使用的常规字重。把所有字重都 preload，往往浪费的带宽比节省的更多。

**当你需要 3 个以上字重或样式时，优先考虑 variable font**：单个可变字体文件通常比 3 个静态字体文件更小，还能提供连续字重控制，并且很适合配合 `font-optical-sizing: auto` 使用。若只需要 1–2 个字重，静态字体就够了。

## 现代 Web 排版

### 流体字号

通过 `clamp(min, preferred, max)` 实现的流体排版，可以让文字随着视口平滑缩放。中间值（例如 `5vw + 1rem`）决定缩放速度，`vw` 越大，缩放越快。再加一个 `rem` 偏移，避免在小屏上接近 0。

**适合使用流体字号的场景**：营销页或内容页中的标题和展示文字，这些页面以文字主导布局，需要在不同视口下保持呼吸感。

**适合使用固定 `rem` 比例的场景**：应用界面、dashboard 和信息密度高的产品。主流应用设计系统（Material、Polaris、Primer、Carbon）都不会在产品 UI 里使用流体字号，因为容器型布局更需要固定尺度和可预测空间，必要时只在断点处微调。即便在营销页里，正文通常也应固定字号，因为跨视口带来的差异并不足以支撑额外复杂度。

**要给 `clamp()` 设边界**：尽量让 `max-size ≤ ~2.5 × min-size`。比例过大不仅会破坏浏览器缩放和重排表现，还会让大屏下的页面显得像在“吼叫”。

**容器宽度和字号应一起缩放**，这样有效行长才能始终保持在 45–75ch 的舒适区间。若标题扩张速度快于容器，它在大视口下就会偏离可读行长。

### OpenType 特性

很多开发者根本没意识到这些功能存在。善用它们能明显提升细节质感：

```css
/* 用等宽数字对齐数据 */
.data-table { font-variant-numeric: tabular-nums; }

/* 正确显示分数 */
.recipe-amount { font-variant-numeric: diagonal-fractions; }

/* 缩写使用小型大写字母 */
abbr { font-variant-caps: all-small-caps; }

/* 在代码中关闭连字 */
code { font-variant-ligatures: none; }

/* 开启字距微调（通常默认开启，但写明更稳妥） */
body { font-kerning: normal; }
```

可以在 [Wakamai Fondue](https://wakamaifondue.com/) 查看你的字体支持哪些特性。

### 渲染层面的打磨

```css
/* 让标题换行更均衡（浏览器会挑更好的断点） */
h1, h2, h3 { text-wrap: balance; }

/* 减少长文中的孤行和难看的参差边缘 */
article p { text-wrap: pretty; }

/* 可变字体：自动选择合适的 optical-size master */
body { font-optical-sizing: auto; }
```

**全大写字母的字距**：默认间距下，大写字母通常挤得太近。短的全大写标签、eyebrow 和小标题，通常应增加 5–12% 的字间距（`letter-spacing: 0.05em` 到 `0.12em`）。真正的小型大写字母（通过 `font-variant-caps`）也要做类似处理，但可以稍微轻一点。

## 排版系统架构

Token 命名应以语义为主（如 `--text-body`、`--text-heading`），而不是按数值命名（如 `--font-size-16`）。你的 token 系统里应包含字体栈、字号比例、字重、行高和字间距。

## 可访问性注意事项

除了大家都熟悉的对比度之外，还要注意：

- **绝不要禁用缩放**：`user-scalable=no` 会破坏可访问性。如果你的布局在 200% 缩放时崩掉，就该修布局，而不是禁缩放。
- **字号使用 rem/em**：这样才会尊重用户浏览器设置。正文不要用 `px`。
- **正文至少 16px**：再小会明显增加阅读负担，并且在移动端难以满足 WCAG。
- **保证足够的触控目标**：文本链接需要通过 padding 或 line-height 形成 44px+ 的可点击区域。

---

**避免**：一个项目里使用超过 2–3 套字体；省略后备字体定义；忽视字体加载性能（FOUT / FOIT）；把装饰性字体用于正文。
