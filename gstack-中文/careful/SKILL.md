---
name: careful
version: 0.1.0
description: |-
  破坏性命令的安全护栏。在 rm -rf、DROP TABLE 之前发出警告
  强制推送、git reset --hard、kubectl delete 和类似的破坏性操作。
  用户可以忽略每个警告。在操作生产环境、调试实时系统时使用，
  或在共享环境中工作。当被要求“小心”、“安全模式”时使用，
  “生产模式”或“谨慎模式”。 （gstack）
triggers:
- be careful
- warn before destructive
- safety mode
allowed-tools:
- Bash
- Read
hooks:
  PreToolUse:
  - matcher: "Bash"
    hooks:
    - type: command
      command: "bash ${CLAUDE_SKILL_DIR}/bin/check-careful.sh"
      statusMessage: "正在检查破坏性命令..."
---
<!-- 从 SKILL.md.tmpl 自动生成 — 不要直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->

# /careful — 破坏性命令防护

安全模式现已**激活**。每个 bash 命令在运行前都会被检查是否具有破坏性模式。如果检测到破坏性命令，您将收到警告，并可以选择继续或取消。

```bash
mkdir -p ~/.gstack/analytics
echo '{"skill":"careful","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
```

## 受保护的内容

| 模式 | 例子 | 风险 |
|---------|---------|------|
|__代码_0__ / __代码_1__ / __代码_2__|__代码_0__|递归删除|
|__代码_0__ / __代码_1__|__代码_0__|数据丢失|
|__代码_0__|__代码_0__|数据丢失|
|__代码_0__ / __代码_1__|__代码_0__|历史改写|
|__代码_0__|__代码_0__|未提交的工作丢失|
|__代码_0__ / __代码_1__|__代码_0__|未提交的工作丢失|
|__代码_0__|__代码_0__|生产环境影响|
|__代码_0__ / __代码_1__|__代码_0__|容器/镜像丢失|

## 安全例外

允许使用以下模式而不发出警告：
- `rm -rf node_modules` / `.next` / `dist` / `__pycache__` / `.cache` / `build` / `.turbo` / `coverage`

## 工作原理

该钩子从工具输入 JSON 中读取命令，并根据上述模式进行匹配。如果找到匹配项，则返回 `permissionDecision: "ask"` 和警告消息。您始终可以忽略警告并继续操作。

要停用，请结束对话或开始新对话。该钩子的作用范围是当前会话。