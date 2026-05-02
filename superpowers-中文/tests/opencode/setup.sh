#!/usr/bin/env bash
# OpenCode 插件测试的初始化脚本
# 创建一个隔离测试环境，并正确安装插件
set -euo pipefail

# 获取仓库根目录（从 tests/opencode/ 往上两级）
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# 创建临时 HOME，保证测试隔离
export TEST_HOME
TEST_HOME=$(mktemp -d)
export HOME="$TEST_HOME"
export XDG_CONFIG_HOME="$TEST_HOME/.config"
export OPENCODE_CONFIG_DIR="$TEST_HOME/.config/opencode"

# 标准安装布局：
#   $OPENCODE_CONFIG_DIR/superpowers/             -> 包根目录
#   $OPENCODE_CONFIG_DIR/superpowers/skills/      -> skills 目录（插件内通过 ../../skills 引用）
#   $OPENCODE_CONFIG_DIR/superpowers/.opencode/plugins/superpowers.js -> 插件文件
#   $OPENCODE_CONFIG_DIR/plugins/superpowers.js   -> OpenCode 实际读取的 symlink

SUPERPOWERS_DIR="$OPENCODE_CONFIG_DIR/superpowers"
SUPERPOWERS_SKILLS_DIR="$SUPERPOWERS_DIR/skills"
SUPERPOWERS_PLUGIN_FILE="$SUPERPOWERS_DIR/.opencode/plugins/superpowers.js"

# 安装 skills
mkdir -p "$SUPERPOWERS_DIR"
cp -r "$REPO_ROOT/skills" "$SUPERPOWERS_DIR/"

# 安装插件文件
mkdir -p "$(dirname "$SUPERPOWERS_PLUGIN_FILE")"
cp "$REPO_ROOT/.opencode/plugins/superpowers.js" "$SUPERPOWERS_PLUGIN_FILE"

# 通过 symlink 注册插件（OpenCode 实际读取这里）
mkdir -p "$OPENCODE_CONFIG_DIR/plugins"
ln -sf "$SUPERPOWERS_PLUGIN_FILE" "$OPENCODE_CONFIG_DIR/plugins/superpowers.js"

# 创建用于测试的 skills

# 个人级测试 skill
mkdir -p "$OPENCODE_CONFIG_DIR/skills/personal-test"
cat > "$OPENCODE_CONFIG_DIR/skills/personal-test/SKILL.md" <<'EOF'
---
name: personal-test
description: Test personal skill for verification
---
# Personal Test Skill

This is a personal skill used for testing.

PERSONAL_SKILL_MARKER_12345
EOF

# 创建项目目录，供项目级 skill 测试使用
mkdir -p "$TEST_HOME/test-project/.opencode/skills/project-test"
cat > "$TEST_HOME/test-project/.opencode/skills/project-test/SKILL.md" <<'EOF'
---
name: project-test
description: Test project skill for verification
---
# Project Test Skill

This is a project skill used for testing.

PROJECT_SKILL_MARKER_67890
EOF

echo "初始化完成：$TEST_HOME"
echo "OPENCODE_CONFIG_DIR:  $OPENCODE_CONFIG_DIR"
echo "Superpowers 目录:     $SUPERPOWERS_DIR"
echo "Skills 目录:          $SUPERPOWERS_SKILLS_DIR"
echo "插件文件:             $SUPERPOWERS_PLUGIN_FILE"
echo "插件注册位置:         $OPENCODE_CONFIG_DIR/plugins/superpowers.js"
echo "测试项目路径:         $TEST_HOME/test-project"

# 清理辅助函数（供测试或 trap 调用）
cleanup_test_env() {
    if [ -n "${TEST_HOME:-}" ] && [ -d "$TEST_HOME" ]; then
        rm -rf "$TEST_HOME"
    fi
}

# 导出给测试脚本使用
export -f cleanup_test_env
export REPO_ROOT
export SUPERPOWERS_DIR
export SUPERPOWERS_SKILLS_DIR
export SUPERPOWERS_PLUGIN_FILE
