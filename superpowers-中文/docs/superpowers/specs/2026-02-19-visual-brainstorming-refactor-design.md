# 可视化头脑风暴重构：浏览器展示，终端对话

**日期：** 2026-02-19  
**状态：** 已批准  
**范围：** `lib/brainstorm-server/`、`skills/brainstorming/visual-companion.md`、`tests/brainstorm-server/`

## 问题

在可视化头脑风暴过程中，Claude 会运行 `wait-for-feedback.sh` 作为后台任务，并阻塞在 `TaskOutput(block=true, timeout=600s)` 上。这会直接占住整个 TUI，导致用户无法在可视化头脑风暴进行时继续在终端向 Claude 输入内容。浏览器因此被迫成了唯一输入通道。

Claude Code 的执行模型是按回合进行的。Claude 无法在同一回合里同时监听两个输入通道。阻塞式 `TaskOutput` 方案本身就是错误的原语，它试图模拟平台并不支持的事件驱动行为。

## 设计

### 核心模型

**浏览器 = 交互式展示层。**  
负责展示 mockup，并允许用户点击选择。

**终端 = 对话通道。**  
始终保持可用，用户继续在这里和 Claude 对话。

### 新循环

1. Claude 向会话目录写入一个 HTML 文件
2. Server 通过 chokidar 检测到它，并通过 WebSocket 让浏览器刷新
3. Claude 结束当前回合，提示用户去浏览器查看，并在终端回复
4. 用户查看浏览器，可选择点击选项，然后在终端输入反馈
5. 下一回合中，Claude 读取 `$SCREEN_DIR/.events` 里的浏览器交互流，并与终端文字合并理解
6. 继续迭代或推进

不再有后台任务阻塞，不再有 `TaskOutput` 阻塞，也不再有轮询脚本。

### 关键删除：`wait-for-feedback.sh`

直接删除。它原本的作用是桥接“server 将事件打印到 stdout”和“Claude 需要接收这些事件”。现在 `.events` 文件取而代之：server 直接把交互事件写到文件，Claude 在下一轮读取即可。

### 关键新增：`.events` 文件（按 screen 保存事件流）

Server 会把所有用户交互事件写入 `$SCREEN_DIR/.events`，每行一个 JSON 对象。这样 Claude 拿到的是完整交互轨迹，而不只是最终选择。

例如：

```jsonl
{"type":"click","choice":"a","text":"Option A - Preset-First Wizard","timestamp":1706000101}
{"type":"click","choice":"c","text":"Option C - Manual Config","timestamp":1706000108}
{"type":"click","choice":"b","text":"Option B - Hybrid Approach","timestamp":1706000115}
```

- 在同一个 screen 内按追加方式写入
- 当检测到新的 HTML 文件时，`.events` 会被清空（删除）
- 若文件不存在，说明用户未在浏览器中交互
- 文件只记录用户交互事件，不记录 server 生命周期事件
- Claude 既可以读完整事件流，也可以只看最后一个 `choice`

## 按文件的改动

### `index.js`（server）

**A. 把用户事件写入 `.events` 文件。**  
在 WebSocket `message` handler 中，日志打印后追加一行 JSON 到 `$SCREEN_DIR/.events`。只写用户交互事件，不写 server 生命周期事件。

**B. 新 screen 到来时清空 `.events`。**  
在 chokidar 的 `add` handler 中，如果检测到新的 `.html` 文件，就删除旧的 `.events` 文件。

**C. 替换 `wrapInFrame` 的内容注入方式。**  
原本依赖 `<div class="feedback-footer">` 的正则锚点，但该 footer 已删除。改为在 `#claude-content` 中放置 `<!-- CONTENT -->` 注释占位符，然后使用 `frameTemplate.replace('<!-- CONTENT -->', content)` 注入内容。

### `frame-template.html`（UI 框架）

**删除：**
- `feedback-footer` div（textarea、Send 按钮、label、`.feedback-row`）
- 关联 CSS

**新增：**
- `<!-- CONTENT -->` 占位符
- 选择指示条：
  - 默认文案：`Click an option above, then return to the terminal`
  - 选择后文案：`Option B selected - return to terminal to continue`
- 对应 CSS

**保留不变：**
- 头部状态栏
- `.main` 包裹层和 `#claude-content`
- 组件 CSS
- 明暗主题变量与 media query

### `helper.js`（客户端脚本）

**删除：**
- `sendToClaude()`
- `window.send()`
- 表单提交处理
- 输入变化处理
- `pageshow` 监听

**保留：**
- WebSocket 连接与重连
- reload 处理
- `window.toggleSelect()`
- `window.selectedChoice`
- `window.brainstorm.send()` 和 `window.brainstorm.choice()`

**收窄：**
- 点击处理只捕获 `[data-choice]`

**新增：**
- 点击后更新选择指示条文本

### `visual-companion.md`（skill 说明）

重写 “The Loop” 章节，彻底改成非阻塞流程，删除下列内容：

- `wait-for-feedback.sh`
- `TaskOutput` 阻塞
- 600 秒超时 / 30 分钟上限
- `send-to-claude` JSON 格式说明

改为：

- 写 HTML → 结束当前回合 → 用户在终端回复 → 读取 `.events` → 迭代
- 明确终端是主反馈通道，`.events` 是辅助的结构化交互数据

### `wait-for-feedback.sh`

**直接删除。**

### `tests/brainstorm-server/server.test.js`

需要更新：
- 原先断言 fragment 响应中存在 `feedback-footer`，改为断言存在 indicator bar 或 `<!-- CONTENT -->` 被替换
- 原先断言 `helper.js` 含有 `send`，改为新 API
- 原先断言 `sendToClaude` 的 CSS 支持，删除

## 平台兼容性

Server 代码（`index.js`、`helper.js`、`frame-template.html`）本身是平台无关的，只依赖 Node.js 和浏览器 JavaScript，不依赖 Claude Code 专属能力。

真正的平台适配层在 `visual-companion.md`。各平台用自己的工具来启动 server、读取 `.events`。由于不再依赖阻塞式原语，这套非阻塞模型天然更适合跨平台。

## 这次改动带来的能力

- **TUI 始终保持可响应**
- **混合输入**：浏览器点击 + 终端文字，能自然合并
- **优雅降级**：浏览器没打开也不影响终端流程
- **架构更简单**：无后台阻塞、无轮询、无超时管理
- **跨平台**：Claude Code、Codex 以及未来平台都可共用

## 这次改动舍弃的东西

- **纯浏览器反馈流**：用户仍需要回到终端继续
- **浏览器内联文本输入**：移除了 textarea，文字反馈都走终端
- **点击 Send 后立即得到 Claude 回复**：现在会有一个切回终端的间隙，但通常只是几秒，而且用户还能在终端补充上下文