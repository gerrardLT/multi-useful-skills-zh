# OpenCode 支持设计

**日期：** 2025-11-22  
**作者：** Bot & Jesse  
**状态：** 设计完成，等待实现

## 概述

为 OpenCode.ai 增加完整的 superpowers 支持，采用原生 OpenCode 插件架构，并与现有 Codex 实现共享核心能力。

## 背景

OpenCode.ai 是一个类似 Claude Code 和 Codex 的编码代理。此前将 superpowers 移植到 OpenCode 的尝试（PR #93、PR #116）采用了复制文件的方式。本设计采用不同路线：基于 OpenCode 的 JavaScript/TypeScript 插件系统构建原生插件，同时与 Codex 实现共享代码。

### 平台之间的关键差异
- **Claude Code**：原生 Anthropic 插件系统 + 基于文件的 skills
- **Codex**：没有插件系统，依赖 bootstrap markdown + CLI 脚本
- **OpenCode**：JavaScript/TypeScript 插件，带事件 hook 和自定义工具 API

### 平台：OpenCode 的代理系统
- **主代理**：Build（默认，完全访问）和 Plan（受限，只读）
- **子代理**：General（研究、搜索、多步任务）
- **调用方式**：主代理自动分派，或手动使用 `@mention` 语法
- **配置位置**：`opencode.json` 或 `~/.config/opencode/agent/` 中的自定义代理

## 架构

### 高层结构

1. **共享核心模块**（`lib/skills-core.js`）：
   - 通用的 skill 发现与解析逻辑
   - 供 Codex 和 OpenCode 实现共同使用

2. **平台专用封装**
   - Codex：CLI 脚本（`.codex/superpowers-codex`）
   - OpenCode：插件模块（`.opencode/plugin/superpowers.js`）

3. **Skill 目录**
   - Core：`~/.config/opencode/superpowers/skills/`（或安装位置）
   - Personal：`~/.config/opencode/skills/`（覆盖 core skills）

### 代码复用策略

将 `.codex/superpowers-codex` 中的通用能力抽取到共享模块：

```javascript
// lib/skills-core.js
module.exports = {
  extractFrontmatter(filePath),      // 从 YAML 解析 name + description
  findSkillsInDir(dir, maxDepth),    // 递归发现 SKILL.md
  findAllSkills(dirs),               // 扫描多个目录
  resolveSkillPath(skillName, dirs), // 处理覆盖规则（personal > core）
  checkForUpdates(repoDir)           // Git fetch/status 检查
};
```

### Skill Frontmatter 格式

当前格式（不含 `when_to_use` 字段）：

```yaml
---
name: skill-name
description: 适用于[触发条件]；[补充上下文]
---
```

## OpenCode 插件实现

### 自定义工具

**工具 1：`use_skill`**

将指定 skill 的内容加载到对话中（等价于 Claude 的 Skill 工具）。
```javascript
{
  name: 'use_skill',
  description: 'Load and read a specific skill to guide your work',
  schema: z.object({
    skill_name: z.string().describe('Name of skill (e.g., "superpowers:brainstorming")')
  }),
  execute: async ({ skill_name }) => {
    const { skillPath, content, frontmatter } = resolveAndReadSkill(skill_name);
    const skillDir = path.dirname(skillPath);

    return `# ${frontmatter.name}
# ${frontmatter.description}
# Supporting tools and docs are in ${skillDir}
# ============================================

${content}`;
  }
}
```

**工具 2：`find_skills`**

列出所有可用的 skills 及其元数据。
```javascript
{
  name: 'find_skills',
  description: 'List all available skills',
  schema: z.object({}),
  execute: async () => {
    const skills = discoverAllSkills();
    return skills.map(s =>
      `${s.namespace}:${s.name}
  ${s.description}
  Directory: ${s.directory}
`).join('\n');
  }
}
```

### 会话启动 Hook

当新会话启动时（`session.started` 事件）：

1. **注入 using-superpowers 内容**
   - 注入 using-superpowers skill 的完整内容
   - 建立强制工作流

2. **自动运行 find_skills**
   - 预先展示完整的 skill 列表
   - 包含每个 skill 的目录

3. **注入工具映射说明**
   ```markdown
   **OpenCode 的工具映射：**
   当 skill 引用了你没有的工具时，替换为：
   - `TodoWrite` → `update_plan`
   - 带子代理的 `Task` → 使用 OpenCode 子代理系统（`@mention`）
   - `Skill` 工具 → `use_skill` 自定义工具
   - Read、Write、Edit、Bash → 你的原生等价工具

   **Skill 目录中包含：**
   - 辅助脚本（用 bash 运行）
   - 额外文档（用 read tool 读取）
   - 该 skill 专用工具
   ```

4. **检查更新**（非阻塞）
   - 快速执行带超时的 git fetch
   - 如有更新则提示

### 插件结构

```javascript
// .opencode/plugin/superpowers.js
const skillsCore = require('../../lib/skills-core');
const path = require('path');
const fs = require('fs');
const { z } = require('zod');

export const SuperpowersPlugin = async ({ client, directory, $ }) => {
  const superpowersDir = path.join(process.env.HOME, '.config/opencode/superpowers');
  const personalDir = path.join(process.env.HOME, '.config/opencode/skills');

  return {
    'session.started': async () => {
      const usingSuperpowers = await readSkill('using-superpowers');
      const skillsList = await findAllSkills();
      const toolMapping = getToolMappingInstructions();

      return {
        context: `${usingSuperpowers}\n\n${skillsList}\n\n${toolMapping}`
      };
    },

    tools: [
      {
        name: 'use_skill',
        description: 'Load and read a specific skill',
        schema: z.object({
          skill_name: z.string()
        }),
        execute: async ({ skill_name }) => {
          // 使用 skillsCore 的实现
        }
      },
      {
        name: 'find_skills',
        description: 'List all available skills',
        schema: z.object({}),
        execute: async () => {
          // 使用 skillsCore 的实现
        }
      }
    ]
  };
};
```

## 文件结构

```
superpowers/
├── lib/
│   └── skills-core.js           # 新增：共享 skill 逻辑
├── .codex/
│   ├── superpowers-codex        # 更新：改用 skills-core
│   ├── superpowers-bootstrap.md
│   └── INSTALL.md
├── .opencode/
│   ├── plugin/
│   │   └── superpowers.js       # 新增：OpenCode 插件
│   └── INSTALL.md               # 新增：安装指南
└── skills/                      # 不变
```

## 实现计划

### 阶段 1：重构共享核心
1. 创建 `lib/skills-core.js`
   - 从 `.codex/superpowers-codex` 抽取 frontmatter 解析
   - 抽取 skill 发现逻辑
   - 抽取路径解析（含覆盖）
   - 只使用 `name` 和 `description`（不含 `when_to_use`）

2. 更新 `.codex/superpowers-codex` 以使用共享核心
   - 从 `../lib/skills-core.js` 导入
   - 删除重复代码
   - 保留 CLI 封装逻辑

3. 测试 Codex 实现仍然可用
   - 验证 bootstrap 命令
   - 验证 use-skill 命令
   - 验证 find-skills 命令

### 阶段 2：构建 OpenCode 插件

1. 创建 `.opencode/plugin/superpowers.js`
   - 从 `../../lib/skills-core.js` 导入共享核心
   - 实现插件函数
   - 定义自定义工具（use_skill、find_skills）
   - 实现 `session.started` hook

2. 创建 `.opencode/INSTALL.md`
   - 安装说明
   - 目录设置
   - 配置指南

3. 测试 OpenCode 实现
   - 验证会话启动 bootstrap
   - 验证 `use_skill` 工具
   - 验证 `find_skills` 工具
   - 验证 skill 目录可访问

### 阶段 3：文档与打磨

1. 更新 README，加入 OpenCode 支持
2. 在主文档中加入 OpenCode 安装说明
3. 更新 RELEASE-NOTES
4. 测试 Codex 和 OpenCode 都能正常工作

## 下一步
1. **创建隔离工作区**（使用 git worktrees）
   - 分支：`feature/opencode-support`

2. **在适用处遵循 TDD**
   - 测试共享核心函数
   - 测试 skill 发现和解析
   - 为两个平台编写集成测试

3. **增量实现**
   - 阶段 1：重构共享核心 + 更新 Codex
   - 先确认 Codex 仍可用，再继续
   - 阶段 2：构建 OpenCode 插件
   - 阶段 3：文档与打磨

4. **测试策略**
   - 在真实 OpenCode 安装环境中手动测试
   - 验证 skill 加载、目录、脚本可用
   - 并排测试 Codex 和 OpenCode
   - 验证工具映射是否正确

5. **PR 与合并**
   - 创建包含完整实现的 PR
   - 在干净环境中测试
   - 合并到主分支

## 好处

- **代码复用**：skill 发现与解析有单一事实来源
- **可维护性**：修复一次即可同时作用于两个平台
- **可扩展性**：未来更容易添加 Cursor、Windsurf 等平台
- **原生集成**：正确使用 OpenCode 插件系统
- **一致性**：各平台拥有一致的 skill 使用体验