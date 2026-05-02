# OpenCode 支持实现计划

> **面向执行代理：** 推荐使用 `superpowers:executing-plans` 按任务逐步实现。

**目标：** 通过一个原生 JavaScript 插件，为 OpenCode.ai 增加完整的 superpowers 支持，并与现有 Codex 实现共享核心能力。

**架构：** 将通用的技能发现、frontmatter 解析、路径解析和更新检查逻辑抽取到 `lib/skills-core.js`；Codex 改为复用该模块；再基于 OpenCode 插件 API 实现工具与会话启动钩子。

**技术栈：** Node.js、JavaScript、OpenCode Plugin API、Git worktrees

---

## 阶段 1：抽出共享核心

### 任务 1：抽出 frontmatter 解析

**文件：**

- 创建: `lib/skills-core.js`
- 参考: `.codex/superpowers-codex`

- [ ] 编写 `extractFrontmatter(filePath)`，返回 `{ name, description }`
- [ ] 读取 `SKILL.md` 的 YAML frontmatter，仅解析 `name` 和 `description`
- [ ] 处理异常，读取失败时返回空字符串对象
- [ ] 运行 `node -c lib/skills-core.js`
- [ ] 提交

### 任务 2：抽出技能发现逻辑

**文件：**

- 修改: `lib/skills-core.js`

- [ ] 新增 `findSkillsInDir(dir, sourceType, maxDepth = 3)`
- [ ] 递归查找目录中的 `SKILL.md`
- [ ] 返回 `path`、`skillFile`、`name`、`description`、`sourceType`
- [ ] 运行 `node -c lib/skills-core.js`
- [ ] 提交

### 任务 3：抽出技能路径解析

**文件：**

- 修改: `lib/skills-core.js`

- [ ] 新增 `resolveSkillPath(skillName, superpowersDir, personalDir)`
- [ ] 支持 `superpowers:` 前缀
- [ ] 支持 personal 覆盖 superpowers
- [ ] 解析成功时返回 `skillFile`、`sourceType`、`skillPath`
- [ ] 运行 `node -c lib/skills-core.js`
- [ ] 提交

### 任务 4：抽出更新检查

**文件：**

- 修改: `lib/skills-core.js`

- [ ] 新增 `checkForUpdates(repoDir)`
- [ ] 使用 git 判断仓库是否落后于远端
- [ ] 失败时安全返回 `false`
- [ ] 运行 `node -c lib/skills-core.js`
- [ ] 提交

## 阶段 2：让 Codex 复用共享核心

### 任务 5：导入共享模块

**文件：**

- 修改: `.codex/superpowers-codex`

- [ ] 引入 `../lib/skills-core`
- [ ] 运行 `node -c .codex/superpowers-codex`
- [ ] 提交

### 任务 6：替换 `extractFrontmatter`

**文件：**

- 修改: `.codex/superpowers-codex`

- [ ] 删除本地 `extractFrontmatter` 实现
- [ ] 所有调用改为 `skillsCore.extractFrontmatter(...)`
- [ ] 运行 `.codex/superpowers-codex find-skills | head -20`
- [ ] 提交

### 任务 7：替换 `findSkillsInDir`

**文件：**

- 修改: `.codex/superpowers-codex`

- [ ] 删除本地 `findSkillsInDir`
- [ ] 所有调用改为 `skillsCore.findSkillsInDir(...)`
- [ ] 运行 `.codex/superpowers-codex find-skills | head -20`
- [ ] 提交

### 任务 8：替换 `checkForUpdates`

**文件：**

- 修改: `.codex/superpowers-codex`

- [ ] 删除本地 `checkForUpdates`
- [ ] 所有调用改为 `skillsCore.checkForUpdates(...)`
- [ ] 运行 `.codex/superpowers-codex bootstrap | head -50`
- [ ] 提交

## 阶段 3：实现 OpenCode 插件

### 任务 9：创建插件骨架

**文件：**

- 创建: `.opencode/plugin/superpowers.js`

- [ ] 创建插件目录
- [ ] 导入 `skillsCore`、`path`、`fs`、`os`
- [ ] 计算 superpowers 与 personal 技能目录
- [ ] 导出基础插件函数
- [ ] 运行 `node -c .opencode/plugin/superpowers.js`
- [ ] 提交

### 任务 10：实现 `use_skill`

**文件：**

- 修改: `.opencode/plugin/superpowers.js`

- [ ] 添加 `use_skill` 工具
- [ ] 通过 `resolveSkillPath` 定位技能
- [ ] 读取完整文件并去除 frontmatter
- [ ] 返回技能名称、描述、正文和目录路径
- [ ] 运行 `node -c .opencode/plugin/superpowers.js`
- [ ] 提交

### 任务 11：实现 `find_skills`

**文件：**

- 修改: `.opencode/plugin/superpowers.js`

- [ ] 添加 `find_skills` 工具
- [ ] 汇总 superpowers 与 personal 技能
- [ ] 输出名称、描述、目录路径
- [ ] 运行 `node -c .opencode/plugin/superpowers.js`
- [ ] 提交

### 任务 12：实现 `session.started` 钩子

**文件：**

- 修改: `.opencode/plugin/superpowers.js`

- [ ] 在会话启动时注入 `using-superpowers` 内容
- [ ] 提供 OpenCode 工具映射说明
- [ ] 检查 superpowers 仓库是否有更新
- [ ] 运行 `node -c .opencode/plugin/superpowers.js`
- [ ] 提交

## 阶段 4：补全文档

### 任务 13：创建 OpenCode 安装指南

**文件：**

- 创建: `.opencode/INSTALL.md`

- [ ] 编写安装前置条件
- [ ] 编写克隆 superpowers 的安装步骤
- [ ] 编写插件启用方式
- [ ] 运行 `Get-Content .opencode/INSTALL.md | Select-Object -First 20`
- [ ] 提交

### 任务 14：更新主 README

**文件：**

- 修改: `README.md`

- [ ] 新增 OpenCode 平台章节
- [ ] 说明安装入口在 `.opencode/INSTALL.md`
- [ ] 列出 `use_skill`、`find_skills`、自动 bootstrap 等能力
- [ ] 验证 README 章节格式
- [ ] 提交

### 任务 15：更新发布说明

**文件：**

- 修改: `RELEASE-NOTES.md`

- [ ] 在顶部未发布区域加入 OpenCode 支持
- [ ] 记录共享模块抽取
- [ ] 验证前 30 行格式
- [ ] 提交

## 阶段 5：最终验证

### 任务 16：验证 Codex 侧功能

**文件：**

- 测试: `.codex/superpowers-codex`

- [ ] 运行 `find-skills`
- [ ] 运行 `use-skill superpowers:brainstorming`
- [ ] 运行 `bootstrap`

### 任务 17：验证文件结构

- [ ] 确认 `lib/skills-core.js` 存在
- [ ] 确认 `.opencode/plugin/superpowers.js` 存在
- [ ] 确认 `.opencode/INSTALL.md` 存在
- [ ] 确认 `.opencode/` 目录结构正确

### 任务 18：最终总结

- [ ] 汇总新建文件
- [ ] 汇总修改文件
- [ ] 汇总已运行的验证命令
- [ ] 说明当前状态是否已可进入真实 OpenCode 环境验证

## 手工测试指南

1.  按 `.opencode/INSTALL.md` 安装
2.  启动 OpenCode 会话，确认 bootstrap 生效
3.  测试 `find_skills`
4.  测试 `use_skill`
5.  验证技能目录与辅助文件可访问
6.  创建 personal 技能，确认可覆盖 core 技能
7.  验证工具映射是否符合预期

## 成功标准

- [ ] `lib/skills-core.js` 已创建并包含核心函数
- [ ] Codex 已改为使用共享核心
- [ ] Codex 命令仍可用
- [ ] OpenCode 插件已创建并包含工具与钩子
- [ ] 安装指南已补齐
- [ ] README 与发布说明已更新