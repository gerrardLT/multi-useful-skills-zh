# 登陆前审查清单

## 指示

检查 `git diff origin/main` 输出是否存在下列问题。要具体——引用 `file:line` 并提出修复建议。跳过任何好的事情。只标记真正的问题。

**两轮审核：**
- **第 1 遍（关键）：** 首先运行 SQL 和数据安全、竞争条件、LLM 输出信任边界、Shell 注入和枚举完整性。最高严重程度。
- **通过 2（信息性）：** 运行下面剩余的类别。严重程度较低但仍采取行动。
- **专业类别（由并行子代理处理，而不是此清单）：** 测试差距、死代码、幻数、条件副作用、性能和捆绑影响、加密和熵。请参阅 `review/specialists/` 了解这些。

所有发现都通过“修复优先审查”采取行动：自动应用明显的机械修复，
真正模棱两可的问题会被批量处理成单个用户问题。

**输出格式：**

```
Pre-Landing Review: N issues (X critical, Y informational)

**AUTO-FIXED:**
- [file:line] Problem → fix applied

**NEEDS INPUT:**
- [file:line] Problem description
  Recommended fix: suggested fix
```

如果没有发现问题：`Pre-Landing Review: No issues found.`

简洁一点。对于每个问题：一行描述问题，一行包含解决方案。没有序言，没有摘要，没有“总体看起来不错”。

---

## 评论类别

### 通过 1 — 关键

#### SQL 和数据安全
- SQL 中的字符串插值（即使值为 `.to_i`/`.to_f` — 使用参数化查询（Rails：sanitize_sql_array/Arel；Node：准备好的语句；Python：参数化查询））
- TOCTOU 竞赛：检查然后设置应该是原子 `WHERE` + `update_all` 的模式
- 绕过直接数据库写入的模型验证（Rails：update_column；Django：QuerySet.update（）；Prisma：原始查询）
- N+1 查询：缺少循环中使用的关联的急切加载（Rails：.includes()；SQLAlchemy：joinedload()；Prisma：include）

#### 竞态条件和并发
- 没有唯一性约束的读-检查-写或捕获重复键错误并重试（例如，`where(hash:).first` 然后 `save!` 而不处理并发插入）
- 查找或创建没有唯一的数据库索引 - 并发调用可以创建重复项
- 不使用原子 `WHERE old_status = ? UPDATE SET new_status` 的状态转换 — 并发更新可以跳过或双重应用转换
- 不安全的 HTML 渲染（Rails：.html_safe/raw()；React：dangerouslySetInnerHTML；Vue：v-html；Django：|safe/mark_safe) 针对用户控制的数据 (XSS)

#### LLM输出信任边界
- LLM 生成的值（电子邮件、URL、姓名）写入数据库或传递给邮件程序，无需进行格式验证。在持久化之前添加轻量级防护（`EMAIL_REGEXP`、`URI.parse`、`.strip`）。
- 在数据库写入之前无需进行 type/shape 检查即可接受结构化工具输出（数组、哈希）。
- 在没有白名单的情况下获取 LLM 生成的 URL — 如果 URL 指向内部网络，则存在 SSRF 风险（Python：`urllib.parse.urlparse` → 在 `requests.get`/`httpx.get` 之前根据阻止列表检查主机名）
- LLM 输出存储在知识库或矢量数据库中，未经清理 - 存储提示注入风险

#### Shell 注入（特定于 Python）
- `subprocess.run()` / `subprocess.call()` / `subprocess.Popen()` 在命令字符串中带有 `shell=True` AND f-string/`.format()` 插值 — 请改用参数数组
- 带有变量插值的 `os.system()` — 使用参数数组替换为 `subprocess.run()`
- `eval()` / `exec()` 在 LLM 生成的代码上，无需沙箱

#### 枚举和值完整性
当 diff 引入新的枚举值、状态字符串、层名称或类型常量时：
- **跟踪每个消费者。** 读取（不仅仅是 grep — READ）每个打开、过滤或显示该值的文件。如果任何消费者不处理新值，请对其进行标记。常见错误：向前端下拉列表添加一个值，但后端 model/compute 方法不会保留它。
- **检查允许列表/filter 数组。** 搜索包含同级值的数组或 `%w[]` 列表（例如，如果向层添加“修订”，请查找每个 `%w[quick lfg mega]` 并验证在需要时包含“修订”）。
- **检查 `case`/`if-elsif` 链。** 如果现有代码在枚举上分支，新值是否会落入错误的默认值？
为此：使用 Grep 查找对同级值的所有引用（例如，使用 grep 查找“lfg”或“mega”来查找所有层消费者）。阅读每场比赛。此步骤需要读取差异之外的代码。

### 通过 2 — 信息

#### Async/Sync 混合（特定于 Python）
- `async def` 端点内的同步 `subprocess.run()`、`open()`、`requests.get()` — 阻止事件循环。请改用 `asyncio.to_thread()`、`aiofiles` 或 `httpx.AsyncClient`。
- 异步函数内的 `time.sleep()` — 使用 `asyncio.sleep()`
- 在异步上下文中同步数据库调用，无需 `run_in_executor()` 包装

#### Column/Field 名称安全
- 根据实际数据库模式验证 ORM 查询中的列名称（`.select()`、`.eq()`、`.gte()`、`.order()`） - 错误的列名称会默默返回空结果或引发吞没错误
- 检查查询结果上的 `.get()` 调用是否使用实际选择的列名
- 与模式文档的交叉引用（如果可用）

#### 死代码和一致性（仅限版本 /changelog — 其他项目由可维护性专家处理）
- PR 标题和 VERSION/CHANGELOG 文件之间的版本不匹配
- 不准确地描述更改的 CHANGELOG 条目（例如，当 X 从未存在时“从 X 更改为 Y”）

#### LLM提示问题
- 提示中的 0 索引列表（LLM 可靠地返回 1 索引）
- 提示文本列出可用工具 /capabilities 与 `tool_classes`/`tools` 数组中实际连接的内容不匹配
- Word/token 多个地方规定的限制可能会发生偏差

#### 完整性差距
- 完整版本花费 <30 分钟 CC 时间的快捷实现（例如，部分枚举处理、不完整的错误路径、缺少可直接添加的边缘情况）
- 仅提供人类团队工作量估计的选项 - 应显示人类和 CC+gstack 时间
- 测试覆盖率差距，其中添加缺少的测试是一个“湖”而不是“海洋”（例如，缺少负路径测试、缺少反映快乐路径结构的边缘情况测试）
- 当使用适度的附加代码即可实现 100% 时，功能的实​​现率为 80-90%

#### 时间窗安全
- 假设“今天”涵盖 24 小时的日期键查找 — 太平洋时间上午 8 点的报告只能在今天的键下看到午夜→上午 8 点
- 相关功能之间的时间窗口不匹配 - 一个使用每小时的存储桶，另一个使用每日密钥来获取相同的数据

#### 边界处的类型强制
- 跨越 Ruby→JSON→JS 边界的值，其中类型可能会改变（数字与字符串） - hash/digest 输入必须规范化类型
- 在序列化之前不调用 `.to_s` 或等效项的 Hash/digest 输入 — `{ cores: 8 }` 与 `{ cores: "8" }` 产生不同的哈希值

#### 查看/Frontend
- 部分中的内联 `<style>` 块（重新解析每个渲染​​）
- 在视图中进行 O(n*m) 次查找（循环中的 `Array#find` 而不是 `index_by` 哈希）
- Ruby 端 `.select{}` 对可能是 `WHERE` 子句的数据库结果进行过滤（除非故意避免前导通配符 `LIKE`）

#### 分发和 CI/CD 管道
- CI/CD 工作流程更改 (`.github/workflows/`)：验证构建工具版本是否符合项目要求，工件名称/paths 是否正确，秘密使用 `${{ secrets.X }}` 而不是硬编码值
- 新的工件类型（CLI 二进制文件、库、包）：验证publish/release 工作流程是否存在并且目标平台正确
- 跨平台构建：验证 CI 矩阵涵盖所有目标 OS/arch 组合或未经测试的文档
- 版本标记格式一致性：`v1.2.3` 与 `1.2.3` — 必须在 VERSION 文件、git 标记和发布脚本之间匹配
- 发布步骤幂等性：重新运行发布工作流程不应失败（例如，`gh release create` 之前的 `gh release delete`）

**请勿标记：**
- 具有现有自动部署管道的 Web 服务（Docker 构建 + K8s 部署）
- 内部工具未分发到团队外部
- 仅测试 CI 更改（添加测试步骤，而不是发布步骤）

---

## 严重程度分类

```
CRITICAL (highest severity):      INFORMATIONAL (main agent):      SPECIALIST (parallel subagents):
├─ SQL & Data Safety              ├─ Async/Sync Mixing             ├─ Testing specialist
├─ Race Conditions & Concurrency  ├─ Column/Field Name Safety      ├─ Maintainability specialist
├─ LLM Output Trust Boundary      ├─ Dead Code (version only)      ├─ Security specialist
├─ Shell Injection                ├─ LLM Prompt Issues             ├─ Performance specialist
└─ Enum & Value Completeness      ├─ Completeness Gaps             ├─ Data Migration specialist
                                   ├─ Time Window Safety            ├─ API Contract specialist
                                   ├─ Type Coercion at Boundaries   └─ Red Team (conditional)
                                   ├─ View/Frontend
                                   └─ Distribution & CI/CD Pipeline

All findings are actioned via Fix-First Review. Severity determines
presentation order and classification of AUTO-FIX vs ASK — critical
findings lean toward ASK (they're riskier), informational findings
lean toward AUTO-FIX (they're more mechanical).
```

---

## 修复优先启发法

此启发式由 `/review` 和 `/ship` 引用。它决定是否
代理会自动修复发现的问题或询问用户。

```
AUTO-FIX (agent fixes without asking):     ASK (needs human judgment):
├─ Dead code / unused variables            ├─ Security (auth, XSS, injection)
├─ N+1 queries (missing eager loading)      ├─ Race conditions
├─ Stale comments contradicting code       ├─ Design decisions
├─ Magic numbers → named constants         ├─ Large fixes (>20 lines)
├─ Missing LLM output validation           ├─ Enum completeness
├─ Version/path mismatches                 ├─ Removing functionality
├─ Variables assigned but never read       └─ Anything changing user-visible
└─ Inline styles, O(n*m) view lookups        behavior
```

**经验法则：** 如果修复是机械性的并且高级工程师会应用它
不用讨论，它是自动修复。如果理性的工程师可能会不同意
修复，就问。

**关键发现默认为 ASK**（它们本质上风险较高）。
**信息结果默认为自动修复**（它们更加机械）。

---

## 抑制——不要标记这些

- 当冗余无害且有助于提高可读性时，“X 与 Y 是冗余的”（例如，`present?` 与 `length > 20` 是冗余的）
- “添加注释解释为什么选择这个阈值/constant” - 阈值在调整过程中发生变化，注释腐烂
- 当断言已经涵盖了行为时，“这个断言可以更严格”
- 建议仅进行一致性更改（将值包装在条件中以匹配另一个常量的保护方式）
- 当输入受到约束并且 X 在实践中从未出现时，“正则表达式不处理边缘情况 X”
- “测试同时测试多个警卫”——没关系，测试不需要隔离每个警卫
- 评估阈值变化（max_actionable、最小分数）——这些根据经验进行调整并不断变化
- 无害的无操作（例如，在数组中从未存在的元素上使用 `.reject` ）
- 您正在查看的差异中已经解决的任何内容 - 在发表评论之前阅读完整的差异