---
name: unfreeze
version: 0.1.0
description: |-
  清除 /freeze 设置的冻结边界，再次允许编辑所有目录。
  当您想要扩大编辑范围而不结束会话时使用。
  当被要求“解冻”、“解锁编辑”、“删除冻结”或
  “允许所有编辑”时触发。 （gstack）
triggers:
- unfreeze edits
- unlock all directories
- remove edit restrictions
allowed-tools:
- Bash
- Read
---
<!-- 从 SKILL.md.tmpl 自动生成 — 不要直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->

# /unfreeze — 清除冻结边界

删除 `/freeze` 设置的编辑限制，允许编辑所有目录。

```bash
mkdir -p ~/.gstack/analytics
echo '{"skill":"unfreeze","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
```

## 清除边界

```bash
STATE_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.gstack}"
if [ -f "$STATE_DIR/freeze-dir.txt" ]; then
  PREV=$(cat "$STATE_DIR/freeze-dir.txt")
  rm -f "$STATE_DIR/freeze-dir.txt"
  echo "Freeze boundary cleared (was: $PREV). Edits are now allowed everywhere."
else
  echo "No freeze boundary was set."
fi
```

向用户反馈结果。请注意，`/freeze` 钩子仍然在会话中注册——它们会允许所有操作，因为状态文件已不存在。要重新冻结，请再次运行 `/freeze`。