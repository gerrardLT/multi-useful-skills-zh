#!/usr/bin/env bash
# 运行一次 subagent-driven-development 测试
# 用法：./run-test.sh <test-name> [--plugin-dir <path>]
#
# 示例：
#   ./run-test.sh go-fractals
#   ./run-test.sh svelte-todo --plugin-dir /path/to/superpowers

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEST_NAME="${1:?用法: $0 <test-name> [--plugin-dir <path>]}"
shift

# 解析可选参数
PLUGIN_DIR=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --plugin-dir)
      PLUGIN_DIR="$2"
      shift 2
      ;;
    *)
      echo "未知选项：$1"
      exit 1
      ;;
  esac
done

# 默认插件目录为 tests 的上两级
if [[ -z "$PLUGIN_DIR" ]]; then
  PLUGIN_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi

# 验证测试目录存在
TEST_DIR="$SCRIPT_DIR/$TEST_NAME"
if [[ ! -d "$TEST_DIR" ]]; then
  echo "错误：找不到测试 '$TEST_NAME'，路径：$TEST_DIR"
  echo "可用测试："
  ls -1 "$SCRIPT_DIR" | grep -v '\.sh$' | grep -v '\.md$'
  exit 1
fi

# 创建带时间戳的输出目录
TIMESTAMP=$(date +%s)
OUTPUT_BASE="/tmp/superpowers-tests/$TIMESTAMP/subagent-driven-development"
OUTPUT_DIR="$OUTPUT_BASE/$TEST_NAME"
mkdir -p "$OUTPUT_DIR"

echo "=== Subagent-Driven Development 测试 ==="
echo "测试名: $TEST_NAME"
echo "输出目录: $OUTPUT_DIR"
echo "插件目录: $PLUGIN_DIR"
echo ""

# 搭建测试项目
echo ">>> 正在搭建项目……"
"$TEST_DIR/scaffold.sh" "$OUTPUT_DIR/project"
echo ""

# 生成 prompt
PLAN_PATH="$OUTPUT_DIR/project/plan.md"
PROMPT="Execute this plan using superpowers:subagent-driven-development. The plan is at: $PLAN_PATH"

# 用 JSON 输出运行 Claude，方便统计 token
LOG_FILE="$OUTPUT_DIR/claude-output.json"
echo ">>> 正在运行 Claude……"
echo "Prompt: $PROMPT"
echo "日志文件: $LOG_FILE"
echo ""

# 运行 claude 并捕获输出
# 使用 stream-json，以便提取 token 用量
# --dangerously-skip-permissions 用于自动化测试
cd "$OUTPUT_DIR/project"
claude -p "$PROMPT" \
  --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  --output-format stream-json \
  --verbose \
  > "$LOG_FILE" 2>&1 || true

# 输出最终信息
echo ""
echo ">>> 测试完成"
echo "项目目录: $OUTPUT_DIR/project"
echo "Claude 日志: $LOG_FILE"
echo ""

# 如可用，则展示 token 用量
if command -v jq &> /dev/null; then
  echo ">>> Token 用量："
  jq -s '[.[] | select(.type == "result")] | last | .usage' "$LOG_FILE" 2>/dev/null || echo "(无法解析 usage)"
  echo ""
fi

echo ">>> 建议的后续操作："
echo "1. 查看项目：cd $OUTPUT_DIR/project"
echo "2. 查看 Claude 日志：less $LOG_FILE"
echo "3. 检查测试是否通过："
if [[ "$TEST_NAME" == "go-fractals" ]]; then
  echo "   cd $OUTPUT_DIR/project && go test ./..."
elif [[ "$TEST_NAME" == "svelte-todo" ]]; then
  echo "   cd $OUTPUT_DIR/project && npm test && npx playwright test"
fi
