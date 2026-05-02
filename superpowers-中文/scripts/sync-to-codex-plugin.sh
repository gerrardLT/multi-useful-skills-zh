#!/usr/bin/env bash
#
# sync-to-codex-plugin.sh
#
# 将当前 superpowers checkout 同步到 prime-radiant-inc/openai-codex-plugins。
# 脚本会在临时目录中重新克隆 fork，再 rsync 上游已跟踪的插件内容
# （包括 .codex-plugin/ 下已提交的 Codex 文件和 assets/），随后提交、
# 推送同步分支，并自动打开 PR。
# 不依赖固定路径或用户名，会根据脚本位置自动推断上游仓库。
#
# 该脚本具有确定性：针对同一个上游 SHA 连跑两次，得到的 PR diff 应完全一致，
# 因而可以用连续两次运行来反向验证脚本本身是否稳定。
#
# 用法：
#   ./scripts/sync-to-codex-plugin.sh                              # 完整执行
#   ./scripts/sync-to-codex-plugin.sh -n                           # 仅预演
#   ./scripts/sync-to-codex-plugin.sh -y                           # 跳过确认
#   ./scripts/sync-to-codex-plugin.sh --local PATH                 # 使用现有 checkout
#   ./scripts/sync-to-codex-plugin.sh --base BRANCH                # 默认 main
#   ./scripts/sync-to-codex-plugin.sh --bootstrap                  # 缺目录时自动创建插件目录
#
# bootstrap 模式会跳过“base 分支上必须已经存在插件”的限制。
# 如果缺少 plugins/superpowers/，就先创建它，然后像普通同步一样，
# 从上游复制已跟踪的插件文件。
#
# 依赖：bash、rsync、git、gh（已认证）、python3。

set -euo pipefail

# =============================================================================
# 配置区：如果上游结构或标准插件形态发生变化，在这里调整
# =============================================================================

FORK="prime-radiant-inc/openai-codex-plugins"
DEFAULT_BASE="main"
DEST_REL="plugins/superpowers"

# 这些路径在上游存在，但不应落入嵌入式插件目录。
# 所有模式都使用前导 "/"，把匹配锚定到源根目录。
# 如果写成不带锚点的 "scripts/"，它会匹配任意深度下名为
# "scripts" 的目录，连合法的 skills/brainstorming/scripts/ 也会误伤。
# 加锚点就是为了避免这种情况。
# （.DS_Store 例外，故意不加锚点，因为 Finder 到处都会生成它。）
EXCLUDES=(
  # Dotfiles and infra — top-level only
  "/.claude/"
  "/.claude-plugin/"
  "/.codex/"
  "/.cursor-plugin/"
  "/.git/"
  "/.gitattributes"
  "/.github/"
  "/.gitignore"
  "/.opencode/"
  "/.version-bump.json"
  "/.worktrees/"
  ".DS_Store"

  # Root ceremony files
  "/AGENTS.md"
  "/CHANGELOG.md"
  "/CLAUDE.md"
  "/GEMINI.md"
  "/RELEASE-NOTES.md"
  "/gemini-extension.json"
  "/package.json"

  # Directories not shipped by canonical Codex plugins
  "/commands/"
  "/docs/"
  "/hooks/"
  "/lib/"
  "/scripts/"
  "/tests/"
  "/tmp/"
)

# =============================================================================
# 被忽略路径的辅助函数
# =============================================================================

IGNORED_DIR_EXCLUDES=()

path_has_directory_exclude() {
  local path="$1"
  local dir

  if [[ ${#IGNORED_DIR_EXCLUDES[@]} -eq 0 ]]; then
    return 1
  fi

  for dir in "${IGNORED_DIR_EXCLUDES[@]}"; do
    [[ "$path" == "$dir"* ]] && return 0
  done

  return 1
}

ignored_directory_has_tracked_descendants() {
  local path="$1"

  [[ -n "$(git -C "$UPSTREAM" ls-files --cached -- "$path/")" ]]
}

append_git_ignored_directory_excludes() {
  local path
  local lookup_path

  while IFS= read -r -d '' path; do
    [[ "$path" == */ ]] || continue

    lookup_path="${path%/}"
    if ! ignored_directory_has_tracked_descendants "$lookup_path"; then
      IGNORED_DIR_EXCLUDES+=("$path")
      RSYNC_ARGS+=(--exclude="/$path")
    fi
  done < <(git -C "$UPSTREAM" ls-files --others --ignored --exclude-standard --directory -z)
}

append_git_ignored_file_excludes() {
  local path

  while IFS= read -r -d '' path; do
    path_has_directory_exclude "$path" && continue
    RSYNC_ARGS+=(--exclude="/$path")
  done < <(git -C "$UPSTREAM" ls-files --others --ignored --exclude-standard -z)
}

# =============================================================================
# 参数解析
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
UPSTREAM="$(cd "$SCRIPT_DIR/.." && pwd)"
BASE="$DEFAULT_BASE"
DRY_RUN=0
YES=0
LOCAL_CHECKOUT=""
BOOTSTRAP=0

usage() {
  sed -n '/^# Usage:/,/^# Requires:/s/^# \{0,1\}//p' "$0"
  exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--dry-run)  DRY_RUN=1; shift ;;
    -y|--yes)      YES=1; shift ;;
    --local)       LOCAL_CHECKOUT="$2"; shift 2 ;;
    --base)        BASE="$2"; shift 2 ;;
    --bootstrap)   BOOTSTRAP=1; shift ;;
    -h|--help)     usage 0 ;;
    *)             echo "未知参数：$1" >&2; usage 2 ;;
  esac
done

# =============================================================================
# 预检查
# =============================================================================

die() { echo "错误：$*" >&2; exit 1; }

command -v rsync >/dev/null   || die "PATH 中找不到 rsync"
command -v git >/dev/null     || die "PATH 中找不到 git"
command -v gh >/dev/null      || die "找不到 gh，请先安装 GitHub CLI"
command -v python3 >/dev/null || die "PATH 中找不到 python3"

gh auth status >/dev/null 2>&1 || die "gh 尚未认证，请先运行 'gh auth login'"

[[ -d "$UPSTREAM/.git" ]]         || die "上游目录 '$UPSTREAM' 不是有效的 git checkout"
[[ -f "$UPSTREAM/.codex-plugin/plugin.json" ]] || die "缺少已提交的 Codex manifest：$UPSTREAM/.codex-plugin/plugin.json"

# 从已提交的 Codex manifest 中读取上游版本号。
UPSTREAM_VERSION="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$UPSTREAM/.codex-plugin/plugin.json")"
[[ -n "$UPSTREAM_VERSION" ]] || die "无法从已提交的 Codex manifest 中读取 'version'"

UPSTREAM_BRANCH="$(cd "$UPSTREAM" && git branch --show-current)"
UPSTREAM_SHA="$(cd "$UPSTREAM" && git rev-parse HEAD)"
UPSTREAM_SHORT="$(cd "$UPSTREAM" && git rev-parse --short HEAD)"

confirm() {
  [[ $YES -eq 1 ]] && return 0
  read -rp "$1 [y/N] " ans
  [[ "$ans" == "y" || "$ans" == "Y" ]]
}

if [[ "$UPSTREAM_BRANCH" != "main" ]]; then
  echo "警告：上游当前分支是 '$UPSTREAM_BRANCH'，不是 'main'"
  confirm "仍要从 '$UPSTREAM_BRANCH' 同步吗？" || exit 1
fi

UPSTREAM_STATUS="$(cd "$UPSTREAM" && git status --porcelain)"
if [[ -n "$UPSTREAM_STATUS" ]]; then
  echo "警告：上游存在未提交改动："
  echo "$UPSTREAM_STATUS" | sed 's/^/  /'
  echo "本次同步将使用工作区状态，而不是 HEAD ($UPSTREAM_SHORT)。"
  confirm "仍要继续吗？" || exit 1
fi

# =============================================================================
# 准备目标仓库（重新克隆 fork，或使用 --local）
# =============================================================================

CLEANUP_DIR=""
cleanup() {
  if [[ -n "$CLEANUP_DIR" ]]; then
    rm -rf "$CLEANUP_DIR"
  fi
}
trap cleanup EXIT

if [[ -n "$LOCAL_CHECKOUT" ]]; then
  DEST_REPO="$(cd "$LOCAL_CHECKOUT" && pwd)"
  [[ -d "$DEST_REPO/.git" ]] || die "--local 指定的路径 '$DEST_REPO' 不是有效的 git checkout"
else
  echo "正在克隆 $FORK ..."
  CLEANUP_DIR="$(mktemp -d)"
  DEST_REPO="$CLEANUP_DIR/openai-codex-plugins"
  gh repo clone "$FORK" "$DEST_REPO" >/dev/null
fi

DEST="$DEST_REPO/$DEST_REL"
PREVIEW_REPO="$DEST_REPO"
PREVIEW_DEST="$DEST"

overlay_destination_paths() {
  local repo="$1"
  local path
  local source_path
  local preview_path

  while IFS= read -r -d '' path; do
    source_path="$repo/$path"
    preview_path="$PREVIEW_REPO/$path"

    if [[ -e "$source_path" ]]; then
      mkdir -p "$(dirname "$preview_path")"
      cp -R "$source_path" "$preview_path"
    else
      rm -rf "$preview_path"
    fi
  done
}

copy_local_destination_overlay() {
  overlay_destination_paths "$DEST_REPO" < <(
    git -C "$DEST_REPO" diff --name-only -z -- "$DEST_REL"
  )
  overlay_destination_paths "$DEST_REPO" < <(
    git -C "$DEST_REPO" diff --cached --name-only -z -- "$DEST_REL"
  )
  overlay_destination_paths "$DEST_REPO" < <(
    git -C "$DEST_REPO" ls-files --others --exclude-standard -z -- "$DEST_REL"
  )
  overlay_destination_paths "$DEST_REPO" < <(
    git -C "$DEST_REPO" ls-files --others --ignored --exclude-standard -z -- "$DEST_REL"
  )
}

local_checkout_has_uncommitted_destination_changes() {
  [[ -n "$(git -C "$DEST_REPO" status --porcelain=1 --untracked-files=all --ignored=matching -- "$DEST_REL")" ]]
}

prepare_preview_checkout() {
  if [[ -n "$LOCAL_CHECKOUT" ]]; then
    [[ -n "$CLEANUP_DIR" ]] || CLEANUP_DIR="$(mktemp -d)"
    PREVIEW_REPO="$CLEANUP_DIR/preview"
    git clone -q --no-local "$DEST_REPO" "$PREVIEW_REPO"
    PREVIEW_DEST="$PREVIEW_REPO/$DEST_REL"
  fi

  git -C "$PREVIEW_REPO" checkout -q "$BASE" 2>/dev/null || die "fork $FORK 中不存在 base 分支 '$BASE'"
  if [[ -n "$LOCAL_CHECKOUT" ]]; then
    copy_local_destination_overlay
  fi
  if [[ $BOOTSTRAP -ne 1 ]]; then
    [[ -d "$PREVIEW_DEST" ]] || die "base 分支 '$BASE' 中不存在 '$DEST_REL/'；请使用 --bootstrap，或改传 --base <branch>"
  fi
}

prepare_apply_checkout() {
  git -C "$DEST_REPO" checkout -q "$BASE" 2>/dev/null || die "fork $FORK 中不存在 base 分支 '$BASE'"
  if [[ $BOOTSTRAP -ne 1 ]]; then
    [[ -d "$DEST" ]] || die "base 分支 '$BASE' 中不存在 '$DEST_REL/'；请使用 --bootstrap，或改传 --base <branch>"
  fi
}

apply_to_preview_checkout() {
  if [[ $BOOTSTRAP -eq 1 ]]; then
    mkdir -p "$PREVIEW_DEST"
  fi

  rsync "${RSYNC_ARGS[@]}" "$UPSTREAM/" "$PREVIEW_DEST/"
}

preview_checkout_has_changes() {
  [[ -n "$(git -C "$PREVIEW_REPO" status --porcelain "$DEST_REL")" ]]
}

prepare_preview_checkout

TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
if [[ $BOOTSTRAP -eq 1 ]]; then
  SYNC_BRANCH="bootstrap/superpowers-${UPSTREAM_SHORT}-${TIMESTAMP}"
else
  SYNC_BRANCH="sync/superpowers-${UPSTREAM_SHORT}-${TIMESTAMP}"
fi

# =============================================================================
# 构建 rsync 参数
# =============================================================================

RSYNC_ARGS=(-av --delete --delete-excluded)
for pat in "${EXCLUDES[@]}"; do RSYNC_ARGS+=(--exclude="$pat"); done
append_git_ignored_directory_excludes
append_git_ignored_file_excludes

# =============================================================================
# 预演预览（始终显示）
# =============================================================================

echo ""
echo "上游：    $UPSTREAM ($UPSTREAM_BRANCH @ $UPSTREAM_SHORT)"
echo "版本：    $UPSTREAM_VERSION"
echo "Fork：    $FORK"
echo "Base：    $BASE"
echo "分支：    $SYNC_BRANCH"
if [[ $BOOTSTRAP -eq 1 ]]; then
  echo "模式：    BOOTSTRAP（缺少 plugins/superpowers/ 时自动创建）"
fi
echo ""
echo "=== 预演预览（rsync --dry-run） ==="
rsync "${RSYNC_ARGS[@]}" --dry-run --itemize-changes "$UPSTREAM/" "$PREVIEW_DEST/"
echo "=== 预览结束 ==="
echo ""

if [[ $DRY_RUN -eq 1 ]]; then
  echo ""
  echo "本次仅做预演，没有修改，也没有推送。"
  exit 0
fi

# =============================================================================
# 应用变更
# =============================================================================

echo ""
confirm "确认应用改动、推送分支并创建 PR 吗？" || { echo "已取消。"; exit 1; }

echo ""
if [[ -n "$LOCAL_CHECKOUT" ]]; then
  if local_checkout_has_uncommitted_destination_changes; then
    die "本地 checkout 在 '$DEST_REL' 下有未提交改动；请先提交、stash 或丢弃后再同步"
  fi

  apply_to_preview_checkout
  if ! preview_checkout_has_changes; then
    echo "没有变更：嵌入式插件已经和上游 $UPSTREAM_SHORT (v$UPSTREAM_VERSION) 保持同步。"
    exit 0
  fi
fi

prepare_apply_checkout
cd "$DEST_REPO"
git checkout -q -b "$SYNC_BRANCH"
echo "正在同步上游内容……"
if [[ $BOOTSTRAP -eq 1 ]]; then
  mkdir -p "$DEST"
fi
rsync "${RSYNC_ARGS[@]}" "$UPSTREAM/" "$DEST/"

# 如果实际上没有任何改动，就提前退出
cd "$DEST_REPO"
if [[ -z "$(git status --porcelain "$DEST_REL")" ]]; then
  echo "没有变更：嵌入式插件已经和上游 $UPSTREAM_SHORT (v$UPSTREAM_VERSION) 保持同步。"
  exit 0
fi

# =============================================================================
# 提交、推送并打开 PR
# =============================================================================

git add "$DEST_REL"

if [[ $BOOTSTRAP -eq 1 ]]; then
  COMMIT_TITLE="bootstrap superpowers v$UPSTREAM_VERSION from upstream main @ $UPSTREAM_SHORT"
  PR_BODY="Initial bootstrap of the superpowers plugin from upstream \`main\` @ \`$UPSTREAM_SHORT\` (v$UPSTREAM_VERSION).

Creates \`plugins/superpowers/\` by copying the tracked plugin files from upstream, including \`.codex-plugin/plugin.json\` and \`assets/\`.

Run via: \`scripts/sync-to-codex-plugin.sh --bootstrap\`
Upstream commit: https://github.com/obra/superpowers/commit/$UPSTREAM_SHA

This is a one-time bootstrap. Subsequent syncs will be normal (non-bootstrap) runs using the same tracked upstream plugin files."
else
  COMMIT_TITLE="sync superpowers v$UPSTREAM_VERSION from upstream main @ $UPSTREAM_SHORT"
  PR_BODY="Automated sync from superpowers upstream \`main\` @ \`$UPSTREAM_SHORT\` (v$UPSTREAM_VERSION).

Copies the tracked plugin files from upstream, including the committed Codex manifest and assets.

Run via: \`scripts/sync-to-codex-plugin.sh\`
Upstream commit: https://github.com/obra/superpowers/commit/$UPSTREAM_SHA

Running the sync tool again against the same upstream SHA should produce a PR with an identical diff — use that to verify the tool is behaving."
fi

git commit --quiet -m "$COMMIT_TITLE

Automated sync via scripts/sync-to-codex-plugin.sh
Upstream: https://github.com/obra/superpowers/commit/$UPSTREAM_SHA
Branch:   $SYNC_BRANCH"

echo "正在将 $SYNC_BRANCH 推送到 $FORK ..."
git push -u origin "$SYNC_BRANCH" --quiet

echo "正在创建 PR ..."
PR_URL="$(gh pr create \
  --repo "$FORK" \
  --base "$BASE" \
  --head "$SYNC_BRANCH" \
  --title "$COMMIT_TITLE" \
  --body "$PR_BODY")"

PR_NUM="${PR_URL##*/}"
DIFF_URL="https://github.com/$FORK/pull/$PR_NUM/files"

echo ""
echo "PR 已创建：$PR_URL"
echo "Diff 查看地址：$DIFF_URL"
