---
tagline: "先想清楚再动手。通过 discovery 产出设计 brief，而不是靠猜。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-file">
    <div class="docs-viz-file-header">
      <span class="docs-viz-file-name">brief.md</span>
      <span class="docs-viz-file-status">/impeccable shape 的输出</span>
    </div>
    <div class="docs-viz-file-body">
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Purpose</span>
        <span class="docs-viz-file-v">让已经订阅的用户修改接收内容，而不是把他们逼到退订。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">User</span>
        <span class="docs-viz-file-v">赶时间、在手机上、正在开会中。阅读很快，耐心很低。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Content</span>
        <span class="docs-viz-file-v">4 种 digest 类型，2 种频率，底部有一个全部退订入口。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Feeling</span>
        <span class="docs-viz-file-v">冷静、可信、不耍花招。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Constraints</span>
        <span class="docs-viz-file-v">移动优先。WCAG AA 对比度。单列，无模态窗。</span>
      </div>
    </div>
    <div class="docs-viz-file-footer">把它交给 <code>/impeccable</code>、<code>/impeccable craft</code>，或任何其他实现流程。</div>
  </div>
  <p class="docs-viz-caption">Shape brief 更像指南针，而不是规范文档。它抓的是意图，不是具体 UI。实现型 skills 会在写第一行代码前先读取它。</p>
</div>

## 何时使用

`/impeccable shape` 是一个功能真正开始的地方。在任何人写代码之前，在任何人开始争论 hero 应该长什么样之前，在任何人去选字体之前，先用它把关于 purpose、users、content 和 constraints 的 discovery conversation 强制展开，然后把答案沉淀成一份设计 brief，供后续实现型 skills 使用。

只要一个功能即将开始、一个 ticket 写得很模糊，或者你发现自己正试图通过先写 JSX 来“倒推产品应该是什么”，就该用它。

## 它是怎么工作的

大多数 AI 生成的 UI 失败，并不是因为代码差，而是因为前面的思考被跳过了。模型会直接进入“给你一排卡片网格”，却从没问过“用户到底想完成什么”。`/impeccable shape` 就是把这个顺序彻底倒过来。

这个 skill 会在对话中运行一轮结构化 discovery interview。在这个阶段，它**不会写任何代码**。问题会覆盖：

- **Purpose 与 context**：这个功能是做什么的，谁会用它，他们当下处于什么心理状态
- **Content 与 data**：页面上会展示什么，真实数据范围怎样，边界情况是什么，哪些内容是动态的
- **Design goals**：最重要的一件事是什么，希望用户感受到什么，有哪些参考
- **Constraints**：技术限制、内容限制、可访问性限制、本地化限制

你可以自然回答，不用填表。这个 skill 会追问，而不是只机械地列清单。最后，它会产出一份设计 brief：一个结构化工件，可以直接交给 `/impeccable` 或其他实现型 skill 使用。

说明一下：如果你想要的是完整流程（discovery interview 之后直接进入构建），那就用 `/impeccable craft`。它内部会先跑 `/impeccable shape`，然后继续进入实现和可视化迭代。单独使用 `/impeccable shape`，则适用于你只想先拿到 brief，再决定自己要用什么实现路径。

## 试试看

```text
/impeccable shape a daily digest email preferences page
```

预期会是一段 5 到 10 个问题的对话。这个 skill 会问诸如：“打开这个页面的人是谁？他们是已经承诺留下来的用户，还是还在犹豫的人？”以及“如果用户已经把所有内容都退订了，我们应该隐藏这个功能，还是明确展示某种状态？”你回答之后，一份 brief 就会逐渐成形。

接下来你可以把这份 brief 交给 `/impeccable`、`/impeccable polish`，或者任何其他 skill。也可以只是把它当成手工构建时的参考。

## 常见误区

- **因为它看起来慢，就想跳过。** 这段访谈可能只要 5 分钟，而你因此避免掉的返工通常是以小时计的。
- **把 brief 当成 spec。** 它是指南针，不是检查清单。它记录的是意图，不是具体 UI。
- **用 “standard” 或 “normal” 这种词回答。** 具体性就是全部意义所在。如果用户是 “rushed, on mobile, between meetings”，就明确写出来。它会改变后面的一切。