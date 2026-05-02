# 计划：用户仪表板页面

## 语境
我们正在 `/dashboard` 发送一个新的用户仪表板，显示最近的活动，
通知面板和快速操作按钮。用户登录后登陆此处。

## 用户界面范围
- 新的 React 页面组件 `UserDashboard.tsx` 位于 `src/pages/`
- 三个新的子组件：`ActivityFeed`、`NotificationsPanel`、`QuickActions`
- 用于布局的 Tailwind CSS，移动优先响应（断点：sm/md/lg）
- 每个面板的空状态、加载骨架、错误状态
- 每个交互元素上的悬停状态+焦点可见轮廓
- 通知面板上“将全部标记为已读”的模式对话框
- 动作反馈的Toast通知系统

## 后端
- 新的 REST 端点 `GET /api/dashboard` 返回 `{ activity, notifications, quickActions }`
- 由现有 PostgreSQL 表支持；没有架构更改

## 超出范围
- 黑暗模式（单独计划）
- 个性化/定制（单独计划）
