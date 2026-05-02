#!/usr/bin/env bash
# 测试显式技能请求（用户直接点名某个 skill）
# 用法：./run-test.sh <skill-name> <prompt-file>
#
# 验证当用户直接说出 skill 名称时，Claude 是否会触发对应 skill
# （不带插件命名空间前缀）
#
# 使用隔离的 HOME，避免用户本地上下文干扰

set -e

SKILL_NAME="$1"
PROMPT_FILE="$2"
MAX_TURNS="${3:-3}"

if [ -z "$SKILL_NAME" ] || [ -z "$PROMPT_FILE" ]; then
    echo "用法：$0 <skill-name> <prompt-file> [max-turns]"
    echo "示例：$0 subagent-driven-development ./prompts/subagent-driven-development-please.txt"
    exit 1
fi

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 获取 superpowers 插件根目录（向上两级）
PLUGIN_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

TIMESTAMP=$(date +%s)
OUTPUT_DIR="/tmp/superpowers-tests/${TIMESTAMP}/explicit-skill-requests/${SKILL_NAME}"
mkdir -p "$OUTPUT_DIR"

# 从文件读取 prompt
PROMPT=$(cat "$PROMPT_FILE")

echo "=== 显式技能请求测试 ==="
echo "Skill: $SKILL_NAME"
echo "Prompt 文件: $PROMPT_FILE"
echo "最大轮数: $MAX_TURNS"
echo "输出目录: $OUTPUT_DIR"
echo ""

# 复制 prompt，便于留档
cp "$PROMPT_FILE" "$OUTPUT_DIR/prompt.txt"

# 创建最小测试项目目录
PROJECT_DIR="$OUTPUT_DIR/project"
mkdir -p "$PROJECT_DIR/docs/superpowers/plans"

# 为多轮对话场景创建一份假的 plan 文件
cat > "$PROJECT_DIR/docs/superpowers/plans/auth-system.md" << 'EOF'
# Auth System Implementation Plan

## Task 1: Add User Model
Create user model with email and password fields.

## Task 2: Add Auth Routes
Create login and register endpoints.

## Task 3: Add JWT Middleware
Protect routes with JWT validation.
EOF

# 在隔离环境中运行 Claude
LOG_FILE="$OUTPUT_DIR/claude-output.json"
cd "$PROJECT_DIR"

echo "插件目录: $PLUGIN_DIR"
echo "正在运行 claude -p，并发起显式技能请求……"
echo "Prompt: $PROMPT"
echo ""

timeout 300 claude -p "$PROMPT" \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns "$MAX_TURNS" \
    --output-format stream-json \
    > "$LOG_FILE" 2>&1 || true

echo ""
echo "=== 测试结果 ==="

# 检查 skill 是否被触发（兼容有无命名空间前缀两种情况）
SKILL_PATTERN='"skill":"([^"]*:)?'"${SKILL_NAME}"'"'
if grep -q '"name":"Skill"' "$LOG_FILE" && grep -qE "$SKILL_PATTERN" "$LOG_FILE"; then
    echo "PASS: Skill '$SKILL_NAME' 已被触发"
    TRIGGERED=true
else
    echo "FAIL: Skill '$SKILL_NAME' 没有被触发"
    TRIGGERED=false
fi

# 展示本轮实际触发了哪些 skills
echo ""
echo "本轮触发的 Skills："
grep -o '"skill":"[^"]*"' "$LOG_FILE" 2>/dev/null | sort -u || echo "  (none)"

# 检查 Claude 是否在调用 skill 之前就抢先开始干活
echo ""
echo "检查是否存在过早行动……"

FIRST_SKILL_LINE=$(grep -n '"name":"Skill"' "$LOG_FILE" | head -1 | cut -d: -f1)
if [ -n "$FIRST_SKILL_LINE" ]; then
    PREMATURE_TOOLS=$(head -n "$FIRST_SKILL_LINE" "$LOG_FILE" | \
        grep '"type":"tool_use"' | \
        grep -v '"name":"Skill"' | \
        grep -v '"name":"TodoWrite"' || true)
    if [ -n "$PREMATURE_TOOLS" ]; then
        echo "WARNING: 在调用 Skill 之前已经先调用了其他工具："
        echo "$PREMATURE_TOOLS" | head -5
        echo ""
        echo "这说明 Claude 在载入请求的 skill 之前就已经开始做事。"
    else
        echo "OK: 未发现过早工具调用"
    fi
else
    echo "WARNING: 完全没有发现 Skill 调用"
fi

# 展示第一条 assistant 回复
echo ""
echo "第一条 assistant 回复（截断显示）："
grep '"type":"assistant"' "$LOG_FILE" | head -1 | jq -r '.message.content[0].text // .message.content' 2>/dev/null | head -c 500 || echo "  (无法提取)"

echo ""
echo "完整日志: $LOG_FILE"
echo "时间戳: $TIMESTAMP"

if [ "$TRIGGERED" = "true" ]; then
    exit 0
else
    exit 1
fi
