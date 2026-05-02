# Superpowers

Superpowers 是一套面向编码代理的完整软件开发方法论。它建立在一组可组合的 `skills` 之上，并配有一套启动指令，用来确保你的代理真的会去使用这些技能。

## 工作方式

它从你启动编码代理的那一刻就开始生效。只要代理发现你正在构建某个东西，它**不会**立刻冲上去写代码，而是会先退一步，弄清楚你真正想完成什么。

当它从对话里整理出一份 `spec` 之后，会把内容分成足够短、真的能读完和消化的小段展示给你。

等你确认设计后，代理会整理出一份实现计划。这份计划会清晰到哪怕是一个热情很高、审美一般、判断力不足、没有项目背景、还不太喜欢测试的初级工程师，也能照着执行。整个流程强调真正的红绿 TDD、YAGNI（You Aren't Gonna Need It）和 DRY。

接下来，只要你说一句“开始”，它就会启动 `subagent-driven-development` 流程：让代理围绕每个工程任务推进、检查、评审，并持续向前。让 Claude 连续自主工作几个小时，同时仍然不偏离你定好的计划，这种情况并不少见。

当然里面还有很多别的内容，但上面这些就是这套系统的核心。由于 `skills` 会自动触发，你不需要额外做什么。你的编码代理自然就拥有了 Superpowers。

## 赞助

如果 Superpowers 帮你做成了一些能赚钱的事，而你也愿意支持一下，我会非常感谢你考虑[赞助我的开源工作](https://github.com/sponsors/obra)。

谢谢。

- Jesse

## 安装

**注意：** 不同平台的安装方式不同。

### Claude Code 官方市场

Superpowers 已上架[官方 Claude 插件市场](https://claude.com/plugins/superpowers)。

通过 Anthropic 官方市场安装插件：

```bash
/plugin install superpowers@claude-plugins-official
```

### Claude Code（Superpowers Marketplace）

Superpowers Marketplace 为 Claude Code 提供 Superpowers 以及一些相关插件。

先在 Claude Code 中注册这个市场：

```bash
/plugin marketplace add obra/superpowers-marketplace
```

然后从这个市场安装插件：

```bash
/plugin install superpowers@superpowers-marketplace
```

### OpenAI Codex CLI

1. 打开插件搜索界面

```bash
/plugins
```

2. 搜索 `superpowers`

```text
superpowers
```

3. 选择 `Install Plugin`

### OpenAI Codex App

- 在 Codex 应用中，点击侧边栏里的 `Plugins`
- 你应该能在 `Coding` 分类里看到 `Superpowers`
- 点击 `Superpowers` 旁边的 `+`，然后按提示完成安装

### Cursor（通过插件市场）

在 Cursor Agent 对话里，通过市场安装：

```text
/add-plugin superpowers
```

或者直接在插件市场里搜索 `superpowers`。

### OpenCode

告诉 OpenCode：

```text
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
```

**详细文档：** [docs/README.opencode.md](/d:/skills中文翻译/superpowers-中文/docs/README.opencode.md)

### GitHub Copilot CLI

```bash
copilot plugin marketplace add obra/superpowers-marketplace
copilot plugin install superpowers@superpowers-marketplace
```

### Gemini CLI

```bash
gemini extensions install https://github.com/obra/superpowers
```

更新命令：

```bash
gemini extensions update superpowers
```

## 基础工作流

1. **`brainstorming`**
   在写代码前自动触发。通过提问打磨模糊想法，探索备选方案，并按分段形式展示设计供你确认，同时保存设计文档。
2. **`using-git-worktrees`**
   在设计获批后触发。创建隔离工作区和新分支，运行项目初始化，并确认测试基线是干净的。
3. **`writing-plans`**
   在设计确认后触发。把工作拆成 2 到 5 分钟一个的小任务。每个任务都带明确文件路径、完整代码和验证步骤。
4. **`subagent-driven-development`** 或 **`executing-plans`**
   在计划完成后触发。要么为每个任务派发新的子代理并执行双阶段评审，要么按批次执行并在关键点交给人工确认。
5. **`test-driven-development`**
   在实现过程中触发。强制执行 `RED-GREEN-REFACTOR`：先写失败测试，看它失败，再写最小实现，看它通过，然后再整理代码。凡是在测试之前写出来的代码，都应该删掉重来。
6. **`requesting-code-review`**
   在任务之间触发。对照计划进行评审，并按严重程度报告问题。严重问题会阻止流程继续。
7. **`finishing-a-development-branch`**
   在任务完成时触发。验证测试，给出后续选项（合并 / 提 PR / 保留 / 丢弃），并清理 `worktree`。

**代理在执行任何任务前，都会先检查是否有对应 skill。** 这些是强制工作流，不只是建议。

## 包含内容

### Skills Library

**测试**

- **`test-driven-development`**：`RED-GREEN-REFACTOR` 循环（包含测试反模式参考）

**调试**

- **`systematic-debugging`**：四阶段根因分析流程（包含 `root-cause-tracing`、`defense-in-depth`、`condition-based-waiting` 等技巧）
- **`verification-before-completion`**：确保问题真的已经修好

**协作**

- **`brainstorming`**：苏格拉底式设计澄清
- **`writing-plans`**：详细实现计划
- **`executing-plans`**：带检查点的批量执行
- **`dispatching-parallel-agents`**：并行子代理工作流
- **`requesting-code-review`**：评审前检查清单
- **`receiving-code-review`**：如何回应评审反馈
- **`using-git-worktrees`**：并行开发分支
- **`finishing-a-development-branch`**：合并 / PR 决策流程
- **`subagent-driven-development`**：通过双阶段评审实现快速迭代

**元能力**

- **`writing-skills`**：按最佳实践创建新 `skills`（包含测试方法）
- **`using-superpowers`**：`skills` 系统入门

## 理念

- **测试驱动开发**：永远先写测试
- **系统化优先于临时发挥**：相信流程，而不是猜测
- **降低复杂度**：把简单当作首要目标
- **证据优先于口头宣称**：在宣布成功前先验证

阅读[最初的发布公告](https://blog.fsck.com/2025/10/09/superpowers/)。

## 贡献

Superpowers 的通用贡献流程如下。需要注意的是，我们通常不接受新增 `skills` 的贡献；而任何对已有 `skills` 的修改，都必须能在我们支持的所有编码代理上正常工作。

1. Fork 仓库
2. 切换到 `dev` 分支
3. 为你的工作创建分支
4. 按 `writing-skills` skill 的方法创建和测试新的或修改后的 `skills`
5. 提交 PR，并确保填写 pull request 模板

完整指南见 `skills/writing-skills/SKILL.md`。

## 更新

Superpowers 的更新方式会因编码代理不同而略有差异，但很多情况下是自动完成的。

## 许可证

MIT License，详见 `LICENSE` 文件。

## 社区

Superpowers 由 [Jesse Vincent](https://blog.fsck.com) 和 [Prime Radiant](https://primeradiant.com) 的其他伙伴共同构建。

- **Discord**：[加入我们](https://discord.gg/35wsABTejz)，获取社区支持、提问，或分享你用 Superpowers 构建的东西
- **Issues**：https://github.com/obra/superpowers/issues
- **Release announcements**：[订阅](https://primeradiant.com/superpowers/)，获取新版本通知