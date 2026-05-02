---
name: gstack-openclaw-retro
description: "每周工程复盘。分析提交历史、工作模式和代码质量指标，并持续保存历史与趋势。具备团队视角，可按个人贡献、值得表扬之处和改进机会分别分析。适用于用户要求进行每周复盘、回顾本周交付内容或工程复盘时。"
---

# 每周工程复盘

生成一份完整的工程复盘，分析提交历史、工作模式和代码质量指标。具备团队感知：先识别执行命令的用户是谁，再分析所有贡献者，并为每个人给出值得表扬之处和改进机会。

## 参数

- 默认：最近 7 天
- `24h`：最近 24 小时
- `14d`：最近 14 天
- `30d`：最近 30 天
- `compare`：将当前窗口与上一个同长度窗口进行对比

## 说明

解析参数以确定时间窗口。默认是 7 天。所有时间都必须按用户的 **本地时区** 报告。

**按午夜对齐的窗口：** 对按天计的窗口，要计算本地时区当天午夜的绝对起始时间。例如如果今天是 2026-03-18，窗口为 7 天，那么起始日期就是 2026-03-11。对 `git log` 查询使用 `--since="2026-03-11T00:00:00"`。按小时计的窗口则使用 `--since="N hours ago"`。

---

### 第 1 步：收集原始数据

首先，拉取 `origin` 并识别当前用户：

```bash
git fetch origin main --quiet
git config user.name
git config user.email
```

`git config user.name` 返回的名字就是 **“你”**，也就是正在阅读这份复盘的人。其他作者都视为队友。

把下面这些 git 命令 **全部执行** 一遍（它们彼此独立）：

```bash
# All commits with timestamps, subject, hash, author, files changed
git log origin/main --since="<window>" --format="%H|%aN|%ae|%ai|%s" --shortstat

# Per-commit test vs total LOC breakdown with author
git log origin/main --since="<window>" --format="COMMIT:%H|%aN" --numstat

# Commit timestamps for session detection and hourly distribution
git log origin/main --since="<window>" --format="%at|%aN|%ai|%s" | sort -n

# Files most frequently changed (hotspot analysis)
git log origin/main --since="<window>" --format="" --name-only | grep -v '^$' | sort | uniq -c | sort -rn

# PR numbers from commit messages
git log origin/main --since="<window>" --format="%s" | grep -oE '[#!][0-9]+' | sort -t'#' -k1 | uniq

# Per-author file hotspots
git log origin/main --since="<window>" --format="AUTHOR:%aN" --name-only

# Per-author commit counts
git shortlog origin/main --since="<window>" -sn --no-merges

# Test file count
find . -name '*.test.*' -o -name '*.spec.*' -o -name '*_test.*' -o -name '*_spec.*' 2>/dev/null | grep -v node_modules | wc -l

# Test files changed in window
git log origin/main --since="<window>" --format="" --name-only | grep -E '\.(test|spec)\.' | sort -u | wc -l
```

---

### 第 2 步：计算指标

计算并在摘要中呈现以下指标：

- **提交总数：** N
- **贡献者：** N
- **PR 合并：** N
- **插入总数：** N
- **删除总数：** N
- **净增 LOC：** N
- **测试 LOC（插入）：** N
- **测试 LOC 比率：** N%
- **版本范围：** vX.Y.Z -> vX.Y.Z
- **活跃天数：** N
- **检测到的会话：** N
- **平均 LOC/会话小时:** N

然后在下方紧接着展示一个 **按作者统计的排行榜**：

```text
贡献者                提交数   +/-          主要领域
You (garry)              32   +2400/-300   browse/
alice                    12   +800/-150    app/services/
bob                       3   +120/-40     tests/
```

按提交数降序排序。当前用户始终排在最前面，并标记为 “You (name)”。

---

### 第 3 步：提交时间分布

按本地时间展示小时级柱状分布：

```text
小时  提交数  █▅█▅█▅█▅█▅█▅█▅█▅
 00:    4      █▅█▅
 07:    5      █▅█▅█
 ...
```

识别：
- 高峰时段
- 空档时段
- 双峰模式（早晚）还是连续分布
- 深夜编码聚集（晚上 10 点后）

---

### 第 4 步：工作时段识别

使用连续两次提交之间 **45 分钟间隔** 的阈值来识别会话。

对会话分类：
- **深度会话**（50 分钟以上）
- **中等会话**（20 到 50 分钟）
- **微型会话**（20 分钟以下，单次提交）

计算：
- 总活跃编码时间
- 平均会话时长
- 每活跃小时的 LOC

---

### 第 5 步：提交类型拆解

按 conventional commit 前缀分类（`feat`/`fix`/`refactor`/`test`/`chore`/`docs`），并用百分比条展示：

```text
feat:     20  (40%)  █▅█▅█▅█▅█▅█▅█▅█▅█▅█▅
fix:      27  (54%)  █▅█▅█▅█▅█▅█▅█▅█▅█▅█▅█▅█▅█▅█
refactor:  2  ( 4%)  █▅
```

如果 `fix` 占比超过 50%，要特别标记，这通常意味着“快速发布、快速补锅”的模式，可能暗示评审环节有缺口。

---

### 第 6 步：热点分析

展示改动次数最多的前 10 个文件。并标记：
- 被修改 5 次以上的文件（高 churn 热点）
- 热点列表中测试文件与生产文件的占比
- `VERSION`/`CHANGELOG` 的出现频率

---

### 第 7 步：PR 大小分布

估算 PR 大小，并按以下区间分桶：
- **小**（<100 LOC）
- **中**（100-500 LOC）
- **大**（500-1500 LOC）
- **XL**（1500+ LOC）

---

### 第 8 步：聚焦分数 + 本周最佳交付

**聚焦分数：** 提交中触及“改动最多的顶层目录”的占比。越高表示工作越聚焦，越低表示上下文切换越分散。

**本周最佳交付：** 在当前时间窗口内 LOC 最高的单个 PR。突出 PR 编号、改动 LOC，以及它为什么重要。

---

### 第 9 步：团队成员分析

对每位贡献者（包括当前用户），计算：

1. **提交和 LOC** ...总提交、插入、删除、净 LOC
2. **重点领域** ...他们接触最多的目录/文件（前 3 个）
3. **提交类型混合** ...他们个人的 feat/fix/refactor/test 细分
4. **会话模式** ...当他们编码时（高峰时段），会话计数
5. **测试纪律** ...他们个人的测试 LOC 比率
6. **最大交付** ...他们单一最具影响力的提交或 PR

**对于当前用户（“You”）：** 做最深入的分析。包括全部会话分析、时间模式和聚焦分数，并以第一人称来表述。

**对于每位队友：** 用 2 到 3 句话概括他们交付了什么，以及他们的工作模式。然后给出：

- **值得表扬之处**（1 到 2 个具体点）：必须锚定到真实提交。不要只说 “great work”，而要明确说出好在哪里。
- **改进机会**（1 个具体点）：用“升级成长”的方式表达，而不是批评，同样必须锚定到真实数据。

**如果是单人仓库：** 跳过团队拆解部分。

**AI 协作：** 如果提交中带有 `Co-Authored-By` 的 AI trailer，要把 “AI-assisted commits” 作为独立指标统计。

---

### 第 10 步：周度趋势对比（当窗口 >= 14d 时）

按周切桶并展示趋势：
- 每周提交数（总数和每位作者）
- 每周 LOC
- 每周测试比例
- 每周修复比例
- 每周会话数

---

### 第 11 步：连续打卡统计

从今天往回统计，连续多少天每天至少有 1 次提交：

```bash
# Team streak
git log origin/main --format="%ad" --date=format:"%Y-%m-%d" | sort -u

# Personal streak
git log origin/main --author="<user_name>" --format="%ad" --date=format:"%Y-%m-%d" | sort -u
```

同时展示：
- “团队连续发货：连续 47 天”
- “您的连续发货次数：连续 32 天”

---

### 第 12 步：加载历史并对比

检查 `memory/` 中是否存在历史复盘：

如果存在历史复盘，加载最近的一份并计算差值：

```text
                    上次        本次         变化
测试比率:           22%    ->   41%         -> +9pp
会话数:             10     ->   14          -> +4
LOC/小时:           200    ->   350         -> +75%
修复比率:           54%    ->   30%         -> -24pp (改善)
```

如果没有历史复盘，就说明："首次记录复盘，请下周再次运行以查看趋势。"

---

### 第 13 步：保存复盘历史

把一份 JSON 快照保存到 `memory/retro-YYYY-MM-DD.json`，内容包括指标、作者、版本范围、连续记录和可分享的摘要。

---

### 第 14 步：撰写叙事总结

**按 Telegram 格式输出**（使用项目符号、粗体，最终输出中不要使用 markdown 表格）。

结构如下：

**可分享的摘要**（第一行）：
> 3 月 1 日当周：47 次提交（3 名贡献者）、3.2k LOC、38% 测试、12 个 PR，峰值：晚上 10 点|连胜：47天

然后分节输出：

- **摘要**：关键指标
- **与上次复盘的趋势对比**：相对上次复盘的变化（如果是首次复盘则跳过）
- **时间与会话模式**：团队通常在什么时候编码、会话时长、深度会话 vs 微型会话
- **交付速度**：提交类型、PR 大小、修复链检测
- **代码质量信号**：测试占比、热点、churn
- **聚焦与亮点**：聚焦分数、本周最佳交付
- **你的一周**：针对当前用户的个人深挖
- **团队拆解**：逐个队友的分析、表扬与改进点（单人仓库则跳过）
- **团队三大成就**：影响最大的 3 项交付
- **3 项待改进点**：3 个具体、可执行、且锚定提交数据的改进点
- **下周 3 个小习惯**：下周的 3 个小习惯，要求务实、容易执行（采纳成本 <5 分钟）

---

## Compare 模式

当用户说 `compare` 时：
- 对当前窗口运行复盘
- 对上一个同长度窗口也运行复盘
- 并排展示指标，用箭头表示提升或回退
- 用一小段叙事总结最大变化

---

## 重要规则

- **所有时间都用本地时区。** 不要设置 `TZ`。
- **按 Telegram 格式输出。** 使用项目符号和粗体，避免 markdown 表格。
- **表扬必须锚定到提交。** 不要只说 “great work”，必须明确指出好在哪里。
- **改进建议必须锚定到数据。** 没有证据就不要批评。
- **一定要保存历史。** 每次复盘都要保存到 `memory/` 用于趋势跟踪。
- **完成状态：**
- DONE：已生成复盘，且已保存历史
- DONE_WITH_CONCERNS：已生成，但存在数据缺失（例如没有历史复盘可对比）
- BLOCKED：当前不在 git 仓库中，或窗口内没有提交