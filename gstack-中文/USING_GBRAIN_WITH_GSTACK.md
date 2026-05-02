# 将 GBrain 与 GStack 结合使用

您的编码代理，具有实际保留的记忆。

[GBrain](https://github.com/garrytan/gbrain) 是专为 AI 代理设计的持久知识库。它存储您的代理学到的内容、您已决定的内容、有效的内容和无效的内容，并让代理根据需要搜索所有内容。 GStack 为您提供了一条从零到“gbrain 正在运行，我的代理可以调用​​它”的单命令路径，其中包含用于本地尝试、与团队共享以及介于两者之间的所有路径。

这是完整的内容：每个场景、每个标志、每个帮助程序箱、每个故障排除步骤。如需快速介绍，请参阅[README's GBrain section](README.md#gbrain--persistent-knowledge-for-your-coding-agent)。有关错误代码和特定于同步的问题，请参阅[docs/gbrain-sync.md](docs/gbrain-sync.md)。

---

## 一命令安装

```bash
/setup-gbrain
```

就是这样。该技能会检测您当前的状态，最多询问三个问题，并引导您完成安装、初始化、Claude Code 的 MCP 注册以及每个存储库的信任策略。在没有安装任何东西的干净 Mac 上，它会在五分钟内完成。在已经设置了某些内容的 Mac 上，需要几秒钟的时间（它会检测现有状态并跳过已完成的工作）。

## 三个路径

当技能询问“你的大脑应该住在哪里？”时，你选择一个。

### 路径1：Supabase，你已经有了一个连接字符串

最适合：您（或队友的云代理）已经配置了 Supabase 大脑，并且您希望该本地计算机使用相同的数据。

**会发生什么：** 粘贴会话池 URL（设置 → 数据库 → 连接池 → 会话 → 复制 URI，端口 6543）。该技能在回显关闭的情况下读取它，向您显示经过编辑的预览（`aws-0-us-east-1.pooler.supabase.com:6543/postgres` - 主机可见，密码屏蔽），通过 `GBRAIN_DATABASE_URL` 环境变量将其传递给 `gbrain init`，并且 URL 永远不会写入 argv 或您的 shell 历史记录。

**信任警告：** 粘贴此 URL 可以让您本地的 Claude 代码对共享大脑中的每个页面具有完整的 read/write 访问权限。如果这不是您想要的信任级别，请选择 PGLite local（路径 3）并接受大脑是脱节的。

### 路径 2a：Supabase，自动配置新项目

最适合：新的 Supabase 帐户，您想要一个零点击的全新项目。

**会发生什么：** 您粘贴 Supabase 个人访问令牌 (PAT)。该技能首先向您展示范围披露 - *令牌授予您 Supabase 帐户中每个项目的完全访问权限，而不仅仅是我们即将创建的项目*。它列出您的组织，询问哪个组织和哪个区域（默认 `us-east-1`），生成数据库密码，调用 `POST /v1/projects`，每 5 秒轮询 `GET /v1/projects/{ref}` 直到项目为 `ACTIVE_HEALTHY`（180 秒超时），获取池化器 URL，将其交给 `gbrain init`。端到端：约 90 秒。

最后：明确提醒撤销 PAT：https://CMD_0__.com/dashboard/account/tokens。该技能已经将其从记忆中丢弃了。

**如果您在配置中按 Ctrl-C：** SIGINT 陷阱会打印您的正在进行的项目引用 + 恢复命令。您可以在 Supabase 仪表板中删除孤立项，或运行 `/setup-gbrain --resume-provision <ref>` 以从上次中断的位置继续。

### 路径2b：Supabase，手动创建

最适合：您宁愿自己点击supabase.com，也不愿粘贴PAT。

**发生了什么：** 该技能将引导您完成四个手动步骤（注册 → 新项目 → 等待约 2 分钟 → 复制会话池 URL），然后接管路径 1 的粘贴步骤。与路径 1 相同的安全处理。

### 路径3：PGLite本地

最适合：先尝试，无需帐户，无需云，无需共享。或者是一个专用的“Mac 大脑”，与任何云代理保持隔离。

**发生了什么：** `gbrain init --pglite`。 Brain 位于 `~/.gbrain/brain.pglite`。没有网络通话。 30 秒内完成。

如果您只是想在转向云之前看看 gbrain 的感觉，那么这是最好的首选。您以后随时可以使用 `/setup-gbrain --switch` 进行迁移。

## Claude Code 的 MCP 注册

默认情况下，该技能会询问“为 Claude Code 提供 gbrain 的类型化工具界面吗？”如果你说是，它就会运行：

```bash
claude mcp add gbrain -- gbrain serve
```

这会向 Claude Code 注册 gbrain 的 stdio MCP 服务器。现在 `gbrain search`、`gbrain put_page`、`gbrain get_page` 等在每个会话中都显示为一流工具，而不是 bash shell-outs。

**如果 `claude` 不在 PATH 上**，该技能会通过手动注册提示优雅地跳过 MCP 注册。 CLI 解析器仍然适用于任何支持 `gbrain` 的技能 — MCP 是升级，而不是先决条件。

**其他本地代理**（Cursor、Codex CLI 等）需要自己的 MCP 注册。该技能以 Claude-Code 为目标，适用于 v1；其他主机可以在自己的 MCP 配置中手动注册 `gbrain serve`。

## 每个远程的信任策略（三元组）

您计算机上的每个存储库都会获得一个策略决策：**读写**、**只读**或**拒绝**。

- **读写** - 您的代理可以从该存储库的上下文中`gbrain search`并将新页面写回大脑。默认为您自己的项目。
- **只读** - 您的代理可以搜索大脑，但永远不会从此存储库的会话中写入新页面。多客户顾问的理想之选：搜索共享大脑，当您在客户 B 的存储库中时，不要用客户 A 的代码污染它。
- **否认** — 根本没有 gbrain 交互。该存储库对于 gbrain 工具是不可见的。

当您第一次在每个存储库运行 gstack 技能时，该技能会询问一次。之后的决定是粘性的——同一个 git 远程的每个工作树+分支都共享相同的策略，所以你设置一次，它就会跟随你。

SSH 和 HTTPS 远程变体折叠为相同的密钥：`https://github.com/foo/bar.git` 和 `git@github.com:foo/bar.git` 是相同的存储库。

**更改政策：**

```bash
/setup-gbrain --repo      # re-prompt for this repo only

# Or directly:
~/.claude/skills/gstack/bin/gstack-gbrain-repo-policy set "github.com/foo/bar" read-only
```

**查看每项政策：**

```bash
~/.claude/skills/gstack/bin/gstack-gbrain-repo-policy list
```

存储：`~/.gstack/gbrain-repo-policy.json`，模式 0600，模式版本控制，因此未来的迁移保持确定性。

## 稍后切换引擎

选择了 PGLite，现在想加入团队大脑？一条命令：

```bash
/setup-gbrain --switch
```

该技能运行包裹在 `timeout 180s` 中的 `gbrain migrate --to supabase --url "$URL"`。迁移是双向的（Supabase → PGLite 也可以）且无损 — 页面、块、嵌入、链接、标签和时间线全部复制。你原来的大脑会被保留下来作为备份。

**如果迁移挂起：**另一个 gstack 会话可能正在锁定源大脑。超时将在 3 分钟后触发，并显示一条可操作的消息。关闭其他工作区并重新运行。

## GStack 内存同步（单独关注）

这与 gbrain 本身不同。默认情况下，您的 gstack 状态（`~/.gstack/` — 学习、计划、回顾、时间线、开发人员配置文件）是机器本地的。 “GStack 内存同步”可以选择将一个精心策划的、秘密扫描的子集推送到私有 git 存储库，这样你的内存就可以跨机器跟踪你——而且，如果你正在运行 gbrain，该 git 存储库也可以在那里进行索引。

打开它：

```bash
gstack-brain-init
```

您将收到一次性隐私提示：**列入白名单的所有内容**/**仅限工件**（计划、设计、回顾、学习 - 跳过时间线等行为数据）/**关闭**。每个技能运行都会在开始和结束时同步队列 - 无守护程序，无后台进程。

秘密形状的内容（AWS 密钥、GitHub 令牌、PEM 块、JWT、不记名令牌）在离开您的计算机之前会被阻止同步。

**在新机器上：**复制 `~/.gstack-brain-remote.txt` ，运行 `gstack-brain-restore` ，昨天的学习内容就会在今天的笔记本电脑上显现出来。

完整指南：[docs/gbrain-sync.md](docs/gbrain-sync.md)。错误索引：[docs/gbrain-sync-errors.md](docs/gbrain-sync-errors.md)。

`/setup-gbrain` 提供在初始设置结束时为您连接的功能 - 这是又一个 AskUserQuestion，并且它与相同的私有存储库基础设施集成。

## 清理孤儿项目

如果您在配置中按 Ctrl-C，在选择一个名称之前尝试了三个不同的名称，或者积累了您不使用的 gbrain 型 Supabase 项目，则可以使用一个子命令：

```bash
/setup-gbrain --cleanup-orphans
```

该技能重新收集 PAT（一次性，之后丢弃），列出您的 Supabase 帐户中名称以 `gbrain` 开头且其引用与您的活动 `~/.gbrain/config.json` 矿池 URL 不匹配的每个项目。对于每个孤儿项目，它会询问每个项目：*“删除孤儿项目 `<ref>`（`<name>`，创建 `<date>`）？”* - 没有批处理，没有“删除全部”快捷方式。活跃的大脑永远不会被删除。

## 命令+标志参考

### `/setup-gbrain` 输入模式

|祈求|它的作用|
|---|---|
|__代码_0__|完整流程：检测状态、选择路径、安装、初始化、MCP、策略、可选内存同步|
|__代码_0__|仅翻转当前存储库的每个远程信任策略|
|__代码_0__|迁移引擎 (PGLite ↔ Supabase)，无需重新运行其他步骤|
|__代码_0__|恢复轮询期间中断的路径 2a 自动配置|
|__代码_0__|孤立 Supabase 项目的列表+按项目删除|

### Bin 助手（用于脚本编写）

|垃圾桶|目的|
|---|---|
|__代码_0__|以 JSON 形式发出当前状态：gbrain on PATH、版本、配置引擎、医生状态、同步模式|
|__代码_0__|首先检测安装程序（探测 `~/git/gbrain`、`~/gbrain`，然后探测新克隆）。具有 `--dry-run` 和 `--validate-only` 标志。 PATH-shadow 检查退出 3 并带有修复菜单。|
|__代码_0__|源自，而非执行。提供 `read_secret_to_env VARNAME "prompt" [--echo-redacted "<sed-expr>"]`|
|__代码_0__|结构 URL 检查。使用退出 3 拒绝直接连接 URL (`db.*.supabase.co:5432`)|
|__代码_0__|管理 API 包装器。子命令：`list-orgs`、`create`、`wait`、`pooler-url`、`list-orphans`、`delete-project`。全部都需要环境中的 `SUPABASE_ACCESS_TOKEN` 。 `create` 和 `pooler-url` 还需要 `DB_PASS`。每个子命令都可以使用 `--json` 模式。|
|__代码_0__|每个远程信任三元组。子命令：`get`、`set`、`list`、`normalize`|
|__代码_0__|通过 `gbrain sources add` + `git worktree` 将您的 `~/.gstack/` Brain 存储库注册到 gbrain 作为联合源，然后运行初始 `gbrain sync`。幂等。替换 v1.12.x 中失效的 `consumers.json + /ingest-repo` HTTP 连接。标志：`--strict`、`--source-id <id>`、`--no-pull`、`--uninstall`、`--probe`。|

### gbrain CLI（上游工具）

Gbrain 本身附带了 gstack 包装的这些内容：

|命令|目的|
|---|---|
|__代码_0__|初始化本地 PGLite 大脑|
|__代码_0__|通过 env（`GBRAIN_DATABASE_URL` 或 `DATABASE_URL`）初始化。切勿将 URL 作为 argv 传递 — 它会泄漏到 shell 历史记录中。|
|__代码_0__|健康检查。返回`{状态：“确定”|“警告”|“错误”，health_score：0-100，检查：[...]}`|
|__代码_0__|将 PGLite 大脑移至 Supabase（无损，保留源作为备份）|
|__代码_0__|逆向迁移|
|__代码_0__|搜索大脑|
|__代码_0__|写一页|
|__代码_0__|获取页面|
|__代码_0__|启动 MCP stdio 服务器（由 `claude mcp add` 使用）|

### 配置文件+状态

|小路|那里住着什么|
|---|---|
|__代码_0__|引擎 (pglite/postgres)、数据库 URL 或路径、API 密钥。模式 0600。由 `gbrain init` 编写。|
|__代码_0__|每个远程信任三元组。架构 v2。模式0600。|
|__代码_0__|并发运行锁（原子 mkdir）。在正常退出 + SIGINT 时释放。|
|__代码_0__|gstack 内存同步的待处理同步条目|
|__代码_0__|上次同步推送的时间戳（用于 `/health` 评分）|
|__代码_0__|gstack 内存同步远程的 URL（可以在机器之间安全复制）|
|__代码_0__|为未来 `--resume-provision` 持久状态保留|

### 环境变量

|我们的|读到的地方|它的作用|
|---|---|---|
|__代码_0__|__代码_0__|用于管理 API 调用的 PAT。每次安装运行后丢弃。|
|__代码_0__|`gstack-gbrain-supabase-provision`（创建，池化 URL）|生成的数据库密码。从来没有在argv中。|
|__代码_0__|`gbrain init`、`gbrain doctor` 等|Postgres 连接字符串（我们的 Supabase 池化器 URL）。 Env 优先于 `~/.gbrain/config.json`。|
|__代码_0__|`gbrain init`（后备）|与 `GBRAIN_DATABASE_URL` 语义相同；第二次检查。|
|__代码_0__|__代码_0__|覆盖管理 API 主机。由测试用来指向模拟服务器。|
|__代码_0__|__代码_0__|覆盖默认安装路径 (`~/gbrain`)|
|__代码_0__|每个垃圾箱助手|覆盖 `~/.gstack` 状态目录。重度测试使用。|

## 安全模型

此技能涉及的每个秘密都有一条规则：**仅 env var，从不 argv，从不记录，从不由我们写入磁盘。**唯一的持久存储是 gbrain 自己的 `~/.gbrain/config.json` 在模式 0600，这是 gbrain 的规则，而不是我们的规则。

**在代码中强制执行：**

- 如果 `$SUPABASE_ACCESS_TOKEN` 或 `$GBRAIN_DATABASE_URL` 出现在 argv 位置，则 `test/skill-validation.test.ts` 中的 CI grep 测试将导致构建失败
- 如果 `--insecure`、`-k` 或 `NODE_TLS_REJECT_UNAUTHORIZED=0` 出现在 `bin/gstack-gbrain-supabase-provision` 中，则 CI grep 测试失败
- 提供帮助程序顶部的 `set +x` 可防止调试跟踪泄漏 PAT
- 遥测有效负载仅包含枚举的分类值（场景、安装结果、MCP 选择加入、信任层）——绝不可能包含秘密的自由格式字符串

**通过测试强制执行：**

- `test/secret-sink-harness.test.ts` 使用种子秘密运行每个秘密处理 bin，并断言种子永远不会出现在任何捕获的通道中（stdout、stderr、`$HOME` 下的文件、遥测 JSONL）。每个种子有四个匹配规则：精确、URL 解码、第一个 12 字符前缀、base64。
- 同一测试文件中的阳性对照故意在每个被覆盖的通道中泄漏种子，并断言安全带捕获了每个种子。如果没有积极的控制，默默地低报告的线束看起来与工作线束完全相同。

**你仍然可以泄漏什么**（v1 的诚实限制）：

- 如果您将秘密粘贴到 `read -s` 之外的普通聊天消息中，则它位于对话记录和任何主机端日志记录中
- 泄漏工具不会转储子进程环境 - `env >> ~/.log` 会逃避检测的 bin（v1 中没有 bin 会这样做；grep 测试会阻止它）
- 你的 shell 自己的 `HISTFILE` 行为是你的 shell 的，而不是我们的 - 我们从不将秘密传递给 argv，因此它们不会通过我们的代码到达那里，但没有什么可以阻止你自己将其粘贴到原始 `curl` 命令中

## 故障排除

### 安装期间“检测到路径阴影”

另一个 `gbrain` 二进制文件在 PATH 中的位置早于安装程序刚刚链接的二进制文件。安装程序的版本检查发现了它。修复以下之一：

- `rm $(which gbrain)` 如果您不需要另一个
- 将 `~/.bun/bin` 添加到 shell rc 中的 PATH 之前，以便链接的二进制文件获胜
- 将 `GBRAIN_INSTALL_DIR` 设置为影子二进制文件的安装目录并重新运行

然后重新运行`/setup-gbrain`。

### “拒绝直接连接 URL”

您粘贴了 `db.<ref>.supabase.co:5432` URL。这些仅适用于 IPv6，并且在大多数环境中都会失败。请改用会话池 URL：Supabase 仪表板 → 设置 → 数据库 → 连接池 → **会话** → 复制 URI（端口 6543）。

### 自动配置在 180 秒超时

Supabase 项目仍在初始化中。您的参考号已打印在退出消息中。等一下，然后：

```bash
/setup-gbrain --resume-provision <ref>
```

该技能重新收集 PAT、跳过项目创建、恢复轮询。

### “另一个 `/setup-gbrain` 实例正在运行”

您有一个过时的锁定目录。如果您确定没有其他实例实际在运行：

```bash
rm -rf ~/.gstack/.setup-gbrain.lock.d
```

然后重新运行。

### 政策文件中“没有跨模式紧张”

您使用旧的 `allow` 值手动编辑了 `~/.gstack/gbrain-repo-policy.json` 吗？没问题。在下一次读取时，gstack 会自动迁移 `allow` → `read-write` 并添加 `_schema_version: 2`。 stderr 上的一行日志，幂等的，确定性的。

### `gbrain doctor` 表示“警告”

`/health` 将其视为黄色，而不是红色。检查`gbrain doctor --json|jq .checks` 查看哪些子检查发出警告。典型原因：解析器 MECE 重叠（技能名称冲突）或尚未配置数据库连接。

### 切换 PGLite → Supabase 挂起

同级 Conductor 工作区中的另一个 gstack 会话可能通过其前导码的 `gstack-brain-sync` 调用来锁定本地 PGLite 文件。关闭其他工作区，重新运行 `/setup-gbrain --switch`。超时限制为 180 秒，因此您永远不会永远等待。

## 为什么这样设计

**为什么每个远程信任三元组而不是二进制允许/deny？** 多客户端顾问需要搜索而无需回写。早上为客户端 A 工作，下午为客户端 B 工作的自由开发人员不能让 A 的代码见解泄漏到客户端 B 可以搜索的大脑中。只读干净地解决了这个问题。

**为什么不将 gbrain 捆绑到 gstack 中？** Gbrain 是一个独立的、积极开发的项目，拥有自己的发布节奏、模式迁移和 MCP 界面。捆绑意味着 gstack 必须控制 gbrain 更新，这会减慢 gbrain 改进到达用户的速度。分离但集成的方式让每艘船都有自己的节奏。

**为什么 `gbrain init --non-interactive` 通过环境变量而不是标志？** 连接字符串包含数据库密码。将它们作为 argv 传递会将密码放入 `ps`、shell 历史记录和进程列表中。环境变量切换仅在进程内存中保留秘密。 Gbrain 同时支持 `GBRAIN_DATABASE_URL` 和 `DATABASE_URL`；我们使用前者来避免与非 gbrain 工具发生冲突。

**为什么要在 PATH 阴影上进行失败而不是警告并继续？** 阴影 `gbrain` 意味着每个后续命令都调用与我们刚刚安装的二进制文件不同的二进制文件。这是一个无声的版本漂移错误，几周后就会以神秘的功能差距的形式出现。设置技能只有一项工作——设置工作环境。拒绝安装到损坏的设备上是一种安装技巧正确的行为。

**为什么不自动导入每个存储库？** 隐私+噪音。一个自动导入的前导钩子会摄取您接触的每个存储库，这会：(a) 在未经同意的情况下将工作代码泄漏到共享大脑中，以及 (b) 使用一次性存储库阻碍搜索。每个远程策略使摄取成为一个明确的、每个存储库的决策。 `/setup-gbrain` 今天没有安装任何自动导入挂钩 - 但策略存储对于以后的情况是向前兼容的。

## 相关技能+后续步骤

- `/health` — 在其 0-10 综合分数中包括 GBrain 维度（医生状态、同步队列深度、最后推送年龄）。未安装gbrain时省略尺寸；在非 gbrain 机器上运行 `/health` 不会影响该选择。
- `/gstack-upgrade` — 使 gstack 本身保持最新。不独立升级 gbrain。要碰撞 gbrain，请更新 `bin/gstack-gbrain-install` 中的 `PINNED_COMMIT` 并重新运行 `/setup-gbrain`。
- `/retro` — 当内存同步开启时，每周回顾会从您的 gbrain 中提取学习内容和计划，让回顾参考跨机器历史。

运行 `/setup-gbrain` 看看有什么问题。
