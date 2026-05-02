---
title: 快速开始
tagline: "五分钟内，从零到完成第一次 polish pass。"
order: 1
description: "安装 Impeccable，先运行一次 /impeccable teach 建立项目上下文，然后对一个已存在的页面运行 /impeccable polish。这是最快看见 Impeccable 如何改变 AI 生成设计结果的路径。"
---

## 你将完成什么

完成本教程后，你的项目里会装好 Impeccable，根目录会拥有一组 `PRODUCT.md` + `DESIGN.md` 文件，用来记录品牌、受众和视觉系统，而且你还会亲手让一个页面走完一轮 polish pass。总耗时大约十分钟。

## 前置条件

- 一个 AI coding harness：Claude Code、Cursor、Gemini CLI、Codex CLI，或其他受支持工具。
- 一个至少包含一个 HTML 或组件文件的项目，并且你想改进它。哪怕只是一个刚 scaffold 出来的 landing page 也可以。

## Impeccable 是怎么工作的

Impeccable 会作为一个名为 `impeccable` 的单一 agent skill 安装。你通过它访问全部 23 个 sub-commands：

```text
/impeccable <command> <target>
```

例如：`/impeccable polish the pricing page`，或 `/impeccable audit the checkout`。单独输入 `/impeccable` 就能看到完整命令列表。

如果你经常使用某个命令，可以用 `/impeccable pin <command>` 把它 pin 成独立快捷方式（例如 `/impeccable pin audit` 会直接给你一个 `/audit`）。

## 第 1 步：安装

在项目根目录运行：

```text
npx skills add pbakaus/impeccable
```

它会自动识别你的 harness，并把 skill 文件写到对应位置（例如 `.claude/skills/`、`.cursor/skills/`）。重载 harness 后输入 `/`，你应该能在自动补全里看到 `/impeccable`。输入它后，skill 的参数提示会列出所有可用命令。

## 第 2 步：让 Impeccable 了解你的项目

这是最关键的一步。没有上下文的设计只会生成通用结果。`/impeccable teach` 会运行一段简短 discovery interview，并在项目根目录写出一个 `PRODUCT.md` 文件。

运行：

```text
/impeccable teach
```

第一个问题是 **register**：这是一块 brand surface（营销站、落地页、作品集，设计本身就是产品），还是一块 product surface（app UI、dashboard、工具，设计是为产品服务）？Register 会影响所有后续默认值，从字体通道到动效强度都会变。参见 [brand vs product](/tutorials/brand-vs-product) 了解两者差异。Teach 会先从你的代码库形成一个初步判断，再让你确认，而不是完全冷启动地乱问。

随后是几道更短的问题：

- **这个产品是给谁用的？** 要具体。不要写 “users”，而应写成 “solo founders evaluating a new tool on their phone between meetings” 这种级别。
- **品牌语气用三个词怎么概括？** 选真实词语。像 “warm and mechanical and opinionated” 就比 “modern and clean” 有用。
- **有没有视觉参考？** 请给出命名明确的品牌、产品或印刷对象，而不是抽象形容词。比如 “Klim Type Foundry specimen pages”，而不是 “technical and clean”。
- **有没有反向参考？** 同样也要说具体名字，明确指出产品不应该长得像什么。

用你自己的话回答即可。skill 会据此写出 `PRODUCT.md`。之后每个命令都会自动读取它。

打开 `PRODUCT.md` 看看它写了什么。凡是你觉得不对的地方，直接改。这个文件最终是你的。

## 第 2.5 步：记录视觉系统

在 `/impeccable teach` 的末尾，skill 会询问你是否继续运行 `/impeccable document`。请选择 yes。它会扫描你的 tokens（CSS custom properties、Tailwind config、CSS-in-JS themes），提取颜色与字体，只把需要创意判断的部分归并成一个问题来问（例如 Creative North Star、描述性色彩命名），然后写出一份符合 [Google Stitch DESIGN.md format](https://stitch.withgoogle.com/docs/design-md/format/) 的 `DESIGN.md`。

如果是一个还没有 tokens 的新项目，document 会以 seed mode 运行：快速问你五个关于颜色策略、字体方向和动效能量的问题，写出一个可以后续随代码刷新更新的 scaffold。

`PRODUCT.md` 负责战略层（是谁、做什么、为什么），`DESIGN.md` 负责视觉层（颜色、字体、组件）。后续每个命令都会先读这两个文件。

## 第 3 步：挑一个页面做 polish

选一个已经存在的页面。关于页、设置页、价格表，什么都可以。运行：

```text
/impeccable polish the pricing page
```

这个 skill 会依次检查对齐、间距、字体、颜色、交互状态、过渡和文案。它做的是定点修复，而不是整页重写。你通常会看到一些不大的 diff，但它们叠加起来，会把页面从“已经完成”推到“完成得很好”。

一次典型的 polish pass 看起来大概像这样：

```text
Visual alignment: fixed 3 off-grid elements
Typography: tightened h1 kerning, fixed widow on feature list
Color: replaced one hardcoded hex with --color-accent token
Interaction: added missing hover state on FAQ items
Motion: softened modal entrance to 220ms ease-out-quart
Copy: removed stray 'Lorem' placeholder
```

查看 diff。如果某个改动让你觉得不对，就让模型解释它为什么这么改。如果解释完你还是觉得不对，那就回滚。Impeccable 有主见，但并非永远正确。

## 接下来可以试什么

- [用 Live Mode 做可视化迭代](/tutorials/iterate-live)：在你的 dev server 上打开浏览器 picker，为每个元素生成三个 production-quality variants，并把被接受的那个写回 source。
- `/impeccable critique the landing page`：运行一次完整设计评审，包含评分、persona 测试和自动检测。这是找出“接下来该修哪里”的最佳方式。
- `/impeccable audit the checkout`：针对实现层做可访问性、性能、主题、响应式和 anti-pattern 检查。很适合发版前跑。
- `/impeccable craft a pricing page for enterprise customers`：对一个全新功能跑完整的 shape-then-build 流程。
- **把常用命令 pin 出来。** 如果你总在用某一个命令，`/impeccable pin audit` 会让 `/audit` 直接成为独立快捷方式，而不需要回退到旧的拆分结构。
- `/impeccable redo this hero section` 也能直接工作。`/impeccable` 后面跟的任何描述，都会把设计原则应用到当前任务上。

## 常见问题

- **skill 提示 “no design context found”**。你跳过了第 2 步。先运行 `/impeccable teach`。
- **命令没有出现在 harness 里。** 安装后先重载 harness。如果还没有，检查安装器是否把文件写到了预期目录（`.claude/skills/`、`.cursor/skills/` 等），并确认 harness 正在读取那个目录。
- **polish pass 改掉了你原本喜欢的东西。** 直接说出来。回滚那个改动，告诉模型要撤销哪一条具体编辑，然后继续往下做。