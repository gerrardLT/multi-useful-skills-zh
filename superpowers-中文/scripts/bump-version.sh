#!/usr/bin/env bash
#
# bump-version.sh：统一提升所有声明文件中的版本号，
# 同时检测版本漂移，并对仓库做全局审计，避免漏改文件。
#
# 用法：
#   bump-version.sh <new-version>   将所有声明文件更新为新版本
#   bump-version.sh --check         输出当前版本并检测是否漂移
#   bump-version.sh --audit         先检查，再全仓库扫描旧版本字符串
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG="$REPO_ROOT/.version-bump.json"

if [[ ! -f "$CONFIG" ]]; then
  echo "错误：在 $CONFIG 找不到 .version-bump.json" >&2
  exit 1
fi

# --- 辅助函数 ---

# 从 JSON 文件读取点路径字段。
# 同时支持简单路径（"version"）和嵌套路径（"plugins.0.version"）。
read_json_field() {
  local file="$1" field="$2"
  # 把点路径转成 jq 路径，例如 "plugins.0.version" -> .plugins[0].version
  local jq_path
  jq_path=$(echo "$field" | sed -E 's/\.([0-9]+)/[\1]/g' | sed 's/^/./' | sed 's/\.\././g')
  jq -r "$jq_path" "$file"
}

# 向 JSON 文件写入点路径字段，同时尽量保留格式。
write_json_field() {
  local file="$1" field="$2" value="$3"
  local jq_path
  jq_path=$(echo "$field" | sed -E 's/\.([0-9]+)/[\1]/g' | sed 's/^/./' | sed 's/\.\././g')
  local tmp="${file}.tmp"
  jq "$jq_path = \"$value\"" "$file" > "$tmp" && mv "$tmp" "$file"
}

# 从配置中读取声明文件列表。
# 输出格式：path<TAB>field
declared_files() {
  jq -r '.files[] | "\(.path)\t\(.field)"' "$CONFIG"
}

# 从配置中读取 audit 排除模式。
audit_excludes() {
  jq -r '.audit.exclude[]' "$CONFIG" 2>/dev/null
}

# --- 命令实现 ---

cmd_check() {
  local has_drift=0
  local versions=()

  echo "版本检查："
  echo ""

  while IFS=$'\t' read -r path field; do
    local fullpath="$REPO_ROOT/$path"
    if [[ ! -f "$fullpath" ]]; then
      printf "  %-45s  缺失\n" "$path ($field)"
      has_drift=1
      continue
    fi
    local ver
    ver=$(read_json_field "$fullpath" "$field")
    printf "  %-45s  %s\n" "$path ($field)" "$ver"
    versions+=("$ver")
  done < <(declared_files)

  echo ""

  # 检查所有版本是否一致
  local unique
  unique=$(printf '%s\n' "${versions[@]}" | sort -u | wc -l | tr -d ' ')
  if [[ "$unique" -gt 1 ]]; then
    echo "检测到版本漂移："
    printf '%s\n' "${versions[@]}" | sort | uniq -c | sort -rn | while read -r count ver; do
      echo "  $ver（$count 个文件）"
    done
    has_drift=1
  else
    echo "所有声明文件的版本都一致：${versions[0]}"
  fi

  return $has_drift
}

cmd_audit() {
  # 先做一次 check
  cmd_check || true
  echo ""

  # 取声明文件中最常见的当前版本号
  local current_version
  current_version=$(
    while IFS=$'\t' read -r path field; do
      local fullpath="$REPO_ROOT/$path"
      [[ -f "$fullpath" ]] && read_json_field "$fullpath" "$field"
    done < <(declared_files) | sort | uniq -c | sort -rn | head -1 | awk '{print $2}'
  )

  if [[ -z "$current_version" ]]; then
    echo "错误：无法确定当前版本号" >&2
    return 1
  fi

  echo "审计：正在扫描仓库中是否还有版本字符串 '$current_version'……"
  echo ""

  # 构建 grep 排除参数
  local -a exclude_args=()
  while IFS= read -r pattern; do
    exclude_args+=("--exclude=$pattern" "--exclude-dir=$pattern")
  done < <(audit_excludes)

  # 永远排除二进制文件和 .git
  exclude_args+=("--exclude-dir=.git" "--exclude-dir=node_modules" "--binary-files=without-match")

  # 读取声明路径列表，供后续判断
  local -a declared_paths=()
  while IFS=$'\t' read -r path _field; do
    declared_paths+=("$path")
  done < <(declared_files)

  # 在仓库里查找版本字符串
  local found_undeclared=0
  while IFS= read -r match; do
    local match_file
    match_file=$(echo "$match" | cut -d: -f1)
    # 转成相对仓库根目录的路径
    local rel_path="${match_file#$REPO_ROOT/}"

    # 检查文件是否已在声明列表中
    local is_declared=0
    for dp in "${declared_paths[@]}"; do
      if [[ "$rel_path" == "$dp" ]]; then
        is_declared=1
        break
      fi
    done

    if [[ "$is_declared" -eq 0 ]]; then
      if [[ "$found_undeclared" -eq 0 ]]; then
        echo "以下未声明文件中也出现了 '$current_version'："
        found_undeclared=1
      fi
      echo "  $match"
    fi
  done < <(grep -rn "${exclude_args[@]}" -F "$current_version" "$REPO_ROOT" 2>/dev/null || true)

  if [[ "$found_undeclared" -eq 0 ]]; then
    echo "没有发现额外未声明文件引用该版本号，一切正常。"
  else
    echo ""
    echo "请检查上面的文件：如果它们也应参与 bump，请加入 .version-bump.json。"
    echo "如果它们应被忽略，请加入 audit.exclude。"
  fi
}

cmd_bump() {
  local new_version="$1"

  # 校验 semver 风格格式
  if ! echo "$new_version" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+'; then
    echo "错误：'$new_version' 看起来不像合法版本号（期望格式 X.Y.Z）" >&2
    exit 1
  fi

  echo "正在将所有声明文件更新到 $new_version……"
  echo ""

  while IFS=$'\t' read -r path field; do
    local fullpath="$REPO_ROOT/$path"
    if [[ ! -f "$fullpath" ]]; then
      echo "  跳过（文件缺失）：$path"
      continue
    fi
    local old_ver
    old_ver=$(read_json_field "$fullpath" "$field")
    write_json_field "$fullpath" "$field" "$new_version"
    printf "  %-45s  %s -> %s\n" "$path ($field)" "$old_ver" "$new_version"
  done < <(declared_files)

  echo ""
  echo "更新完成。现在开始做审计，检查是否有漏改文件……"
  echo ""
  cmd_audit
}

# --- 主入口 ---

case "${1:-}" in
  --check)
    cmd_check
    ;;
  --audit)
    cmd_audit
    ;;
  --help|-h|"")
    echo "用法：bump-version.sh <new-version> | --check | --audit"
    echo ""
    echo "  <new-version>  将所有声明文件提升到指定版本"
    echo "  --check        显示当前版本并检测是否漂移"
    echo "  --audit        检查版本并扫描仓库中未声明的版本引用"
    exit 0
    ;;
  --*)
    echo "错误：未知参数 '$1'" >&2
    exit 1
    ;;
  *)
    cmd_bump "$1"
    ;;
esac
