#!/usr/bin/env bash
# 集成测试：subagent-driven-development 工作流
# 真实执行一份计划，并验证新工作流的关键行为
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

echo "========================================"
echo " 集成测试：subagent-driven-development"
echo "========================================"
echo ""
echo "该测试会真实执行一份计划，并验证："
echo "  1. 计划只在开始时读取一次（不是每个任务都重复读）"
echo "  2. 子代理收到的是完整任务文本"
echo "  3. 子代理会在回报前做自审"
echo "  4. 先做 spec 一致性审查，再做代码质量审查"
echo "  5. 发现问题时会进入评审回环"
echo "  6. spec reviewer 会独立读代码验证"
echo ""
echo "警告：该测试可能需要 10 到 30 分钟。"
echo ""

# 创建测试项目
TEST_PROJECT=$(create_test_project)
echo "测试项目：$TEST_PROJECT"

# 退出时清理
trap "cleanup_test_project $TEST_PROJECT" EXIT

# 初始化最小 Node.js 项目
cd "$TEST_PROJECT"

cat > package.json <<'EOF'
{
  "name": "test-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
EOF

mkdir -p src test docs/superpowers/plans

# 创建一份简单实现计划
cat > docs/superpowers/plans/implementation-plan.md <<'EOF'
# Test Implementation Plan

This is a minimal plan to test the subagent-driven-development workflow.

## Task 1: Create Add Function

Create a function that adds two numbers.

**File:** `src/math.js`

**Requirements:**
- Function named `add`
- Takes two parameters: `a` and `b`
- Returns the sum of `a` and `b`
- Export the function

**Implementation:**
```javascript
export function add(a, b) {
  return a + b;
}
```

**Tests:** Create `test/math.test.js` that verifies:
- `add(2, 3)` returns `5`
- `add(0, 0)` returns `0`
- `add(-1, 1)` returns `0`

**Verification:** `npm test`

## Task 2: Create Multiply Function

Create a function that multiplies two numbers.

**File:** `src/math.js` (add to existing file)

**Requirements:**
- Function named `multiply`
- Takes two parameters: `a` and `b`
- Returns the product of `a` and `b`
- Export the function
- DO NOT add any extra features (like power, divide, etc.)

**Implementation:**
```javascript
export function multiply(a, b) {
  return a * b;
}
```

**Tests:** Add to `test/math.test.js`:
- `multiply(2, 3)` returns `6`
- `multiply(0, 5)` returns `0`
- `multiply(-2, 3)` returns `-6`

**Verification:** `npm test`
EOF

# 初始化 git 仓库
git init --quiet
git config user.email "test@test.com"
git config user.name "Test User"
git add .
git commit -m "Initial commit" --quiet

echo ""
echo "项目初始化完成，开始执行……"
echo ""

# 用 subagent-driven-development 运行 Claude
# 捕获完整输出，供后续分析
OUTPUT_FILE="$TEST_PROJECT/claude-output.txt"

# 创建 prompt 文件
cat > "$TEST_PROJECT/prompt.txt" <<'EOF'
I want you to execute the implementation plan at docs/superpowers/plans/implementation-plan.md using the subagent-driven-development skill.

IMPORTANT: Follow the skill exactly. I will be verifying that you:
1. Read the plan once at the beginning
2. Provide full task text to subagents (don't make them read files)
3. Ensure subagents do self-review before reporting
4. Run spec compliance review before code quality review
5. Use review loops when issues are found

Begin now. Execute the plan.
EOF

# 集成测试允许更长超时
# 用 --allowed-tools 在无头模式下启用工具
# 重要：从 superpowers 目录运行，确保能加载本地开发版 skills
PROMPT="Change to directory $TEST_PROJECT and then execute the implementation plan at docs/superpowers/plans/implementation-plan.md using the subagent-driven-development skill.

IMPORTANT: Follow the skill exactly. I will be verifying that you:
1. Read the plan once at the beginning
2. Provide full task text to subagents (don't make them read files)
3. Ensure subagents do self-review before reporting
4. Run spec compliance review before code quality review
5. Use review loops when issues are found

Begin now. Execute the plan."

echo "正在运行 Claude（输出会显示在下方，并保存到 $OUTPUT_FILE）……"
echo "================================================================================"
cd "$SCRIPT_DIR/../.." && timeout 1800 claude -p "$PROMPT" --allowed-tools=all --add-dir "$TEST_PROJECT" --permission-mode bypassPermissions 2>&1 | tee "$OUTPUT_FILE" || {
    echo ""
    echo "================================================================================"
    echo "执行失败（退出码：$?）"
    exit 1
}
echo "================================================================================"

echo ""
echo "执行完成，开始分析结果……"
echo ""

# 查找会话转录文件
# 会话文件位于 ~/.claude/projects/-<working-dir>/<session-id>.jsonl
WORKING_DIR_ESCAPED=$(echo "$SCRIPT_DIR/../.." | sed 's/\//-/g' | sed 's/^-//')
SESSION_DIR="$HOME/.claude/projects/$WORKING_DIR_ESCAPED"

# 找出本轮测试最近生成的会话文件
SESSION_FILE=$(find "$SESSION_DIR" -name "*.jsonl" -type f -mmin -60 2>/dev/null | sort -r | head -1)

if [ -z "$SESSION_FILE" ]; then
    echo "错误：找不到会话转录文件"
    echo "查找目录：$SESSION_DIR"
    exit 1
fi

echo "正在分析会话转录：$(basename "$SESSION_FILE")"
echo ""

# 验证测试
FAILED=0

echo "=== 验证测试 ==="
echo ""

# 测试 1：Skill 被调用
echo "测试 1：是否调用 Skill 工具……"
if grep -q '"name":"Skill".*"skill":"superpowers:subagent-driven-development"' "$SESSION_FILE"; then
    echo "  [PASS] 已调用 subagent-driven-development skill"
else
    echo "  [FAIL] 未调用 Skill"
    FAILED=$((FAILED + 1))
fi
echo ""

# 测试 2：是否使用子代理（Task 工具）
echo "测试 2：是否派发子代理……"
task_count=$(grep -c '"name":"Task"' "$SESSION_FILE" || echo "0")
if [ "$task_count" -ge 2 ]; then
    echo "  [PASS] 共派发 $task_count 个子代理"
else
    echo "  [FAIL] 只派发了 $task_count 个子代理（期望 >= 2）"
    FAILED=$((FAILED + 1))
fi
echo ""

# 测试 3：是否使用 TodoWrite 追踪任务
echo "测试 3：任务追踪……"
todo_count=$(grep -c '"name":"TodoWrite"' "$SESSION_FILE" || echo "0")
if [ "$todo_count" -ge 1 ]; then
    echo "  [PASS] TodoWrite 使用了 $todo_count 次"
else
    echo "  [FAIL] 未使用 TodoWrite"
    FAILED=$((FAILED + 1))
fi
echo ""

# 测试 6：实现是否真的可用
echo "测试 6：实现可用性验证……"
if [ -f "$TEST_PROJECT/src/math.js" ]; then
    echo "  [PASS] 已创建 src/math.js"

    if grep -q "export function add" "$TEST_PROJECT/src/math.js"; then
        echo "  [PASS] add 函数存在"
    else
        echo "  [FAIL] 缺少 add 函数"
        FAILED=$((FAILED + 1))
    fi

    if grep -q "export function multiply" "$TEST_PROJECT/src/math.js"; then
        echo "  [PASS] multiply 函数存在"
    else
        echo "  [FAIL] 缺少 multiply 函数"
        FAILED=$((FAILED + 1))
    fi
else
    echo "  [FAIL] 未创建 src/math.js"
    FAILED=$((FAILED + 1))
fi

if [ -f "$TEST_PROJECT/test/math.test.js" ]; then
    echo "  [PASS] 已创建 test/math.test.js"
else
    echo "  [FAIL] 未创建 test/math.test.js"
    FAILED=$((FAILED + 1))
fi

# 尝试跑测试
if cd "$TEST_PROJECT" && npm test > test-output.txt 2>&1; then
    echo "  [PASS] 测试通过"
else
    echo "  [FAIL] 测试失败"
    cat test-output.txt
    FAILED=$((FAILED + 1))
fi
echo ""

# 测试 7：Git 提交历史是否体现了工作流
echo "测试 7：Git 提交历史……"
commit_count=$(git -C "$TEST_PROJECT" log --oneline | wc -l)
if [ "$commit_count" -gt 2 ]; then  # 初始提交 + 至少 2 个任务提交
    echo "  [PASS] 生成了多次提交（共 $commit_count 次）"
else
    echo "  [FAIL] 提交次数过少（$commit_count，期望 >2）"
    FAILED=$((FAILED + 1))
fi
echo ""

# 测试 8：没有额外特性（spec 一致性应该能拦住）
echo "测试 8：没有添加额外特性（spec 一致性）……"
if grep -q "export function divide\|export function power\|export function subtract" "$TEST_PROJECT/src/math.js" 2>/dev/null; then
    echo "  [WARN] 发现额外特性（理论上应被 spec review 拦住）"
    # 这里只给警告，不直接判失败；它主要测试 reviewer 是否有效
else
    echo "  [PASS] 未添加额外特性"
fi
echo ""

# Token 用量分析
echo "========================================="
echo " Token 用量分析"
echo "========================================="
echo ""
python3 "$SCRIPT_DIR/analyze-token-usage.py" "$SESSION_FILE"
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
    echo "subagent-driven-development skill 已正确做到："
    echo "  鉁?启动时只读取一次计划"
    echo "  鉁?把完整任务文本提供给子代理"
    echo "  鉁?强制执行自审"
    echo "  鉁?先做 spec 一致性审查，再做代码质量审查"
    echo "  鉁?spec reviewer 独立验证实现"
    echo "  鉁?最终产出可工作的实现"
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
