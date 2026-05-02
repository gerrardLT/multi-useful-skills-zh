# gbrain-sync 错误查找

每个错误消息 `gstack-brain-*` 都可以打印，其中包含问题、原因和修复。

按 `BRAIN_SYNC:` 后的前缀或按二进制名称搜索此文件
命令输出。

---

## __代码_0__

**问题。** 您所在的计算机具有 `~/.gstack-brain-remote.txt` （已复制
来自另一台机器）但在 `~/.gstack/.git` 处没有本地 git 存储库。

**原因。** 您已经在其他地方设置了 GBrain 同步，但您的 gstack 尚未设置
尚未在本机上恢复。

**使固定。**
```bash
gstack-brain-restore
```
这会将存储库拉入 `~/.gstack/` 并重新注册合并驱动程序。

如果您不想在此处恢复，请使用以下命令忽略提示：
```bash
gstack-config set gbrain_sync_mode_prompted true
```

---

## __代码_0__

**问题。** 同步停止，因为秘密扫描仪检测到凭证形状
暂存文件中的内容。队列被保留；没有什么被推动。

**原因。** 预提交秘密模式之一与文件内容匹配 -
可能是 AWS 密钥、GitHub 令牌、OpenAI 密钥、PEM 块、JWT 或不记名令牌
嵌入到 JSON 中。

**修复（三个选项）。**

1. **如果它是真正的秘密**：编辑有问题的文件以删除该秘密，
然后重新运行任何技能以重试同步。

2. **如果该模式是误报**（例如，您的学习包含
您*想要*发布的示例字符串中的 GitHub 令牌模式）：
   ```bash
   gstack-brain-sync --skip-file <path>
   ```
这会将该路径永久排除在未来的同步之外。

3. **如果您想完全放弃此同步批次**（重新开始）：
   ```bash
   gstack-brain-sync --drop-queue --yes
   ```
这会清除队列而不提交。未来的写入将重新填充
正常情况下。

---

## __代码_0__

**问题。** Git 推送被拒绝，因为您的远程身份验证已过期
或缺失。

**原因。** 使用当前凭据无法访问远程设备。

**修复。** 根据您的遥控器刷新身份验证：

- **GitHub**：`gh auth status`（如果需要，则 `gh auth refresh`）
- **GitLab**：`glab auth status`
- **其他**：`git remote -v` + 检查 SSH 密钥或凭证帮助程序

修复身份验证后，运行任何技能以自动重试同步。

---

## __代码_0__

**问题。** 推送因身份验证以外的原因失败。 The first line of
git 的错误出现在冒号后面。

**原因。** 可能是网络问题、拒绝推送（远程提前）、服务器 500、
或回购访问被撤销。

**修复。** 查看 `~/.gstack/.brain-sync-status.json` 了解更多详细信息，或运行：
```bash
cd ~/.gstack && git status && git push origin HEAD
```
查看 git 的完整错误。任何推送尝试后队列都会被清除，但是
您的本地提交仍然存在 - 下一次技能运行将重试推送。

---

## __代码_0__

**问题。** 您尝试使用与
现有的一个。

**原因。** 您已经使用不同的遥控器运行了 `gstack-brain-init`。

**修复。** 要么：

- 使用现有遥控器：运行不带 `--remote` 的 `gstack-brain-init`，或者
与匹配的 URL。
- 首先切换遥控器：`gstack-brain-uninstall`，然后使用新遥控器重新初始化
网址。这不会删除您的数据。

---

## __代码_0__

**问题。** Init 无法到达 git 远程来验证连接。

**原因。** URL 错误、缺少身份验证、网络问题。

**修复。** 手动测试：
```bash
git ls-remote <url>
```
如果失败，请检查：
- 网址拼写
- GitHub：`gh auth status`
- 亚搏体育appGitLab：`glab auth status`
- 专用网络/VPN/DNS

---

## __代码_0__

**问题。** 通过 `gh repo create` 自动创建存储库失败并且存储库
也无法通过 `gh repo view` 发现。

**原因。** `gh` 未经身份验证，具有该名称的存储库已存在
由其他人拥有，或者您的 GitHub 帐户已达到配额。

**使固定。**
```bash
gh auth status
```
如果未经身份验证，请运行 `gh auth login`。如果存储库名称冲突，请传递不同的名称
姓名：
```bash
gstack-brain-init --remote git@github.com:YOURUSER/custom-name.git
```

---

## __代码_0__

**问题。** 您尝试从与现有的 URL 不匹配的 URL 进行恢复
git 配置。

**原因。** 来自先前使用不同遥控器的 init 的 `.git` 已过时。

**修复。** `gstack-brain-uninstall`，然后重新运行 `gstack-brain-restore <url>`。

---

## __代码_0__

**问题。** 您正在尝试恢复，但 `~/.gstack/` 已包含
将被覆盖的经验教训或计划。

**原因。** (a) 该机器已从预同步中积累了状态
gstack 会话，或 (b) 先前失败的恢复留下部分状态。

**修复（三个选项）。**

1. **如果这台机器的状态应该成为新的事实**：运行
`gstack-brain-init` 而不是恢复——这会创建一个全新的大脑
从这台机器的状态回购。

2. **如果你想采用远程并放弃本机状态**：
首先备份 `~/.gstack/projects/`，然后删除有问题的文件并
重新运行恢复。

3. **如果您想合并**：没有自动合并功能。手动
将学习内容从 `~/.gstack/` 复制到机器上正在运行的 gstack 中
同步已开启，然后在此处恢复。

---

## __代码_0__

**问题。** 克隆成功，但存储库缺少 `.brain-allowlist`
和 `.gitattributes`。

**原因。** 您将恢复指向随机的 git 存储库，或者有人删除了
来自 Brain 存储库的规范配置文件。

**修复。** 验证 URL。如果正确，请运行“gstack-brain-init --remote”
<url>` 重新播种规范配置。

---

## 没有任何同步，但我希望它能够同步

**不是错误，而是常见问题。** 按顺序检查：

1. `gstack-brain-sync --status` — 模式是 `off` 吗？
2. `~/.gstack/.git` 存在吗？
3. `gstack-config get gbrain_sync_mode` — 应该是 `full` 或 `artifacts-only`。
4. 您希望同步的文件 - 是否在允许列表中？
__代码_0__
5. 隐私类过滤器 — 如果模式为 `artifacts-only`，则为行为文件
（时间表、开发人员简介）被故意跳过。

如果所有这些看起来都正确，请运行：
```bash
gstack-brain-sync --discover-new
gstack-brain-sync --once
```
强制排水。
