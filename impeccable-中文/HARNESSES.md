# Harness Skills 能力参考

这是关于各个 AI 编码 harness 在 agent skills 方面支持能力的权威参考。
用于指导 `scripts/lib/transformers/providers.js` 中的提供程序配置。

最后核验时间：2026-03-24

## 官方文档

| Harness | 文档 URL |
|---------|----------|
| Claude Code | https://code.claude.com/docs/en/skills |
| Cursor | https://cursor.com/docs/context/skills |
| Gemini CLI | https://geminicli.com/docs/cli/skills/ |
| Codex CLI | https://developers.openai.com/codex/skills |
| GitHub Copilot (Agents) | https://code.visualstudio.com/docs/copilot/customization/agent-skills |
| Kiro | https://kiro.dev/docs/skills/ |
| OpenCode | https://opencode.ai/docs/skills/ |
| Pi | https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md |
| Trae | TBD（暂未找到官方 skills 文档） |
| Rovo Dev | https://support.atlassian.com/rovo/docs/extend-rovo-dev-cli-with-agent-skills |

## 规范兼容性

所有 harness 都在不同程度上遵循 [Agent Skills 规范](https://agentskills.io/specification)。该规范定义了这些 frontmatter 字段：`name`、`description`、`license`、`compatibility`、`metadata`、`allowed-tools`。

超出规范范围的提供程序专有扩展包括：`user-invocable`、`argument-hint`、`disable-model-invocation`、`allowed-tools`（扩展语法）、`model`、`effort`、`context`、`agent`、`hooks`、`subtask`、`mcp`。

## Frontmatter 支持情况

带 `*` 的字段属于规范标准，其余为提供程序扩展。

| 字段 | Claude Code | Cursor | Gemini | Codex | Copilot | Kiro | OpenCode | Pi | Rovo Dev |
|-------|:-----------:|:------:|:------:|:-----:|:-------:|:----:|:--------:|:--:|:--------:|
| `name`* | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `description`* | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `license`* | Yes | Yes | Ignored | No | Yes | Yes | Yes | Yes | Yes |
| `compatibility`* | Yes | Yes | Ignored | No | Yes | Yes | Yes | Yes | Yes |
| `metadata`* | Yes | Yes | Ignored | No | Yes | Yes | Yes | Yes | Yes |
| `allowed-tools`* | Yes | No | Ignored | No | No | No | Yes | Yes | Yes |
| `user-invocable` | Yes | No | No | No | Yes | No | Yes | No | Yes |
| `argument-hint` | Yes | No | No | No | Yes | No | Yes | No | Yes |
| `disable-model-invocation` | Yes | Yes | No | No | Yes | No | Yes | Yes | TBD |
| `model` | Yes | No | No | No | No | No | Yes | No | No |
| `effort` | Yes | No | No | No | No | No | No | No | No |
| `context` | Yes | No | No | No | No | No | No | No | No |
| `agent` | Yes | No | No | No | No | No | Yes | No | No |
| `hooks` | Yes | No | No | No | No | No | No | No | No |

说明：
- Gemini CLI 只校验 `name` 和 `description`；其他规范字段虽然会被解析，但会被忽略。
- Codex CLI 使用独立的 `agents/openai.yaml` sidecar 来承载扩展元数据，如图标、品牌信息、MCP 工具和调用控制。
- 根据社区反馈，Kiro 能识别 `user-invocable` 和 `disable-model-invocation`，但官方并未正式文档化。
- 所有 harness 都会静默忽略未知字段。

## Skill 目录结构

| Harness | 原生目录 | 也会读取 |
|---------|----------|----------|
| Claude Code | `.claude/skills/` | - |
| Cursor | `.cursor/skills/` | `.agents/skills/`, `.claude/skills/` |
| Gemini CLI | `.gemini/skills/` | `.agents/skills/` |
| Codex CLI | `.agents/skills/`（主目录） | - |
| GitHub Copilot | `.github/skills/` | `.agents/skills/`, `.claude/skills/` |
| Kiro | `.kiro/skills/` | - |
| OpenCode | `.opencode/skills/` | `.agents/skills/`, `.claude/skills/` |
| Pi | `.pi/skills/` | `.agents/skills/` |
| Trae China | `.trae-cn/skills/` | TBD |
| Trae International | `.trae/skills/` | TBD |
| Rovo Dev | `.rovodev/skills/` | `~/.rovodev/skills/`（用户级） |

所有 harness 都支持 `{skill-name}/SKILL.md` 这种目录结构，并可包含可选的 `reference/`、`scripts/`、`assets/` 子目录。

## 占位符 / 变量替换

Claude Code 支持在 SKILL.md 正文中直接做运行时变量替换：`$ARGUMENTS`、`$0`-`$N`、`${CLAUDE_SKILL_DIR}`、`${CLAUDE_SESSION_ID}`。其他 harness 都不支持在 skills 中使用这类替换。

有些 harness 另有独立的“自定义命令”系统，和 skills 不同，并带有自己的替换语法：

| Harness | 命令系统 | 替换语法 |
|---------|---------------|-------------------|
| Gemini CLI | `.gemini/commands/` (TOML) | `{{args}}`, `!{shell}`, `@{file}` |
| Codex CLI | `.codex/prompts/` | `$ARGNAME` |
| OpenCode | `.opencode/commands/` | `$ARGUMENTS`, `$1`-`$N`, `` !`shell` `` |

我们的构建系统会在编译阶段通过 `replacePlaceholders()` 处理跨提供程序占位符，包括 `{{model}}`、`{{config_file}}`、`{{ask_instruction}}` 和 `{{available_commands}}`。