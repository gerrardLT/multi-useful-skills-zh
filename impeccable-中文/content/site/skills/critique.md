---
tagline: "一套同时带评分、persona 测试和自动检测的设计评审。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-critique">
    <div class="docs-viz-critique-head">
      <div class="docs-viz-critique-verdict">
        <span class="docs-viz-critique-verdict-label">AI slop 判定</span>
        <span class="docs-viz-critique-verdict-value">FAIL</span>
      </div>
      <span class="docs-viz-report-target">gradient-text &middot; ai-color-palette &middot; nested-cards</span>
    </div>
    <div class="docs-viz-critique-cols">
      <div>
        <div class="docs-viz-critique-col-title">启发式原则（Nielsen）</div>
        <div class="docs-viz-critique-heuristics">
          <div class="docs-viz-critique-heur">
            <span>状态可见性</span>
            <span class="docs-viz-critique-heur-score docs-viz-critique-heur-score--good">3</span>
          </div>
          <div class="docs-viz-critique-heur">
            <span>贴近真实世界</span>
            <span class="docs-viz-critique-heur-score docs-viz-critique-heur-score--ok">2</span>
          </div>
          <div class="docs-viz-critique-heur">
            <span>一致性与标准</span>
            <span class="docs-viz-critique-heur-score docs-viz-critique-heur-score--ok">2</span>
          </div>
          <div class="docs-viz-critique-heur">
            <span>错误预防</span>
            <span class="docs-viz-critique-heur-score docs-viz-critique-heur-score--good">3</span>
          </div>
          <div class="docs-viz-critique-heur">
            <span>识别优于回忆</span>
            <span class="docs-viz-critique-heur-score docs-viz-critique-heur-score--bad">1</span>
          </div>
        </div>
      </div>
      <div>
        <div class="docs-viz-critique-col-title">人物视角</div>
        <div class="docs-viz-critique-personas">
          <div class="docs-viz-critique-persona">
            <div>
              <span class="docs-viz-critique-persona-name">评估者</span>
              <span class="docs-viz-critique-persona-note">周二晚上，把我们和另外两个替代品放在一起比较。</span>
            </div>
            <span class="docs-viz-critique-persona-score">2 / 4</span>
          </div>
          <div class="docs-viz-critique-persona">
            <div>
              <span class="docs-viz-critique-persona-name">回访用户</span>
              <span class="docs-viz-critique-persona-note">熟悉产品，正拿着手机，而且很赶时间。</span>
            </div>
            <span class="docs-viz-critique-persona-score">3 / 4</span>
          </div>
          <div class="docs-viz-critique-persona">
            <div>
              <span class="docs-viz-critique-persona-name">怀疑者</span>
              <span class="docs-viz-critique-persona-note">看过太多 SaaS 落地页，已经感到厌倦。</span>
            </div>
            <span class="docs-viz-critique-persona-score">1 / 4</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <p class="docs-viz-caption">两轮评估（LLM 设计评审 + 确定性检测器）会合并成一个按优先级排序的列表：哪些地方已经不错、哪些地方要修，以及在发版前值得认真回答的那些尖锐问题。</p>
</div>

## 何时使用

当你想让某个已经做出来的东西得到一次诚实的第二意见时，就用 `/impeccable critique`。它问的不是“能不能用”，而是“它到底好不好”。这个 skill 会按 Nielsen 的 10 条启发式原则给界面打分，运行认知负荷检查，通过 persona 视角做测试，并把结果和 25 条具体 anti-pattern 的自动检测结果交叉验证。

当一个页面在功能上已经完成，而你想知道它呈现出来的感觉究竟是“有意图的设计”，还是“AI slop”时，就该跑它。

## 它是怎么工作的

`/impeccable critique` 会并行运行两套互相独立的评估，以避免彼此污染判断。

第一套是 **LLM design review**：模型会读取你的 source code；如果浏览器自动化可用，它还会亲眼检查 live page；然后沿着 impeccable skill 的完整行为准则目录逐项评估。它会为 Nielsen 启发式打分、统计认知负荷失败项、追踪整个流程中的情绪旅程，并标记 AI slop。

第二套是 **automated detector**（`npx impeccable detect`）：它会用确定性的方式找出 gradient text、紫色配色、side-tab 边框、nested cards、行长问题，以及那些最明显的“通用 AI 产出指纹”。

最后两份报告会合并成一个优先级列表：哪些地方已经成立，哪三到五件事最值得修，以及在真正发版前最值得认真回答的那些问题。

## 试试看

把它指向一个页面：

```text
/impeccable critique the homepage hero
```

你会得到一份带分数的报告，典型结构如下：

- **AI slop 判定**：pass / fail，并点明具体痕迹
- **启发式评分**：10 个 0 到 4 的分数
- **认知负荷**：8 项检查里失败了几项
- **优先级问题**：三到五条问题，每条都包含 what、why 和 fix
- **待回答问题**：那些界面本身替你决定不了，但你必须回答的问题

拿到结果后，通常可以再配合 `/impeccable polish` 或 `/impeccable distill` 来实际落修复。

## 常见误区

- **在未完成的工作上运行它。** Critique 是给完整页面用的。一个空状态里还塞着三个 TODO，它得分低，是因为它没做完，不是因为它“设计差”。
- **忽略最后那几条问题。** 它们通常恰好是杠杆最大的改进点。
- **把启发式评分当成绩单。** 它们是诊断工具，不是考试分数。在你的具体上下文里，如果某条启发式没那么关键，3/4 完全可以接受。