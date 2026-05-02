# Spatial Design

## 间距系统

### 用 4pt 基准，不要只用 8pt

8pt 系统颗粒度太粗，你会经常需要 12px 这种夹在 8 和 16 之间的值。用 4pt 更灵活：4、8、12、16、24、32、48、64、96px。

### 用语义给 Token 命名

按关系命名，例如 `--space-sm`、`--space-lg`，而不是按数值命名，例如 `--spacing-8`。同级元素之间的间距优先用 `gap`，而不是 margin。这样可以避免 margin collapse，也不用再写各种收尾 hack。

## 栅格系统

### 自适应网格

对于不需要写死断点的响应式网格，优先用 `repeat(auto-fit, minmax(280px, 1fr))`。这表示列宽最少 280px，每行能放多少列就放多少列，剩余空间自动拉伸。更复杂的布局可以使用具名 grid area（`grid-template-areas`），并在断点处重新定义。

## 视觉层级

### 眯眼测试

把眼睛眯起来，或者直接把截图模糊掉。然后问自己：

- 你还能认出最重要的元素吗？
- 第二重要的元素还能认出来吗？
- 分组关系还是清楚的吗？

如果一模糊以后所有东西重量都差不多，那就是层级出了问题。

### 用多个维度共同建立层级

不要只靠尺寸。应当组合使用：

| 工具 | 强层级 | 弱层级 |
|------|--------|--------|
| **尺寸** | 比例 3:1 或更大 | 小于 2:1 |
| **字重** | Bold 对比 Regular | Medium 对比 Regular |
| **颜色** | 高对比 | 色调接近 |
| **位置** | 上方 / 左侧（主） | 下方 / 右侧 |
| **空间** | 被留白包围 | 挤在一起 |

**最好的层级通常会同时用 2 到 3 个维度。** 例如一个标题既更大、更重，同时上方还有更多留白。

### Card 不是必需品

Card 被过度使用了。很多时候，间距和对齐本身就足以自然建立分组。只有在下面这些场景里，card 才真正合理：

- 内容本身确实独立且可操作
- 多个项目需要在网格中做视觉比较
- 内容需要清晰的交互边界

**绝不要 card 套 card。** 如果一个 card 内部还要继续做层级，请靠间距、排版和细分隔线来完成。

## Container Queries

viewport query 是给页面布局用的。**container query 是给组件用的。**

```css
.card-container {
  container-type: inline-size;
}

.card {
  display: grid;
  gap: var(--space-md);
}

@container (min-width: 400px) {
  .card {
    grid-template-columns: 120px 1fr;
  }
}
```

**为什么这很重要：** 同一张 card 放在狭窄侧边栏里时，会自动保持紧凑；放在主内容区里时，又能自动展开，而不用靠 viewport hack 去硬判断。

## 光学调整

文字即使 `margin-left: 0`，在视觉上也常常会像是缩进了一点，因为字形本身带有留白。所以你可能需要一个轻微负 margin（例如 `-0.05em`）做光学校正。几何中心对齐的图标，有时也会在视觉上偏掉，比如播放按钮往往要往右挪一点，箭头要向它指向的方向轻微偏移。

### 触控目标与视觉尺寸

按钮看起来可以小，但可点击区域必须够大，至少要有 44px。可以用 padding 或伪元素补出来：

```css
.icon-button {
  width: 24px;
  height: 24px;
  position: relative;
}

.icon-button::before {
  content: '';
  position: absolute;
  inset: -10px;
}
```

## 深度与层级

为 z-index 建一套语义化层级，例如 dropdown -> sticky -> modal-backdrop -> modal -> toast -> tooltip，而不是随手写一堆数字。阴影同样应当有一致的 elevation scale（sm -> md -> lg -> xl）。**关键点是：** 阴影应该克制。如果你能明显看出“这里有个阴影”，那它通常已经太重了。

---

**避免：** 在间距尺度之外随手写任意值；把所有间距都做成一样大（变化本身能建立层级）；只靠尺寸做层级，而不组合字重、颜色和留白。
