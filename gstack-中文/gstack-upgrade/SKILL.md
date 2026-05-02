---
name: gstack-upgrade
version: 1.1.0
description: |-
  将 gstack 升级到最新版本。检测全局安装与本地安装，
  运行升级并显示新内容。当被要求“升级 gstack”时使用，
  “更新 gstack”或“获取最新版本”。
  语音触发器（语音转文本别名）：“升级工具”、“更新工具”、“gee 堆栈升级”、“g 堆栈升级”。
triggers:
- upgrade gstack
- update gstack version
- get latest gstack
allowed-tools:
- Bash
- Read
- Write
- AskUserQuestion
---
<!-- 从 SKILL.md.tmpl 自动生成 — 不要直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->

# /gstack-upgrade

将 gstack 升级到最新版本并显示新功能。

## 内联升级流程

所有技能前导码在检测到 `UPGRADE_AVAILABLE` 时都会引用此部分。

### 第 1 步：询问用户（或自动升级）

首先，检查自动升级是否开启：
```bash
_AUTO=""
[ "${GSTACK_AUTO_UPGRADE:-}" = "1" ] && _AUTO="true"
[ -z "$_AUTO" ] && _AUTO=$(~/.claude/skills/gstack/bin/gstack-config get auto_upgrade 2>/dev/null || true)
echo "AUTO_UPGRADE=$_AUTO"
```

**如果 `AUTO_UPGRADE=true` 或 `AUTO_UPGRADE=1`：** 跳过 AskUserQuestion。记录“自动升级 gstack v{old} → v{new}...”并直接执行步骤 2。如果自动升级期间 `./setup` 失败，请从备份（`.bak` 目录）恢复并警告用户：“自动升级失败 — 恢复以前的版本。手动运行 `/gstack-upgrade` 重试。”

**否则**，使用 AskUserQuestion：
- 问题：“gstack **v{new}** 可用（您使用的是 v{old}）。现在升级吗？”
- 选项：[“是的，立即升级”、“始终让我了解最新情况”、“现在不行”、“不再询问”]

**如果“是，立即升级”：** 继续执行步骤 2。

**如果“始终让我了解最新情况”：**
```bash
~/.claude/skills/gstack/bin/gstack-config set auto_upgrade true
```
告诉用户：“自动升级已启用。未来的更新将自动安装。”然后继续步骤 2。

**如果“不是现在”：** 写入带有逐步退避的延迟提醒状态（第一次延迟 = 24 小时，第二次 = 48 小时，第三次及以后 = 1 周），然后继续当前技能。不要再提升级了。
```bash
_SNOOZE_FILE="$HOME/.gstack/update-snoozed"
_REMOTE_VER="{new}"
_CUR_LEVEL=0
if [ -f "$_SNOOZE_FILE" ]; then
  _SNOOZED_VER=$(awk '{print $1}' "$_SNOOZE_FILE")
  if [ "$_SNOOZED_VER" = "$_REMOTE_VER" ]; then
    _CUR_LEVEL=$(awk '{print $2}' "$_SNOOZE_FILE")
    case "$_CUR_LEVEL" in *[!0-9]*) _CUR_LEVEL=0 ;; esac
  fi
fi
_NEW_LEVEL=$((_CUR_LEVEL + 1))
[ "$_NEW_LEVEL" -gt 3 ] && _NEW_LEVEL=3
echo "$_REMOTE_VER $_NEW_LEVEL $(date +%s)" > "$_SNOOZE_FILE"
```
注意： `{new}` 是 `UPGRADE_AVAILABLE` 输出的远程版本 - 从更新检查结果中替换它。

告诉用户延迟提醒的持续时间：“24 小时后下一次提醒”（或 48 小时或 1 周，具体取决于级别）。提示：“在 `~/.gstack/config.yaml` 中设置 `auto_upgrade: true` 以进行自动升级。”

**如果“不再询问”：**
```bash
~/.claude/skills/gstack/bin/gstack-config set update_check false
```
告诉用户：“更新检查已禁用。运行 `~/.claude/skills/gstack/bin/gstack-config set update_check true` 以重新启用。”
继续当前技能。

### 第 2 步：检测安装类型

```bash
if [ -d "$HOME/.claude/skills/gstack/.git" ]; then
  INSTALL_TYPE="global-git"
  INSTALL_DIR="$HOME/.claude/skills/gstack"
elif [ -d "$HOME/.gstack/repos/gstack/.git" ]; then
  INSTALL_TYPE="global-git"
  INSTALL_DIR="$HOME/.gstack/repos/gstack"
elif [ -d ".claude/skills/gstack/.git" ]; then
  INSTALL_TYPE="local-git"
  INSTALL_DIR=".claude/skills/gstack"
elif [ -d ".agents/skills/gstack/.git" ]; then
  INSTALL_TYPE="local-git"
  INSTALL_DIR=".agents/skills/gstack"
elif [ -d ".claude/skills/gstack" ]; then
  INSTALL_TYPE="vendored"
  INSTALL_DIR=".claude/skills/gstack"
elif [ -d "$HOME/.claude/skills/gstack" ]; then
  INSTALL_TYPE="vendored-global"
  INSTALL_DIR="$HOME/.claude/skills/gstack"
else
  echo "ERROR: gstack not found"
  exit 1
fi
echo "Install type: $INSTALL_TYPE at $INSTALL_DIR"
```

上面打印的安装类型和目录路径将在所有后续步骤中使用。

### 第 3 步：保存旧版本

使用下面第 2 步输出中的安装目录：

```bash
OLD_VERSION=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
```

### 第四步：升级

使用步骤 2 中检测到的安装类型和目录：

**对于 git 安装**（全局 git、本地 git）：
```bash
cd "$INSTALL_DIR"
STASH_OUTPUT=$(git stash 2>&1)
git fetch origin
git reset --hard origin/main
./setup
```
如果 `$STASH_OUTPUT` 包含“已保存的工作目录”，则警告用户：“注意：本地更改已隐藏。在技能目录中运行 `git stash pop` 来恢复它们。”

**对于本地安装**（vendored、vendored-global）：
```bash
PARENT=$(dirname "$INSTALL_DIR")
TMP_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/garrytan/gstack.git "$TMP_DIR/gstack"
mv "$INSTALL_DIR" "$INSTALL_DIR.bak"
mv "$TMP_DIR/gstack" "$INSTALL_DIR"
cd "$INSTALL_DIR" && ./setup
rm -rf "$INSTALL_DIR.bak" "$TMP_DIR"
```

### 步骤 4.5：处理本地副本

使用步骤 2 中的安装目录。检查是否还有本地副本，以及团队模式是否处于活动状态：

```bash
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
LOCAL_GSTACK=""
if [ -n "$_ROOT" ] && [ -d "$_ROOT/.claude/skills/gstack" ]; then
  _RESOLVED_LOCAL=$(cd "$_ROOT/.claude/skills/gstack" && pwd -P)
  _RESOLVED_PRIMARY=$(cd "$INSTALL_DIR" && pwd -P)
  if [ "$_RESOLVED_LOCAL" != "$_RESOLVED_PRIMARY" ]; then
    LOCAL_GSTACK="$_ROOT/.claude/skills/gstack"
  fi
fi
_TEAM_MODE=$(~/.claude/skills/gstack/bin/gstack-config get team_mode 2>/dev/null || echo "false")
echo "LOCAL_GSTACK=$LOCAL_GSTACK"
echo "TEAM_MODE=$_TEAM_MODE"
```

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 是 `true`：** 删除本地副本。团队模式使用全局安装作为单一事实来源。

```bash
cd "$_ROOT"
git rm -r --cached .claude/skills/gstack/ 2>/dev/null || true
if ! grep -qF '.claude/skills/gstack/' .gitignore 2>/dev/null; then
  echo '.claude/skills/gstack/' >> .gitignore
fi
rm -rf "$LOCAL_GSTACK"
```
告诉用户：“删除了 `$LOCAL_GSTACK` 处的本地副本（团队模式处于活动状态 - 全局安装是事实来源）。准备好后提交 `.gitignore` 更改。”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 不是 `true`：** 通过从新升级的主安装复制来更新它（与 README 本地安装的方法相同）：
```bash
mv "$LOCAL_GSTACK" "$LOCAL_GSTACK.bak"
cp -Rf "$INSTALL_DIR" "$LOCAL_GSTACK"
rm -rf "$LOCAL_GSTACK/.git"
cd "$LOCAL_GSTACK" && ./setup
rm -rf "$LOCAL_GSTACK.bak"
```
告诉用户：“还更新了 `$LOCAL_GSTACK` 处的本地副本 — 准备好后提交 `.claude/skills/gstack/`。”

如果 `./setup` 失败，请从备份中恢复并警告用户：
```bash
rm -rf "$LOCAL_GSTACK"
mv "$LOCAL_GSTACK.bak" "$LOCAL_GSTACK"
```
告诉用户：“同步失败 - 在 `$LOCAL_GSTACK` 处恢复了以前的版本。手动运行 `/gstack-upgrade` 以重试。”

### 步骤 4.75：运行版本迁移

`./setup` 完成后，运行旧版本和新版本之间的任何迁移脚本。迁移处理仅 `./setup` 无法覆盖的状态修复（过时的配置、孤立的文件、目录结构更改）。

```bash
MIGRATIONS_DIR="$INSTALL_DIR/gstack-upgrade/migrations"
if [ -d "$MIGRATIONS_DIR" ]; then
  for migration in $(find "$MIGRATIONS_DIR" -maxdepth 1 -name 'v*.sh' -type f 2>/dev/null | sort -V); do
    # Extract version from filename: v0.15.2.0.sh → 0.15.2.0
    m_ver="$(basename "$migration" .sh | sed 's/^v//')"
    # Run if this migration version is newer than old version
    # (simple string compare works for dotted versions with same segment count)
    if [ "$OLD_VERSION" != "unknown" ] && [ "$(printf '%s\n%s' "$OLD_VERSION" "$m_ver" | sort -V | head -1)" = "$OLD_VERSION" ] && [ "$OLD_VERSION" != "$m_ver" ]; then
      echo "Running migration $m_ver..."
      bash "$migration" || echo "  Warning: migration $m_ver had errors (non-fatal)"
    fi
  done
fi
```

迁移是 `gstack-upgrade/migrations/` 中的幂等 bash 脚本。每个都被命名为 `v{VERSION}.sh` 并且仅在从旧版本升级时运行。请参阅 CONTRIBUTING.md 了解如何添加新迁移。

### 步骤5：写入标记+清除缓存

```bash
mkdir -p ~/.gstack
echo "$OLD_VERSION" > ~/.gstack/just-upgraded-from
rm -f ~/.gstack/last-update-check
rm -f ~/.gstack/update-snoozed
```

### 第 6 步：展示新内容

读取 `$INSTALL_DIR/CHANGELOG.md`。查找旧版本和新版本之间的所有版本条目。总结为按主题分组的 5-7 个项目符号。不要不知所措——专注于面向用户的变化。跳过内部重构，除非它们很重要。

格式：
```
gstack v{new} — upgraded from v{old}!

What's new:
- [bullet 1]
- [bullet 2]
- ...

Happy shipping!
```

### 第 7 步：继续

显示新增功能后，继续使用用户最初调用的任何技能。升级已完成 - 无需采取进一步操作。

---

## 独立使用

当直接作为 `/gstack-upgrade` 调用时（不是从序言中）：

1. 强制进行新的更新检查（绕过缓存）：
```bash
~/.claude/skills/gstack/bin/gstack-update-check --force 2>/dev/null || \
.claude/skills/gstack/bin/gstack-update-check --force 2>/dev/null || true
```
使用输出来确定升级是否可用。

2. 如果 `UPGRADE_AVAILABLE <old> <new>`：请执行上述步骤 2-6。

3. 如果没有输出（主版本是最新的）：检查是否有过时的本地副本。

运行上面的步骤 2 bash 块来检测主要安装类型和目录（`INSTALL_TYPE` 和 `INSTALL_DIR`）。然后运行上面的步骤 4.5 检测 bash 块来检查本地副本 (`LOCAL_GSTACK`) 和团队模式状态 (`TEAM_MODE`)。

**如果 `LOCAL_GSTACK` 为空**（没有本地副本）：告诉用户“您已经使用最新版本 (v{version})”。

**如果 `LOCAL_GSTACK` 非空并且 `TEAM_MODE` 是 `true`：** 使用上面的步骤 4.5 团队模式删除 bash 块删除本地副本。告诉用户：“全局 v{version} 是最新的。删除了陈旧的本地副本（团队模式处于活动状态）。准备好后提交 `.gitignore` 更改。”

**如果 `LOCAL_GSTACK` 非空且 `TEAM_MODE` 不是 `true`**，则比较版本：
```bash
PRIMARY_VER=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
LOCAL_VER=$(cat "$LOCAL_GSTACK/VERSION" 2>/dev/null || echo "unknown")
echo "PRIMARY=$PRIMARY_VER LOCAL=$LOCAL_VER"
```

**如果版本不同：** 按照上面的步骤 4.5 同步 bash 块从主副本更新本地副本。告诉用户：“全局 v{PRIMARY_VER} 已更新。从 v{LOCAL_VER} → v{PRIMARY_VER} 更新了本地副本。准备好后提交 `.claude/skills/gstack/`。”

**如果版本匹配：**告诉用户“您使用的是最新版本 (v{PRIMARY_VER})。全球和本地副本都是最新的。”