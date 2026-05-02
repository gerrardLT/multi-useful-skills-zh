# 用户故事模板

使用此模板编写单条用户故事，并附带 Gherkin 风格的验收标准。

## 来源
改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/user-story-prompt-template.md`。

## 模板
```markdown
### User Story [ID]:

- **Summary:** [简短、易记的标题，聚焦用户价值]

#### Use Case:
- **As a** [如有用户名则填写，否则填写用户画像或角色]
- **I want to** [用户为达成结果所采取的行动]
- **so that** [用户期望获得的结果]

#### Acceptance Criteria:
- **Scenario:** [简短、可读的场景描述，体现价值]
- **Given:** [初始上下文或前提条件]
- **and Given:** [额外的上下文或前提条件]
- **and Given:** [根据需要添加的额外上下文]
- **and Given:** [聚焦界面的上下文，确保 When 可以发生]
- **and Given:** [聚焦结果的上下文，确保 Then 能够交付]
- **When:** [触发操作的事件]
- **Then:** [与 "so that" 对应的预期结果]
```

## 说明
- 只使用一个 **When** 和一个 **Then**。如果出现多组 When/Then，通常意味着这个 story 应该被拆分。
- 如果你需要多个结果，请使用 `skills/user-story-splitting/SKILL.md` 来拆分 story。