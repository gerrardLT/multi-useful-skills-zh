---
tagline: "生成一份符合规范的 DESIGN.md，记录你的视觉系统，让每个 AI agent 都能保持品牌一致。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-file">
    <div class="docs-viz-file-header">
      <span class="docs-viz-file-name">DESIGN.md</span>
      <span class="docs-viz-file-status">Google Stitch 规范格式</span>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">01</span>
        <span class="docs-viz-designmd-title">Overview</span>
      </div>
      <p class="docs-viz-designmd-note">Creative North Star: <em>"The Editorial Sanctuary."</em> 安静的排版，充足的空气感，一个态度明确的强调色。</p>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">02</span>
        <span class="docs-viz-designmd-title">Colors</span>
      </div>
      <div class="docs-viz-designmd-swatches" aria-hidden="true">
        <span class="docs-viz-designmd-swatch" style="background:#1a1a1a"></span>
        <span class="docs-viz-designmd-swatch" style="background:#f5f3ef"></span>
        <span class="docs-viz-designmd-swatch" style="background:oklch(60% 0.22 30)"></span>
        <span class="docs-viz-designmd-swatch" style="background:oklch(90% 0.02 30)"></span>
      </div>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">03</span>
        <span class="docs-viz-designmd-title">Typography</span>
      </div>
      <div class="docs-viz-designmd-type">
        <span class="docs-viz-designmd-type-display">Aa</span>
        <span class="docs-viz-designmd-type-body">Cormorant Garamond &middot; Instrument Sans</span>
      </div>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">04</span>
        <span class="docs-viz-designmd-title">Elevation</span>
      </div>
      <p class="docs-viz-designmd-note">默认保持纯平。阴影只在状态变化时出现。</p>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">05</span>
        <span class="docs-viz-designmd-title">Components</span>
      </div>
      <div class="docs-viz-designmd-comps" aria-hidden="true">
        <span class="docs-viz-designmd-btn">订阅</span>
        <span class="docs-viz-designmd-chip">筛选</span>
        <span class="docs-viz-designmd-card">卡片</span>
      </div>
    </div>
    <div class="docs-viz-designmd-section">
      <div class="docs-viz-designmd-head">
        <span class="docs-viz-designmd-num">06</span>
        <span class="docs-viz-designmd-title">Do's and Don'ts</span>
      </div>
      <div class="docs-viz-designmd-rules">
        <span class="docs-viz-designmd-do">让中性色轻微朝强调色偏移。</span>
        <span class="docs-viz-designmd-dont">不要用渐变文字做强调。</span>
      </div>
    </div>
  </div>
  <p class="docs-viz-caption">这六个 section 的名字、顺序和数量都是固定的。旁边还会生成一份机器可读的 <code>DESIGN.json</code>，供 Live Mode 的 design panel 使用。</p>
</div>

## 何时使用

当你的项目已经长出了足够多的视觉系统内容可以被记录时，就运行 `/impeccable document`：至少应当已经有颜色、字体，最好再加上一种按钮和一种卡片。这个命令会扫描代码库，提取它能找到的 tokens 和组件模式，然后在项目根目录写出一份 `DESIGN.md`，格式遵循 [Google Stitch DESIGN.md format](https://stitch.withgoogle.com/docs/design-md/format/)，六个 section 顺序固定，并能与其他任何理解 DESIGN.md 的工具互通。

下面这些场景特别适合它：

- **你刚刚跑完 `/impeccable teach`**，现在已经有了 `PRODUCT.md`。Document 就是与之配套的视觉侧文件。
- **某个命令提醒你该建它了。** Live、craft 和 polish 都会读取 DESIGN.md。如果它缺失，skill 会建议你先运行 document。
- **设计已经偏离旧版 DESIGN.md**，导致文件已经无法准确描述当前系统。
- **在一次大改版之前**，先把当前状态记录下来，作为下一轮方向的参考基线。

如果项目里还没有代码（例如刚跑完 `teach`，还什么都没做），也有 seed mode：`/impeccable document --seed` 会问你五个简短的战略问题（颜色策略、字体方向、动效能量、参考、反向参考），并写出一个脚手架版本。等代码真正出现后，再用 scan mode 重跑一次。

## 它是怎么工作的

扫描阶段会按优先级寻找设计资产：CSS custom properties、Tailwind config、CSS-in-JS themes、design token 文件、组件源码、全局样式表，最后如果浏览器可用，还会读取 live 渲染后的计算样式。能自动提取的内容它都会先提出来；剩下那些需要创意判断的部分，它会合并成一个问题来问：**Creative North Star**（整个系统的一个命名隐喻，比如 “The Editorial Sanctuary”）、描述性色彩命名、elevation 哲学，以及组件整体气质。

输出会是一份严格六段式的 DESIGN.md：Overview、Colors、Typography、Elevation、Components、Do's and Don'ts。Header 名称必须逐字匹配，以保证其他工具可解析。旁边还会写出一份 `DESIGN.json` 机器可读 sidecar。Live Mode 的 design panel 正是通过这个 sidecar，才能渲染出**你这个项目自己的**按钮、输入框、导航和卡片，而不是一个通用近似物。

之后的每个命令在调用时都会读取 DESIGN.md。新的变体、polish、audit 和新功能构建，都会在没有被额外提醒的情况下自动继承你的视觉系统。

## 试试看

```text
/impeccable document
```

如果项目里已经定义了 tokens，这通常只要大约两分钟：扫描会找到你的配色和字体栈，你从 2 到 3 个选项里挑一个 North Star，确认一些描述性色彩名字（例如 “Deep Muted Teal-Navy”，而不是 “blue-800”），然后文件就会落在项目根目录。

对于一个全新项目：

```text
/impeccable document --seed
```

五个问题，大约五分钟。这个文件会是一个脚手架版本，并带有 `<!-- SEED -->` 注释，诚实表明它当前只是种子版本。等你真正实现 tokens 后，再去掉这个标记重跑一遍。

## 常见误区

- **跑得太早。** 如果项目里还没有真正实现的 tokens，那 seed mode 才是对的。不要去伪造一份代码根本支撑不住的完整 spec。假的 DESIGN.md 比没有 DESIGN.md 更糟。
- **把 DESIGN.md 当成只给人看的文档。** 它首先是给 AI 看的。其他所有命令都会读取它。它那种很强势的表达方式（“never”“always”、命名规则）是故意设计的。
- **额外新增 Layout / Motion / Responsive 顶层 section。** 规范只有六个 section，顺序和名字都固定。布局和动效相关内容应收进 Overview（哲学级规则）或 Components（组件级行为）里。
- **静默覆盖已有的 DESIGN.md。** Document 一定会先确认。如果你真的要从头来过，就先把旧文件改名挪开，或者明确告诉 skill 可以覆盖。