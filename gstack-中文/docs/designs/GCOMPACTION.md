# GCOMPACTION.md：设计与架构（已搁置）

**获批后目标路径：** `docs/designs/GCOMPACTION.md`

这是为 `gstack compact` 保留的设计产物。下方第一个 `---` 分隔线之前的内容，会在计划获批时原样提取到 `docs/designs/GCOMPACTION.md`。分隔线之后则是支撑该设计的研究归档内容。

---

## 状态：TABLED（2026-04-17）- 等待 Anthropic 的 `updatedBuiltinToolOutput` API

**搁置原因。**
v1 架构原先假定 Claude Code 的 `PostToolUse` hook 可以**替换**进入模型上下文的 built-in tool 输出（Bash、Read、Grep、Glob、WebFetch）。但 2026-04-17 的研究确认：目前无法实现这一点。

**证据：**

1. **官方文档**仅为 MCP tool 提供了 `hookSpecificOutput.updatedMCPToolOutput`
2. **Anthropic issue #36843** 明确承认 built-in tools 没有等价能力
3. **RTK 机制**本质是 PreToolUse 层的 Bash command rewrite，而非 PostToolUse compactor
4. **tokenjuice** 使用的是 `decision: "block" + reason` 的 hack
5. **Read/Grep/Glob** 本身在 Claude Code 内部执行，根本不会如预期那样被 hooks 拦截

**结论。**
原设计中的两个楔子均已失效：

- 楔子 (i) “条件性 LLM 验证器”：理论上仍可通过仅限 Bash 的 PreToolUse 包装实现，但一旦仅限于 Bash，其差异化优势将不再明显
- 楔子 (ii) “原生工具覆盖”：目前根本无法实现

**决策。**
整个 `gstack compact` 项目将彻底搁置，等待 Anthropic 真正提供 `updatedBuiltinToolOutput` 或同等能力。

当未来可以重新启动时，这份设计文档、下方锁定的 15 条决策，以及底部研究归档，将构成新的实现冲刺包。

**明确不做的事：**

- 不做仅限 Bash 的 PreToolUse wrapper
- 不做 `decision: block + reason` 这类未文档化的 hack
- 不单独发布 benchmark，除非有可工作的 compactor

**搁置成本：** 接近 0。尚未编写任何正式代码。

---

## 在 plan-eng-review 中锁定的决策（2026-04-17）

这些决策在未来解封时可以直接继承：

### 范围

1. **v1 先只做 Claude-first**
2. **首发规则库 13 条**
3. **验证器在 v1.0 默认开启**

### 架构

4. **Haiku 输出做精确逐行匹配清洗**
5. **`failureCompaction` 使用分层信号**
6. **规则解析采用 deep-merge**

### 代码质量

7. **每条 regex 设置 50ms 超时**
8. **预编译 rule bundle**
9. **通过 mtime drift 自动 reload**
10. **首发 redaction 集覆盖 AWS key、GitHub/GitLab token、Slack webhook、JWT、bearer token、SSH 私钥头等**

### 测试

11. **P-series 采用 gate subset**
12. **fixture 加 toolVersion 标记**
13. **B-series 真实 benchmark testbench 是硬门槛**

### 性能

14. **重订延迟预算**
15. **采用面向行的 streaming pipeline**

这些是未来真正解封实现时的 MUST，不是建议。

---

## 摘要

`gstack compact` 原本被设计成一个 `PostToolUse` hook，用于在 tool output 进入 AI coding agent 上下文前，先压缩其中的噪音。

预期方法是：

- 用确定性的 JSON rules 缩减测试输出、构建日志、git diff、包管理器安装日志
- 在高风险过度压缩场景下，额外触发一个 Claude Haiku verifier 作为安全网

**当前状态：TABLED。**
由于 Claude Code 目前没有为 built-in tools 提供真正的 output-replacement API，这套架构无法成立。

## 非目标

- 不压缩用户消息或 agent 历史消息
- 不压缩 agent 的最终响应
- 不做调用缓存
- 不当通用日志分析器
- 不替代 agent 自己判断何时需要 `GSTACK_RAW=1`

## 为什么这件事值得做

这不是假问题，而是有数据支持的：

- Chroma 关于 context rot 的研究表明，上下文一长，模型性能就会下降
- coding agents 尤其糟糕：上下文是累积的、噪音密度高、任务跨度长
- 市场也已经给出方向：Anthropic、OpenAI、Google、LangChain、sst/opencode 都在做 compaction / compression 相关能力

## 竞品环境

| 项目 | Stars | 层级 | 备注 |
|------|------|------|------|
| RTK | 28K | Tool output | 唯一直接对标 |
| caveman | 34.8K | Output tokens | 压缩的是另一个层 |
| claude-token-efficient | 4.3K | Response verbosity | 不同问题 |
| token-optimizer-mcp | 49 | MCP caching | 减少调用，不是压缩输出 |
| tokenjuice | 很新 | Tool output | 太新 |

RTK 才是唯一真正的正面竞争对手。其它项目压缩的都不是同一类 token。

## 架构（原设想）

原来的数据流是：

```text
Host 执行工具
  -> PostToolUse hook
  -> gstack-compact 解析 envelope
  -> 按规则 filter / group / truncate / dedupe
  -> 必要时触发 verifier
  -> 把压缩后的输出重新塞回 agent 上下文
```

问题在于最后这一步：**“重新塞回 built-in tool 输出”目前做不到。**

### 规则层级

原设想采用三层规则优先级：

1. 内建规则：`compact/rules/`
2. 用户规则：`~/.config/gstack/compact-rules/`
3. 项目规则：`.gstack/compact-rules/`

### JSON envelope（原设想）

输入：

```json
{
  "tool": "Bash",
  "command": "bun test test/billing.test.ts",
  "argv": ["bun", "test", "test/billing.test.ts"],
  "combinedText": "...",
  "exitCode": 1,
  "cwd": "/Users/garry/proj",
  "host": "claude-code"
}
```

输出：

```json
{
  "reduced": "compacted output ...",
  "meta": {
    "rule": "tests/jest",
    "linesBefore": 247,
    "linesAfter": 18,
    "bytesBefore": 18234,
    "bytesAfter": 892,
    "verifierFired": false,
    "teeFile": null,
    "durationMs": 8
  }
}
```

### 规则 schema（原设想）

仍然保留价值，因为将来若 API 到位，规则形状大概率仍可复用：

- `filter`
- `group`
- `truncate`
- `dedupe`

它们本质上对应了 RTK 那套压缩 primitive taxonomy。

### 验证器层（原设想）

只有在特定条件下才触发 Haiku：

- `failureCompaction`
- `aggressiveReduction`
- `largeNoMatch`
- `userOptIn`

默认只开 `failureCompaction`，因为它是风险最高、也最值得防御的场景：agent 正在 debug，而规则可能把关键 stack frame 删掉。

## B-series benchmark testbench

即使项目被搁置，这部分思路依然有价值。

它原本的目标是：

- 扫描 `~/.claude/projects/**/*.jsonl`
- 找出最 noisy 的 tool calls
- 聚类成一组场景
- 把 compactor 重放到这些真实场景上
- 输出 reduction 效果和“关键行是否丢失”的报告

它既是 ship gate，也是最佳营销材料：“在你真实 30 天的 Claude Code 数据上，这个工具能省多少 token。”

## 推出顺序（原计划）

现在全部暂停，但原来计划的顺序是：

1. v0.0：只有 rule engine
2. v0.1：Claude Code hook 集成
3. v0.5：B-series benchmark testbench
4. v1.0：验证器层
5. v1.1：Codex + OpenClaw host 集成
6. v1.2+：扩展规则族与社区规则生态

## 风险分析

| 风险 | 严重度 | 缓解 |
|------|--------|------|
| RTK 自己补上 verifier | 低 | 先发先赢 |
| 平台原生 compaction 吃掉整个需求 | 中 | 我们本来定位的是更细粒度层 |
| 规则删掉关键诊断信息 | 高 | tee + verifier + benchmark |
| Haiku 成本失控 | 中 | fire-rate eval |
| 规则维护债 | 中 | toolVersion + discover |
| regex DoS | 中 | 每条 regex 50ms 超时 |
| benchmark 泄漏隐私 | 高 | 全程 local-only |

## 开放问题

1. 将来新的 built-in tool output API 具体长什么样？
2. 新 API 是只覆盖 Bash/WebFetch，还是也覆盖 Read/Grep/Glob？
3. 验证器模型是固定版本还是跟随升级？
4. `gstack compact discover` 将来是否应该能建议自动规则？

## 重新启动前必须完成的前置任务

1. **先实测新的 hook envelope 结构**
2. **复核 RTK 规则定义**
3. **把 analyze_transcripts 的 JSONL parser 移植成 TypeScript**
4. **先写 CHANGELOG 文案**
5. **先做一个 rule-only v0，测真实 savings**

## License 与归因

gstack 是 MIT。为了确保下游许可干净，这个项目遵循明确的 clean-room 原则：

- 只借鉴模式，不拷代码
- fixture 来自自己跑真实工具抓取，不从 RTK / tokenjuice 直接拿
- 引入新的参考项目时必须先检查 license
- 不接受 AGPL、GPL、SSPL 或其它 copyleft / source-available 许可污染

## 参考资料

- RTK
- tokenjuice
- caveman
- claude-token-efficient
- token-optimizer-mcp
- Claude Code hooks 文档
- Chroma / Morph 的 context rot 研究
- Anthropic / OpenAI / Google / LangChain / sst/opencode 的 compaction 工作

## 最后结论

这份文档的价值，不在于它能立即推进编码，而在于它已经把“为什么当前不能做”“哪些决策已经定死”“未来一旦 API 解锁该从哪里继续”全都整理好了。

所以它是一个**被搁置但已准备好的设计资产**：等平台能力一到，就能马上重新开工，而不是重新从零争论一遍。