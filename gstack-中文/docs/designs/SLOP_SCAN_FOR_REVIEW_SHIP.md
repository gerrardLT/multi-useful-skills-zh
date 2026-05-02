# 设计：在 `/review` 和 `/ship` 中集成 slop-scan

Status: deferred
Created: 2026-04-09
Depends on: slop-diff script (scripts/slop-diff.ts, already landed)

## 问题

目前只有手动运行 `bun run slop:diff` 时，才能看到 slop-scan 的结果。
它应该像 SQL 安全检查和 trust boundary 检查一样，在代码评审和发版过程中自动展示出来。

## 集成点

### /review（第 4 步，在 checklist pass 之后）

在 critical / informational checklist pass 之后运行 `bun run slop:diff`。把新发现以内联形式展示到其他 review 输出中：

```
Pre-Landing Review: 3 issues (1 critical, 2 informational)

AI Slop: +2 new findings, -0 removed
  browse/src/new-feature.ts
    defensive.empty-catch: 2 locations
      line 42: empty catch, boundary=filesystem
      line 87: empty catch, boundary=process
```

分类：INFORMATIONAL。它永远不阻塞 merge，只负责暴露这种模式。

适用 Fix-First heuristic：
如果发现的是文件操作周围的 empty catch，就自动改成 `safeUnlink()`。
如果是 extension 代码里的 catch-and-log，则跳过，因为根据 `CLAUDE.md` 指南，这本来就是正确模式。

### /ship（第 3.5 步，pre-landing review + PR body）

与 `/review` 使用相同集成方式。另外，在 PR body 中增加一行摘要：

```markdown
## Pre-Landing Review
- 2 issues auto-fixed, 0 needs input
- AI Slop: +0 new / -3 removed
```

### Review Readiness Dashboard

**不要**新增一行。Slop 是基于 diff 的诊断项，不是一个可独立“运行”的 review。
它应作为 Eng Review 输出的一部分出现，而不是单独占一个 dashboard 条目。

## 哪些自动修，哪些跳过

遵循 `CLAUDE.md` 的 “Slop-scan” 部分。摘要如下：

**自动修复（确实能提升质量）：**
- `fs.unlinkSync` 周围的 empty catch -> 改成 `safeUnlink()`
- `process.kill` 周围的 empty catch -> 改成 `safeKill()`
- 没有外层 try 的 `return await` -> 去掉 `await`
- URL parsing 周围没有类型收窄的 catch -> 增加 `instanceof TypeError` 判断

**跳过（虽然会被 slop-scan 标记，但本来就是正确模式）：**
- fire-and-forget 浏览器操作上的 `.catch(() => {})`，例如 `page.close`、`bringToFront`
- Chrome extension 代码中的 catch-and-log，因为未捕获错误会直接让扩展崩掉
- 关闭或应急路径里的 `safeUnlinkQuiet`，这里吞掉所有错误是正确的
- 委派给 active session 的透传包装层，用于维持 API 稳定性

## 实现说明

- `scripts/slop-diff.ts` 已经处理了主要工作，包括基于 worktree 的基线比较、对行号不敏感的指纹，以及优雅回退
- review / ship skills 会运行 bash block，所以集成方式就是：执行脚本、解析输出、把结果并入 review findings
- 如果 slop-scan 未安装，也就是 `npx slop-scan` 失败，则静默跳过
- 该脚本始终以 0 退出，它只是诊断信息，不参与 gate

## 工作量估算

| Task | Human | CC+gstack |
|------|-------|-----------|
| Add to review/SKILL.md.tmpl | 2 hours | 10 min |
| Add to ship/SKILL.md.tmpl | 2 hours | 10 min |
| Add to review/checklist.md | 1 hour | 5 min |
| Test with actual PRs | 2 hours | 15 min |
| Regenerate SKILL.md files | - | 1 min |