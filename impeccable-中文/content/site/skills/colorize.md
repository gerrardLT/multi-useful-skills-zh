---
tagline: "在不变俗艳的前提下，为单色界面加入有策略的颜色。"
---

## 何时使用

`/impeccable colorize` 是对抗“整个界面全是灰”的那股反作用力。比如看起来像一堵米色墙的 dashboard、毫无强调的表单、像任何一个 SaaS 产品都可能有的内容页。当一个界面功能上没问题，但情感上过于平，且你想加一点温度，又不想滑进典型 AI 配色（紫粉渐变、青色霓虹、暗色模式发光）时，就该用它。

## 它是怎么工作的

这个 skill 会先读取你的品牌主色（如果已有），然后判断颜色该在哪些地方真正“有资格出现”：

1. **Primary action**：拿到最强烈的品牌色表达。
2. **Secondary accents**：使用更弱的 muted / tinted 变体，而不是再引入第二个完整主色。
3. **Neutrals**：会以极低 chroma（大约 0.005 到 0.01）向品牌色轻轻染色。单像素看几乎察觉不到，但整体上会产生潜意识的一致性。
4. **Content categories**：使用有限而明确的强调色系统，而不是一整道彩虹。

很关键的一点是：它使用的是 OKLCH，而不是 HSL，因此相同 lightness 的步进在视觉上看起来也更接近真实相等。随着 lightness 向两端走，chroma 会自动下降。这样得到的颜色会显得是被认真推敲过的，而不是算出来的。

## 试试看

```text
/impeccable colorize the dashboard
```

预期 diff：

- 品牌色从一个 hardcoded hex 改成 `--color-accent: oklch(62% 0.18 240)`
- Neutrals 以 0.007 的 chroma 向品牌色轻微偏染
- Primary button 使用完整 accent，secondary buttons 退回 ink / mist 体系
- 图表序列采用 3 个不同色相，但 lightness 对齐，因此不会有某一条曲线在视觉上压过其他
- Empty state illustration 带上一层轻微的 accent wash

## 常见误区

- **在没有品牌主色时就硬跑它。** Colorize 需要一个起点。如果 `PRODUCT.md` 没有指定品牌色，它会询问。不要让它自己掉进 AI 配色默认值里。
- **以为它能直接修掉 AI color palette 问题。** 如果你当前设计里已经有紫色渐变和青色霓虹，那你应先用 `/impeccable quieter` 把噪声降下来，再让 colorize 重建体系。
- **把它用在本来就很花的界面上。** 那是 `/impeccable quieter` 的工作。Colorize 负责加，不负责减。
