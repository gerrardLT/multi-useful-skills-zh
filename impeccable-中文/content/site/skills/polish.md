---
tagline: "把“不错”和“真的很到位”之间那层细微差别认真收完。"
---

## 何时使用

`/impeccable polish` 是你在发版前最后该跑的东西。它会追那些真正把“已完成的功能”和“完成得很精致的功能”区分开的细节：半像素错位、不一致的间距、漏掉的 focus state、会闪一下的 loading transition、语气漂移的 copy。它还会把功能重新拉回设计系统轨道：把 hard-coded 值换成 tokens，用共享组件替掉自定义实现，并修复所有偏离既有模式的地方。

当一个功能在功能层面已经完成、没有明显坏掉，但你总觉得“还差一点”时，就该用它。如果一个功能已经偏离设计系统很远，也该拿它来把东西重新拉齐。

## 它是怎么工作的

Polish 会先识别项目里的设计系统（tokens、spacing scale、shared components），然后沿着六个维度有条理地清理：

1. **视觉对齐与间距**：像素级网格对齐、一致的 spacing scale、图标的光学对齐。
2. **字体排版**：层级一致性、行长、widows / orphans、标题字距。
3. **颜色与对比**：token 使用、主题一致性、WCAG 对比度、focus indicators。
4. **交互状态**：hover、focus、active、disabled、loading、error、success。每个状态都必须有交代。
5. **过渡与动效**：缓动顺滑、无布局抖动、尊重 `prefers-reduced-motion`。
6. **文案**：语气一致、时态正确、没有 placeholder 字符串、没有 stray TODO。

这个 skill 有一个非常明确的立场：polish 是最后一步，不是第一步。如果功能本身还没做完，那去 polish 它就是浪费时间。

## 试试看

```text
/impeccable polish the pricing page
```

一次健康的运行通常长这样：

```text
Visual alignment: fixed 3 off-grid elements (8px baseline)
Typography: tightened h1 kerning, fixed widow on testimonial
Interaction: added hover state on FAQ items, focus ring on email input
Motion: softened modal entrance, added reduced-motion fallback
Copy: removed one "Lorem ipsum" stray, aligned button voice
```

五个小修复，没有重写。这就是一次好的 polish pass 的典型形状。

## 常见误区

- **在工作还没完成时就去 polish。** 如果代码里还有 TODO，那就说明你还没到这个阶段。`/impeccable polish` 只该用在真正完成的功能上。
- **把 polish 当 redesign。** Polish 是精修现有内容。如果你发现自己开始重构整个布局，那你需要的是 `/impeccable critique` 或 `/impeccable layout`。
- **在没跑 `/impeccable audit` 之前就只跑 polish。** Polish 抓的是“感觉不对”的问题，Audit 抓的是“可测量”的问题。最好两者都用。