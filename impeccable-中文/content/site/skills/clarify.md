---
tagline: "把令人困惑的 UX 文案改写到界面自己会说话。"
---

## 何时使用

`/impeccable clarify` 适合那些会让用户停下来想一秒钟的界面文本：令人困惑的 labels、含义模糊的按钮文案、仿佛在责怪用户的错误提示、只是重复 label 的 tooltip、什么都没说明白的 empty state。当问题不在 layout、不在颜色，而在“这些字写得不对”时，就该用它。

很典型的触发语句包括：“users do not understand this field”“the error message is not helpful”“I cannot write good button copy”“this tooltip is a waste”。

## 它是怎么工作的

这个 skill 会在最容易藏 UX copy 问题的几类表面上重写文本：

1. **Labels 和 field hints**：必须直接、具体，并明确告诉用户这里期待什么。
2. **Button copy**：以动词开头，描述结果，而不是只描述动作。应写 “Save changes”，而不是 “OK”。
3. **Error messages**：说清楚哪里错了、问题归因于什么、下一步该怎么做。绝不责怪用户。
4. **Empty states**：帮助用户定向，解释为什么这里是空的，并给出下一步。
5. **Tooltips 和 helper text**：补充 label 无法承载的信息，而不是简单复述它。
6. **Confirmation dialogs**：描述后果，而不是只重复动作名称。

这个 skill 会从 `PRODUCT.md` 中读取受众类型和他们的心理状态，以便调节语气。技术受众会得到更精确的语言；消费级受众会得到更自然的口语；匆忙的用户需要更短的文本；而在付款、删除等高焦虑场景中，用户需要被安抚。

## 试试看

```text
/impeccable clarify the billing form
```

一些典型的前后对比：

- Label `Billing address` -> `持卡人账单地址`
- Placeholder `Enter your VAT ID` -> `VAT ID (optional, for business)`
- Error `Invalid input` -> `这张卡号应为 15 位，你输入了 14 位。`
- Button `Submit` -> `Charge $29 and subscribe`
- Empty state `No transactions yet` -> `Your first charge will show up here after your first order.`

## 常见误区

- **写得更花哨，而不是更清楚。** Clarify 不是拿来升级 voice 的。如果文案本身已经够清楚，就不该用它；如果你要的是个性，请用 `/impeccable delight`。
- **跳过受众问题。** Clarify 需要知道是谁在读。如果 `PRODUCT.md` 里没有说明受众技术水平，重写结果就会更泛。
- **拿它去改营销文案。** Clarify 适合功能型 UX 文案：labels、errors、instructions。营销文案需要的是另一套方法，也更需要人类写作者参与。