---
tagline: "每个命令背后的设计智能。"
---

## 何时使用

`/impeccable` 是主命令。当你想直接做自由设计工作，并一次性加载整本指南，而不想先挑一个专门命令时，就直接调用它。它是那种“23 个专家命令（`audit`、`polish`、`critique` 等等）里没有一个能准确对应你的问题”时，你应该优先拿起的兜底入口。

下面这些情况，适合直接用 `/impeccable`：

- **你不确定该用哪个命令。** 用自然语言描述需求，让这个 skill 自己挑合适的方法。
- **这项工作跨越了多个设计领域。** 比如“把这个 hero section 重做一下”，会同时牵涉 layout、字体、颜色和动效。没有一个单独命令能完全覆盖。
- **你想要完整的设计智能，而不是被流程限制。** 所有 reference 文件全部加载，所有 anti-pattern 都会被检查，没有预设流程框住你。

如果你需要结构化流程，就去用侧边栏里的专门命令。对任何新项目，都应先运行 `/impeccable teach` 来建立 PRODUCT.md 和 DESIGN.md。`/impeccable craft` 会把 discovery interview 与完整构建和 live 可视化迭代串起来。`/impeccable shape` 会产出设计 brief，但不碰代码。`/impeccable live` 会给你一个浏览器 picker，并为每个元素生成三个变体。评估和精修类命令（`audit`、`critique`、`polish`、`typeset`、`layout`、`colorize` 等）则各自负责工作中的一个具体切片。

## 它是怎么工作的

大多数 AI 生成的 UI 都以同样的方式失败：泛泛的字体、紫色渐变、卡片套卡片的网格、到处都是玻璃拟态。`/impeccable` 给你的 AI 一个明确立场。它会加载一套强主观看法的设计手册和一长串 anti-pattern，然后强迫模型在写第一行代码前，先承诺一个具体的审美方向。

项目根目录下有两个文件会决定这个 skill 的所有行为：

- **`PRODUCT.md`** 负责 register（brand vs product）、目标用户、品牌个性、anti-references、设计原则。回答的是 “是谁、做什么、为什么”。
- **`DESIGN.md`** 负责颜色、字体、层级、组件，以及该做与不该做的事，采用六段式 Google Stitch 格式。回答的是 “它看起来该是什么样”。

每个命令在生成前都会读取这两个文件。**Register** 是真正承重的那个开关。Brand（营销站、落地页、作品集，设计本身就是产品）和 product（应用 UI、dashboard、工具，设计是为产品服务）在字体、动效、颜色和密度上的默认值完全不同。在 PRODUCT.md 里只指定一次，后续 `/impeccable typeset` 就不会把杂志感字体硬塞给 dashboard，也不会把产品感默认值塞进 campaign page。关于两者的分歧，参见 [brand vs product tutorial](/tutorials/brand-vs-product)。

在项目第一次使用时，skill 会自动跑 `teach` 流程：一个简短访谈，写出 PRODUCT.md，然后委托 `/impeccable document` 去生成 DESIGN.md。之后的命令都会直接读取这两个文件，不再重复询问。

## 试试看

```text
/impeccable redo this hero section
```

```text
/impeccable build me a pricing page for a developer tool
```

这两个 prompt 故意写得很模糊。`/impeccable` 会基于你的 register 选择一个强烈而明确的审美方向，坚持使用非默认字体，避开 AI 常见配色，并做出真正像设计师会做的具体决策。你不需要先想好命令名，也不需要按步骤流程走。

如果你想在浏览器里可视化迭代，而不是在聊天里来回：

```text
/impeccable live
```

在正在运行的 dev server 上任选一个元素。放个 comment 或 stroke。它会通过 HMR 热替换三个 production-quality variants。接受你喜欢的那个，它就会写回 source。

## 把命令重新 pin 成快捷方式

v3.0 把原来的 18 个独立 skills 合并成了一个 `/impeccable`，带 23 个 sub-commands。如果你怀念某个命令的短形式，可以把它 pin 回来：

```text
/impeccable pin critique
```

从此以后，`/critique` 就会直接调用 `/impeccable critique`。它写的是一个轻量级 redirect skill，委托给父 skill，因此以后 skill 更新时也会自动跟过去，不需要重新 pin。

可以试试这些常用 pin：

- `/impeccable pin polish` 适合做最终打磨
- `/impeccable pin audit` 适合做确定性的 a11y / 性能检查
- `/impeccable pin live` 适合浏览器迭代流程
- `/impeccable pin critique` 适合做设计评审

移除方法：`/impeccable unpin critique`。这些 pins 会以 `i-` 前缀目录的形式存放在你的 harness skills 文件夹里（如 `.claude/skills/i-critique/`、`.cursor/skills/i-critique/` 等），所以你也可以手动删除。

## 常见误区

- **把它当成 style guide。** 它是一个有主见的设计伙伴，不是 linter。默认值的意义是抬高下限，而不是取代你的判断。如果你有明确理由反驳它（品牌规范、可访问性约束、用户研究），那就反驳并说明原因。这个 skill 会配合你。真正导致结果变差的，是在没有理由的情况下无视它的意见。
- **指望它帮你修现有代码。** `/impeccable` 更适合做创建。如果是精修，请改用 `/impeccable polish`、`/impeccable distill` 或 `/impeccable critique`。
- **在 `teach` 还没来得及保存上下文前就直接运行。** 在全新项目里它会中途采访你，这当然也能用，但会慢一点。把 `/impeccable teach` 明确当成第一条命令，会更顺一点。
- **跳过 register 问题。** Brand 和 product 的默认值差异足够大，跑错 register 时产出的结果会微妙地不对。如果 `PRODUCT.md` 里还没有 `## Register` 字段（旧版遗留），就运行 `/impeccable teach` 把它补上。
