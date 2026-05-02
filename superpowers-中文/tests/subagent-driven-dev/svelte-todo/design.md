# Svelte Todo List - 设计

## 概览

一个用 Svelte 构建的简单待办列表应用。支持创建、完成、删除 todo，并使用 localStorage 持久化。

## 功能

- 新增 todo
- 将 todo 标记为完成 / 未完成
- 删除 todo
- 按以下条件筛选：All / Active / Completed
- 清空所有已完成 todo
- 持久化到 localStorage
- 显示剩余事项数量

## 用户界面

```text
+--------------------------------------------------+
| Svelte Todos                                     |
+--------------------------------------------------+
| [________________________] [Add]                 |
+--------------------------------------------------+
| [ ] Buy groceries                           [x]  |
| [x] Walk the dog                            [x]  |
| [ ] Write code                              [x]  |
+--------------------------------------------------+
| 2 items left                                     |
| [All] [Active] [Completed]  [Clear completed]    |
+--------------------------------------------------+
```

## 组件

```
src/
  App.svelte           # 主应用，状态管理
  lib/
    TodoInput.svelte   # 文本输入框 + Add 按钮
    TodoList.svelte    # 列表容器
    TodoItem.svelte    # 单条 todo，含 checkbox、文本、删除
    FilterBar.svelte   # 筛选按钮 + 清空已完成
    store.ts           # Svelte store，用于 todos
    storage.ts         # localStorage 持久化
```

## 数据模型

```typescript
interface Todo {
  id: string;        // UUID
  text: string;      // Todo 文本
  completed: boolean;
}

type Filter = 'all' | 'active' | 'completed';
```

## 验收标准

1. 可以输入内容后按 Enter 或点击 Add 来新增 todo
2. 可以点击 checkbox 切换 todo 完成状态
3. 可以点击 X 按钮删除 todo
4. 筛选按钮能显示正确的 todo 子集
5. `"X items left"` 能正确显示未完成 todo 数量
6. `"Clear completed"` 能删除所有已完成 todo
7. 刷新页面后 todos 仍然保留在 localStorage 中
8. 空状态会显示有帮助的提示信息
9. 所有测试通过
