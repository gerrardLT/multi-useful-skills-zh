---
tagline: "先把设计想清楚，再把它做出来，而且是一条完整流程。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-flow">
    <div class="docs-viz-flow-step">
      <span class="docs-viz-flow-num">01</span>
      <span class="docs-viz-flow-name">Shape</span>
      <span class="docs-viz-flow-hint">Discovery 访谈。明确目的、用户、约束、方向。</span>
    </div>
    <div class="docs-viz-flow-step">
      <span class="docs-viz-flow-num">02</span>
      <span class="docs-viz-flow-name">Load references</span>
      <span class="docs-viz-flow-hint">空间、字体、动效、颜色、交互。</span>
    </div>
    <div class="docs-viz-flow-step">
      <span class="docs-viz-flow-num">03</span>
      <span class="docs-viz-flow-name">Build</span>
      <span class="docs-viz-flow-hint">结构、层级、字体、颜色、状态、动效、响应式。</span>
    </div>
    <div class="docs-viz-flow-step docs-viz-flow-step--accent">
      <span class="docs-viz-flow-num">04</span>
      <span class="docs-viz-flow-name">Iterate visually</span>
      <span class="docs-viz-flow-hint">在浏览器里核对并持续精修，直到它符合 brief。</span>
    </div>
  </div>
  <p class="docs-viz-caption">每个阶段都不可跳过。大多数 AI 产出真正失败的地方，其实在 discovery：一旦代码已经写出来，前面的思考也就被锁死了。</p>
</div>

## 何时使用

`/impeccable craft` 是端到端的构建命令。你只需要给它一个功能描述，它就会自己跑完整条流水线：结构化 discovery、reference loading、implementation、visual iteration。适合你从零开始做一个新功能，并且希望一次调用就走完整个流程的时候使用。

下面这些情况特别适合它：

- **你正在做一个新功能，并且想走完整流程。** 你不想自己手动管理各个步骤。
- **你知道要做什么，但还不知道它应该长什么样。** Discovery phase 会逼着设计思考先发生，再进入实现。
- **你希望 visual iteration 默认存在。** `craft` 会在浏览器里检查结果，并持续 refining 到足够精致，而不是把第一个能跑的版本直接发出去。

如果你只想做思考、不想动代码，就单独用 `/impeccable shape`。如果你已经有非常明确的视觉方向、只是想直接开始做，那就直接用 `/impeccable` 加功能描述。`craft` 介于两者之间：结构化、完整，而且很有主见。

## 它是怎么工作的

`craft` 会按顺序跑四个阶段：

1. **Shape the design。** 内部先运行 `/impeccable shape`：一段简短 discovery conversation，围绕 purpose、users、content、constraints 和 goals 展开。输出是一份你可以阅读、也可以反驳的设计 brief。
2. **Load references。** 根据 brief，加载合适的 reference 文件（spatial、typography、motion、color、interaction、responsive、UX writing），确保模型在开始写代码前就已经装载了相关原则。
3. **Build。** 按一个有意识的顺序实现功能：先结构，再 spacing 和 hierarchy，再字体与颜色，再 states，再 motion，再 responsive。每个设计决策都能追溯回前面的 brief。
4. **Visual iteration。** 在浏览器中打开结果，根据 brief 和 anti-pattern catalog 检查它，并持续 refining，直到结果真正符合初始意图。这一步极其关键。第一个能工作的版本，从来都不该是发出去的版本。

Discovery phase 不可跳过，这正是重点。大多数 AI 生成 UI 失败，是因为在模型开始写 JSX 前，根本没人问清楚“用户到底要完成什么”。`craft` 把这个顺序反了过来。

## 试试看

```text
/impeccable craft a pricing page for a developer tool
```

先预期会有一轮 5 到 10 个问题的 discovery interview。它会问你的受众、产品个性、你希望传达的情绪、anti-references，以及各种约束条件。之后是一份 design brief。再之后才是 implementation，并且浏览器会在每个阶段都被用来检查结果。最后通常还会经历多轮 visual polish 迭代。

整个流程会比普通命令更长，因为它把思考、构建和精修都塞进了一次运行里。这就是它的权衡：前期结构更多，后期返工更少。

## 常见误区

- **拿它来做小修改。** `craft` 是为新功能准备的，不是 touch-up 工具。面对已有代码，更合适的是 `/impeccable polish`、`/impeccable critique`，或者某个具体 refine command。
- **急着跳过 discovery phase。** 相比“直接开始写代码”，访谈会显得慢，但它其实不慢。认真回答这些问题，会得到更锋利的 brief，而更锋利的 brief 会带来更锋利的构建，也就意味着更少的返工。
- **跳过 visual iteration。** 这个阶段存在是有原因的。“技术上能工作”和“感觉真的对了”之间的差距，只能靠视觉层面的打磨来补，不靠代码 review。