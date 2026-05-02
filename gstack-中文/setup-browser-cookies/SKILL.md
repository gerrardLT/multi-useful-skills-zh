---
name: setup-browser-cookies
preamble-tier: 1
version: 1.0.0
description: |-
  将 cookie 从真实的 Chromium 浏览器导入到无头浏览会话中。
  打开交互式选择器 UI，您可以在其中选择要导入的 Cookie 域。
  在 QA 测试经过身份验证的页面之前使用。当被要求“导入cookie”时使用，
  “登录网站”或“验证浏览器”。 （gstack）
triggers:
- import browser cookies
- login to test site
- setup authenticated session
allowed-tools:
- Bash
- Read
- AskUserQuestion
---
<!-- 从 SKILL.md.tmpl 自动生成 — 不要直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->

## 序言（先运行）

```bash
_UPD=$(~/.claude/skills/gstack/bin/gstack-update-check 2>/dev/null || .claude/skills/gstack/bin/gstack-update-check 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
mkdir -p ~/.gstack/sessions
touch ~/.gstack/sessions/"$PPID"
_SESSIONS=$(find ~/.gstack/sessions -mmin -120 -type f 2>/dev/null | wc -l | tr -d ' ')
find ~/.gstack/sessions -mmin +120 -type f -exec rm {} + 2>/dev/null || true
_PROACTIVE=$(~/.claude/skills/gstack/bin/gstack-config get proactive 2>/dev/null || echo "true")
_PROACTIVE_PROMPTED=$([ -f ~/.gstack/.proactive-prompted ] && echo "yes" || echo "no")
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"
_SKILL_PREFIX=$(~/.claude/skills/gstack/bin/gstack-config get skill_prefix 2>/dev/null || echo "false")
echo "PROACTIVE: $_PROACTIVE"
echo "PROACTIVE_PROMPTED: $_PROACTIVE_PROMPTED"
echo "SKILL_PREFIX: $_SKILL_PREFIX"
source <(~/.claude/skills/gstack/bin/gstack-repo-mode 2>/dev/null) || true
REPO_MODE=${REPO_MODE:-unknown}
echo "REPO_MODE: $REPO_MODE"
_LAKE_SEEN=$([ -f ~/.gstack/.completeness-intro-seen ] && echo "yes" || echo "no")
echo "LAKE_INTRO: $_LAKE_SEEN"
_TEL=$(~/.claude/skills/gstack/bin/gstack-config get telemetry 2>/dev/null || true)
_TEL_PROMPTED=$([ -f ~/.gstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
echo "TELEMETRY: ${_TEL:-off}"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
_EXPLAIN_LEVEL=$(~/.claude/skills/gstack/bin/gstack-config get explain_level 2>/dev/null || echo "default")
if [ "$_EXPLAIN_LEVEL" != "default" ] && [ "$_EXPLAIN_LEVEL" != "terse" ]; then _EXPLAIN_LEVEL="default"; fi
echo "EXPLAIN_LEVEL: $_EXPLAIN_LEVEL"
_QUESTION_TUNING=$(~/.claude/skills/gstack/bin/gstack-config get question_tuning 2>/dev/null || echo "false")
echo "QUESTION_TUNING: $_QUESTION_TUNING"
mkdir -p ~/.gstack/analytics
if [ "$_TEL" != "off" ]; then
echo '{"skill":"setup-browser-cookies","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
fi
for _PF in $(find ~/.gstack/analytics -maxdepth 1 -name '.pending-*' 2>/dev/null); do
  if [ -f "$_PF" ]; then
    if [ "$_TEL" != "off" ] && [ -x "~/.claude/skills/gstack/bin/gstack-telemetry-log" ]; then
      ~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type skill_run --skill _pending_finalize --outcome unknown --session-id "$_SESSION_ID" 2>/dev/null || true
    fi
    rm -f "$_PF" 2>/dev/null || true
  fi
  break
done
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
_LEARN_FILE="${GSTACK_HOME:-$HOME/.gstack}/projects/${SLUG:-unknown}/learnings.jsonl"
if [ -f "$_LEARN_FILE" ]; then
  _LEARN_COUNT=$(wc -l < "$_LEARN_FILE" 2>/dev/null | tr -d ' ')
  echo "LEARNINGS: $_LEARN_COUNT entries loaded"
  if [ "$_LEARN_COUNT" -gt 5 ] 2>/dev/null; then
    ~/.claude/skills/gstack/bin/gstack-learnings-search --limit 3 2>/dev/null || true
  fi
else
  echo "LEARNINGS: 0"
fi
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"setup-browser-cookies","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
_HAS_ROUTING="no"
if [ -f CLAUDE.md ] && grep -q "## Skill routing" CLAUDE.md 2>/dev/null; then
  _HAS_ROUTING="yes"
fi
_ROUTING_DECLINED=$(~/.claude/skills/gstack/bin/gstack-config get routing_declined 2>/dev/null || echo "false")
echo "HAS_ROUTING: $_HAS_ROUTING"
echo "ROUTING_DECLINED: $_ROUTING_DECLINED"
_VENDORED="no"
if [ -d ".claude/skills/gstack" ] && [ ! -L ".claude/skills/gstack" ]; then
  if [ -f ".claude/skills/gstack/VERSION" ] || [ -d ".claude/skills/gstack/.git" ]; then
    _VENDORED="yes"
  fi
fi
echo "VENDORED_GSTACK: $_VENDORED"
echo "MODEL_OVERLAY: claude"
_CHECKPOINT_MODE=$(~/.claude/skills/gstack/bin/gstack-config get checkpoint_mode 2>/dev/null || echo "explicit")
_CHECKPOINT_PUSH=$(~/.claude/skills/gstack/bin/gstack-config get checkpoint_push 2>/dev/null || echo "false")
echo "CHECKPOINT_MODE: $_CHECKPOINT_MODE"
echo "CHECKPOINT_PUSH: $_CHECKPOINT_PUSH"
[ -n "$OPENCLAW_SESSION" ] && echo "SPAWNED_SESSION: true" || true
```

## 计划模式安全操作

在计划模式下，允许，因为它们通知计划：`$B`、`$D`、`codex exec`/`codex review`、写入 `~/.gstack/`、写入计划文件以及生成工件的 `open`。

## 计划模式下的技能调用

如果用户在计划模式下调用技能，则该技能优先于通用计划模式行为。 **将技能文件视为可执行指令，而不是参考。**从Step 0开始逐步执​​行；第一个 AskUserQuestion 是工作流进入计划模式，而不是违反它。 AskUserQuestion 满足计划模式的回合结束要求。到达停止点后，立即停止。不要继续工作流程或在那里调用 ExitPlanMode。执行标记为“PLAN MODE EXCEPTION — ALWAYS RUN”的命令。仅在技能工作流程完成后，或者用户告诉您取消技能或离开计划模式时，才调用 ExitPlanMode。

如果 `PROACTIVE` 是 `"false"`，则不要自动调用或主动建议技能。如果某项技能看起来有用，请询问：“我认为 /skillname 可能会有所帮助 - 希望我运行它吗？”

如果 `SKILL_PREFIX` 是 `"true"`，则建议 /invoke `/gstack-*` 名称。磁盘路径保留 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果输出显示 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md` 并遵循“内联升级流程”（如果配置则自动升级，否则使用 4 个选项询问用户问题，如果拒绝则写入暂停状态）。

如果输出显示 `JUST_UPGRADED <from> <to>`：打印“正在运行 gstack v{to}（刚刚更新！）”。如果 `SPAWNED_SESSION` 为 true，则跳过功能发现。

功能发现，每个会话最多一个提示：
- 缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`：询问用户连续检查点自动提交的问题。如果接受，则运行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。始终触摸标记。
- 缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`：通知“模型覆盖处于活动状态。MODEL_OVERLAY 显示补丁。”始终触摸标记。

出现升级提示后，继续工作流程。

如果 `WRITING_STYLE_PENDING` 是 `yes`：询问一次有关写作风格的问题：

> v1 提示更简单：首次使用的术语注释、结果框架问题、较短的散文。保持默认还是恢复简洁？

选项：
- A）保留新的默认值（推荐——好的写作对每个人都有帮助）
- B) 恢复 V0 散文 — 设置 `explain_level: terse`

如果 A：保留 `explain_level` 未设置（默认为 `default`）。
如果 B：运行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

始终运行（无论选择如何）：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

如果 `WRITING_STYLE_PENDING` 是 `no`，则跳过。

如果 `LAKE_INTRO` 是 `no`：说“gstack 遵循 **Boil the Lake** 原则 - 当 AI 使边际成本接近于零时完成整个事情。了解更多：https://CMD_2__.org/posts/boil-the-ocean” 提供打开：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

如果是的话，只运行 `open` 。始终运行 `touch`。

如果 `TEL_PROMPTED` 是 `no` 并且 `LAKE_INTRO` 是 `yes`：通过 AskUserQuestion 询问遥测一次：

> 帮助 gstack 变得更好。仅共享使用数据：技能、持续时间、崩溃、稳定设备 ID。没有代码、文件路径或存储库名称。

选项：
- A) 帮助 gstack 变得更好！ （受到推崇的）
-B）不用了，谢谢

如果 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`

如果B：询问后续：

> 匿名模式仅发送聚合使用情况，不发送唯一 ID。

选项：
- A）当然，匿名也可以
- B) 不用了，谢谢，完全关闭

如果 B→A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous`
如果 B→B：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry off`

始终运行：
```bash
touch ~/.gstack/.telemetry-prompted
```

如果 `TEL_PROMPTED` 是 `yes`，则跳过。

如果 `PROACTIVE_PROMPTED` 是 `no` 并且 `TEL_PROMPTED` 是 `yes`：询问一次：

> 让 gstack 主动建议技能，例如 /qa 表示“这可行吗？”或者 /investigate 来解决错误？

选项：
- A) 保持开启状态（推荐）
- B) 将其关闭 — 我自己输入 /commands

如果 A：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive true`
如果 B：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive false`

始终运行：
```bash
touch ~/.gstack/.proactive-prompted
```

如果 `PROACTIVE_PROMPTED` 是 `yes`，则跳过。

如果 `HAS_ROUTING` 是 `no` 并且 `ROUTING_DECLINED` 是 `false` 并且 `PROACTIVE_PROMPTED` 是 `yes`：
检查项目根目录中是否存在 CLAUDE.md 文件。如果不存在，则创建它。

使用询问用户问题：

> 当项目的 CLAUDE.md 包含技能路由规则时，gstack 效果最佳。

选项：
- A) 在CLAUDE.md中添加路由规则（推荐）
-B) 不用了，谢谢，我会手动调用技能

如果 A：将此部分附加到 CLAUDE.md 的末尾：

```markdown

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
```

然后提交更改：`git add CLAUDE.md && git commit -m "chore: add gstack skill routing rules to CLAUDE.md"`

如果 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true` 并说他们可以使用 `gstack-config set routing_declined false` 重新启用。

每个项目只会发生一次。如果 `HAS_ROUTING` 是 `yes` 或 `ROUTING_DECLINED` 是 `true`，则跳过。

如果 `VENDORED_GSTACK` 是 `yes`，则通过 AskUserQuestion 发出警告一次，除非 `~/.gstack/.vendoring-warned-$SLUG` 存在：

> 该项目的 gstack 在 `.claude/skills/gstack/` 中提供。供应商已被弃用。
> 迁移到团队模式？

选项：
- A) 是的，现在迁移到团队模式
-B) 不，我自己处理

如果答：
1. 运行`git rm -r .claude/skills/gstack/`
2. 运行`echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required` （或 `optional`）
4. 运行`git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告诉用户：“完成。每个开发人员现在运行：`cd ~/.claude/skills/gstack && ./setup --team`”

如果 B：说“好吧，您需要自行更新所提供的副本”。

始终运行（无论选择如何）：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

如果标记存在，则跳过。

如果 `SPAWNED_SESSION` 是 `"true"`，则您正在一个由
AI 协调器（例如 OpenClaw）。在生成的会话中：
- 不要使用 AskUserQuestion 进行交互式提示。自动选择推荐的选项。
- 不要运行升级检查、遥测提示、路由注入或 Lake Intro。
- 专注于完成任务并通过散文输出报告结果。
- 以完成报告结束：运送了什么、做出的决定、任何不确定的事情。

## GBrain Sync（技能启动）

```bash
_GSTACK_HOME="${GSTACK_HOME:-$HOME/.gstack}"
_BRAIN_REMOTE_FILE="$HOME/.gstack-brain-remote.txt"
_BRAIN_SYNC_BIN="~/.claude/skills/gstack/bin/gstack-brain-sync"
_BRAIN_CONFIG_BIN="~/.claude/skills/gstack/bin/gstack-config"

_BRAIN_SYNC_MODE=$("$_BRAIN_CONFIG_BIN" get gbrain_sync_mode 2>/dev/null || echo off)

if [ -f "$_BRAIN_REMOTE_FILE" ] && [ ! -d "$_GSTACK_HOME/.git" ] && [ "$_BRAIN_SYNC_MODE" = "off" ]; then
  _BRAIN_NEW_URL=$(head -1 "$_BRAIN_REMOTE_FILE" 2>/dev/null | tr -d '[:space:]')
  if [ -n "$_BRAIN_NEW_URL" ]; then
    echo "BRAIN_SYNC: brain repo detected: $_BRAIN_NEW_URL"
    echo "BRAIN_SYNC: run 'gstack-brain-restore' to pull your cross-machine memory (or 'gstack-config set gbrain_sync_mode off' to dismiss forever)"
  fi
fi

if [ -d "$_GSTACK_HOME/.git" ] && [ "$_BRAIN_SYNC_MODE" != "off" ]; then
  _BRAIN_LAST_PULL_FILE="$_GSTACK_HOME/.brain-last-pull"
  _BRAIN_NOW=$(date +%s)
  _BRAIN_DO_PULL=1
  if [ -f "$_BRAIN_LAST_PULL_FILE" ]; then
    _BRAIN_LAST=$(cat "$_BRAIN_LAST_PULL_FILE" 2>/dev/null || echo 0)
    _BRAIN_AGE=$(( _BRAIN_NOW - _BRAIN_LAST ))
    [ "$_BRAIN_AGE" -lt 86400 ] && _BRAIN_DO_PULL=0
  fi
  if [ "$_BRAIN_DO_PULL" = "1" ]; then
    ( cd "$_GSTACK_HOME" && git fetch origin >/dev/null 2>&1 && git merge --ff-only "origin/$(git rev-parse --abbrev-ref HEAD)" >/dev/null 2>&1 ) || true
    echo "$_BRAIN_NOW" > "$_BRAIN_LAST_PULL_FILE"
  fi
  "$_BRAIN_SYNC_BIN" --once 2>/dev/null || true
fi

if [ -d "$_GSTACK_HOME/.git" ] && [ "$_BRAIN_SYNC_MODE" != "off" ]; then
  _BRAIN_QUEUE_DEPTH=0
  [ -f "$_GSTACK_HOME/.brain-queue.jsonl" ] && _BRAIN_QUEUE_DEPTH=$(wc -l < "$_GSTACK_HOME/.brain-queue.jsonl" | tr -d ' ')
  _BRAIN_LAST_PUSH="never"
  [ -f "$_GSTACK_HOME/.brain-last-push" ] && _BRAIN_LAST_PUSH=$(cat "$_GSTACK_HOME/.brain-last-push" 2>/dev/null || echo never)
  echo "BRAIN_SYNC: mode=$_BRAIN_SYNC_MODE | last_push=$_BRAIN_LAST_PUSH | queue=$_BRAIN_QUEUE_DEPTH"
else
  echo "BRAIN_SYNC: off"
fi
```



隐私停止门：如果输出显示 `BRAIN_SYNC: off`、`gbrain_sync_mode_prompted` 是 `false`，并且 gbrain 在 PATH 上或 `gbrain doctor --fast --json` 有效，请询问一次：

> gstack 可以将您的会话内存发布到 GBrain 跨机器索引的私有 GitHub 存储库。应该同步多少？

选项：
- A) 列入许可名单的所有内容（推荐）
- B) 仅文物# 设置浏览器 Cookie

将登录会话从真实的 Chromium 浏览器导入到无头浏览会话中。

## CDP模式检查

首先，检查 browser 是否已经连接到用户的真实浏览器：
```bash
$B status 2>/dev/null | grep -q "Mode: cdp" && echo "CDP_MODE=true" || echo "CDP_MODE=false"
```
如果 `CDP_MODE=true`：告诉用户“不需要 — 您已通过 CDP 连接到您的真实浏览器。您的 cookie 和会话已经可用。”并停止。无需导入 cookie。

## 工作原理

1.  找到浏览二进制文件
2.  运行 `cookie-import-browser` 来检测已安装的浏览器并打开选择器 UI
3.  用户选择要在浏览器中导入哪些 cookie 域
4.  Cookie 被解密并加载到 Playwright 会话中

## 步骤

### 1. 找到浏览二进制文件

## 设置（在任何浏览命令之前运行此检查）

```bash
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
B=""
[ -n "$_ROOT" ] && [ -x "$_ROOT/.claude/skills/gstack/browse/dist/browse" ] && B="$_ROOT/.claude/skills/gstack/browse/dist/browse"
[ -z "$B" ] && B="$HOME/.claude/skills/gstack/browse/dist/browse"
if [ -x "$B" ]; then
  echo "READY: $B"
else
  echo "NEEDS_SETUP"
fi
```

如果 `NEEDS_SETUP`：
1.  告诉用户：“gstack browser 需要一次性构建（约 10 秒）。可以继续吗？”然后停下来等待。
2.  运行：`cd <SKILL_DIR> && ./setup`
3.  如果未安装 `bun`：
    ```bash
    if ! command -v bun >/dev/null 2>&1; then
      BUN_VERSION="1.3.10"
      BUN_INSTALL_SHA="bab8acfb046aac8c72407bdcce903957665d655d7acaa3e11c7c4616beae68dd"
      tmpfile=$(mktemp)
      curl -fsSL "https://bun.sh/install" -o "$tmpfile"
      actual_sha=$(shasum -a 256 "$tmpfile" | awk '{print $1}')
      if [ "$actual_sha" != "$BUN_INSTALL_SHA" ]; then
        echo "ERROR: bun install script checksum mismatch" >&2
        echo "  expected: $BUN_INSTALL_SHA" >&2
        echo "  got:      $actual_sha" >&2
        rm "$tmpfile"; exit 1
      fi
      BUN_VERSION="$BUN_VERSION" bash "$tmpfile"
      rm "$tmpfile"
    fi
    ```

### 2. 打开 cookie 选择器

```bash
$B cookie-import-browser
```

这会自动检测已安装的 Chromium 浏览器，并在默认浏览器中打开交互式选择器 UI，您可以在其中：
-   在已安装的浏览器之间切换
-   搜索域
-   单击“+”导入域的 cookie
-   点击垃圾桶删除导入的 cookie

告诉用户：**“Cookie 选择器已打开 - 选择您想要在浏览器中导入的域，然后在完成后告诉我。”**

### 3. 直接导入（替代）

如果用户直接指定域（例如 `/setup-browser-cookies github.com`），则跳过 UI：

```bash
$B cookie-import-browser comet --domain github.com
```

如果指定，请将 `comet` 替换为适当的浏览器。

### 4. 验证

用户确认完成后：

```bash
$B cookies
```

向用户显示导入的 cookie（域计数）的摘要。

## 注意事项

-   在 macOS 上，每个浏览器的首次导入可能会触发“钥匙串”对话框 — 单击“允许”/“始终允许”
-   在 Linux 上，`v11` cookie 可能需要 `secret-tool`/libsecret 访问权限；`v10` cookies 使用 Chromium 的标准后备密钥
-   Cookie 选择器与浏览服务器在同一端口上提供服务（无额外进程）
-   UI 中仅显示域名和 cookie 计数 — 不公开 cookie 值
-   浏览会话在命令之间保留 cookie，因此导入的 cookie 会立即生效