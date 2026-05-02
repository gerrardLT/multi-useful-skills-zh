# v0.5 发布公告（2026 年 2 月 27 日）- Streamlit（beta）

## 帖子元数据

- **Post Title:** Product Manager Skills v0.5 - Streamlit (beta) Playground
- **Post Subtitle:** 现在可以在本地试跑 skills，并获得更安全的 key 处理、provider/model 选择和更清晰的 workflow 执行体验。
- **Opening (first 160 chars):** v0.5 现已加入 Streamlit（beta）：支持 Anthropic/OpenAI/Ollama，本地运行 skills，并具备显式 workflow phases 与以反馈为先的迭代模式。
- **Primary Link:** [Product Manager Skills repo](https://github.com/deanpeters/Product-Manager-Skills)

---

## 短版宣传帖

v0.5 现已加入 **Streamlit（beta）**。

现在你可以先在本地试跑 PM skills，再决定把它们接入你偏好的 agent 工作流。

本次交付：
- 本地 playground：`app/main.py`
- Provider / model 选择（Anthropic、OpenAI、Ollama）
- 只允许通过环境变量处理 key
- Workflow UX 修复，让 phase-based skills（例如 PRD）能更清晰地按阶段运行

这是一个仍在开发中的功能。欢迎反馈：
- [GitHub Issues](https://github.com/deanpeters/Product-Manager-Skills/issues)
- [Dean on LinkedIn](https://linkedin.com/in/deanpeters)

发布地址：[Product Manager Skills v0.5](https://github.com/deanpeters/Product-Manager-Skills)

---

## 长文草稿

### 标题
Product Manager Skills v0.5: Launching the Streamlit (beta) Playground

### 副标题
为什么我们做了一个本地 skill 测试界面，以及哪些改动让 workflow 运行不再那么让人困惑

### 正文

v0.5 为这个 repo 增加了一个新的 **Streamlit（beta）** playground。

目标很简单：降低“我找到一个 skill”到“我知道它在我自己的上下文里会怎么表现”之间的摩擦。

你不必一上来就直接跳进生产级 agent 流程。现在你可以在一个引导式本地界面中运行 skills，并快速验证它的质量、结构和适配度。

这个 beta 的改动包括：

1. **用于发现和执行 skill 的本地 UI**
   - 按主题浏览
   - 运行 component、interactive 和 workflow skills
   - 在迭代时保持上下文和输出可见

2. **多 provider 与 model 选择**
   - 支持 Anthropic、OpenAI 和 Ollama
   - 提供快速 / 强力模型选项，便于有意识地平衡成本和深度

3. **更安全的 API 默认值**
   - 只允许通过环境变量处理 key
   - 在应用内提供 setup instructions
   - 不提供在应用内直接输入 key 的界面

4. **Workflow UX 修复**
   - 改善了对 `prd-development` 这类 phase-driven skills 的 phase 检测
   - 提供清晰的控制项，可以一次运行一个 phase 或全部 phases
   - 保留每个 phase 的输出，让“完成”真正对应已生成的内容

这个功能被明确标记为 **beta**。它仍在开发中，我们预期会根据真实使用情况快速迭代。

如果你觉得某些地方不清楚，或者有 bug，我们希望尽早得到反馈：
- [GitHub Issues](https://github.com/deanpeters/Product-Manager-Skills/issues)
- [LinkedIn](https://linkedin.com/in/deanpeters)