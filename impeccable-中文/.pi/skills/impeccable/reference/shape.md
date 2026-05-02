在写任何代码之前，先把某个功能的 UX 和 UI 方向塑形清楚。这个命令的产物是一份 **design brief**，它通过探索来指导实现，而不是靠猜。

**范围：** 只做设计规划，不写代码。它产出的是让代码变好的那份思考。

**输出：** 一份 design brief，可以交给 `$impeccable craft`，也可以直接交给 `$impeccable` 自由实现。如果过程中用了视觉方向探针，图像只是辅助产物，不是主输出。

## Philosophy

大多数 AI 生成 UI 失败，并不是因为代码差，而是因为它在开头跳过了思考。模型会直接冲向“这是一个 card grid”，却没先问“用户到底要完成什么？” 这个命令就是把流程反过来：先把理解做深，再让实现变得准确。

## Phase 1: Discovery Interview

**这个阶段不要写任何代码，也不要提前做设计决定。** 你的唯一任务，是把这个功能理解到足够深，深到后面可以做出优秀设计判断。

这不是可选建议，而是必须发生的交互。要在对话中逐步提问，并根据回答调整，不要一次性把所有问题都甩出去。优先使用 Codex 的结构化提问工具；如果当前环境没有，就直接在对话里发问。

### 提问节奏

除非 `PRODUCT.md`、`DESIGN.md` 或一份已经确认过的 brief 已经直接回答了所需设计输入，否则 discovery 至少要包含一轮真实用户回答。面对一个很稀薄的 prompt，**不要**在第一条回复里就直接综合出一整份完整 brief 让人确认。

- 有结构化提问工具就用它；没有就直接问，并停下来等答复
- 每轮问 **2 到 3 个问题**
- 把 `PRODUCT.md` 和 `DESIGN.md` 当作锚点，它们能减少重复问题，但不能替代 shape，这一步仍然是任务特定的
- 第一轮聚焦功能目的、用户 / 场景、成功指标或情绪目标
- 第二轮聚焦内容 / 数据 / 状态，以及范围 / 保真度
- 第三轮聚焦视觉方向、约束和 anti-goals

### Purpose & Context

- 这个功能是干什么的？它解决什么问题？
- 谁会用它？别说“users”，要具体到角色、场景、频率
- 成功是什么样？你怎么判断这个功能有效？
- 用户来到这里时是什么心理状态？赶时间、探索中、焦虑、还是非常专注？

### Content & Data

- 这个功能要展示或收集什么内容 / 数据？
- 真实的数据范围是什么？最少、典型、最多分别是多少？
- 边界情况有哪些？空状态、错误状态、首次使用、重度用户……
- 哪些内容是动态的？什么会变，多久变一次？

### Design Direction

在三个维度上逼出明确方向。如果 `PRODUCT.md` 或 `DESIGN.md` 已经回答了其中一部分，就跳过，只问缺的。

- **这个页面的颜色策略。** 必须在 Restrained / Committed / Full palette / Drenched 之间选一个。它可以覆盖项目默认值，只要这个页面配得上
- **用一句“场景句子”定义主题。** 这个页面是谁在什么地方、什么光线、什么情绪下使用的？这句话会迫使你选出偏向 light 还是 dark。如果还推不出来，就继续补细节
- **给出 2 到 3 个有名有姓的锚点参考。** 可以是具体产品、品牌、实体对象，但不要只说“modern”“clean”这种形容词

### Scope

这一部分一定要问。草图质量和可上线质量不是一回事，不要自己猜。

- **Fidelity**：sketch / mid-fi / high-fi / production-ready？
- **Breadth**：一张屏、一个 flow，还是整块 surface？
- **Interactivity**：静态视觉、交互原型，还是可上线组件？
- **Time intent**：只是快速探索，还是要一直打磨到能上线？

这些 scope 回答只对当前任务有效，不要写回 `PRODUCT.md` 或 `DESIGN.md`，只在 design brief 中携带。

### Constraints

- 技术约束是什么？框架、性能预算、浏览器支持……
- 内容约束是什么？本地化、动态文本长度、UGC……
- 是否有移动端 / 响应式要求？
- 是否有高于 WCAG AA 的额外无障碍要求？

### Anti-Goals

- 什么方向绝对不应该走？
- 这个功能做错时最大的风险是什么？

## Phase 1.5: Visual Direction Probe（按能力启用）

在 discovery interview 之后、正式写最终 brief 之前，如果满足以下条件，就先生成一组小规模视觉方向探针：

- 这是 **全新工作**，或者方向仍然足够模糊，视觉探索能显著帮助厘清 brief
- 要求保真度为 **mid-fi、high-fi 或 production-ready**
- 当前 harness 拥有 **原生图片生成能力**。不要为了这个步骤要求用户再额外配置 API、脚本或外部工具

只要这些条件成立，这一步对 Codex 和所有支持原生图片生成的 harness 都是强制的。Codex 中请通过 imagegen skill 调用内置 `image_gen` 工具。如果当前环境没有图片生成能力，就只用一句话说明跳过原因，然后继续。

这些探针是拿来测试方向的，不是拿来替代 brief 的。

不要因为最终 UI 会是语义化的、可编辑的、代码驱动的、响应式的或无障碍的，就跳过这一步。那些是实现要求，不是拒绝做视觉探索的理由。

### 要生成什么

生成 **2 到 4** 个不同方向的探针，差异重点应来自：

- 颜色策略
- 主题场景句子
- 锚点参考
- scope 和 fidelity

这些探针的差别应该落在主视觉方向上，例如层级、拓扑、密度、排版语气或色彩策略，而不是只换一下配色。

### 怎么使用这些探针

- 把它们当成 **方向测试**，不是最终设计
- 用它们来检验 brief 所指向的赛道是否正确
- 问用户哪一个方向最接近、哪里不对、哪些东西值得保留
- 如果探针暴露出方向不对，就回头修 brief，而不是硬往下写

### 重要限制

- 不要因为能生成图片，就跳过 discovery
- 不要把生成图像当成最终 UX 规格、最终文案或最终无障碍规范
- 不要把这一步用于已有设计的细微修补，它只适合塑造新页面或澄清重大方向选择

如果图片生成能力不可用，或者这个任务根本不需要它，就只用一句话说明跳过原因，然后直接进入 design brief。

## Phase 2: Design Brief

在 interview 和任何必要的 probe 完成后，把所有内容综合成一份结构化 design brief。必须呈现给用户，并要求**明确确认**，然后这个命令才算完成。除非用户已经明确批准 brief，否则不要在同一条回复里继续 craft 或实现。

### Brief Structure

**1. Feature Summary**  
2 到 3 句话。说明它是什么、为谁服务、需要完成什么。

**2. Primary User Action**  
用户在这里最重要的动作，或者最重要的理解目标。

**3. Design Direction**  
颜色策略（Restrained / Committed / Full palette / Drenched）+ 场景句子 + 2 到 3 个锚点参考。若 `PRODUCT.md` 或 `DESIGN.md` 已经回答过，请直接引用；如果当前页面做了 override，也要写明。

如果你执行了 Visual Direction Probe，就要说明最后是哪一个方向胜出，以及它如何改变了 brief。

**4. Scope**  
写出 fidelity、breadth、interactivity、time intent。这些都是任务级输入，不会持久化。

**5. Layout Strategy**  
高层空间策略：什么该被强调，什么是次级，信息如何流动。描述视觉层级与节奏，而不是具体 CSS。

**6. Key States**  
列出功能需要支持的所有状态：default、empty、loading、error、success 和边界情况。每个状态都要写出用户应该“看到什么”和“感受到什么”。

**7. Interaction Model**  
用户怎样与这个功能交互。点击、hover、滚动时会发生什么？反馈是什么？从进入到完成的路径怎样？

**8. Content Requirements**  
需要哪些文案、标签、空状态文案、错误提示和 microcopy。注明任何动态内容及其真实范围。

**9. Recommended References**  
根据这份 brief，列出实现时最值得参考的 impeccable reference 文件，例如 `spatial-design.md`、`motion-design.md`、`interaction-design.md`

**10. Open Questions**  
所有仍未解决、需要实现者继续判断的问题

---

优先使用 Codex 的结构化提问工具；如果没有，就直接在对话里问。一定要要求用户对 brief 给出明确确认。如果用户不同意其中某部分，就回到对应的 discovery 问题重新澄清。没有被确认的 shape run，不算完成。

一旦 brief 被确认，就表示这一步结束了。用户接下来可以把它交给 `$impeccable`，或者拿去指导任何其他实现方式。（如果用户想一条命令完成 discovery 再进入构建，应使用 `$impeccable craft`，因为它内部会调用本命令。）
