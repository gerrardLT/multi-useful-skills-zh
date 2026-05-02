# 为 gstack 做出贡献

感谢您想让 gstack 变得更好。无论您是要修复技能提示中的拼写错误还是构建全新的工作流程，本指南都将帮助您快速启动并运行。

## 快速启动

gstack 技能是 Claude Code 从 `skills/` 目录中发现的 Markdown 文件。通常它们位于 `~/.claude/skills/gstack/` （您的全局安装）。但是，当您开发 gstack 本身时，您希望 Claude Code 使用 *在您的工作树中* 的技能 - 因此编辑会立即生效，而无需复制或部署任何内容。

这就是开发模式的作用。它将您的存储库符号链接到本地 `.claude/skills/` 目录，以便 Claude Code 直接从您的结账中读取技能。

```bash
git clone https://github.com/garrytan/gstack.git && cd gstack
bun install                    # install dependencies
bin/dev-setup                  # activate dev mode
```

> **完整克隆与浅克隆。** 自述文件面向用户的安装使用 `--depth 1` 来提高速度。作为贡献者，请使用完整克隆（无 `--depth` 标志）——您需要 `git log`、`git blame`、`git bisect` 的历史记录，并针对早期版本查看 PR。如果您已经按照自述文件获得了 `--depth 1` 克隆，请使用 `git fetch --unshallow` 将其升级为完整克隆。

现在编辑任何 `SKILL.md`，在 Claude Code 中调用它（例如 `/review`），然后实时查看您的更改。当你完成开发后：

```bash
bin/dev-teardown               # deactivate — back to your global install
```

## 运营自我提升

gstack 会自动从失败中学习。在每次技能会话结束时，代理会反思出了什么问题（CLI 错误、错误的方法、项目特性）并将操作学习记录到 `~/.gstack/projects/{slug}/learnings.jsonl`。未来的会话会自动呈现这些知识，因此随着时间的推移，gstack 在您的代码库上会变得更加智能。

无需设置。学习内容会自动记录。使用 `/learn` 查看它们。

### 贡献者工作流程

1.  **正常使用 gstack** — 自动捕获操作知识
2.  **检查您的学习情况：** `/learn` 或 `ls ~/.gstack/projects/*/learnings.jsonl`
3.  **分叉并克隆 gstack**（如果您还没有）
4.  **将您的分叉符号链接到您遇到错误的项目中：**
    ```bash
    # In your core project (the one where gstack annoyed you)
    ln -sfn /path/to/your/gstack-fork .claude/skills/gstack
    cd .claude/skills/gstack && bun install && bun run build && ./setup
    ```
    安装程序会创建每个技能目录，其中包含指向 `gstack/qa/SKILL.md` 等的 SKILL.md 符号链接，并询问您的前缀偏好。传递 `--no-prefix` 跳过提示并使用短名称。
5.  **解决问题** - 您的更改将立即在此项目中生效
6.  **实际使用 gstack 进行测试** - 做那些让你烦恼的事情，验证它是否已修复
7.  **从你的分叉中打开 PR**

这是最好的贡献方式：在进行实际工作时修复 gstack，在您真正感受到痛点的地方进行改进。

### 会话意识

当您同时打开 3 个以上的 gstack 会话时，每个问题都会告诉您哪个项目、哪个分支以及正在发生的情况。不再盯着一个问题思考“等等，这是哪个窗口？”所有技能的格式都是一致的。

## 在 gstack 存储库中处理 gstack

当您正在编辑 gstack 技能并希望通过实际使用 gstack 来测试它们时，在同一个存储库中，`bin/dev-setup` 将其连接起来。它创建 `.claude/skills/` 符号链接（gitignored）指向您的工作树，因此 Claude Code 使用您的本地编辑而不是全局安装。

```
gstack/                          <- your working tree
├── .claude/skills/              <- created by dev-setup (gitignored)
│   ├── gstack -> ../../         <- symlink back to repo root
│   ├── review/                  <- real directory (short name, default)
│   │   └── SKILL.md -> gstack/review/SKILL.md
│   ├── ship/                    <- or gstack-review/, gstack-ship/ if --prefix
│   │   └── SKILL.md -> gstack/ship/SKILL.md
│   └── ...                      <- one directory per skill
├── review/
│   └── SKILL.md                 <- edit this, test with /review
├── ship/
│   └── SKILL.md
├── browse/
│   ├── src/                     <- TypeScript source
│   └── dist/                    <- compiled binary (gitignored)
└── ...
```

安装程序使用 SKILL.md 里面的符号链接在顶层创建真实目录（不是符号链接）。这确保 Claude 将它们发现为顶级技能，而不是嵌套在 `gstack/` 下的技能。名称取决于您的前缀设置 (`~/.gstack/config.yaml`)。短名称（`/review`、`/ship`）是默认值。运行 `./setup --prefix` 如果您更喜欢命名空间名称（`/gstack-review`、`/gstack-ship`）。

## 日常工作流程

```bash
# 1. Enter dev mode
bin/dev-setup

# 2. Edit a skill
vim review/SKILL.md

# 3. Test it in Claude Code — changes are live
#    > /review

# 4. Editing browse source? Rebuild the binary
bun run build

# 5. Done for the day? Tear down
bin/dev-teardown
```

## 测试和评估

### 设置

```bash
# 1. Copy .env.example and add your API key
cp .env.example .env
# Edit .env → set ANTHROPIC_API_KEY=sk-ant-...

# 2. Install deps (if you haven't already)
bun install
```

Bun 自动加载 `.env` — 无需额外配置。 Conductor 工作区自动从主工作树继承 `.env` （请参阅下面的“Conductor 工作区”）。

### 测试等级

| 等级 | 命令 | 成本 | 它测试什么 |
|------|---------|------|---------------|
| 1 — 静态 | `bun test` | 免费 | 命令验证、快照标志、SKILL.md 正确性、TODOS-format.md 参考、可观察性单元测试 |
| 2 — E2E | `bun run test:e2e` | ~$3.85 | 通过 `claude -p` 子进程执行完整技能 |
| 3 — LLM 评估 | `bun run test:evals` | 独立版约 0.15 美元 | LLM 作为评委对生成的 SKILL.md 文档进行评分 |
| 2+3 | `bun run test:evals` | 合计约 4 美元 | E2E + LLM 作为法官（两者均运行） |

```bash
bun test                     # Tier 1 only (runs on every commit, <5s)
bun run test:e2e             # Tier 2: E2E only (needs EVALS=1, can't run inside Claude Code)
bun run test:evals           # Tier 2 + 3 combined (~$4/run)
```

### 第 1 层：静态验证（免费）

使用 `bun test` 自动运行。无需 API 密钥。

- **技能解析器测试** (`test/skill-parser.test.ts`) — 从 SKILL.md bash 代码块中提取每个 `$B` 命令，并根据 `browse/src/commands.ts` 中的命令注册表进行验证。捕获拼写错误、删除的命令和无效的快照标志。
- **技能验证测试** (`test/skill-validation.test.ts`) — 验证 SKILL.md 文件仅引用真实命令和标志，并且命令描述满足质量阈值。
- **生成器测试** (`test/gen-skill-docs.test.ts`) — 测试模板系统：验证占位符正确解析，输出包括标志的值提示（例如 `-d <N>` 不仅仅是 `-d`），丰富关键命令的描述（例如 `is` 列出有效状态，`press` 列出关键示例）。

### 第 2 层：E2E 通过 `claude -p` (~$3.85/run)

使用 `--output-format stream-json --verbose` 生成 `claude -p` 作为子进程，流式传输 NDJSON 以获取实时进度，并扫描浏览错误。这是最接近“这项技能是否真的端到端有效？”的问题。

```bash
# Must run from a plain terminal — can't nest inside Claude Code or Conductor
EVALS=1 bun test test/skill-e2e-*.test.ts
```

- 由 `EVALS=1` 环境变量控制（防止意外的昂贵运行）
- 如果在 Claude Code 内运行则自动跳过（`claude -p` 无法嵌套）
- API 连接预检查 — 在消耗预算之前在 ConnectionRefused 上快速失败
- stderr 的实时进度：`[Ns] turn T tool #C: Name(...)`
- 保存完整的 NDJSON 记录和失败 JSON 以供调试
- 测试位于 `test/skill-e2e-*.test.ts`（按类别划分），运行程序逻辑位于 `test/helpers/session-runner.ts`

### 端到端可观测性

当 E2E 测试运行时，它们会在 `~/.gstack-dev/` 中生成机器可读的工件：

| 人工制品 | 小路 | 目的 |
|----------|------|---------|
| 心跳 | `~/.gstack-dev/evals/{run}/heartbeat.json` | 当前测试状态（每次工具调用更新） |
| 部分结果 | `~/.gstack-dev/evals/{run}/partial-results.jsonl` | 已完成测试（被击杀后幸存） |
| 进度日志 | `~/.gstack-dev/evals/{run}/progress.log` | 仅附加文本日志 |
| NDJSON 转录本 | `~/.gstack-dev/evals/{run}/{test}.ndjson` | 每个测试的原始 `claude -p` 输出 |
| 失败 JSON | `~/.gstack-dev/evals/{run}/{test}.failure.json` | 故障诊断数据 |

**实时仪表板：** 在第二个终端中运行 `bun run eval:watch` 以查看实时仪表板，其中显示已完成的测试、当前正在运行的测试和成本。使用 `--tail` 还可以显示 Progress.log 的最后 10 行。

**评估历史记录工具：**

```bash
bun run eval:list            # list all eval runs (turns, duration, cost per run)
bun run eval:compare         # compare two runs — shows per-test deltas + Takeaway commentary
bun run eval:summary         # aggregate stats + per-test efficiency averages across runs
```

**评估比较评论：** `eval:compare` 生成自然语言总结部分，解释运行之间发生的变化 - 标记回归、注意到改进、提高效率（更少的轮次、更快、更便宜），并生成总体摘要。这是由 `eval-store.ts` 中的 `generateCommentary()` 驱动的。

工件永远不会被清理——它们累积在 `~/.gstack-dev/` 中，用于事后调试和趋势分析。

### 第 3 级：LLM 法官（~$0.15/run）

使用 Claude Sonnet 在三个维度上对生成的 SKILL.md 文档进行评分：

- **清晰度** — AI 代理能否毫无歧义地理解指令？
- **完整性** — 所有命令、标志和使用模式是否都已记录？
- **可操作性** — 代理是否可以仅使用文档中的信息来执行任务？

每个维度评分为 1-5。阈值：每个维度得分**≥ 4**。还有一个回归测试，将生成的文档与 `origin/main` 中手动维护的基线进行比较 - 生成的得分必须等于或更高。

```bash
# Needs ANTHROPIC_API_KEY in .env — included in bun run test:evals
```

- 使用 `claude-sonnet-4-6` 来评估稳定性
- 测试在 `test/skill-llm-eval.test.ts` 中进行
- 直接调用 Anthropic API（不是 `claude -p`），因此它可以在任何地方工作，包括在 Claude Code 内

### CI

GitHub Action (`.github/workflows/skill-docs.yml`) 在每次推送和 PR 时运行 `bun run gen:skill-docs --dry-run`。如果生成的 SKILL.md 文件与提交的文件不同，CI 将失败。这会在合并之前捕获过时的文档。

测试直接针对浏览二进制文件运行 - 它们不需要开发模式。

## 编辑 SKILL.md 文件

SKILL.md 文件是从 `.tmpl` 模板**生成**的。不要直接编辑 `.md` — 您的更改将在下一个版本中被覆盖。

```bash
# 1. Edit the template
vim SKILL.md.tmpl              # or browse/SKILL.md.tmpl

# 2. Regenerate for all hosts
bun run gen:skill-docs --host all

# 3. Check health (reports all hosts)
bun run skill:check

# Or use watch mode — auto-regenerates on save
bun run dev:skill
```

有关模板创作最佳实践（自然语言优于 bash-ism、动态分支检测、`{{BASE_BRANCH_DETECT}}` 使用），请参阅 CLAUDE.md 的“编写 SKILL 模板”部分。

要添加浏览命令，请将其添加到 `browse/src/commands.ts`。要添加快照标志，请将其添加到 `browse/src/snapshot.ts` 中的 `SNAPSHOT_FLAGS` 中。然后重建。

## 行话列表（V1 写作风格）

gstack 的写作风格部分（注入每个 tier-≥2 技能的序言中）在每次技能调用首次使用时对技术术语进行注释。有资格在 `scripts/jargon-list.json` 中为生活增光添彩的术语列表 — ~50 个策划的高频术语（幂等、竞争条件、N+1、背压等）。列表中未列出的术语被认为是足够简单的英语。

**添加或删除术语：** 打开 PR 编辑 `scripts/jargon-list.json`。编辑后运行 `bun run gen:skill-docs` — 术语被烘焙到每个在 gen 时生成的 SKILL.md 中，因此更改仅在重新生成后生效。无运行时加载；没有用户端覆盖。回购清单是事实的来源。

添加的良好候选者：非技术用户在没有上下文的审阅输出中遇到的高频术语（通用数据库/并发术语、安全术语、前端框架概念）。不要添加只出现在一两个利基技能中的术语——成本价值交易不值得审查开销。

## 多主机开发

gstack 从一组 `.tmpl` 模板为 8 个主机生成 SKILL.md 文件。每个主机都是 `hosts/*.ts` 中的类型化配置。生成器读取这些配置产生适合主机的输出（不同的 frontmatter、路径、工具名称）。

**支持的主机：** Claude（主要）、Codex、Factory、Kiro、OpenCode、Slate、Cursor、OpenClaw。

### 为所有主机生成

```bash
# Generate for a specific host
bun run gen:skill-docs                    # Claude (default)
bun run gen:skill-docs --host codex       # Codex
bun run gen:skill-docs --host opencode    # OpenCode
bun run gen:skill-docs --host all         # All 8 hosts

# Or use build, which does all hosts + compiles binaries
bun run build
```

### 主机之间有什么变化

每个主机配置 (`hosts/*.ts`) 控制：

| 方面 | 示例（Claude 与 Codex） |
|--------|---------------------------|
| 输出目录 | `{skill}/SKILL.md` 与 `.agents/skills/gstack-{skill}/SKILL.md` |
| 前题 | 完整（名称、描述、挂钩、版本）与最小（名称+描述） |
| 路径 | `~/.claude/skills/gstack` 与 `$GSTACK_ROOT` |
| 工具名称 | “使用 Bash 工具”与相同（工厂重写为“运行此命令”） |
| 勾拳技巧 | `hooks:` frontmatter 与内联安全咨询散文 |
| 抑制部分 | None 与 Codex 自调用部分被剥离 |

请参阅 `scripts/host-config.ts` 了解完整的 `HostConfig` 接口。

### 测试主机输出

```bash
# Run all static tests (includes parameterized smoke tests for all hosts)
bun test

# Check freshness for all hosts
bun run gen:skill-docs --host all --dry-run

# Health dashboard covers all hosts
bun run skill:check
```

### 添加新主机

请参阅 [docs/ADDING_A_HOST.md](docs/ADDING_A_HOST.md) 获取完整指南。简短版本：

1.  创建 `hosts/myhost.ts` （从 `hosts/opencode.ts` 复制）
2.  添加到 `hosts/index.ts`
3.  将 `.myhost/` 添加到 `.gitignore`
4.  运行 `bun run gen:skill-docs --host myhost`
5.  运行 `bun test` （参数化测试自动覆盖它）

需要对生成器、设置或工具代码进行零更改。

### 添加新技能

当您添加新的技能模板时，所有主机都会自动获取它：
1.  创建 `{skill}/SKILL.md.tmpl`
2.  运行 `bun run gen:skill-docs --host all`
3.  动态模板发现将其拾取，无需更新静态列表
4.  提交 `{skill}/SKILL.md`，外部主机输出在设置时生成并被 gitignored

## Conductor 工作空间

如果您使用 [Conductor](https://conductor.build) 并行运行多个 Claude Code 会话，`conductor.json` 会自动连接工作区生命周期：

| 钩子 | 脚本 | 它的作用 |
|------|--------|-------------|
| `post-create` | `bin/dev-setup` | 从主工作树复制 `.env`，安装 deps，符号链接技能 |
| `pre-destroy` | `bin/dev-teardown` | 删除技能符号链接，清理 `.claude/` 目录 |

当 Conductor 创建新工作区时，`bin/dev-setup` 会自动运行。它检测主工作树（通过 `git worktree list`），复制您的 `.env` 以便 API 密钥可以保留，并设置开发模式 - 无需手动步骤。

**首次设置：** 将您的 `ANTHROPIC_API_KEY` 放入主存储库的 `.env` 中（请参阅 `.env.example`）。每个 Conductor 工作区都会自动继承它。

## 要知道的事情

- **生成 SKILL.md 文件。** 编辑 `.tmpl` 模板，而不是 `.md`。运行 `bun run gen:skill-docs` 重新生成。
- **TODOS.md 是统一的积压工作。** 由 Skill/component 组织，优先级为 P0-P4。 `/ship` 自动检测已完成的项目。所有规划/review/retro 技能都需要阅读它以了解上下文。
- **浏览源更改需要重建。** 如果您触摸 `browse/src/*.ts`，请运行 `bun run build`。
- **开发模式会影响您的全局安装。** 项目本地技能优先于 `~/.claude/skills/gstack`。 `bin/dev-teardown` 恢复全局代码。
- **Conductor 工作区是独立的。** 每个工作区都是它自己的 git 工作树。 `bin/dev-setup` 通过 `conductor.json` 自动运行。
- **`.env` 跨工作树传播。** 在主存储库中设置一次，所有 Conductor 工作区都会获取它。
- **`.claude/skills/` 被 gitignored。** 符号链接永远不会被提交。

## 在真实项目中测试您的更改

**这是开发 gstack 的推荐方法。** 符号链接您的 gstack checkout 到您实际使用它的项目中，因此您的更改在您使用时是实时的，做实事。

### 第 1 步：为您的结帐添加符号链接

```bash
# In your core project (not the gstack repo)
ln -sfn /path/to/your/gstack-checkout .claude/skills/gstack
```

### 第 2 步：运行安装程序以创建每个技能的符号链接

仅 `gstack` 符号链接是不够的。Claude Code 通过各个顶级目录（`qa/SKILL.md`、`ship/SKILL.md` 等）发现技能，而不是通过 `gstack/` 目录本身。运行 `./setup` 来创建它们：

```bash
cd .claude/skills/gstack && bun install && bun run build && ./setup
```

安装程序将询问您是否需要短名称 (`/qa`) 还是命名空间 (`/gstack-qa`)。您的选择将保存到 `~/.gstack/config.yaml` 并记住以供将来运行。要跳过提示，请传递 `--no-prefix` （短名称）或 `--prefix` （命名空间）。

### 第三步：开发

编辑模板，运行 `bun run gen:skill-docs`，然后运行下一个 `/review` 或 `/qa` 电话立即接听。无需重新启动。

### 返回稳定的全局安装

删除项目本地符号链接。Claude Code 退回到 `~/.claude/skills/gstack/`：

```bash
rm .claude/skills/gstack
```

每个技能目录（`qa/`、`ship/` 等）包含指向 `gstack/...` 的 SKILL.md 符号链接，这样它们就会自动解析为全局安装。

### 切换前缀模式

如果您使用一个前缀设置安装了 gstack 并且想要切换：

```bash
cd .claude/skills/gstack && ./setup --no-prefix   # switch to /qa, /ship
cd .claude/skills/gstack && ./setup --prefix       # switch to /gstack-qa, /gstack-ship
```

安装程序会自动清除旧的符号链接。无需手动清理。

### 替代方案：将全局安装指向一个分支

如果您不需要每个项目的符号链接，您可以切换全局安装：

```bash
cd ~/.claude/skills/gstack
git fetch origin
git checkout origin/<branch>
bun install && bun run build && ./setup
```

这会影响所有项目。恢复：`git checkout main && git pull && bun run build && ./setup`。

## 社区 PR 分类（波过程）

当社区 PR 积累时，将它们分批分成主题波：

1.  **分类** — 按主题分组（安全、功能、基础设施、文档）
2.  **重复数据删除** — 如果两个 PR 修复了同一问题，请选择其中一个改变更少的行。关闭另一个，并附上一张指向获胜者的便条。
3.  **收集器分支** — 创建 `pr-wave-N`，合并干净的 PR，解析脏的冲突，用 `bun test && bun run build` 验证
4.  **关闭上下文** - 每个关闭的 PR 都会得到一条解释的评论，说明为什么以及什么（如果有的话）取代它。贡献者做了真正的工作；通过清晰的沟通来尊重这一点。5. **作为单个PR发布** — 提交单个PR到主项目，并在合并提交中保留所有属性。包括合并内容和关闭内容的汇总表。

请参阅 [PR #205](../../pull/205) (v0.8.3) 作为第一波的示例。

## 升级迁移

当版本更改磁盘状态（目录结构、配置格式、陈旧文件）以 `./setup` 无法单独修复的方式时，需添加一个迁移脚本，以便现有用户获得干净的升级。

### 何时添加迁移

- 更改了技能目录的创建方式（符号链接与真实目录）
- 重命名或移动了 `~/.gstack/config.yaml` 中的配置键
- 需要删除旧版本中的孤立文件
- 更改了 `~/.gstack/` 状态文件的格式

不要为以下情况添加迁移：新功能（用户自动获取）、新技能（安装程序会发现它们），或仅代码更改（无磁盘状态变更）。

### 如何添加迁移

1. 创建 `gstack-upgrade/migrations/v{VERSION}.sh`，其中 `{VERSION}` 匹配需要修复的版本的 VERSION 文件。
2. 使其可执行：`chmod +x gstack-upgrade/migrations/v{VERSION}.sh`
3. 该脚本必须是**幂等**（可安全运行多次）且**非致命**（记录失败但不阻止升级）。
4. 在顶部添加一个注释块，解释变更内容、为何需要迁移以及受影响的用户。

示例：

```bash
#!/usr/bin/env bash
# Migration: v0.15.2.0 — Fix skill directory structure
# Affected: users who installed with --no-prefix before v0.15.2.0
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
"$SCRIPT_DIR/bin/gstack-relink" 2>/dev/null || true
```

### 运行机制

在 `/gstack-upgrade` 过程中，`./setup` 完成后（步骤 4.75），升级过程会扫描 `gstack-upgrade/migrations/` 并运行每个 `v*.sh` 脚本，其版本比用户的旧版本新。脚本按版本顺序运行。失败会被记录，但不会阻止升级。

### 测试迁移

迁移作为 `bun test` 的一部分进行测试（第 1 层，免费）。测试套件会验证 `gstack-upgrade/migrations/` 中的所有迁移脚本是否可执行、可解析且无语法错误。

## 发送您的更改

当您对技能编辑感到满意时：

```bash
/ship
```

这将运行测试、审查差异、分类 Greptile 注释（具有 2 层升级）、管理 TODOS.md、更新版本并打开 PR。请参阅 `ship/SKILL.md` 了解完整的工作流程。