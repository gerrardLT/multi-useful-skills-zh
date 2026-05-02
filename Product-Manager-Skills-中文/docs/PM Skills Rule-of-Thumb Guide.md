# PM Skills 经验法则指南（给非技术型 PM）

如果这些内容看起来有些复杂，请先阅读本页。

---

## 30 秒决策

1. **我不写代码，只想在聊天里直接拿结果**  
用 **ChatGPT Projects**（上传几个 skill 文件）或 **Claude skill ZIP upload**。

2. **我能用终端，而且想要最好质量 / 控制力**  
用 **Claude Code** 或 **Codex**，直接对着本地 repo 用。

3. **我的公司是 Microsoft-first**  
用 **M365 Copilot**，搭配已批准的 connectors 和治理机制。

4. **我需要跨工具自动化**  
用 **n8n** 搭配这个 repo 的脚本。

---

## 简单规则

- **Local repo** = 最强控制力 + 最高质量  
- **ZIP upload** = 对非技术用户最简单（Claude skills）  
- **Apps / Connectors / MCP** = 最适合企业集成与自动化

---

## 我该选哪种方法？

| Situation | Best Choice | Why |
|---|---|---|
| “我今天只需要产出一个 PM 结果” | ChatGPT Project + 上传 skill 文件 | 起步快，不写代码 |
| “我在用 Claude app，想要可复用 skills” | Claude custom skill ZIP upload | 能直接接入 Claude Skills UI |
| “我想要最高质量和可重复工作流” | Claude Code 或 Codex + 本地 repo | 有完整文件访问和高频迭代能力 |
| “我的组织要求企业级控制” | M365 Copilot（+ 已批准 connectors） | 有治理和租户边界 |
| “我需要的是 pipeline，不是一轮聊天” | n8n + repo scripts | 适合可重复自动化 |

---

## 新手默认方案（建议先尝试以下方案）

### 默认 A：ChatGPT（非技术）

1. 创建一个 ChatGPT Project。
2. 从 `skills/<skill-name>/SKILL.md` 上传 1-3 个 skills。
3. 在 Project instructions 中粘贴：

```text
Use uploaded skill files as operating standards.
Follow sections in order: Purpose, Key Concepts, Application, Examples, Common Pitfalls, References.
Ask up to 3 clarifying questions when context is missing.
```

### 默认 B：Claude（非技术）

1. 运行 `./scripts/zip-a-skill.sh --preset core-pm`（或 `--skill <skill-name>`）。
2. 打开 `dist/skill-zips/`。
3. 在 Claude Skills 设置中上传 ZIP。

### 默认 C：本地命令行运行器（适合终端）

```bash
./scripts/run-pm.sh skill user-story "Checkout improvements for returning users"
./scripts/run-pm.sh command discover "Reduce onboarding drop-off for self-serve users"
```

---

## 常见疑问及解答

- **“我能不能把本地文件夹直接同步进聊天 App？”**  
通常不行。改用本地编码工具、文件上传，或 app connections。

- **“我需要 MCP 吗？”**  
开始阶段不需要。MCP 是高级集成路径。

- **“所有东西都要 ZIP 吗？”**  
不用。ZIP 主要是 Claude custom skills 的工作流。

- **“我应该用一个超大的 all-in-one skill 文件吗？”**  
不应该。先从 1-3 个聚焦 skills 开始，输出质量会更好。

---

## 相关资源

- Claude 配置: [`docs/Using PM Skills with Claude.md`](Using%20PM%20Skills%20with%20Claude.md)
- Codex 配置: [`docs/Using PM Skills with Codex.md`](Using%20PM%20Skills%20with%20Codex.md)
- ChatGPT 配置: [`docs/Using PM Skills with ChatGPT.md`](Using%20PM%20Skills%20with%20ChatGPT.md)
- 自己构建 skills: [`docs/Building PM Skills.md`](Building%20PM%20Skills.md)