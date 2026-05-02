# Impeccable

这是一套你原本不知道自己需要、但一旦用上就离不开的前端设计词汇与方法。1 个核心技能、23 个命令，以及一套精挑细选的反模式规则，专为打造真正精致的前端设计而生。

> **快速开始：** 访问 [impeccable.style](https://impeccable.style) 下载开箱即用的安装包。

## 为什么选择 Impeccable？

Anthropic 曾开发过一个 [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) 技能，用于引导 Claude 产出更佳的 UI 设计。Impeccable 建立在此基础之上，但在设计深度和可控性方面更进一步。

每个 LLM 学到的几乎都是同一批通用模板。若无额外引导，最终往往会出现一组可预测的相同错误：Inter 字体、紫色渐变、卡片嵌套卡片、彩色背景上的灰色文字。

Impeccable 通过以下方式对抗这种偏置：
- **扩展版技能**：包含 7 份面向具体设计领域的参考文件（[查看源码](source/skills/impeccable/)）
- **23 个命令**：覆盖审计、评审、打磨、提炼、动效等整套工作流程
- **精选反模式**：明确告知 AI 什么 **不要** 做

## 包含内容

### 技能：`impeccable`

这是一个完整的设计技能，附带 7 份领域化参考资料（[查看技能](source/skills/impeccable/SKILL.md)）：

| 参考资料 | 涵盖内容 |
|-----------|--------|
| [typography](source/skills/impeccable/reference/typography.md) | 字体系统、字体搭配、模块化比例、OpenType |
| [color-and-contrast](source/skills/impeccable/reference/color-and-contrast.md) | OKLCH、带色中性色、深色模式、可访问性 |
| [spatial-design](source/skills/impeccable/reference/spatial-design.md) | 间距系统、网格、视觉层级 |
| [motion-design](source/skills/impeccable/reference/motion-design.md) | 缓动曲线、交错动效、减少动效 |
| [interaction-design](source/skills/impeccable/reference/interaction-design.md) | 表单、焦点状态、加载模式 |
| [responsive-design](source/skills/impeccable/reference/responsive-design.md) | 移动优先、流式设计、容器查询 |
| [ux-writing](source/skills/impeccable/reference/ux-writing.md) | 按钮文案、错误信息、空状态 |

### 23 个命令

所有命令都通过 `/impeccable` 访问：

| 命令 | 功能 |
|---------|--------------|
| `/impeccable craft` | 完整的“先规划、再构建”流程，包含视觉迭代 |
| `/impeccable teach` | 一次性初始化：收集设计上下文，写入 PRODUCT.md 和 DESIGN.md |
| `/impeccable document` | 从现有项目代码生成 DESIGN.md |
| `/impeccable extract` | 把可复用组件和 tokens 提取进设计系统 |
| `/impeccable shape` | 在写代码前规划 UX/UI |
| `/impeccable critique` | UX 设计评审：层级、清晰度、情绪共鸣 |
| `/impeccable audit` | 运行技术质量检查（a11y、性能、响应式） |
| `/impeccable polish` | 最后一轮打磨、设计系统对齐与上线准备 |
| `/impeccable bolder` | 增强平淡设计的视觉冲击力 |
| `/impeccable quieter` | 柔和过于激进的设计表达 |
| `/impeccable distill` | 提炼至本质 |
| `/impeccable harden` | 错误处理、i18n、文本溢出、边界情况 |
| `/impeccable onboard` | 首次使用流程、空状态、激活路径 |
| `/impeccable animate` | 增加有目的的动效 |
| `/impeccable colorize` | 引入有策略的色彩 |
| `/impeccable typeset` | 修正字体选择、层级与字号 |
| `/impeccable layout` | 修复布局、间距与视觉节奏 |
| `/impeccable delight` | 增加令人愉悦的时刻 |
| `/impeccable overdrive` | 加入技术上足够惊艳的效果 |
| `/impeccable clarify` | 改善不清晰的 UX 文案 |
| `/impeccable adapt` | 适配不同设备 |
| `/impeccable optimize` | 性能优化 |
| `/impeccable live` | 浏览器中的视觉变体模式：直接迭代页面元素 |

使用 `/impeccable pin <命令>` 可以创建独立快捷入口（例如 `pin audit` 会生成 `/audit`）。

#### 使用示例

```text
/impeccable audit blog           # 审计博客主页 + 文章页
/impeccable critique landing     # 进行 UX 设计评审
/impeccable polish settings      # 上线前最后打磨一轮
/impeccable harden checkout      # 补充错误处理 + 边界情况
```

也可以直接用 `/impeccable` 加自然语言描述：

```text
/impeccable redo this hero section
```

### 反模式

此技能明确规定了应避免的事项：

- 避免使用过度滥用的字体（Arial、Inter、系统默认字体）
- 避免在彩色背景上使用灰色文字
- 避免使用纯黑 / 纯灰（都应带有轻微色相偏移）
- 避免将所有内容都包裹进卡片，或在卡片内嵌套卡片
- 避免使用 bounce / elastic easing（会显得过时）

## 看看实际效果

访问 [impeccable.style](https://impeccable.style#casestudies)，查看真实项目在使用 Impeccable 命令前后的改造案例。

## 安装

### 方式 1：从网站下载（推荐）

访问 [impeccable.style](https://impeccable.style)，下载对应工具的 ZIP 包，并解压到你的项目中。

### 方式 2：从仓库复制

**Cursor:**
```bash
cp -r dist/cursor/.cursor your-project/
```

> **注意：** Cursor 技能需要额外设置：
> 1. 在 Cursor Settings -> Beta 中切换到 Nightly channel
> 2. 在 Cursor Settings -> Rules 中启用 Agent Skills
>
> [了解更多 Cursor 技能](https://cursor.com/docs/context/skills)

**Claude Code:**
```bash
# 项目级安装
cp -r dist/claude-code/.claude your-project/

# 或全局安装（应用到所有项目）
cp -r dist/claude-code/.claude/* ~/.claude/
```

**OpenCode:**
```bash
cp -r dist/opencode/.opencode your-project/
```

**Pi:**
```bash
cp -r dist/pi/.pi your-project/
```

**Gemini CLI:**
```bash
cp -r dist/gemini/.gemini your-project/
```

> **注意：** Gemini CLI 技能需要额外设置：
> 1. 安装预览版：`npm i -g @google/gemini-cli@preview`
> 2. 运行 `/settings` 并启用 “Skills”
> 3. 运行 `/skills list` 验证安装是否成功
>
> [了解更多 Gemini CLI 技能](https://geminicli.com/docs/cli/skills/)

**Codex CLI:**
```bash
# 项目级安装
cp -r dist/agents/.agents your-project/

# 或用户级安装
mkdir -p ~/.agents/skills
cp -r dist/agents/.agents/skills/* ~/.agents/skills/
```

**GitHub Copilot:**
```bash
cp -r dist/github/.github your-project/
```

**Trae:**
```bash
# Trae China（国内版）
cp -r dist/trae/.trae-cn/skills/* ~/.trae-cn/skills/

# Trae International
cp -r dist/trae/.trae/skills/* ~/.trae/skills/
```

> **注意：** Trae 有两个版本，对应不同配置目录：
> - **Trae China**: `~/.trae-cn/skills/`
> - **Trae International**: `~/.trae/skills/`
>
> 复制后，重启 Trae IDE 以激活技能。

**Rovo Dev:**
```bash
# 项目级安装
cp -r dist/rovo-dev/.rovodev your-project/

# 或全局安装（应用到所有项目）
cp -r dist/rovo-dev/.rovodev/skills/* ~/.rovodev/skills/
```

## 使用

安装完成后，即可在你的 AI 工具中使用这些命令：

```text
/audit           # 查找问题
/normalize       # 修复不一致
/polish          # 最后一轮清理
/distill         # 移除复杂度
```

大多数命令都接受一个可选参数，用于聚焦到某个具体区域：

```text
/audit header
/polish checkout-form
```

**注意：** 在此，Codex 使用的是技能，而非 `/prompts:` 命令。请打开 `/skills` 或直接输入 `$impeccable`。项目级安装位于 `.agents/skills/`；用户级安装位于 `~/.agents/skills/`。GitHub Copilot 使用 `.github/skills/`。如果新安装的技能未出现，请重启对应工具。

## CLI

Impeccable 也提供一个独立 CLI，可在没有 AI 工具的情况下检测反模式：

```bash
npx impeccable detect src/                   # 扫描目录
npx impeccable detect index.html             # 扫描 HTML 文件
npx impeccable detect https://example.com    # 扫描 URL（Puppeteer）
npx impeccable detect --fast --json .        # 纯正则模式，输出 JSON
```

检测器会识别 24 类问题，涵盖 AI 生成内容的典型问题（侧边 tab 边框、紫色渐变、bounce easing、深色发光等）以及通用设计质量问题（行宽、拥挤 padding、过小触控目标、标题跳级等）。

## 支持的工具

- [Cursor](https://cursor.com)
- [Claude Code](https://claude.ai/code)
- [OpenCode](https://opencode.ai)
- [Pi](https://pi.dev)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [Codex CLI](https://github.com/openai/codex)
- [VS Code Copilot](https://code.visualstudio.com)
- [Kiro](https://kiro.dev)
- [Trae](https://trae.ai)
- [Rovo Dev](https://www.atlassian.com/software/rovo)

## 贡献

贡献指南与构建说明见 [DEVELOP.md](DEVELOP.md)。

## 许可证

Apache 2.0。见 [LICENSE](LICENSE)。

`impeccable` 技能构建于 [Anthropic 原始 frontend-design 技能](https://github.com/anthropics/skills/tree/main/skills/frontend-design) 之上。归属说明见 [NOTICE.md](NOTICE.md)。

---

作者：[Paul Bakaus](https://www.paulbakaus.com)