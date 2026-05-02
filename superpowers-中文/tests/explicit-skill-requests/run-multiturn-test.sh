#!/usr/bin/env bash
# 测试多轮对话中的显式技能请求
# 用法：./run-multiturn-test.sh
#
# 该测试会构造真实对话历史，以复现一种失败模式：
# 当对话已经持续较久时，Claude 可能跳过技能调用

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

TIMESTAMP=$(date +%s)
OUTPUT_DIR="/tmp/superpowers-tests/${TIMESTAMP}/explicit-skill-requests/multiturn"
mkdir -p "$OUTPUT_DIR"

# 创建项目目录（对话上下文基于 cwd）
PROJECT_DIR="$OUTPUT_DIR/project"
mkdir -p "$PROJECT_DIR/docs/superpowers/plans"

echo "=== 多轮显式技能请求测试 ==="
echo "输出目录: $OUTPUT_DIR"
echo "项目目录: $PROJECT_DIR"
echo "插件目录: $PLUGIN_DIR"
echo ""

cd "$PROJECT_DIR"

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

# 第 1 轮：开始规划对话
echo ">>> 第 1 轮：开始规划对话……"
TURN1_LOG="$OUTPUT_DIR/turn1.json"
claude -p "我需要实现一个认证系统。我们先一起规划一下。需求是：邮箱/密码注册、JWT token，以及受保护路由。" \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 2 \
    --output-format stream-json \
    > "$TURN1_LOG" 2>&1 || true

echo "第 1 轮完成。"
echo ""

# 第 2 轮：继续补充规划细节
echo ">>> 第 2 轮：继续规划……"
TURN2_LOG="$OUTPUT_DIR/turn2.json"
claude -p "分析不错。我已经把计划写到了 docs/superpowers/plans/auth-system.md。现在我准备开始实现了。你给我讲讲执行方式有哪些。" \
    --continue \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 2 \
    --output-format stream-json \
    > "$TURN2_LOG" 2>&1 || true

echo "第 2 轮完成。"
echo ""

# 第 3 轮：关键测试
echo ">>> 第 3 轮：请求 subagent-driven-development……"
TURN3_LOG="$OUTPUT_DIR/turn3.json"
claude -p "subagent-driven-development, please" \
    --continue \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 2 \
    --output-format stream-json \
    > "$TURN3_LOG" 2>&1 || true

echo "第 3 轮完成。"
echo ""

echo "=== 测试结果 ==="

# 检查第 3 轮中 skill 是否被触发
SKILL_PATTERN='"skill":"([^"]*:)?subagent-driven-development"'
if grep -q '"name":"Skill"' "$TURN3_LOG" && grep -qE "$SKILL_PATTERN" "$TURN3_LOG"; then
    echo "PASS: 第 3 轮成功触发 'subagent-driven-development'"
    TRIGGERED=true
else
    echo "FAIL: 第 3 轮没有触发 'subagent-driven-development'"
    TRIGGERED=false
fi

# 展示实际触发了哪些 skills
echo ""
echo "第 3 轮触发的 Skills："
grep -o '"skill":"[^"]*"' "$TURN3_LOG" 2>/dev/null | sort -u || echo "  (none)"

# 检查第 3 轮是否存在过早行动
echo ""
echo "检查第 3 轮是否存在过早行动……"
FIRST_SKILL_LINE=$(grep -n '"name":"Skill"' "$TURN3_LOG" | head -1 | cut -d: -f1)
if [ -n "$FIRST_SKILL_LINE" ]; then
    PREMATURE_TOOLS=$(head -n "$FIRST_SKILL_LINE" "$TURN3_LOG" | \
        grep '"type":"tool_use"' | \
        grep -v '"name":"Skill"' | \
        grep -v '"name":"TodoWrite"' || true)
    if [ -n "$PREMATURE_TOOLS" ]; then
        echo "WARNING: 第 3 轮在调用 Skill 前，已经先调用了其他工具："
        echo "$PREMATURE_TOOLS" | head -5
    else
        echo "OK: 未检测到过早工具调用"
    fi
else
    echo "WARNING: 第 3 轮中完全没有发现 Skill 调用"
    echo ""
    echo "第 3 轮实际调用的工具："
    grep '"type":"tool_use"' "$TURN3_LOG" | grep -o '"name":"[^"]*"' | head -10 || echo "  (none)"
fi

# 展示第 3 轮 assistant 回复
echo ""
echo "第 3 轮第一条 assistant 回复（截断显示）："
grep '"type":"assistant"' "$TURN3_LOG" | head -1 | jq -r '.message.content[0].text // .message.content' 2>/dev/null | head -c 500 || echo "  (无法提取)"

echo ""
echo "日志文件："
echo "  第 1 轮: $TURN1_LOG"
echo "  第 2 轮: $TURN2_LOG"
echo "  第 3 轮: $TURN3_LOG"
echo "时间戳: $TIMESTAMP"

if [ "$TRIGGERED" = "true" ]; then
    exit 0
else
    exit 1
fi
