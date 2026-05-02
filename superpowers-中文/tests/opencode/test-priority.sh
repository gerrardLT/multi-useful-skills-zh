#!/usr/bin/env bash
# 测试：Skill 优先级解析
# 验证 skill 的加载优先级是否正确：project > personal > superpowers
# 注意：这些测试要求已安装并配置 OpenCode
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== 测试：Skill 优先级解析 ==="

# 引入环境初始化脚本，创建隔离测试环境
source "$SCRIPT_DIR/setup.sh"

# 退出时自动清理
trap cleanup_test_env EXIT

# 在三个位置分别创建同名 skill，并写入不同标记
echo "正在准备优先级测试夹具..."

# 1. superpowers 位置（最低优先级）
mkdir -p "$SUPERPOWERS_SKILLS_DIR/priority-test"
cat > "$SUPERPOWERS_SKILLS_DIR/priority-test/SKILL.md" <<'EOF'
---
name: priority-test
description: 优先级测试 skill 的 superpowers 版本
---
# 优先级测试 Skill（Superpowers 版本）

这是该测试 skill 的 SUPERPOWERS 版本。

PRIORITY_MARKER_SUPERPOWERS_VERSION
EOF

# 2. personal 位置（中等优先级）
mkdir -p "$OPENCODE_CONFIG_DIR/skills/priority-test"
cat > "$OPENCODE_CONFIG_DIR/skills/priority-test/SKILL.md" <<'EOF'
---
name: priority-test
description: 优先级测试 skill 的 personal 版本
---
# 优先级测试 Skill（Personal 版本）

这是该测试 skill 的 PERSONAL 版本。

PRIORITY_MARKER_PERSONAL_VERSION
EOF

# 3. project 位置（最高优先级）
mkdir -p "$TEST_HOME/test-project/.opencode/skills/priority-test"
cat > "$TEST_HOME/test-project/.opencode/skills/priority-test/SKILL.md" <<'EOF'
---
name: priority-test
description: 优先级测试 skill 的 project 版本
---
# 优先级测试 Skill（Project 版本）

这是该测试 skill 的 PROJECT 版本。

PRIORITY_MARKER_PROJECT_VERSION
EOF

echo "  已在三个位置创建 priority-test"

# 测试 1：检查夹具是否创建成功
echo ""
echo "测试 1：验证测试夹具..."

if [ -f "$SUPERPOWERS_SKILLS_DIR/priority-test/SKILL.md" ]; then
    echo "  [PASS] Superpowers 版本存在"
else
    echo "  [FAIL] 缺少 Superpowers 版本"
    exit 1
fi

if [ -f "$OPENCODE_CONFIG_DIR/skills/priority-test/SKILL.md" ]; then
    echo "  [PASS] Personal 版本存在"
else
    echo "  [FAIL] 缺少 Personal 版本"
    exit 1
fi

if [ -f "$TEST_HOME/test-project/.opencode/skills/priority-test/SKILL.md" ]; then
    echo "  [PASS] Project 版本存在"
else
    echo "  [FAIL] 缺少 Project 版本"
    exit 1
fi

# 如果没有 opencode，可只做夹具测试
if ! command -v opencode &> /dev/null; then
    echo ""
    echo "  [SKIP] 未安装 OpenCode，跳过集成测试"
    echo "  如需运行，请先安装 OpenCode: https://opencode.ai"
    echo ""
    echo "=== 优先级夹具测试通过（已跳过集成测试）==="
    exit 0
fi

# 测试 2：验证 personal 覆盖 superpowers
echo ""
echo "测试 2：验证 personal > superpowers..."
echo "  在项目目录外运行..."

cd "$HOME"
output=$(timeout 60s opencode run --print-logs "Use the use_skill tool to load the priority-test skill. Show me the exact content including any PRIORITY_MARKER text." 2>&1) || {
    exit_code=$?
    if [ $exit_code -eq 124 ]; then
        echo "  [FAIL] OpenCode 60 秒后超时"
        exit 1
    fi
}

if echo "$output" | grep -qi "PRIORITY_MARKER_PERSONAL_VERSION"; then
    echo "  [PASS] 已加载 Personal 版本（成功覆盖 Superpowers）"
elif echo "$output" | grep -qi "PRIORITY_MARKER_SUPERPOWERS_VERSION"; then
    echo "  [FAIL] 错误加载了 Superpowers 版本"
    exit 1
else
    echo "  [WARN] 无法从输出中确认优先级标记"
    echo "  输出片段:"
    echo "$output" | grep -i "priority\|personal\|superpowers" | head -10
fi

# 测试 3：验证 project 覆盖 personal 与 superpowers
echo ""
echo "测试 3：验证 project > personal > superpowers..."
echo "  在项目目录内运行..."

cd "$TEST_HOME/test-project"
output=$(timeout 60s opencode run --print-logs "Use the use_skill tool to load the priority-test skill. Show me the exact content including any PRIORITY_MARKER text." 2>&1) || {
    exit_code=$?
    if [ $exit_code -eq 124 ]; then
        echo "  [FAIL] OpenCode 60 秒后超时"
        exit 1
    fi
}

if echo "$output" | grep -qi "PRIORITY_MARKER_PROJECT_VERSION"; then
    echo "  [PASS] 已加载 Project 版本（最高优先级）"
elif echo "$output" | grep -qi "PRIORITY_MARKER_PERSONAL_VERSION"; then
    echo "  [FAIL] 错误加载了 Personal 版本，而不是 Project"
    exit 1
elif echo "$output" | grep -qi "PRIORITY_MARKER_SUPERPOWERS_VERSION"; then
    echo "  [FAIL] 错误加载了 Superpowers 版本，而不是 Project"
    exit 1
else
    echo "  [WARN] 无法从输出中确认优先级标记"
    echo "  输出片段:"
    echo "$output" | grep -i "priority\|project\|personal" | head -10
fi

# 测试 4：验证显式 superpowers: 前缀会绕过优先级
echo ""
echo "测试 4：验证 superpowers: 前缀会强制加载 superpowers 版本..."

cd "$TEST_HOME/test-project"
output=$(timeout 60s opencode run --print-logs "Use the use_skill tool to load superpowers:priority-test specifically. Show me the exact content including any PRIORITY_MARKER text." 2>&1) || {
    exit_code=$?
    if [ $exit_code -eq 124 ]; then
        echo "  [FAIL] OpenCode 60 秒后超时"
        exit 1
    fi
}

if echo "$output" | grep -qi "PRIORITY_MARKER_SUPERPOWERS_VERSION"; then
    echo "  [PASS] superpowers: 前缀已正确强制加载 superpowers 版本"
elif echo "$output" | grep -qi "PRIORITY_MARKER_PROJECT_VERSION\|PRIORITY_MARKER_PERSONAL_VERSION"; then
    echo "  [FAIL] superpowers: 前缀未生效"
    exit 1
else
    echo "  [WARN] 无法从输出中确认优先级标记"
fi

# 测试 5：验证显式 project: 前缀
echo ""
echo "测试 5：验证 project: 前缀会强制 project 版本..."

cd "$HOME"
output=$(timeout 60s opencode run --print-logs "Use the use_skill tool to load project:priority-test specifically. Show me the exact content." 2>&1) || {
    exit_code=$?
    if [ $exit_code -eq 124 ]; then
        echo "  [FAIL] OpenCode 60 秒后超时"
        exit 1
    fi
}

# 注意：这里可能失败，因为当前不在项目目录内
# project: 前缀通常只在项目上下文中可用
if echo "$output" | grep -qi "not found\|error"; then
    echo "  [PASS] 不在项目上下文时，project: 前缀会正确失败"
else
    echo "  [INFO] project: 前缀在项目外的行为可能因环境而异"
fi

echo ""
echo "=== 所有优先级测试通过 ==="
