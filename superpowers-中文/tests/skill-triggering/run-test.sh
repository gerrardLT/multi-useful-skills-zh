#!/usr/bin/env bash
# 测试 skill 在自然提示词下是否会被自动触发
# 用法: ./run-test.sh <skill-name> <prompt-file> [max-turns]
#
# 这个脚本会验证 Claude 是否会根据自然语言提示，
# 在未显式提到 skill 名称时主动触发对应 skill。

set -e

SKILL_NAME="$1"
PROMPT_FILE="$2"
MAX_TURNS="${3:-3}"

if [ -z "$SKILL_NAME" ] || [ -z "$PROMPT_FILE" ]; then
    echo "用法: $0 <skill-name> <prompt-file> [max-turns]"
    echo "示例: $0 systematic-debugging ./test-prompts/debugging.txt"
    exit 1
fi

# 当前脚本所在目录，应为 tests/skill-triggering
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# superpowers 插件根目录，位于 tests/skill-triggering 上两级
PLUGIN_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

TIMESTAMP=$(date +%s)
OUTPUT_DIR="/tmp/superpowers-tests/${TIMESTAMP}/skill-triggering/${SKILL_NAME}"
mkdir -p "$OUTPUT_DIR"

# 从文件读取提示词
PROMPT=$(cat "$PROMPT_FILE")

echo "=== Skill 触发测试 ==="
echo "Skill: $SKILL_NAME"
echo "提示词文件: $PROMPT_FILE"
echo "最大轮数: $MAX_TURNS"
echo "输出目录: $OUTPUT_DIR"
echo ""

# 复制提示词，便于回看
cp "$PROMPT_FILE" "$OUTPUT_DIR/prompt.txt"

# 运行 Claude
LOG_FILE="$OUTPUT_DIR/claude-output.json"
cd "$OUTPUT_DIR"

echo "插件目录: $PLUGIN_DIR"
echo "正在用自然提示词运行 claude -p..."
timeout 300 claude -p "$PROMPT" \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns "$MAX_TURNS" \
    --output-format stream-json \
    > "$LOG_FILE" 2>&1 || true

echo ""
echo "=== 测试结果 ==="

# 检查 skill 是否被触发
# stream-json 中工具调用字段为 "name":"Skill"，不是 "tool":"Skill"
# 同时兼容 "skill":"skillname" 与 "skill":"namespace:skillname"
SKILL_PATTERN='"skill":"([^"]*:)?'"${SKILL_NAME}"'"'
if grep -q '"name":"Skill"' "$LOG_FILE" && grep -qE "$SKILL_PATTERN" "$LOG_FILE"; then
    echo "PASS: Skill '$SKILL_NAME' 已触发"
    TRIGGERED=true
else
    echo "FAIL: Skill '$SKILL_NAME' 未触发"
    TRIGGERED=false
fi

# 展示本次实际触发了哪些 skill
echo ""
echo "本次运行触发的 skill:"
grep -o '"skill":"[^"]*"' "$LOG_FILE" 2>/dev/null | sort -u || echo "  (无)"

# 展示首条 assistant 回复
echo ""
echo "首条 assistant 回复（截断）:"
grep '"type":"assistant"' "$LOG_FILE" | head -1 | jq -r '.message.content[0].text // .message.content' 2>/dev/null | head -c 500 || echo "  (提取失败)"

echo ""
echo "完整日志: $LOG_FILE"
echo "时间戳: $TIMESTAMP"

if [ "$TRIGGERED" = "true" ]; then
    exit 0
else
    exit 1
fi
