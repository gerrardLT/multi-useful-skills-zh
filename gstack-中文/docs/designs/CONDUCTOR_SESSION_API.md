# Conductor 会话流 API 提案

## 问题

当 Claude 通过 CDP (gstack `$B connect`) 控制你的真实浏览器时，你会看到两个窗口：**Conductor**（查看 Claude 的思考过程）和 **Chrome**（查看 Claude 的操作）。

gstack 的 Chrome 扩展侧面板会显示浏览活动——每个命令、结果和错误。但对于*完整*的会话镜像（Claude 的思考、工具调用、代码编辑），侧面板需要 Conductor 来公开对话流。

## 这可以实现什么

gstack Chrome 扩展侧面板中的“会话”选项卡将显示：
- Claude 的思考/内容（出于性能考虑会截断）
- 工具调用名称+图标（编辑、Bash、阅读等）
- 通过成本估算显示 token 使用量
- 随着对话的进展实时更新

用户可以在一处看到所有内容——Claude 在浏览器中的操作 + Claude 在侧面板中的思考过程——无需切换窗口。

## 提议的 API

### __代码_0__

服务器发送事件端点，将 Claude Code 的对话重新发出为 NDJSON 事件。

**事件类型**（重用 Claude Code 的 `--output-format stream-json` 格式）：

```
event: assistant
data: {"type":"assistant","content":"Let me check that page...","truncated":true}

event: tool_use
data: {"type":"tool_use","name":"Bash","input":"$B snapshot","truncated_input":true}

event: tool_result
data: {"type":"tool_result","name":"Bash","output":"[snapshot output...]","truncated_output":true}

event: turn_complete
data: {"type":"turn_complete","input_tokens":1234,"output_tokens":567,"cost_usd":0.02}
```

**内容截断：** 工具输入/输出流中的字符上限为 500 个。完整数据保留在 Conductor 的 UI 中。侧面板是一个摘要视图，而非替代视图。

### __代码_0__

列出活动工作区的发现端点。

```json
{
  "workspaces": [
    {
      "id": "abc123",
      "name": "gstack",
      "branch": "garrytan/chrome-extension-ctrl",
      "directory": "/Users/garry/gstack",
      "pid": 12345,
      "active": true
    }
  ]
}
```

Chrome 扩展程序通过匹配浏览服务器的 git 仓库（来自 `/health` 响应）到工作区的目录或名称，来自动选择工作区。

## 安全

- **仅限本地主机。** 与 Claude Code 自身的调试输出采用相同的信任模型。
- **不需要身份验证。** 如果 Conductor 需要身份验证，请在列出工作区的扩展传递 SSE 请求中进行。
- **内容截断**是一项隐私功能——长代码输出、文件内容和敏感工具结果永远不会离开 Conductor 的完整 UI。

## gstack 构建了什么（扩展端）

已在侧面板“会话”选项卡中搭建起来（当前显示占位符）。

当 Conductor 的 API 可用时：
1. 侧面板通过端口探测或手动输入发现 Conductor
2. 获取 `/api/workspaces`，匹配浏览服务器的仓库
3. 打开 `EventSource` 到 `/workspace/{id}/session/stream`
4. 渲染：助手消息、工具名称+图标、对话轮次边界、成本
5. 优雅降级：“连接 Conductor 以获取完整会话视图”

预计工作量：`sidepanel.js` 中约 200 行代码。

## Conductor 构建了什么（服务器端）

1. 每个工作区重新发出 Claude Code 的 Stream-json 的 SSE 端点
2. 带有活动工作区列表的 `/api/workspaces` 发现端点
3. 内容截断（工具输入/输出 500 个字符上限）

预计工作量：如果 Conductor 已经在内部捕获了 Claude Code 流（为其自身 UI 渲染所做的），则约为 100-200 行代码。

## 设计决策

| 决定 | 选择 | 基本原理 |
|----------|--------|-----------|
| 传输 | SSE（不是 WebSocket） | 单向，自动重连，更简单 |
| 格式 | Claude 的 stream-json | Conductor 已经解析了这个；没有新的模式 |
| 发现 | HTTP 端点（不是文件） | Chrome 扩展程序无法读取文件系统 |
| 授权 | 无（本地主机） | 与浏览服务器、CDP 端口、Claude Code 相同 |
| 截断 | 500 个字符 | 侧面板宽约 300 像素；过长内容无用 |