# 面向 Claude Code 的跨平台 Polyglot Hooks

Claude Code 插件需要能在 Windows、macOS 和 Linux 上都工作的 hooks。本文档解释了 polyglot wrapper 技术，以及它为何能做到这一点。

## 问题

Claude Code 会通过系统默认 shell 运行 hook commands：
- **Windows**：CMD.exe
- **macOS/Linux**：bash 或 sh

这会带来几个问题：

1. **脚本执行**：Windows CMD 不能直接执行 `.sh` 文件，它会尝试用文本编辑器打开
2. **路径格式**：Windows 用反斜杠（`C:\path`），Unix 用正斜杠（`/path`）
3. **环境变量**：`$VAR` 语法在 CMD 中不能用
4. **PATH 中没有 `bash`**：即使装了 Git Bash，当 CMD 运行时，`bash` 也通常不在 PATH 里

## 解决方案：Polyglot `.cmd` Wrapper

Polyglot script 指的是一段同时满足多种语言语法的脚本。我们的 wrapper 同时是 CMD 和 bash 的合法语法：

```cmd
: << 'CMDBLOCK'
@echo off
"C:\Program Files\Git\bin\bash.exe" -l -c "\"$(cygpath -u \"$CLAUDE_PLUGIN_ROOT\")/hooks/session-start.sh\""
exit /b
CMDBLOCK

# Unix shell runs from here
"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh"
```

### 它如何工作

#### 在 Windows 上（CMD.exe）

1. `: << 'CMDBLOCK'` - CMD 会把 `:` 视为 label（类似 `:label`），并忽略后面的 `<< 'CMDBLOCK'`
2. `@echo off` - 关闭命令回显
3. 执行 `bash.exe`，并带上：
   - `-l`（login shell），确保拿到带 Unix 工具的 PATH
   - `cygpath -u`，把 Windows 路径转换成 Unix 格式（如 `C:\foo` -> `/c/foo`）
4. `exit /b` - 退出 batch script，让 CMD 在这里停止
5. `CMDBLOCK` 后面的所有内容，CMD 永远不会执行到

#### 在 Unix 上（bash/sh）

1. `: << 'CMDBLOCK'` - `:` 是 no-op，`<< 'CMDBLOCK'` 会开启一个 heredoc
2. 一直到 `CMDBLOCK` 之间的所有内容，都会被 heredoc 吃掉，相当于忽略
3. `# Unix shell runs from here` - 普通注释
4. 之后脚本直接通过 Unix 路径运行

## 文件结构

```text
hooks/
|- hooks.json           # 指向 .cmd wrapper
|- session-start.cmd    # Polyglot wrapper（跨平台入口）
`- session-start.sh     # 真正的 hook 逻辑（bash 脚本）
```

### hooks.json

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.cmd\""
          }
        ]
      }
    ]
  }
}
```

注意：路径必须带引号，因为 Windows 上 `${CLAUDE_PLUGIN_ROOT}` 很可能包含空格，比如 `C:\Program Files\...`。

## 要求

### Windows
- **必须安装 Git for Windows**（提供 `bash.exe` 和 `cygpath`）
- 默认安装路径为：`C:\Program Files\Git\bin\bash.exe`
- 如果 Git 装在别的地方，就需要改 wrapper 里的路径

### Unix（macOS/Linux）
- 标准 bash 或 sh shell
- `.cmd` 文件必须具有可执行权限（`chmod +x`）

## 如何编写跨平台 Hook 脚本

真正的 hook 逻辑写在 `.sh` 文件里。为了保证它通过 Git Bash 在 Windows 上也能工作：

### 推荐做法
- 尽量优先使用纯 bash builtins
- 用 `$(command)`，不要用反引号
- 所有变量展开都加引号：`"$VAR"`
- 输出优先使用 `printf` 或 here-docs

### 尽量避免
- 依赖那些可能不在 PATH 里的外部命令，如 `sed`、`awk`、`grep`
- 如果必须使用，它们在 Git Bash 里通常可用，但前提是用 `bash -l` 把 PATH 配好

### 示例：不用 sed/awk 做 JSON 转义

不要这样写：
```bash
escaped=$(echo "$content" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')
```

改用纯 bash：
```bash
escape_for_json() {
    local input="$1"
    local output=""
    local i char
    for (( i=0; i<${#input}; i++ )); do
        char="${input:$i:1}"
        case "$char" in
            $'\\') output+='\\' ;;
            '"') output+='\"' ;;
            $'\n') output+='\n' ;;
            $'\r') output+='\r' ;;
            $'\t') output+='\t' ;;
            *) output+="$char" ;;
        esac
    done
    printf '%s' "$output"
}
```

## 可复用的 Wrapper 模式

如果一个插件有多个 hooks，可以做一个通用 wrapper，通过参数接收脚本名：

### `run-hook.cmd`
```cmd
: << 'CMDBLOCK'
@echo off
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_NAME=%~1"
"C:\Program Files\Git\bin\bash.exe" -l -c "cd \"$(cygpath -u \"%SCRIPT_DIR%\")\" && \"./%SCRIPT_NAME%\""
exit /b
CMDBLOCK

# Unix shell runs from here
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_NAME="$1"
shift
"${SCRIPT_DIR}/${SCRIPT_NAME}" "$@"
```

### 在 hooks.json 中使用可复用 wrapper
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start.sh"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" validate-bash.sh"
          }
        ]
      }
    ]
  }
}
```

## 故障排查

### `bash is not recognized`
CMD 找不到 bash。当前 wrapper 使用的是完整路径 `C:\Program Files\Git\bin\bash.exe`。如果 Git 装在别处，就更新这条路径。

### `cygpath: command not found` 或 `dirname: command not found`
Bash 不是以 login shell 方式启动的。确认带上了 `-l`。

### 路径里出现奇怪的 `\/`
`${CLAUDE_PLUGIN_ROOT}` 被展开成了以反斜杠结尾的 Windows 路径，然后又拼接上了 `/hooks/...`。应使用 `cygpath` 把整个路径一起转换。

### 脚本被文本编辑器打开，而不是执行
说明 hooks.json 直接指向了 `.sh` 文件。应该改为指向 `.cmd` wrapper。

### 在终端能跑，但当作 hook 不行
Claude Code 运行 hooks 的方式可能和你手动执行不同。可以这样模拟 hook 环境：

```powershell
$env:CLAUDE_PLUGIN_ROOT = "C:\path\to\plugin"
cmd /c "C:\path\to\plugin\hooks\session-start.cmd"
```

## 相关问题

- [anthropics/claude-code#9758](https://github.com/anthropics/claude-code/issues/9758) - `.sh` 脚本在 Windows 上会被编辑器打开
- [anthropics/claude-code#3417](https://github.com/anthropics/claude-code/issues/3417) - Hooks 在 Windows 上不工作
- [anthropics/claude-code#6023](https://github.com/anthropics/claude-code/issues/6023) - 找不到 `CLAUDE_PROJECT_DIR`