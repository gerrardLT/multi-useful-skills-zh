---
tagline: "让功能性界面多出一些个性时刻，变得更值得被记住。"
---

## 何时使用

`/impeccable delight` 适合那种“能用，但没什么感觉”的界面。当核心体验已经稳固，而你想加入一些会被用户记住的人味细节时，就该用它：一个经过斟酌的 empty state、一句有态度的 loading message、一段让人觉得“值了”的成功动画、一句会让人会心一笑的 microcopy。

这是一个收尾型 skill。绝不要把它作为新构建里的第一步。

## 它是怎么工作的

这个 skill 会主动去找那些最容易被设计师跳过、但最适合注入 delight 的地方：

1. **Empty states**：不要只是 “No items yet”，而是写成与品牌气质相配、带点个性的状态。
2. **Loading 和等待时刻**：最好的产品会把等待本身也变成内容。
3. **成功反馈**：当确实发生了值得庆祝的事时，给用户一个小小的庆祝时刻。
4. **Microcopy**：按钮标签、tooltips、错误提示、placeholder text。字很少，但要有品位。
5. **彩蛋和次级状态**：那些用户自己发现后，会觉得“你们居然连这里都想到了”的细节。

这个 skill 会从 `PRODUCT.md` 中读取品牌语气。一个严肃的分析工具，得到的是严肃型 delight（干一点、准一点、带一点聪明劲）；一个活泼的消费级应用，则会得到更外显的个性。它不会在错误的受众面前硬塞幽默。

它遵守的底线是：就算你把所有 delight 都删掉，那个界面也必须依然完整可用。任何核心功能都不能依赖“好玩”才能成立。

## 试试看

```text
/impeccable delight the first-run experience
```

可能得到的新增内容：

- 空 dashboard 不再是 “No data yet”，而是变成 “Your dashboard is quiet. Let's fix that.”，并配一个单动作 CTA。
- 初次同步会增加一个 3 状态 loading message，逐步推进：`Finding your accounts... / Pulling the last 30 days... / Making it look good...`
- 第一次成功操作时，会触发一个一次性的 toast，带一点轻微庆祝；之后则只保留安静的 checkmark。
- 那个较难理解字段的帮助 tooltip，会有一种“真有人认真写过它”的口吻。

## 常见误区

- **强行搞笑。** 不是每个品牌都该活泼。如果 `PRODUCT.md` 里的品牌语气是 “clinical and precise”，那 delight 应该体现为聪明的克制，而不是段子。
- **过度装饰。** 一个 delight 时刻会让人记住，二十个只会变成噪声。这个 skill 故意是保守的。
- **在 polish 之前先跑 delight。** Polish 用来修正错误；delight 用来补足缺失。顺序不能反。
