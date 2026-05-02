> **还需要额外上下文**：质量目标（MVP 还是旗舰级功能）。

执行一轮极其细致的最终检查，抓出那些把“还不错”拉到“真的很强”的小细节。也就是 shipped 和 polished 之间的差距。

## 设计系统发现

让功能和设计系统对齐，**不是可选项**。不对齐的 polish，只是在漂移之上再堆装饰，而且会让下一个维护者更痛苦。任何 polish 工作开始前，都必须先做 discovery。

1. **找到设计系统**：搜索设计系统文档、组件库、style guides 或 token 定义。研究核心模式：设计原则、目标受众、颜色 tokens、间距尺度、排版样式、组件 API、动效约定。
2. **记下约定**：共享组件如何导入？间距尺度是什么？哪些颜色来自 tokens，哪些是硬编码？已建立的动效与交互模式是什么？类似动作对应的 flow 形状是什么（modal 还是 full-page，inline 还是 route，save-on-blur 还是显式提交）？
3. **先识别 drift，再命名根因**：对每个偏离点，都要归类为 **missing token**（系统里本来应该有这个值，但没有）、**one-off implementation**（已有共享组件，但没有复用），或 **conceptual misalignment**（这个功能的 flow、IA 或 hierarchy 与周边功能不一致）。不同类别的修法完全不同——有的是补 token，有的是替换成共享组件，有的是重做 flow。只修症状、不说清根因，drift 就只会继续累积。

如果存在设计系统，polish **必须**让功能回到该系统之内。如果不存在设计系统，就按代码库中可见的约定去 polish。**凡是设计系统原则有歧义的地方，都要问，绝不能猜。**

## Polish 前评估

在改任何东西之前，先理解当前状态与目标：

1. **检查完成度**：
   - 功能是否已经完整？
   - 是否存在已知问题需要先保留（用 TODO 标出）？
   - 当前质量目标是什么？（MVP 还是旗舰级功能？）
   - 什么时候要上线？（留给 polish 的时间有多少？）

2. **以体验为先**：真正使用它的人是谁？对他们来说什么才是最好的体验？有效的设计永远胜过装饰性 polish——一个看起来漂亮、却让用户流程别扭的功能，根本不叫 polished。先站在用户视角走一遍流程，再打开 DevTools。

3. **识别 polish 区域**：
   - 视觉不一致
   - 间距与对齐问题
   - 交互状态缺失
   - 文案不一致
   - 边界情况和错误状态
   - 加载与过渡是否顺滑
   - 信息架构与 flow drift（这个功能揭示复杂度的方式，是否和邻近功能一致？）

4. **区分 cosmetic 与 functional**：把每个问题标成 **cosmetic**（看起来不对，但不阻碍用户）或 **functional**（会破坏、阻塞或混淆体验）。如果 polish 时间很紧，functional 问题先发，cosmetic 的可以留到 follow-up。质量要讲整体一致，不要只把一个角落打磨得发亮，剩下地方一团糙。

**CRITICAL**：Polish 必须是最后一步，而不是第一步。功能都没做完整，不要先抛光。

## 系统性地 Polish

按下面这些维度逐一处理：

### 视觉对齐与间距

- **像素级对齐**：所有东西都对齐到同一套网格
- **一致间距**：所有 gap 都应来自 spacing scale（不要出现随机的 13px）
- **光学对齐**：根据视觉重量做微调（例如 icon 可能需要偏一点，才显得真正居中）
- **响应式一致性**：所有断点下都维持稳定的间距与对齐
- **Grid adherence**：元素应贴合基线网格

**检查方式**：
- 打开 grid overlay 检查对齐
- 用浏览器 inspector 检查 spacing
- 在多个 viewport size 下测试
- 专门留意那些“说不出哪错了，但就是感觉不对”的元素

### 信息架构与流程

如果 flow 的骨架本身就是歪的，再怎么做视觉 polish 都是浪费。要让体验的 *形状* 与系统一致，而不是只把表面刷亮。

- **Progressive disclosure**：看当前功能揭示信息的节奏，是否与相邻功能一致。比如设置页一次性暴露 40 个字段，而产品其他区域都按 5 个一组逐步展开——即便每个字段样式都很精致，这仍然是 drift。
- **Established user flows**：多步操作的基本形态是否与同类流程一致——modal vs full-page、inline edit vs separate route、save-on-blur vs explicit submit、optimistic vs pessimistic updates。
- **Hierarchy & complexity**：同样重要级别的概念，在整个产品里应获得同样的视觉权重。一个 primary action 不应该在某个角落突然变成 tertiary，反之亦然。
- **Empty、loading、arrival transitions**：内容如何出现、更新、消失，是否和邻近功能一致。
- **Naming and mental model**：这个功能使用的名词和动词，是否和系统其它区域一致。这里叫 “Workspace”，三屏之后却叫 “Project”，就是 drift。

### 排版细化

- **层级一致性**：相同类型元素在全局使用相同大小 / 字重
- **行长**：正文保持在 45-75 个字符之间
- **行高**：应匹配字号和场景
- **Widows & orphans**：最后一行不要只剩一个孤零零的词
- **Hyphenation**：根据语言和列宽决定是否合理断词
- **Kerning**：必要时微调字距（尤其是标题）
- **Font loading**：不应出现 FOUT / FOIT 闪烁

### 颜色与对比

- **Contrast ratios**：所有文字都满足 WCAG
- **Consistent token usage**：不要有硬编码颜色，一律走 design tokens
- **Theme consistency**：所有主题变体下都正确
- **Color meaning**：相同颜色在全系统中表达相同意义
- **Accessible focus**：focus indicators 可见，并且对比度足够
- **Tinted neutrals**：不要用纯灰或纯黑——应加入极微弱色相偏移（约 0.01 chroma）
- **Gray on color**：不要在彩色背景上放灰字——应用背景色的更深同类色，或透明度处理

### 交互状态

每个交互元素都必须具备这些状态：

- **Default**：静止态
- **Hover**：微妙反馈（颜色、scale、shadow）
- **Focus**：键盘焦点指示（绝不能无替代地移除）
- **Active**：点击 / 触摸反馈
- **Disabled**：明确不可用
- **Loading**：异步动作反馈
- **Error**：校验或错误状态
- **Success**：完成成功反馈

**缺状态就是制造困惑和断裂体验。**

### 微交互与过渡

- **Smooth transitions**：所有状态切换都应有合适动画（150-300ms）
- **Consistent easing**：统一使用 ease-out-quart / quint / expo 实现自然减速。不要用 bounce 或 elastic——会显得过时。
- **No jank**：所有动画都必须顺滑；可以使用 blur / filter / mask / shadow 增强质感，但要控制昂贵 paint 区域，避免随意动画化布局属性
- **Appropriate motion**：动效服务于功能，而不是纯装饰
- **Reduced motion**：必须尊重 `prefers-reduced-motion`

### 内容与文案

- **术语一致**：同样的东西全局使用同样的名字
- **大小写一致**：Title Case / Sentence case 的选择要统一
- **语法和拼写**：不能有错字
- **长度合适**：不能太啰嗦，也不能太短
- **标点一致**：完整句子用句号，标签通常不用（除非所有标签都统一加）

### 图标与图片

- **风格一致**：所有 icon 来自同一家族，或至少风格匹配
- **尺寸合理**：icon 在各场景下尺寸一致
- **对齐正确**：icon 与相邻文字在光学上居中
- **Alt text**：所有图片都有描述性 alt text
- **加载状态**：图片不会导致 layout shift，且带正确 aspect ratio
- **Retina support**：高 DPI 屏幕使用 2x 资源

### 表单与输入

- **Label consistency**：所有输入项都被正确标注
- **Required indicators**：必填标识清晰且一致
- **Error messages**：帮助性强且一致
- **Tab order**：键盘导航逻辑正确
- **Auto-focus**：在合适处使用（不要滥用）
- **Validation timing**：触发时机一致（on blur vs on submit）

### 边界情况与错误状态

- **Loading states**：所有异步动作都有 loading 反馈
- **Empty states**：空状态应有帮助性，而不是一片空白
- **Error states**：错误信息明确，并带恢复路径
- **Success states**：成功后给出确认
- **Long content**：超长名称、描述等能被正确承载
- **No content**：缺失数据时有优雅降级
- **Offline**：如果适用，具备合理的离线处理

### 响应式

- **All breakpoints**：移动端、平板、桌面都要测
- **Touch targets**：触屏上至少 44x44px
- **Readable text**：移动端不要出现小于 14px 的文本
- **No horizontal scroll**：内容不能撑爆视口
- **Appropriate reflow**：内容应当逻辑化地重排

### 性能

- **Fast initial load**：优化 critical path
- **No layout shift**：加载后元素不跳（CLS）
- **Smooth interactions**：无 lag、无 jank
- **Optimized images**：格式和尺寸都合理
- **Lazy loading**：屏外内容延迟加载

### 代码质量

- **Remove console logs**：生产代码里不要留 debug logging
- **Remove commented code**：清理死代码
- **Remove unused imports**：清理未使用依赖
- **Consistent naming**：变量和函数命名遵循约定
- **Type safety**：不要残留 TypeScript `any` 或被忽略的错误
- **Accessibility**：正确使用 ARIA labels 和语义化 HTML

## Polish 清单

系统化过一遍：

- [ ] 已与设计系统对齐（并且 drift 的根因已命名并修复）
- [ ] 信息架构和 flow 形状与相邻功能一致
- [ ] 所有断点下视觉对齐都准确
- [ ] 间距统一使用 design tokens
- [ ] 排版层级一致
- [ ] 所有交互状态已实现
- [ ] 所有过渡平滑（60fps）
- [ ] 文案一致且经过打磨
- [ ] 图标风格统一、尺寸正确
- [ ] 所有表单都已正确标注和校验
- [ ] Error states 有帮助性
- [ ] Loading states 明确
- [ ] Empty states 友好
- [ ] Touch targets 至少 44x44px
- [ ] 对比度符合 WCAG AA
- [ ] 键盘导航可用
- [ ] Focus indicators 可见
- [ ] 没有 console errors 或 warnings
- [ ] 加载时无 layout shift
- [ ] 在所有支持的浏览器中工作正常
- [ ] 尊重 reduced motion
- [ ] 代码已清理（无 TODO、无 console.logs、无注释掉的死代码）

**IMPORTANT**：Polish 本质上就是细节。放大看。眯眼看。自己真的用一遍。那些小东西加起来，才会变成“真有质感”。

**NEVER**：
- 不要在功能还没完整前就开始 polish
- 不要在不对齐设计系统的前提下做 polish——那只是漂移上的装饰
- 不要在设计系统有歧义时自己猜，应该先问
- 不要在 30 分钟后就要上线的情况下花 3 小时做 polish（要会 triage）
- 不要为了 polish 引入 bug（一定要认真测试）
- 不要忽视系统性问题（如果全局 spacing 都有问题，就修系统，不要只补一屏）
- 不要把一个局部打磨到发亮，剩下区域仍然粗糙（质量必须统一）
- 不要在已有 design system 组件可用时另起一个 one-off 组件
- 不要硬编码本该使用 design tokens 的值
- 不要发明新的 flow 或模式去偏离既有体系

## 最终验证

在标记完成前，必须：

- **自己用一遍**：真的去交互这个功能
- **在真实设备上测试**：不要只看浏览器 DevTools
- **让别人看一眼**：新鲜视角总能发现问题
- **对照设计目标**：确认与预期设计一致
- **检查所有状态**：不能只测 happy path

## 收尾清理

在 polish 完成后，顺手把代码质量也收尾：

- **Replace custom implementations**：如果 design system 本来就提供某个组件，而你自己重写了一份，就换回共享版本
- **Remove orphaned code**：删除因为 polish 而被淘汰的样式、组件或文件
- **Consolidate tokens**：如果你引入了新值，确认它是否应该进入 token 系统
- **Verify DRYness**：检查 polish 过程中是否引入重复，并及时收束

记住：你应该具备近乎偏执的细节敏感和极高的审美判断。一直 polish，直到它显得毫不费力、每个决定都像是有意为之，而且工作起来没有破绽。细节真的会决定质感。
