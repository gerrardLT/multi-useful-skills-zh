---
tagline: "设计 first-run 体验、empty states，以及用户抵达价值的路径。"
---

## 何时使用

`/impeccable onboard` 适合那些决定新用户会不会留下来的关键时刻：第一屏、empty state、setup flow、产品导览、以及那个 “我现在该干嘛” 的空档期。当 activation 很弱、新用户在触达价值前就流失，或者你的产品里存在那种写着 “no items yet” 然后就没下文的空状态时，就该用它。

## 它是怎么工作的

这个命令从一个问题出发：用户的 aha moment 是什么？以及一个新用户最快多久能到那里。后续每个设计决策都要指向这个时刻。

它会在那些决定第一印象的表面上展开工作：

1. **First-run experience**：注册后的最初几分钟。用户应该看到导览、空白画布、填充示例，还是干脆什么都不要？要选与你产品性质匹配的方式。
2. **Empty states**：每个零数据页面都要能帮助用户定向。我现在在哪？为什么这里是空的？接下来该做什么？等它有内容以后会长成什么样？
3. **Setup 和安装**：必须配置的内容尽量少，默认值尽量聪明，每一步都要解释它为什么重要。
4. **Progressive disclosure**：高级功能在用户还没“挣到”它们之前，先不要挡路。
5. **Activation events**：用户第一次真正体验到核心价值的那一刻，要被记录、被承认，并以安静的方式被庆祝。

这个命令会主动抵抗两种常见失败模式：一种是过度教程化的 onboarding，用户还没碰到任何真实功能，就先被迫点完一整套 carousel；另一种是零 onboarding，用户直接被扔进一个空空的应用里，只能自己猜。

## 试试看

```text
/impeccable onboard the editor
```

典型输出：

- First-run：空编辑器不再直接展示为空白，而是先放入一份可修改的示例文档。点击 Cancel 会丢弃示例，开始编辑则会把内容替换成用户自己的工作。
- 文档列表上的 empty state：`No documents yet. Create your first, or import from Notion, Google Docs, or Markdown.`
- Setup：从原本需要 6 个必填项，减少到 1 个（workspace name）；其他全部都有智能默认值，并且以后可以在 settings 中修改。
- Activation：用户第一次保存文档时，会出现一个轻量 toast：`Saved. Your work is in the cloud now.` 只出现一次，不会反复打扰。

## 常见误区

- **默认答案就是做一个产品导览。** 大多数产品其实并不需要导览，它们需要的是更好的第一屏。Tour 往往只是拐杖。
- **在没定义 aha moment 之前就开始设计 onboarding。** 如果你不能用一句话说出用户在前 60 秒里应该感受到什么，那就先回到 `/impeccable shape`。
- **把 onboard 用在一个本身就坏掉的流程上。** 先把流程修好。Onboarding 没法拯救一个核心动作本身就损坏的产品。
