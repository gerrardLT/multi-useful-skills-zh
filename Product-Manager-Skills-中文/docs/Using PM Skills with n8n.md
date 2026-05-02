# 在 n8n 中使用 PM Skills

n8n 最适合将 PM 工作流构建为可重复执行的自动化流程，而非每次手动复制粘贴。

如果你是首次接触，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

## 最佳适用场景

- 每周重复执行的 PM 工作流
- Intake 流水线（requests -> prioritization -> summary）
- 在团队间标准化产出物质量

## 10 分钟快速配置

1. 确保 n8n 运行环境可以访问此仓库。
2. 创建一个简单工作流：
   - Trigger（`Manual Trigger` 或 `Schedule Trigger`）
   - `Execute Command` 节点
   - `Slack` / `Email` / `Notion` 输出节点（可选）
3. 在 `Execute Command` 中运行：

```bash
./scripts/run-pm.sh skill prioritization-advisor "We have 12 requests and one sprint"
```

4. 先确认输出无误，再将 trigger 切换为定时执行。

## 典型 PM 自动化场景

- 每周 roadmap triage summary
- 每月 business-health diagnostic
- 新 feature request intake scoring
- 生成 discovery interview prep checklist

## 如何保持输出质量

- 一个 workflow 只服务于一个业务任务。
- 记录输入和输出，便于审计。
- 在发送给利益相关方前增加人工审批环节。

## 常见问题

- 一个过于庞大的 workflow 试图包办所有任务。
- 没有明确的 workflow 成功指标。
- 未经审查直接发布 AI 生成结果。

## 官方资料

- n8n docs home: [https://docs.n8n.io/](https://docs.n8n.io/)
- n8n quickstart: [https://docs.n8n.io/try-it-out/quickstart/](https://docs.n8n.io/try-it-out/quickstart/)
- Build an AI workflow in n8n: [https://docs.n8n.io/advanced-ai/intro-tutorial/](https://docs.n8n.io/advanced-ai/intro-tutorial/)
- n8n source control and environments: [https://docs.n8n.io/source-control-environments/](https://docs.n8n.io/source-control-environments/)

## PM Skills 相关链接

- Tooling charter 背景：[`PM Tooling Operations Charter.md`](PM%20Tooling%20Operations%20Charter.md)
- 一页式入门：[`../START_HERE.md`](../START_HERE.md)