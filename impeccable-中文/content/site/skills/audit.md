---
tagline: "五个维度的技术质量体检，每条问题都带 P0 到 P3 严重级别。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-report">
    <div class="docs-viz-report-head">
      <div>
        <div class="docs-viz-report-title">/impeccable audit the checkout flow</div>
        <div class="docs-viz-report-target">src/checkout/**</div>
      </div>
      <div class="docs-viz-report-score">
        <span class="docs-viz-report-score-num">2.6</span>
        <span class="docs-viz-report-score-out">/ 4</span>
      </div>
    </div>
    <div class="docs-viz-report-dims">
      <div class="docs-viz-report-dim">
        <span class="docs-viz-report-dim-name">Accessibility</span>
        <span class="docs-viz-report-dim-bar"><span class="docs-viz-report-dim-fill docs-viz-report-dim-fill--fail" style="width:50%"></span></span>
        <span class="docs-viz-report-dim-score">2 / 4</span>
      </div>
      <div class="docs-viz-report-dim">
        <span class="docs-viz-report-dim-name">Performance</span>
        <span class="docs-viz-report-dim-bar"><span class="docs-viz-report-dim-fill" style="width:75%"></span></span>
        <span class="docs-viz-report-dim-score">3 / 4</span>
      </div>
      <div class="docs-viz-report-dim">
        <span class="docs-viz-report-dim-name">Theming</span>
        <span class="docs-viz-report-dim-bar"><span class="docs-viz-report-dim-fill docs-viz-report-dim-fill--warn" style="width:62%"></span></span>
        <span class="docs-viz-report-dim-score">2.5 / 4</span>
      </div>
      <div class="docs-viz-report-dim">
        <span class="docs-viz-report-dim-name">Responsive</span>
        <span class="docs-viz-report-dim-bar"><span class="docs-viz-report-dim-fill" style="width:75%"></span></span>
        <span class="docs-viz-report-dim-score">3 / 4</span>
      </div>
      <div class="docs-viz-report-dim">
        <span class="docs-viz-report-dim-name">Anti-patterns</span>
        <span class="docs-viz-report-dim-bar"><span class="docs-viz-report-dim-fill docs-viz-report-dim-fill--warn" style="width:70%"></span></span>
        <span class="docs-viz-report-dim-score">2.8 / 4</span>
      </div>
    </div>
    <div class="docs-viz-report-issues">
      <span class="docs-viz-report-sev docs-viz-report-sev--p0">P0<span class="docs-viz-report-sev-n">2</span></span>
      <span class="docs-viz-report-sev docs-viz-report-sev--p1">P1<span class="docs-viz-report-sev-n">5</span></span>
      <span class="docs-viz-report-sev docs-viz-report-sev--p2">P2<span class="docs-viz-report-sev-n">8</span></span>
      <span class="docs-viz-report-sev docs-viz-report-sev--p3">P3<span class="docs-viz-report-sev-n">14</span></span>
    </div>
  </div>
  <p class="docs-viz-caption">五个维度分别按 0 到 4 分评分，每条问题再标记 P0（阻断发布）到 P3（打磨项）。Audit 只负责记录，不负责修复。把结果分流给 <code>/impeccable harden</code>、<code>/impeccable polish</code> 或 <code>/impeccable optimize</code>。</p>
</div>

## 何时使用

`/impeccable audit` 是 `/impeccable critique` 在技术层面的对应工具。`/impeccable critique` 关注的是“感觉对不对”，而 `/impeccable audit` 关注的是“它是否足够健壮”。它会针对实现层运行可访问性、性能、主题一致性、响应式设计和反模式检查，为每个维度打 0 到 4 分，并生成一份带有 P0 到 P3 严重级别的行动计划。

适合在发布前、质量冲刺期间，或者当技术负责人开始说“我们真的应该关注一下可访问性”的时候使用。

## 它是如何工作的

此技能会从五个维度扫描你的代码：

1. **Accessibility**：WCAG 对比度、ARIA、键盘导航、语义化 HTML、表单标签。
2. **Performance**：布局抖动、昂贵动画、缺失 lazy loading、bundle 体积。
3. **Theming**：硬编码颜色、dark mode 覆盖情况、token 一致性。
4. **Responsive**：breakpoint 行为、触控目标、移动端视口处理。
5. **Anti-patterns**：与 detector 相同的那 25 条确定性检查。

每个维度都会得到一个 0 到 4 的分数；每条问题都会得到一个严重级别：P0 阻断发布，P1 应在本次迭代修掉，P2 留到下一周期，P3 只是打磨项。最终返回的是一份可以直接贴进工单系统的单一文档。

Audit 不会替你修复任何问题，它只负责记录。之后应根据问题类别，将结果分流给 `/impeccable polish`、`/impeccable harden` 或 `/impeccable optimize`。

## 试试看

```text
/impeccable audit the checkout flow
```

预期输出：

```text
Accessibility: 2/4（部分通过）
  P0: 4 个输入框缺少表单标签
  P1: disabled 按钮状态对比度仅 3.1:1
  P2: 自定义下拉框没有可见 focus 指示器

Performance: 3/4（良好）
  P1: Hero 图片未启用 lazy-loading（340KB）
  ...
```

将 P0 交给 `/impeccable harden`，将 theming 和 typography 相关的 P1 交给 `/impeccable typeset` 和 `/impeccable polish`，其余剩下的再继续交给 `/impeccable polish`。

## 常见误区

- **将它与 `/impeccable critique` 混为一谈。** Audit 关注的是实现质量；Critique 关注的是设计质量。想要完整图景，两者都该运行。
- **先修 P3，不管 P0。** 严重级别不是装饰，修复顺序应从最上面往下走。
- **跳过你自认为“应该没问题”的维度。** Theming 和 responsive 往往是最容易被默认“已经好了”，但最常被现实打脸的两项。