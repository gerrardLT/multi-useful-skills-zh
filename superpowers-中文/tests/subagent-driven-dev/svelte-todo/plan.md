# Svelte Todo List - 实施计划

使用 `superpowers:subagent-driven-development` skill 执行本计划。

## 背景

要用 Svelte 构建一个待办列表应用。完整规格见 `design.md`。

## 任务

### Task 1: 项目初始化

用 Vite 创建 Svelte 项目。

**Do:**
- 运行 `npm create vite@latest . -- --template svelte-ts`
- 用 `npm install` 安装依赖
- 验证 dev server 可正常运行
- 清理 App.svelte 中 Vite 默认模板内容

**Verify:**
- `npm run dev` 能启动服务
- 应用显示最小化的 `"Svelte Todos"` 标题
- `npm run build` 成功

---

### Task 2: Todo Store

创建用于 todo 状态管理的 Svelte store。

**Do:**
- 创建 `src/lib/store.ts`
- 定义包含 id、text、completed 的 `Todo` interface
- 创建初始为空数组的 writable store
- 导出函数：`addTodo(text)`、`toggleTodo(id)`、`deleteTodo(id)`、`clearCompleted()`
- 创建 `src/lib/store.test.ts`，为每个函数编写测试

**Verify:**
- 测试通过：`npm run test`（如有需要先安装 vitest）

---

### Task 3: localStorage 持久化

为 todos 增加持久化层。

**Do:**
- 创建 `src/lib/storage.ts`
- 实现 `loadTodos(): Todo[]` 和 `saveTodos(todos: Todo[])`
- 优雅处理 JSON 解析错误，解析失败时返回空数组
- 接入 store：初始化时加载，变更时保存
- 为加载 / 保存 / 错误处理编写测试

**Verify:**
- 测试通过
- 手动验证：添加 todo，刷新页面后仍然存在

---

### Task 4: TodoInput 组件

创建用于添加 todo 的输入组件。

**Do:**
- 创建 `src/lib/TodoInput.svelte`
- 文本输入框绑定本地状态
- Add 按钮调用 `addTodo()` 后清空输入框
- 按 Enter 也能提交
- 输入为空时禁用 Add 按钮
- 添加组件测试

**Verify:**
- 测试通过
- 组件能渲染输入框和按钮

---

### Task 5: TodoItem 组件

创建单条 todo 组件。

**Do:**
- 创建 `src/lib/TodoItem.svelte`
- Props：`todo: Todo`
- Checkbox 切换完成状态，调用 `toggleTodo`
- 已完成的文本显示删除线
- Delete 按钮（X）调用 `deleteTodo`
- 添加组件测试

**Verify:**
- 测试通过
- 组件能渲染 checkbox、文本和删除按钮

---

### Task 6: TodoList 组件

创建列表容器组件。

**Do:**
- 创建 `src/lib/TodoList.svelte`
- Props：`todos: Todo[]`
- 为每条 todo 渲染 TodoItem
- 空列表时显示 `"No todos yet"`
- 添加组件测试

**Verify:**
- 测试通过
- 组件能渲染 TodoItem 列表

---

### Task 7: FilterBar 组件

创建筛选栏和状态栏组件。

**Do:**
- 创建 `src/lib/FilterBar.svelte`
- Props：`todos: Todo[]`、`filter: Filter`、`onFilterChange: (f: Filter) => void`
- 显示数量：`"X items left"`，即未完成数量
- 提供三个筛选按钮：All、Active、Completed
- 当前激活的筛选按钮需要有视觉高亮
- 添加 `"Clear completed"` 按钮；当没有已完成项时隐藏
- 添加组件测试

**Verify:**
- 测试通过
- 组件能渲染计数、筛选按钮和清空按钮

---

### Task 8: App 集成

在 App.svelte 中把所有组件接起来。

**Do:**
- 导入所有组件和 store
- 添加筛选状态，默认值为 `'all'`
- 根据筛选状态计算过滤后的 todos
- 渲染：标题、TodoInput、TodoList、FilterBar
- 给各组件传入合适的 props

**Verify:**
- App 能渲染所有组件
- 添加 todo 能正常工作
- 切换完成状态能正常工作
- 删除功能能正常工作

---

### Task 9: 筛选功能

确保筛选逻辑端到端可用。

**Do:**
- 验证筛选按钮会正确改变显示内容
- `'all'` 显示全部 todos
- `'active'` 只显示未完成 todos
- `'completed'` 只显示已完成 todos
- Clear completed 会删除所有已完成项，并在需要时重置筛选状态
- 增加集成测试

**Verify:**
- 筛选测试通过
- 手动验证所有筛选状态

---

### Task 10: 样式与打磨

为可用性补充 CSS 样式。

**Do:**
- 让应用样式贴近设计稿
- 已完成 todo 显示删除线和更浅的颜色
- 当前激活的筛选按钮高亮
- 输入框有 focus 样式
- 删除按钮在 hover 时出现，或在移动端始终可见
- 兼容响应式布局

**Verify:**
- 应用在视觉上可用
- 样式不会破坏功能

---

### Task 11: 端到端测试

用 Playwright 补全完整用户流程测试。

**Do:**
- 安装 Playwright：`npm init playwright@latest`
- 创建 `tests/todo.spec.ts`
- 测试以下流程：
  - 添加 todo
  - 完成 todo
  - 删除 todo
  - 筛选 todos
  - 清空已完成
  - 持久化（新增、刷新、验证）

**Verify:**
- `npx playwright test` 通过

---

### Task 12: README

完善项目文档。

**Do:**
- 创建 `README.md`，包含：
  - 项目说明
  - 安装：`npm install`
  - 开发：`npm run dev`
  - 测试：`npm test` 和 `npx playwright test`
  - 构建：`npm run build`

**Verify:**
- README 描述准确
- 里面的说明命令可实际工作
