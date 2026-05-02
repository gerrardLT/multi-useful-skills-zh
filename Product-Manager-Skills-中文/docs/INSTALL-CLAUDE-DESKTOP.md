# 在 Claude Desktop 或 Claude Web 中安装 PM Skills

对于非技术型 PM 来说，Claude Desktop 和 Claude Web 是最简单的路径：下载一个包，解压，上传里面的 skill ZIP，然后直接开始工作。

## 快速安装

1.  打开 [Product Manager Skills Releases page](https://github.com/deanpeters/Product-Manager-Skills/releases/latest)。
2.  下载 [`pm-skills-starter-pack.zip`](https://github.com/deanpeters/Product-Manager-Skills/releases/latest/download/pm-skills-starter-pack.zip)，或者从下面表格里选择其他包。
3.  在你的电脑上解压这个包。
4.  打开 Claude。
5.  进入 `Settings -> Capabilities -> Skills`。
6.  上传压缩包里面的单个 skill ZIP。
7.  开一个新对话，让 Claude 使用 Product Manager Skills。

试试看：

```text
Use the Product Manager Skills to help me frame this product problem.
```

## 我该选哪个包？

| Pack | Best for | 适用于 |
|---|---|---|
| [`pm-skills-starter-pack.zip`](https://github.com/deanpeters/Product-Manager-Skills/releases/latest/download/pm-skills-starter-pack.zip) | 大多数 PM | 你想先用一个小而实用的入门集合。 |
| [`02-discovery-pack.zip`](https://github.com/deanpeters/Product-Manager-Skills/releases/latest/download/02-discovery-pack.zip) | Discovery 工作 | 你需要理解客户、问题、jobs 或机会。 |
| [`03-strategy-pack.zip`](https://github.com/deanpeters/Product-Manager-Skills/releases/latest/download/03-strategy-pack.zip) | Strategy 工作 | 你需要做定位、市场思考或产品方向判断。 |
| [`04-delivery-pack.zip`](https://github.com/deanpeters/Product-Manager-Skills/releases/latest/download/04-delivery-pack.zip) | Delivery 工作 | 你需要 stories、epics、PRDs 或 roadmap 执行。 |
| [`05-ai-pm-pack.zip`](https://github.com/deanpeters/Product-Manager-Skills/releases/latest/download/05-ai-pm-pack.zip) | AI 产品工作 | 你需要评估 AI 相关机会与风险。 |
| [`99-all-skills-pack.zip`](https://github.com/deanpeters/Product-Manager-Skills/releases/latest/download/99-all-skills-pack.zip) | 高级用户 | 你想全都要，并且能接受更长的 skill 列表。 |

## 一个不错的起始提示词

```text
Use the Product Manager Skills. Ask me the minimum useful questions, then help me turn this rough idea into a clear problem statement.
```

## 说明

-   如果你不确定，先从 starter pack 开始。
-   不要把外层 pack ZIP 直接上传给 Claude。先解压 pack，再上传里面的各个 skill ZIP。
-   最好用你工作中的真实问题来试。这些 skills 在真实上下文里最强。
-   Claude Code 用户通常应该用 plugin marketplace，而不是这些 ZIP。见 [`INSTALL-CLAUDE-CODE.md`](INSTALL-CLAUDE-CODE.md)。
-   Codex 用户应使用 Codex ZIP 或直接克隆仓库。见 [`INSTALL-CODEX.md`](INSTALL-CODEX.md)。