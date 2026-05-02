---
tagline: "修掉那些显得泛、乱、或者像是顺手打出来的排版问题。"
---

## 何时使用

当一个页面上的文字看起来像“默认字体堆出来的”，而不是“被认真设计过的排版”，就该用 `/impeccable typeset`。比如层级发糊、三个字号看起来差不多、正文只有 14px、所谓 display font 实际只是 Inter bold、标题里完全没有字距处理。

常见触发语句包括：“hierarchy feels flat”“readability is off”“fonts look generic”。

## 它是怎么工作的

这个 skill 会从五个维度评估排版：

1. **字体选择**：是否在使用毫无存在感的默认字体（Inter、Roboto、Arial、Open Sans）；字体是否匹配品牌；是否用了超过 2 到 3 套字族。
2. **层级**：标题、正文、caption 是否一眼就能看出不同；层级间的尺寸对比是否至少有 1.25x；字重对比是否足够清晰。
3. **尺寸与比例**：是否存在一套自洽的 type scale；正文是否满足 16px 最低标准；当前场景应该使用固定 rem 比例还是 marketing 页用的 fluid clamp。
4. **可读性**：行长是否在 45 到 75 个字符之间；行高是否根据字体和上下文调过；对比度是否足够。
5. **一致性**：同一元素在各处是否使用相同处理；是否散落着一堆一次性的 `font-size` override。

然后它会把这些问题真正修掉：挑更有辨识度的字体、建立模块化比例、拉开层级对比、设定合适的行长和 leading。

## 试试看

```text
/impeccable typeset the article layout
```

预期 diff：

- Display font 从 Inter 700 换成一套真正的 display face
- 重建 type scale：`3rem / 2rem / 1.25rem / 1rem / 0.875rem`，比例为 1.333
- 正文字号从 14px 提升到 16px
- 文章列的行长被 clamp 到 68ch
- 正文 `line-height` 设为 1.6，display 设为 1.1
- 删除了组件样式中四个零散的一次性 `font-size` 值

## 常见误区

- **在没有上下文时就要它帮你挑新字体。** Typeset 会基于 `PRODUCT.md` 中的品牌语气来选择。如果你还没跑 `/impeccable teach`，建议会更泛。
- **实际上是 layout 问题，却来跑 typeset。** 如果段落本身没问题，只是页面显得太挤，那你更需要 `/impeccable layout`。
- **期待它在 app UI 里用 fluid clamp scale。** Typeset 会在应用界面中坚持使用固定 rem 比例。Fluid typography 主要保留给那些行长变化很大的 marketing / content pages。
