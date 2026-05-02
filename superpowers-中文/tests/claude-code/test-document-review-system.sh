#!/usr/bin/env bash
# 集成测试：文档评审系统
# 真实运行 spec/plan 评审，并验证 reviewer 能抓出问题
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

echo "========================================"
echo " 集成测试：文档评审系统"
echo "========================================"
echo ""
echo "该测试通过以下方式验证文档评审系统："
echo "  1. 创建一份故意带错的 spec"
echo "  2. 运行 spec 文档 reviewer"
echo "  3. 验证 reviewer 能抓出这些问题"
echo ""

# 创建测试项目
TEST_PROJECT=$(create_test_project)
echo "测试项目：$TEST_PROJECT"

# 退出时清理
trap "cleanup_test_project $TEST_PROJECT" EXIT

cd "$TEST_PROJECT"

# 创建目录结构
mkdir -p docs/superpowers/specs

# 创建一份故意带错的 spec，供 reviewer 抓问题
cat > docs/superpowers/specs/test-feature-design.md <<'EOF'
# Test Feature Design

## Overview

This is a test feature that does something useful.

## Requirements

1. The feature should work correctly
2. It should be fast
3. TODO: Add more requirements here

## Architecture

The feature will use a simple architecture with:
- A frontend component
- A backend service
- Error handling will be specified later once we understand the failure modes better

## Data Flow

Data flows from the frontend to the backend.

## Testing Strategy

Tests will be written to cover the main functionality.
EOF

# 初始化 git 仓库
git init --quiet
git config user.email "test@test.com"
git config user.name "Test User"
git add .
git commit -m "Initial commit with test spec" --quiet

echo ""
echo "已创建带故意错误的测试 spec："
echo "  - Requirements 章节包含 TODO 占位"
echo "  - Architecture 章节包含 “稍后再定义” 的延后描述"
echo ""
echo "正在运行 spec 文档 reviewer……"
echo ""

# 调用 Claude 审查 spec
OUTPUT_FILE="$TEST_PROJECT/claude-output.txt"

PROMPT="你现在在测试 spec 文档 reviewer。

先阅读 skills/brainstorming/spec-document-reviewer-prompt.md，了解评审格式要求。

然后按模板中的标准，评审这份 spec：
$TEST_PROJECT/docs/superpowers/specs/test-feature-design.md

重点检查：
- TODO、占位符、TBD、不完整章节
- '稍后再定义'、'等 X 完成后再补' 这类延后表述
- 明显比其他部分更空泛或更缺细节的章节

最后严格按模板要求的格式输出评审结果。"

echo "================================================================================"
cd "$SCRIPT_DIR/../.." && timeout 120 claude -p "$PROMPT" --permission-mode bypassPermissions 2>&1 | tee "$OUTPUT_FILE" || {
    echo ""
    echo "================================================================================"
    echo "执行失败（退出码：$?）"
    exit 1
}
echo "================================================================================"

echo ""
echo "开始分析 reviewer 输出……"
echo ""

# 验证测试
FAILED=0

echo "=== 验证测试 ==="
echo ""

# 测试 1：是否发现 TODO
echo "测试 1：reviewer 是否发现 TODO……"
if grep -qi "TODO" "$OUTPUT_FILE" && grep -qi "requirements\|Requirements\|需求" "$OUTPUT_FILE"; then
    echo "  [PASS] reviewer 识别出了 Requirements 章节里的 TODO"
else
    echo "  [FAIL] reviewer 没有识别出 TODO"
    FAILED=$((FAILED + 1))
fi
echo ""

# 测试 2：是否发现“稍后再定义”的延后问题
echo "测试 2：reviewer 是否发现延后定义问题……"
if grep -qi "specified later\|later\|defer\|incomplete\|error handling\|稍后\|延后" "$OUTPUT_FILE"; then
    echo "  [PASS] reviewer 识别出了延后处理的内容"
else
    echo "  [FAIL] reviewer 没有识别出延后内容"
    FAILED=$((FAILED + 1))
fi
echo ""

# 测试 3：输出是否包含 Issues 段
echo "测试 3：评审输出格式……"
if grep -qi "issues\|Issues\|问题" "$OUTPUT_FILE"; then
    echo "  [PASS] 输出中包含 Issues 段"
else
    echo "  [FAIL] 输出缺少 Issues 段"
    FAILED=$((FAILED + 1))
fi
echo ""

# 测试 4：是否没有误判为 Approved
echo "测试 4：reviewer 判定结果……"
if grep -qi "Issues Found\|not approved\|issues found\|未通过\|有问题" "$OUTPUT_FILE"; then
    echo "  [PASS] reviewer 正确识别出问题，没有误判通过"
elif grep -qi "Approved" "$OUTPUT_FILE" && ! grep -qi "Issues Found" "$OUTPUT_FILE"; then
    echo "  [FAIL] reviewer 错误地通过了这份带错 spec"
    FAILED=$((FAILED + 1))
else
    echo "  [PASS] reviewer 识别出了问题（虽然格式不完全一致，但结论正确）"
fi
echo ""

# 汇总
echo "========================================"
echo " 测试总结"
echo "========================================"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "状态：通过"
    echo "所有验证测试均已通过！"
    echo ""
    echo "spec 文档 reviewer 已正确做到："
    echo "  鉁?发现 TODO 占位"
    echo "  鉁?发现“稍后定义”的延后内容"
    echo "  鉁?按要求输出评审格式"
    echo "  鉁?没有错误批准带问题的 spec"
    exit 0
else
    echo "状态：失败"
    echo "共有 $FAILED 项验证失败"
    echo ""
    echo "输出已保存到：$OUTPUT_FILE"
    echo ""
    echo "请查看输出内容，定位具体失败原因。"
    exit 1
fi
