# v0.65 发布公告（2026 年 3 月 8 日）- 你提需求，我们就补上

## 帖子元数据

- **Post Title:** Product Manager Skills v0.65 - Setup and Integration Guides for Every PM Workflow
- **Post Subtitle:** 我们将 onboarding 反馈转化为了覆盖聊天应用、CLI 和自动化工具的完整安装与集成指南。
- **Opening (first 160 chars):** 你提需求，我们就补上：v0.65 增加了以产品经理为中心的安装指南，助你以更低摩擦在工具链中安装、集成并运行 PM Skills。
- **Primary Link:** [Product Manager Skills repo](https://github.com/deanpeters/Product-Manager-Skills)

---

## 短版宣传帖

你提需求，我们就补上。

我们暂停了新功能的扩张，转而将 onboarding 和 setup 流程优化得更贴合真实 PM 团队的使用场景。

v0.65 增加了完整的指导，帮助你在大家日常真正使用的工具中安装、集成并运行 PM Skills。

本次交付内容：
- `docs/Using PM Skills 101.md`（面向新手的入门页）
- `docs/Platform Guides for PMs.md`（按工具选择的索引页）
- `docs/Using PM Skills with Slash Commands 101.md`（Claude `/slash` 工作流）
- 面向 PM 的平台指南：Claude Code/Desktop/Cowork、ChatGPT Desktop、OpenClaw、n8n、LangFlow、Python agents
- 更新 `START_HERE.md`，根据用户舒适度提供不同入口

最推荐的使用方式：
1. 先阅读 `Using PM Skills 101`
2. 选择一份平台指南
3. 使用一个 skill 完成一个真实任务

发布地址：[Product Manager Skills v0.65](https://github.com/deanpeters/Product-Manager-Skills)

---

## 长文草稿

### 标题
Product Manager Skills v0.65: You Asked, We Listened

### 副标题
面向 PM 的完整安装与集成指南，覆盖聊天、CLI、自动化与 agent frameworks

### 正文

v0.65 是一个由用户反馈直接驱动的文档与 onboarding 版本。

用户的核心诉求非常明确：
- 让 setup 流程更清晰、更少歧义
- 明确不同平台的路径
- 让不懂编程的 PM 也能更容易上手

因此，本次更新我们将重点放在了务实的、按工具拆分的操作说明上，目标是让大家更快地获得第一次真实价值。

改动内容：

1. **面向新手的 onboarding**
   - 新增 `docs/Using PM Skills 101.md` 作为标准的“从这里开始”指南
   - 扩展了面向真实 PM 工具链的 setup 模式

2. **平台选择层**
   - 新增 `docs/Platform Guides for PMs.md`，将其设计为简单的选择页
   - 根据用户舒适度和工作流类型进行清晰分流

3. **Claude slash command 运营化**
   - 新增 `docs/Using PM Skills with Slash Commands 101.md`
   - 包含可直接复制的命令模式，例如 `/pm-story`、`/pm-prd`、`/pm-probe`、`/pm-prioritize`

4. **更适合 PM 的平台指南**
   - 新增实用指南，覆盖：
     - Claude Code
     - Claude Desktop
     - Claude Cowork
     - ChatGPT Desktop
     - OpenClaw
     - n8n
     - LangFlow
     - Python agents

5. **更新 onboarding 路径**
   - 更新 `START_HERE.md`，让用户可以根据 chat-first、terminal-first、automation-first 或 experimental stack 来选择入口

结果是：
- setup 摩擦更低
- 更快达到第一次有效输出
- 非技术型 PM 与技术实现伙伴之间的衔接更顺畅

如果说 v0.6 解决的是导航和命令包装层的问题，那么 v0.65 解决的就是：让整个库在现实世界中更容易被采用。