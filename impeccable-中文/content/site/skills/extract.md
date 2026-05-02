---
tagline: "将可复用组件、tokens 和模式收归设计系统。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-flow">
    <div class="docs-viz-flow-step">
      <span class="docs-viz-flow-num">01</span>
      <span class="docs-viz-flow-name">识别偏差</span>
      <span class="docs-viz-flow-hint">重复的 hex 值、按钮变体、间距尺度、文字样式。</span>
    </div>
    <div class="docs-viz-flow-step">
      <span class="docs-viz-flow-num">02</span>
      <span class="docs-viz-flow-name">定义基础元素</span>
      <span class="docs-viz-flow-hint">Token 名称、带 variant + size 的组件 API、文字样式。</span>
    </div>
    <div class="docs-viz-flow-step docs-viz-flow-step--accent">
      <span class="docs-viz-flow-num">03</span>
      <span class="docs-viz-flow-name">迁移调用点</span>
      <span class="docs-viz-flow-hint">用新的基础元素替换重复的 CSS。确保不留孤儿代码。</span>
    </div>
  </div>
  <p class="docs-viz-caption">此技能仅提取那些以相同意图出现 3 次及以上的内容。出现 2 次不算模式，且迁移操作必定在同一轮内完成。</p>
</div>

## 何时使用

`/impeccable extract` 适用于代码库在不知不觉中已“长成”一个设计系统，但尚未被正式承认的情况。例如：按钮样式在 12 处重复编写、同一类卡片有 3 个变体、hex 颜色值散落各处、手写的间距值意外地对齐成了某种尺度。当你希望将这种偏差收拢为可复用的基础元素时，就该使用它。

最好在产品已上线足够多功能、那些重复模式真正显现出来之后再使用。过早提取，只会制造与现实脱节的抽象。

## 工作原理

此技能会先识别当前设计系统的结构，然后寻找适合提取的机会点：

1. **Tokens**：找出重复的字面值（颜色、间距、圆角、阴影、字号），给出 token 名称，将其加入 token 系统，并替换所有用法。
2. **Components**：找出带少量变体但反复出现的 UI 模式（按钮、卡片、输入框、模态框），提取为一个带 variants 的单一组件，并迁移调用处。
3. **Composition patterns**：找出反复出现的布局或交互模式（表单行、工具栏组、空状态），提取为组合基础元素。
4. **Type styles**：找出重复出现的 font-size + weight + line-height 组合，提取为文字样式。
5. **Animation patterns**：找出重复出现的 easing、duration 或 keyframe 组合，提取为动效 tokens。

此技能非常谨慎。它只提取那些以相同意图被使用了三次及以上的内容。它绝不会因为“未来可能复用”就提前抽象。过早抽象通常比重复本身更糟。

## 试试看

```text
/impeccable extract the button styles
```

预期输出：

- 在 8 个文件中找到 14 处按钮实例
- 识别出 4 种明确变体：primary（实心强调）、secondary（描边）、ghost（纯文本）、destructive（红色实心）
- 这 4 种变体共用同一套尺寸尺度（small、default、large）
- 已提取为 `<Button variant="primary" size="default">`，并接入 token 驱动样式
- 已迁移 14 个调用点，删除约 180 行重复 CSS
- 新增 3 个缺失 tokens：`--button-radius`、`--button-padding-y`、`--button-padding-x`

## 常见误区

- **提取得太早。** 两次使用不算模式，三次可能才算。等模式真正显现后再动手。
- **过度泛化。** 被提取的组件应先贴合当前真实用例，而非提前预判所有未来可能。以后总还能再加变体。
- **忘记迁移。** 只提取、不迁移，旧的重复代码就会继续存在，等于凭空创造了第三种做同一件事的方式。提取和迁移必须在同一轮内完成。
- **提取意图不同的东西。** 两个看起来相似、但用途不同的按钮（例如主操作按钮 vs 伪装成按钮的链接）通常不应强行合并。