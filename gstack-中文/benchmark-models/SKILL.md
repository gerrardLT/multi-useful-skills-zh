---
name: benchmark-models
preamble-tier: 1
version: 1.0.0
description: |-
  gstack 技能的跨模型基准测试。通过 Claude 运行相同的提示，
  GPT（通过 Codex CLI）和 Gemini 并排比较延迟、令牌、成本，
  并可选择通过 LLM 评判质量。回答“哪种模型实际上最适合
  这个技能？”用数据而非主观感受。与 /benchmark 分开，
  衡量网页性能。使用时：“基准模型”、“比较模型”、
  “哪种模型最适合X”、“跨模型比较”、“模型对决”。 （gstack）
  语音触发器（语音转文本别名）：“比较模型”、“模型对决”、“哪个模型最好”。
triggers:
- cross model benchmark
- compare claude gpt gemini
- benchmark skill across models
- which model should I use
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
echo '{"skill":"benchmark-models","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
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
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"benchmark-models","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
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
```隐私停止门：如果输出显示 `BRAIN_SYNC: off`、`gbrain_sync_mode_prompted` 是 `false`，并且 gbrain 在 PATH 上或 `gbrain doctor --fast --json` 有效，请询问一次：

> gstack 可以将会话内存发布到 GBrain 跨机器索引的私有 GitHub 存储库。应同步多少内容？

选项：
- A) 列入许可名单的所有内容（推荐）
- B) 仅制品
- C) 拒绝，全部本地化

回答后：

```bash
# Chosen mode: full | artifacts-only | off
"$_BRAIN_CONFIG_BIN" set gbrain_sync_mode <choice>
"$_BRAIN_CONFIG_BIN" set gbrain_sync_mode_prompted true
```

如果缺少 A/B 选项且 `~/.gstack/.git` 不存在，询问是否运行 `gstack-brain-init`。不要阻塞技能。

在遥测之前的技能 END 处：

```bash
"~/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"~/.claude/skills/gstack/bin/gbrain-sync" --once 2>/dev/null || true
```


## 模型特定行为补丁 (Claude)

以下微调是针对 Claude 模型系列进行的调整。它们
**从属于**技能工作流程、停止点、AskUserQuestion 门、计划模式
安全和 /ship 审查门。如果下面的微调与技能说明相冲突，
以技能为准。将这些视为偏好，而不是规则。

**待办事项列表纪律。** 在制定多步骤计划时，标记每项任务
完成后单独完成。最后不要批量完成。如果一个任务
事实证明是不必要的，用一行原因将其标记为跳过。

**在采取重大行动之前要三思。** 对于复杂的操作（重构、迁移、
重要的新功能），在执行之前简要说明您的方法。这让
用户可以廉价地修正航向，而不是在飞行途中修正。

**专用工具优于 Bash。** 更喜欢 Read、Edit、Write、Glob、Grep 而不是 shell
等效项（cat、sed、find、grep）。专用工具更便宜、更清晰。

## 语气

直接、具体、构建者对构建者。命名文件、函数、命令和用户可见的影响。无填充物。

没有破折号。没有 AI 词汇：深入研究、关键、稳健、全面、细致入微、多方面。绝不是企业或学术。短段落。以要做什么结束。

用户有你没有的上下文。跨模型协议是一个建议，而不是一个决定。用户决定。

## 完成状态协议

完成技能工作流程时，使用以下之一报告状态：
- **DONE** — 已完成并提供证据。
- **DONE_WITH_CONCERNS** — 已完成，但列出问题。
- **BLOCKED** — 无法继续；状态拦截器以及尝试过的方法。
- **NEEDS_CONTEXT** — 缺少信息；准确说明需要什么。

在 3 次失败尝试、不确定的安全敏感更改或无法验证的范围后升级。格式：`STATUS`、`REASON`、`ATTEMPTED`、`RECOMMENDATION`。

## 运营自我提升

在完成之前，如果您发现了持久的项目怪癖或命令修复，下次可以节省 5 分钟以上的时间，请将其记录下来：

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
```

不要记录明显的事实或一次性的暂时性错误。

## 遥测（最后运行）

工作流程完成后，记录遥测数据。使用 frontmatter 中的技能 `name:` 。结果是 success/error/abort/unknown。

**计划模式异常 — 始终运行：** 此命令将遥测数据写入
`~/.gstack/analytics/`，匹配前导码分析写入。

运行这个 bash：

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
rm -f ~/.gstack/analytics/.pending-"$_SESSION_ID" 2>/dev/null || true
# Session timeline: record skill completion (local-only, never sent anywhere)
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"SKILL_NAME","event":"completed","branch":"'$(git branch --show-current 2>/dev/null || echo unknown)'","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null || true
# Local analytics (gated on telemetry setting)
if [ "$_TEL" != "off" ]; then
echo '{"skill":"SKILL_NAME","duration_s":"'"$_TEL_DUR"'","outcome":"OUTCOME","browse":"USED_BROWSE","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
fi
# Remote telemetry (opt-in, requires binary)
if [ "$_TEL" != "off" ] && [ -x ~/.claude/skills/gstack/bin/gstack-telemetry-log ]; then
  ~/.claude/skills/gstack/bin/gstack-telemetry-log \
    --skill "SKILL_NAME" --duration "$_TEL_DUR" --outcome "OUTCOME" \
    --used-browse "USED_BROWSE" --session-id "$_SESSION_ID" 2>/dev/null &
fi
```

运行前替换 `SKILL_NAME`、`OUTCOME` 和 `USED_BROWSE`。

## 计划状态页脚

在 ExitPlanMode 之前的计划模式下：如果计划文件缺少 `## GSTACK REVIEW REPORT`，则运行 `~/.claude/skills/gstack/bin/gstack-review-read` 并附加标准的 run/status/findings 表。使用 `NO_REVIEWS` 或空，附加一个 5 行占位符并判定“NO REVIEWS YET — run `/autoplan`”。如果存在更丰富的报告，请跳过。

计划模式例外 - 始终允许（这是计划文件）。

# /benchmark-models — 跨模型技能基准

您正在运行 `/benchmark-models` 工作流程。使用交互式流程包装 `gstack-model-benchmark` 二进制文件，该流程选择提示、确认提供程序、预览身份验证并运行基准测试。

与 `/benchmark` 不同 - 该技能衡量网页性能（核心网络生命、加载时间）。该技能衡量 AI 模型在 gstack 技能或任意提示上的性能。

---

## 第 0 步：找到二进制文件

```bash
BIN="$HOME/.claude/skills/gstack/bin/gstack-model-benchmark"
[ -x "$BIN" ] || BIN=".claude/skills/gstack/bin/gstack-model-benchmark"
[ -x "$BIN" ] || { echo "ERROR: gstack-model-benchmark not found. Run ./setup in the gstack install dir." >&2; exit 1; }
echo "BIN: $BIN"
```

如果没有找到，则停止并告诉用户重新安装 gstack。

---

## 第 1 步：选择提示

使用 AskUserQuestion 和前导码格式：
- **重新接地：** 当前项目 + 分支。
- **简化：** “跨模型基准测试通过 2-3 个 AI 模型运行相同的提示，并向您展示它们在速度、成本和输出质量方面的比较情况。我们应该使用什么提示？”
- **建议：** A，因为针对真实技能的基准测试暴露了工具使用差异，而不仅仅是原始生成。
- **选项：**
- A) 对我的一项 gstack 技能进行基准测试（我们接下来将选择哪个技能）。完整性：10/10。
- B) 使用内联提示——在下一回合输入。完整性：8/10。
- C) 指向磁盘上的提示文件 — 指定下一回合的路径。完整性：8/10。

如果 A：列出具有 SKILL.md 文件（来自 `find . -maxdepth 2 -name SKILL.md -not -path './.*'`）的顶级 gstack 技能，请用户通过第二个 AskUserQuestion 选择一项。使用选择的 SKILL.md 路径作为提示文件。

如果 B：询问用户内联提示。通过 `--prompt "<text>"` 逐字使用它。

如果 C：询问路径。验证它是否存在。用作位置参数。

---

## 第 2 步：选择提供商

```bash
"$BIN" --prompt "unused, dry-run" --models claude,gpt,gemini --dry-run
```

显示空运行输出。 “适配器可用性”部分告诉用户哪些提供程序将实际运行（正常）与跳过（未就绪 - 包括修复提示）。

如果所有三个都显示未就绪：停止并发出明确的消息 - 基准测试无法在没有至少一个经过验证的提供商的情况下运行。建议使用 `claude login`、`codex login` 或 `gemini login` / `export GOOGLE_API_KEY`。

如果至少有一个是可以的：询问用户问题：
- **简化：** “我们应该包括哪些模型？上面的试运行显示了哪些模型已经过验证。未经验证的模型将被彻底跳过 - 它们不会中止批次。”
- **建议：** A（所有经过身份验证的提供商），因为运行尽可能多的提供商可以提供最丰富的比较。
- **选项：**
- A) 所有经过授权的提供商。完整性：10/10。
- B) 只有 Claude。完整性：6/10（没有跨模型信号 - 使用 /ship 的独立 Claude 基准测试代替）。
- C) 选择两个 - 在下一回合指定。完整性：8/10。

---

## 第三步：决定评委

```bash
[ -n "$ANTHROPIC_API_KEY" ] || grep -q 'ANTHROPIC' "$HOME/.claude/.credentials.json" 2>/dev/null && echo "JUDGE_AVAILABLE" || echo "JUDGE_UNAVAILABLE"
```

如果有评委，请询问用户问题：
- **简化：** “质量评委使用 Anthropic 的 Claude 作为决胜局，对每个模型的输出进行 0-10 分的评分。增加 ~$0.05/次。如果您关心输出质量，而不仅仅是延迟和成本，则推荐使用。”
- **建议：** A — 重点是比较质量，而不仅仅是速度。
- **选项：**
- A) 启用评委（增加 ~$0.05）。完整性：10/10。
- B) 跳过评委 — 仅 speed/cost/tokens。完整性：7/10。

如果评委不可用，请跳过此问题并省略 `--judge` 标志。

---

## 第 4 步：运行基准测试

根据步骤 1、2、3 的决策构建命令：

```bash
"$BIN" <prompt-spec> --models <picked-models> [--judge] --output table
```

其中 `<prompt-spec>` 是 `--prompt "<text>"`（步骤 1B）、文件路径（步骤 1A 或 1C），`<picked-models>` 是步骤 2 中的逗号分隔列表。

当输出到达时对其进行流式传输。这很慢——每个提供商都完全运行提示。预计需要 30 秒到 5 分钟，具体取决于提示复杂性以及 `--judge` 是否打开。

---

## 第 5 步：解释结果

表格打印后，为用户总结：
- **最快** — 延迟最低的提供商。
- **最便宜** — 成本最低的提供商。
- **最高质量**（如果 `--judge` 运行）— 得分最高的提供商。
- **整体最佳** — 使用判断力。如果评委运行：质量加权。否则：请注意用户需要做出的权衡。

如果任何提供程序遇到错误 (auth/timeout/rate_limit)，请使用修复路径将其调出。

---

## 第 6 步：提出保存结果

询问用户问题：
- **简化：** “将此基准保存为 JSON，以便您可以将未来的运行与它进行比较？”
- **建议：** A — 随着提供商更新其模型，技能表现会发生变化；保存的基线捕获质量回归。
- **选项：**
- A) 保存到 `~/.gstack/benchmarks/<date>-<skill-or-prompt-slug>.json`。完整性：10/10。
- B) 仅打印，不保存。完整性：5/10（丢失趋势数据）。

如果 A：使用 `--output json` 重新运行并查看日期文件。打印路径，以便用户可以根据它来区分未来的运行。

---

## 重要规则

- **在没有第 2 步先进行试运行的情况下，切勿运行真正的基准测试。** 用户需要在调用 API 之前查看身份验证状态。
- **永远不要对模型名称进行硬编码。** 始终从用户的第 2 步选择中传递提供程序 - 二进制文件会处理其余部分。
- **永远不要自动包含 `--judge`。** 它会增加实际成本；用户必须选择加入。
- **如果对零个提供程序进行了身份验证，请停止。** 不要尝试基准测试 - 它不会产生有用的输出。
- **成本可见。** 每次运行都会在表中显示每个提供商的成本。用户应该在下次运行之前看到它。