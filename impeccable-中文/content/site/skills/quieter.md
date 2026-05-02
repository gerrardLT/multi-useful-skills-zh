---
tagline: "把那些正在大喊大叫的设计收住，但不丢掉它原本的意图。"
---

## 何时使用

`/impeccable quieter` 是 `/impeccable bolder` 的反向配重。当一个界面显得过于具有攻击性、过度刺激，或者试图把太多东西都开到满音量时，就该用它。比如：暗色底上的霓虹、到处都是 gradient text、6 种强调色、所有东西都在动、20px 阴影。你希望这个设计能呼吸一下，又不想失去它原本的观点时，就该用 quieter。

在 `/impeccable bolder` 推得稍微过头之后，它也很适合拿来收一下。

## 它是怎么工作的

这个 skill 会沿四个轴做减法：

1. **Color**：降低饱和度、在 OKLCH 中减少 chroma，把强调色收回到一个 primary + 若干 muted support。不要超过两种有意为之的颜色。
2. **Contrast**：缓和最极端的黑白，把范围往中间拉。背景从纯白、纯黑改成 paper 和 ink。
3. **Decoration**：去掉那些不承担任务的阴影，撤掉那些不提供结构的边框，淘汰那些只是为了显得“有劲”而存在的渐变。
4. **Motion 与效果**：放慢动画，去掉自动播放的东西，把 parallax 和 blur 删掉，除非它们直接服务于可读性。

这个 skill 会保留设计原本的意图。如果原版是有观点的，那么 quieter 之后的版本应该仍然有同样的观点，只是更有分寸、更有把握。它追求的是 refinement，不是 neutralization。

## 试试看

```text
/impeccable quieter the pricing page
```

典型 diff：

- 价格上的 gradient text 被移除，换成更重一档的纯色 ink
- 三种强调色收敛成一种（magenta），另外两种退回中性色变体
- Card shadows 从 `0 20px 40px rgba(0,0,0,0.2)` 收成 `0 1px 0 var(--color-mist)`（像发丝一样轻的线）
- 背景从 dark gradient 改成 paper，并在顶部加一层轻微的 cream wash
- Hero animation 从 1.2s easeOut + 3 个 staggered elements，收成单一 260ms fade-in

## 常见误区

- **收得过头。** Quieter 如果用在本来就已经拿捏得很好的设计上，会把个性一起洗掉。它适合用在“太吵”的设计上，而不是“该有主张”的设计上。
- **把 quieter 和 distill 混在一起。** Quieter 降的是强度；Distill 删的是元素。这是两种完全不同的动作。
- **因为 critique 说 “too busy” 就直接跑 quieter。** Busy 往往意味着东西太多，而不是声音太大。这种情况更应该先试 `/impeccable distill`。
