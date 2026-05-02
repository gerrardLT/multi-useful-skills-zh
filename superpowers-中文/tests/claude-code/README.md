# Claude Code Skills 测试

使用 Claude Code CLI 对 superpowers skills 做自动化测试。

## 概览

这套测试用于验证：

- skills 是否被正确加载
- Claude 是否按预期遵循这些技能
- 关键工作流是否真的能在 headless 模式下跑通

测试通过 `claude -p` 以无头模式运行 Claude Code，并检查其行为结果。

## 运行要求

- 已安装 Claude Code CLI，并且在 `PATH` 中可用
- 已安装本地 superpowers plugin

## 运行方式

### 运行所有快速测试（推荐）

```bash
./run-skill-tests.sh
```

### 运行集成测试（较慢，约 10 到 30 分钟）

```bash
./run-skill-tests.sh --integration
```

### 运行指定测试

```bash
./run-skill-tests.sh --test test-subagent-driven-development.sh
```

### 显示详细输出

```bash
./run-skill-tests.sh --verbose
```

### 自定义超时

```bash
./run-skill-tests.sh --timeout 1800
```

## 测试结构

### `test-helpers.sh`

提供通用测试辅助函数：

- `run_claude "prompt" [timeout]`
- `assert_contains output pattern name`
- `assert_not_contains output pattern name`
- `assert_count output pattern count name`
- `assert_order output pattern_a pattern_b name`
- `create_test_project`
- `create_test_plan project_dir`

### 测试文件

每个测试文件通常都会：

1. `source` 引入 `test-helpers.sh`
2. 用特定 prompt 运行 Claude Code
3. 通过 assertions 验证预期行为
4. 成功时返回 `0`，失败时返回非 `0`

## 示例测试

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

echo "=== Test: My Skill ==="

output=$(run_claude "What does the my-skill skill do?" 30)

assert_contains "$output" "expected behavior" "Skill describes behavior"

echo "=== All tests passed ==="
```

## 当前测试

### 快速测试（默认执行）

#### `test-subagent-driven-development.sh`

主要验证：

- Skill 是否可加载、可访问
- 工作流顺序是否正确
- 是否明确要求 self-review
- 是否明确说明 plan 读取纪律
- 是否要求 spec compliance reviewer 保持怀疑
- 是否包含 review loops
- 是否要求提供完整 task context

### 集成测试（通过 `--integration` 启用）

#### `test-subagent-driven-development-integration.sh`

这是完整工作流测试，通常需要 10 到 30 分钟。它会：

- 创建真实的 Node.js 测试项目
- 创建一个包含 2 个任务的实现计划
- 用 subagent-driven-development 执行该计划
- 验证实际行为，包括：
  - 计划只在开始时读取一次
  - 子代理 prompt 中包含完整任务文本
  - 子代理回报前会先做 self-review
  - spec compliance review 先于 code quality review
  - spec reviewer 会独立读代码
  - 最终产出真实可运行的实现
  - 测试能通过
  - git commit 结构合理

## 如何新增测试

1. 创建新测试文件：`test-<skill-name>.sh`
2. 引入 `test-helpers.sh`
3. 使用 `run_claude` 和断言函数编写测试
4. 把它加入 `run-skill-tests.sh` 的测试列表
5. 赋予执行权限：`chmod +x test-<skill-name>.sh`

## 超时建议

- 默认超时：每个测试 5 分钟
- Claude Code 有时需要额外响应时间
- 可以通过 `--timeout` 调整
- 测试应尽量聚焦，避免无意义地跑太久

## 调试失败测试

使用 `--verbose` 可以查看完整 Claude 输出：

```bash
./run-skill-tests.sh --verbose --test test-subagent-driven-development.sh
```

不加 `--verbose` 时，通常只有失败测试才会展示输出。

## CI/CD 集成

在 CI 中运行：

```bash
./run-skill-tests.sh --timeout 900
```

- 退出码 `0`：成功
- 非 `0`：失败

## 备注

- 这些测试主要验证的是 skill 指令内容和触发行为
- 完整工作流测试会比较慢
- 重点应放在关键 skill 要求是否被遵守
- 测试要尽量保持确定性
- 避免把测试写成绑定具体实现细节
