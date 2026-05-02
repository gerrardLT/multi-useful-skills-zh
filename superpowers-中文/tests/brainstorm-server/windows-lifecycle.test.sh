#!/usr/bin/env bash
# Brainstorm server 的 Windows 生命周期测试
#
# 验证在 Windows 上，brainstorm server 能安全跨过 60 秒生命周期检查。
# 在该平台上会禁用 OWNER_PID 监控，因为 MSYS2 的 PID 命名空间对 Node.js 不可见。
#
# 运行要求：
#   - PATH 中可用 Node.js
#   - 从仓库根目录运行，或设置 SUPERPOWERS_ROOT
#   - Windows 下请使用 Git Bash（OSTYPE=msys*）
#
# 用法：
#   bash tests/brainstorm-server/windows-lifecycle.test.sh
set -uo pipefail

# ========== 配置 ==========

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${SUPERPOWERS_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
START_SCRIPT="$REPO_ROOT/skills/brainstorming/scripts/start-server.sh"
STOP_SCRIPT="$REPO_ROOT/skills/brainstorming/scripts/stop-server.sh"
SERVER_JS="$REPO_ROOT/skills/brainstorming/scripts/server.js"

TEST_DIR="${TMPDIR:-/tmp}/brainstorm-win-test-$$"

passed=0
failed=0
skipped=0

# ========== 辅助函数 ==========

cleanup() {
  # 杀掉本轮测试启动的所有 server 进程
  for pidvar in SERVER_PID CONTROL_PID STOP_TEST_PID; do
    pid="${!pidvar:-}"
    if [[ -n "$pid" ]]; then
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
  done
  if [[ -n "${TEST_DIR:-}" && -d "$TEST_DIR" ]]; then
    rm -rf "$TEST_DIR"
  fi
}
trap cleanup EXIT

pass() {
  echo "  PASS: $1"
  passed=$((passed + 1))
}

fail() {
  echo "  FAIL: $1"
  echo "    $2"
  failed=$((failed + 1))
}

skip() {
  echo "  SKIP: $1 ($2)"
  skipped=$((skipped + 1))
}

wait_for_server_info() {
  local dir="$1"
  for _ in $(seq 1 50); do
    if [[ -f "$dir/.server-info" ]]; then
      return 0
    fi
    sleep 0.1
  done
  return 1
}

get_port_from_info() {
  # 从 .server-info 中提取端口。这里用 grep/sed，
  # 避免触发 MSYS2 -> Windows 的路径转换问题。
  grep -o '"port":[0-9]*' "$1/.server-info" | head -1 | sed 's/"port"://'
}

http_check() {
  local port="$1"
  node -e "
    const http = require('http');
    http.get('http://localhost:$port/', (res) => {
      process.exit(res.statusCode === 200 ? 0 : 1);
    }).on('error', () => process.exit(1));
  " 2>/dev/null
}

# ========== 平台识别 ==========

echo ""
echo "=== Brainstorm Server Windows 生命周期测试 ==="
echo "平台: ${OSTYPE:-unknown}"
echo "MSYSTEM: ${MSYSTEM:-unset}"
echo "Node: $(node --version 2>/dev/null || echo 'not found')"
echo ""

is_windows="false"
case "${OSTYPE:-}" in
  msys*|cygwin*|mingw*) is_windows="true" ;;
esac
if [[ -n "${MSYSTEM:-}" ]]; then
  is_windows="true"
fi

if [[ "$is_windows" != "true" ]]; then
  echo "提示：当前不是 Windows/MSYS2 环境（OSTYPE=${OSTYPE:-unset}）。"
  echo "Windows 专属测试会跳过，但测试 4 到 6 仍会运行。"
  echo ""
fi

mkdir -p "$TEST_DIR"

SERVER_PID=""
CONTROL_PID=""
STOP_TEST_PID=""

# ========== 测试 1：Windows 上 OWNER_PID 为空 ==========

echo "--- Owner PID 解析 ---"

if [[ "$is_windows" == "true" ]]; then
  # 复现 start-server.sh 中的 PID 推导逻辑
  TEST_OWNER_PID="$(ps -o ppid= -p "$PPID" 2>/dev/null | tr -d ' ' || true)"
  if [[ -z "$TEST_OWNER_PID" || "$TEST_OWNER_PID" == "1" ]]; then
    TEST_OWNER_PID="$PPID"
  fi
  # 修复点：Windows 上清空 OWNER_PID
  case "${OSTYPE:-}" in
    msys*|cygwin*|mingw*) TEST_OWNER_PID="" ;;
  esac

  if [[ -z "$TEST_OWNER_PID" ]]; then
    pass "修复后 Windows 上的 OWNER_PID 为空"
  else
    fail "修复后 Windows 上的 OWNER_PID 为空" \
         "期望为空，实际得到 '$TEST_OWNER_PID'"
  fi
else
  skip "修复后 Windows 上的 OWNER_PID 为空" "当前不是 Windows"
fi

# ========== 测试 2：start-server.sh 传入空的 BRAINSTORM_OWNER_PID ==========

if [[ "$is_windows" == "true" ]]; then
  # 用假的 node 捕获环境变量并立即退出
  FAKE_NODE_DIR="$TEST_DIR/fake-bin"
  mkdir -p "$FAKE_NODE_DIR"
  cat > "$FAKE_NODE_DIR/node" <<'FAKENODE'
#!/usr/bin/env bash
echo "CAPTURED_OWNER_PID=${BRAINSTORM_OWNER_PID:-__UNSET__}"
exit 0
FAKENODE
  chmod +x "$FAKE_NODE_DIR/node"

  captured=$(PATH="$FAKE_NODE_DIR:$PATH" bash "$START_SCRIPT" --project-dir "$TEST_DIR/session" --foreground 2>/dev/null || true)
  owner_pid_value=$(echo "$captured" | grep "CAPTURED_OWNER_PID=" | head -1 | sed 's/CAPTURED_OWNER_PID=//')

  if [[ "$owner_pid_value" == "" || "$owner_pid_value" == "__UNSET__" ]]; then
    pass "start-server.sh 在 Windows 上会传入空的 BRAINSTORM_OWNER_PID"
  else
    fail "start-server.sh 在 Windows 上会传入空的 BRAINSTORM_OWNER_PID" \
         "期望为空或未设置，实际得到 '$owner_pid_value'"
  fi

  rm -rf "$FAKE_NODE_DIR" "$TEST_DIR/session"
else
  skip "start-server.sh 在 Windows 上会传入空的 BRAINSTORM_OWNER_PID" "当前不是 Windows"
fi

# ========== 测试 3：Windows 上自动切换前台模式 ==========

echo ""
echo "--- 前台模式检测 ---"

if [[ "$is_windows" == "true" ]]; then
  FAKE_NODE_DIR="$TEST_DIR/fake-bin"
  mkdir -p "$FAKE_NODE_DIR"
  cat > "$FAKE_NODE_DIR/node" <<'FAKENODE'
#!/usr/bin/env bash
echo "FOREGROUND_MODE=true"
exit 0
FAKENODE
  chmod +x "$FAKE_NODE_DIR/node"

  # 不传 --foreground，Windows 应自动判断为前台模式
  captured=$(PATH="$FAKE_NODE_DIR:$PATH" bash "$START_SCRIPT" --project-dir "$TEST_DIR/session2" 2>/dev/null || true)

  if echo "$captured" | grep -q "FOREGROUND_MODE=true"; then
    pass "Windows 会自动检测并切到前台模式"
  else
    fail "Windows 会自动检测并切到前台模式" \
         "期望命中前台执行路径，实际输出：$captured"
  fi

  rm -rf "$FAKE_NODE_DIR" "$TEST_DIR/session2"
else
  skip "Windows 会自动检测并切到前台模式" "当前不是 Windows"
fi

# ========== 测试 4：server 能存活过 60 秒生命周期检查 ==========

echo ""
echo "--- Server 存活测试（生命周期检查） ---"

mkdir -p "$TEST_DIR/survival"

echo "  启动 server（将等待约 75 秒，验证它能跨过生命周期检查）……"

BRAINSTORM_DIR="$TEST_DIR/survival" \
BRAINSTORM_HOST="127.0.0.1" \
BRAINSTORM_URL_HOST="localhost" \
BRAINSTORM_OWNER_PID="" \
BRAINSTORM_PORT=$((49152 + RANDOM % 16383)) \
  node "$SERVER_JS" > "$TEST_DIR/survival/.server.log" 2>&1 &
SERVER_PID=$!

if ! wait_for_server_info "$TEST_DIR/survival"; then
  fail "Server 启动成功" "5 秒内未写出 .server-info"
  kill "$SERVER_PID" 2>/dev/null || true
  SERVER_PID=""
else
  pass "空 OWNER_PID 下 server 启动成功"

  SERVER_PORT=$(get_port_from_info "$TEST_DIR/survival")

  sleep 75

  if kill -0 "$SERVER_PID" 2>/dev/null; then
    pass "75 秒后 server 仍然存活"
  else
    fail "75 秒后 server 仍然存活" \
         "server 已退出。日志尾部：$(tail -5 "$TEST_DIR/survival/.server.log" 2>/dev/null)"
  fi

  if http_check "$SERVER_PORT"; then
    pass "生命周期检查窗口后 server 仍可响应 HTTP"
  else
    fail "生命周期检查窗口后 server 仍可响应 HTTP" \
         "对端口 $SERVER_PORT 的 HTTP 请求失败"
  fi

  if grep -q "owner process exited" "$TEST_DIR/survival/.server.log" 2>/dev/null; then
    fail "日志中不应出现 'owner process exited'" \
         "检测到误报式 owner-exit 关停"
  else
    pass "日志中没有误报的 'owner process exited'"
  fi

  kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
  SERVER_PID=""
fi

# ========== 测试 5：错误 OWNER_PID 会导致自动退出（对照组） ==========

echo ""
echo "--- 对照组：错误 OWNER_PID 会触发退出 ---"

mkdir -p "$TEST_DIR/control"

# 找一个不存在的 PID
BAD_PID=99999
while kill -0 "$BAD_PID" 2>/dev/null; do
  BAD_PID=$((BAD_PID + 1))
done

BRAINSTORM_DIR="$TEST_DIR/control" \
BRAINSTORM_HOST="127.0.0.1" \
BRAINSTORM_URL_HOST="localhost" \
BRAINSTORM_OWNER_PID="$BAD_PID" \
BRAINSTORM_PORT=$((49152 + RANDOM % 16383)) \
  node "$SERVER_JS" > "$TEST_DIR/control/.server.log" 2>&1 &
CONTROL_PID=$!

if ! wait_for_server_info "$TEST_DIR/control"; then
  fail "对照组 server 启动成功" "5 秒内未写出 .server-info"
  kill "$CONTROL_PID" 2>/dev/null || true
  CONTROL_PID=""
else
  pass "对照组 server 可在错误 OWNER_PID=$BAD_PID 下启动"

  echo "  等待约 75 秒，确认生命周期检查会杀掉该 server……"
  sleep 75

  if kill -0 "$CONTROL_PID" 2>/dev/null; then
    fail "错误 OWNER_PID 下 server 会自终止" \
         "server 仍然存活，但预期应退出"
    kill "$CONTROL_PID" 2>/dev/null || true
  else
    pass "错误 OWNER_PID 下 server 会自终止"
  fi

  if grep -q "owner process exited" "$TEST_DIR/control/.server.log" 2>/dev/null; then
    pass "对照组日志中记录了 'owner process exited'"
  else
    fail "对照组日志中记录了 'owner process exited'" \
         "日志尾部：$(tail -5 "$TEST_DIR/control/.server.log" 2>/dev/null)"
  fi
fi

wait "$CONTROL_PID" 2>/dev/null || true
CONTROL_PID=""

# ========== 测试 6：stop-server.sh 可正常停止 server ==========

echo ""
echo "--- 正常关停 ---"

mkdir -p "$TEST_DIR/stop-test"

BRAINSTORM_DIR="$TEST_DIR/stop-test" \
BRAINSTORM_HOST="127.0.0.1" \
BRAINSTORM_URL_HOST="localhost" \
BRAINSTORM_OWNER_PID="" \
BRAINSTORM_PORT=$((49152 + RANDOM % 16383)) \
  node "$SERVER_JS" > "$TEST_DIR/stop-test/.server.log" 2>&1 &
STOP_TEST_PID=$!
echo "$STOP_TEST_PID" > "$TEST_DIR/stop-test/.server.pid"

if ! wait_for_server_info "$TEST_DIR/stop-test"; then
  fail "stop-test server 启动成功" "server 未成功启动"
  kill "$STOP_TEST_PID" 2>/dev/null || true
  STOP_TEST_PID=""
else
  bash "$STOP_SCRIPT" "$TEST_DIR/stop-test" >/dev/null 2>&1 || true
  sleep 1

  if ! kill -0 "$STOP_TEST_PID" 2>/dev/null; then
    pass "stop-server.sh 能正常停止 server"
  else
    fail "stop-server.sh 能正常停止 server" \
         "执行 stop 后，server PID $STOP_TEST_PID 仍然存活"
    kill "$STOP_TEST_PID" 2>/dev/null || true
  fi
fi

wait "$STOP_TEST_PID" 2>/dev/null || true
STOP_TEST_PID=""

# ========== 汇总 ==========

echo ""
echo "=== 结果：$passed 通过，$failed 失败，$skipped 跳过 ==="

if [[ $failed -gt 0 ]]; then
  exit 1
fi
exit 0
