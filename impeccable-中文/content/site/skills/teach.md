---
tagline: "每个项目只做一次：让 Impeccable 认识你的产品是给谁做的。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-file">
    <div class="docs-viz-file-header">
      <span class="docs-viz-file-name">PRODUCT.md</span>
      <span class="docs-viz-file-status">每次命令都会加载</span>
    </div>
    <div class="docs-viz-file-body">
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Register</span>
        <span class="docs-viz-file-v">Product。设计服务于任务。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Users</span>
        <span class="docs-viz-file-v">值班中的 SRE，阅读很快，很多时候在昏暗环境里查看。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Brand voice</span>
        <span class="docs-viz-file-v">冷静、克制、不煽情。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Anti-references</span>
        <span class="docs-viz-file-v">紫色渐变。玻璃拟态。“Boost your productivity.”</span>
      </div>
    </div>
    <div class="docs-viz-file-footer">每个命令在写第一行代码前都会先读这个文件。</div>
  </div>
  <p class="docs-viz-caption">一份完成后的 PRODUCT.md。这里面只放战略层：who、what、why。不放颜色、不放字体、不放像素值，那些都应该在 DESIGN.md 里。</p>
</div>

## 何时使用

在一个项目开始时，只运行一次 `/impeccable teach`。它是这个技能的启动入口。没有它，后续所有命令仍然能生成设计，但语气会偏向通用：标准的 SaaS 口吻、安全的默认字体、典型的 AI 配色。有了它之后，每个命令都会先读取你的答案，然后再开始生成。

以下情况都应当使用它：

- **你刚在新项目里安装好了 Impeccable。** 这是第一件该做的事。如果你跳过，其他命令也会不断提醒你回头来做。
- **项目的品牌方向发生了变化。** 比如新的定位、新的受众、新的语气。重新运行一遍 `teach`，更新后的上下文就会自动流向每个命令。
- **其他命令提示 “no design context found”** 并停止了。这就是信号：先运行 teach，再继续。

## 它是如何工作的

Teach 会在项目根目录写出两个互补的文件：

- **`PRODUCT.md`** 是战略文件。内容包括 register（brand 或 product）、目标用户、产品目的、品牌个性、anti-references、设计原则、可访问性要求。回答的是“who, what, why”。
- **`DESIGN.md`** 是视觉文件。内容包括颜色、字体、层级、组件、do's and don'ts。回答的是“how it looks”。它不是由 teach 直接写，而是由 teach 在结尾委托 `/impeccable document` 去生成。

整个流程会先扫描代码库（README、package.json、components、tokens、brand assets），然后形成一个 **register 假设**：这是 brand（landing、marketing、portfolio，设计本身就是产品），还是 product（app UI、dashboards、tools，设计是为产品服务）？之所以把 register 放在第一个问题，是因为它会塑造后面每一个默认值：字体默认值、动效强度、颜色策略，以及像 `/impeccable typeset` 这类命令该去读哪套 reference。确定 register 后，teach 只会继续问那些它无法从代码里推断出来的内容：用户是谁、品牌气质用三个真实词怎么描述、reference 和 anti-reference 是什么、有没有额外可访问性要求。

PRODUCT.md 只承载战略信息。不放颜色、不放字体、不放像素值。这些都属于 DESIGN.md。把两个文件拆开是故意的：因为战略层可以长期稳定，而视觉系统则可能持续演化。

## 试试看

```text
/impeccable teach
```

预期是一段 5 到 8 分钟的访谈。第一个问题通常关于 register；后面的问题都较短。Teach 会先复述它从代码中推断出的内容（比如 “from the routes, this looks like a product surface, match?”），因此你是在确认，而不是从零开始。

在结尾时，teach 会询问你是否继续运行 `/impeccable document`。除非你有非常明确的理由推迟，否则都应该选 yes。真正完整的 DESIGN.md，才是让变体、polish 和 audits 始终保持品牌一致的关键。

## 常见误区

- **为了“先随便试一个命令”而跳过它。** 这样做只会让别的命令在中途插入访谈，反而更慢。先运行 teach 才是更快的做法。
- **给出泛泛的答案。** “Modern and clean” 没什么用；“Warm, mechanical, opinionated” 才有用。要具体，而且要愿意反驳那些看似安全的默认值。
- **把 PRODUCT.md 当成不可修改的真理。** 这个文件是你的。如果 teach 写进去的内容不够准确，就直接修改。每个命令都会读取当前版本。
- **Reference 只给形容词。** 你应该给出有名字的品牌、产品或印刷对象，而不是只给描述。比如 “Klim Type Foundry specimen pages”，而不是 “technical and clean”。Anti-references 也要同样具体。