---
tagline: "让界面达到 production-ready。边界情况、i18n、错误状态、溢出问题，全都要扛得住。"
---

## 何时使用

`/impeccable harden` 适合用在你的界面第一次真正撞上现实世界的那一天。真实用户数据总是很脏：60 个字符长的人名、德语产品标题、几十亿级价格、500 错误、离线模式、RTL 文本。只在“完美数据”下才能工作的设计，根本不算 production-ready。

在发版前、进入新市场前，或者任何一个 bug report 以 “our user had a really long name and...” 开头时，都应该拿出它。至于 first-run flow、empty-state activation 和 onboarding 设计，则更适合用 `/impeccable onboard`。

## 它是怎么工作的

这个 skill 会沿着四个“真实世界韧性维度”逐项推进：

1. **文本和数据极值**：超长文本、超短文本、特殊字符、emoji、RTL、十亿级数字、1000 项列表。
2. **错误场景**：网络失败、API 4xx / 5xx、校验错误、权限错误、限流、并发操作。
3. **国际化**：长翻译文本（德语通常比英语长 30%）、RTL 语言、日期与数字格式、货币符号、字符集。
4. **设备与上下文**：触控目标、离线行为、慢连接、低功耗模式。

对于每个维度，它都会先找出失效模式，再应用具体修复：overflow 处理、信息充分的错误 UI、对 i18n 安全的布局、正确复数规则、合理 fallback 等等。

## 试试看

先从一个页面和一个维度开始：

```text
/impeccable harden the user profile page for long names
```

预期输出大概像这样：

- `.user-name` 现在带有 `text-overflow: ellipsis`，并通过 tooltip 显示完整值
- `.bio` 从固定高度改成了 `max-height`，并加入 “show more” 展开
- 为没有 bio 的用户新增了 empty state
- 为异步头像请求增加了 skeleton loader
- 已测试名字长度分别为 1、20、60、200 字符时的表现

最好按页面分次运行，而不是试图一次把全站都 harden。第一轮通常收获最大，之后随着模式稳定下来，可发现的问题会越来越少。

## 常见误区

- **等 bug report 来了再修。** Harden 的本质是预防。如果你发现自己已经在修第二次同类 bug，就该对整块功能跑一次 `/impeccable harden`。
- **把错误状态和空状态当成边角料。** 大多数 hardening 工作其实都发生在错误和 empty state UI 上。给它们留时间，不要只写一个 `catch` block。
- **因为“我们目前只有英文”就跳过 i18n。** 对 i18n 安全的布局，本身就是更好的布局。灵活容器、正确换行、更合理的行高，这些对英文也一样是加分项。
