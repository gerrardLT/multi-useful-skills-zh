# Brand register

当设计本身就是产品时，就进入这个 register：品牌站、落地页、营销页面、活动页、作品集、长内容页面、关于页。这里真正要交付的就是设计本身，访客的第一印象就是作品的一部分。

这个 register 覆盖很多不同门类。它可以是科技品牌（Stripe、Linear、Vercel），也可以是奢侈品牌（酒店、时装屋），也可以是消费品牌（餐厅、旅行网站、消费品包装页），还可以是创意工作室、代理公司作品集、乐队专辑页面。它们共同的姿态是：*沟通，而不是交易*。但它们的审美可以截然不同，不要把它们压扁成一种统一长相。

## 品牌页面的 slop 测试

如果有人看一眼就能毫不犹豫地说“这是 AI 做的”，那它已经失败了。这里的标准是辨识度：访客应该会问“这个是怎么做出来的？”，而不是“这是哪个 AI 做的？”

品牌不是一个中性 register。互联网上已经被 AI 生成的平均化落地页淹没了，普通已经不再可见。没有意图的克制，现在看起来不是高级，而是平庸。品牌页面需要鲜明立场、明确受众，以及愿意承担一点陌生感的勇气。要么大胆，要么回家。

**第二个 slop 测试：审美赛道。** 在真正开始出手之前，先说出参考对象。Klim 风格的 specimen page 是一条赛道；Stripe 式极简是另一条；Liquid Death 式酸性极繁又是另一条。不要在一个根本不是 editorial brief 的项目里，漂移到杂志社论风。一个徒步品牌如果用了 Cormorant 斜体首字下沉，它在品牌这个 register 里就进错了子 register。

## 排版

### 字体选择流程

每个项目都要走一遍，绝不跳过。

1. 先读 brief，写出 3 个具体的品牌语气词。不要写“现代”“优雅”这种空词，而是写“温暖、机械、有主见”之类能让人联想到实体物件的词。
2. 列出你下意识最先会选的 3 个字体。如果其中有任何一个出现在下面的 reflex-reject list，就把它踢掉。它们是训练语料默认项，会制造审美单一化。
3. 带着那 3 个词去真实字体库里找：Google Fonts、Pangram Pangram、Future Fonts、Adobe Fonts、ABC Dinamo、Klim、Velvetyne。把这个品牌当成一个*实体物件*来找字体：它像博物馆标牌、70 年代终端手册、布标、廉价新闻纸儿童书、演唱会海报，还是一家中世纪 diner 的收据？第一个“看起来很设计”的选择，通常正该拒绝。
4. 交叉审视。Elegant 不一定是 serif，technical 不一定是 sans，warm 也不一定是 Fraunces。如果最后的选择刚好和最初本能一致，就重来一遍。

### 下意识排除清单

这些是训练数据默认项，要继续往外找：

Fraunces / Newsreader / Lora / Crimson / Crimson Pro / Crimson Text / Playfair Display / Cormorant / Cormorant Garamond / Syne / IBM Plex Mono / IBM Plex Sans / IBM Plex Serif / Space Mono / Space Grotesk / Inter / DM Sans / DM Serif Display / DM Serif Text / Outfit / Plus Jakarta Sans / Instrument Sans / Instrument Serif

### 字体搭配与语气

目标是“有辨识度，同时足够精致”，但具体形状要服从品牌本身：

- **Editorial / 长文 / 奢侈品**：display serif + sans 正文，是典型“杂志式”形状
- **Tech / dev tools / fintech**：通常一个明确的 sans 就够了，通过 tracking 和字重对比建立层次
- **Consumer / food / travel**：更温暖的组合，经常是 humanist sans 配 script 或 display serif
- **Creative studios / agencies**：欢迎打破规则，可以是全 mono、全 display，或者把手绘字体本身当成语气

“至少两套字体”只在品牌语气真的需要时才成立。一个选得非常到位、并且在字重与尺寸上有明确对比的单字体家族，往往比一个胆小的 display+body 组合更强。

项目之间要有变化。如果上一个 brief 已经是 serif-display 落地页，这一个就别再复刻。

### 比例

使用 modular scale，标题用 fluid `clamp()`，层级间比例至少 1.25。那种一级比一级只大 1.1 倍的扁平比例，会显得没有立场。

浅色文字放在深色背景时，行高要再加 0.05 到 0.1。浅色字看起来会更轻，也更需要呼吸空间。

## 颜色

品牌页面有资格使用 Committed、Full palette 和 Drenched。就用。一个 hero 区域被高饱和色彻底占领，并不算过火，那就是语气本身。那种米色配柔灰蓝的落地页，只是在否认自己所处的 register。

- 在选策略前，先说出一个真实参考对象。“Klim Type Foundry 那种 #ff4500 橙色浸染”“Stripe 的紫色配白色克制感”“Liquid Death 的酸性绿色全色板”“Mailchimp 的亮黄全色板”“Condé Nast Traveler 的柔和海军蓝克制方案”“Vercel 的纯黑单色”……没有命名的野心，最后通常都会滑回米色。
- 色板本身就是语气。一个安静的品牌和一个躁动的品牌，不该共享同一套配色机制。
- 当策略是 Committed 或 Drenched 时，颜色本身就是承重结构。不要再用一圈中性色去打退堂鼓，直接表态。
- 项目之间不要收敛到同一套配色习惯。如果上一个品牌页面是 restrained-on-cream，这次就别再来一遍。

## 布局

- 不对称构图可以成立。只要是为了强调而故意打破网格，它就是有效选择。
- 用 `clamp()` 做 fluid spacing，让大屏幕真正“呼吸”。通过宽松留白和紧密分组制造节奏。
- 另一种路径是把严格、可见的网格本身当成语气，例如 brutalist、Swiss、tech-spec 风。无论是不对称，还是极端严整的网格，都能显得“经过设计”；真正失败的是两边都不敢选，最后变成普通的居中堆叠。
- 不要默认把所有东西居中。左对齐加不对称布局，会显得更像被设计过；严格网格则体现自信结构。一个居中 hero 再配图标 + 标题 + 副标题的卡片堆，很容易直接变模板味。
- 如果卡片确实是合理 affordance，就用 `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`，实现无断点响应式。

## 图像

品牌页面本来就依赖图像。餐厅、酒店、杂志或产品型落地页如果完全没有图像，读起来不会像“克制”，只会像“没做完”。一个本该放 hero 图的地方，如果你只放纯色块，那通常比一张代表性的素材图还糟。

**只要 brief 暗示了图像需求（餐厅、酒店、杂志、摄影、兴趣社群、食品、旅行、时尚、产品），你就必须交付图像。** 零图像不是一种选择，而是一个 bug。“克制”不是借口。

- **如果是绿地项目、手头又没有本地素材，就用 stock 图。** 默认首选 Unsplash。URL 形态通常是 `https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=1600&q=80`。尽量挑你确信存在的真实 Unsplash photo ID；如果不确定，宁可少放几张，也不要拿彩色 `<div>` 当占位。
- **搜索时找品牌的“实体感”，不是泛泛品类。** “刮痕木桌上的手工意面”比“意大利食物”强；“暮色下石灰岩酒店立面前的柏树”比“豪华酒店”强。
- **一张有决断的图，比五张平庸图更有价值。** Hero 图应该一次性把情绪钉住，多塞几张图库图并不能补救犹豫。
- **Alt text 也是品牌语气的一部分。** “海边露台上手切的海岸风 fettuccine”比“意面菜品”更有声音。

Tech / dev-tool 品牌是少数“零图像也可能正确”的例外。开发者落地页通常可以只靠排版、代码示例和图解建立语气。关键是先搞清楚你做的是哪一种品牌。

## 动效

- 当品牌气质允许时，一次编排得体的首屏加载动画，往往比零碎的 micro-interaction 更有效。反过来，极简技术品牌有时完全不需要入场动画，克制本身就是语气。
- 做折叠 / 展开时，优先 transition `grid-template-rows`，不要去动 `height`。

## 品牌禁令（在共享的绝对禁令之外）

- 用 monospace 作为“技术感 / 开发者感”的偷懒速记。如果品牌本身不技术，mono 只会像戏服。
- 每个标题前都放一个大圆角图标，模板味很重。
- 只是出于本能挑的单字体页面。单字体不是不行，但前提是它是刻意选择，而不是条件反射。
- 全大写正文。大写只留给短标签和标题。
- 胆小的色板和普通的布局。太安全，就是不可见。
- 对明明需要图像的 brief（餐厅、酒店、食品、旅行、时尚、摄影、兴趣社群）交付零图像。用彩色块占 hero 位更不行。
- 把 editorial-magazine 美学（display serif + italic + 首字下沉 + broadsheet grid）当成默认品牌美学。Editorial 只是其中一个赛道，不是默认答案。

## 品牌允许的做法

品牌页面能承担产品页面承受不起的东西。就去用。

- 更野心勃勃的首屏动效：揭示、滚动触发过渡、排版编舞
- 单一主题驱动的视口：每一屏只做一个主张、长滚动、有意图的节奏
- 更冒险的排版：巨大的 display 字、意外的 italic cut、大小写混排、手绘标题、只用一个过大的单词做 hero
- 更出格的色彩策略。色板就是语气，安静的品牌和躁动的品牌不该共享同一套色彩逻辑
- 每个 section 可以有不同 art direction。只要叙事需要，不同 section 完全可以处在不同视觉世界里。真正重要的是 voice 一致，而不是 treatment 一致
