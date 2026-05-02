#!/usr/bin/env bash
# 使用 haiku 模型和用户自己的 CLAUDE.md 进行测试
# 该测试用于观察更便宜、更快的模型是否更容易遗漏技能调用

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

TIMESTAMP=$(date +%s)
OUTPUT_DIR="/tmp/superpowers-tests/${TIMESTAMP}/explicit-skill-requests/haiku"
mkdir -p "$OUTPUT_DIR"

PROJECT_DIR="$OUTPUT_DIR/project"
mkdir -p "$PROJECT_DIR/docs/superpowers/plans"
mkdir -p "$PROJECT_DIR/.claude"

echo "=== Haiku 模型 + 用户 CLAUDE.md 测试 ==="
echo "输出目录: $OUTPUT_DIR"
echo "插件目录: $PLUGIN_DIR"
echo ""

cd "$PROJECT_DIR"

# 复制用户自己的 CLAUDE.md，尽量模拟真实环境
if [ -f "$HOME/.claude/CLAUDE.md" ]; then
    cp "$HOME/.claude/CLAUDE.md" "$PROJECT_DIR/.claude/CLAUDE.md"
    echo "已复制用户 CLAUDE.md"
else
    echo "未找到用户 CLAUDE.md，将在无该文件的情况下继续"
fi

# 创建一份假的 plan 文件
cat > "$PROJECT_DIR/docs/superpowers/plans/auth-system.md" << 'EOF'
# Auth System Implementation Plan

## Task 1: Add User Model
Create user model with email and password fields.

## Task 2: Add Auth Routes
Create login and register endpoints.

## Task 3: Add JWT Middleware
Protect routes with JWT validation.

## Task 4: Write Tests
Add comprehensive test coverage.
EOF

echo ""

# 第 1 轮：开始 brainstorming
echo ">>> 第 1 轮：发起 brainstorming 请求……"
claude -p "我想在应用里加入用户认证。先帮我把思路理一理。" \
    --model haiku \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 3 \
    --output-format stream-json \
    > "$OUTPUT_DIR/turn1.json" 2>&1 || true
echo "完成。"

# 第 2 轮：回答澄清问题
echo ">>> 第 2 轮：回答问题……"
claude -p "我们用 JWT，过期时间 24 小时。注册方式是邮箱加密码。" \
    --continue \
    --model haiku \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 3 \
    --output-format stream-json \
    > "$OUTPUT_DIR/turn2.json" 2>&1 || true
echo "完成。"

# 第 3 轮：要求写计划
echo ">>> 第 3 轮：请求写计划……"
claude -p "很好，把这些整理成一份实现计划。" \
    --continue \
    --model haiku \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 3 \
    --output-format stream-json \
    > "$OUTPUT_DIR/turn3.json" 2>&1 || true
echo "完成。"

# 第 4 轮：确认计划
echo ">>> 第 4 轮：确认计划……"
claude -p "这个计划看起来不错。现在告诉我执行它有哪些方式。" \
    --continue \
    --model haiku \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 2 \
    --output-format stream-json \
    > "$OUTPUT_DIR/turn4.json" 2>&1 || true
echo "完成。"

# 第 5 轮：关键测试
echo ">>> 第 5 轮：请求 subagent-driven-development……"
FINAL_LOG="$OUTPUT_DIR/turn5.json"
claude -p "subagent-driven-development, please" \
    --continue \
    --model haiku \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 2 \
    --output-format stream-json \
    > "$FINAL_LOG" 2>&1 || true
echo "完成。"
echo ""

echo "=== 测试结果（Haiku） ==="

# 检查最终一轮是否触发了 skill
SKILL_PATTERN='"skill":"([^"]*:)?subagent-driven-development"'
if grep -q '"name":"Skill"' "$FINAL_LOG" && grep -qE "$SKILL_PATTERN" "$FINAL_LOG"; then
    echo "PASS: Skill 已被触发"
    TRIGGERED=true
else
    echo "FAIL: Skill 没有被触发"
    TRIGGERED=false

    echo ""
    echo "最终一轮调用的工具："
    grep '"type":"tool_use"' "$FINAL_LOG" | grep -o '"name":"[^"]*"' | head -10 || echo "  (none)"
fi

echo ""
echo "触发的 Skills："
grep -o '"skill":"[^"]*"' "$FINAL_LOG" 2>/dev/null | sort -u || echo "  (none)"

echo ""
echo "最终一轮回复（前 500 字符）："
grep '"type":"assistant"' "$FINAL_LOG" | head -1 | jq -r '.message.content[0].text // .message.content' 2>/dev/null | head -c 500 || echo "  (无法提取)"

echo ""
echo "日志目录：$OUTPUT_DIR"

if [ "$TRIGGERED" = "true" ]; then
    exit 0
else
    exit 1
fi
