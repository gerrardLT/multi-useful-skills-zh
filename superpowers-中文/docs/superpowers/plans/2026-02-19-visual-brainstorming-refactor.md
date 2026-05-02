# 可视化头脑风暴重构实现计划

> **面向代理 worker：** 必须使用 `superpowers:subagent-driven-development`（若可用子代理）或 `superpowers:executing-plans` 来实现本计划。步骤使用 checkbox（`- [ ]`）语法跟踪。

**目标：** 将可视化头脑风暴从阻塞式 TUI 反馈模型重构为非阻塞的“浏览器展示，终端对话”架构。

**架构：** 浏览器成为交互式展示层；终端仍是对话通道。Server 将用户事件写入每个 screen 对应的 `.events` 文件，Claude 在下一轮读取它。这样可以彻底移除 `wait-for-feedback.sh` 和所有 `TaskOutput` 阻塞逻辑。

**技术栈：** Node.js（Express、ws、chokidar）、原生 HTML/CSS/JS

**Spec：** `docs/superpowers/specs/2026-02-19-visual-brainstorming-refactor-design.md`

---

## 文件映射

| 文件 | 动作 | 职责 |
|------|------|------|
| `lib/brainstorm-server/index.js` | 修改 | Server：加入 `.events` 文件写入、新 screen 时清空、替换 `wrapInFrame` |
| `lib/brainstorm-server/frame-template.html` | 修改 | 模板：移除 feedback footer，加入内容占位符与选择指示条 |
| `lib/brainstorm-server/helper.js` | 修改 | 客户端 JS：移除 send/feedback 流程，仅保留点击捕获与指示条更新 |
| `lib/brainstorm-server/wait-for-feedback.sh` | 删除 | 不再需要 |
| `skills/brainstorming/visual-companion.md` | 修改 | Skill 说明：改写为非阻塞流程 |
| `tests/brainstorm-server/server.test.js` | 修改 | 测试：适配新模板结构和 helper.js API |

---

## Chunk 1：Server、模板、客户端、测试、Skill

### 任务 1：更新 `frame-template.html`

**文件：**
- 修改：`lib/brainstorm-server/frame-template.html`

- [ ] **步骤 1：删除反馈 footer 的 HTML**

将 `feedback-footer` div 替换为选择指示条：

```html
  <div class="indicator-bar">
    <span id="indicator-text">Click an option above, then return to the terminal</span>
  </div>
```

同时将 `#claude-content` 默认内容替换为：

```html
    <div id="claude-content">
      <!-- CONTENT -->
    </div>
```

- [ ] **步骤 2：用 indicator bar CSS 替换 feedback footer CSS**

移除 `.feedback-footer`、`.feedback-row` 及其中 textarea/button 的样式，改为：

```css
    .indicator-bar {
      background: var(--bg-secondary);
      border-top: 1px solid var(--border);
      padding: 0.5rem 1.5rem;
      flex-shrink: 0;
      text-align: center;
    }
    .indicator-bar span {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .indicator-bar .selected-text {
      color: var(--accent);
      font-weight: 500;
    }
```

- [ ] **步骤 3：验证模板可正常渲染**

运行测试套件：
```bash
cd /Users/drewritter/prime-rad/superpowers && node tests/brainstorm-server/server.test.js
```

- [ ] **步骤 4：提交**

```bash
git add lib/brainstorm-server/frame-template.html
git commit -m "Replace feedback footer with selection indicator bar in brainstorm template"
```

---

### 任务 2：更新 `index.js`，加入内容注入与 `.events` 文件

**文件：**
- 修改：`lib/brainstorm-server/index.js`

- [ ] **步骤 1：首先编写针对 `.events` 文件写入功能的失败测试**
- [ ] **步骤 2：运行测试，确认测试首先失败**
- [ ] **步骤 3：接着编写针对“新 screen 时清空 `.events`”功能的失败测试**
- [ ] **步骤 4：再次运行测试，确认失败**

- [ ] **步骤 5：在 `index.js` 中实现 `.events` 写入**

在 WebSocket `message` handler 中，在 `console.log` 之后追加：

```javascript
    if (event.choice) {
      const eventsFile = path.join(SCREEN_DIR, '.events');
      fs.appendFileSync(eventsFile, JSON.stringify(event) + '\n');
    }
```

在 chokidar `add` handler 中加入 `.events` 清理：

```javascript
    if (filePath.endsWith('.html')) {
      const eventsFile = path.join(SCREEN_DIR, '.events');
      if (fs.existsSync(eventsFile)) fs.unlinkSync(eventsFile);

      console.log(JSON.stringify({ type: 'screen-added', file: filePath }));
    }
```

- [ ] **步骤 6：将 `wrapInFrame` 改为基于注释占位符的注入**

```javascript
function wrapInFrame(content) {
  return frameTemplate.replace('<!-- CONTENT -->', content);
}
```

- [ ] **步骤 7：运行全部测试**
- [ ] **步骤 8：提交**

```bash
git add lib/brainstorm-server/index.js tests/brainstorm-server/server.test.js
git commit -m "Add .events file writing and comment-based content injection to brainstorm server"
```

---

### 任务 3：精简 `helper.js`

**文件：**
- 修改：`lib/brainstorm-server/helper.js`

- [ ] **步骤 1：删除 `sendToClaude` 函数**
- [ ] **步骤 2：删除 `window.send`**
- [ ] **步骤 3：删除表单提交和输入变化处理**
- [ ] **步骤 4：删除 `pageshow` 事件监听**

- [ ] **步骤 5：将点击处理收窄到 `[data-choice]`**

```javascript
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-choice]');
    if (!target) return;

    sendEvent({
      type: 'click',
      text: target.textContent.trim(),
      choice: target.dataset.choice,
      id: target.id || null
    });
  });
```

- [ ] **步骤 6：点击后更新 indicator bar**

```javascript
    const indicator = document.getElementById('indicator-text');
    if (indicator) {
      const label = target.querySelector('h3, .content h3, .card-body h3')?.textContent?.trim() || target.dataset.choice;
      indicator.innerHTML = '<span class="selected-text">' + label + ' selected</span> - return to terminal to continue';
    }
```

- [ ] **步骤 7：从 `window.brainstorm` API 中移除 `sendToClaude`**

```javascript
  window.brainstorm = {
    send: sendEvent,
    choice: (value, metadata = {}) => sendEvent({ type: 'choice', value, ...metadata })
  };
```

- [ ] **步骤 8：运行测试**
- [ ] **步骤 9：提交**

```bash
git add lib/brainstorm-server/helper.js
git commit -m "Simplify helper.js: remove feedback functions, narrow to choice capture + indicator"
```

---

### 任务 4：更新测试以适配新结构

**文件：**
- 修改：`tests/brainstorm-server/server.test.js`

- [ ] **步骤 1：更新完整文档断言**
- [ ] **步骤 2：更新 fragment wrapping 断言**
- [ ] **步骤 3：更新 helper.js API 断言**
- [ ] **步骤 4：将旧的 sendToClaude 测试替换为 indicator bar 测试**
- [ ] **步骤 5：运行完整测试套件**
- [ ] **步骤 6：提交**

```bash
git add tests/brainstorm-server/server.test.js
git commit -m "Update brainstorm server tests for new template structure and helper.js API"
```

---

### 任务 5：删除 `wait-for-feedback.sh`

**文件：**
- 删除：`lib/brainstorm-server/wait-for-feedback.sh`

- [ ] **步骤 1：先确认没有其他代码仍引用它**
- [ ] **步骤 2：删除该文件**
- [ ] **步骤 3：运行测试，确认没有破坏**
- [ ] **步骤 4：提交**

```bash
git add -u lib/brainstorm-server/wait-for-feedback.sh
git commit -m "Delete wait-for-feedback.sh: replaced by .events file"
```

---

### 任务 6：重写 `visual-companion.md`

**文件：**
- 修改：`skills/brainstorming/visual-companion.md`

- [ ] **步骤 1：更新 “How It Works” 描述**
- [ ] **步骤 2：更新 fragment 描述，移除 feedback footer 提法**

- [ ] **步骤 3：将 “The Loop” 整段替换为非阻塞流程**

新流程应为：
1. 将 HTML 写入 `screen_dir`
2. 告知用户前往浏览器查看，并在终端回复
3. 下一轮读取 `$SCREEN_DIR/.events`
4. 合并浏览器交互和终端文字
5. 迭代或推进

- [ ] **步骤 4：将 “User Feedback Format” 替换为 “Browser Events Format”**
- [ ] **步骤 5：更新 “Writing Content Fragments” 描述**
- [ ] **步骤 6：更新 Reference 部分**
- [ ] **步骤 7：提交**

```bash
git add skills/brainstorming/visual-companion.md
git commit -m "Rewrite visual-companion.md for non-blocking browser-displays-terminal-commands flow"
```

---

### 任务 7：最终验证

- [ ] **步骤 1：运行完整测试套件**
- [ ] **步骤 2：手工进行一次 smoke test**
- [ ] **步骤 3：确认代码库中没有残留旧引用**
- [ ] **步骤 4：如有需要，进行最终清理提交**