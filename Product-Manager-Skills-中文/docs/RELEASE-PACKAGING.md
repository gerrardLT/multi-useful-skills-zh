# 发布打包

本仓库将 `skills/` 作为规范事实源，并将可下载的打包产物构建到 `dist/`。

发布体验应足够简单：

```text
下载一个包。解压它。上传里面的技能 ZIP 文件。开始提出更好的产品问题。
```

## 维护者流程

在仓库根目录运行：

```bash
./scripts/build-release.sh
git tag v0.78.0
git push origin v0.78.0
```

只要推送了以 `v` 开头的版本标签，GitHub Actions 就会构建产物，并将它们挂载到 GitHub Release 上。

## 会构建什么

```text
dist/
  claude-desktop/
    01-core-pm-starter-pack.zip
    pm-skills-starter-pack.zip
    02-discovery-pack.zip
    03-strategy-pack.zip
    04-delivery-pack.zip
    05-ai-pm-pack.zip
    99-all-skills-pack.zip

  skill-zips/
    <skill-name>.zip

  codex/
    .agents/
      skills/
        <skill-name>/
          SKILL.md
    AGENTS.md
    codex-product-manager-skills.zip

  release/
    claude-desktop/
    skill-zips/
    codex/
    docs/
    README.md

  Product-Manager-Skills-<version>-release.zip
```

## 脚本

仅运行校验：

```bash
./scripts/validate-skills.sh
```

构建 Claude Desktop/Web 包：

```bash
./scripts/build-claude-desktop-packs.sh
```

此脚本也会重新生成 `dist/skill-zips/`，因为 Claude 包本质上是若干可直接上传的技能 ZIP 的打包集合。

构建 Codex 包：

```bash
./scripts/build-codex-skills.sh
```

全部构建：

```bash
./scripts/build-release.sh
```

## 重要规则

- 不要直接编辑 `dist/` 下的文件
- 除非仓库策略有意改变，否则不要提交生成的 ZIP 文件
- Claude Desktop/Web 包是由一组可直接上传的技能 ZIP 再打包成一个 ZIP。用户需要先解压包，再将里面的技能 ZIP 上传到 Claude
- Codex 包是 ZIP 内展开的 `.agents/skills` 目录，而非 ZIP 套 ZIP
- 不要删除 `.claude-plugin/marketplace.json`；Claude Code 用户依赖 marketplace 路径
- 保持 `skills/` 稳定且作为唯一规范源
- 相比重型构建系统，优先使用小型 Bash 脚本和常见 Unix 工具

## 安装文档

- Claude Desktop/Web: [`INSTALL-CLAUDE-DESKTOP.md`](INSTALL-CLAUDE-DESKTOP.md)
- Claude Code: [`INSTALL-CLAUDE-CODE.md`](INSTALL-CLAUDE-CODE.md)
- Codex: [`INSTALL-CODEX.md`](INSTALL-CODEX.md)