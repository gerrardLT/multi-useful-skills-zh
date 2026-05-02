# Greptile 评论分类

用于在 GitHub PR 上获取、过滤和分类 Greptile 评论的共享参考。 `/review`（步骤 2.5）和 `/ship`（步骤 3.75）都引用了本文档。

---

## 获取

运行这些命令来检测 PR 并获取评论。两个 API 调用并行运行。

```bash
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null)
PR_NUMBER=$(gh pr view --json number --jq '.number' 2>/dev/null)
```

**如果失败或为空：** 静默跳过 Greptile 分类。这种集成是附加的——工作流程无需它即可工作。

```bash
# Fetch line-level review comments AND top-level PR comments in parallel
gh api repos/$REPO/pulls/$PR_NUMBER/comments \
  --jq '.[] | select(.user.login == "greptile-apps[bot]") | select(.position != null) | {id: .id, path: .path, line: .line, body: .body, html_url: .html_url, source: "line-level"}' > /tmp/greptile_line.json &
gh api repos/$REPO/issues/$PR_NUMBER/comments \
  --jq '.[] | select(.user.login == "greptile-apps[bot]") | {id: .id, body: .body, html_url: .html_url, source: "top-level"}' > /tmp/greptile_top.json &
wait
```

**如果 API 错误或两个端点上的 Greptile 注释为零：** 静默跳过。

行级注释上的 `position != null` 过滤器会自动跳过强制推送代码中的过时注释。

---

## 抑制检查

导出项目特定的历史路径：
```bash
REMOTE_SLUG=$(browse/bin/remote-slug 2>/dev/null || ~/.claude/skills/gstack/browse/bin/remote-slug 2>/dev/null || basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
PROJECT_HISTORY="$HOME/.gstack/projects/$REMOTE_SLUG/greptile-history.md"
```

读取 `$PROJECT_HISTORY` 如果存在（每个项目抑制）。每行记录之前的分类结果：

```
<date> | <repo> | <type:fp|fix|already-fixed> | <file-pattern> | <category>
```

**类别**（固定集）：`race-condition`、`null-check`、`error-handling`、`style`、`type-safety`、`security`、`performance`、`correctness`、`other`

将每个获取的评论与以下条目进行匹配：
- `type == fp`（仅抑制已知的误报，而不是之前修复的实际问题）
- `repo` 匹配当前存储库
- `file-pattern` 匹配注释的文件路径
- `category` 与评论中的问题类型匹配

跳过匹配的评论，标记为 **SUPPRESSED**。

如果历史文件不存在或具有无法解析的行，请跳过这些行并继续 - 永远不要因格式错误的历史文件而失败。

---

## 分类

对于每个非抑制评论：

1. **行级注释：** 在指示的 `path:line` 和周围上下文（±10 行）处读取文件
2. **顶级评论：** 阅读完整评论正文
3. 将评论与完整差异 (`git diff origin/main`) 和审核清单交叉引用
4. 分类：
- **有效且可操作** — 当前代码中存在的真实错误、竞争条件、安全问题或正确性问题
- **有效但已修复** — 一个真正的问题，已在分支上的后续提交中得到解决。识别修复提交 SHA。
- **假阳性** - 注释误解了代码，标记了其他地方处理的内容，或者是风格噪音
- **SUPPRESSED** — 已在上面的抑制检查中过滤

---

## 回复API

回复 Greptile 评论时，根据评论来源使用正确的端点：

**行级注释**（来自 `pulls/$PR/comments`）：
```bash
gh api repos/$REPO/pulls/$PR_NUMBER/comments/$COMMENT_ID/replies \
  -f body="<reply text>"
```

**顶级评论**（来自 `issues/$PR/comments`）：
```bash
gh api repos/$REPO/issues/$PR_NUMBER/comments \
  -f body="<reply text>"
```

**如果回复 POST 失败**（例如，PR 已关闭，没有写入权限）：警告并继续。不要因回复失败而停止工作流程。

---

## 回复模板

对每个 Greptile 回复使用这些模板。始终包含具体证据——切勿发布含糊的答复。

### 第 1 级（第一反应）——友好、有证据

**对于修复（用户选择修复问题）：**

```
**Fixed** in `<commit-sha>`.

\`\`\`diff
- <old problematic line(s)>
+ <new fixed line(s)>
\`\`\`

**Why:** <1-sentence explanation of what was wrong and how the fix addresses it>
```

**对于已修复（在分支上的先前提交中解决的问题）：**

```
**Already fixed** in `<commit-sha>`.

**What was done:** <1-2 sentences describing how the existing commit addresses this issue>
```

**对于假阳性（评论不正确）：**

```
**Not a bug.** <1 sentence directly stating why this is incorrect>

**Evidence:**
- <specific code reference showing the pattern is safe/correct>
- <e.g., "The nil check is handled by `ActiveRecord::FinderMethods#find` which raises RecordNotFound, not nil">

**Suggested re-rank:** This appears to be a `<style|noise|misread>` issue, not a `<what Greptile called it>`. Consider lowering severity.
```

### 第 2 层（Greptile 在事先回复后重新标记）——坚实、压倒性的证据

当升级检测（如下）识别出同一线程上先前的 GStack 回复时，请使用第 2 层。包括尽可能多的证据来结束讨论。

```
**This has been reviewed and confirmed as [intentional/already-fixed/not-a-bug].**

\`\`\`diff
<full relevant diff showing the change or safe pattern>
\`\`\`

**Evidence chain:**
1. <file:line permalink showing the safe pattern or fix>
2. <commit SHA where it was addressed, if applicable>
3. <architecture rationale or design decision, if applicable>

**Suggested re-rank:** Please recalibrate — this is a `<actual category>` issue, not `<claimed category>`. [Link to specific file change permalink if helpful]
```

---

## 升级检测

在撰写回复之前，请检查此评论线程中是否已存在先前的 GStack 回复：

1. **对于行级评论：** 通过 `gh api repos/$REPO/pulls/$PR_NUMBER/comments/$COMMENT_ID/replies` 获取回复。检查回复正文是否包含 GStack 标记：`**Fixed**`、`**Not a bug.**`、`**Already fixed**`。

2. **对于顶级评论：** 扫描获取的问题评论以获取在包含 GStack 标记的 Greptile 评论之后发布的回复。

3. **如果存在先前的 GStack 回复并且 Greptile 在同一文件+类别上再次发布：** 使用第 2 层（公司）模板。

4. **如果之前不存在 GStack 回复：** 使用第 1 层（友好）模板。

如果升级检测失败（API 错误、不明确的线程）：默认为第 1 层。切勿因不明确而升级。

---

## 严重性评估和重新排名

在对评论进行分类时，还要评估 Greptile 隐含的严重性是否与现实相符：

- 如果 Greptile 将某些内容标记为 **security/correctness/race-condition** 问题，但实际上是 **style/performance** nit：在请求更正类别的回复中包含 `**Suggested re-rank:**`。
- 如果 Greptile 将低严重性样式问题标记为严重：推回回复。
- 始终具体说明为什么需要重新排名 - 引用代码和行号，而不是意见。

---

## 历史文件写入

在写入之前，确保两个目录都存在：
```bash
REMOTE_SLUG=$(browse/bin/remote-slug 2>/dev/null || ~/.claude/skills/gstack/browse/bin/remote-slug 2>/dev/null || basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
mkdir -p "$HOME/.gstack/projects/$REMOTE_SLUG"
mkdir -p ~/.gstack
```

将每个分类结果添加一行到**两个**文件（每个项目用于抑制，全局用于复古）：
- `~/.gstack/projects/$REMOTE_SLUG/greptile-history.md`（每个项目）
- `~/.gstack/greptile-history.md`（全局聚合）

格式：
```
<YYYY-MM-DD> | <owner/repo> | <type> | <file-pattern> | <category>
```

示例条目：
```
2026-03-13 | garrytan/myapp | fp | app/services/auth_service.rb | race-condition
2026-03-13 | garrytan/myapp | fix | app/models/user.rb | null-check
2026-03-13 | garrytan/myapp | already-fixed | lib/payments.rb | error-handling
```

---

## 输出格式

在输出标头中包含 Greptile 摘要：
```
+ N Greptile comments (X valid, Y fixed, Z FP)
```

对于每个分类评论，显示：
- 分类标签：`[VALID]`、`[FIXED]`、`[FALSE POSITIVE]`、`[SUPPRESSED]`
- 文件：行引用（对于行级）或 `[top-level]` （对于顶层）
- 一行正文摘要
- 固定链接 URL（`html_url` 字段）