# Chrome 与 Chromium：为什么我们使用 Playwright 的捆绑 Chromium

## 最初的愿景

当我们构建 `$B connect` 时，计划是连接到用户的**真正的 Chrome 浏览器** — 一个带有 cookie、会话、扩展程序和已打开标签页的浏览器。不再需要导入 cookie。该设计需要：

1. `chromium.connectOverCDP(wsUrl)` 通过 CDP 连接到正在运行的 Chrome
2. 优雅退出 Chrome，使用 `--remote-debugging-port=9222` 重新启动
3. 访问用户的真实浏览上下文

这就是 `chrome-launcher.ts` 存在的原因（它包含浏览器二进制发现、CDP 端口探测和运行时检测的 361 行代码），也是该方法被称为 `connectCDP()` 的原因。

## 实际发生了什么

真正的 Chrome 在通过 Playwright 的 `channel: 'chrome'` 启动时会静默阻止 `--load-extension`。扩展程序无法加载。而我们需要侧面板的扩展（活动提要、参考、聊天）。

使用 Playwright 捆绑的 Chromium，实现又回到了 `chromium.launchPersistentContext()` — 它通过 `--load-extension` 和 `--disable-extensions-except` 可靠地加载扩展。但命名保持不变：`connectCDP()`、`connectionMode: 'cdp'`、`BROWSE_CDP_URL`、`chrome-launcher.ts`。

最初的愿景（访问用户的真实浏览器状态）从未实现。我们每次都会启动一个新的浏览器——功能与 Playwright 的 Chromium 相同，但伴随着 361 行死代码和误导性的名称。

## 发现 (2026-03-22)

在 `/office-hours` 设计会议期间，我们追踪架构并发现：

1. `connectCDP()` 并不使用 CDP — 它调用的是 `launchPersistentContext()`
2. `connectionMode: 'cdp'` 具有误导性——它实际上只是“有头模式”
3. `chrome-launcher.ts` 是死代码 - 它唯一的导入是在一个无法访问的 `attemptReconnect()` 方法中
4. `preExistingTabIds` 旨在保护我们从未连接过的真实 Chrome 标签页
5. `$B handoff`（无头 → 有头）使用了无法加载扩展的不同 API (`launch()` + `newContext()`)，从而创建了两种不同的“有头”体验

## 修复方法

### 重命名
- __代码_0__ → __代码_1__
- __代码_0__ → __代码_1__
- __代码_0__ → __代码_1__

### 已删除
- `chrome-launcher.ts` (361 行代码)
- `attemptReconnect()`（死方法）
- `preExistingTabIds`（死概念）
- `reconnecting` 字段（死状态）
- `cdp-connect.test.ts`（测试已删除代码的测试）

### 融合
- `$B handoff` 现在使用 `launchPersistentContext()` + 扩展加载（与 `$B connect` 相同）
- 单一的有头模式，而不是两种有头模式
- Handoff 现在免费为您提供扩展 + 侧面板

### 门控
- `--chat` 标志控制侧边栏聊天功能
- `$B connect`（默认）：仅限活动提要 + 参考
- `$B connect --chat`: + 实验性独立聊天代理

## 架构（之后）

```
浏览器状态：
  无头 (默认) ←→ 有头 ($B connect 或 $B handoff)
     Playwright            Playwright (相同引擎)
     launch()              launchPersistentContext()
     不可见                可见 + 扩展 + 侧面板

侧边栏 (正交附加组件，仅限有头模式)：
  活动标签页    — 始终开启，显示实时浏览命令
  参考标签页    — 始终开启，显示 @ref 覆盖层
  聊天标签页    — 通过 --chat 选择加入，实验性独立代理

数据桥 (侧边栏 → 工作区)：
  侧边栏写入 .context/sidebar-inbox/*.json
  工作区通过 $B inbox 读取
```

## 为什么不是真正的 Chrome？

真正的 Chrome 在由 Playwright 启动时会阻止 `--load-extension`。这是 Chrome 的一项安全功能——通过命令行参数加载的扩展程序在基于 Chromium 的浏览器中受到限制，以防止恶意扩展程序注入。

Playwright 的捆绑 Chromium 没有此限制，因为它是为测试和自动化而设计的。 `ignoreDefaultArgs` 选项让我们可以绕过 Playwright 自己的扩展阻止标志。

如果我们想访问用户真实的 cookie/会话，路径是：
1. Cookie 导入（已通过 `$B cookie-import` 工作）
2. Conductor 会话注入（未来 — 侧边栏向工作区代理发送消息）

无法重新连接到真正的 Chrome。