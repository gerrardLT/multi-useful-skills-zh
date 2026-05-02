# PM Skills Playground - Streamlit 界面（beta）

一个本地 Web 应用，用于**学习 PM Skills 的安装与集成**、**为具体情境找到合适的 skill**，以及基于可用的 LLM API **试用 PM skills**。

**状态：** Streamlit（beta）。这是一个正在推进中的新功能，我们还在持续测试和打磨。欢迎通过 [GitHub Issues](https://github.com/deanpeters/Product-Manager-Skills/issues) 或 [LinkedIn](https://linkedin.com/in/deanpeters) 提供反馈。

**教学目标：** 将用户从“我听说过这个 skill”更平滑地带到“我已经看过它在我自己的场景里如何工作”。当前应用支持三条路径：
- **Learn**：查看安装与集成指导
- **Find My Skill**：根据情境推荐 skill
- **Run Skills**：查看示例并进行实时测试

---

## 本地运行

```bash
# From the repo root
pip install -r app/requirements.txt
streamlit run app/main.py
```

**API keys：** 仅支持通过环境变量加载。你可以在启动前将一个或多个 provider key 写入 `app/.env`（复制 `app/.env.example`），或者直接在 shell 中导出。

**Providers + models：** 侧边栏会根据环境变量自动检测可用的 provider；如果一个都没发现，就会显示 API 配置提醒与说明；同时支持每个 session 单独选择 provider + model。

```bash
cp app/.env.example app/.env
# Edit app/.env and add one or more keys (plus optional defaults)

# Example:
# ANTHROPIC_API_KEY=sk-ant-...
# ANTHROPIC_MODEL=claude-sonnet-4-6
# ANTHROPIC_MODELS=claude-haiku-4-5-20251001,claude-sonnet-4-6
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini
# OPENAI_MODELS=gpt-4o-mini,gpt-4o
# OLLAMA_ENABLED=1
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=qwen2.5:latest
# OLLAMA_MODELS=qwen2.5:latest,llama3.2:latest
```

**内置的 fast/capable 默认值：**
- `anthropic`: `claude-haiku-4-5-20251001`（fast），`claude-sonnet-4-6`（capable）
- `openai`: `gpt-4o-mini`（fast），`gpt-4o`（capable）
- `ollama`: `qwen2.5:latest`（fast），`llama3.2:latest`（capable）

---

## 架构

### 文件结构

```
app/
  main.py                   # 单文件 Streamlit 应用
  requirements.txt          # streamlit, anthropic, openai, pyyaml, python-dotenv
  .env.example              # 多 provider 的 API key + model 模板
  .env                      # 你的本地环境变量（gitignored）
  STREAMLIT_INTERFACE.md    # 本文件
```

### Skills 是如何加载的

`load_skills()` 会遍历 `skills/*/SKILL.md`，解析 YAML frontmatter，并将 `##` 段落提取到一个 dict 中。所有 skill 内容都会通过 `@st.cache_data` 缓存，因此 skill 文件变更后，需要清缓存或重启应用。

每个 skill 解析出的字段：

| Field | Source | Required |
|-------|--------|----------|
| `name` | frontmatter | yes |
| `description` | frontmatter | yes |
| `intent` | frontmatter | yes |
| `type` | frontmatter | yes |
| `theme` | frontmatter | optional |
| `best_for` | frontmatter | optional |
| `scenarios` | frontmatter | optional |
| `estimated_time` | frontmatter | optional |
| `sections` | parsed from `##` headings | derived |
| `purpose_short` | first paragraph of Purpose section | derived |
| `has_examples` | presence of `examples/` subdir | derived |

### 导航模型

```
Home (mode chooser)
  ├── Learn Hub (docs-driven onboarding and platform guides)
  │   └── Guide Detail (renders markdown guide files from docs/)
  ├── Find My Skill
  │   └── Ranked skill suggestions (situation -> metadata-based matches)
  └── Run Skills (learning simulator)
       ├── Skill + Context Input
       │   └── Worked Example Output
       │        ├── Filled Template / Form
       │        └── Steps and Transformations
       └── Advanced Browser (optional)
            └── Theme (skill cards)
                 └── Skill Detail (preview + scenario input)
                      └── Session (run the skill)
```

导航基于状态驱动（`st.session_state.view`）。`nav()` 辅助函数负责页面切换，并在上下文切换时重置 session 产物。

### Find My Skill

**它做什么：**
- 接收用户对当前情境的自然语言描述
- 基于触发型 metadata 给匹配的 skills 排序
- 展示 skill 为何匹配，并附带 `best_for` 与 `scenarios`
- 让用户直接跳到推荐 skill 的预览或运行页

**使用的排序信号：**
- `name`
- `description`
- `best_for`
- `scenarios`
- `intent`
- `purpose_short`

这个模式有意对齐 repo 更强的 trigger metadata 标准，以及 CLI 中 `find-a-skill.sh --mode trigger` 的行为。

### Session 类型

**Learning simulator**（默认 Run Skills 流程）：
- 用户选择 skill + context（预设或自定义），然后点击 **Run the Skill Steps**
- 一次 API 调用会在内部将选中的 skill 从头跑到尾（不再追问）
- 输出会按以下结构渲染：
  - **Filled Template / Form**（示例产物）
  - **Steps and Transformations**（每一步发生了什么变化）
  - **Assumptions Made**（模型主动补齐了哪些空缺）

**Advanced sessions**（可选手动模式）：
- 位于 Run Skills 中的 “Need the older advanced browser?” 展开区
- 保留之前的 component、interactive 和 workflow session 测试行为

**Advanced mode 下的 interactive skills**（多轮聊天）：
- 在 session 开始前显示预告信息框（设定预期，并说明退出路径）
- session 一开始会自动发送第一条用户消息；Claude 从该 skill 的 Step 0 开始
- 进度指示器会从 assistant 消息中解析 `Q1/3` / `Context Q2/3` / `Step N of M` 模式
- 使用 `st.chat_input` 接收自由输入；输入 `done`、`bail`、`exit` 或 `quit` 会优雅结束 session
- 侧边栏始终显示：**Start over** / **Different skill** / **Home**

**Advanced mode 下的 workflow skills**（分阶段）：
- 自动从 Application 段落中的 `### Phase N` 模式识别阶段标题
- 通过阶段单选器可跳到任意 phase
- 每个 phase 的流程都是：输入 context -> Run -> 查看输出 -> Re-run 或 Continue to next phase

**Multi-Turn interactions**
**定义：** 通过连续提问来收集上下文，并给出智能化下一步建议的多轮对话流程。
**特点：**
- 一次问一个问题（或少量成组问题）
- 根据回答决定后续提问
- 提供**编号式、上下文感知的下一步建议**
- 用户既可以按编号选择（例如 `"1"`、`"2 & 4"`），也可以自行输入
- 会根据用户选择自适应调整

### System Prompt

learning simulator 会使用完整的 `SKILL.md` 正文，再加上一组指令，让 workflow 在内部跑完而不追问：

```python
def build_learning_simulator_system_prompt(skill):
    # Full skill body + simulation instructions:
    # - run end-to-end internally
    # - no follow-up questions
    # - include assumptions explicitly
```

Advanced sessions 则保留原有行为，包括 interactive facilitation 附加规则：

```python
def build_system_prompt(skill):
    # Full skill body + (for interactive) facilitation rules:
    # - One question at a time
    # - Show Q1/3-style progress labels
    # - Stay true to the skill's structure
```

---

## 给 Skill 添加 Theme Metadata

只有 frontmatter 中带 `theme` 字段的 skill，才会出现在按主题分类的浏览器里。其他 skill 会出现在 Home 页的 “All other skills” 展开区中。

**给 `SKILL.md` frontmatter 添加这些可选字段：**

```yaml
---
name: your-skill-name
description: "..."
type: component|interactive|workflow
theme: career-leadership          # one of the 7 theme slugs below
best_for:
  - "Plain-language use case (shown as bullet in skill card)"
  - "Another use case"
  - "Third use case"
scenarios:
  - "Pre-built scenario the user can one-click load"
  - "Another scenario"
estimated_time: "10-15 min"
---
```

**这 7 个 theme slug：**

| Slug | Display Name |
|------|-------------|
| `career-leadership` | Career & Leadership |
| `discovery-research` | Discovery & Research |
| `strategy-positioning` | Strategy & Positioning |
| `pm-artifacts` | Writing PM Artifacts |
| `finance-metrics` | Finance & Metrics |
| `ai-agents` | AI & Agents |
| `workshops-facilitation` | Workshops & Facilitation |

**校验：** 只要必填字段存在，增加这些字段不会破坏 `scripts/check-skill-metadata.py`。验证器目前只检查必填字段（`name`、`description`、`intent`、`type`），其余未知键会被忽略。

**当前已打标签：** 16 个 skill，覆盖全部 7 个主题（每个主题至少 2 个，Career & Leadership 有 4 个）。剩余 30 个 skill 可以在后续轮次里用同样的 frontmatter 模式补标签。

---

## UX 设计决策

**先分模式，提高清晰度。** 应用现在将 **Learn**（如何安装/使用/集成）、**Find My Skill**（从情境出发找合适 skill）和 **Run Skills**（调用模型执行 skill）拆开。这能降低首次使用时的困惑，也让文档继续作为 source of truth。

**在 Run Skills 里先给 context。** 用户现在能用最短路径拿到学习输出：选一个 skill，补上 context，跑一次，然后同时查看产物和转换过程。

**保留 advanced mode。** 当用户需要多轮交互或分阶段控制时，旧版的主题浏览和手动 session 流程仍然可用。

**学习输出结构固定。** simulator 会要求稳定的输出区块，因此用户始终会看到：
1. Filled Template/Form
2. Steps and Transformations
3. Assumptions Made

**Learn + Practice 合并为一条流。** Learn hub 中包含可直接点开的 “Run this skill” 动作，因此 onboarding 和执行被连接成一条路径，而不是两个割裂产品。

**先从情境出发。** 用户很少先记住 skill 名。finder 使用 trigger-oriented metadata，让人可以直接用自然语言描述问题，也仍然能找到对的 skill。

**进度来自 skill 本身。** 基于 facilitation protocol 的 interactive skill 已经会输出 `Q1/3` 这类进度标签。应用直接解析这些标签，而不是自己维护独立计数器，因此 skill 更新后，进度跟踪仍然天然正确。

**Scenario chips 作为脚手架。** 预设场景能降低新用户面对空白输入框时的压力。它们保存在 skill 的 frontmatter 中，而不是硬编码在 app 里，所以只要给 skill 增加 scenario，这些内容就会自动出现在 playground 里。

---

## 部署（Streamlit Community Cloud）

这个应用可以部署，但它只支持通过环境变量加载 key，并且支持多个 provider。

**Option A：共享 key + 使用限制**
- 设置一个或多个 provider secret（`ANTHROPIC_API_KEY`、`OPENAI_API_KEY`），或启用本地 Ollama（`OLLAMA_ENABLED=1` 和 `OLLAMA_BASE_URL`）。
- 也可以设置默认与可选 model（`ANTHROPIC_MODEL`、`OPENAI_MODEL`、`OLLAMA_MODEL` 以及 `*_MODELS` 列表）。
- 需要补上限流能力（例如每个 session 的 max tokens），防止成本失控。
- 目前尚未实现。

**Option B：私有部署**
- 将应用保留在内部，并控制对托管环境的访问。
- 如果你不希望对外暴露一个基于共享 API key 的 endpoint，这个方案更合适。

**部署步骤：**
1. Fork 或推送这个 repo 到 GitHub
2. 连接到 [streamlit.io/cloud](https://streamlit.io/cloud)
3. 将主文件设为 `app/main.py`
4. 将 Python 版本设为 3.11+

---

## 已知限制

- **Cache refresh：** skill 变更后需要重启应用，或清理 Streamlit cache（`st.cache_data.clear()`）。在频繁开发 skill 时，可以用 `streamlit run app/main.py --server.fileWatcherType poll` 来自动重载。
- **30 个未加 theme 的 skills：** 没有 `theme` tag 的 skill 会显示在 Home 页的展开区中。可参考 [Adding Theme Metadata](#给-skill-添加-theme-metadata) 把它们提升到主题卡片里。
- **No streaming：** API 响应会在完成后一次性渲染。对于长输出，streaming 能改善体感延迟，这属于后续增强项。
- **Workflow phase detection：** phase 是根据 Application 段落中的 `### Phase N` 标题自动识别的。不遵循这种命名方式的 workflow skill，会被当成一个单独的 “Full workflow” phase 显示。

---

## 后续增强

- **Streaming responses**，降低体感延迟
- **Shared hosted key** 方案，用 session 级限流支持公开 demo
- **Related skills panel**，将 skill 的 References 段落中的交叉引用展示出来
- **Export worked example**，将 simulator 输出下载成 markdown
- **Theme metadata for remaining 30 skills**，做后续补标
- **Finder polish**，补更丰富的排序解释、最近搜索和推荐路径保存