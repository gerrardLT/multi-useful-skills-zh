---
title: 用可视化 overlay 做 critique
tagline: "把 /impeccable critique 和浏览器 overlay 结合起来，在真实页面上基于 ground truth 做评审。"
order: 4
description: "运行一次完整设计 critique，把 LLM 评估、自动检测器，以及浏览器里的实时 overlay 合并起来，让你直接在页面上看到每条 anti-pattern 是由哪个元素触发的。"
---

## 你将完成什么

你会在浏览器里的真实页面上运行一轮完整设计 critique，并且每个被标记出来的 anti-pattern，都会直接高亮在对应元素上。无需反复查看截图，也不用自己将大量 findings 映射回代码。

总耗时大约十分钟。

## 前置条件

- 项目中已安装 Impeccable（如果还没有，请先看 [getting started](/tutorials/getting-started)）。
- 你的 harness 具备浏览器自动化能力（例如带 Chrome extension 的 Claude Code，或类似环境）。
- 一个你想做 critique 的页面，可以是本地的（`localhost:3000/pricing`），也可以是已部署页面。

## 第 1 步：运行 /impeccable critique

在你的 harness 中运行：

```text
/impeccable critique the pricing page at localhost:3000/pricing
```

这个 skill 会并行启动两套彼此独立的评估，它们在不同的 sub-agents 中运行，因此互相不会污染判断。

### LLM 评估会做什么

第一套评估会读取你的 source code；如果浏览器自动化可用，它还会在新标签页中打开这个 live page。然后它会沿着 impeccable skill 的完整 DO / DON'T catalog 检查页面，并根据 Nielsen 的 10 条启发式原则、8 项认知负荷清单，以及 `PRODUCT.md` 中的品牌契合度来打分。

它会把自己打开的标签页标题加上 `[LLM]`，方便你区分。

### 自动检测器会做什么

第二套评估会对页面运行 `npx impeccable detect`。这一套是确定性的：大约 30 条具体模式检查，要么命中，要么不命中。比如 gradient text、紫色 AI 配色、side-tab 边框、嵌套卡片、行长问题、低对比、小字号正文等等。[完整规则目录](/anti-patterns) 会列出每条规则，以及它是由 CLI、浏览器还是 LLM-only 层捕获的。

最终你会得到一份 JSON 列表，里面记录了每条 finding、对应元素 selector、触发规则以及简短描述。

## 第 2 步：打开可视化 overlay

Impeccable 自带一个可视化模式，可以把每个检测到的 anti-pattern 直接高亮在页面上。下面这个嵌入演示的是它在一个故意做坏的 synthwave landing page 上运行时的样子：

<div class="tutorial-embed">
  <div class="tutorial-embed-header">
    <span class="tutorial-embed-dot red"></span>
    <span class="tutorial-embed-dot yellow"></span>
    <span class="tutorial-embed-dot green"></span>
    <span class="tutorial-embed-title">Live detection overlay</span>
  </div>
  <iframe src="/antipattern-examples/visual-mode-demo.html" class="tutorial-embed-iframe" loading="lazy" title="Impeccable visual overlay running on a demo page"></iframe>
</div>

每个描边高亮的元素旁边都会浮一个标签，指出是哪条规则触发了。悬停 outline 时，还能看到完整 finding。你在自己页面上看到的就是这个效果。

打开方式有两种：

1. **[Chrome extension](https://chromewebstore.google.com/detail/impeccable/bdkgmiklpdmaojlpflclinlofgjfpabf)**：在任意页面上一键激活。点击浏览器工具栏里的 Impeccable 图标，所有 anti-pattern 都会立刻被高亮。
2. **在 `/impeccable critique` 内部自动打开**：这个 skill 在浏览器部分评估时，会打开一个标题带 `[Human]` 的标签页，并启动 detector。你无需额外做任何事。

本教程里最简单的做法是直接用 Chrome extension。装好扩展，打开你的 pricing page，点击 Impeccable 图标，就会马上看到 overlay 覆盖在 live page 上。

## 第 3 步：把两套评估结果合并起来看

回到 harness，`/impeccable critique` 此时应该已经完成，并产出一份组合报告。大致会长这样：

```text
AI slop 判定：FAIL
  Detected tells: gradient-text (2), ai-color-palette (1),
                  nested-cards (1), side-tab (3)

Heuristic scores (avg 2.8/4):
  Visibility of status: 3 (good)
  Match between system and real world: 2 (partial)
  Consistency and standards: 2 (partial)
  ...

Cognitive load: 3/8 failures (moderate)
  Visible options at primary decision: 6 (flag)
  Decision points stacked at top: yes (flag)
  Progressive disclosure: absent on advanced pricing toggles

What's working:
  - Clear price hierarchy
  - Strong headline

Priority issues:
  1. Hero uses gradient text on the main price
     Why: AI tell, reduces contrast, hurts scannability
     Fix: solid ink color at one weight heavier
  2. Feature comparison table has 4 nested card levels
     Why: visual noise, unclear hierarchy
     Fix: flatten to a table with zebra striping

Questions to answer:
  - Is the free tier a real product or a funnel?
  - What does a user feel when they land here from an ad vs from search?
```

## 第 4 步：修这些 findings

报告已经给出了优先级列表。你可以逐条修，也可以让模型一次性全修，或者两者混合。关键在于：用 overlay 来验证修复是否真的生效。

1. 保持 overlay 标签页开着。
2. 在代码中修复问题（或者让模型一次性全修）。
3. 刷新页面。overlay 会重新扫描，被解决的 findings 会直接消失。

这正是 overlay 的价值所在。你能实时看到修复生效，也不会把一个其实没有满足规则的“修复”误发到生产环境。

## 第 5 步：全部修完后再跑一次

当你处理完优先级列表后，再跑一遍 `/impeccable critique`。目标是拿到干净的 AI slop 判定，并且启发式平均分至少达到 3.5。认知负荷最好低于 2 项失败。

如果仍有规则命中，就继续修，或者在确有必要时写 suppression comment 解释为什么这条规则在你的上下文里并不适用（detector 支持少量 opt-out pragmas，但请节制使用）。

## 接下来可以试什么

- [用 Live Mode 继续迭代 critique 找出的元素](/tutorials/iterate-live)。选中 critique 标记的那个元素，丢一句 comment，让它原地热替换出三个新方向，然后把你选中的那一个写回 source。
- `/impeccable audit the same page`，去抓 critique 不覆盖的实现层问题（可访问性、性能、主题一致性）。
- 如果 critique 报告已经很干净，而你只想做最后一轮精修，就跑 `/impeccable polish`。
- 如果 critique 标了 “too busy” 或 “cognitive load”，就跑 `/impeccable distill`。Distill 专门负责把不该存在的东西移除掉。

## 常见问题

- **Overlay 没显示任何 finding，但 critique 明明说有问题。** detector 抓的是确定性模式，critique 抓的是判断性问题。两者互补，而非重复。
- **LLM 评估和 detector 结论不一致。** 这是正常的。LLM 是主观判断，detector 是确定性规则。当它们不一致时，就同时看两边，再做决定。
- **Overlay 把页面布局搞坏了。** 这种情况很少见，但有些 CSS 的确会和注入 overlay 的样式互相干扰。最稳的方式仍然是用 [Chrome extension](https://chromewebstore.google.com/detail/impeccable/bdkgmiklpdmaojlpflclinlofgjfpabf)，或者直接在 CLI 中运行 `npx impeccable detect`，然后手动套用 findings。