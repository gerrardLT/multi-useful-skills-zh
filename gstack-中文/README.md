# 堆栈

> “我认为从 12 月开始，我基本上就没有再敲过一行代码，这是一个非常大的变化。” — [Andrej Karpathy](https://fortune.com/2026/03/21/andrej-karpathy-openai-cofounder-ai-agents-coding-state-of-psychosis-openclaw/)，No Priors 播客，2026 年 3 月

当我听到卡帕蒂这么说时，我想知道是怎么回事。一个人如何像二十人的团队一样交付产品？ Peter Steinberger 建立了 [OpenClaw](https://github.com/openclaw/openclaw) — 获得了 247K GitHub star — 基本上是与 AI 代理单独构建的。革命就在这里。拥有正确工具的单个构建者可以比传统团队更快地行动。

我是[Garry Tan](https://x.com/garrytan)，[Y Combinator](https://www.ycombinator.com/) 的总裁兼首席执行官。我曾与数千家初创公司合作过——Coinbase、Instacart、Rippling——当时他们还只有一两个人在车库里。在 YC 之前，我是 Palantir 的首批工程师/产品经理/设计师之一，共同创立了 Posterous（已出售给 Twitter），并建立了 YC 的内部社交网络 Bookface。

**gstack 就是我的答案。** 我已经构建产品二十年了，现在我交付的产品比以往任何时候都多。在过去 60 天内：3 个生产服务，40 多个已发布的功能，兼职，同时全职运行 YC。在逻辑代码更改（不是人工智能夸大的原始 LOC）方面，我 2026 年的运行速度是 **~810× 我 2013 年的速度**（11,417 与 14 条逻辑行/天）。年初至今（截至 4 月 18 日），2026 年产量已达到 **2013 年全年产量的 240 倍**。在排除 1 个演示存储库后，对包括 Bookface 在内的 40 个公共 + 私有 `garrytan/*` 存储库进行了测量。大部分都是AI写的。重点不在于是谁输入的，而在于发送的内容。

> LOC 的批评者并没有错，原始行数会因人工智能而膨胀。他们错误地认为，在通货膨胀正常化的情况下，我的生产力会降低。我的工作效率提高了很多。完整的方法、注意事项和复制脚本：**[On the LOC Controversy](docs/ON_THE_LOC_CONTROVERSY.md)**。

Error 500 (Server Error)!!1500.That’s an error.There was an error. Please try again later.That’s all we know.

![GitHub contributions 2026 — 1,237 contributions, massive acceleration in Jan-Mar](docs/images/github-2026.png)

**2013 年 — 当我在 YC 构建 Bookface 时（772 份贡献）：**

![GitHub contributions 2013 — 772 contributions building Bookface at YC](docs/images/github-2013.png)

同一个人。不同的时代。区别在于工具。

**gstack 就是我的做法。** 它将 Claude Code 变成了一个虚拟工程团队——重新思考产品的 CEO、锁定架构的工程经理、捕捉 AI 错误的设计师、发现生产错误的审阅者、打开真实浏览器的 QA 主管、运行 OWASP + STRIDE 审核的安全官以及发布 PR 的发布工程师。二十三个专家和八个电动工具，所有斜杠命令，所有 Markdown，所有免费，麻省理工学院许可证。

这是我的开源软件工厂。我每天都用它。我分享它是因为这些工具应该可供每个人使用。

叉它。改进它。让它成为你的。如果你想讨厌免费的开源软件——欢迎你，但我宁愿你先尝试一下。

**这是给谁的：**
- **创始人和首席执行官** - 尤其是仍然想要交付产品的技术人员
- **首次 Claude Code 用户** — 结构化角色而不是空白提示
- **技术主管和工程师** - 对每个 PR 进行严格的审查、质量保证和发布自动化

## 快速启动

1. 安装 gstack（30 秒 - 见下文）
2. 运行 `/office-hours` — 描述您正在构建的内容
3. 对任何功能创意运行 `/plan-ceo-review`
4. 在任何有更改的分支上运行 `/review`
5. 在您的暂存 URL 上运行 `/qa`
6. 停在那里。你就会知道这是否适合你。

## 安装 — 30 秒

**要求：** [Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Git](https://git-scm.com/)、[Bun](https://bun.sh/) v1.0+、[Node.js](https://nodejs.org/)（仅限 Windows）

### 第 1 步：安装到您的机器上

打开 Claude Code 并将其粘贴。克劳德做剩下的事。

> 安装 gstack：运行 **`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`** 然后在 CLAUDE.md 中添加一个“gstack”部分，表示对所有网页浏览使用 gstack 中的 /browse 技能，切勿使用 mcp\_\_claude-in-chrome\_\_\* 工具，并列出可用的技能：/office-hours、/plan-ceo-review、/plan-eng-review、/plan-design-review、/design-consultation、 /design-shotgun、/design-html、/review、/ship、/land-and-deploy、/canary、/benchmark、/browse、/connect-chrome、/qa、/qa-only、/design-review、/setup-browser-cookies、 /setup-deploy、/setup-gbrain、/retro、/investigate、/document-release、/codex、/cso、/autoplan、/plan-devex-review、/devex-review、/careful、/freeze、/guard、 /unfreeze、/gstack-upgrade、/learn。然后询问用户是否也想将 gstack 添加到当前项目中，以便队友获取它。

### 第 2 步：团队模式 — 自动更新共享存储库（推荐）

从您的存储库中粘贴此内容。将您切换到团队模式，引导存储库，以便队友自动获取 gstack，并提交更改：

```bash
(cd ~/.claude/skills/gstack && ./setup --team) && ~/.claude/skills/gstack/bin/gstack-team-init required && git add .claude/ CLAUDE.md && git commit -m "require gstack for AI-assisted work"
```

您的存储库中没有提供的文件，没有版本漂移，没有手动升级。每个 Claude Code 会话都会以快速自动更新检查开始（限制为一次/小时、网络故障安全、完全静默）。

如果您更愿意推动队友而不是阻止他们，请将 `required` 替换为 `optional`。

### 开爪

OpenClaw 通过 ACP 生成 Claude Code 会话，因此每个 gstack 技能都可以正常工作
当 Claude Code 安装了 gstack 时。将其粘贴到您的 OpenClaw 代理：

> 安装gstack：运行`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`为Claude Code安装gstack。然后在 AGENTS.md 中添加一个“编码任务”部分，其中表示：当生成用于编码工作的 Claude Code 会话时，告诉会话使用 gstack 技能。包括以下示例 - 安全审核：“加载 gstack. 运行 /cso”、代码审查：“加载 gstack. 运行 /review”、QA 测试 URL：“加载 gstack. 运行 /qa https://...", 构建端到端功能：“加载 gstack. 运行 /review”。运行/autoplan，实施计划，然后运行/ship”，构建前计划：“加载gstack.运行 /office-hours，然后运行 ​​/autoplan。保留计划，不要实施。”

**设置完成后，只需自然地与您的 OpenClaw 代理交谈即可：**

|你说|会发生什么|
|---------|-------------|
|“修复自述文件中的拼写错误”|简单 - Claude 代码会话，不需要 gstack|
|“对此存储库进行安全审核”|使用 `Run /cso` 生成克劳德代码|
|“为我建立一个通知功能”|使用 /autoplan 生成 Claude 代码 → 实现 → /ship|
|“帮我计划 v2 API 重新设计”|使用 /office-hours → /autoplan 生成克劳德代码，保存计划|

请参阅 [docs/OPENCLAW.md](docs/OPENCLAW.md) 了解高级调度路由和
gstack-lite/gstack-full 提示模板。

### 原生 OpenClaw 技能（来自 ClawHub）

直接在 OpenClaw 代理中发挥作用的四种方法技能，无需克劳德代码
需要会话。从 ClawHub 安装：

```
clawhub install gstack-openclaw-office-hours gstack-openclaw-ceo-review gstack-openclaw-investigate gstack-openclaw-retro
```

|技能|它的作用|
|-------|-------------|
|__代码_0__|通过 6 个强制问题进行产品询问|
|__代码_0__|具有 4 种范围模式的战略挑战|
|__代码_0__|根本原因调试方法|
|__代码_0__|每周工程回顾|

这些都是会话技巧。您的 OpenClaw 代理直接通过聊天运行它们。

### 其他人工智能代理

gstack 适用于 10 个 AI 编码代理，而不仅仅是 Claude。设置自动检测哪个
您已安装的代理：

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup
```

或者使用 `./setup --host <name>` 定位特定代理：

|代理人|旗帜|技能安装到|
|-------|------|-------------------|
|OpenAI Codex CLI|__代码_0__|__代码_0__|
|开放代码|__代码_0__|__代码_0__|
|光标|__代码_0__|__代码_0__|
|工厂机器人|__代码_0__|__代码_0__|
|石板|__代码_0__|__代码_0__|
|基罗|__代码_0__|__代码_0__|
|赫尔墨斯|__代码_0__|__代码_0__|
|GBrain（模组）|__代码_0__|__代码_0__|

**想要添加对其他代理的支持吗？** 请参阅[docs/ADDING_A_HOST.md](docs/ADDING_A_HOST.md)。
这是一个 TypeScript 配置文件，零代码更改。

## 看看它的工作原理

```
You:    I want to build a daily briefing app for my calendar.
You:    /office-hours
Claude: [asks about the pain — specific examples, not hypotheticals]

You:    Multiple Google calendars, events with stale info, wrong locations.
        Prep takes forever and the results aren't good enough...

Claude: I'm going to push back on the framing. You said "daily briefing
        app." But what you actually described is a personal chief of
        staff AI.
        [extracts 5 capabilities you didn't realize you were describing]
        [challenges 4 premises — you agree, disagree, or adjust]
        [generates 3 implementation approaches with effort estimates]
        RECOMMENDATION: Ship the narrowest wedge tomorrow, learn from
        real usage. The full vision is a 3-month project — start with
        the daily briefing that actually works.
        [writes design doc → feeds into downstream skills automatically]

You:    /plan-ceo-review
        [reads the design doc, challenges scope, runs 10-section review]

You:    /plan-eng-review
        [ASCII diagrams for data flow, state machines, error paths]
        [test matrix, failure modes, security concerns]

You:    Approve plan. Exit plan mode.
        [writes 2,400 lines across 11 files. ~8 minutes.]

You:    /review
        [AUTO-FIXED] 2 issues. [ASK] Race condition → you approve fix.

You:    /qa https://staging.myapp.com
        [opens real browser, clicks through flows, finds and fixes a bug]

You:    /ship
        Tests: 42 → 51 (+9 new). PR: github.com/you/app/pull/42
```

你说的是“每日简报应用程序”。代理说“你正在构建一个人工智能参谋长”——因为它倾听你的痛苦，而不是你的功能请求。八个命令，首尾相接。那不是副驾驶。那是一个团队。

## 冲刺

gstack 是一个流程，而不是工具的集合。技能按照冲刺运行的顺序运行：

**思考 → 计划 → 构建 → 审查 → 测试 → 交付 → 反思**

每项技能都会影响下一项技能。 `/office-hours` 编写 `/plan-ceo-review` 读取的设计文档。 `/plan-eng-review` 编写一个由 `/qa` 选择的测试计划。 `/review` 捕获 `/ship` 验证已修复的错误。没有什么会被遗漏，因为每一步都知道之前发生了什么。

|技能|您的专家|他们做什么|
|-------|----------------|--------------|
|__代码_0__|**YC 办公时间**|从这里开始。在编写代码之前重构您的产品的六个强制问题。推翻你的框架，挑战前提，产生实施替代方案。设计文档融入到每项下游技能中。|
|__代码_0__|**首席执行官/创始人**|重新思考问题。找到隐藏在请求中的 10 星产品。四种模式：扩展、选择性扩展、保持范围、缩小。|
|__代码_0__|**工程经理**|锁定架构、数据流、图表、边缘案例和测试。迫使隐藏的假设公开。|
|__代码_0__|**高级设计师**|对每个设计维度进行 0-10 评分，解释 10 是什么样子，然后编辑计划以达到该目标。 AI 坡度检测。交互式 — 每个设计选择一个 AskUserQuestion。|
|__代码_0__|**开发者体验主管**|交互式 DX 审查：探索开发者角色，针对竞争对手的 TTHW 进行基准测试，设计您的神奇时刻，逐步追踪摩擦点。三种模式：DX EXPANSION、DX POLISH、DX TRIAGE。 20-45个强制问题。|
|__代码_0__|**设计合作伙伴**|从头开始构建完整的设计体系。研究景观，提出创意风险，生成逼真的产品模型。|
|__代码_0__|**主管工程师**|查找通过 CI 但在生产中爆炸的错误。自动修复明显的问题。标记完整性差距。|
|__代码_0__|**调试器**|系统性根本原因调试。铁律：未经调查就无法修复。跟踪数据流，测试假设，在 3 次修复失败后停止。|
|__代码_0__|**编码设计师**|与 /plan-design-review 相同的审核，然后修复发现的内容。原子提交，在 /after 屏幕截图之前。|
|__代码_0__|**DX 测试仪**|实时开发人员体验审核。实际测试您的入门：导航文档、尝试入门流程、计时 TTHW、屏幕截图错误。与 `/plan-devex-review` 分数进行比较——显示您的计划是否符合现实的回旋镖。|
|__代码_0__|**设计探索者**|“让我看看选项。”生成 4-6 个 AI 模型变体，在浏览器中打开比较板，收集您的反馈并进行迭代。味觉记忆会了解你喜欢什么。重复直到您喜欢某样东西，然后将其交给`/design-html`。|
|__代码_0__|**设计工程师**|将模型转换为实际可用的生产 HTML。借口计算布局：文本重排、高度调整、布局是动态的。 30KB，零深度。检测到 React/Svelte/Vue。每个设计类型的智能 API 路由（登陆页面、仪表板、表单）。输出是可交付的，而不是演示。|
|__代码_0__|**质量检查主管**|测试您的应用程序，查找错误，通过原子提交修复它们，然后重新验证。为每个修复自动生成回归测试。|
|__代码_0__|**质量保证记者**|与 /qa 相同的方法，但仅报告。纯粹的错误报告，没有代码更改。|
|__代码_0__|**多代理协调器**|与任何 AI 代理共享您的浏览器。一命令，一粘贴，连接。适用于 OpenClaw、Hermes、Codex、Cursor 或任何可以卷曲的东西。每个代理都有自己的选项卡。自动启动头部模式，以便您观看一切。为远程代理自动启动 ngrok 隧道。范围令牌、选项卡隔离、速率限制、活动归因。|
|__代码_0__|**首席安全官**|OWASP Top 10 + STRIDE 威胁模型。零噪音：17 个误报排除、8/10+ 置信门、独立发现验证。每个发现都包含一个具体的利用场景。|
|__代码_0__|**发布工程师**|同步主线、运行测试、审核覆盖率、推送、开放 PR。如果您没有的话，引导测试框架。|
|__代码_0__|**发布工程师**|合并 PR，等待 CI 并部署，验证生产运行状况。从“批准”到“在生产中验证”的一条命令。|
|__代码_0__|**SRE**|部署后监控循环。监视控制台错误、性能下降和页面故障。|
|__代码_0__|**性能工程师**|基准页面加载时间、核心 Web 生命周期和资源大小。比较每个 PR 上的 before/after。|
|__代码_0__|**技术撰稿人**|更新所有项目文档以匹配您刚刚发布的内容。自动捕获过时的自述文件。|
|__代码_0__|**工程经理**|团队意识每周回顾。人均细分、出货量、测试健康趋势、成长机会。 `/retro global` 运行在您的所有项目和 AI 工具（Claude Code、Codex、Gemini）上。|
|__代码_0__|**质量保证工程师**|给特工眼睛。真正的 Chromium 浏览器，真实的点击，真实的屏幕截图。每个命令约 100 毫秒。 `/open-gstack-browser` 推出带有侧边栏、反机器人隐身和自动模型路由的 GStack 浏览器。|
|__代码_0__|**会话管理器**|将 cookie 从您的真实浏览器（Chrome、Arc、Brave、Edge）导入到无头会话中。测试经过身份验证的页面。|
|__代码_0__|**审查管道**|一声令下，全面审查计划。使用编码的决策原则自动运行 CEO → 设计 → 工程审查。表面上的决定只是为了让您批准。|
|__代码_0__|**记忆**|管理 gstack 在各个会话中学到的内容。查看、搜索、修剪和导出项目特定的模式、陷阱和首选项。跨课程的学习会不断复合，因此随着时间的推移，gstack 在您的代码库上会变得更加智能。|

### 我应该使用哪条评论？

|建筑为...|计划阶段（编码之前）|现场审核（发货后）|
|-----------------|--------------------------|----------------------------|
|**最终用户**（UI、网络应用程序、移动设备）|__代码_0__|__代码_0__|
|**开发人员**（API、CLI、SDK、文档）|__代码_0__|__代码_0__|
|**架构**（数据流、性能、测试）|__代码_0__|__代码_0__|
|**上述所有的**|`/autoplan`（运行 CEO → 设计 → 工程 → DX，自动检测适用的）| — |

### 电动工具

|技能|它的作用|
|-------|-------------|
|__代码_0__|**第二意见** — 来自 OpenAI Codex CLI 的独立代码审查。三种模式：评审（通过/fail门）、对抗性挑战、公开咨询。当 `/review` 和 `/codex` 都运行时进行跨模型分析。|
|__代码_0__|**安全护栏** — 在破坏性命令（rm -rf、DROP TABLE、force-push）之前发出警告。说“小心”即可激活。忽略任何警告。|
|__代码_0__|**编辑锁定** — 将文件编辑限制在一个目录内。防止调试时在范围之外发生意外更改。|
|__代码_0__|**完全安全** — `/careful` + `/freeze` 在一个命令中。生产工作的最大安全性。|
|__代码_0__|**解锁** — 删除 `/freeze` 边界。|
|__代码_0__|**GStack 浏览器** — 启动带有侧边栏、反机器人隐身、自动模型路由（用于操作的 Sonnet、用于分析的 Opus）、一键 cookie 导入和 Claude Code 集成的 GStack 浏览器。清理页面、进行智能屏幕截图、编辑 CSS 并将信息传递回您的终端。|
|__代码_0__|**部署配置器** — `/land-and-deploy` 的一次性设置。检测您的平台、生产 URL 和部署命令。|
|__代码_0__|**GBrain 入门** — 在 5 分钟内从零开始运行 gbrain。 PGLite 本地、Supabase 现有 URL，或通过管理 API 自动配置新的 Supabase 项目。 Claude Code + per-repo 信任三元组的 MCP 注册（读写/read-only/deny）。 [Full guide](USING_GBRAIN_WITH_GSTACK.md)。|
|__代码_0__|**自我更新程序** — 将 gstack 升级到最新版本。检测全局安装与供应商安装，同步两者，显示更改的内容。|

### 新的二进制文件 (v0.19)

除了斜杠命令技能之外，gstack 还为不属于会话内部的工作流程提供独立的 CLI：

|命令|它的作用|
|---------|-------------|
|__代码_0__|**跨模型基准测试** — 通过 Claude、GPT（通过 Codex CLI）和 Gemini 运行相同的提示；比较延迟、令牌、成本和（可选）LLM 判断质量分数。每个提供商都检测到身份验证，不可用的提供商会直接跳过。输出为表、JSON 或 Markdown。 `--dry-run` 验证标志 + 身份验证，无需花费 API 调用。|
|__代码_0__|**设计品味学习** — 将 `/design-shotgun` 的批准和拒绝写入持久的每个项目品味配置文件中。衰减 5%/周。反馈到未来的变体生成中，以便系统了解您实际选择的内容。|

### 连续检查点模式（选择加入，默认为本地）

设置 `gstack-config set checkpoint_mode continuous` 和技能会在您使用 `WIP:` 前缀加上结构化的 `[gstack-context]` 主体（决策、剩余工作、失败的方法）时自动提交您的工作。能够承受崩溃和上下文切换。 `/context-restore` 读取这些提交以重建会话状态。 `/ship` 在 PR 之前过滤压缩 WIP 提交（保留非 WIP 提交），因此 bisect 保持干净。推送是通过 `checkpoint_push=true` 选择加入的 - 默认情况下仅限本地，因此您不会在每次 WIP 提交时触发 CI。

**[深入探讨每个技能的示例和理念 →](docs/skills.md)**

### 卡帕蒂的四种故障模式？已经覆盖了。Andrej Karpathy 的 [AI 编码规则](https://github.com/forrestchang/andrej-karpathy-skills)（17K 颗星）指出了四种失败模式：错误的假设、过于复杂、正交编辑、命令式而非声明式。 gstack 的工作流程技能强制执行这四个方面。 `/office-hours` 在编写代码之前强制将假设公开。混淆协议阻止 Claude 猜测架构决策。 `/review` 捕获不必要的复杂性和路过式编辑。 `/ship` 通过测试优先执行将任务转换为可验证的目标。如果您已经使用 Karpathy 风格的 CLAUDE.md 规则，gstack 是工作流程执行层，使它们能够贯穿整个 sprint，而不仅仅是单个提示。

## 并行冲刺

gstack 在一次冲刺中运行良好。同时运行十个会变得很有趣。

**设计是核心。** `/design-consultation` 从头开始​​构建您的设计系统，研究现有内容，提出创意风险，并编写 `DESIGN.md`。但真正的魔力在于从概念草图到 HTML 的管道。

**`/design-shotgun` 是您探索的方式。** 您描述您想要的内容。它使用 GPT 图像生成 4-6 个 AI 模型变体。然后它会在浏览器中打开一个比较板，并排显示所有变体。你选择最喜欢的，留下反馈（“更多空白”，“更大胆的标题”，“失去渐变”），它会生成新一轮。重复直到你喜欢某样东西。味觉记忆会在几轮后开始发挥作用，因此它开始偏向你真正喜欢的东西。不再用语言描述你的愿景并希望人工智能能够理解它。您会看到选项，选择好的选项，然后进行可视化迭代。

**`/design-html` 让它成为现实。** 采用经批准的模型（来自 `/design-shotgun`、CEO 计划、设计审查或只是描述）并将其转换为生产质量的 HTML/CSS。不是那种在一个视口宽度下看起来很好但在其他地方都崩溃的 AI HTML。这使用 Pretext 进行计算文本布局：文本实际上在调整大小时回流，高度根据内容调整，布局是动态的。 30KB 开销，零依赖。它会检测您的框架（React、Svelte、Vue）并输出正确的格式。智能 API 路由根据是登陆页面、仪表板、表单还是卡片布局来选择不同的 Pretext 模式。输出是您实际交付的内容，而不是演示。

**`/qa` 是一个巨大的解锁。** 它让我从 6 个并行工作人员增加到 12 个。 Claude Code 说“我看到了问题”*，然后实际修复它，生成回归测试，并验证修复 - 这改变了我的工作方式。代理现在有眼睛了。

**智能审查路由。** 就像运营良好的初创公司一样：首席执行官不必查看基础错误修复，后端更改也不需要设计审查。 gstack 跟踪运行的评论，找出合适的评论，然后做明智的事情。审核准备情况仪表板会告诉您发货前的情况。

**测试一切。** 如果您的项目没有，`/ship` 会从头开始引导测试框架。每次 `/ship` 运行都会产生覆盖率审核。每个 `/qa` 错误修复都会生成回归测试。 100% 测试覆盖率是目标——测试使 vibe 编码而不是 yolo 编码变得安全。

**`/document-release` 是您从未拥有过的工程师。** 它读取项目中的每个文档文件，交叉引用差异，并更新所有漂移的内容。自述文件、架构、贡献、CLAUDE.md、TODOS — 所有这些都会自动保持最新。现在 `/ship` 自动调用它 - 文档保持最新状态，无需额外命令。

**真实浏览器模式。** `/open-gstack-browser` 推出 GStack 浏览器，这是一款由 AI 控制的 Chromium，具有反机器人隐身、自定义品牌和内置侧边栏扩展功能。Google 和 NYTimes 等网站无需验证码即可运行。菜单栏显示“GStack 浏览器”而不是“用于测试的 Chrome”。您的常规 Chrome 保持不变。所有现有的浏览命令均保持不变。 `$B disconnect` 返回无头状态。只要窗口打开，浏览器就会保持活动状态...在您工作时不会有空闲超时杀死它。

**侧边栏代理 — 您的 AI 浏览器助手。** 在 Chrome 侧面板中输入自然语言，子 Claude 实例会执行它。 “导航到设置页面并对其进行屏幕截图。” “用测试数据填写这张表格。” “检查清单中的每一项并提取价格。”侧边栏自动路由到正确的模型：Sonnet 用于快速操作（单击、导航、屏幕截图），Opus 用于阅读和分析。每个任务最多 5 分钟。侧边栏代理在独立会话中运行，因此它不会干扰您的主 Claude Code 窗口。直接从侧边栏页脚一键导入 cookie。

**个人自动化。** 侧边栏代理不仅仅适用于开发工作流程。示例：“浏览我孩子的学校家长门户，并将所有其他家长的姓名、电话号码和照片添加到我的 Google 通讯录中。”获得身份验证的两种方法：(1) 在头浏览器中登录一次，您的会话将持续存在，或者 (2) 单击侧边栏页脚中的“cookies”按钮从真实 Chrome 导入 cookie。经过身份验证后，Claude 会导航目录、提取数据并创建联系人。

**及时注入防御。** 恶意网页试图劫持您的侧边栏代理。 gstack 提供分层防御：与浏览器捆绑在一起的 22MB ML 分类器在本地扫描每个页面和工具输出，Claude Haiku 转录检查对完整对话形状的投票，系统提示中的随机金丝雀令牌捕获跨文本、工具参数、URL 和文件写入的会话泄露尝试，而判决组合器要求两个分类器在阻止之前达成一致（防止 Stack Overflow 风格的指令页面上的单模型误报）。侧边栏标题中的盾牌图标显示状态（绿色/amber/red）。通过 `GSTACK_SECURITY_ENSEMBLE=deberta` 选择加入 721MB DeBERTa-v3 ensemble 以获得 2-of-3 协议。紧急终止开关：`GSTACK_SECURITY_OFF=1`。有关完整堆栈，请参阅 [ARCHITECTURE.md](ARCHITECTURE.md#prompt-injection-defense-sidebar-agent)。

**人工智能卡住时浏览器切换。** 遇到验证码、身份验证墙或 MFA 提示？ `$B handoff` 在同一页面打开可见的 Chrome，所有 cookie 和选项卡都完好无损。解决问题，告诉 Claude 你已经完成了，`$B resume` 从它停止的地方继续。代理甚至会在连续 3 次失败后自动建议。

**`/pair-agent` 是跨代理协调。** 您处于 Claude Code 中。您还运行了 OpenClaw。或者 Hermes。或 Codex。您希望他们都查看同一个网站。输入 `/pair-agent`，选择您的代理，GStack 浏览器窗口将打开，以便您观看。该技能打印指令块。将该块粘贴到其他代理的聊天中。它用一次性设置密钥交换会话令牌，创建自己的选项卡，然后开始浏览。您会看到两个代理在同一个浏览器中工作，每个代理都在自己的选项卡中，两者都无法干扰对方。如果安装了 ngrok，隧道会自动启动，以便其他代理可以位于完全不同的计算机上。同机代理可以获得直接写入凭据的零摩擦快捷方式。这是来自不同供应商的人工智能代理第一次可以通过具有真正安全性的共享浏览器进行协调：范围令牌、选项卡隔离、速率限制、域限制和活动归因。

**多人工智能第二意见。** `/codex` 从 OpenAI 的 Codex CLI 获得独立审查 - 一个完全不同的人工智能查看相同的差异。三种模式：通过 pass/fail 门进行代码审查、积极尝试破解代码的对抗性挑战以及具有会话连续性的公开咨询。当 `/review` (Claude) 和 `/codex` (OpenAI) 审查同一分支时，您将获得跨模型分析，显示哪些发现重叠以及哪些发现各自独特。

**按需提供安全护栏。** 说“小心”，`/careful` 在任何破坏性命令之前发出警告 - rm -rf、DROP TABLE、force-push、git reset --hard。 `/freeze` 在调试时将编辑锁定到一个目录，这样 Claude 就不会意外地“修复”不相关的代码。 `/guard` 激活两者。 `/investigate` 自动冻结到正在调查的模块。

**主动的技能建议。** gstack 会注意到您处于哪个阶段 - 集思广益、审查、调试、测试 - 并建议正确的技能。不喜欢它？说“停止建议”，它会记住各个会话。

## 10-15次并行冲刺

gstack 在一次冲刺中就很强大。它具有变革性，可以同时运行十个。

[Conductor](https://conductor.build) 并行运行多个 Claude Code 会话 — 每个会话都在其自己的独立工作区中。一个会话在新想法上运行 `/office-hours`，另一个会话在 PR 上运行 `/review`，第三个会话实现功能，第四个会话在登台上运行 `/qa`，还有六个会话在其他分支上运行。全部同时进行。我经常进行 10-15 次并行冲刺——这是目前的实际最大值。

冲刺结构是并行性发挥作用的原因。如果没有流程，十个代理就是十个混乱源。通过思考、计划、构建、审查、测试、交付的流程，每个代理都确切地知道该做什么以及何时停止。您可以像首席执行官管理团队一样管理它们：检查重要的决策，让其余的事情运行。

### 语音输入（AquaVoice、Whisper 等）

gstack 技能具有语音友好的触发短语。自然地说出你想说的话——
“运行安全检查”、“测试网站”、“进行工程审查”——以及
正确的技能发动。您不需要记住斜杠命令名称或缩写词。

## 卸载

### 选项 1：运行卸载脚本

如果您的计算机上安装了 gstack：

```bash
~/.claude/skills/gstack/bin/gstack-uninstall
```

它处理技能、符号链接、全局状态 (`~/.gstack/`)、项目本地状态、浏览守护进程和临时文件。使用 `--keep-state` 保留配置和分析。使用 `--force` 跳过确认。

### 选项 2：手动删除（无本地存储库）

如果您没有克隆存储库（例如，您通过 Claude 代码粘贴安装，后来删除了克隆）：

```bash
# 1. Stop browse daemons
pkill -f "gstack.*browse" 2>/dev/null || true

# 2. Remove per-skill symlinks pointing into gstack/
find ~/.claude/skills -maxdepth 1 -type l 2>/dev/null | while read -r link; do
  case "$(readlink "$link" 2>/dev/null)" in gstack/*|*/gstack/*) rm -f "$link" ;; esac
done

# 3. Remove gstack
rm -rf ~/.claude/skills/gstack

# 4. Remove global state
rm -rf ~/.gstack

# 5. Remove integrations (skip any you never installed)
rm -rf ~/.codex/skills/gstack* 2>/dev/null
rm -rf ~/.factory/skills/gstack* 2>/dev/null
rm -rf ~/.kiro/skills/gstack* 2>/dev/null
rm -rf ~/.openclaw/skills/gstack* 2>/dev/null

# 6. Remove temp files
rm -f /tmp/gstack-* 2>/dev/null

# 7. Per-project cleanup (run from each project root)
rm -rf .gstack .gstack-worktrees .claude/skills/gstack 2>/dev/null
rm -rf .agents/skills/gstack* .factory/skills/gstack* 2>/dev/null
```

### 清理 CLAUDE.md

卸载脚本不会编辑 CLAUDE.md。在添加了 gstack 的每个项目中，删除 `## gstack` 和 `## Skill routing` 部分。

### Playwright

`~/Library/Caches/ms-playwright/` (macOS) 保留在原处，因为其他工具可能会共享它。如果没有其他需要，请将其删除。

---

免费、麻省理工学院许可、开源。没有高级会员，没有候补名单。

我开源了我构建软件的方式。您可以分叉它并使其成为您自己的。

> **我们正在招聘。** 想要以 AI 编码速度交付真实产品并帮助强化 gstack？
> 来 YC 工作 — [ycombinator.com/software](https://ycombinator.com/software)
> 极具竞争力的薪资和股权。旧金山，Dogpatch 区。

## GBrain — 为您的编码代理提供持久的知识

[GBrain](https://github.com/garrytan/gbrain) 是 AI 代理的持久知识库 - 将其视为代理在会话之间实际保留的内存。 GStack 为您提供了一条从零到“它正在运行，我的代理可以调用​​它”的单命令路径。

```bash
/setup-gbrain
```

三种路径，任选其一：

- **Supabase，现有 URL** — 您的云代理已经配置了大脑；粘贴会话池 URL，现在这台笔记本电脑使用相同的数据。
- **Supabase，自动配置** — 粘贴 Supabase 个人访问令牌；该技能创建一个新项目，轮询健康，获取池化器 URL，将其交给 `gbrain init`。端到端约 90 秒。
- **PGLite 本地** — 零帐户，零网络，约 30 秒。仅限此 Mac 上的孤立大脑。非常适合先尝试；稍后使用 `/setup-gbrain --switch` 迁移到 Supabase。

初始化后，该技能可以将 gbrain 注册为 Claude Code (`claude mcp add gbrain -- gbrain serve`) 的 MCP 服务器，因此 `gbrain search`、`gbrain put_page` 等显示为一流的类型化工具，而不是 bash shell-outs。

**每个远程信任策略。** 您计算机上的每个存储库都具有以下三个层之一：

- `read-write` — 代理可以搜索大脑并从此存储库写回新页面
- `read-only` — 代理可以搜索，但从不写入（最适合多客户顾问：搜索共享大脑，不要在客户 B 的存储库中使用客户 A 的工作污染它）
- `deny` — 根本没有 gbrain 交互

每个存储库该技能都会询问一次。该决定在同一远程的工作树和分支之间是粘性的。

**GStack 内存同步（不同的功能，相同的私有存储库基础设施）。** 可以选择将您的 gstack 状态（学习、CEO 计划、设计文档、回顾、开发人员配置文件）推送到私有 git 存储库，以便您的内存在整个计算机上跟随您，并带有一次性隐私提示（所有内容均已列入白名单/仅工件/关闭）和深度防御秘密扫描器，可在 AWS 密钥、令牌、PEM 块和 JWT 离开您的计算机之前对其进行阻止。

```bash
gstack-brain-init
```

**完整内容 - 每个场景、每个标志、每个 bin 助手、每个故障排除步骤：** [USING_GBRAIN_WITH_GSTACK.md](USING_GBRAIN_WITH_GSTACK.md)

其他参考：[docs/gbrain-sync.md](docs/gbrain-sync.md)（同步特定指南） • [docs/gbrain-sync-errors.md](docs/gbrain-sync-errors.md)（错误索引）

## 文档

| 文档 | 它涵盖什么 |
|-----|---------------|
|[技能深度剖析](docs/skills.md)|每项技能的理念、示例和工作流程（包括 Greptile 集成）|
|[构建者理念](ETHOS.md)|建造者理念：煮湖、建造前搜索、三层知识|
|[将 GBrain 与 GStack 结合使用](USING_GBRAIN_WITH_GSTACK.md)|`/setup-gbrain` 的每个路径、标志、bin 帮助程序和故障排除步骤|
|[GBrain 同步](docs/gbrain-sync.md)|跨机器内存设置、隐私模式、故障排除|
|[架构](ARCHITECTURE.md)|设计决策和系统内部结构|
|[浏览器参考](BROWSER.md)|`/browse` 的完整命令参考|
|[贡献](CONTRIBUTING.md)|开发设置、测试、贡献者模式和开发模式|
|[更新日志](CHANGELOG.md)|每个版本都有哪些新内容|

## 隐私和遥测

gstack 包含 **选择加入** 使用遥测来帮助改进项目。实际发生的情况如下：

- **默认关闭。** 除非您明确表示同意，否则不会将任何内容发送到任何地方。
- **首次运行时，** gstack 询问您是否要共享匿名使用数据。你可以说不。
- **发送的内容（如果您选择加入）：** 技能名称、持续时间、成功/fail、gstack 版本、操作系统。就是这样。
- **从未发送过的内容：** 代码、文件路径、存储库名称、分支名称、提示或任何用户生成的内容。
- **随时更改：** `gstack-config set telemetry off` 会立即禁用所有内容。

数据存储在 [Supabase](https://supabase.com) （开源 Firebase 替代方案）中。该架构位于 [__CODE_0__](supabase/migrations/) 中 — 您可以准确验证收集的内容。存储库中的 Supabase 可发布密钥是公钥（如 Firebase API 密钥）——行级安全策略拒绝所有直接访问。遥测流经经过验证的边缘函数，这些函数强制执行架构检查、事件类型允许列表和字段长度限制。

**本地分析始终可用。** 运行 `gstack-analytics` 以从本地 JSONL 文件查看您的个人使用情况仪表板 - 无需远程数据。

## 故障排除

**技能未显示？** `cd ~/.claude/skills/gstack && ./setup`

**`/browse` 失败？** `cd ~/.claude/skills/gstack && bun install && bun run build`

**过时的安装？** 运行 `/gstack-upgrade` — 或在 `~/.gstack/config.yaml` 中设置 `auto_upgrade: true`

**想要更短的命令？** `cd ~/.claude/skills/gstack && ./setup --no-prefix` — 从 `/gstack-qa` 切换到 `/qa`。系统会记住您的选择以供将来升级。

**想要命名空间命令吗？** `cd ~/.claude/skills/gstack && ./setup --prefix` — 从 `/qa` 切换到 `/gstack-qa`。如果您与 gstack 一起运行其他技能包，则很有用。

**Codex 显示“由于 SKILL.md 无效而跳过加载技能”？** 您的 Codex 技能描述已过时。修复：`cd ~/.codex/skills/gstack && git pull && ./setup --host codex` — 或对于存储库本地安装：`cd "$(readlink -f .agents/skills/gstack)" && git pull && ./setup --host codex`

**Windows 用户：** gstack 通过 Git Bash 或 WSL 在 Windows 11 上运行。除了 Bun 之外，还需要 Node.js — Bun 在 Windows 上的 Playwright 管道传输方面存在一个已知错误 ([bun#4253](https://github.com/oven-sh/bun/issues/4253))。浏览服务器自动回退到 Node.js。确保 `bun` 和 `node` 都在您的路径上。

**Claude 说看不到技能？** 确保你的项目的 `CLAUDE.md` 有 gstack 部分。添加这个：

```
## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy,
/canary, /benchmark, /browse, /open-gstack-browser, /qa, /qa-only, /design-review,
/setup-browser-cookies, /setup-deploy, /setup-gbrain, /retro, /investigate, /document-release,
/codex, /cso, /autoplan, /pair-agent, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn.
```

## 许可证

麻省理工学院。永远免费。去建造一些东西吧。