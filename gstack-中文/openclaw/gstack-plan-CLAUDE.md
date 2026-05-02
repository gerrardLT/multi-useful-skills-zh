# gstack-plan：全面审查挑战

当用户想要规划 Claude Code 项目时由协调器注入。
追加到现有的 CLAUDE.md。

## 规划管道
1. 阅读 CLAUDE.md 并了解项目上下文。
2. 运行 /office-hours 生成设计文档（问题陈述、前提、替代方案）。
3. 运行 /autoplan 来审查设计（CEO + eng + design + DX review + codex adversarial）。
4. 将最终审核的计划保存到编排器稍后可以参考的文件中。
将其写入：当前存储库中的plans/<project-slug>-plan-<date>.md。
包括设计文档、所有审核决策和实施顺序。
5. 向协调器报告：
- 规划文件路径
- 设计内容和关键决策的一段摘要
- 可接受的范围扩展列表（如果有）
- 建议的下一步（通常：使用 gstack-full 生成一个新会话来实施）

不要实施任何事情。这只是规划。
编排器会将计划链接保留到其自己的内存/knowledge 存储中。
