# Slate Host 集成 - 研究与设计文档

**日期：** 2026-04-02  
**分支：** garrytan/slate-agent-support  
**状态：** 研究已完成，但被 host config refactor 阻塞  
**取代：** 无

## Slate 是什么

Slate 是 Random Labs 的专有 coding agent CLI。

安装方式：`npm i -g @randomlabs/slate` 或 `brew install anthropic/tap/slate`。  
许可证：专有。它是一个约 85MB 的 Bun 编译二进制文件（arm64/x64，支持 darwin/linux/windows）。  
npm 包：`@randomlabs/slate@1.0.25`，本体是一个很薄的 8.8KB launcher，再加上按平台拆分的 optional dependencies。

多模型：会动态选择 Claude Sonnet / Opus / Haiku，以及其他模型。  
它面向 “swarm orchestration” 场景，支持持续数小时的长会话。

## Slate 是 OpenCode 的一个 fork

这一点已经通过对 85MB Mach-O arm64 二进制文件的 **二进制字符串分析** 确认：

- 二进制文件中的内部名称是：`name: "opencode"`
- 所有 `OPENCODE_*` 环境变量都存在，同时也包含 `SLATE_*` 对应项
- 共享 OpenCode 的 tool / skill 架构、LSP 集成和终端管理
- 但使用了自己的品牌、API endpoints（例如 `api.randomlabs.ai`、`agent-worker-prod.randomlabs.workers.dev`）以及配置路径

这对集成很重要：大部分 OpenCode 约定依然成立，但 Slate 在其基础上又叠加了自己的路径和环境变量。

## Skill 发现（已由二进制确认）

Slate 会扫描全部四类目录族来发现 skills。二进制文件中的报错字符串已经确认：

```text
"failed .slate directory scan for skills"
"failed .claude directory scan for skills"
"failed .agents directory scan for skills"
"failed .opencode directory scan for skills"
```

**发现路径（按 Slate 文档中的优先级顺序）：**

1. `.slate/skills/<name>/SKILL.md` - 项目级，优先级最高
2. `~/.slate/skills/<name>/SKILL.md` - 全局
3. `.opencode/skills/`、`.agents/skills/` - 兼容性回退路径
4. `.claude/skills/` - Claude Code 兼容性回退路径，优先级最低
5. `slate.json` 中声明的自定义路径

**Glob 模式：** `**/SKILL.md` 和 `{skill,skills}/**/SKILL.md`

**命令：** 目录结构与 skills 相同，但放在 `commands/` 子目录下：`/.slate/commands/`、`/.claude/commands/`、`/.agents/commands/`、`/.opencode/commands/`

**Skill 前置数据：** 根据 Slate 文档，使用带 `name` 和 `description` 字段的 YAML。文档里没有说明这两个字段的长度上限。

## 项目指令

Slate 会同时读取 `CLAUDE.md` 和 `AGENTS.md` 作为项目指令。  
这两个字面字符串也已在二进制文件中确认存在。

因此现有 gstack 项目无需改动，`CLAUDE.md` 可以直接照常工作。

## 配置

**配置文件：** `slate.json` / `slate.jsonc`，**不是** `opencode.json`

**Slate 文档中的配置项：**

- `privacy`（boolean）：禁用遥测 / 日志记录
- 权限：按工具配置 `allow`、`ask`、`deny`，适用于 `read`、`edit`、`bash`、`grep`、`webfetch`、`websearch`、`*`
- 模型槽位：`models.main`、`models.subagent`、`models.search`、`models.reasoning`
- MCP servers：支持本地或远程，并可带自定义命令和 headers
- 自定义命令：`/commands`，支持模板

安装脚本**不应该**生成 `slate.json`。权限配置应由用户自行管理。

## CLI 标志（无头模式）

```text
--stream-json / --output-format stream-json  - JSONL 输出，文档声称“compatible with Anthropic Claude Code SDK”
--dangerously-skip-permissions               - 跳过全部权限检查（CI / 自动化）
--input-format stream-json                   - 程序化输入
-q                                           - 非交互模式
-w <dir>                                     - workspace 目录
--output-format text                         - 纯文本输出（默认）
```

**Stream-JSON 格式：** Slate 文档声称它“compatible with Anthropic Claude Code SDK”。  
这一点还没有经过验证。考虑到它的 OpenCode 血统，很可能匹配 Claude Code 的 NDJSON event schema，例如 `type: "assistant"`、`type: "tool_result"`、`type: "result"`。

**仍需验证：** 用有效 credits 运行 `slate -q "hello" --stream-json`，先抓到实际 JSONL events，再去构建 session runner parser。

## 环境变量（来自二进制字符串）

### Slate 专属

```text
SLATE_API_KEY                              - API key
SLATE_AGENT                                - agent 选择
SLATE_AUTO_SHARE                           - auto-share 设置
SLATE_CLIENT                               - client identifier
SLATE_CONFIG                               - config override
SLATE_CONFIG_CONTENT                       - inline config
SLATE_CONFIG_DIR                           - config 目录
SLATE_DANGEROUSLY_SKIP_PERMISSIONS         - 跳过权限检查
SLATE_DIR                                  - data 目录覆盖
SLATE_DISABLE_AUTOUPDATE                   - 禁用自动更新
SLATE_DISABLE_CLAUDE_CODE                  - 完全禁用 Claude Code 集成
SLATE_DISABLE_CLAUDE_CODE_PROMPT           - 禁用 Claude Code prompt 加载
SLATE_DISABLE_CLAUDE_CODE_SKILLS           - 禁用 `.claude/skills/` 加载
SLATE_DISABLE_DEFAULT_PLUGINS              - 禁用默认插件
SLATE_DISABLE_FILETIME_CHECK               - 禁用文件时间检查
SLATE_DISABLE_LSP_DOWNLOAD                 - 禁用 LSP 自动下载
SLATE_DISABLE_MODELS_FETCH                 - 禁用模型配置抓取
SLATE_DISABLE_PROJECT_CONFIG               - 禁用项目级配置
SLATE_DISABLE_PRUNE                        - 禁用 session pruning
SLATE_DISABLE_TERMINAL_TITLE               - 禁用终端标题更新
SLATE_ENABLE_EXA                           - 启用 Exa 搜索
SLATE_ENABLE_EXPERIMENTAL_MODELS           - 启用实验模型
SLATE_EXPERIMENTAL                         - 启用实验功能
SLATE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS - bash timeout override
SLATE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT  - 禁用 copy on select
SLATE_EXPERIMENTAL_DISABLE_FILEWATCHER     - 禁用 file watcher
SLATE_EXPERIMENTAL_EXA                     - Exa 搜索（备用 flag）
SLATE_EXPERIMENTAL_FILEWATCHER             - 启用 file watcher
SLATE_EXPERIMENTAL_ICON_DISCOVERY          - icon discovery
SLATE_EXPERIMENTAL_LSP_TOOL                - LSP tool
SLATE_EXPERIMENTAL_LSP_TY                  - LSP type checking
SLATE_EXPERIMENTAL_MARKDOWN                - markdown mode
SLATE_EXPERIMENTAL_OUTPUT_TOKEN_MAX        - output token 上限
SLATE_EXPERIMENTAL_OXFMT                   - oxfmt 集成
SLATE_EXPERIMENTAL_PLAN_MODE               - plan mode
SLATE_FAKE_VCS                             - 测试用 fake VCS
SLATE_GIT_BASH_PATH                        - Git Bash 路径（Windows）
SLATE_MODELS_URL                           - 模型配置 URL
SLATE_PERMISSION                           - permission override
SLATE_SERVER_PASSWORD                      - server auth
SLATE_SERVER_USERNAME                      - server auth
SLATE_TELEMETRY_DISABLED                   - 禁用遥测
SLATE_TEST_HOME                            - 测试用 home 目录
SLATE_TOKEN_DIR                            - token 存储目录
```

### OpenCode 遗留变量（仍可工作）

```text
OPENCODE_DISABLE_LSP_DOWNLOAD
OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER
OPENCODE_EXPERIMENTAL_FILEWATCHER
OPENCODE_EXPERIMENTAL_ICON_DISCOVERY
OPENCODE_EXPERIMENTAL_LSP_TY
OPENCODE_EXPERIMENTAL_OXFMT
OPENCODE_FAKE_VCS
OPENCODE_GIT_BASH_PATH
OPENCODE_LIBC
OPENCODE_TERMINAL
```

### 对 gstack 集成最关键的环境变量

**`SLATE_DISABLE_CLAUDE_CODE_SKILLS`**  
一旦设置，`.claude/skills/` 的加载就会被禁用。  
这意味着把 skills 发布到 `.slate/skills/` 不只是优化，而是实打实的必要项。没有原生 `.slate/` 发布路径时，gstack skills 在这个 flag 打开时会直接消失。

**`SLATE_TEST_HOME`**  
适合 E2E 测试。可以把 Slate 的 home 目录重定向到隔离的临时目录，类似 Codex 测试里用 temp HOME 的做法。

**`SLATE_DANGEROUSLY_SKIP_PERMISSIONS`**  
无头 E2E 测试所必需。

## 模型引用（来自二进制）

```text
anthropic/claude-sonnet-4.6
anthropic/claude-opus-4
anthropic/claude-haiku-4
anthropic/slate              - Slate 自己的模型路由
openai/gpt-5.3-codex
google/nano-banana
randomlabs/fast-default-alpha
```

## API 端点（来自二进制）

```text
https://api.randomlabs.ai                        - 主 API
https://api.randomlabs.ai/exaproxy               - Exa 搜索代理
https://agent-worker-prod.randomlabs.workers.dev - 生产 worker
https://agent-worker-dev.randomlabs.workers.dev  - 开发 worker
https://dashboard.randomlabs.ai                  - dashboard
https://docs.randomlabs.ai                       - 文档
https://randomlabs.ai/config.json                - 远程配置
```

Brew tap：`anthropic/tap/slate`  
值得注意的是，它挂在 Anthropic 的 tap 下，而不是 Random Labs 自己的 tap。

## npm 包结构

```text
@randomlabs/slate (8.8 kB, thin launcher)
|- bin/slate           - Node.js launcher（在 node_modules 中寻找平台二进制）
|- bin/slate1          - Bun launcher（同样逻辑，基于 import.meta.filename）
|- postinstall.mjs     - 验证平台二进制存在，必要时创建 symlink
`- package.json        - 为所有平台声明 optionalDependencies

Platform packages（每个约 85MB）:
|- @randomlabs/slate-darwin-arm64
|- @randomlabs/slate-darwin-x64
|- @randomlabs/slate-linux-arm64
|- @randomlabs/slate-linux-x64
|- @randomlabs/slate-linux-x64-musl
|- @randomlabs/slate-linux-arm64-musl
|- @randomlabs/slate-linux-x64-baseline
|- @randomlabs/slate-linux-x64-baseline-musl
|- @randomlabs/slate-darwin-x64-baseline
|- @randomlabs/slate-windows-x64
`- @randomlabs/slate-windows-x64-baseline
```

二进制覆盖：`SLATE_BIN_PATH` 环境变量会跳过所有发现，直接运行指定二进制。

## 当前已经可用的部分

gstack skills 已经可以通过 `.claude/skills/` 的回退路径在 Slate 中工作。  
基础功能不需要额外改动。用户如果为 Claude Code 安装了 gstack，同时也使用 Slate，那么会发现同一套 skills 在两个 agent 中都能用。

## 一等支持会额外带来什么

1. **可靠性**
   `.slate/skills/` 是 Slate 最高优先级路径，不受 `SLATE_DISABLE_CLAUDE_CODE_SKILLS` 影响。

2. **优化后的前置数据**
   去掉 Slate 不使用的 Claude 专属字段（`allowed-tools`、`hooks`、`version`），只保留 `name` 和 `description`。

3. **安装脚本**
   自动探测 `slate` 二进制，并把 skills 安装到 `~/.slate/skills/`。

4. **E2E 测试**
   验证 skills 在被 Slate 直接调用时能否正常工作。

## 当前阻塞：Host 配置重构

Codex 的外部视角审查指出：把 Slate 作为第 4 个 host（在 Claude、Codex、Factory 之后）接进来，本质上是“为了一个路径别名触发 host 爆炸”。当前架构中有：

- 在 `type Host = 'claude' | 'codex' | 'factory'` 中写死 host 名称
- `transformFrontmatter()` 里针对每个 host 的分支逻辑，而且几乎重复
- `EXTERNAL_HOST_CONFIG` 里按 host 拆开的配置，也有大量相似模式
- 安装脚本里按 host 拆开的函数（例如 `create_codex_runtime_root`、`link_codex_skill_dirs`）
- `bin/gstack-platform-detect`、`bin/gstack-uninstall`、`bin/dev-setup` 中重复出现的 host 名称

如果再加 Slate，就意味着这些模式还要再复制一遍。  
如果先把 hosts 改成数据驱动（用配置对象而不是 if/else 分支），那么 Slate 集成会变得非常简单，而且未来再接新 host（任何新的 OpenCode fork，或任何新的 agent）也会几乎零成本。

### 计划里遗漏的点（由 Codex 指出）

- `lib/worktree.ts` 目前只复制 `.agents/`，不复制 `.slate/`，所以 worktree 里的 E2E 测试拿不到 Slate skills
- `bin/gstack-uninstall` 还不认识 `.slate/`
- `bin/dev-setup` 还没有把 `.slate/` 接进贡献者开发模式
- `bin/gstack-platform-detect` 还不能检测 Slate
- E2E 测试应设置 `SLATE_DISABLE_CLAUDE_CODE_SKILLS=1`，证明 `.slate/` 路径真的可用，而不是只是退回到了 `.claude/`

## Session Runner 设计（后续再做）

等 JSONL 格式验证清楚后，session runner 应该：

- Spawn：`slate -q "<prompt>" --stream-json --dangerously-skip-permissions -w <dir>`
- Parse：Claude Code SDK-compatible NDJSON（目前是假设，仍需验证）
- Skills：安装到测试夹具里的 `.slate/skills/`，而不是 `.claude/skills/`
- Auth：使用 `SLATE_API_KEY` 或现有 `~/.slate/` 凭据
- Isolation：使用 `SLATE_TEST_HOME` 实现 home 目录隔离
- Timeout：默认 300 秒（与 Codex 相同）

```typescript
export interface SlateResult {
  output: string;
  toolCalls: string[];
  tokens: number;
  exitCode: number;
  durationMs: number;
  sessionId: string | null;
  rawLines: string[];
  stderr: string;
}
```

## 文档参考

- Slate 文档：https://docs.randomlabs.ai
- 快速入门：https://docs.randomlabs.ai/en/getting-started/quickstart
- Skills：https://docs.randomlabs.ai/en/using-slate/skills
- 配置：https://docs.randomlabs.ai/en/using-slate/configuration
- 快捷键：https://docs.randomlabs.ai/en/using-slate/hotkey_reference