#!/usr/bin/env bash
# Claude Code skill 测试辅助函数

# 运行 Claude Code 并捕获输出
# 用法：run_claude "prompt 文本" [timeout_seconds] [allowed_tools]
run_claude() {
    local prompt="$1"
    local timeout="${2:-60}"
    local allowed_tools="${3:-}"
    local output_file
    output_file=$(mktemp)

    # 组装命令
    local cmd="claude -p \"$prompt\""
    if [ -n "$allowed_tools" ]; then
        cmd="$cmd --allowed-tools=$allowed_tools"
    fi

    # 在无头模式下运行 Claude，并设置超时
    if timeout "$timeout" bash -c "$cmd" > "$output_file" 2>&1; then
        cat "$output_file"
        rm -f "$output_file"
        return 0
    else
        local exit_code=$?
        cat "$output_file" >&2
        rm -f "$output_file"
        return $exit_code
    fi
}

# 检查输出是否包含某个模式
# 用法：assert_contains "output" "pattern" "test name"
assert_contains() {
    local output="$1"
    local pattern="$2"
    local test_name="${3:-test}"

    if echo "$output" | grep -q "$pattern"; then
        echo "  [PASS] $test_name"
        return 0
    else
        echo "  [FAIL] $test_name"
        echo "  期望找到：$pattern"
        echo "  实际输出："
        echo "$output" | sed 's/^/    /'
        return 1
    fi
}

# 检查输出是否不包含某个模式
# 用法：assert_not_contains "output" "pattern" "test name"
assert_not_contains() {
    local output="$1"
    local pattern="$2"
    local test_name="${3:-test}"

    if echo "$output" | grep -q "$pattern"; then
        echo "  [FAIL] $test_name"
        echo "  不应出现：$pattern"
        echo "  实际输出："
        echo "$output" | sed 's/^/    /'
        return 1
    else
        echo "  [PASS] $test_name"
        return 0
    fi
}

# 检查输出中的模式计数
# 用法：assert_count "output" "pattern" expected_count "test name"
assert_count() {
    local output="$1"
    local pattern="$2"
    local expected="$3"
    local test_name="${4:-test}"

    local actual
    actual=$(echo "$output" | grep -c "$pattern" || echo "0")

    if [ "$actual" -eq "$expected" ]; then
        echo "  [PASS] $test_name（找到 $actual 次）"
        return 0
    else
        echo "  [FAIL] $test_name"
        echo "  期望 $expected 次：$pattern"
        echo "  实际找到 $actual 次"
        echo "  实际输出："
        echo "$output" | sed 's/^/    /'
        return 1
    fi
}

# 检查模式 A 是否出现在模式 B 之前
# 用法：assert_order "output" "pattern_a" "pattern_b" "test name"
assert_order() {
    local output="$1"
    local pattern_a="$2"
    local pattern_b="$3"
    local test_name="${4:-test}"

    # 获取模式出现的行号
    local line_a
    local line_b
    line_a=$(echo "$output" | grep -n "$pattern_a" | head -1 | cut -d: -f1)
    line_b=$(echo "$output" | grep -n "$pattern_b" | head -1 | cut -d: -f1)

    if [ -z "$line_a" ]; then
        echo "  [FAIL] $test_name：找不到模式 A：$pattern_a"
        return 1
    fi

    if [ -z "$line_b" ]; then
        echo "  [FAIL] $test_name：找不到模式 B：$pattern_b"
        return 1
    fi

    if [ "$line_a" -lt "$line_b" ]; then
        echo "  [PASS] $test_name（A 在第 $line_a 行，B 在第 $line_b 行）"
        return 0
    else
        echo "  [FAIL] $test_name"
        echo "  期望 '$pattern_a' 出现在 '$pattern_b' 之前"
        echo "  但实际 A 在第 $line_a 行，B 在第 $line_b 行"
        return 1
    fi
}

# 创建临时测试项目目录
# 用法：test_project=$(create_test_project)
create_test_project() {
    local test_dir
    test_dir=$(mktemp -d)
    echo "$test_dir"
}

# 清理测试项目
# 用法：cleanup_test_project "$test_dir"
cleanup_test_project() {
    local test_dir="$1"
    if [ -d "$test_dir" ]; then
        rm -rf "$test_dir"
    fi
}

# 创建用于测试的简单计划文件
# 用法：create_test_plan "$project_dir" "$plan_name"
create_test_plan() {
    local project_dir="$1"
    local plan_name="${2:-test-plan}"
    local plan_file="$project_dir/docs/superpowers/plans/$plan_name.md"

    mkdir -p "$(dirname "$plan_file")"

    cat > "$plan_file" <<'EOF'
# Test Implementation Plan

## Task 1: Create Hello Function

Create a simple hello function that returns "Hello, World!".

**File:** `src/hello.js`

**Implementation:**
```javascript
export function hello() {
  return "Hello, World!";
}
```

**Tests:** Write a test that verifies the function returns the expected string.

**Verification:** `npm test`

## Task 2: Create Goodbye Function

Create a goodbye function that takes a name and returns a goodbye message.

**File:** `src/goodbye.js`

**Implementation:**
```javascript
export function goodbye(name) {
  return `Goodbye, ${name}!`;
}
```

**Tests:** Write tests for:
- Default name
- Custom name
- Edge cases (empty string, null)

**Verification:** `npm test`
EOF

    echo "$plan_file"
}

# 导出函数，供测试脚本使用
export -f run_claude
export -f assert_contains
export -f assert_not_contains
export -f assert_count
export -f assert_order
export -f create_test_project
export -f cleanup_test_project
export -f create_test_plan
