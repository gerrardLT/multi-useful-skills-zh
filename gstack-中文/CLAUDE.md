# gstack开发

## 命令

```bash
bun install          # 安装依赖
bun test             # 运行免费测试（浏览 + 快照 + 技能验证）
bun run test:evals   # 运行付费评估：LLM 评审 + E2E（基于差异，每次运行最高约$4）
bun run test:evals:all  # 运行所有付费评估，无论差异如何
bun run test:gate    # 仅运行门级测试（CI 默认，阻止合并）
bun run test:periodic  # 仅运行定期级测试（每周 cron / 手动）
bun run test:e2e     # 仅运行 E2E 测试（基于差异，每次运行最高约$3.85）
bun run test:e2e:all # 运行所有 E2E 测试，无论差异如何
bun run eval:select  # 显示基于当前差异将运行哪些测试
bun run dev <cmd>    # 在开发模式下运行 CLI，例如 bun run dev goto https://example.com
bun run build        # 生成文档 + 编译二进制文件
bun run gen:skill-docs  # 从模板重新生成 SKILL.md 文件
bun run skill:check  # 所有技能的健康状况仪表板
bun run dev:skill    # 监视模式：更改时自动重新生成 + 验证
bun run eval:list    # 列出 ~/.gstack-dev/evals/ 中的所有评估运行记录
bun run eval:compare # 比较两次评估运行记录（自动选择最近的）
bun run eval:summary # 聚合所有评估运行记录的统计信息
bun run slop          # 完整的 slop 扫描报告（所有文件）
bun run slop:diff     # 仅此分支上更改的文件中的 slop 发现
```

`test:evals` 需要 `ANTHROPIC_API_KEY`。 Codex E2E 测试 (`test/codex-e2e.test.ts`)
使用 `~/.codex/` 配置中的 Codex 自己的身份验证 — 不需要 `OPENAI_API_KEY` 环境变量。

**密钥位于本机上的位置。** Conductor 工作区不会继承
用户的交互式 shell 环境，因此 `ANTHROPIC_API_KEY` 和 `OPENAI_API_KEY` 不是
在默认进程环境中。在运行任何付费评估/E2E 之前，请从以下来源获取它们
`~/.zshrc` （这是加里保存它们的地方）：

```bash
bash -c '
  eval "$(grep -E "^export (ANTHROPIC_API_KEY|OPENAI_API_KEY)=" ~/.zshrc)"
  export ANTHROPIC_API_KEY OPENAI_API_KEY
  EVALS=1 EVALS_TIER=periodic bun test test/skill-e2e-<whatever>.test.ts
'
```

不要在任何地方回显键值（stdout、日志、shell 历史记录）。 grep + 评估
模式仅将其保留在进程环境中。当传递到测试的 Agent SDK 时，请勿
将 `env: {...}` 传递给 `runAgentSdkTest` — SDK 的身份验证管道未启动
当 env 作为对象提供时，密钥的方式相同（已确认的故障模式）。
相反，在调用之前对 `process.env.ANTHROPIC_API_KEY` 进行环境突变，然后
在 `finally` 中恢复。
E2E 实时测试流进度（通过 `--output-format stream-json 逐个工具）
--verbose`). 结果会持久化到 `~/.gstack-dev/evals/`，并自动与之前的运行进行比较。

**基于差异的测试选择：** `test:evals` 和 `test:e2e` 会根据针对基础分支的 `git diff` 自动选择测试。每个测试都声明其文件依赖关系
__代码_0__。更改全局触摸文件（session-runner、eval-store、
touchfiles.ts 本身）会触发所有测试。使用 `EVALS_ALL=1` 或 `:all` 脚本
强制运行所有测试的变体。运行 `eval:select` 来预览将运行哪些测试。

**两层系统：** 测试在 `E2E_TIERS` 中分类为 `gate` 或 `periodic`
（在 `test/helpers/touchfiles.ts` 中）。 CI 仅运行门测试 (`EVALS_TIER=gate`)；
定期测试每周通过 cron 或手动运行。使用 `EVALS_TIER=gate` 或
`EVALS_TIER=periodic` 进行过滤。添加新的E2E测试时，对其进行分类：
1. 安全护栏还是确定性功能测试？ -> __代码_0__
2. 质量基准、Opus 模型测试还是非确定性？ -> __代码_0__
3. 需要外部服务（Codex、Gemini）？ -> __代码_0__

## 测试

```bash
bun test             # 每次提交前运行 — 免费，<2秒
bun run test:evals   # 发布前运行 — 付费，基于差异（每次运行最高约$4）
```

`bun test` 运行技能验证、gen-skill-docs 质量检查和浏览
集成测试。 `bun run test:evals` 运行 LLM 评审质量评估和通过 `claude -p` 进行的 E2E
测试。创建 PR 之前两者都必须通过。

## 项目结构

```
gstack/
├── browse/          # 无头浏览器 CLI (Playwright)
│   ├── src/         # CLI + 服务器 + 命令
│   │   ├── commands.ts  # 命令注册表（单一事实来源）
│   │   └── snapshot.ts  # SNAPSHOT_FLAGS 元数据数组
│   ├── test/        # 集成测试 + 测试夹具
│   └── dist/        # 编译后的二进制文件
├── hosts/           # 类型化的主机配置（每个 AI 代理一个）
│   ├── claude.ts    # 主要主机配置
│   ├── codex.ts, factory.ts, kiro.ts  # 现有主机
│   ├── opencode.ts, slate.ts, cursor.ts, openclaw.ts  # IDE 主机
│   ├── hermes.ts, gbrain.ts  # 代理运行时主机
│   └── index.ts     # 注册表：导出所有，派生 Host 类型
├── scripts/         # 构建 + DX 工具
│   ├── gen-skill-docs.ts  # 模板 → SKILL.md 生成器（配置驱动）
│   ├── host-config.ts     # HostConfig 接口 + 验证器
│   ├── host-config-export.ts  # 设置脚本的 Shell 桥接
│   ├── host-adapters/     # 主机特定适配器（OpenClaw 工具映射）
│   ├── resolvers/   # 模板解析器模块（preamble, design, review, gbrain 等）
│   ├── skill-check.ts     # 健康状况仪表板
│   └── dev-skill.ts       # 监视模式
├── test/            # 技能验证 + 评估测试
│   ├── helpers/     # skill-parser.ts, session-runner.ts, llm-judge.ts, eval-store.ts
│   ├── fixtures/    # 基准真值 JSON、植入错误夹具、评估基线
│   ├── skill-validation.test.ts  # 第 1 层：静态验证（免费，<1秒）
│   ├── gen-skill-docs.test.ts    # 第 1 层：生成器质量（免费，<1秒）
│   ├── skill-llm-eval.test.ts   # 第 3 层：LLM 作为评审（每次运行约$0.15）
│   └── skill-e2e-*.test.ts       # 第 2 层：通过 claude -p 进行 E2E（每次运行约$3.85，按类别拆分）
├── qa-only/         # /qa-only 技能（仅报告 QA，不修复）
├── plan-design-review/  # /plan-design-review 技能（仅报告设计审计）
├── design-review/    # /design-review 技能（设计审计 + 修复循环）
├── ship/            # 发布工作流技能
├── review/          # PR 审查技能
├── plan-ceo-review/ # /plan-ceo-review 技能
├── plan-eng-review/ # /plan-eng-review 技能
├── autoplan/        # /autoplan 技能（自动审查管道：CEO → 设计 → 工程）
├── benchmark/       # /benchmark 技能（性能回归检测）
├── canary/          # /canary 技能（部署后监控循环）
├── codex/           # /codex 技能（通过 OpenAI Codex CLI 获取多 AI 第二意见）
├── land-and-deploy/ # /land-and-deploy 技能（合并 → 部署 → 金丝雀验证）
├── office-hours/    # /office-hours 技能（YC 办公时间 — 初创公司诊断 + 构建者头脑风暴）
├── investigate/     # /investigate 技能（系统性根本原因调试）
├── retro/           # 回顾技能（包括 /retro 全局跨项目模式）
├── bin/             # CLI 工具 (gstack-repo-mode, gstack-slug, gstack-config 等)
├── document-release/ # /document-release 技能（发布后文档更新）
├── cso/             # /cso 技能（OWASP Top 10 + STRIDE 安全审计）
├── design-consultation/ # /design-consultation 技能（从零开始设计系统）
├── design-shotgun/  # /design-shotgun 技能（视觉设计探索）
├── open-gstack-browser/  # /open-gstack-browser 技能（启动 GStack 浏览器）
├── connect-chrome/  # 符号链接 → open-gstack-browser（向后兼容）
├── design/          # 设计二进制 CLI (GPT Image API)
│   ├── src/         # CLI + 命令 (generate, variants, compare, serve 等)
│   ├── test/        # 集成测试
│   └── dist/        # 编译后的二进制文件
├── extension/       # Chrome 扩展（侧边栏 + 活动源 + CSS 检查器）
├── lib/             # 共享库 (worktree.ts)
├── docs/designs/    # 设计文档
├── setup-deploy/    # /setup-deploy 技能（一次性部署配置）
├── .github/         # CI 工作流 + Docker 镜像
│   ├── workflows/   # evals.yml (Ubicloud 上的 E2E), skill-docs.yml, actionlint.yml
│   └── docker/      # Dockerfile.ci（预烘焙工具链 + Playwright/Chromium）
├── contrib/         # 仅贡献者工具（从不为用户安装）
│   └── add-host/    # /gstack-contrib-add-host 技能
├── setup            # 一次性设置：构建二进制文件 + 符号链接技能
├── SKILL.md         # 从 SKILL.md.tmpl 生成（不要直接编辑）
├── SKILL.md.tmpl    # 模板：编辑此文件，运行 gen:skill-docs
├── ETHOS.md         # 构建者哲学（煮湖，构建前先搜索）
└── package.json     # browse 的构建脚本
```

## SKILL.md 工作流程

SKILL.md 文件是从 `.tmpl` 模板**生成**的。更新文档：

1. 编辑 `.tmpl` 文件（例如 `SKILL.md.tmpl` 或 `browse/SKILL.md.tmpl`）
2. 运行 `bun run gen:skill-docs` （或 `bun run build` 自动执行）
3. 提交 `.tmpl` 和生成的 `.md` 文件

要添加新的浏览命令：将其添加到 `browse/src/commands.ts` 并重建。
要添加快照标志：将其添加到 `browse/src/snapshot.ts` 中的 `SNAPSHOT_FLAGS` 并重建。

**令牌上限：** 生成的 SKILL.md 文件在超过 160KB（~40K 令牌）时会发出警告。
这是一个“注意功能膨胀”的护栏，而不是硬门。现代旗舰
模型有 200K-1M 上下文窗口，因此 40K 是窗口的 4-20%，并且提示缓存
使较大技能的边际成本较小。天花板是为了抓逃跑者而存在的
序言/resolver成长，不强行压缩精心调校的大技能
（`ship`、`plan-ceo-review`、`office-hours` 合法打包 25-35K 代币
行为）。如果超过 40K，正确的解决方法通常是：(1) 查看生长的内容，
(2) 如果一个解析器在单个 PR 中添加了 10K+，则质疑它是否属于内联
或者作为参考文档，(3) 仅压缩经过精心调整的散文作为最后的手段 -
削减覆盖范围审计、审查队伍或语音指令会产生真正的质量成本。

**合并 SKILL.md 文件上的冲突：**永远不要解决生成的 SKILL.md 上的冲突
接受任何一方的文件。相反：(1) 解决 `.tmpl` 模板上的冲突
和 `scripts/gen-skill-docs.ts` （事实来源），(2) 运行 `bun run gen:skill-docs`
重新生成所有 SKILL.md 文件，(3) 暂存重新生成的文件。接受一方的
生成的输出会默默地删除另一方的模板更改。

## 与平台无关的设计

技能绝不能对特定于框架的命令、文件模式或目录进行硬编码
结构。反而：

1. **阅读 CLAUDE.md** 以获取特定于项目的配置（测试命令、eval 命令等）
2. **如果丢失，请询问用户问题** — 让用户告诉您或让 gstack 搜索存储库
3. **保留 CLAUDE.md 的答案**，这样我们就不必再问了

这适用于测试命令、eval 命令、部署命令和任何其他命令
项目特定的行为。该项目拥有其配置； gstack 读取它。

## 编写技能模板

SKILL.md.tmpl 文件是 **Claude 读取的提示模板**，而不是 bash 脚本。
每个 bash 代码块都在单独的 shell 中运行 - 变量在块之间不会保留。

规则：
- **使用自然语言表达逻辑和状态。** 不要使用shell变量来传递
代码块之间的状态。相反，告诉克劳德要记住和参考什么
用散文表示（例如，“在步骤 0 中检测到的基本分支”）。
- **不要硬编码分支名称。** 通过动态检测 `main`/`master`/etc
`gh pr view` 或 `gh repo view`。使用 `{{BASE_BRANCH_DETECT}}` 进行 PR 定位
技能。在散文中使用“基本分支”，在代码块占位符中使用 `<base>` 。
- **保持 bash 块独立。**每个代码块应该独立工作。
如果一个块需要上一步的上下文，请在上面的散文中重申它。
- **将条件表达为英语。** 而不是 bash 中嵌套的 `if/elif/else`，
写下编号的决策步骤：“1. 如果 X，则执行 Y。2. 否则，执行 Z。”

## 写作风格（V1）

每个 tier-≥2 技能的默认输出遵循中的“写作风格”部分
`scripts/resolvers/preamble.ts`：首次使用时注释的行话（在
`scripts/jargon-list.json`，在 gen-skill-docs 时间烘焙），问题在
结果术语（“如果……的话，您的用户会受到什么影响”）而不是实施术语，
简短的句子，与用户影响密切相关的决策。想要的高级用户
更严格的 V0 散文集 `gstack-config set explain_level terse` （二进制开关，
无中间模式）。完整设计请参见 `docs/designs/PLAN_TUNING_V1.md`
理由。最初试图同时进行的审查节奏改革
写作风格被提取到 V1.1 — 请参阅 `docs/designs/PACING_UPDATES_V0.md`。

## 浏览器交互

当您需要与浏览器交互（QA、dogfooding、cookie 设置）时，请使用
`/browse` 技能或直接通过 `$B <command>` 运行浏览二进制文件。切勿使用
`mcp__claude-in-chrome__*` 工具——它们很慢、不可靠，而且不是这个
项目用途。

**侧边栏架构：**修改`sidepanel.js`、`background.js`之前，
`content.js`、`terminal-agent.ts` 或侧边栏相关的服务器端点，
读取`docs/designs/SIDEBAR_MESSAGE_FLOW.md`。侧边栏有一个主要的
表面 — **终端** 窗格（交互式 `claude` PTY） — 带有
Activity / Refs / Inspector 作为页脚后面的调试覆盖
`debug` 切换。一旦 PTY 被证实，聊天队列路径就被破坏了；
`sidebar-agent.ts` 和 `/sidebar-command` / `/sidebar-chat` /
`/sidebar-agent/event` 端点消失了。该文档涵盖了 WS 身份验证
流、双令牌模型和威胁模型边界 - 无声故障
这里通常追溯到不理解跨组件流程。

**WebSocket 身份验证使用 Sec-WebSocket-Protocol，而不是 cookie。** 浏览器
无法在 WebSocket 升级上设置 `Authorization`，但可以设置
`Sec-WebSocket-Protocol` 通过 `new WebSocket(url, [token])`。代理
读取它，根据 `validTokens` 进行验证，并且必须回显协议
返回升级响应 — 没有回显，Chromium 会关闭
立即连接。 `Set-Cookie: gstack_pty=...` 保留为
非浏览器调用者的后备（跨端口 `SameSite=Strict`
cookie 路径无法从 chrome 扩展源保留下来）。

**跨窗格 PTY 注入。** 工具栏的清理按钮和
Inspector 的“发送到代码”操作都将文本传送到实时克劳德中
PTY 通过 `window.gstackInjectToTerminal(text)`，暴露于
__代码_0__。没有 `/sidebar-command` POST — 实时 REPL 是
现在侧边栏中唯一的执行界面。

**`/health` 不得公开任何 shell 授予令牌。** 它已经泄漏
`AUTH_TOKEN` 以引导模式发送给本地主机调用者（v1.1+ TODO）。不
在那里添加 PTY 会话令牌会使情况变得更糟。 PTY 身份验证流程
仅通过 `POST /pty-session`。

**传输层安全** (v1.6.0.0+)。当 `pair-agent` 启动 ngrok 隧道时，
该守护进程绑定两个 HTTP 侦听器：一个本地侦听器（127.0.0.1，完整命令
表面，从未转发）和隧道侦听器（锁定白名单：`/connect`，
`/command` 具有范围令牌 + 26 个命令浏览器驱动白名单，
__代码_0__)。 ngrok 仅转发隧道端口。隧道上的根令牌
返回 403。SSE 端点使用通过创建的 30 分钟 HttpOnly `gstack_sse` cookie
`POST /sse-session` （对 `/command` 永远无效）。隧道表面拒绝去
通过 `tunnel-denial-log.ts` 到 `~/.gstack/security/attempts.jsonl`。编辑前
`server.ts`、`sse-session-cookie.ts` 或 `tunnel-denial-log.ts`，读取
[ARCHITECTURE.md](ARCHITECTURE.md#dual-listener-tunnel-architecture-v1600) —
模块边界（没有从 `token-registry.ts` 导入到 `sse-session-cookie.ts`）
是范围隔离的承重。

**侧边栏安全堆栈**（针对提示注入的分层防御）：

|层|模块|位于|
|-------|--------|----------|
| L1-L3 |__代码_0__|服务器和代理 — 数据标记、隐藏元素条、ARIA 正则表达式、URL 阻止列表、信封包装|
| L4 |`security-classifier.ts` (TestSavantAI ONNX)|**仅限侧边栏代理**|
| L4b |`security-classifier.ts`（克劳德俳句抄本）|**仅限侧边栏代理**|
| L5 |`security.ts`（金丝雀）|两者 — 注入已编译的、签入代理|
| L6 |`security.ts`（combineVerdict 整体）|两个都|

**关键约束：** `security-classifier.ts` 不能从
已编译的浏览二进制文件。 `@huggingface/transformers` v4 需要 `onnxruntime-node`
无法从 Bun 编译的临时提取目录中 `dlopen` 。仅 `security.ts`
（纯字符串操作 - 金丝雀、判决组合器、攻击日志、状态）是安全的
对于 `server.ts`。请参阅`~/.gstack/projects/garrytan-gstack/ceo-plans/2026-04-19-prompt-injection-guard.md`
§“Pre-Impl Gate 1 Outcome”用于完整的架构决策。

**阈值**（在 `security.ts` 中）：
- `BLOCK: 0.85` — 单层分数，如果交叉确认，将导致 BLOCK文件：gstack-中文/CLAUDE.md [第 2/3 块]
规则：
- 仅改进文档中的中文翻译覆盖范围。
- 保留必要的英文技术术语，当翻译它们会破坏含义时。
- 精确保留格式。
- 如果文件已正确翻译，则原样返回。

文档内容：
- `WARN: 0.60` — 交叉确认阈值。当 L4 和 L4b 都 >= 0.60 → 阻止
- `LOG_ONLY: 0.40` — 门记录分类器（当所有层 < 0.40 时跳过俳句）

**集成规则：** 仅当 ML 内容分类器和转录本分类器都报告 >= WARN 时才阻止。单层高置信度降级为 WARN — 这是 Stack Overflow 指令编写的误报缓解措施。金丝雀泄漏总是阻止（确定性）。

**环境旋钮：**
- `GSTACK_SECURITY_OFF=1` — 紧急终止开关。即使分类器已预热，也保持关闭状态。金丝雀仍然被注入；只是跳过 ML 扫描。
- `GSTACK_SECURITY_ENSEMBLE=deberta` — 选择加入 DeBERTa-v3 集成。添加 ProtectAI DeBERTa-v3-base-injection-onnx 作为跨模型的 L4c 分类器协议。首次运行下载大小为 721MB。启用集成后，阻止需要 3 个 ML 分类器中的 2 个同意 >= WARN（testsavant、deberta、transcript）。如果没有集成（默认），阻止需要 testavant + transcript >= WARN。
- 分类器模型缓存：`~/.gstack/models/testsavant-small/`（112MB，仅首次运行）加上 `~/.gstack/models/deberta-v3-injection/`（721MB，仅当启用集成时）
- 攻击日志：`~/.gstack/security/attempts.jsonl`（仅加盐 sha256 + 域，以 10MB 轮换，5 代）
- 每设备盐：`~/.gstack/security/device-salt`（权限 0600）
- 会话状态：`~/.gstack/security/session-state.json`（跨进程，原子操作）

## 开发符号链接意识

开发 gstack 时，`.claude/skills/gstack` 可能是指向此工作目录（gitignored）的符号链接。这意味着技能更改**立即生效**，非常适合快速迭代，但在大型重构过程中存在风险（其中写了一半的技能可能会同时被其他 Claude Code 会话使用 gstack 破坏）。

**每个会话检查一次：** 运行 `ls -la .claude/skills/gstack` 以查看它是符号链接还是真实副本。如果它是指向您的工作目录的符号链接，请注意：
- 模板更改 + `bun run gen:skill-docs` 会立即影响所有 gstack 调用
- 对 SKILL.md.tmpl 文件的重大更改可能会破坏并发的 gstack 会话
- 在大型重构期间，删除符号链接 (`rm .claude/skills/gstack`)，以便改为使用 `~/.claude/skills/gstack/` 处的全局安装

**前缀设置：** 安装程序在顶层创建真实目录（不是符号链接），内部有 SKILL.md 符号链接（例如 `qa/SKILL.md -> gstack/qa/SKILL.md`）。这确保 Claude 将它们识别为顶级技能，而不是嵌套在 `gstack/` 下。名称可以是短名称 (`qa`) 或命名空间名称 (`gstack-qa`)，由 `~/.gstack/config.yaml` 中的 `skill_prefix` 决定。将 `--no-prefix` 或 `--prefix` 传递给 `./setup` 以跳过交互式提示。

**注意：** 不推荐将 gstack 供应到项目的存储库中。请使用全局安装 + `./setup --team` 代替。有关团队模式说明，请参阅 README.md。

**对于计划审核：** 当审核修改技能模板或 gen-skill-docs 管道的更改时，考虑是否应该在上线之前单独测试这些更改（特别是当用户在其他窗口中积极使用 gstack 时）。

**升级迁移：** 当更改以可能破坏现有用户安装的方式修改磁盘状态（目录结构、配置格式、过时的文件）时，请将迁移脚本添加到 `gstack-upgrade/migrations/`。阅读 CONTRIBUTING.md 的“升级迁移”部分了解格式和测试要求。升级技能会在 `/gstack-upgrade` 期间自动在 `./setup` 之后运行这些迁移。

## 编译的二进制文件 - 切勿提交 browser/dist/ 或 design/dist/

`browse/dist/` 和 `design/dist/` 目录包含已编译的 Bun 二进制文件（`browse`、`find-browse`、`design`，每个约 58MB）。这些仅是 Mach-O arm64 — 它们不适用于 Linux、Windows 或 Intel Mac。 `./setup` 脚本已经从每个平台的源代码构建，因此签入的二进制文件是多余的。由于历史错误，它们仍被 git 跟踪，最终应删除 `__代码_0__`。

**永远不要暂存或提交这些文件。** 它们在 `git status` 中显示为已修改，因为尽管 `.gitignore` 仍会跟踪它们 - 请忽略它们。暂存文件时，始终使用特定的文件名 (`git add file1 file2`) — 绝不使用 `git add .` 或 `git add -A`，这会意外地包含二进制文件。

## 提交风格

**始终将提交一分为二。** 每次提交都应该是单个逻辑更改。当您进行了多项更改（例如，重命名+重写+新测试）时，请在推送之前将它们分成单独的提交。每个提交应该是独立的、可理解和可恢复的。

良好二分的示例：
- 重命名 /move 与行为更改分开
- 测试基础设施（触摸文件、助手）与测试实现分开
- 模板更改与生成的文件重新生成分开
- 机械重构与新功能分开

当用户说“二分提交”或“二分并推送”时，将暂存/未暂存的更改拆分为逻辑提交并推送。

## 倾斜扫描：AI 代码质量，而不是 AI 代码隐藏

我们使用 [slop-scan](https://github.com/benvinegar/slop-scan) 来捕获人工智能生成的代码确实比人类编写的代码更糟糕的模式。我们不尝试将其作为人类代码传递。我们采用人工智能编码，并为此感到自豪。目标是代码质量。

```bash
npx slop-scan scan .          # human-readable report
npx slop-scan scan . --json   # machine-readable for diffing
```

配置：位于存储库根目录的 `slop-scan.config.json`（当前不包括 `**/vendor/**`）。

### 修复什么（真正的质量改进）

- **文件操作周围的空捕获** - 使用 `safeUnlink()`（忽略 ENOENT，重新抛出 EPERM/EIO）。清理过程中吞没的 EPERM 意味着无声数据丢失。
- **围绕进程终止的空捕获** - 使用 `safeKill()`（忽略 ESRCH，重新抛出 EPERM）。被吞下的 EPERM 意味着您认为您杀死了一些实际上并没有杀死的东西。
- **冗余 `return await`** — 当没有封闭的 try 块时删除。节省一个微任务，表明意图。
- **类型化异常捕获** — `catch (err) { if (!(err instanceof TypeError)) throw err }` 当 try 块执行 URL 解析或 DOM 工作时，确实比 `catch {}` 更好。你知道你期望什么错误，所以就这么说吧。

### 不该修复的内容（linter 游戏，而不是质量）

- **错误消息上的字符串匹配** — `err.message.includes('closed')` 很脆弱。Playwright/Chrome 可以随时更改措辞。如果“即发即弃”操作可能失败，无论出于何种原因，您都不在乎，`catch {}` 是正确的模式。
- **添加注释以免除传递包装器** - 上面的“活动会话的别名”破坏倾斜扫描豁免规则的一种方法是噪音，而不是文档。
- **将扩展捕获和日志转换为选择性重新抛出** - Chrome 扩展崩溃完全基于未捕获的错误。如果捕获日志并继续，那就是扩展代码的正确模式。别让它扔掉。
- **收紧尽力清理路径** - 关闭、紧急清理和断开连接代码应该使用 `safeUnlinkQuiet()`（吞掉所有错误）。在 EPERM 上抛出清理路径意味着清理的其余部分不会运行。那就更糟了。

### `browse/src/error-handling.ts` 中的实用程序

|功能|使用时|行为|
|----------|----------|----------|
|__代码_0__|正常文件删除|忽略 ENOENT，重新抛出其他人|
|__代码_0__|关机/emergency清理|吞掉所有错误|
|__代码_0__|发送信号|忽略 ESRCH，重新扔掉其他人|
|__代码_0__|布尔过程检查|返回 true/false，从不抛出|

### 分数追踪

基线（2026 年 4 月 9 日，清理前）：100 个结果，432.8 分数，2.38 分数/file。
清理后：90 个结果，358.1 分数，1.96 分数/file。

不用追号。修复代表实际代码质量问题的模式。接受“草率”模式是正确的工程选择的发现。

## 社区公关护栏

在审查或合并社区 PR 时，**在接受任何提交之前始终询问用户问题**：

1. **触及 ETHOS.md** — 该文件是 Garry 的个人构建者哲学。没有来自外部贡献者或人工智能代理的编辑，期间。
2. **删除或软化宣传材料** - YC 参考资料、创始人观点、和产品声音是有意的。将这些描述为“不必要”或“太促销”的 PR 必须拒绝。
3. **改变加里的声音** - 语气、幽默、直接和技巧视角模板、CHANGELOG 和文档不是通用的。将语音重写为更加“中立”或者“专业”的 PR 必须被拒绝。

即使代理坚信变更可以改善项目，这三个类别需要通过 AskUserQuestion 明确用户批准。没有例外。没有自动合并。不，“我会把它清理干净。”

## 变更日志+版本风格

**版本不变（工作空间感知船）。** VERSION 是单调有序的发布标识符，而不是严格的 semver 承诺。凹凸水平 (major/minor/patch/micro) 表达发货时的意图。队列前进经过明确允许同一碰撞级别内声明的版本 - 如果分支 A 声称 v1.7.0.0 为 MINOR，分支 B 也是 MINOR，B 落在 v1.8.0.0（相对于主要而言仍然是次要的）。下游消费者切勿依赖“MINOR = 仅功能，PATCH = 仅修复”作为严格的合同。这就是为什么 `bin/gstack-next-version` 在选定的凹凸级别内前进，而不是发生碰撞时重新选择级别。

**规模感知碰撞 - 使用常识。** 当差异很大时，碰撞 MINOR（或主要），而不是补丁。 PATCH 用于错误修复和小的添加；MINOR 是为了大量新增能力或大幅减少；MAJOR 是为了破坏性变化。粗略的路标（不要视为规则，而是视为气味检查）：

- **补丁 (X.Y.Z+1.0)**：错误修复、文档调整、小的附加更改、单个添加了 test/file。净差异低于约 500 行，没有新的面向用户的功能。
- **次要 (X.Y+1.0.0)**：发布了新功能（技能、装备、命令、大重构）、大量代码减少（压缩、迁移）或协调多文件更改。添加了约 2000 行的净差异/removed，或用户可见您在推文中添加的功能。
- **MAJOR (X+1.0.0.0)**：对公共表面的重大更改（CLI 标志重命名，删除了技能，更改了配置格式），或者发布了足够大的版本博客文章的标题。

如果您发现自己在争论“添加 10K + 删除 24K 真的是一个补丁吗？” - 它不是。轻微碰撞。与“这增加了一个带有 6 个新 E2E 的全新测试工具 + 辅助实用程序”相同 — 次要。提升级别是与用户的沟通关于这是什么类型的发布；不要低估它。

当合并 origin/main 带来更高的 VERSION 时，重新评估凹凸级别与你的分支工作的规模相对应，而不仅仅是主要工作是否向前推进。如果 main 改变了 MINOR 并且你的分支也发生了实质性的改变，那么你就改变了 MINOR 再次位于顶部（例如，主版本为 v1.14.0.0，您的分支则为 v1.15.0.0）。

**VERSION 和 CHANGELOG 是分支范围的。** 发布的每个功能分支都有其自己的版本碰撞和变更日志条目。该条目描述了该分支添加的内容 - 不是 main 上已有的内容。

**何时写入 CHANGELOG 条目：**
- 在 `/ship` 时间（步骤 13），而不是在开发或中期分支期间。
- 该条目涵盖了该分支与基础分支上的所有提交。
- 切勿将新工作折叠到先前版本的现有变更日志条目中已经登陆主线了。如果 main 有 v0.10.0.0 并且您的分支添加了功能，使用新条目跳转到 v0.10.1.0 — 不要编辑 v0.10.0.0 条目。

**写作前的关键问题：**
1. 我在哪个分支？这个分支改变了什么？
2. 基础分支版本已经发布了吗？ （如果是，则碰撞并创建新条目。）
3. 该分支上的现有条目是否已经涵盖了早期的工作？ （如果是，则更换最终版本有一个统一的条目。）

**合并 main 并不意味着采用 main 的版本。** 当您将 origin/main 合并到作为一个功能分支，main 可能会带来新的 CHANGELOG 条目和更高的版本。你的分行仍然需要它自己的版本。如果 main 位于 v0.13.8.0 并且您的分支添加了功能，通过新条目升级到 v0.13.9.0。切勿将您的更改塞入以下条目中：已经登陆主线了。您的条目位于顶部，因为您的分支位于下一个。

**合并 main 后，始终检查：**
- CHANGELOG 是否有您分支自己的条目与主条目分开？
- VERSION 是否高于 main 的 VERSION？
- 您的条目是否是 CHANGELOG 中最上面的条目（高于 main 的最新条目）？
如果答案是否定的，请在继续之前修复它。

**在移动、添加或删除条目的任何 CHANGELOG 编辑之后，** 立即运行 `grep "^## \[" CHANGELOG.md` 验证没有重复项和合理的逆时间顺序命令。版本号之间的差距很好。一个在 v1.6.4.0 发布的分支，没有 main 上先前的 v1.5.2.0 或 v1.5.3.0 条目是正确的 — 这些是分支内部的从未登陆过的版本号。不要用占位符条目回填空白。

**永远不要孤立分支内部版本。** 如果您的分支多次更改版本在开发期间（例如 v1.5.1.0 → v1.5.2.0 → v1.6.4.0），那些早期的条目是从未发布到主线，最后一艘船将所有这些整合到一个条目中最终版本（v1.6.4.0）。折叠它们——删除旧条目并移动它们内容写入最终条目后，重新相应的版本表列。读者见一发布，而不是分支日记。差距很好（v1.6.3.0 → v1.6.4.0，没有 v1.5.x 在 main 之间是正确的）。

CHANGELOG.md **适用于用户**，而不是贡献者。像产品发行说明一样写：

- 以用户现在可以**做**以前不能做的事情为主导。出售该功能。
- 使用简单的语言，而不是实现细节。 “你现在可以......”而不是“重构......”
- **永远不要提及 TODOS.md、内部跟踪、评估基础设施或面向贡献者详细信息。** 这些对用户来说是不可见的，对他们来说毫无意义。
- 将贡献者/internal 更改放在底部单独的“贡献者”部分中。
- 每个条目都应该让人觉得“哦，太好了，我想尝试一下。”
- 没有行话：说“现在每个问题都告诉你你所在的项目和分支”而不是“通过序言解析器在技能模板之间标准化 AskUserQuestion 格式。”

**仅记录 main 和此更改之间发生的情况。** 读者不关心如何我们到了。始终远离变更日志：

- 分支重新同步、与主活动合并提交、变基活动。
- 计划批准、审查结果（首席执行官/工程/设计/外部声音/法典调查结果），AskUserQuestion 决策、范围谈判。
- “工作已排队”、“计划已获批准”、“正在进行中”、“稍后发货”——变更日志记录已发货的内容，而不是可能发货的内容。
- 当没有面向用户的工作实际落地时，版本碰撞内务处理。

如果基础分支版本和此版本之间的差异没有面向用户的更改（仅合并，仅 CHANGELOG 编辑，仅占位符工作），诚实的条目是其中之一句子：“分支超前规则的版本碰撞。还没有面向用户的变化。”停止那里。请勿垫。不要解释最终将发布的计划。不叙述分行的历史。当实际工作落地时，该条目将在 /ship 时间替换它。

### 发布摘要格式（每个 `## [X.Y.Z]` 条目）

`CHANGELOG.md` 中的每个版本条目必须以发布摘要部分开头GStack/Garry 声音，一个视口的散文+表格，就像一个判决，而不是营销。逐项变更日志（小节、项目符号、文件）如下在该摘要下方，由 `### Itemized changes` 标头分隔。

发布摘要部分由人类、自动更新代理以及任何人决定是否升级。逐项列表适用于需要的代理商确切地知道发生了什么变化。

每个 `## [X.Y.Z]` 条目顶部的结构：

1. **两行粗体标题**（总共 10-14 个字）。应该像判决一样落地，而不是营销。听起来就像今天发货并关心它是否有效的人。
2. **引导段落**（3-5 句话）。发布了什么，为用户带来了什么变化。具体、具体，没有人工智能词汇，没有破折号，没有炒作。
3. **“重要的 X 个数字”部分**包含：
- 一个简短的设置段落命名了数字的来源（实际生产部署或可重现的基准测试，将文件命名为 /command 来运行）。
- 包含 3-6 个关键指标的表格，其中包含 BEFORE / AFTER / Δ 列。
- 第二个可选表格，用于按类别细分（如果相关）。
- 用 1-2 个句子解释具体用户术语中最引人注目的数字。
4. **“这对[观众]意味着什么”结束段落**（2-4 句话）捆绑真正的工作流程转变的指标。以要做什么结束。

发布摘要语音规则：
- 没有破折号（使用逗号、句号、“...”）。
- 没有人工智能词汇（深入、稳健、全面、细致、基础等）或禁止的短语（“这是关键”、“底线”等）。
- 真实的数字、真实的文件名、真实的命令。不是“快”，而是“30K 页上约 30 秒”。
- 短段落，将单句打孔与 2-3 句连贯混合在一起。
- 连接到用户结果：“代理的读取量减少了约 3 倍”胜过“精度提高”。
- 直接关注质量。 “设计得很好”或“这是一团糟”。没有跳舞。

来源材料：
- 更改日志之前的上下文条目。
- 标题数字的基准文件或 `/retro` 输出。
- 最近提交的内容 (`git log <prev-version>..HEAD --oneline`)。
- 不要编造数字。如果某个指标不在基准或生产数据中，不要包括它。如果被问到，请说“尚未测量”。

目标长度：摘要约 250-350 个字。应渲染为一个视口。

### 逐项更改（发布摘要下方）

写入 `### Itemized changes` 并继续详细的小节（已添加，已更改、已修复、供贡献者使用）。与面向用户的语音指导的规则相同上面，加上：

- **始终归功于社区贡献。** 当条目包含来自某个人的作品时社区 PR，用 `Contributed by @username` 命名贡献者。贡献者做了实实在在的工作。每次都公开感谢他们，无一例外。

## AI 工作量压缩

在估计或讨论工作量时，始终显示人员团队时间和 CC+gstack 时间：

|任务类型|人力团队|CC+gstack|压缩|
|-----------|-----------|-----------|-------------|
|样板/脚手架|2天|15分钟| ~100x |
|测试写作|1天|15分钟| ~50x |
|功能实现|1周|30分钟| ~30x |
|错误修复+回归测试|4小时|15分钟| ~20x |
|建筑/设计|2天|4小时| ~5x |
|研究/探索|1天|3小时| ~3x |

完整性是廉价的。完成实施后不建议走捷径是“湖”（可实现）而不是“海洋”（多季度迁移）。参见完整哲学的技能序言中的完整性原则。

## 构建前搜索

在设计任何涉及并发、不熟悉的模式的解决方案之前，基础设施，或任何 Runtime/framework 可能内置的东西：

1. 搜索“{runtime} {thing} 内置”
2. 搜索“{thing}最佳实践{当前年份}”
3. 查看官方的 runtime/framework 文档

三层知识：经过验证的知识（第 1 层）、新流行的知识（第 2 层）、第一原则（第 3 层）。最重要的是奖励第 3 层。完整内容请参见 ETHOS.md 建设者哲学。

## 当地计划

贡献者可以在 `~/.gstack-dev/plans/` 中存储远程视觉文档和设计文档。这些仅限本地（未签入）。在查看 TODOS.md 时，请检查 `plans/` 是否有候选人可能已准备好推广为 TODO 或实施。

## E2E 评估失败归咎协议

当 E2E 评估在 `/ship` 或任何其他工作流程期间失败时，**切勿声称“不与我们的变化相关”，但没有证明这一点。** 这些系统具有无形的耦合 - 序言文本的更改会影响座席行为，新的助手会更改时间安排，重新生成的 SKILL.md 会改变提示上下文。

**将故障归因于“预先存在”之前需要：**
1. 在主分支（或基础分支）上运行相同的 eval 并显示它也在那里失败
2. 如果它在主线程上通过但在分支上失败 - 这就是你的改变。追究责任。
3. 如果您无法在 main 上运行，请说“未经验证 - 可能相关，也可能不相关”并标记它作为公关机构的风险

没有收据的“预先存在”是一种懒惰的主张。要么证明，要么不说。

## 长时间运行的任务：不要放弃

运行评估、E2E 测试或任何长时间运行的后台任务时，**轮询直到完成**。每 3 次循环使用 `sleep 180 && echo "ready"` + `TaskOutput` 分钟。永远不要切换到阻塞模式并在轮询超时时放弃。绝不说“完成后我会收到通知”并停止检查 - 保持循环继续直到任务完成或用户告诉您停止。

完整的 E2E 套件可能需要 30-45 分钟。即 10-15 个轮询周期。做所有的他们。报告每次检查的进度（哪些测试通过了，哪些测试正在运行，任何到目前为止的失败）。用户希望看到运行完成，而不是承诺你稍后会检查。

## E2E 测试夹具：提取，不要复制

**切勿将完整的 SKILL.md 文件复制到 E2E 测试夹具中。** SKILL.md 文件是 1500-2000 行。当 `claude -p` 读取这么大的文件时，上下文膨胀会导致超时、不稳定的回合限制以及比必要时间长 5-10 倍的测试。

相反，仅提取测试实际需要的部分：

```typescript
// BAD — agent reads 1900 lines, burns tokens on irrelevant sections
fs.copyFileSync(path.join(ROOT, 'ship', 'SKILL.md'), path.join(dir, 'ship-SKILL.md'));

// GOOD — agent reads ~60 lines, finishes in 38s instead of timing out
const full = fs.readFileSync(path.join(ROOT, 'ship', 'SKILL.md'), 'utf-8');
const start = full.indexOf('## Review Readiness Dashboard');
const end = full.indexOf('\n---\n', start);
fs.writeFileSync(path.join(dir, 'ship-SKILL.md'), full.slice(start, end > start ? end : undefined));
```

此外，当运行有针对性的 E2E 测试来调试故障时：
- 在 **前台** (`bun test ...`) 运行，而不是在后台运行 `&` 和 `tee`
- 永远不要 `pkill` 运行 eval 进程并重新启动 - 你会丢失结果并浪费金钱
- 一场干净的比赛击败了三场被终止并重新开始的比赛

## 将原生 OpenClaw 技能发布到 ClawHub

原生 OpenClaw 技能位于 `openclaw/skills/gstack-openclaw-*/SKILL.md` 中。这些都是手工制作的方法技能（不是由管道生成）发布到 ClawHub 因此任何 OpenClaw 用户都可以安装它们。

**发布：** 命令是 `clawhub publish` （不是 `clawhub skill publish`）：

```bash
clawhub publish openclaw/skills/gstack-openclaw-office-hours \
  --slug gstack-openclaw-office-hours --name "gstack Office Hours" \
  --version 1.0.0 --changelog "description of changes"
```

对每项技能重复：`gstack-openclaw-ceo-review`、`gstack-openclaw-investigate`、`__代码_0__`。每次更新时都会增加 `--version`。

**Auth:** `clawhub login` （打开浏览器进行 GitHub 身份验证）。 `clawhub whoami` 进行验证。

**更新：** 相同的 `clawhub publish` 命令具有更高的 `--version` 和 `--changelog`。

**验证：** `clawhub search gstack` 确认它们处于活动状态。

## 部署到主动技能

主动技能位于 `~/.claude/skills/gstack/`。进行更改后：

1. 推你的分支
2. 在技​​能目录中获取并重置：`cd ~/.claude/skills/gstack && git fetch origin && git reset --hard origin/main`
3. 重建：`cd ~/.claude/skills/gstack && bun run build`

或者直接复制二进制文件：
- __代码_0__
- __代码_0__

## 技能路由

当用户的请求与可用技能匹配时，通过技能工具调用它。如有疑问，请调用该技能。

关键路由规则：
- 产品创意/brainstorming → 调用/office-hours
- 策略/scope → 调用/plan-ceo-review
- 架构 → 调用 /plan-eng-review
- 设计系统/plan审查→调用/design-consultation或/plan-design-review
- 完整审查管道 → 调用 /autoplan- Bugs/errors → 调用 /investigate
- QA/testing 站点行为 → 调用 /qa 或 /qa-only
- 代码审查/diff检查 → 调用 /review
- 视觉美化 → 调用 /design-review
- Ship/deploy/PR → 调用 /ship 或 /land-and-deploy
- 保存进度 → 调用 /context-save
- 恢复上下文 → 调用 /context-restore