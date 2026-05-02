# 用户故事拆分模板

使用此模板将一个较大的 story 拆分成更小、可独立交付的用户故事。

## 来源
改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/user-story-splitting-prompt-template.md`。

## 拆分逻辑（按顺序使用）
1. 工作流步骤
2. 业务规则变化
3. 数据变化
4. 验收标准复杂度（多组 When/Then）
5. 主要工作量里程碑
6. 外部依赖
7. DevOps 步骤
8. 如果都不适用，则用 Tiny Acts of Discovery（TADs）

## 输出模板
```markdown
### Original Story
[Story written using `skills/user-story/template.md`]

### Suggested Splits
1. Split 1 using **[rule name]**:
   - [Left split story, using `skills/user-story/template.md`]
   - [Right split story, using `skills/user-story/template.md`]
2. Split 2 using **[rule name]**:
   - [Left split story]
   - [Right split story]
3. Split 3 using **[rule name]**:
   - [Left split story]
   - [Right split story]
```

## 说明
- 每个拆分后的 story 都应能独立交付用户价值。
- 如果没有合适的拆分规则，先提出 TADs 来降风险并澄清问题，再写 stories。