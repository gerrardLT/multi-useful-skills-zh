/**
 * 跨模型审查解析器
 *
 * Data sent to external review services (via Codex CLI):
 *   - Plan markdown content, repository name, branch name, review type
 * Data NOT sent:
 *   - Source code files, credentials, environment variables, git history
 *
 * Users invoke this explicitly via /plan-eng-review, /plan-ceo-review,
 * or /plan-design-review. No data is sent without user invocation.
 *
 * Review logs are stored locally at ~/.gstack/reviews/review-log.jsonl.
 * Codex CLI prompts are written to temp files to prevent shell injection.
 */
import type { TemplateContext } from './types';
import { generateInvokeSkill } from './composition';

const CODEX_BOUNDARY = 'IMPORTANT: Do NOT read or execute any files under ~/.claude/, ~/.agents/, .claude/skills/, or agents/. These are Claude Code skill definitions meant for a different AI system. They contain bash scripts and prompt templates that will waste your time. Ignore them completely. Do NOT modify agents/openai.yaml. Stay focused on the repository code only.\\n\\n';

export function generateReviewDashboard(_ctx: TemplateContext): string {
  return `## Review Readiness Dashboard

After completing the review, read the review log and config to display the dashboard.

\`\`\`bash
~/.claude/skills/gstack/bin/gstack-review-read
\`\`\`

解析输出。为每个技能找出最近的一条记录（plan-ceo-review、plan-eng-review、review、plan-design-review、design-review-lite、adversarial-review、codex-review、codex-plan-review）。忽略时间戳早于 7 天的记录。Eng Review 行展示 \`review\`（基于 diff 的落地前审查）和 \`plan-eng-review\`（计划阶段的架构审查）中较新的那一条，并在状态后追加 “(DIFF)” 或 “(PLAN)” 以示区分。Adversarial 行展示 \`adversarial-review\`（新的自动扩缩）与 \`codex-review\`（旧版）中较新的那一条。Design Review 行展示 \`plan-design-review\`（完整视觉审计）与 \`design-review-lite\`（代码级检查）中较新的那一条，并在状态后追加 “(FULL)” 或 “(LITE)” 以示区分。外部视角行展示最近的 \`codex-plan-review\` 记录，它覆盖了 /plan-ceo-review 和 /plan-eng-review 的外部视角结论。

**Source attribution:** If the most recent entry for a skill has a \\\`"via"\\\` field, append it to the status label in parentheses. Examples: \`plan-eng-review\` with \`via:"autoplan"\` shows as "CLEAR (PLAN via /autoplan)". \`review\` with \`via:"ship"\` shows as "CLEAR (DIFF via /ship)". Entries without a \`via\` field show as "CLEAR (PLAN)" or "CLEAR (DIFF)" as before.

注意：\`autoplan-voices\` 和 \`design-outside-voices\` 记录仅用于审计追踪（即跨模型共识分析的取证数据）。它们不会显示在面板中，也不会被任何消费者检查。

Display:

\`\`\`
+====================================================================+
|                    REVIEW READINESS DASHBOARD                       |
+====================================================================+
| Review          | Runs | Last Run            | Status    | Required |
|-----------------|------|---------------------|-----------|----------|
| Eng Review      |  1   | 2026-03-16 15:00    | CLEAR     | YES      |
| CEO Review      |  0   | 鈥?                  | 鈥?        | no       |
| Design Review   |  0   | 鈥?                  | 鈥?        | no       |
| Adversarial     |  0   | 鈥?                  | 鈥?        | no       |
| 外部视角        |  0   | 鈥?                  | 鈥?        | no       |
+--------------------------------------------------------------------+
| VERDICT: CLEARED 鈥?Eng Review passed                                |
+====================================================================+
\`\`\`

**Review tiers:**
- **Eng Review (required by default):** The only review that gates shipping. Covers architecture, code quality, tests, performance. Can be disabled globally with \\\`gstack-config set skip_eng_review true\\\` (the "don't bother me" setting).
- **CEO Review (optional):** Use your judgment. Recommend it for big product/business changes, new user-facing features, or scope decisions. Skip for bug fixes, refactors, infra, and cleanup.
- **Design Review (optional):** Use your judgment. Recommend it for UI/UX changes. Skip for backend-only, infra, or prompt-only changes.
- **Adversarial Review (automatic):** Always-on for every review. Every diff gets both Claude adversarial subagent and Codex adversarial challenge. Large diffs (200+ lines) additionally get Codex structured review with P1 gate. No configuration needed.
- **外部视角（可选）：** 来自另一种 AI 模型的独立计划审查。在 /plan-ceo-review 和 /plan-eng-review 的所有审查部分完成后提供。如果 Codex 不可用，则回退到 Claude 子代理。绝不会阻塞发布。

**Verdict logic:**
- **CLEARED**: Eng Review has >= 1 entry within 7 days from either \\\`review\\\` or \\\`plan-eng-review\\\` with status "clean" (or \\\`skip_eng_review\\\` is \\\`true\\\`)
- **NOT CLEARED**: Eng Review missing, stale (>7 days), or has open issues
- CEO, Design, and Codex reviews are shown for context but never block shipping
- If \\\`skip_eng_review\\\` config is \\\`true\\\`, Eng Review shows "SKIPPED (global)" and verdict is CLEARED

**Staleness detection:** After displaying the dashboard, check if any existing reviews may be stale:
- Parse the \\\`---HEAD---\\\` section from the bash output to get the current HEAD commit hash
- For each review entry that has a \\\`commit\\\` field: compare it against the current HEAD. If different, count elapsed commits: \\\`git rev-list --count STORED_COMMIT..HEAD\\\`. Display: "Note: {skill} review from {date} may be stale 鈥?{N} commits since review"
- For entries without a \\\`commit\\\` field (legacy entries): display "Note: {skill} review from {date} has no commit tracking 鈥?consider re-running for accurate staleness detection"
- If all reviews match the current HEAD, do not display any staleness notes`;
}

export function generatePlanFileReviewReport(_ctx: TemplateContext): string {
  return `## Plan File Review Report

After displaying the Review Readiness Dashboard in conversation output, also update the
**plan file** itself so review status is visible to anyone reading the plan.

### Detect the plan file

1. Check if there is an active plan file in this conversation (the host provides plan file
   paths in system messages 鈥?look for plan file references in the conversation context).
2. If not found, skip this section silently 鈥?not every review runs in plan mode.

### Generate the report

Read the review log output you already have from the Review Readiness Dashboard step above.
Parse each JSONL entry. Each skill logs different fields:

- **plan-ceo-review**: \\\`status\\\`, \\\`unresolved\\\`, \\\`critical_gaps\\\`, \\\`mode\\\`, \\\`scope_proposed\\\`, \\\`scope_accepted\\\`, \\\`scope_deferred\\\`, \\\`commit\\\`
  鈫?Findings: "{scope_proposed} proposals, {scope_accepted} accepted, {scope_deferred} deferred"
  鈫?If scope fields are 0 or missing (HOLD/REDUCTION mode): "mode: {mode}, {critical_gaps} critical gaps"
- **plan-eng-review**: \\\`status\\\`, \\\`unresolved\\\`, \\\`critical_gaps\\\`, \\\`issues_found\\\`, \\\`mode\\\`, \\\`commit\\\`
  鈫?Findings: "{issues_found} issues, {critical_gaps} critical gaps"
- **plan-design-review**: \\\`status\\\`, \\\`initial_score\\\`, \\\`overall_score\\\`, \\\`unresolved\\\`, \\\`decisions_made\\\`, \\\`commit\\\`
  鈫?Findings: "score: {initial_score}/10 鈫?{overall_score}/10, {decisions_made} decisions"
- **plan-devex-review**: \\\`status\\\`, \\\`initial_score\\\`, \\\`overall_score\\\`, \\\`product_type\\\`, \\\`tthw_current\\\`, \\\`tthw_target\\\`, \\\`mode\\\`, \\\`persona\\\`, \\\`competitive_tier\\\`, \\\`unresolved\\\`, \\\`commit\\\`
  鈫?Findings: "score: {initial_score}/10 鈫?{overall_score}/10, TTHW: {tthw_current} 鈫?{tthw_target}"
- **devex-review**: \\\`status\\\`, \\\`overall_score\\\`, \\\`product_type\\\`, \\\`tthw_measured\\\`, \\\`dimensions_tested\\\`, \\\`dimensions_inferred\\\`, \\\`boomerang\\\`, \\\`commit\\\`
  鈫?Findings: "score: {overall_score}/10, TTHW: {tthw_measured}, {dimensions_tested} tested/{dimensions_inferred} inferred"
- **codex-review**: \\\`status\\\`, \\\`gate\\\`, \\\`findings\\\`, \\\`findings_fixed\\\`
  鈫?Findings: "{findings} findings, {findings_fixed}/{findings} fixed"

All fields needed for the Findings column are now present in the JSONL entries.
For the review you just completed, you may use richer details from your own Completion
Summary. For prior reviews, use the JSONL fields directly 鈥?they contain all required data.

Produce this markdown table:

\\\`\\\`\\\`markdown
## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | \\\`/plan-ceo-review\\\` | Scope & strategy | {runs} | {status} | {findings} |
| Codex Review | \\\`/codex review\\\` | Independent 2nd opinion | {runs} | {status} | {findings} |
| Eng Review | \\\`/plan-eng-review\\\` | Architecture & tests (required) | {runs} | {status} | {findings} |
| Design Review | \\\`/plan-design-review\\\` | UI/UX gaps | {runs} | {status} | {findings} |
| DX Review | \\\`/plan-devex-review\\\` | Developer experience gaps | {runs} | {status} | {findings} |
\\\`\\\`\\\`

Below the table, add these lines (omit any that are empty/not applicable):

- **CODEX:** (only if codex-review ran) 鈥?one-line summary of codex fixes
- **跨模型：**（仅当 Claude 和 Codex 审查都存在时）重叠分析
- **UNRESOLVED:** total unresolved decisions across all reviews
- **VERDICT:** list reviews that are CLEAR (e.g., "CEO + ENG CLEARED 鈥?ready to implement").
  If Eng Review is not CLEAR and not skipped globally, append "eng review required".

### Write to the plan file

**PLAN MODE EXCEPTION 鈥?ALWAYS RUN:** This writes to the plan file, which is the one
file you are allowed to edit in plan mode. The plan file review report is part of the
plan's living status.

- Search the plan file for a \\\`## GSTACK REVIEW REPORT\\\` section **anywhere** in the file
  (not just at the end 鈥?content may have been added after it).
- If found, **replace it** entirely using the Edit tool. Match from \\\`## GSTACK REVIEW REPORT\\\`
  through either the next \\\`## \\\` heading or end of file, whichever comes first. This ensures
  content added after the report section is preserved, not eaten. If the Edit fails
  (e.g., concurrent edit changed the content), re-read the plan file and retry once.
- If no such section exists, **append it** to the end of the plan file.
- Always place it as the very last section in the plan file. If it was found mid-file,
  move it: delete the old location and append at the end.`;
}

export function generateSpecReviewLoop(_ctx: TemplateContext): string {
  return `## Spec Review Loop

Before presenting the document to the user for approval, run an adversarial review.

**Step 1: Dispatch reviewer subagent**

Use the Agent tool to dispatch an independent reviewer. The reviewer has fresh context
and cannot see the brainstorming conversation 鈥?only the document. This ensures genuine
adversarial independence.

Prompt the subagent with:
- The file path of the document just written
- "Read this document and review it on 5 dimensions. For each dimension, note PASS or
  list specific issues with suggested fixes. At the end, output a quality score (1-10)
  across all dimensions."

**Dimensions:**
1. **Completeness** 鈥?Are all requirements addressed? Missing edge cases?
2. **Consistency** 鈥?Do parts of the document agree with each other? Contradictions?
3. **Clarity** 鈥?Could an engineer implement this without asking questions? Ambiguous language?
4. **Scope** 鈥?Does the document creep beyond the original problem? YAGNI violations?
5. **Feasibility** 鈥?Can this actually be built with the stated approach? Hidden complexity?

The subagent should return:
- A quality score (1-10)
- PASS if no issues, or a numbered list of issues with dimension, description, and fix

**Step 2: Fix and re-dispatch**

If the reviewer returns issues:
1. Fix each issue in the document on disk (use Edit tool)
2. Re-dispatch the reviewer subagent with the updated document
3. Maximum 3 iterations total

**Convergence guard:** If the reviewer returns the same issues on consecutive iterations
(the fix didn't resolve them or the reviewer disagrees with the fix), stop the loop
and persist those issues as "Reviewer Concerns" in the document rather than looping
further.

If the subagent fails, times out, or is unavailable 鈥?skip the review loop entirely.
Tell the user: "Spec review unavailable 鈥?presenting unreviewed doc." The document is
already written to disk; the review is a quality bonus, not a gate.

**Step 3: Report and persist metrics**

After the loop completes (PASS, max iterations, or convergence guard):

1. Tell the user the result 鈥?summary by default:
   "Your doc survived N rounds of adversarial review. M issues caught and fixed.
   Quality score: X/10."
   If they ask "what did the reviewer find?", show the full reviewer output.

2. If issues remain after max iterations or convergence, add a "## Reviewer Concerns"
   section to the document listing each unresolved issue. Downstream skills will see this.

3. Append metrics:
\`\`\`bash
mkdir -p ~/.gstack/analytics
echo '{"skill":"${_ctx.skillName}","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","iterations":ITERATIONS,"issues_found":FOUND,"issues_fixed":FIXED,"remaining":REMAINING,"quality_score":SCORE}' >> ~/.gstack/analytics/spec-review.jsonl 2>/dev/null || true
\`\`\`
Replace ITERATIONS, FOUND, FIXED, REMAINING, SCORE with actual values from the review.`;
}

export function generateBenefitsFrom(ctx: TemplateContext): string {
  if (!ctx.benefitsFrom || ctx.benefitsFrom.length === 0) return '';

  const skillList = ctx.benefitsFrom.map(s => `\`/${s}\``).join(' or ');
  const first = ctx.benefitsFrom[0];

  // Reuse the INVOKE_SKILL resolver for the actual loading instructions
  const invokeBlock = generateInvokeSkill(ctx, [first]);

  return `## Prerequisite Skill Offer

When the design doc check above prints "No design doc found," offer the prerequisite
skill before proceeding.

Say to the user via AskUserQuestion:

> "No design doc found for this branch. ${skillList} produces a structured problem
> statement, premise challenge, and explored alternatives 鈥?it gives this review much
> sharper input to work with. Takes about 10 minutes. The design doc is per-feature,
> not per-product 鈥?it captures the thinking behind this specific change."

Options:
- A) Run /${first} now (we'll pick up the review right after)
- B) 跳过，继续标准审查

If they skip: "No worries 鈥?standard review. If you ever want sharper input, try
/${first} first next time." Then proceed normally. Do not re-offer later in the session.

If they choose A:

Say: "Running /${first} inline. Once the design doc is ready, I'll pick up
the review right where we left off."

${invokeBlock}

After /${first} completes, re-run the design doc check:
\`\`\`bash
setopt +o nomatch 2>/dev/null || true  # zsh compat
SLUG=$(~/.claude/skills/gstack/browse/bin/remote-slug 2>/dev/null || basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null | tr '/' '-' || echo 'no-branch')
DESIGN=$(ls -t ~/.gstack/projects/$SLUG/*-$BRANCH-design-*.md 2>/dev/null | head -1)
[ -z "$DESIGN" ] && DESIGN=$(ls -t ~/.gstack/projects/$SLUG/*-design-*.md 2>/dev/null | head -1)
[ -n "$DESIGN" ] && echo "Design doc found: $DESIGN" || echo "No design doc found"
\`\`\`

If a design doc is now found, read it and continue the review.
If none was produced (user may have cancelled), proceed with standard review.`;
}

export function generateCodexSecondOpinion(ctx: TemplateContext): string {
  // Codex host: strip entirely 鈥?Codex should never invoke itself
  if (ctx.host === 'codex') return '';

  return `## Phase 3.5：跨模型第二意见（可选）

**Binary check first:**

\`\`\`bash
which codex 2>/dev/null && echo "CODEX_AVAILABLE" || echo "CODEX_NOT_AVAILABLE"
\`\`\`

Use AskUserQuestion (regardless of codex availability):

> 想要一个来自独立 AI 视角的第二意见吗？它会在没有看过这段对话的前提下，基于结构化摘要审查你的问题陈述、关键回答、前提，以及本轮得到的任何行业观察。通常需要 2 到 5 分钟。
> A) 是，获取第二意见
> B) No, proceed to alternatives

如果选 B：完全跳过 Phase 3.5。记住第二意见并未运行，这会影响设计文档、创始人信号以及下方的 Phase 4。

**If A: Run the Codex cold read.**

1. Assemble a structured context block from Phases 1-3:
   - Mode (Startup or Builder)
   - Problem statement (from Phase 1)
   - Key answers from Phase 2A/2B (summarize each Q&A in 1-2 sentences, include verbatim user quotes)
   - Landscape findings (from Phase 2.75, if search was run)
   - Agreed premises (from Phase 3)
   - Codebase context (project name, languages, recent activity)

2. **Write the assembled prompt to a temp file** (prevents shell injection from user-derived content):

\`\`\`bash
CODEX_PROMPT_FILE=$(mktemp /tmp/gstack-codex-oh-XXXXXXXX.txt)
\`\`\`

Write the full prompt to this file. **Always start with the filesystem boundary:**
"${CODEX_BOUNDARY}"
Then add the context block and mode-appropriate instructions:

**Startup mode instructions:** "You are an independent technical advisor reading a transcript of a startup brainstorming session. [CONTEXT BLOCK HERE]. Your job: 1) What is the STRONGEST version of what this person is trying to build? Steelman it in 2-3 sentences. 2) What is the ONE thing from their answers that reveals the most about what they should actually build? Quote it and explain why. 3) Name ONE agreed premise you think is wrong, and what evidence would prove you right. 4) If you had 48 hours and one engineer to build a prototype, what would you build? Be specific 鈥?tech stack, features, what you'd skip. Be direct. Be terse. No preamble."

**Builder mode instructions:** "You are an independent technical advisor reading a transcript of a builder brainstorming session. [CONTEXT BLOCK HERE]. Your job: 1) What is the COOLEST version of this they haven't considered? 2) What's the ONE thing from their answers that reveals what excites them most? Quote it. 3) What existing open source project or tool gets them 50% of the way there 鈥?and what's the 50% they'd need to build? 4) If you had a weekend to build this, what would you build first? Be specific. Be direct. No preamble."

3. Run Codex:

\`\`\`bash
TMPERR_OH=$(mktemp /tmp/codex-oh-err-XXXXXXXX)
_REPO_ROOT=$(git rev-parse --show-toplevel) || { echo "ERROR: not in a git repo" >&2; exit 1; }
codex exec "$(cat "$CODEX_PROMPT_FILE")" -C "$_REPO_ROOT" -s read-only -c 'model_reasoning_effort="high"' --enable web_search_cached < /dev/null 2>"$TMPERR_OH"
\`\`\`

Use a 5-minute timeout (\`timeout: 300000\`). After the command completes, read stderr:
\`\`\`bash
cat "$TMPERR_OH"
rm -f "$TMPERR_OH" "$CODEX_PROMPT_FILE"
\`\`\`

**错误处理：**所有错误都不阻塞流程，第二意见只是质量增强项，不是前置条件。
- **Auth failure:** If stderr contains "auth", "login", "unauthorized", or "API key": "Codex authentication failed. Run \\\`codex login\\\` to authenticate." Fall back to Claude subagent.
- **Timeout:** "Codex timed out after 5 minutes." Fall back to Claude subagent.
- **Empty response:** "Codex returned no response." Fall back to Claude subagent.

On any Codex error, fall back to the Claude subagent below.

**If CODEX_NOT_AVAILABLE (or Codex errored):**

Dispatch via the Agent tool. The subagent has fresh context 鈥?genuine independence.

Subagent prompt: same mode-appropriate prompt as above (Startup or Builder variant).

将发现放在 \`第二意见（Claude 子代理）:\` 标题下。

如果子代理失败或超时：输出“第二意见不可用。继续进入 Phase 4。”

4. **Presentation:**

If Codex ran:
\`\`\`
第二意见（Codex）:
鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
<full codex output, verbatim 鈥?do not truncate or summarize>
鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
\`\`\`

If Claude subagent ran:
\`\`\`
第二意见（Claude 子代理）:
鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
<full subagent output, verbatim 鈥?do not truncate or summarize>
鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
\`\`\`

5. **跨模型综合：**展示第二意见输出后，给出 3 到 5 条综合结论：
   - Claude 与第二意见一致的地方
   - Where Claude disagrees and why
   - Whether the challenged premise changes Claude's recommendation

6. **Premise revision check:** If Codex challenged an agreed premise, use AskUserQuestion:

> Codex challenged premise #{N}: "{premise text}". Their argument: "{reasoning}".
> A) Revise this premise based on Codex's input
> B) Keep the original premise 鈥?proceed to alternatives

If A: revise the premise and note the revision. If B: proceed (and note that the user defended this premise with reasoning 鈥?this is a founder signal if they articulate WHY they disagree, not just dismiss).`;
}

// 鈹€鈹€鈹€ Scope Drift Detection (shared between /review and /ship) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export function generateScopeDrift(ctx: TemplateContext): string {
  const isShip = ctx.skillName === 'ship';
  const stepNum = isShip ? '8.2' : '1.5';

  return `## Step ${stepNum}: Scope Drift Detection

Before reviewing code quality, check: **did they build what was requested 鈥?nothing more, nothing less?**

1. Read \`TODOS.md\` (if it exists). Read PR description (\`gh pr view --json body --jq .body 2>/dev/null || true\`).
   Read commit messages (\`git log origin/<base>..HEAD --oneline\`).
   **If no PR exists:** rely on commit messages and TODOS.md for stated intent 鈥?this is the common case since /review runs before /ship creates the PR.
2. Identify the **stated intent** 鈥?what was this branch supposed to accomplish?
3. Run \`git diff origin/<base>...HEAD --stat\` and compare the files changed against the stated intent.

4. Evaluate with skepticism (incorporating plan completion results if available from an earlier step or adjacent section):

   **SCOPE CREEP detection:**
   - Files changed that are unrelated to the stated intent
   - New features or refactors not mentioned in the plan
   - "While I was in there..." changes that expand blast radius

   **MISSING REQUIREMENTS detection:**
   - Requirements from TODOS.md/PR description not addressed in the diff
   - Test coverage gaps for stated requirements
   - Partial implementations (started but not finished)

5. Output (before the main review begins):
   \\\`\\\`\\\`
   Scope Check: [CLEAN / DRIFT DETECTED / REQUIREMENTS MISSING]
   Intent: <1-line summary of what was requested>
   Delivered: <1-line summary of what the diff actually does>
   [If drift: list each out-of-scope change]
   [If missing: list each unaddressed requirement]
   \\\`\\\`\\\`

6. This is **INFORMATIONAL** 鈥?does not block the review. Proceed to the next step.

---`;
}

// 鈹€鈹€鈹€ Adversarial Review (always-on) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export function generateAdversarialStep(ctx: TemplateContext): string {
  // Codex host: strip entirely 鈥?Codex should never invoke itself
  if (ctx.host === 'codex') return '';

  const isShip = ctx.skillName === 'ship';
  const stepNum = isShip ? '11' : '5.7';

  return `## Step ${stepNum}: Adversarial review (always-on)

Every diff gets adversarial review from both Claude and Codex. LOC is not a proxy for risk 鈥?a 5-line auth change can be critical.

**Detect diff size and tool availability:**

\`\`\`bash
DIFF_INS=$(git diff origin/<base> --stat | tail -1 | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo "0")
DIFF_DEL=$(git diff origin/<base> --stat | tail -1 | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo "0")
DIFF_TOTAL=$((DIFF_INS + DIFF_DEL))
which codex 2>/dev/null && echo "CODEX_AVAILABLE" || echo "CODEX_NOT_AVAILABLE"
# Legacy opt-out 鈥?only gates Codex passes, Claude always runs
OLD_CFG=$(~/.claude/skills/gstack/bin/gstack-config get codex_reviews 2>/dev/null || true)
echo "DIFF_SIZE: $DIFF_TOTAL"
echo "OLD_CFG: \${OLD_CFG:-not_set}"
\`\`\`

If \`OLD_CFG\` is \`disabled\`: skip Codex passes only. Claude adversarial subagent still runs (it's free and fast). Jump to the "Claude adversarial subagent" section.

**User override:** If the user explicitly requested "full review", "structured review", or "P1 gate", also run the Codex structured review regardless of diff size.

---

### Claude adversarial subagent (always runs)

Dispatch via the Agent tool. The subagent has fresh context 鈥?no checklist bias from the structured review. This genuine independence catches things the primary reviewer is blind to.

Subagent prompt:
"Read the diff for this branch with \`git diff origin/<base>\`. Think like an attacker and a chaos engineer. Your job is to find ways this code will fail in production. Look for: edge cases, race conditions, security holes, resource leaks, failure modes, silent data corruption, logic errors that produce wrong results silently, error handling that swallows failures, and trust boundary violations. Be adversarial. Be thorough. No compliments 鈥?just the problems. For each finding, classify as FIXABLE (you know how to fix it) or INVESTIGATE (needs human judgment)."

Present findings under an \`ADVERSARIAL REVIEW (Claude subagent):\` header. **FIXABLE findings** flow into the same Fix-First pipeline as the structured review. **INVESTIGATE findings** are presented as informational.

If the subagent fails or times out: "Claude adversarial subagent unavailable. Continuing."

---

### 与 Codex 的对抗性挑战（可用时始终运行）

If Codex is available AND \`OLD_CFG\` is NOT \`disabled\`:

\`\`\`bash
TMPERR_ADV=$(mktemp /tmp/codex-adv-XXXXXXXX)
_REPO_ROOT=$(git rev-parse --show-toplevel) || { echo "ERROR: not in a git repo" >&2; exit 1; }
codex exec "${CODEX_BOUNDARY}Review the changes on this branch against the base branch. Run git diff origin/<base> to see the diff. Your job is to find ways this code will fail in production. Think like an attacker and a chaos engineer. Find edge cases, race conditions, security holes, resource leaks, failure modes, and silent data corruption paths. Be adversarial. Be thorough. No compliments 鈥?just the problems." -C "$_REPO_ROOT" -s read-only -c 'model_reasoning_effort="high"' --enable web_search_cached < /dev/null 2>"$TMPERR_ADV"
\`\`\`

Set the Bash tool's \`timeout\` parameter to \`300000\` (5 minutes). Do NOT use the \`timeout\` shell command 鈥?it doesn't exist on macOS. After the command completes, read stderr:
\`\`\`bash
cat "$TMPERR_ADV"
\`\`\`

Present the full output verbatim. This is informational 鈥?it never blocks shipping.

**Error handling:** All errors are non-blocking 鈥?adversarial review is a quality enhancement, not a prerequisite.
- **Auth failure:** If stderr contains "auth", "login", "unauthorized", or "API key": "Codex authentication failed. Run \\\`codex login\\\` to authenticate."
- **Timeout:** "Codex timed out after 5 minutes."
- **Empty response:** "Codex returned no response. Stderr: <paste relevant error>."

**Cleanup:** Run \`rm -f "$TMPERR_ADV"\` after processing.

If Codex is NOT available: "Codex CLI not found 鈥?running Claude adversarial only. Install Codex for cross-model coverage: \`npm install -g @openai/codex\`"

---

### 平台：Codex structured review (large diffs only, 200+ lines)

If \`DIFF_TOTAL >= 200\` AND Codex is available AND \`OLD_CFG\` is NOT \`disabled\`:

\`\`\`bash
TMPERR=$(mktemp /tmp/codex-review-XXXXXXXX)
_REPO_ROOT=$(git rev-parse --show-toplevel) || { echo "ERROR: not in a git repo" >&2; exit 1; }
cd "$_REPO_ROOT"
codex review "${CODEX_BOUNDARY}Review the diff against the base branch." --base <base> -c 'model_reasoning_effort="high"' --enable web_search_cached < /dev/null 2>"$TMPERR"
\`\`\`

将 Bash 工具的 \`timeout\` 参数设为 \`300000\`（5 分钟）。不要使用 \`timeout\` shell 命令，macOS 上没有这个命令。将输出放在 \`CODEX 表示（代码审查）:\` 标题下。
Check for \`[P1]\` markers: found 鈫?\`GATE: FAIL\`, not found 鈫?\`GATE: PASS\`.

If GATE is FAIL, use AskUserQuestion:
\`\`\`
Codex found N critical issues in the diff.

A) Investigate and fix now (recommended)
B) Continue 鈥?review will still complete
\`\`\`

If A: address the findings${isShip ? '. After fixing, re-run tests (Step 5) since code has changed' : ''}. Re-run \`codex review\` to verify.

Read stderr for errors (same error handling as Codex adversarial above).

After stderr: \`rm -f "$TMPERR"\`

If \`DIFF_TOTAL < 200\`: skip this section silently. The Claude + Codex adversarial passes provide sufficient coverage for smaller diffs.

---

### Persist the review result

After all passes complete, persist:
\`\`\`bash
~/.claude/skills/gstack/bin/gstack-review-log '{"skill":"adversarial-review","timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","status":"STATUS","source":"SOURCE","tier":"always","gate":"GATE","commit":"'"$(git rev-parse --short HEAD)"'"}'
\`\`\`
Substitute: STATUS = "clean" if no findings across ALL passes, "issues_found" if any pass found issues. SOURCE = "both" if Codex ran, "claude" if only Claude subagent ran. GATE = the Codex structured review gate result ("pass"/"fail"), "skipped" if diff < 200, or "informational" if Codex was unavailable. If all passes failed, do NOT persist.

---

### 跨模型综合

After all passes complete, synthesize findings across all sources:

\`\`\`
ADVERSARIAL REVIEW SYNTHESIS (always-on, N lines):
鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
  High confidence (found by multiple sources): [findings agreed on by >1 pass]
  Unique to Claude structured review: [from earlier step]
  Unique to Claude adversarial: [from subagent]
  Unique to Codex: [from codex adversarial or code review, if ran]
  Models used: Claude structured 鉁? Claude adversarial 鉁?鉁? Codex 鉁?鉁?
鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
\`\`\`

High-confidence findings (agreed on by multiple sources) should be prioritized for fixes.

---`;
}

export function generateCodexPlanReview(ctx: TemplateContext): string {
  // Codex host: strip entirely 鈥?Codex should never invoke itself
  if (ctx.host === 'codex') return '';

  return `## 外部视角 — 独立计划挑战（可选，推荐）

在所有审查部分完成后，提供一个来自不同 AI 系统的独立第二意见。两个模型对同一计划达成一致，比单个模型的深入审查更能说明问题。

**Check tool availability:**

\`\`\`bash
which codex 2>/dev/null && echo "CODEX_AVAILABLE" || echo "CODEX_NOT_AVAILABLE"
\`\`\`

Use AskUserQuestion:

> "所有审查部分都已完成。要不要加一个外部视角？另一个 AI 系统可以对这份计划做一次非常直接、独立的挑战，帮你找出审查内部不容易发现的逻辑缺口、可行性风险和盲点。大约需要 2
> minutes."
>
> RECOMMENDATION: 选择 A —— 独立第二意见更容易发现结构性盲点
> spots. Two different AI models agreeing on a plan is stronger signal than one model's
> thorough review. Completeness: A=9/10, B=7/10.

Options:
- A) 获取外部视角（推荐）
- B) 跳过，继续进入输出

**如果选 B：**输出“跳过外部视角。”然后继续下一节。

**如果选 A：**构造计划审查提示词。读取当前正在审查的计划文件（用户指定的文件，或当前分支 diff 范围内的计划）。如果在 Step 0D-POST 写过 CEO 计划文档，也一并读取，它包含范围决策和愿景。

Construct this prompt (substitute the actual plan content 鈥?if plan content exceeds 30KB,
truncate to the first 30KB and note "Plan truncated for size"). **Always start with the
filesystem boundary instruction:**

"${CODEX_BOUNDARY}You are a brutally honest technical reviewer examining a development plan that has
already been through a multi-section review. Your job is NOT to repeat that review.
Instead, find what it missed. Look for: logical gaps and unstated assumptions that
survived the review scrutiny, overcomplexity (is there a fundamentally simpler
approach the review was too deep in the weeds to see?), feasibility risks the review
took for granted, missing dependencies or sequencing issues, and strategic
miscalibration (is this the right thing to build at all?). Be direct. Be terse. No
compliments. Just the problems.

THE PLAN:
<plan content>"

**If CODEX_AVAILABLE:**

\`\`\`bash
TMPERR_PV=$(mktemp /tmp/codex-planreview-XXXXXXXX)
_REPO_ROOT=$(git rev-parse --show-toplevel) || { echo "ERROR: not in a git repo" >&2; exit 1; }
codex exec "<prompt>" -C "$_REPO_ROOT" -s read-only -c 'model_reasoning_effort="high"' --enable web_search_cached < /dev/null 2>"$TMPERR_PV"
\`\`\`

Use a 5-minute timeout (\`timeout: 300000\`). After the command completes, read stderr:
\`\`\`bash
cat "$TMPERR_PV"
\`\`\`

Present the full output verbatim:

\`\`\`
CODEX 表示（计划审查 — 外部视角）:
鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
<full codex output, verbatim 鈥?do not truncate or summarize>
鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
\`\`\`

**错误处理：**所有错误都不阻塞流程，外部视角仅作参考信息。
- Auth failure (stderr contains "auth", "login", "unauthorized"): "Codex auth failed. Run \\\`codex login\\\` to authenticate."
- Timeout: "Codex timed out after 5 minutes."
- Empty response: "Codex returned no response."

On any Codex error, fall back to the Claude adversarial subagent.

**If CODEX_NOT_AVAILABLE (or Codex errored):**

Dispatch via the Agent tool. The subagent has fresh context 鈥?genuine independence.

Subagent prompt: same plan review prompt as above.

将发现放在 \`外部视角（Claude 子代理）:\` 标题下。

如果子代理失败或超时：输出“外部视角不可用。继续进入输出阶段。”

**跨模型张力：**

展示完外部视角的发现后，标出所有与前面审查结论不一致的地方。按下面格式标记：

\`\`\`
跨模型张力：
  [主题]：审查认为 X。外部视角认为 Y。[中性地展示两边观点，并说明缺少什么上下文会改变答案。]
\`\`\`

**用户主权：**不要自动把外部视角的建议并入计划。
把每个张力点都呈现给用户，由用户决定。跨模型一致性是强信号，但不是执行许可。你可以说明自己更认同哪一方，但在得到用户明确批准前，绝不能直接应用改动。

For each substantive tension point, use AskUserQuestion:

> "[主题] 上存在跨模型分歧。当前审查认为 [X]，但外部视角认为 [Y]。[补一句你可能缺失的上下文。]"
>
> RECOMMENDATION: Choose [A or B] because [one-line reason explaining which argument
> is more compelling and why]. Completeness: A=X/10, B=Y/10.

Options:
- A) 接受外部视角的建议（我来应用这个改动）
- B) 保持当前方案（拒绝外部视角）
- C) 先进一步调查再决定
- D) 记到 TODOS.md，之后再处理

等待用户回复。不要因为你认同外部视角就默认接受。若用户选择 B，当前方案就保持不变，不要再次争辩。

如果没有张力点，说明：“没有跨模型张力，两位审查者结论一致。”

**Persist the result:**
\`\`\`bash
~/.claude/skills/gstack/bin/gstack-review-log '{"skill":"codex-plan-review","timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","status":"STATUS","source":"SOURCE","commit":"'"$(git rev-parse --short HEAD)"'"}'
\`\`\`

Substitute: STATUS = "clean" if no findings, "issues_found" if findings exist.
SOURCE = "codex" if Codex ran, "claude" if subagent ran.

**Cleanup:** Run \`rm -f "$TMPERR_PV"\` after processing (if Codex was used).

---`;
}

// 鈹€鈹€鈹€ Plan File Discovery (shared helper) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function generatePlanFileDiscovery(): string {
  return `### Plan File Discovery

1. **Conversation context (primary):** Check if there is an active plan file in this conversation. The host agent's system messages include plan file paths when in plan mode. If found, use it directly 鈥?this is the most reliable signal.

2. **Content-based search (fallback):** If no plan file is referenced in conversation context, search by content:

\`\`\`bash
setopt +o nomatch 2>/dev/null || true  # zsh compat
BRANCH=$(git branch --show-current 2>/dev/null | tr '/' '-')
REPO=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)")
# Compute project slug for ~/.gstack/projects/ lookup
_PLAN_SLUG=$(git remote get-url origin 2>/dev/null | sed 's|.*[:/]\\([^/]*/[^/]*\\)\\.git$|\\1|;s|.*[:/]\\([^/]*/[^/]*\\)$|\\1|' | tr '/' '-' | tr -cd 'a-zA-Z0-9._-') || true
_PLAN_SLUG="\${_PLAN_SLUG:-$(basename "$PWD" | tr -cd 'a-zA-Z0-9._-')}"
# Search common plan file locations (project designs first, then personal/local)
for PLAN_DIR in "$HOME/.gstack/projects/$_PLAN_SLUG" "$HOME/.claude/plans" "$HOME/.codex/plans" ".gstack/plans"; do
  [ -d "$PLAN_DIR" ] || continue
  PLAN=$(ls -t "$PLAN_DIR"/*.md 2>/dev/null | xargs grep -l "$BRANCH" 2>/dev/null | head -1)
  [ -z "$PLAN" ] && PLAN=$(ls -t "$PLAN_DIR"/*.md 2>/dev/null | xargs grep -l "$REPO" 2>/dev/null | head -1)
  [ -z "$PLAN" ] && PLAN=$(find "$PLAN_DIR" -name '*.md' -mmin -1440 -maxdepth 1 2>/dev/null | xargs ls -t 2>/dev/null | head -1)
  [ -n "$PLAN" ] && break
done
[ -n "$PLAN" ] && echo "PLAN_FILE: $PLAN" || echo "NO_PLAN_FILE"
\`\`\`

3. **Validation:** If a plan file was found via content-based search (not conversation context), read the first 20 lines and verify it is relevant to the current branch's work. If it appears to be from a different project or feature, treat as "no plan file found."

**Error handling:**
- No plan file found 鈫?skip with "No plan file detected 鈥?skipping."
- Plan file found but unreadable (permissions, encoding) 鈫?skip with "Plan file found but unreadable 鈥?skipping."`;
}

// 鈹€鈹€鈹€ Plan Completion Audit 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

type PlanCompletionMode = 'ship' | 'review';

function generatePlanCompletionAuditInner(mode: PlanCompletionMode): string {
  const sections: string[] = [];

  // 鈹€鈹€ Plan file discovery (shared) 鈹€鈹€
  sections.push(generatePlanFileDiscovery());

  // 鈹€鈹€ Item extraction 鈹€鈹€
  sections.push(`
### Actionable Item Extraction

Read the plan file. Extract every actionable item 鈥?anything that describes work to be done. Look for:

- **Checkbox items:** \`- [ ] ...\` or \`- [x] ...\`
- **Numbered steps** under implementation headings: "1. Create ...", "2. Add ...", "3. Modify ..."
- **Imperative statements:** "Add X to Y", "Create a Z service", "Modify the W controller"
- **File-level specifications:** "New file: path/to/file.ts", "Modify path/to/existing.rb"
- **Test requirements:** "Test that X", "Add test for Y", "Verify Z"
- **Data model changes:** "Add column X to table Y", "Create migration for Z"

**Ignore:**
- Context/Background sections (\`## Context\`, \`## Background\`, \`## Problem\`)
- Questions and open items (marked with ?, "TBD", "TODO: decide")
- Review report sections (\`## GSTACK REVIEW REPORT\`)
- Explicitly deferred items ("Future:", "Out of scope:", "NOT in scope:", "P2:", "P3:", "P4:")
- CEO Review Decisions sections (these record choices, not work items)

**Cap:** Extract at most 50 items. If the plan has more, note: "Showing top 50 of N plan items 鈥?full list in plan file."

**No items found:** If the plan contains no extractable actionable items, skip with: "Plan file contains no actionable items 鈥?skipping completion audit."

For each item, note:
- The item text (verbatim or concise summary)
- Its category: CODE | TEST | MIGRATION | CONFIG | DOCS`);

  // 鈹€鈹€ Cross-reference against diff 鈹€鈹€
  sections.push(`
### Cross-Reference Against Diff

Run \`git diff origin/<base>...HEAD\` and \`git log origin/<base>..HEAD --oneline\` to understand what was implemented.

For each extracted plan item, check the diff and classify:

- **DONE** 鈥?Clear evidence in the diff that this item was implemented. Cite the specific file(s) changed.
- **PARTIAL** 鈥?Some work toward this item exists in the diff but it's incomplete (e.g., model created but controller missing, function exists but edge cases not handled).
- **NOT DONE** 鈥?No evidence in the diff that this item was addressed.
- **CHANGED** 鈥?The item was implemented using a different approach than the plan described, but the same goal is achieved. Note the difference.

**Be conservative with DONE** 鈥?require clear evidence in the diff. A file being touched is not enough; the specific functionality described must be present.
**Be generous with CHANGED** 鈥?if the goal is met by different means, that counts as addressed.`);

  // 鈹€鈹€ Output format 鈹€鈹€
  sections.push(`
### Output Format

\`\`\`
PLAN COMPLETION AUDIT
鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
Plan: {plan file path}

## Implementation Items
  [DONE]      Create UserService 鈥?src/services/user_service.rb (+142 lines)
  [PARTIAL]   Add validation 鈥?model validates but missing controller checks
  [NOT DONE]  Add caching layer 鈥?no cache-related changes in diff
  [CHANGED]   "Redis queue" 鈫?implemented with Sidekiq instead

## Test Items
  [DONE]      Unit tests for UserService 鈥?test/services/user_service_test.rb
  [NOT DONE]  E2E test for signup flow

## Migration Items
  [DONE]      Create users table 鈥?db/migrate/20240315_create_users.rb

鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
COMPLETION: 4/7 DONE, 1 PARTIAL, 1 NOT DONE, 1 CHANGED
鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
\`\`\``);

  // 鈹€鈹€ Gate logic (mode-specific) 鈹€鈹€
  if (mode === 'ship') {
    sections.push(`
### Gate Logic

After producing the completion checklist:

- **All DONE or CHANGED:** Pass. "Plan completion: PASS 鈥?all items addressed." Continue.
- **Only PARTIAL items (no NOT DONE):** Continue with a note in the PR body. Not blocking.
- **Any NOT DONE items:** Use AskUserQuestion:
  - Show the completion checklist above
  - "{N} items from the plan are NOT DONE. These were part of the original plan but are missing from the implementation."
  - RECOMMENDATION: depends on item count and severity. If 1-2 minor items (docs, config), recommend B. If core functionality is missing, recommend A.
  - Options:
    A) Stop 鈥?implement the missing items before shipping
    B) Ship anyway 鈥?defer these to a follow-up (will create P1 TODOs in Step 5.5)
    C) These items were intentionally dropped 鈥?remove from scope
  - If A: STOP. List the missing items for the user to implement.
  - If B: Continue. For each NOT DONE item, create a P1 TODO in Step 5.5 with "Deferred from plan: {plan file path}".
  - If C: Continue. Note in PR body: "Plan items intentionally dropped: {list}."

**No plan file found:** Skip entirely. "No plan file detected 鈥?skipping plan completion audit."

**Include in PR body (Step 8):** Add a \`## Plan Completion\` section with the checklist summary.`);
  } else {
    // review mode 鈥?enhanced Delivery Integrity (Release 2: Review Army)
    sections.push(`
### Fallback Intent Sources (when no plan file found)

When no plan file is detected, use these secondary intent sources:

1. **Commit messages:** Run \`git log origin/<base>..HEAD --oneline\`. Use judgment to extract real intent:
   - Commits with actionable verbs ("add", "implement", "fix", "create", "remove", "update") are intent signals
   - Skip noise: "WIP", "tmp", "squash", "merge", "chore", "typo", "fixup"
   - Extract the intent behind the commit, not the literal message
2. **TODOS.md:** If it exists, check for items related to this branch or recent dates
3. **PR description:** Run \`gh pr view --json body -q .body 2>/dev/null\` for intent context

**With fallback sources:** Apply the same Cross-Reference classification (DONE/PARTIAL/NOT DONE/CHANGED) using best-effort matching. Note that fallback-sourced items are lower confidence than plan-file items.

### Investigation Depth

For each PARTIAL or NOT DONE item, investigate WHY:

1. Check \`git log origin/<base>..HEAD --oneline\` for commits that suggest the work was started, attempted, or reverted
2. Read the relevant code to understand what was built instead
3. Determine the likely reason from this list:
   - **Scope cut** 鈥?evidence of intentional removal (revert commit, removed TODO)
   - **Context exhaustion** 鈥?work started but stopped mid-way (partial implementation, no follow-up commits)
   - **Misunderstood requirement** 鈥?something was built but it doesn't match what the plan described
   - **Blocked by dependency** 鈥?plan item depends on something that isn't available
   - **Genuinely forgotten** 鈥?no evidence of any attempt

Output for each discrepancy:
\`\`\`
DISCREPANCY: {PARTIAL|NOT_DONE} | {plan item} | {what was actually delivered}
INVESTIGATION: {likely reason with evidence from git log / code}
IMPACT: {HIGH|MEDIUM|LOW} 鈥?{what breaks or degrades if this stays undelivered}
\`\`\`

### Learnings Logging (plan-file discrepancies only)

**Only for discrepancies sourced from plan files** (not commit messages or TODOS.md), log a learning so future sessions know this pattern occurred:

\`\`\`bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{
  "type": "pitfall",
  "key": "plan-delivery-gap-KEBAB_SUMMARY",
  "insight": "Planned X but delivered Y because Z",
  "confidence": 8,
  "source": "observed",
  "files": ["PLAN_FILE_PATH"]
}'
\`\`\`

Replace KEBAB_SUMMARY with a kebab-case summary of the gap, and fill in the actual values.

**Do NOT log learnings from commit-message-derived or TODOS.md-derived discrepancies.** These are informational in the review output but too noisy for durable memory.

### Integration with Scope Drift Detection

The plan completion results augment the existing Scope Drift Detection. If a plan file is found:

- **NOT DONE items** become additional evidence for **MISSING REQUIREMENTS** in the scope drift report.
- **Items in the diff that don't match any plan item** become evidence for **SCOPE CREEP** detection.
- **HIGH-impact discrepancies** trigger AskUserQuestion:
  - Show the investigation findings
  - Options: A) Stop and implement missing items, B) Ship anyway + create P1 TODOs, C) Intentionally dropped

This is **INFORMATIONAL** unless HIGH-impact discrepancies are found (then it gates via AskUserQuestion).

Update the scope drift output to include plan file context:

\`\`\`
Scope Check: [CLEAN / DRIFT DETECTED / REQUIREMENTS MISSING]
Intent: <from plan file 鈥?1-line summary>
Plan: <plan file path>
Delivered: <1-line summary of what the diff actually does>
Plan items: N DONE, M PARTIAL, K NOT DONE
[If NOT DONE: list each missing item with investigation]
[If scope creep: list each out-of-scope change not in the plan]
\`\`\`

**No plan file found:** Use commit messages and TODOS.md as fallback sources (see above). If no intent sources at all, skip with: "No intent sources detected 鈥?skipping completion audit."`);
  }

  return sections.join('\n');
}

export function generatePlanCompletionAuditShip(_ctx: TemplateContext): string {
  return generatePlanCompletionAuditInner('ship');
}

export function generatePlanCompletionAuditReview(_ctx: TemplateContext): string {
  return generatePlanCompletionAuditInner('review');
}

// 鈹€鈹€鈹€ Plan Verification Execution 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export function generatePlanVerificationExec(_ctx: TemplateContext): string {
  return `## Step 8.1: Plan Verification

Automatically verify the plan's testing/verification steps using the \`/qa-only\` skill.

### 1. Check for verification section

Using the plan file already discovered in Step 8, look for a verification section. Match any of these headings: \`## Verification\`, \`## Test plan\`, \`## Testing\`, \`## How to test\`, \`## Manual testing\`, or any section with verification-flavored items (URLs to visit, things to check visually, interactions to test).

**If no verification section found:** Skip with "No verification steps found in plan 鈥?skipping auto-verification."
**If no plan file was found in Step 8:** Skip (already handled).

### 2. Check for running dev server

Before invoking browse-based verification, check if a dev server is reachable:

\`\`\`bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || \\
curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 2>/dev/null || \\
curl -s -o /dev/null -w '%{http_code}' http://localhost:5173 2>/dev/null || \\
curl -s -o /dev/null -w '%{http_code}' http://localhost:4000 2>/dev/null || echo "NO_SERVER"
\`\`\`

**If NO_SERVER:** Skip with "No dev server detected 鈥?skipping plan verification. Run /qa separately after deploying."

### 3. Invoke /qa-only inline

Read the \`/qa-only\` skill from disk:

\`\`\`bash
cat \${CLAUDE_SKILL_DIR}/../qa-only/SKILL.md
\`\`\`

**If unreadable:** Skip with "Could not load /qa-only 鈥?skipping plan verification."

Follow the /qa-only workflow with these modifications:
- **Skip the preamble** (already handled by /ship)
- **Use the plan's verification section as the primary test input** 鈥?treat each verification item as a test case
- **Use the detected dev server URL** as the base URL
- **Skip the fix loop** 鈥?this is report-only verification during /ship
- **Cap at the verification items from the plan** 鈥?do not expand into general site QA

### 4. Gate logic

- **All verification items PASS:** Continue silently. "Plan verification: PASS."
- **Any FAIL:** Use AskUserQuestion:
  - Show the failures with screenshot evidence
  - RECOMMENDATION: Choose A if failures indicate broken functionality. Choose B if cosmetic only.
  - Options:
    A) Fix the failures before shipping (recommended for functional issues)
    B) Ship anyway 鈥?known issues (acceptable for cosmetic issues)
- **No verification section / no server / unreadable skill:** Skip (non-blocking).

### 5. Include in PR body

Add a \`## Verification Results\` section to the PR body (Step 19):
- If verification ran: summary of results (N PASS, M FAIL, K SKIPPED)
- If skipped: reason for skipping (no plan, no server, no verification section)`;
}

// 鈹€鈹€鈹€ Cross-Review Finding Dedup 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export function generateCrossReviewDedup(ctx: TemplateContext): string {
  const isShip = ctx.skillName === 'ship';
  const stepNum = isShip ? '9.3' : '5.0';
  const findingsRef = isShip
    ? 'the checklist pass (Step 9) and specialist review (Step 9.1-9.2)'
    : 'Step 4 critical pass and Step 4.5-4.6 specialists';

  return `### 步骤 ${stepNum}: Cross-review finding dedup

Before classifying findings, check if any were previously skipped by the user in a prior review on this branch.

\`\`\`bash
~/.claude/skills/gstack/bin/gstack-review-read
\`\`\`

Parse the output: only lines BEFORE \`---CONFIG---\` are JSONL entries (the output also contains \`---CONFIG---\` and \`---HEAD---\` footer sections that are not JSONL 鈥?ignore those).

For each JSONL entry that has a \`findings\` array:
1. Collect all fingerprints where \`action: "skipped"\`
2. Note the \`commit\` field from that entry

If skipped fingerprints exist, get the list of files changed since that review:

\`\`\`bash
git diff --name-only <prior-review-commit> HEAD
\`\`\`

For each current finding (from both ${findingsRef}), check:
- Does its fingerprint match a previously skipped finding?
- Is the finding's file path NOT in the changed-files set?

If both conditions are true: suppress the finding. It was intentionally skipped and the relevant code hasn't changed.

Print: "Suppressed N findings from prior reviews (previously skipped by user)"

**Only suppress \`skipped\` findings 鈥?never \`fixed\` or \`auto-fixed\`** (those might regress and should be re-checked).

If no prior reviews exist or none have a \`findings\` array, skip this step silently.

Output a summary header: \`Pre-Landing Review: N issues (X critical, Y informational)\``;
}



