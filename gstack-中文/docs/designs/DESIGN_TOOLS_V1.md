# 设计：gstack 视觉设计生成（`design` binary）

由 `/office-hours` 于 2026-03-26 生成  
分支：`garrytan/agent-design-tools`  
仓库：`gstack`  
状态：DRAFT  
模式：Intrapreneurship

## 背景

gstack 的设计类 skills（`/office-hours`、`/design-consultation`、`/plan-design-review`、`/design-review`）目前产出的仍然是**设计的文字描述**：`DESIGN.md` 中的十六进制颜色、规划文档中的像素规格、ASCII 线框图。对于一位曾在 OmniGraffle 中手工设计 HelloSign 的设计师而言，这显得颇为尴尬。

问题不在于设计语言不够丰富，而在于价值单位本身错了。用户需要的不是“更擅长撰写设计描述”，而是一个可执行、可查看的视觉产物，让对话从“你喜欢这个规格吗？”转变为“这是不是那个界面？”

## 问题陈述

设计类 skill 仍在使用文本描述设计，而非直接展示设计。Argus UX 整体改造计划就是典型例子：487 行关于情绪弧线、字体选择、动画节奏的详细规范，结果一个视觉产物都没有。一个声称能“做设计”的 AI 编码代理，至少应该给出一个你能看到、能产生直观反应的东西。

## 需求证据

创建者/主用户明确觉得当前输出很尴尬。每次设计 skill 会话结束时，得到的都是本应是模型的文本描述。与此同时，GPT Image API 现在已经能产出文字渲染准确、接近像素级的 UI 模型，以“能力还不够”为由继续停留在文字输出，已经站不住脚了。

## 最小可行方案

构建一个编译后的 TypeScript binary：`design/dist/design`，通过 `$D` 被 skill 模板调用，模式上与现有 `$B` browse binary 对齐。集成优先级：

`/office-hours -> /plan-design-review -> /design-consultation -> /design-review`

## 已达成前提

1.  正确的引擎是 GPT Image API（通过 OpenAI Responses API），Google Stitch SDK 可作为备选。
2.  **视觉模型在设计类 skill 中默认开启**，但保留一个易于跳过的路径。
3.  这是一个共享工具，不是每个 skill 各自重写，应该做成一个任何 skill 都能调用的 `design` binary。
4.  优先顺序：先 `/office-hours`，再 `/plan-design-review`、`/design-consultation`、`/design-review`。

## 跨模型视角（Codex）

Codex 独立验证了核心命题：“失败点不是 markdown 里的输出质量，而是当前价值单位本身就是错的。”  
它的关键贡献包括：

-   质疑“opt-in”的前提，并推动改成“default-on”
-   提出基于视觉的质量门控：用 GPT-4o vision 检查模型是否出现文字不可读、缺区块、布局崩坏，并在失败时自动重试一次
-   将首个 48 小时原型收敛为：共享 `visual_mockup.ts` 工具，先只接 `/office-hours` 与 `/plan-design-review`，先做主模型 + 2 个变体

## 推荐方案：`design` Binary（方案 B）

### 架构

它沿用 browse binary 的编译与分发模式（`bun build --compile`、setup 脚本、skill 模板中的 `$VARIABLE` 解析），但架构更简单：不需要常驻 daemon server，不需要 Chromium，不需要健康检查，也不需要 token auth。design binary 是一个无状态 CLI，只负责调用 OpenAI API 并把 PNG 写到磁盘。多轮迭代所需的会话状态则保存在 JSON 文件里。

**新增依赖：** `openai` npm package（放入 `devDependencies`，而非 runtime dependencies）。  
design binary 单独编译，避免让 browse binary 也被 `openai` 依赖膨胀。

```text
design/
├── src/
│   ├── cli.ts
│   ├── commands.ts
│   ├── generate.ts
│   ├── iterate.ts
│   ├── variants.ts
│   ├── check.ts
│   ├── brief.ts
│   └── session.ts
├── dist/
│   ├── design
│   └── .version
└── test/
    └── design.test.ts
```

### 命令

```bash
$D generate --brief "..." --output /tmp/mockup-hero.png
$D variants --brief "..." --count 3 --output-dir /tmp/mockups/
$D iterate --session /tmp/design-session.json --feedback "..." --output /tmp/mockup-v2.png
$D check --image /tmp/mockup-hero.png --brief "..."
$D generate --brief "..." --output /tmp/mockup.png --check --retry 1
$D generate --brief-file /tmp/brief.json --output /tmp/mockup.png
$D compare --images /tmp/mockups/variant-*.png --output /tmp/design-board.html
$D setup
```

### brief 输入模式

-   `--brief "plain text"`：自由文本提示
-   `--brief-file path.json`：符合 `DesignBrief` 接口的结构化 JSON

skills 的职责是构造 brief JSON、写入 `/tmp`，再把路径传给 `--brief-file`。

### 设计探索工作流

工作流是**串行**的，而非并行。PNG 主要服务于人类视觉评审；HTML 线框图用于 agent 真正落地实现：

```text
1. $D variants --brief "..." --count 3 --output-dir /tmp/mockups/
2. $D compare --images /tmp/mockups/*.png --output /tmp/design-board.html
3. $B goto file:///tmp/design-board.html
4. 用户在页面里挑选、评分、评论并提交
5. Claude 再依据批准方向生成可实现的 HTML 线框图
```

PNG 是给人说“对，就是这个方向”；HTML 是给 agent 说“我知道怎么把它做出来”。

### 比较面板设计规范

**分类：** APP UI（任务导向、工具型页面），而非品牌宣传页。  
**布局：** 单列，全宽模型。每个变体占尽量大的可视宽度，用户纵向滚动浏览。

视觉规则：

-   背景：`#fff`
-   无阴影、无卡片边框
-   变体之间用 `1px #e5e5e5` 分隔线
-   字体：system font stack
-   标题：16px semibold
-   标签：14px semibold
-   “More like this” 是每个变体自带的重新生成入口
-   提交按钮黑底白字，单一 CTA
-   重新生成栏用 `#f7f7f7`

交互状态：

-   加载中：骨架屏 + 禁用控件
-   部分失败：失败的卡片允许单独重试
-   提交后：显示“反馈已提交，请返回 coding agent”
-   重新生成：旧图淡出，新图骨架再淡入，滚动条回顶，旧反馈清空

### 关键设计决策

**1. 用无状态 CLI，而非 daemon**  
browse 需要持久化 Chromium；design 只是 API 调用，不值得做成服务进程。

**2. 用结构化 brief 输入**  
brief 是 skill 文本与图像生成之间的接口：

```typescript
interface DesignBrief {
  goal: string;
  audience: string;
  style: string;
  elements: string[];
  constraints?: string;
  reference?: string;
  screenType: string;
}
```

**3. 在设计类 skill 中默认生成模型**  
模板中的提示语可以是：

```text
Generating visual mockup of the proposed design... (say "skip" if you don't need visuals)
```

**4. 加入视觉质量门控**  
生成后可选让 GPT-4o vision 检查：
-   文字是否可读
-   元素是否齐全
-   是否看起来像真实 UI，而非一堆拼贴

失败时自动重试一次。

**5. 输出位置：探索稿放 `/tmp`，批准稿进入 `docs/designs/`**  
避免仓库被所有探索中间产物塞满。

**6. 公开承认信任边界**  
默认开启的图像生成意味着 brief 文本会被发往 OpenAI。  
但只发送抽象设计描述，不发送源码，也不发送用户数据。  
截图路径仅供 agent 本地使用，不上传给 API。

**7. 处理速率限制**  
变体采用交错并行：每次调用错开 1 秒，遇到 429 错误时指数退避。

### 模板集成

扩展现有 `scripts/resolvers/design.ts`：

-   新增 `generateDesignSetup()`，对应 `{{DESIGN_SETUP}}`
-   新增 `generateDesignMockup()`，对应 `{{DESIGN_MOCKUP}}`

新增 `HostPaths` 字段：

```typescript
// claude host:
designDir: '~/.claude/skills/gstack/design/dist'
// codex host:
designDir: '$GSTACK_DESIGN'
```

`$D` 的解析方式：

```bash
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
D=""
[ -n "$_ROOT" ] && [ -x "$_ROOT/.claude/skills/gstack/design/dist/design" ] && D="$_ROOT/.claude/skills/gstack/design/dist/design"
[ -z "$D" ] && D=~/.claude/skills/gstack/design/dist/design
if [ -x "$D" ]; then
  echo "DESIGN_READY: $D"
else
  echo "DESIGN_NOT_AVAILABLE"
fi
```

如果是 `DESIGN_NOT_AVAILABLE`，则回退到现有 `DESIGN_SKETCH`。

### Skill 集成优先级

**1. `/office-hours`**  
替换 Visual Sketch 章节，生成主模型 + 2 个变体，供用户选择。

**2. `/plan-design-review`**  
当某个设计维度得分低于 7/10 时，用模型告诉用户“10/10 会长什么样”。

**3. `/design-consultation`**  
生成 proposed design system 的视觉预览。

**4. `/design-review`**  
从 plan / DESIGN.md 生成“设计意图”模型，再和线上截图做对比。

### 需要创建的文件

-   `design/src/cli.ts`
-   `design/src/commands.ts`
-   `design/src/generate.ts`
-   `design/src/iterate.ts`
-   `design/src/variants.ts`
-   `design/src/check.ts`
-   `design/src/brief.ts`
-   `design/src/session.ts`
-   `design/src/compare.ts`
-   `design/test/design.test.ts`

### 需要修改的文件

-   `scripts/resolvers/types.ts`
-   `scripts/resolvers/index.ts`
-   `package.json`
-   `setup`
-   `scripts/resolvers/preamble.ts`
-   `test/gen-skill-docs.test.ts`
-   `office-hours/SKILL.md.tmpl`
-   `plan-design-review/SKILL.md.tmpl`

### 现有可复用代码

-   browse CLI 模式
-   `commands.ts` registry 模式
-   `generateBrowseSetup()`
-   `DESIGN_SKETCH` resolver
-   HostPaths 系统
-   现有构建流程

### API 细节

**生成：**

```typescript
const response = await openai.responses.create({
  model: "gpt-4o",
  input: briefToPrompt(brief),
  tools: [{ type: "image_generation", size: "1536x1024", quality: "high" }],
});
```

**迭代：**

```typescript
const response = await openai.responses.create({
  model: "gpt-4o",
  input: feedback,
  previous_response_id: session.lastResponseId,
  tools: [{ type: "image_generation" }],
});
```

注意：多轮图像迭代是否真能通过 `previous_response_id` 保留视觉上下文，还需要原型验证。若不成立，回退到“原始 brief + 累积反馈”的重新生成。

### 认证

**Codex OAuth token 不能用于图像生成。**  
实测发现，无论 Images API 还是 Responses API，`~/.codex/auth.json` 里的 access token 都会因为缺少 `api.model.images.request` scope 而被拒绝。

认证解析顺序：

1.  `~/.gstack/openai.json`
2.  `OPENAI_API_KEY`
3.  若都没有，进入 `$D setup`
4.  若有认证但 API 失败，则回退到 `DESIGN_SKETCH`

### 仍需在原型中验证的假设

1.  图像质量是否真的足以称为 UI 模型
2.  多轮迭代是否能保留视觉上下文
3.  单次会话成本是否真的能控制在 `$0.10-$0.40`

## CEO 扩展范围

额外被接受的扩展包括：

-   设计记忆 + 探索宽度控制
-   模型差异比较
-   截图到模型的演进
-   设计意图验证
-   响应式变体
-   设计到代码提示

这些都可以往后排，但它们给出了这条能力链的完整上限。

## 成功标准

-   `/office-hours` 能真正产出 PNG 模型
-   `/plan-design-review` 里“更好是什么样”变成图，而非文本
-   模型至少足够让开发者照着实现
-   质量门控能挡住明显糟糕的图
-   单次设计会话成本低于 `$0.50`

## 分发计划

design binary 与 browse binary 一起分发：

-   `bun build --compile design/src/cli.ts --outfile design/dist/design`
-   在 `./setup` 和 `bun run build` 中一起构建
-   通过现有 `~/.claude/skills/gstack/` 安装路径挂入

## 下一步（实现顺序）

### Commit 0：必须先做原型验证

-   用一个 50 行左右的脚本发 3 个不同 brief 到 GPT Image API
-   先看图像是否真能用于 UI 模型
-   如果结果只是“看起来像 AI 画出来的尴尬 UI 图”，就立刻停止

### Commit 1-9

后续依次是：

1.  design binary 核心
2.  变体 + 迭代
3.  模板集成
4.  `/office-hours` 集成
5.  `/plan-design-review` 集成
6.  设计记忆 / 探索宽度
7.  模型差异 / 设计意图验证
8.  截图到模型的演进
9.  响应式变体 / 设计到代码提示

## 总结

这件事的真正核心不是“让设计类 skill 写得更像设计师”，而是把设计输出从“文字描述”升级为“可以直接看、直接选、直接反应”的视觉对象。  

如果 `/office-hours` 最终能默认产出真正能讨论的图，那么所有下游设计 skill 都会一起变强，因为它们终于有了一个能被人类和 agent 同时引用的共同对象。