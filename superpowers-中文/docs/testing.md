# 测试 Superpowers Skills

这份文档介绍如何测试 Superpowers 技能，尤其是像 `subagent-driven-development` 这类复杂技能的集成测试方式。

## 概览

涉及子代理、工作流和复杂交互的技能，要确保测试准确性，就需要真正以无头模式运行 Claude Code 会话，并通过会话转录记录来验证其行为。

## 测试结构

```text
tests/
├── claude-code/
│   ├── test-helpers.sh
│   ├── test-subagent-driven-development-integration.sh
│   ├── analyze-token-usage.py
│   └── run-skill-tests.sh
```

## 运行测试

### 集成测试

集成测试会使用真实技能，实际运行 Claude Code 会话：

```bash
# 运行 subagent-driven-development 的集成测试
cd tests/claude-code
./test-subagent-driven-development-integration.sh
```

**注意：** 由于会执行真实实现计划并调度多个子代理，集成测试通常需要 10 到 30 分钟。

### 环境要求

- 必须从 **superpowers 插件目录** 运行，而不是在临时目录中运行
- Claude Code 必须已安装，并可通过 `claude` 命令调用
- 必须启用本地开发市场：在 `~/.claude/settings.json` 中设置 `"superpowers@superpowers-dev": true`

## 集成测试：subagent-driven-development

### 测试内容

这个集成测试会验证 `subagent-driven-development` 技能是否正确做到以下几点：

1. **计划文件加载**：在开始时只读取一次计划文件
2. **完整任务描述**：把完整任务描述传给子代理，而不是让它们自己去读文件
3. **自检**：确保子代理在汇报前先进行自检
4. **审查顺序**：先做规格符合性审查，再做代码质量审查
5. **审查循环**：发现问题时会进入审查循环
6. **独立验证**：规格审查者会独立读取代码，而不会直接相信实现者的汇报

### 工作原理

1. **设置**：创建一个带最小实现计划的临时 Node.js 项目
2. **执行**：以无头模式运行带该技能的 Claude Code
3. **验证**：解析会话转录（`.jsonl` 文件），验证：
   - 是否调用了 Skill 工具
   - 是否派发了子代理（Task 工具）
   - 是否使用 TodoWrite 进行跟踪
   - 是否创建了实现文件
   - 测试是否通过
   - Git 提交历史是否符合工作流
4. **Token 分析**：展示每个子代理的 token 使用情况拆解

### 测试输出

```text
========================================
 Integration Test: subagent-driven-development
========================================

Test project: /tmp/tmp.xyz123

=== Verification Tests ===

Test 1: Skill tool invoked...
  [PASS] subagent-driven-development skill was invoked

Test 2: Subagents dispatched...
  [PASS] 7 subagents dispatched

Test 3: Task tracking...
  [PASS] TodoWrite used 5 time(s)

Test 6: Implementation verification...
  [PASS] src/math.js created
  [PASS] add function exists
  [PASS] multiply function exists
  [PASS] test/math.test.js created
  [PASS] Tests pass

Test 7: Git commit history...
  [PASS] Multiple commits created (3 total)

Test 8: No extra features added...
  [PASS] No extra features added

=========================================
 Token Usage Analysis
=========================================
...
STATUS: PASSED
```

## Token 分析工具

### 用法

你可以对任意 Claude Code 会话分析 token 使用情况：

```bash
python3 tests/claude-code/analyze-token-usage.py ~/.claude/projects/<project-dir>/<session-id>.jsonl
```

### 查找会话文件

会话转录保存在 `~/.claude/projects/` 下，目录名会将工作目录路径编码进去：

```bash
# 例如：/Users/jesse/Documents/GitHub/superpowers/superpowers
SESSION_DIR="$HOME/.claude/projects/-Users-jesse-Documents-GitHub-superpowers-superpowers"

# 查找最近的会话
ls -lt "$SESSION_DIR"/*.jsonl | head -5
```

### 输出内容

- **主会话使用量**：协调者（你或主 Claude 实例）的 token 使用量
- **每个子代理拆解**：每次 Task 调用的拆解，包括：
  - Agent ID
  - 描述（从 prompt 中提取）
  - 消息数量
  - 输入 / 输出 token
  - 缓存使用量
  - 预估成本
- **总计**：整体 token 使用和成本估算

### 如何理解输出

- **高缓存读取**：是好事，说明 prompt caching 在发挥作用
- **主会话输入 token 高**：正常，协调者拥有完整上下文
- **每个子代理成本相似**：正常，每个子代理面对的任务复杂度通常接近
- **每任务成本**：典型范围是每个子代理 $0.05 到 $0.15，取决于任务大小

## 故障排查

### 技能没有加载

**问题：** 运行无头测试时找不到技能

**解决办法：**
1. 确保你是从 superpowers 目录运行的：`cd /path/to/superpowers && tests/...`
2. 检查 `~/.claude/settings.json` 的 `enabledPlugins` 中是否包含 `"superpowers@superpowers-dev": true`
3. 确认技能确实存在于 `skills/` 目录

### 权限错误

**问题：** Claude 被阻止写入文件或访问目录

**解决办法：**
1. 使用 `--permission-mode bypassPermissions`
2. 使用 `--add-dir /path/to/temp/dir` 授权测试目录
3. 检查测试目录的文件权限

### 测试超时

**问题：** 测试耗时过长并超时

**解决办法：**
1. 提高超时时间：`timeout 1800 claude ...`（30 分钟）
2. 检查技能逻辑里是否有死循环
3. 重新评估子代理任务复杂度

### 找不到会话文件

**问题：** 测试结束后找不到会话转录

**解决办法：**
1. 检查 `~/.claude/projects/` 下是否找对了项目目录
2. 用 `find ~/.claude/projects -name "*.jsonl" -mmin -60` 查找最近会话
3. 确认测试真的跑起来了（查看测试输出中是否有错误）

## 编写新的集成测试

### 模板

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# 创建测试项目
TEST_PROJECT=$(create_test_project)
trap "cleanup_test_project $TEST_PROJECT" EXIT

# 设置测试文件...
cd "$TEST_PROJECT"

# 运行带技能的 Claude
PROMPT="Your test prompt here"
cd "$SCRIPT_DIR/../.." && timeout 1800 claude -p "$PROMPT" \
  --allowed-tools=all \
  --add-dir "$TEST_PROJECT" \
  --permission-mode bypassPermissions \
  2>&1 | tee output.txt

# 查找并分析会话
WORKING_DIR_ESCAPED=$(echo "$SCRIPT_DIR/../.." | sed 's/\\//-/g' | sed 's/^-//')
SESSION_DIR="$HOME/.claude/projects/$WORKING_DIR_ESCAPED"
SESSION_FILE=$(find "$SESSION_DIR" -name "*.jsonl" -type f -mmin -60 | sort -r | head -1)

# 通过解析会话转录验证行为
if grep -q '"name":"Skill".*"skill":"your-skill-name"' "$SESSION_FILE"; then
    echo "[PASS] Skill was invoked"
fi

# 显示 token 分析
python3 "$SCRIPT_DIR/analyze-token-usage.py" "$SESSION_FILE"
```

### 最佳实践

1. **始终清理现场**：用 `trap` 清理临时目录
2. **解析转录，而不是看表面输出**：不要 grep 面向用户的输出，应解析 `.jsonl` 会话文件
3. **显式授予权限**：使用 `--permission-mode bypassPermissions` 和 `--add-dir`
4. **从插件目录运行**：只有在 superpowers 目录中运行时，技能才会被加载
5. **展示 token 使用情况**：始终包含 token 分析，方便了解成本
6. **测试真实行为**：验证实际创建的文件、通过的测试和生成的提交

## 会话转录格式

会话转录是 JSONL（JSON Lines）格式，每一行都是一个 JSON 对象，用来表示一条消息或一个工具结果。

### 关键字段

```json
{
  "type": "assistant",
  "message": {
    "content": [...],
    "usage": {
      "input_tokens": 27,
      "output_tokens": 3996,
      "cache_read_input_tokens": 1213703
    }
  }
}
```

### 工具结果

```json
{
  "type": "user",
  "toolUseResult": {
    "agentId": "3380c209",
    "usage": {
      "input_tokens": 2,
      "output_tokens": 787,
      "cache_read_input_tokens": 24989
    },
    "prompt": "You are implementing Task 1...",
    "content": [{"type": "text", "text": "..."}]
  }
}
```

`agentId` 字段会将结果关联到对应的子代理会话，而 `usage` 字段则包含该次子代理调用的 token 使用数据。