# Commands

Commands 是对一个或多个本地 PM skills 的可复用工作流封装。

- Skills 仍然是框架与教学内容的权威来源。
- Commands 负责轻量级编排，用于更快执行。
- Commands 使用带 frontmatter 的 markdown 编写，可通过文件路径在任意 agent 中使用。

## Command 格式

每个 command 文件都应包含 frontmatter：

```yaml
---
name: command-name
description: 此命令的功能
argument-hint: "<用户应提供的内容>"
uses:
  - skill-name
  - another-skill
outputs:
  - 输出成果 1
  - 输出成果 2
---
```

## 当前可用的 Commands（v1）

- `discover`
- `strategy`
- `write-prd`
- `plan-roadmap`
- `prioritize`
- `leadership-transition`

## 校验

```bash
python3 scripts/check-command-metadata.py
```

## 查找

```bash
./scripts/find-a-command.sh --list-all
./scripts/find-a-command.sh --keyword roadmap
```