# 致谢

/cso v2 是基于整个安全审计领域的研究而构建的。致谢：

- **[Sentry Security Review](https://github.com/getsentry/skills)** — 基于置信度的报告系统（仅报告高置信度结果）和“报告前研究”方法（跟踪数据流，检查上游验证）验证了我们 8/10 的每日置信度门槛。TimOnWeb 将其评为 5 项测试中唯一值得安装的安全技能。
- **[Trail of Bits Skills](https://github.com/trailofbits/skills)** — 审计上下文构建方法（在寻找 bug 之前构建心理模型）直接启发了第 0 阶段。他们的变体分析概念（发现一个漏洞？在整个代码库中搜索相同模式）启发了第 12 阶段的变体分析步骤。
- **[Shannon by Keygraph](https://github.com/KeygraphHQ/shannon)** — 自主 AI 测试人员在 XBOW 基准测试中达到 96.15%（100/104 次漏洞利用）。验证了人工智能可以进行真正的安全测试，而不仅仅是清单扫描。我们的第 12 阶段主动验证是 Shannon 实时验证的静态分析版本。
- **[afiqiqmal/claude-security-audit](https://github.com/afiqiqmal/claude-security-audit)** — AI/LLM 特定安全检查（提示注入、RAG 中毒、工具调用权限）启发了第 7 阶段。他们的框架级自动检测（检测“Next.js”而不仅仅是“Node/TypeScript”）启发了第 0 阶段的框架检测步骤。
- **[Snyk ToxicSkills Research](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/)** — 第 8 阶段（技能供应链扫描）发现 36% 的 AI 代理技能存在安全缺陷，13.4% 受到恶意启发。
- **[Daniel Miessler's Personal AI Infrastructure](https://github.com/danielmiessler/Personal_AI_Infrastructure)** — 事件响应手册和保护文件概念为修复和 LLM 安全阶段提供了信息。
- **[McGo/claude-code-security-audit](https://github.com/McGo/claude-code-security-audit)** — 生成可共享报告和可操作史诗的想法为我们的报告格式演变提供了信息。
- **[Claude Code Security Pack](https://dev.to/myougatheaxo/automate-owasp-security-audits-with-claude-code-security-pack-4mah)** — 模块化方法（单独的 /security-audit、/secret-scanner、/deps-check 技能）验证了这些是不同的问题。我们的统一方法牺牲了跨阶段推理的模块化。
- **[Anthropic Claude Code Security](https://www.anthropic.com/news/claude-code-security)** — 多阶段验证和置信度评分验证了我们的并行发现验证方法。在开源中发现了 500 多个零日漏洞。
- **[@gus_argon](https://x.com/gus_aragon/status/2035841289602904360)** — 确定了关键的 v1 盲点：无堆栈检测（运行所有语言模式），使用 bash grep 而不是 Claude Code 的 Grep 工具，`|head -20` 默默地截断结果，并且序言膨胀。这些直接影响了 v2 的堆栈优先方法和 Grep 工具的要求。