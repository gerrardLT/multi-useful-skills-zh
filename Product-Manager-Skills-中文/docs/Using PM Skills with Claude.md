# 用 Claude 使用 PM Skills

这个 repo 是一个给 AI agents 准备的 PM skill 文件库。Claude Code（CLI）和 Claude Cowork（workspace）都可以读取这些文件，并把它们当作结构化指令来使用。

如果你第一次接触这个 repo，先看 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

如果你想看更短、更偏 PM 的平台指南，可以用：
- [`Using PM Skills with Claude Code.md`](Using%20PM%20Skills%20with%20Claude%20Code.md)
- [`Using PM Skills with Claude Cowork.md`](Using%20PM%20Skills%20with%20Claude%20Cowork.md)
- [`Using PM Skills with Claude Desktop.md`](Using%20PM%20Skills%20with%20Claude%20Desktop.md)

如果你想先在本地快速试验，再放到 Claude 中运行，也可以用 Streamlit（beta）playground：

```bash
pip install -r app/requirements.txt
streamlit run app/main.py
```

---

## 在 Claude Code（CLI）中使用

Claude Code 是 Anthropic 官方的命令行界面。它可以读取你本地文件系统中的文件，并直接应用 skills。

### 快速开始

1. **克隆这个 repo** 到本地：
   ```bash
   git clone https://github.com/deanpeters/Product-Manager-Skills.git
   cd product-manager-skills
   ```

2. **在终端进入 repo 目录**：
   ```bash
   cd product-manager-skills
   ```

3. **带着 skill 引用调用 Claude Code**：
   ```bash
   claude "Using the skill at skills/prd-development/SKILL.md, create a PRD for our mobile onboarding redesign"
   ```

### 怎么应用 Skills

**Component skills**（模板/产物）：
```bash
claude "Using skills/user-story/SKILL.md, write user stories for a checkout flow"
```

**Interactive skills**（引导式探索）：
```bash
claude "Use skills/prioritization-advisor/SKILL.md to help me choose a prioritization framework"
```
Claude 会先问 3-5 个自适应问题，然后给出编号推荐。你可以这样回答：
- 一个数字：`"2"`
- 多个选择：`"1 & 3"`
- 自定义输入：`"I want to focus on retention metrics specifically"`

**Workflow skills**（端到端流程）：
```bash
claude "Run skills/discovery-process/SKILL.md for our enterprise customer churn problem"
```
这类 skill 会编排多个 phase。Claude 会先说明流程，再分阶段执行。

### Command 工作流（skills + orchestration）

这个 repo 还带了一个 `commands/` 层，用来快速执行多 skill 工作流。

```bash
claude "Run commands/discover.md for reducing onboarding drop-off in self-serve SMB accounts"
claude "Run commands/write-prd.md for mobile onboarding redesign"
```

也可以用本地启动器：

```bash
./scripts/run-pm.sh command discover "Reduce onboarding drop-off in self-serve SMB accounts" --agent claude
```

### 同时使用多个 Skills

显式串联 skills：
```bash
claude "First use skills/problem-framing-canvas/SKILL.md to define the problem. Then apply skills/opportunity-solution-tree/SKILL.md to map solutions."
```

查看可用 command wrapper：

```bash
./scripts/find-a-command.sh --list-all
./scripts/find-a-command.sh --keyword roadmap
```

### 全局安装 Skills（可选）

你也可以把 skills 安装到 Claude 的全局 skills 目录，这样任何项目都能访问：

1. **复制 skills 到 Claude 目录**：
   ```bash
   mkdir -p ~/.claude/skills
   cp -r skills/* ~/.claude/skills/
   ```

2. **无需写文件路径直接调用**：
   ```bash
   claude "Use the user-story skill to write stories for checkout"
   ```

Claude 会自动在 `~/.claude/skills/` 中寻找技能。

### 通过 skills.sh 安装（可选）

如果你更喜欢 marketplace 风格安装，也可以不克隆这个 repo，直接发现并安装。

1. **搜索 marketplace**：
   ```bash
   npx skills find product management
   ```

2. **列出这个 repo 里的 skills**：
   ```bash
   npx skills add deanpeters/Product-Manager-Skills --list
   ```

3. **直接为 Claude Code 安装**：
   ```bash
   npx skills add deanpeters/Product-Manager-Skills --skill user-story -a claude-code -g
   ```

4. **确认 Claude Code 当前已安装内容**：
   ```bash
   npx skills list -a claude-code
   ```

5. **在 Claude Code 中使用**：
   ```bash
   claude "Use the user-story skill to write stories for checkout"
   ```

如果你使用的是旧 CLI，不支持 `--agent`，可以先安装，再手动复制：

```bash
npx skills add deanpeters/Product-Manager-Skills@user-story
mkdir -p ~/.claude/skills
cp -R ~/.codex/skills/user-story ~/.claude/skills/
```

另一种安装写法（skills.sh 页面也会展示）：
```bash
npx skills add deanpeters/Product-Manager-Skills@user-story
```

<a id="github-zip-install"></a>
### 从 GitHub ZIP 安装（Claude Desktop 或 Claude Web）

自定义 skills 需要手动上传。Claude 不会持续从 GitHub repo URL 自动同步 skills。

Claude Skills UI 要求每个上传 skill 都包含一个 `Skill.md` 文件（大小写敏感）。这个 repo 里的源文件是 `SKILL.md`，因此要先打包。

1. **从 GitHub 下载这个 repo**（Code -> Download ZIP），然后解压。
2. **构建可上传 ZIP**：
   ```bash
   ./scripts/zip-a-skill.sh --skill user-story
   ```
   如果要打整类技能（例如只打 component skills）：
   ```bash
   ./scripts/zip-a-skill.sh --type component --output dist/skill-zips
   ```
   如果要打精选 starter pack：
   ```bash
   ./scripts/zip-a-skill.sh --preset core-pm --output dist/skill-zips
   ```
   如果要一次打全部：
   ```bash
   ./scripts/zip-a-skill.sh --all --output dist/skill-zips
   ```
3. **在 Claude Desktop 或 Claude Web 中**：
   - 进入 **Settings -> Capabilities -> Skills**
   - 点击 **Upload skill**
   - 从 `dist/skill-zips/` 中选择 ZIP 文件
4. **启用上传后的 skill**，再跑一个快速 smoke test prompt。

`zip-a-skill.sh` 内部会调用 `package-claude-skills.sh`，移除上传不支持的 frontmatter 键（例如 `type` 和只在 repo 内使用的 `intent`），然后把打包后的文件夹压成 ZIP 供上传。

### 高级选项：MCP 集成

如果你想做更深的工具/仓库集成，而不是 ZIP 上传流程，请使用 MCP。这是和自定义 skill 上传完全不同的一条路径。

- Anthropic Help: [Using Skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- Anthropic Docs: [Model Context Protocol (MCP)](https://docs.anthropic.com/en/docs/mcp)

### Claude Code 使用建议

- **上下文尽量具体**：提供目标、约束、目标用户和相关背景
- **明确写文件路径**，尤其是 skills 没有全局安装时
- **用多轮对话**：Interactive skills 在对话模式里效果最好
- **组合 skills**：Workflow skills 往往会自动引用 component 和 interactive skills

### 故障排查

**Claude 说找不到文件**：
- 确认你当前就在 `product-manager-skills` 目录里
- 检查文件路径是否正确（区分大小写）
- 用 `ls skills/` 确认 skill 名称

**输出太泛**：
- 提供更具体的约束和示例
- 先要求 Claude 提澄清问题
- 明确引用 skill 的 “Examples” 部分

**Claude 没按 skill 格式输出**：
- 提醒它：`Follow the skill structure: Purpose, Key Concepts, Application, Examples, Common Pitfalls`

---

## 在 Claude Cowork（Workspace）中使用

Claude Cowork 是 Anthropic 的 workspace 集成形态（类似 Cursor、Windsurf 这类工具）。它可以把 skills 作为持久知识模块加载。

### 快速开始

1. **在 Cowork 中打开 repo**：
   - File -> Open Workspace
   - 选择 `product-manager-skills` 文件夹

2. **自然地引用 skills**：
   ```
   Using the PRD Development skill, create a PRD for our mobile feature
   ```

3. **Cowork 会自动找到** `skills/prd-development/SKILL.md` 并应用它。

### Skills 在 Cowork 里怎么工作

**Component skills** - 请求具体产物：
```
Use the positioning-statement skill to define our positioning for enterprise customers
```

**Interactive skills** - 对话式流程：
```
Run the prioritization-advisor skill. I need help choosing a framework.
```
Cowork 会在聊天中直接提出自适应问题，并给出编号选项。你可以回复：
- `2`
- `1 & 4`
- `Tell me more about option 3`

**Workflow skills** - 多阶段流程：
```
Start the discovery-process workflow for our B2B customer retention problem
```
Cowork 会先列出 phases，再逐步执行，并在决策点向你提问。

### 把 Skills 加成知识模块

如果你想跨会话持续可用：

1. **把 skills 加入 Cowork 的知识库**：
   - Settings -> Knowledge Modules
   - Add Folder: `product-manager-skills/skills`

2. **这样 skills 就会全局可用**：
   ```
   Use the epic-breakdown-advisor skill
   ```
   不需要再写文件路径。

### 同时使用多个 Skills

Cowork 能理解 skill 依赖关系。当你调用 workflow skill 时，它会自动引用相关的 component 和 interactive skills：

```
Run the product-strategy-session workflow
```

Cowork 会：
1. 使用 `positioning-workshop`（interactive）
2. 应用 `problem-statement`（component）
3. 引用 `jobs-to-be-done`（component）
4. 编排 `roadmap-planning`（workflow）

### Cowork 使用建议

- **Skills 可跨会话保留**：一旦加载，Cowork 会记住 skill 格式
- **按名字引用即可**：直接说 “Use the [skill-name] skill”，Cowork 会自己找文件
- **自然语言即可**：通常不需要写精确文件路径
- **默认可组合 skills**：Workflow skills 会自动编排相关 skills
- **先看示例也可以**：`Show me an example from the skill first`

### 故障排查

**Cowork 不认识某个 skill**：
- 确认 workspace 里包含 `product-manager-skills` 文件夹
- 去 Settings -> Knowledge Modules 里确认 skills 已被加载
- 试着写完整路径：`skills/user-story/SKILL.md`

**输出不符合 skill 格式**：
- 明确说：`Follow the [skill-name] skill structure exactly`
- 或点名具体章节：`Use the Application section from the skill`

**Interactive skill 跳过了提问**：
- 显式要求：`Ask me the discovery questions first, one at a time`

---

## 对比：Claude Code vs. Cowork

| Feature | Claude Code (CLI) | Claude Cowork (Workspace) |
|---------|------------------|---------------------------|
| **Access** | 命令行终端 | IDE / 编辑器集成 |
| **Skill Loading** | 明确写文件路径或全局安装 | 自动扫描工作区 |
| **Multi-turn flows** | 终端中的对话式流程 | 带代码上下文的内联聊天 |
| **Best for** | 独立 PM 工作、快速产物 | 集成开发、强上下文工作 |
| **Skill chaining** | 显式写出（“先 X，再 Y”） | 隐式完成（workflow 自动编排） |

---

## 通用最佳实践（两种工具都适用）

### 1. 先给上下文
调用 skill 前，先说明：
- Goal：你想达成什么
- Constraints：时间、资源、数据可用性
- Audience：输出给谁看
- Background：相关产品/用户背景

示例：
```
Context: We're a B2B SaaS product with 50 enterprise customers. Churn is 15% annually.
I need to run discovery interviews to understand why.

Use the discovery-interview-prep skill to plan 5 customer interviews over 2 weeks.
```

### 2. 知道三种 Skill 类型
- **Component**（10-30 分钟）：单个产物（user story、positioning statement、epic）
- **Interactive**（30-90 分钟）：通过自适应问题做引导式探索
- **Workflow**（数天/数周）：完整 PM 流程

### 3. 让 Interactive Skills 主导提问
不要跳过问题。Interactive skills 会问 3-5 个问题来收集上下文，再给出更聪明的推荐。你回答得越真实，推荐质量越高。

### 4. 显式串联 Skills（或者交给 Workflow 自动完成）
如果你在做自定义流程：
```
First use problem-framing-canvas, then opportunity-solution-tree, then pol-probe-advisor
```

如果你在做标准流程：
```
Run the discovery-process workflow
```
（它会自动处理串联。）

### 5. 对输出继续迭代
Skills 产出的是高质量草稿，不是永远的终稿。继续 refine：
```
This positioning statement is close, but too feature-focused. Rewrite emphasizing business outcomes.
```

### 6. 主动要求看 Examples
每个 skill 都有真实示例。你可以先让它展示：
```
Show me the "good" and "bad" examples from the user-story skill before we start
```

---

## Skill 分类速查

### Component Skills（16）
用于具体交付物的模板。适合你需要标准化产物时。

**Examples**：`user-story`、`positioning-statement`、`epic-hypothesis`、`problem-statement`、`pol-probe`

### Interactive Skills（14）
用于引导式探索流程。适合你需要判断方法或补上下文时。

**Examples**：`prioritization-advisor`、`epic-breakdown-advisor`、`context-engineering-advisor`、`pol-probe-advisor`、`agent-orchestration-advisor`

### Workflow Skills（4）
用于完整的端到端流程。适合你要跑一个完整 PM 周期时。

**Examples**：`discovery-process`、`prd-development`、`roadmap-planning`、`product-strategy-session`

---

## 需要帮助？

- **README**：看主文档 [README.md](../README.md) 获取完整 skill catalog
- **Skill Structure**：每个 skill 都包含 Purpose、Key Concepts、Application、Examples、Common Pitfalls、References
- **CLAUDE.md**：看 [CLAUDE.md](../CLAUDE.md) 了解 skill 设计理念
- **Issues**：在 [GitHub Issues](https://github.com/deanpeters/Product-Manager-Skills/issues) 反馈问题

---

**准备好用 Claude + PM skills 了吗？** 从目录里挑一个 skill，带着清晰目标和上下文开始，后面的流程 Claude 会接住。