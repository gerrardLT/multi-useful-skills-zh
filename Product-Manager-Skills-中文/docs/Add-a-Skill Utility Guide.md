# Add-a-Skill 实用工具指南

**目的：** 使用 AI 代理自动化将原始产品经理内容转化为正式技能。

---

## 概述

`add-a-skill.sh` 实用工具通过以下方式简化技能创建：
1. **分析**原始产品经理内容（笔记、框架、模板）
2. **建议**合适的技能类型和结构
3. **生成**包含示例和模板的完整技能文件
4. **验证**元数据和结构
5. **自动更新**项目文档
6. **暂存**文件以供 git 提交

有关技能触发、测试和打包的外部指导，请参阅 Anthropic 的 [Claude 技能构建完整指南](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)。将此仓库的标准和脚本视为操作的权威来源，并将 Anthropic 的指南作为交叉检查。

此实用工具是**适配器驱动**的。它可与 Claude Code 开箱即用，支持手动模式（`--agent manual`）以与任何 AI CLI 配合使用，并且可以通过自定义适配器进行扩展。

---

## 快速开始

### 前提条件

1. **使用以下执行模式之一：**
   - [Claude Code](https://claude.ai/download)（推荐，完全集成）
   - `--agent manual`（在任何 AI CLI 中运行提示，然后粘贴响应）
   - 基于 `scripts/adapters/ADAPTER_TEMPLATE.sh` 的自定义适配器

2. **确保已安装 Python 3**（用于验证）

3. **使脚本可执行：**
   ```bash
   chmod +x scripts/add-a-skill.sh
   ```

### 基本用法

```bash
# 从文件
./scripts/add-a-skill.sh research/my-framework.md

# 从标准输入
cat notes.txt | ./scripts/add-a-skill.sh

# 从剪贴板 (macOS)
pbpaste | ./scripts/add-a-skill.sh

# 从剪贴板 (Linux)
xclip -o | ./scripts/add-a-skill.sh

# 直接文本
./scripts/add-a-skill.sh --text "My framework for..."
```

### 使用特定代理

```bash
# 使用 Claude Code（默认自动检测）
./scripts/add-a-skill.sh research/content.md

# 使用手动模式（适用于任何 AI CLI）
./scripts/add-a-skill.sh --agent manual research/content.md
```

### 检查可用代理

```bash
./scripts/add-a-skill.sh --list-agents
```

---

## 工作流程

该实用工具遵循一个包含交互式检查点的 8 步流程：

### 第 1 步：接收
**发生什么：** 从文件、标准输入或参数读取内容

**用户操作：** 通过您首选的方法提供内容

**输出：** 内容大小和来源的确认

---

### 第 2 步：分析内容
**发生什么：** AI 代理分析内容并建议：
- 技能类型（组件、交互、工作流）
- 技能名称
- 结构和章节
- 前提条件和依赖项
- 缺失信息

**用户操作：** 审查分析，批准或退出

**示例输出：**
```
分析：
---------
此内容描述了一个用于优先级决策的框架。

建议：创建 1 个交互式技能

技能名称：prioritization-framework-advisor
类型：交互式
结构：
  - 目的：指导产品经理使用 RICE 框架进行优先级排序
  - 关键概念：RICE 评分、权衡分析
  - 应用：4 步交互式流程，带枚举选项
  - 示例：示例优先级排序场景
  - 常见陷阱：分数操纵、分析瘫痪

前提条件：无
缺失：不同产品阶段的基准分数

继续？[y/N]
```

---

### 第 3 步：生成计划
**发生什么：** AI 创建详细的实施计划：
- 确切的文件路径和名称
- 每个技能的 YAML 前端数据
- 章节大纲
- 支持文件（模板、示例）
- 所需的文档更新

**用户操作：** 审查计划，批准或退出

**示例输出：**
```
实施计划：
-------------------

技能：prioritization-framework-advisor

要创建的文件：
  skills/prioritization-framework-advisor/
    鈹溾攢鈹€ SKILL.md (624 行)
    鈹溾攢鈹€ template.md (优先级评分卡)
    鈹斺攢鈹€ examples/
        鈹溾攢鈹€ saas-feature-prioritization.md
        鈹斺攢鈹€ roadmap-tradeoffs.md

YAML 前端数据：
  name: prioritization-framework-advisor
  description: 选择优先级框架。适用于在 RICE、ICE 或价值/工作量方法之间做出决定。
  intent: 指导产品经理使用结构化框架进行功能优先级排序，包含权衡分析和上下文敏感的建议。
  type: interactive

章节：
  1. 目的 (2 段)
  2. 关键概念 (RICE, ICE, 价值 vs 工作量, 权衡)
  3. 应用 (4 步交互式流程)
  4. 示例 (2 个场景)
  5. 常见陷阱 (5 种失败模式)
  6. 参考资料 (相关技能的链接)

文档更新：
  - CLAUDE.md：增加技能计数，添加到当前阶段
  - README.md：添加到交互式技能部分（按字母顺序）

批准计划？[y/N]
```

---

### 第 4 步：生成文件
**发生什么：** AI 生成完整的技能文件，包括：
- 带有正确 YAML 前端数据的 SKILL.md
- 所有必需的章节
- 模板（如果是组件技能）
- 演示用法的示例
- 正确的交叉引用

**用户操作：** 无（自动）

**输出：**
```
生成的文件：
  /tmp/tmp.abc123/skills/
    鈹斺攢鈹€ prioritization-framework-advisor/
        鈹溾攢鈹€ SKILL.md
        鈹溾攢鈹€ template.md
        鈹斺攢鈹€ examples/
            鈹溾攢鈹€ saas-feature-prioritization.md
            鈹斺攢鈹€ roadmap-tradeoffs.md
```

---

### 第 5 步：验证
**发生什么：** 对每个技能运行 `scripts/check-skill-metadata.py` 以验证：
- YAML 前端数据有效
- `name` 字段鈮?64 个字符
- `description` 字段鈮?200 个字符
- `intent` 字段存在，以提供更丰富的仓库面向意义
- `type` 是以下之一：component, interactive, workflow

然后运行 `scripts/check-skill-triggers.py` 以在上传前捕获弱描述：
- 描述说明了技能的功能以及何时使用它
- 描述在 200 字符限制处没有被截断的风险
- 前端数据包含现实场景或 `best_for` 提示，用于手动触发检查

**用户操作：** 审查验证结果，继续或退出

**示例输出：**
```
正在验证：prioritization-framework-advisor

鉁?YAML 前端数据有效
鉁?name: "prioritization-framework-advisor" (34 个字符, 鈮?4) 鉁?
鉁?description: "Guide PMs through feature..." (87 个字符, 鈮?00) 鉁?
鉁?intent: 存在 鉁?
鉁?type: "interactive" 有效 鉁?

触发审计：
鉁?描述包含明确的“适用于...”提示
鉁?场景提供了现实的触发示例
鉁?未检测到截断风险

鉁?通过验证

所有技能均通过验证 鉁?
```

---

### 第 6 步：审查技能
**发生什么：** 提示您在安装前审查生成的技能

**用户操作：**
1. 审查 SKILL.md 文件
2. 检查示例和模板
3. 验证结构和内容
4. 批准安装或退出

**可选：** 在您的编辑器/文件浏览器中打开技能目录

**输出：**
```
生成的技能位于：/tmp/tmp.abc123/skills

请在安装前进行审查。

打开技能目录？[Y/n]

准备安装？[y/N]
```

---

### 第 7 步：安装技能
**发生什么：** 将技能目录从临时位置复制到 `skills/`

**用户操作：** 如果技能已存在，确认覆盖

**输出：**
```
正在将技能文件复制到 skills/...

鉁?已安装：prioritization-framework-advisor

已安装 1 个技能
```

---

### 第 8 步：更新文档
**发生什么：** AI 生成并应用对以下内容的更新：
- `CLAUDE.md` 鈥?技能计数、阶段状态
- `README.md` 鈥?添加到适当的部分（按字母顺序）
- `docs/` 鈥?如果创建了技能套件，则生成新文档

**用户操作：** 批准文档更新

**输出：**
```
正在生成文档更新...

需要更新：
  鈥?CLAUDE.md 鈥?增加交互式技能计数
  鈥?README.md 鈥?添加到交互式技能列表

使用 AI 生成更新？[Y/n]

鉁?文档已更新
```

---

### 第 9 步：暂存以提交
**发生什么：** 暂存所有新的和修改过的文件以进行 git 提交

**用户操作：** 审查暂存的更改，手动提交

**输出：**
```
正在暂存文件以提交...

鉁?文件已暂存以提交

Git 状态：
A  skills/prioritization-framework-advisor/SKILL.md
A  skills/prioritization-framework-advisor/template.md
A  skills/prioritization-framework-advisor/examples/saas-feature-prioritization.md
A  skills/prioritization-framework-advisor/examples/roadmap-tradeoffs.md
M  CLAUDE.md
M  README.md

下一步：
  1. 审查暂存的更改：git diff --staged
  2. 提交更改：git commit -m 'Add prioritization-framework-advisor skill'
  3. 推送到远程：git push
```

---

## 命令参考

### 选项

```bash
--agent <name>      # 使用特定适配器 (claude-code, manual, 或自定义)
--list-agents       # 列出可用适配器及其安装状态
--text "content"    # 直接作为参数提供内容
--dry-run           # 仅生成 + 验证；跳过安装/文档/暂存
--help, -h          # 显示帮助信息
```

### 输入方法

**1. 从文件：**
```bash
./scripts/add-a-skill.sh research/my-framework.md
```

**2. 从标准输入：**
```bash
cat notes.txt | ./scripts/add-a-skill.sh
echo "My content" | ./scripts/add-a-skill.sh
```

**3. 从剪贴板：**
```bash
# macOS
pbpaste | ./scripts/add-a-skill.sh

# Linux
xclip -o | ./scripts/add-a-skill.sh
xsel -b | ./scripts/add-a-skill.sh
```

**4. 从参数：**
```bash
./scripts/add-a-skill.sh --text "My framework for stakeholder mapping..."
```

### 示例

**基本用法：**
```bash
# 分析研讨会笔记
./scripts/add-a-skill.sh research/workshop-notes.md

# 转换框架文档
./scripts/add-a-skill.sh docs/my-framework.md
```

**使用特定适配器：**
```bash
# 使用手动模式（在您首选的 AI CLI 中运行提示）
./scripts/add-a-skill.sh --agent manual research/content.md
```

**来自不同来源：**
```bash
# 从文件
./scripts/add-a-skill.sh research/content.md

# 从标准输入
cat brainstorm.txt | ./scripts/add-a-skill.sh

# 从剪贴板 (macOS)
pbpaste | ./scripts/add-a-skill.sh

# 直接文本
./scripts/add-a-skill.sh --text "Framework: Use RICE for prioritization"
```

**检查适配器状态：**
```bash
# 列出所有适配器及其可用性
./scripts/add-a-skill.sh --list-agents
```

---

## 代理适配器

该实用工具使用**适配器模式**来支持不同的 AI CLI 工具。

### 可用适配器

- **claude-code** 鈥?Claude Code CLI（默认，推荐）
- **manual** 鈥?终端复制/粘贴模式；适用于任何 AI CLI
- **自定义适配器** 鈥?使用 `scripts/adapters/ADAPTER_TEMPLATE.sh` 构建

### 自动检测

如果未指定适配器，脚本将按优先级顺序尝试可用适配器：
1. Claude Code (`claude`)
2. 手动模式 (`manual`)

### 创建新适配器

有关完整模板，请参阅 `scripts/adapters/ADAPTER_TEMPLATE.sh`。

**必需函数：**
1. `adapter_check_available()` 鈥?检查代理 CLI 是否已安装
2. `adapter_analyze_content()` 鈥?分析内容并建议技能
3. `adapter_generate_plan()` 鈥?生成详细的实施计划
4. `adapter_generate_skill()` 鈥?生成技能文件
5. `adapter_update_documentation()` 鈥?生成文档更新
6. `adapter_apply_documentation_updates()` 鈥?应用文档更新

**示例适配器结构：**
```bash
# scripts/adapters/my-agent.sh

adapter_check_available() {
    command -v my-agent &> /dev/null
}

adapter_analyze_content() {
    local content="$1"
    # 使用分析提示调用 my-agent
    echo "$content" | my-agent analyze --format=skills
}

# ... 实现其他函数
```

**测试您的适配器：**
```bash
# 检查适配器是否加载
source scripts/adapters/my-agent.sh
adapter_check_available && echo "OK"

# 使用 add-a-skill.sh 测试
./scripts/add-a-skill.sh --agent my-agent test-content.md

# 验证它是否出现在列表中
./scripts/add-a-skill.sh --list-agents
```

---

## 面向非技术产品经理

此实用工具旨在**教学优先** 鈥?它在自动化繁琐部分的同时，教授您有关技能创建的知识。

### 需要了解的内容

**使用此实用工具之前：**
1. 您拥有原始的产品经理内容（框架、模板、流程）
2. 您希望将其转换为技能3. 您已安装 AI CLI（推荐使用 Claude Code）

**该工具的功能：**
- 读取您的内容
- 请求 AI 分析并建议技能结构
- 在创建任何内容前向您展示计划
- 生成完整、经过验证的技能文件
- 更新所有文档
- 暂存文件以便 git 提交

**您仍然控制的部分：**
- 在每个步骤批准/拒绝
- 审查生成的内容
- 准备好时手动提交
- 如有需要，编辑生成的技能

### 初学者分步指南

1.  **安装 Claude Code**（最简单的选择）：
    - 从 https://claude.ai/download 下载
    - 按照安装说明操作
    - 使用您的 Anthropic 账户进行身份验证

2.  **准备您的内容：**
    - 将您的框架/笔记保存到文件（例如，`my-framework.md`）
    - 或者将其放在剪贴板中准备粘贴

3.  **使脚本可执行**（一次性操作）：
    ```bash
    chmod +x scripts/add-a-skill.sh
    ```

4.  **运行该工具：**
    ```bash
    ./scripts/add-a-skill.sh my-framework.md
    ```

5.  **按照提示操作：**
    - 审查 AI 的分析 → 批准或拒绝
    - 审查实施计划 → 批准或拒绝
    - 等待文件生成（自动）
    - 审查验证结果
    - 审查生成的技能 → 批准安装
    - 批准文档更新
    - 审查 git 暂存的文件

6.  **准备好时提交：**
    ```bash
    git commit -m "Add my-new-skill"
    ```

### 常见问题

**问：如果我不喜欢生成的技能怎么办？**
答：在第 6 步（审查）时，对安装说“否”。文件将保留在 `/tmp/` 目录中，供您审查和手动复制/编辑。

**问：生成后我可以编辑技能吗？**
答：可以！安装后，根据需要编辑 `skills/skill-name/SKILL.md`。

**问：如果验证失败怎么办？**
答：脚本会显示失败原因（通常是名称/描述过长）。您可以选择继续（不推荐用于市场）或退出并进行调整。

**问：我需要了解 git 吗？**
答：基础知识会有帮助。脚本会暂存文件但不会提交——您控制何时提交。

**问：没有 Claude Code 可以使用这个工具吗？**
答：可以。使用 `--agent manual`，在您首选的 AI CLI 中运行提示，并将响应粘贴回终端。

---

## 故障排除

### 未找到适配器

**问题：**
```
❌ Error: No supported adapters found.
```

**解决方案：**
1.  检查可用的适配器：`./scripts/add-a-skill.sh --list-agents`
2.  使用手动模式：`./scripts/add-a-skill.sh --agent manual <input-file>`
3.  安装 Claude Code 或创建自定义适配器

---

### 验证失败

**问题：**
```
❌ Failed validation: name exceeds 64 characters
```

**解决方案：**
1.  查看错误信息
2.  选项 A：无论如何继续（不推荐用于市场）
3.  选项 B：退出并手动缩短技能名称

---

### 文件生成失败

**问题：**
```
Error: Failed to parse files from AI response
```

**解决方案：**
1.  AI 的输出格式可能与预期的标记不匹配
2.  脚本会回退到直接创建文件
3.  如果仍然失败，请检查临时目录中的部分输出
4.  使用临时目录中的内容手动创建技能

---

### 文档更新失败

**问题：**
```
⚠️ Skipping documentation updates
```

**解决方案：**
1.  对 AI 辅助更新说“否”
2.  手动更新：
    -   `CLAUDE.md` — 增加技能计数，添加到当前阶段
    -   `README.md` — 将技能添加到适当的部分（按字母顺序）

---

### 权限被拒绝

**问题：**
```
bash: ./scripts/add-a-skill.sh: Permission denied
```

**解决方案：**
```bash
chmod +x scripts/add-a-skill.sh
```

---

## 高级用法

### 自定义适配器开发

完整指南请参见 `scripts/adapters/ADAPTER_TEMPLATE.sh`。

**步骤：**
1.  复制模板：`cp scripts/adapters/ADAPTER_TEMPLATE.sh scripts/adapters/my-agent.sh`
2.  实现所需函数
3.  测试：`./scripts/add-a-skill.sh --agent my-agent --list-agents`
4.  使用：`./scripts/add-a-skill.sh --agent my-agent content.md`

### 批量处理

处理多个文件：
```bash
for file in research/*.md; do
    echo "Processing $file..."
    ./scripts/add-a-skill.sh "$file"
done
```

### 与其他工具集成

**与 pandoc 集成（转换格式）：**
```bash
pandoc notes.docx -t markdown | ./scripts/add-a-skill.sh
```

**与 curl 集成（从 URL 获取）：**
```bash
curl -s https://example.com/framework.md | ./scripts/add-a-skill.sh
```

**与 grep 集成（提取部分）：**
```bash
grep -A 50 "^# My Framework" notes.md | ./scripts/add-a-skill.sh
```

---

## 最佳实践

1.  **从干净、结构良好的内容开始**
    -   清晰的标题和章节
    -   包含示例和反模式
    -   具体而非抽象

2.  **在每个检查点进行审查**
    -   不要盲目批准所有内容
    -   检查 AI 是否理解了您的意图
    -   验证示例是否相关

3.  **提交前进行验证**
    -   审查生成的 SKILL.md
    -   测试示例
    -   检查交叉引用

4.  **更新文档**
    -   让 AI 更新 CLAUDE.md 和 README.md
    -   提交前审查更改
    -   确保保持字母顺序

5.  **深思熟虑地提交**
    -   编写清晰的提交信息
    -   通常每个技能一次提交
    -   如适用，引用相关问题/PR

---

## 教学益处

这个工具教会您：

1.  **技能结构** — 通过观察 AI 生成正确的结构
2.  **技能类型** — 理解组件型、交互型与工作流型
3.  **质量标准** — 验证教会您市场要求
4.  **文档实践** — 如何维护项目文档
5.  **Git 工作流** — 暂存、审查、提交

**在实践中学习：** 每次使用该工具时，您会看到：
-   AI 如何解释原始内容
-   什么构成良好的技能结构
-   技能如何相互交叉引用
-   为什么验证很重要
-   文档如何保持同步

---

## 贡献

想要改进这个工具？

**贡献领域：**
1.  **新适配器** — 为更多 AI CLI 添加支持
2.  **更好的解析** — 改进从 AI 响应中提取文件
3.  **试运行模式** — 预览而不创建文件
4.  **模板** — 为常见技能类型预构建提示
5.  **测试** — 适配器的自动化测试

通用贡献指南请参见 `CONTRIBUTING.md`。

---

## 相关文档

-   `CLAUDE.md` — 技能提炼协议
-   `docs/Building PM Skills.md` — 手动技能创建指南
-   `scripts/check-skill-metadata.py` — 验证脚本
-   `scripts/adapters/ADAPTER_TEMPLATE.sh` — 适配器开发指南

---

## 支持

**问题：**
-   GitHub Issues: https://github.com/deanpeters/product-manager-skills/issues
-   包含：操作系统、使用的代理、错误信息、输入内容（如果非敏感）

**疑问：**
-   首先检查文档
-   搜索现有问题
-   在讨论区提问

---

## 更新日志

### 2026-02-08
-   初始发布
-   Claude Code 适配器
-   8 步工作流
-   自动检测
-   验证集成
-   文档生成