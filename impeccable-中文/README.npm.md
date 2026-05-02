# Impeccable CLI

从命令行检测 UI 反模式与设计质量问题。它可扫描 HTML、CSS、JSX、TSX、Vue 和 Svelte 文件，识别 25 种具体模式，包括 AI 生成界面的常见痕迹、可访问性违规以及通用设计质量问题。

## 快速开始

```bash
# 将 skills 安装到你的 AI harness（Claude、Cursor、Gemini 等）
npx impeccable skills install

# 更新 skills 到最新版本
npx impeccable skills update

# 列出所有可用命令
npx impeccable skills help

# 扫描文件或目录中的反模式
npx impeccable detect src/

# 扫描在线 URL（需要 Puppeteer）
npx impeccable detect https://example.com

# 以 JSON 输出，便于 CI / 工具链使用
npx impeccable detect --json src/

# 仅正则模式（更快，不用 jsdom）
npx impeccable detect --fast src/
```

## 可检测内容

**AI Slop 痕迹**：那些一眼就会让人觉得“这是 AI 做的”的模式：
- 卡片或列表项上的侧边强调边框、标题使用渐变文字
- 紫色 / 紫罗兰渐变，以及深色背景上的青色配色
- 带发光强调的深色模式、边框与圆角的冲突搭配

**排版问题**：被过度使用的字体（Inter、Roboto）、扁平的层级体系、单一字体家族

**颜色与对比度**：WCAG AA 违规、彩色背景上的灰色文字、纯黑 / 纯白

**布局与构图**：嵌套卡片、单调的间距、把所有内容都居中

**动效**：bounce / elastic 缓动、布局属性过渡动画

**质量问题**：正文过小、内边距拥挤、行宽过长、触控目标过小

总计 25 项检测。完整列表见 [impeccable.style](https://impeccable.style)。

## 退出码

- `0`：未发现问题
- `2`：检测到反模式

## 选项

```
impeccable detect [options] [file-or-dir-or-url...]

  --fast    仅正则模式（跳过 jsdom，更快但精度较低）
  --json    以 JSON 输出结果
  --help    显示帮助
```

## 运行要求

- Node.js 18+
- `jsdom`（作为依赖内置，用于扫描 HTML）
- `puppeteer`（可选，仅在扫描 URL 时需要）

## Impeccable 的一部分

这个 CLI 是 [Impeccable](https://impeccable.style) 的组成部分。Impeccable 是一套跨 provider 的设计 skill 包，面向 AI 驱动的开发工具。完整套件包含 22 个引导命令，可用于 Claude、Cursor、Gemini、Codex 等环境。

## 许可证

[Apache 2.0](https://github.com/pbakaus/impeccable/blob/main/LICENSE)