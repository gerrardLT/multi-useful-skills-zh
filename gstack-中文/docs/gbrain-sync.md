# 通过 GBrain Sync 实现跨设备记忆

`gstack` 会把很多有价值的状态写入 `~/.gstack/`，例如经验记录、复盘、CEO 规划、设计文档和开发者画像。默认情况下，这些内容一旦你换了电脑，就跟着丢了。 **GBrain sync** 会把其中经过筛选的一部分同步到一个私有 Git 仓库里，让这些“记忆”可以跨设备延续，并且能被 GBrain 建立索引。

## 你能获得什么

- 在 A 机器上开始的工作，可以无缝接到 B 机器上继续。
- 你的经验、计划和设计内容可以在 GBrain 中被看到和检索（如果你在使用它）。
- 有一个干净的退出方式：`gstack-brain-uninstall`，不会动你的数据。
- 不需要常驻进程，不需要系统服务，也没有后台守护程序。

## 哪些内容不会离开你的机器

即使开启同步，下面这些内容依然会留在本地：

- 凭据类信息：`.auth.json`、`auth-token.json`、`sidebar-sessions/`、`security/device-salt`，以及 `config.yaml` 里的 consumer token
- 与机器绑定的状态：Chromium 配置、ONNX 模型权重、缓存、eval-cache、CDP-profile、一次性提示标记（如 `.welcome-seen`、`.telemetry-prompted`、`.vendoring-warned-*` 等）
- 提问偏好：每台机器自己的 UX 偏好（`question-preferences.json`、`question-log.jsonl`、`question-events.jsonl`）

准确的允许列表保存在 `~/.gstack/.brain-allowlist`。 CLI 会管理这份列表；如果你想追加自己的规则，可以在标记线之后手动添加。

## 首次设置（30 到 60 秒）

```bash
gstack-brain-init
```

这个命令会：

1. 把 `~/.gstack/` 初始化成一个 Git 仓库。
2. 询问远程仓库地址，默认是 `gh repo create --private gstack-brain-$USER`。任何 Git 远程都可以，GitHub、GitLab、Gitea 或自托管都行。
3. 推送一个仅包含基础配置的初始提交。
4. 写入 `~/.gstack-brain-remote.txt`，里面只有 URL，不含密钥，因此可以安全复制到另一台机器。
5. 把 gstack-brain 仓库接到你本地的 gbrain 里，作为一个联合数据源（通过 `gbrain sources add` + `git worktree`），这样 `gbrain search` 就能索引已同步的经验、计划和设计。具体实现位于 `bin/gstack-gbrain-source-wireup`。旧的 `gstack-brain-reader add --ingest-url ...` HTTP 路径已在 v1.15.1.0 移除，因为它依赖的 `/ingest-repo` 接口从未在 gbrain 中落地。

初始化完成后，**你下一次运行技能时**，系统会就隐私模式问你一个问题：

- **Everything allowlisted（推荐）**：同步经验、评审、计划、设计、复盘、时间线和开发者画像。
- **Only artifacts**：只同步计划、设计、复盘和经验，不同步行为数据（如时间线和开发者画像）。
- **Decline**：全部保留在本地。后续你也可以通过 `gstack-config set gbrain_sync_mode full` 再开启同步。

你的选择会被持久化保存，之后不会重复询问。

## 跨设备使用流程

在机器 A 上：只需要运行一次 `gstack-brain-init`。之后每次技能调用，都会在开始和结束时顺手清空同步队列，网络停顿通常约为每次技能 200 到 400 毫秒。

在机器 B 上：

1. 把机器 A 的 `~/.gstack-brain-remote.txt` 复制到机器 B。
你可以放到密码管理器、dotfile 仓库，或者用 U 盘，方式随你。
2. 运行任意一个 gstack 技能。前导逻辑会检测到这个 URL 文件，并打印：
   ```
   BRAIN_SYNC: brain repo detected: <url>
   BRAIN_SYNC: run 'gstack-brain-restore' to pull your cross-machine memory
   ```
3. 运行 `gstack-brain-restore`。这个命令会克隆仓库，恢复你的经验、计划和复盘内容，并重新注册 Git 的 merge driver。
4. 重新输入 consumer token。
这些 token 是机器本地数据，不会同步：`gstack-config set gbrain_token <your-token>`。
5. 下一次运行技能时，你昨天在机器 A 上留下的经验就会浮现出来。这就是那个“魔法时刻”。

## 状态、健康度与队列深度

```bash
gstack-brain-sync --status
```

它会显示：最近一次成功推送时间、待同步队列深度、任何同步阻塞信息，以及当前隐私模式。

每次技能执行时，前导输出靠前的位置都会打印一行 `BRAIN_SYNC:`。看到异常时，先看这行。

## 隐私模式详解

| 模式 | 同步内容 |
|------|----------|
|__代码_0__| 不同步任何内容（默认）。 |
|__代码_0__| 同步计划、设计、复盘、经验和评审；跳过时间线与开发者画像。 |
|__代码_0__| 同步允许列表中的全部内容，包括行为状态。 |

你可以随时修改：

```bash
gstack-config set gbrain_sync_mode full
gstack-config set gbrain_sync_mode off
```

## 密钥保护

每一次提交在离开本机之前，都会先扫描是否包含像凭据一样的内容。被拦截的模式包括：

- AWS 访问密钥（`AKIA...`）
- GitHub 代币（`ghp_`、`gho_`、`ghu_`、`ghs_`、`ghr_`、`github_pat_`）
- OpenAI密钥（`sk-...`）
- PEM 块（`-----BEGIN ...----`）
- 智威汤逊（`eyJ...`）
- JSON 中的 Bearer token（如 `"authorization": "..."`、`"api_key": "..."` 等）

如果命中扫描规则，同步会停止，队列会被保留，同时你的前导输出会打印：

```text
BRAIN_SYNC: blocked: <pattern-family>:<snippet>
```

处理方式如下：

1. 检查触发问题的文件。
2. 如果这是误报，而且你确实想同步这份内容，可以运行 `gstack-brain-sync --skip-file <path>`，把该路径永久排除。
3. 否则，编辑文件移除敏感信息，然后重新运行任意技能。

另外还有一道纵深防御：`~/.gstack/.git/hooks/pre-commit` 中的 hook 会在你手动执行 `git commit` 时运行同样的扫描。

## 双机冲突

如果你在同一天同时使用机器 A 和机器 B，两边都会追加提交。默认 Git 很容易在文件尾部产生冲突，但这里对 `.jsonl` 和 Markdown 文件做了定制 merge driver：

- JSONL 文件使用排序并去重的合并驱动，按 ISO 时间戳排序；如果拿不到时间戳，就退回到每行内容的 SHA-256 哈希，保证结果稳定。
- Markdown 产物（如复盘、计划、设计）使用 union merge driver，直接把两边内容拼接起来。

正常情况下你不应该看到冲突提示。如果看到了，那通常是真正的语义冲突，例如两台机器同时编辑了同一份计划，此时 Git 会停下来提示你处理。

## 跨设备拉取节奏

前导逻辑每 24 小时会自动执行一次 `git fetch` + `git merge --ff-only`，并通过 `~/.gstack/.brain-last-pull` 做缓存。你不需要记住这件事，它会在每天第一次运行技能时自动完成。

## 卸载

```bash
gstack-brain-uninstall
```

这个命令会：

- 删除 `~/.gstack/.git/` 和所有 `.brain-*` 配置文件
- 清除 `gstack-config` 中的 `gbrain_sync_mode`
- 不会删除你的经验、计划、复盘或开发者画像

如果加上 `--delete-remote`，还会连私有 GitHub 仓库一起删除（仅 GitHub 支持，内部调用 `gh repo delete`）。

之后如果想重新启用，随时再运行 `gstack-brain-init` 即可。

## 故障排查

所有 `gstack-brain` 可能输出的错误信息索引，以及每条错误对应的“问题 / 原因 / 修复方式”，请参见 [gbrain-sync-errors.md](gbrain-sync-errors.md)。

## 实现原理

如果你想了解这个功能背后的架构取舍，例如为什么使用 allowlist 而不是 denylist、为什么采用前导边界同步而不是守护进程、为什么给 JSONL 配 merge driver、以及为什么要加隐私停止闸门，可以查看 gstack 计划目录中的[已批准方案](../system-instruction-you-are-working-jaunty-kahn.md)。
