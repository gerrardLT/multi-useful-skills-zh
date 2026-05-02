# v0.6 发布公告（2026 年 3 月 6 日）- 导航 + Commands

## 帖子元数据

- **帖子标题:** Product Manager Skills v0.6 - Faster Navigation + Command Workflows
- **帖子副标题:** 借助 Start Here、command wrappers、自动生成 catalog 和全库验证，更快使用 PM skills。
- **开头（前 160 字符）:** v0.6 增加了 command layer 和自动生成 catalog，让 PM 团队更快找到并运行正确 workflow，同时继续把 skills 保持为 source of truth。
- **主要链接:** [Product Manager Skills repo](https://github.com/deanpeters/Product-Manager-Skills)

---

## 短版宣传帖

v0.6 重点在易用性和速度。

本次交付：
- `START_HERE.md`，用于 60 秒 onboarding
- 新的 `commands/` 层，用于可复用的多-skill workflows
- `catalog/` 中的自动生成导航目录
- 新辅助脚本：`run-pm.sh`、`find-a-command.sh`、`test-library.sh`、`generate-catalog.py`
- Command metadata 校验（`check-command-metadata.py`）

Skills 依然是核心产品。
Commands 只是现有 skills 之上的 orchestration wrappers。

发布地址：[Product Manager Skills v0.6](https://github.com/deanpeters/Product-Manager-Skills)

---

## 长文草稿

### 标题
Product Manager Skills v0.6: Navigation and Command Workflows

### 副标题
我们如何让一个 46-skill 的库在不稀释技能质量的前提下，变得更快更好用

### 正文

v0.6 在现有 PM skill library 之上，加入了一个务实的 command layer 和 navigation system。

核心原则没有变化：
- Skills 仍然是教学价值和框架深度的 source of truth。
- Commands 是轻量 wrapper，用来围绕常见目标编排多个 skills。

本次改动包括：

1. **60 秒 onboarding 路径**
   - 新增 `START_HERE.md`，提供三条实际入口：
     - 我需要一个 artifact
     - 我需要帮助做判断
     - 我需要端到端引导

2. **可复用 command workflows**
   - 新增 `commands/`，包含高价值流程：
     - `discover`
     - `strategy`
     - `write-prd`
     - `plan-roadmap`
     - `prioritize`
     - `leadership-transition`

3. **自动生成导航 catalog**
   - 在 `catalog/` 下增加了给机器和人都能浏览的索引
   - 可随时用 `python3 scripts/generate-catalog.py` 重新生成

4. **验证与执行工具**
   - `check-command-metadata.py` 用于校验 command frontmatter 和 skill 引用
   - `test-library.sh` 用于校验整个库的完整表面
   - `run-pm.sh` 提供一条命令式的本地执行支架

这个版本的目标是为规模化做好准备：当技能库超过 60 个 skill 时，导航速度和执行速度应该继续提升，而不是退化。