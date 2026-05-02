# 在 Codex 中使用 PM Skills

Codex 可以直接从您的仓库文件中应用这些技能。

如果您刚接触此仓库，请先阅读 [`Using PM Skills 101.md`](Using%20PM%20Skills%20101.md)。

以下是三种实用路径：
- 本地工作区（您编码环境中的 Codex）
- ChatGPT 中的 Codex（`chatgpt.com/codex`）并连接 GitHub
- 通过 `npx skills` 从 marketplace 安装

如果您想先在本地演练一下，再直接交给 Codex，可以使用 Streamlit（beta）演练场：

```bash
pip install -r app/requirements.txt
streamlit run app/main.py
```

---

## 方案 1：本地工作区（最快）

1. 在 Codex 工作区中打开此仓库。
2. 选择一个技能文件，路径为 `skills/<skill-name>/SKILL.md`。
3. 在提示中明确写出此文件路径。

示例：

```text
Using the skill at skills/prd-development/SKILL.md, create a PRD for a mobile onboarding redesign. Ask up to 3 clarifying questions first, then proceed.
```

命令工作流示例：

```text
Run commands/discover.md for this request: reduce onboarding drop-off for self-serve SMB users.
```

### 如何使用三种技能类型

- **组件技能**：让它产出某个具体产物（例如用户故事、定位声明、史诗假设）。
- **交互技能**：预期它先问 3-5 个自适应问题，然后给出编号推荐。
- **工作流技能**：让 Codex 先列出阶段，再一次执行一个阶段。

### 串联多个技能

```text
First use skills/problem-framing-canvas/SKILL.md to define the problem. Then apply skills/user-story/SKILL.md to write stories for the chosen solution.
```

也可以配合本地辅助脚本进行快速发现与执行：

```bash
./scripts/find-a-command.sh --list-all
./scripts/run-pm.sh command plan-roadmap "Q3-Q4 roadmap for enterprise reporting"
```

---

## 方案 2：ChatGPT 中的 Codex（连接 GitHub）

ChatGPT 中的 Codex 可以直接操作已连接的仓库，无需 ZIP 上传流程。
具体可用性可能因套餐和地区发布节奏而异。

1. 打开 [Codex](https://chatgpt.com/codex)。
2. 在提示时连接 GitHub（或前往 ChatGPT 设置中连接）。
3. 选择此仓库和分支。
4. 让 Codex 使用某个具体技能路径，例如：

```text
Use skills/finance-based-pricing-advisor/SKILL.md to evaluate whether we should test a 10% price increase. Show assumptions and risks.
```

### 实用提示模式

使用以下结构，输出会更稳定：

```text
Using skills/<skill-name>/SKILL.md:
1) Ask up to 3 clarifying questions.
2) Follow the skill sections exactly.
3) Show output in markdown.
4) End with risks, assumptions, and next steps.
```

---

## 方案 3：从 skills.sh 安装（无需本地克隆）

如果您更喜欢 marketplace 式安装，使用 Skills CLI 即可。

先进行发现：

```bash
npx skills find product management
npx skills add deanpeters/Product-Manager-Skills --list
```

为 Codex 安装：

```bash
npx skills add deanpeters/Product-Manager-Skills --skill <skill-name> -a codex -g
```

示例：

```bash
npx skills add deanpeters/Product-Manager-Skills --skill user-story -a codex -g
npx skills add deanpeters/Product-Manager-Skills --skill prd-development -a codex -g
npx skills add deanpeters/Product-Manager-Skills --skill finance-based-pricing-advisor -a codex -g
```

也支持等价的 GitHub URL 形式：

```bash
npx skills add https://github.com/deanpeters/Product-Manager-Skills --skill <skill-name>
```

查看 Codex 已安装的技能：

```bash
npx skills list -a codex
```

### 与仓库工具配合（推荐）

如果您本地已有此仓库，先使用内置发现工具，再用 `npx skills` 安装：

```bash
./scripts/find-a-skill.sh --keyword pricing --type interactive
npx skills add deanpeters/Product-Manager-Skills --skill finance-based-pricing-advisor -a codex -g
```

这样您在安装前能先进行更精细的本地筛选。

### 不克隆也能发现技能

如果您不想克隆此仓库：

1. 搜索 marketplace 技能：
   ```bash
   npx skills find pricing
   ```
2. 列出此仓库提供的技能：
   ```bash
   npx skills add deanpeters/Product-Manager-Skills --list
   ```
3. 安装您需要的那个：
   ```bash
   npx skills add deanpeters/Product-Manager-Skills --skill <skill-name> -a codex -g
   ```

您也可以直接浏览 [skills.sh](https://skills.sh/)，从每个技能页面复制对应命令。

---

## 故障排查

- **Codex 找不到文件**：确认仓库/分支选择正确，并检查大小写敏感路径是否完全正确。
- **输出太泛**：补充真实约束，例如阶段、KPI 目标、客户细分、时间线。
- **格式跑偏**：明确要求 Codex 遵循 `Purpose, Key Concepts, Application, Examples, Common Pitfalls, References` 结构。

---

## 官方参考

- [Codex in ChatGPT](https://openai.com/index/introducing-codex/)
- [Getting started with Codex](https://help.openai.com/en/articles/11096431-getting-started-with-codex)
- [Apps in ChatGPT (GitHub connection)](https://help.openai.com/en/articles/11487775-connectors-in-chatgpt/)
- [Skills homepage](https://skills.sh/)
- [Skills CLI docs](https://skills.sh/docs/cli)