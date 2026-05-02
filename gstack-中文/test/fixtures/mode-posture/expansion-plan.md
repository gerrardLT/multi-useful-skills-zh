# 计划：团队速度仪表板

## 语境

我们正在为工程经理构建一个仪表板来跟踪团队代码速度 - 每个工程师的提交、PR 周期时间、审核延迟、CI 通过率。数据已经存在于 GitHub 中；我们只是将其聚合以供经理的单一窗格视图使用。

## 变化

1. `src/dashboard/` 中的新 React 组件 `TeamVelocityDashboard`
2. REST API 端点 `GET /api/team/velocity?days=30` 返回聚合指标
3. 后台作业每 15 分钟将 GitHub 数据拉入 Postgres
4. 简单的过滤器 UI：团队、日期范围、指标

## 建筑学

- 前端：React + shadcn/ui
- 后端：Express + PostgreSQL
- 数据源：GitHub REST API（缓存15分钟）

## 开放式问题

- 我们应该支持每个团队多个存储库吗？
- 我们是否显示单个工程师的姓名或仅显示总体姓名？
