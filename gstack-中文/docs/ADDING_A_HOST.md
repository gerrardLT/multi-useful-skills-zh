# 为 gstack 添加新 Host

gstack 使用声明式 host 配置系统。每个受支持的 AI 编码代理（Claude、Codex、Factory、Kiro、OpenCode、Slate、Cursor、OpenClaw）都通过一个带类型的 TypeScript 配置对象定义。要新增一个 host，只需创建一个文件并重新导出它。生成器、安装流程和工具链本身无需修改代码。

## 工作原理

```text
hosts/
├── claude.ts
├── codex.ts
├── factory.ts
├── kiro.ts
├── opencode.ts
├── slate.ts
├── cursor.ts
├── openclaw.ts
└── index.ts
```

每个配置文件都会导出一个 `HostConfig` 对象，用于告知生成器：

- 生成的技能应放置的路径
- frontmatter 应如何转换（字段允许列表 / 拒绝列表）
- 需要重写哪些 Claude 特有引用（路径、工具名）
- 自动安装时应检测哪个二进制文件
- 应抑制哪些 resolver 段落
- 安装时应建立哪些资源符号链接

生成器、安装脚本、平台检测、卸载、健康检查、worktree 复制和测试，全部读取这些配置。它们内部没有针对单个 host 硬编码的专用逻辑。

## 分步骤：添加一个新 host

### 1. 创建配置文件

先复制一个现有配置作为起点。`hosts/opencode.ts` 是一个很好的最小示例。`hosts/factory.ts` 展示了工具重写和条件字段。`hosts/openclaw.ts` 则展示了在工具模型差异较大时如何使用适配器模式。

创建 `hosts/myhost.ts`：

```typescript
import type { HostConfig } from '../scripts/host-config';

const myhost: HostConfig = {
  name: 'myhost',
  displayName: 'MyHost',
  cliCommand: 'myhost',
  cliAliases: [],

  globalRoot: '.myhost/skills/gstack',
  localSkillRoot: '.myhost/skills/gstack',
  hostSubdir: '.myhost',
  usesEnvVars: true,

  frontmatter: {
    mode: 'allowlist',
    keepFields: ['name', 'description'],
    descriptionLimit: null,
  },

  generation: {
    generateMetadata: false,
    skipSkills: ['codex'],
  },

  pathRewrites: [
    { from: '~/.claude/skills/gstack', to: '~/.myhost/skills/gstack' },
    { from: '.claude/skills/gstack', to: '.myhost/skills/gstack' },
    { from: '.claude/skills', to: '.myhost/skills' },
  ],

  runtimeRoot: {
    globalSymlinks: ['bin', 'browse/dist', 'browse/bin', 'gstack-upgrade', 'ETHOS.md'],
    globalFiles: { 'review': ['checklist.md', 'TODOS-format.md'] },
  },

  install: {
    prefixable: false,
    linkingStrategy: 'symlink-generated',
  },

  learningsMode: 'basic',
};

export default myhost;
```

### 2. 在索引中注册

编辑 `hosts/index.ts`：

```typescript
import myhost from './myhost';

export const ALL_HOST_CONFIGS: HostConfig[] = [
  claude, codex, factory, kiro, opencode, slate, cursor, openclaw, myhost
];

export { claude, codex, factory, kiro, opencode, slate, cursor, openclaw, myhost };
```

### 3. 更新 `.gitignore`

将 `.myhost/` 添加到 `.gitignore` 中（生成的技能文档通常应被忽略）。

### 4. 生成并验证

```bash
# 为新 host 生成技能文档
bun run gen:skill-docs --host myhost

# 验证输出存在，且没有 .claude/skills 泄漏
ls .myhost/skills/gstack-*/SKILL.md
grep -r ".claude/skills" .myhost/skills/ | head -5

# 为所有 host 统一生成（包含新 host）
bun run gen:skill-docs --host all

# 健康检查面板会显示这个新 host
bun run skill:check
```

### 5. 运行测试

```bash
bun test test/gen-skill-docs.test.ts
bun test test/host-config.test.ts
```

参数化的冒烟测试会自动识别新 host，无需额外编写测试代码。它们会验证：输出是否存在、路径是否泄漏、frontmatter 是否有效、新鲜度检查是否通过，以及 codex skill 是否被正确排除。

### 6. 更新 `README.md`

在合适的章节中加入这个新 host 的安装说明。

## 配置字段说明

完整的 `HostConfig` 接口说明见 `scripts/host-config.ts`，其中对每个字段都有 JSDoc 注释。

关键字段如下：

| 字段 | 用途 |
|-------|------|
|__代码_0__|`allowlist`（仅保留列出的字段）或 `denylist`（删除列出的字段）|
|__代码_0__|描述最大字符数，`null` 表示不限制|
|__代码_0__|`error`（构建失败）、`truncate`、`warn`|
|__代码_0__|根据模板值追加字段（例如 sensitive -> disable-model-invocation）|
|__代码_0__|重命名模板字段（例如 voice-triggers -> triggers）|
|__代码_0__|对内容执行字面量 `replaceAll`，顺序很重要|
|__代码_0__|重写 Claude 工具名（例如 “use the Bash tool” -> “run this command”）|
|__代码_0__|对当前 host 返回空结果的 resolver 函数|
|__代码_0__|Git 提交中的 co-author 字符串|
|__代码_0__|跨模型调用时的反 prompt injection 边界提醒|
|__代码_0__|复杂转换时使用的适配器模块路径|

## 适配器模式（适用于工具模型差异较大的 host）

如果简单的字符串替换不足以完成工具重写，因为该 host 的工具语义与 Claude 差异很大，则使用适配器模式。参考 `hosts/openclaw.ts` 与 `scripts/host-adapters/openclaw-adapter.ts`。

适配器会在所有通用重写完成之后，作为后处理步骤运行。它需要导出：

__代码_0__

## 校验

`scripts/host-config.ts` 中的 `validateHostConfig()` 会检查：

- Name：只能包含小写字母、数字和连字符
- CLI command：只能包含字母、数字、连字符和下划线
- Paths：只能包含安全字符（字母、数字、`.`, `/`, `$`, `{}`, `~`, `-`, `_`）
- 所有配置之间不能出现重复的 name、hostSubdir 或 globalRoot

运行以下命令可以校验全部配置：

```bash
bun run scripts/host-config-export.ts validate
```