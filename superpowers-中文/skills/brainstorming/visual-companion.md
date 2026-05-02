# Visual Companion 使用指南

这是一个基于浏览器的可视化头脑风暴伴侣，用于展示模型、图表和备选方案。

## 何时使用

根据**每个问题**来判断，而不是按整场会话判断。标准只有一个：**用户通过“看到它”是否比“阅读文字”更容易理解？**

**当内容本身就是视觉性的时，使用浏览器：**

- **UI 模型** - 线框图、布局、导航结构、组件设计
- **架构图** - 系统组件、数据流、关系图
- **并排视觉对比** - 对比两个布局、两个配色、两个设计方向
- **设计打磨** - 当问题聚焦在外观、留白、视觉层级时
- **空间关系** - 状态机、流程图、实体关系图等

**当内容本质上是文字或表格时，使用终端：**

- **需求和范围问题** - 比如 “X 是什么意思？”、“哪些功能在范围内？”
- **概念型 A/B/C 选择** - 几种方案都能用文字说清楚
- **权衡清单** - 优缺点、对比表
- **技术决策** - API 设计、数据建模、架构路线选择
- **澄清问题** - 任何答案本质上是语言，而不是视觉偏好的问题

一个问题是“关于 UI 的”，并不自动等于“它就是视觉问题”。  
例如 `"What kind of wizard do you want?"` 是概念问题，使用终端。  
而 `"Which of these wizard layouts feels right?"` 才是视觉问题，使用浏览器。

## 工作原理

服务器会监听一个目录里的 HTML 文件，并将最新文件展示到浏览器中。你将 HTML 内容写入 `screen_dir`，用户就在浏览器里看到它，并可以点击选择。所有选择都会被记录到 `state_dir/events`，供你在下一轮读取。

**内容片段 vs 完整 HTML 文档：** 如果你的 HTML 文件以 `<!DOCTYPE` 或 `<html` 开头，服务器就按原样提供（只会注入辅助脚本）。否则，服务器会自动将你的内容包裹在框架模板中，补上页眉、CSS 主题、选择指示器和所有交互基础设施。**默认情况下，优先编写内容片段。** 只有在你确实需要完全掌控页面时，才编写完整文档。

## 如何启动会话

```bash
# 启动带持久化的服务器（模型保存到项目目录）
scripts/start-server.sh --project-dir /path/to/project

# 返回: {"type":"server-started","port":52341,"url":"http://localhost:52341",
#           "screen_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/content",
#           "state_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/state"}
```

将返回中的 `screen_dir` 和 `state_dir` 保存下来，并告知用户打开此 URL。

**如果未获取到启动输出：** 服务器会将启动 JSON 写入 `$STATE_DIR/server-info`。如果你是将其放入后台启动，且未捕获标准输出，请读取此文件以获取 URL 和端口。使用 `--project-dir` 时，可以前往 `<project>/.superpowers/brainstorm/` 中查找对应的会话目录。

**注意：** 将项目根目录传递给 `--project-dir`，这样模型将保存在 `.superpowers/brainstorm/` 中，并且在服务器重启后仍然存在。如果不传递，文件将写入 `/tmp`，之后会被清理。同时提醒用户：如果项目中尚未处理，请记得将 `.superpowers/` 添加到 `.gitignore`。

## 不同平台上的启动方式

**Claude Code（macOS / Linux）：**
```bash
# 默认模式即可工作 - 脚本会自行将服务器置于后台
scripts/start-server.sh --project-dir /path/to/project
```

**Claude Code（Windows）：**
```bash
# Windows 会自动检测并使用前台模式，这会阻塞工具调用。
# 在 Bash 工具调用中使用 run_in_background: true，以便服务器在对话轮次间持续运行。
scripts/start-server.sh --project-dir /path/to/project
```
如果你是通过 Bash 工具调用，请设置 `run_in_background: true`。然后在下一轮读取 `$STATE_DIR/server-info`。

**Codex：**
```bash
# Codex 会回收后台进程。脚本会自动检测 CODEX_CI 并切换到前台模式。
# 正常运行即可 - 无需额外标志。
scripts/start-server.sh --project-dir /path/to/project
```

**Gemini CLI：**
```bash
# 使用 --foreground 并在你的 shell 工具调用中设置 is_background: true
# 以便进程在轮次间持续运行
scripts/start-server.sh --project-dir /path/to/project --foreground
```

**其他环境：** 服务器必须能在多轮对话之间持续存活。如果你的环境会回收脱离前台的进程，请改用 `--foreground`，并使用该平台自身的后台执行机制来启动。

如果浏览器中无法打开返回的 URL（这在远程/容器环境中很常见），请绑定到非回环地址：

```bash
scripts/start-server.sh \
  --project-dir /path/to/project \
  --host 0.0.0.0 \
  --url-host localhost
```

使用 `--url-host` 控制返回 JSON 中打印的主机名。

## 基本循环

1.  **确认服务器仍在运行**，然后向 `screen_dir` 写入一个新的 HTML 文件：
    *   每次写入前，先检查 `$STATE_DIR/server-info` 是否存在。如果不存在（或 `$STATE_DIR/server-stopped` 存在），说明服务器已关闭，需要先重新执行 `start-server.sh`。服务器在 30 分钟无活动后会自动退出。
    *   文件名使用语义化名称：`platform.html`、`visual-style.html`、`layout.html`
    *   **不要复用文件名**，每一屏都必须是新文件
    *   使用 Write 工具写文件，**不要使用 `cat` / heredoc**
    *   服务器会自动展示最新文件

2.  **告知用户接下来会看到什么，然后结束当前回合：**
    *   每一步都重新提醒 URL（不只是第一步）
    *   用一两句简短文字总结屏幕内容（例如 “正在展示主页的 3 种布局选项”）
    *   提醒他们在终端中回复：`"请查看并在终端中告诉我你的想法。如果愿意，可以点击选择一个选项。"`

3.  **下一轮** - 在用户通过终端回复之后：
    *   读取 `$STATE_DIR/events`（如果存在）- 其中包含浏览器交互事件的 JSON 行
    *   将这些结构化事件与用户的终端文字反馈综合起来
    *   终端回复仍然是主要反馈；`state_dir/events` 是补充的结构化交互轨迹

4.  **迭代或前进** - 如果反馈要求调整当前屏幕，就写一个新文件（例如 `layout-v2.html`）。只有当前问题确认后，才进入下一个问题。

5.  **在回到终端讨论时，主动清空旧画面** - 如果下一步不再需要浏览器（例如进入澄清问题或文字化权衡讨论），就推送一个等待屏幕：

    ```html
    <!-- 文件名: waiting.html (或 waiting-2.html 等) -->
    <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
      <p class="subtitle">正在终端中继续...</p>
    </div>
    ```

    这样用户就不会一直盯着已经过时的选择页面。当下一次又需要视觉问题时，再像往常一样推送新内容文件。

6.  如此循环，直到结束。

## 如何编写内容片段

默认只编写“页面内部内容”，外层框架模板会由服务器自动包裹（包括页眉、主题 CSS、选择指示器和交互基础设施）。

**最小示例：**

```html
<h2>哪种布局效果更好？</h2>
<p class="subtitle">请考虑可读性和视觉层次</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>单列布局</h3>
      <p>简洁、专注的阅读体验</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>双列布局</h3>
      <p>侧边栏导航配合主内容区</p>
    </div>
  </div>
</div>
```

就这么多。不需要 `<html>`、不需要 CSS、也不需要 `<script>` 标签。服务器都会自动补充。

## 可用的 CSS 类

框架模板已经预置好了下面这些 CSS 类：

### 选项（A/B/C 选择）

```html
<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>标题</h3>
      <p>描述</p>
    </div>
  </div>
</div>
```

**多选：** 在容器上添加 `data-multiselect`，即可允许用户多选。每次点击都会切换选中状态，顶部指示器会显示当前已选数量。

```html
<div class="options" data-multiselect>
  <!-- 相同的选项标记 - 用户可以选择/取消选择多个 -->
</div>
```

### 卡片（视觉设计卡片）

```html
<div class="cards">
  <div class="card" data-choice="design1" onclick="toggleSelect(this)">
    <div class="card-image"><!-- 模型内容 --></div>
    <div class="card-body">
      <h3>名称</h3>
      <p>描述</p>
    </div>
  </div>
</div>
```

### 模型容器

```html
<div class="mockup">
  <div class="mockup-header">预览：仪表板布局</div>
  <div class="mockup-body"><!-- 你的模型 HTML --></div>
</div>
```

### 分屏视图（左右并排）

```html
<div class="split">
  <div class="mockup"><!-- 左侧 --></div>
  <div class="mockup"><!-- 右侧 --></div>
</div>
```

### 优缺点

```html
<div class="pros-cons">
  <div class="pros"><h4>优点</h4><ul><li>好处</li></ul></div>
  <div class="cons"><h4>缺点</h4><ul><li>弊端</li></ul></div>
</div>
```

### 模拟元素（线框搭建块）

```html
<div class="mock-nav">Logo | 首页 | 关于 | 联系</div>
<div style="display: flex;">
  <div class="mock-sidebar">导航</div>
  <div class="mock-content">主内容区</div>
</div>
<button class="mock-button">操作按钮</button>
<input class="mock-input" placeholder="输入框">
<div class="placeholder">占位区域</div>
```

### 排版与章节

- `h2` - 页面标题
- `h3` - 分节标题
- `.subtitle` - 标题下方的补充说明
- `.section` - 带底部留白的内容块
- `.label` - 小写上角风格的标签文字

## 浏览器事件格式

当用户在浏览器中点击选项时，交互会被记录到 `$STATE_DIR/events` 中（每行一个 JSON 对象）。当你推送新屏幕时，这个文件会自动被清空。

```jsonl
{"type":"click","choice":"a","text":"选项 A - 简单布局","timestamp":1706000101}
{"type":"click","choice":"c","text":"选项 C - 复杂网格","timestamp":1706000108}
{"type":"click","choice":"b","text":"选项 B - 混合式","timestamp":1706000115}
```

完整的事件流能展示用户是如何探索选项的。他们可能会点击多个选项再做决定。通常最后一个 `choice` 是最终选择，但点击路径本身也能暴露犹豫点或偏好，值得追问。

如果 `$STATE_DIR/events` 不存在，说明用户没有在浏览器里交互，这时只依赖终端文字反馈即可。

## 设计建议

- **保真度要匹配问题本身** - 布局问题用线框图，抛光问题再上更精细的模型
- **每一页都明确告诉用户在回答什么** - 例如 “哪种布局感觉更专业？”，不要只写 “选一个”
- **在前进前先迭代当前页** - 如果反馈影响的是当前问题，就写新版本，不要急着切换主题
- **每一屏最多 2-4 个选项**
- **在合适时使用真实内容** - 例如摄影作品集就应放真实图片（例如 Unsplash）；纯占位符会掩盖真正的设计问题
- **模型保持简单** - 抓住布局和结构，不追求像素级精修

## 文件命名

- 使用语义化名称：`platform.html`、`visual-style.html`、`layout.html`
- 不要复用文件名，每一屏都必须是新的
- 多轮迭代时添加版本后缀：例如 `layout-v2.html`、`layout-v3.html`
- 服务器按修改时间展示最新文件

## 清理

```bash
scripts/stop-server.sh $SESSION_DIR
```

如果会话是用 `--project-dir` 启动的，模型文件会保留在 `.superpowers/brainstorm/` 中，方便后续参考。只有 `/tmp` 模式下的会话会在停止时被删除。

## 参考

- 框架模板（CSS 参考）：`scripts/frame-template.html`
- 辅助脚本（客户端）：`scripts/helper.js`