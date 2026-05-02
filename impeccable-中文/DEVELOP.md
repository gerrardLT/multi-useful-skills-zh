# 开发者指南

面向 Impeccable 贡献者的说明文档。

## 架构

`source/skills/` 中的源技能会通过一个由配置驱动的工厂，转换成面向不同 provider 的格式。每个 provider 都是在 `scripts/lib/transformers/providers.js` 中定义的一个配置对象，因此新增 provider 通常只需要加一条配置。

关于不同 harness 的详细能力差异，例如各自支持哪些 frontmatter 字段、占位符系统和目录结构，请参见 [HARNESSES.md](HARNESSES.md)。

## 源格式

### Skills（`source/skills/{name}/SKILL.md`）

```yaml
---
name: skill-name
description: What this skill provides
argument-hint: "[target]"
user-invocable: true
license: License info (optional)
compatibility: Environment requirements (optional)
---

Your skill instructions here...
```

**Frontmatter 字段**（基于 [Agent Skills spec](https://agentskills.io/specification)）：

- `name`（必填）：技能标识符，1 到 64 个字符，只允许小写字母、数字和连字符
- `description`（必填）：技能提供什么，1 到 1024 个字符
- `user-invocable`（可选）：布尔值。如果是 `true`，这个技能可作为 slash command 调用
- `argument-hint`（可选）：自动补全时展示的参数提示，例如 `[target]`、`[area (feature, page...)]`
- `license`（可选）：许可 / 归属信息
- `compatibility`（可选）：环境要求，1 到 500 个字符
- `metadata`（可选）：任意键值对
- `allowed-tools`（可选，实验性）：预批准工具列表

**正文占位符**（构建时按 provider 替换）：

- `{{model}}`：provider 对应的模型名，例如 `Claude`、`Gemini`、`GPT`
- `{{config_file}}`：provider 对应的配置文件，例如 `CLAUDE.md`、`.cursorrules`
- `{{ask_instruction}}`：如何向用户发起澄清提问
- `{{command_prefix}}`：slash command 前缀，大多数是 `/`，Codex 是 `$`
- `{{available_commands}}`：所有可由用户调用的命令列表（逗号分隔）

## 构建

### 前置要求

- Bun（快速 JavaScript runtime 和包管理器）
- 不需要额外外部依赖

### 命令

```bash
# 构建所有 provider 格式
bun run build

# 清理 dist 文件夹
bun run clean

# 从头重建
bun run rebuild
```

### 会生成什么

```text
source/                          -> dist/
  skills/{name}/SKILL.md           {provider}/{configDir}/skills/{name}/SKILL.md
```

每个 provider 都会有自己的输出目录。

## 构建系统细节

构建系统在 `scripts/` 下使用工厂模式：

```text
scripts/
  build.js
  lib/
    utils.js
    zip.js
    transformers/
      factory.js
      providers.js
      index.js
```

### 添加一个新 Provider

1. 在 `scripts/lib/utils.js` 的 `PROVIDER_PLACEHOLDERS` 中加入一段占位符配置：
   ```javascript
   'my-provider': {
     model: 'MyModel',
     config_file: 'CONFIG.md',
     ask_instruction: 'ask the user directly to clarify.',
     command_prefix: '/'
   }
   ```

2. 在 `scripts/lib/transformers/providers.js` 的 `PROVIDERS` 中加入一条 provider 配置：
   ```javascript
   'my-provider': {
     provider: 'my-provider',
     configDir: '.my-provider',
     displayName: 'My Provider',
     frontmatterFields: ['user-invocable', 'argument-hint', 'license'],
   }
   ```

3. 运行 `bun run build`。构建循环会自动拾取这个 provider。

4. 更新 `HARNESSES.md`，记录它的能力矩阵。

### Provider 配置项

| 字段 | 说明 |
|-------|------|
| `provider` | 输出目录与占位符查找使用的键 |
| `configDir` | 点目录名，例如 `.claude` |
| `displayName` | 构建日志中显示的人类可读名称 |
| `frontmatterFields` | 需要输出哪些可选字段 |
| `bodyTransform` | 可选的 `(body, skill) => body` 后处理函数 |
| `placeholderProvider` | 覆盖默认占位符来源，适用于共享配置的变体 |

### 关键函数

- `createTransformer(config)`：根据 provider 配置生成一个 transformer 函数
- `parseFrontmatter()`：从 `SKILL.md` 中提取 YAML frontmatter 和正文
- `readSourceFiles()`：读取 `source/skills/` 下的所有技能目录
- `replacePlaceholders()`：按 provider 替换 `{{model}}`、`{{config_file}}` 等占位符
- `generateYamlFrontmatter()`：把对象序列化成 YAML frontmatter，并自动给以 `[` 或 `{` 开头的值加引号

## 最佳实践

### 技能编写

1. **聚焦范围**：一个技能只负责一个清晰领域
2. **描述清楚**：让用途一眼就懂
3. **说明明确**：让 LLM 知道自己究竟该做什么
4. **需要时给例子**：能帮助澄清意图就写
5. **把约束说清楚**：什么不能做，要和什么该做一样明确
6. **跨 provider 测试**：确保它在多个上下文里都能成立

## 参考文档

- [Agent Skills Specification](https://agentskills.io/specification)
- [HARNESSES.md](HARNESSES.md)
- [Cursor Skills](https://cursor.com/docs/context/skills)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Gemini CLI Skills](https://geminicli.com/docs/cli/skills/)
- [Codex CLI Skills](https://developers.openai.com/codex/skills/)
- [VS Code Copilot Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Kiro Skills](https://kiro.dev/docs/skills/)
- [OpenCode Skills](https://opencode.ai/docs/skills/)
- [Pi Skills](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md)

## 仓库结构

```text
impeccable/
  source/
    skills/
      frontend-design/
        SKILL.md
        reference/*.md
      audit/SKILL.md
      polish/SKILL.md
      ...
  dist/
  scripts/
    build.js
    lib/
      utils.js
      zip.js
      transformers/
        factory.js
        providers.js
        index.js
  tests/
  HARNESSES.md
  DEVELOP.md
  README.md
```

## 故障排查

### 构建因 YAML 解析失败

- 检查 frontmatter 缩进，YAML 对缩进很敏感
- 确认 `---` 分隔线单独占行
- 以 `[` 或 `{` 开头的值会自动加引号，其他特殊 YAML 字符仍可能需要手工加引号

### 输出与预期不一致

- 检查 `scripts/lib/transformers/providers.js` 中的 provider 配置
- 确认源文件 frontmatter 结构正确
- 运行 `bun run rebuild`，确保从干净状态重建

### Provider 无法识别文件

- 检查该 provider 对应的安装路径
- 确认文件命名符合该 provider 的要求
- 查看 [HARNESSES.md](HARNESSES.md) 中该 provider 的说明

## 有问题？

欢迎提 issue，或者直接发 PR。