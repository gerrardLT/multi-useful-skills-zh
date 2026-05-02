# 计划：快照下拉/Autocomplete交互元素检测

## 问题

`snapshot -i` 错过了现代网络应用程序上的下拉/autocomplete 项目。这些要素：
1. 通常是 `<div>`/`<li>` 带有点击处理程序，但没有语义 ARIA 角色
2. 生活在动态创建的门户/popovers（浮动容器）中
3. 不会出现在 Playwright 的辅助功能树中 (`ariaSnapshot()`)

`-C` 标志（光标交互式扫描）是为此设计的，但是：
- 需要单独的标志 - 使用 `-i` 的代理不会自动获取它
- 跳过具有 ARIA 角色的元素（即使 ARIA 树错过了它们）
- 不优先考虑下拉项所在的 popover/portal 容器

## 根本原因

Playwright 的 `ariaSnapshot()` 从浏览器的可访问性树构建。如果出现以下情况，动态渲染的弹出窗口（React 门户、Radix Popover 等）可能不会出现在可访问性树中：
- 该组件不设置 ARIA 角色
- 门户在 `body` 定位器的子树计时范围之外呈现
- DOM 突变后浏览器尚未更新可访问性树

## 变化

### 1. 使用 `-i` 标志自动启用光标交互式扫描

**文件：** `browse/src/snapshot.ts`

当传递 `-i` （交互式）时，自动包含光标交互式扫描。这意味着代理在请求交互元素时始终会看到可点击的非 ARIA 元素。

`-C` 标志仍然作为非交互式快照的独立选项。

```
if (opts.interactive) {
  opts.cursorInteractive = true;
}
```

### 2.添加popover/portal优先扫描

**文件：** `browse/src/snapshot.ts` （在光标交互式评估块内）

在一般光标：指针扫描之前，专门扫描可见的浮动容器（弹出窗口、下拉菜单、菜单）并将其所有直接子项包含为交互式：

浮动容器的检测启发式：
- `position: fixed` 或 `position: absolute` 与 `z-index >= 10`
- 有 `role="listbox"`、`role="menu"`、`role="dialog"`、`role="tooltip"`、`[data-radix-popper-content-wrapper]`、`[data-floating-ui-portal]` 等。
- 最近出现在 DOM 中（不在初始页面加载中）
- 可见（`offsetParent !== null` 或 `position: fixed`）

对于每个浮动容器，包括以下子元素：
- 有文字内容
- 可见
- 有光标：指针或 onclick 或角色 =“选项”或角色 =“menuitem”
- 为了清楚起见，用原因 `popover-child` 标记

### 3.删除光标交互式扫描中的`hasRole`跳过

**文件：** `browse/src/snapshot.ts`

目前： `if (hasRole) continue;` — 跳过任何具有 ARIA 角色的元素，假设 ARIA 树已经捕获了它。

问题：如果 ARIA 树错过了元素（时间、门户、错误的 DOM 结构），它就会通过两个系统。

修复：仅当元素的角色位于 `INTERACTIVE_ROLES` 中并且它实际上在主 refMap 中捕获时才跳过。否则包括它。

由于我们无法轻松地从 `page.evaluate()` 内部检查 refMap，因此更简单的修复方法是：针对检测到的浮动容器内的元素完全删除 `hasRole` 跳过。对于浮动容器之外的元素，请按原样保留 `hasRole` 跳过（以避免正常页面内容中出现重复）。

### 4.添加下拉测试夹具和测试

**文件：** `browse/test/fixtures/dropdown.html`

HTML 页面包含：
- 组合框输入，显示 focus/type 上的下拉菜单
- 下拉项为 `<div>` 并带有点击处理程序（无 ARIA 角色）
- 下拉项为 `<li>` 和 `role="option"`
- React-portal-style 容器（`position: fixed`，高 z-index）

**文件：** `browse/test/snapshot.test.ts`

新的测试用例：
- 下拉页面上的 `snapshot -i` 通过光标扫描查找下拉项目
- 下拉页面上的 `snapshot -i` 包含弹出窗口子元素
- 下拉扫描中的 `@c` 参考是可点击的
- 即使 ARIA 树错过了具有 ARIA 角色的浮动容器内的元素，也会捕获它们

## 推出风险

**低。** `-C` 扫描是附加的 - 它只添加 `@c` 引用，从不删除 `@e` 引用。使用 `-i` 自动启用它的更改增加了输出大小，但代理已经处理混合引用类型。

**一个问题：** `-C` 扫描会查询所有元素 (`document.querySelectorAll('*')`)，这在大页面上可能会很慢。对于特定于弹出窗口的扫描，我们限制为检测到的浮动容器内的元素，这很快（小子树）。

## 测试

```bash
cd /data/gstack/browse && bun test snapshot
```

## 文件已更改

1. `browse/src/snapshot.ts` — 自动启用 -C 和 -i，弹出窗口扫描，删除浮动容器中的 hasRole 跳过
2. `browse/test/fixtures/dropdown.html` — 新测试夹具
3. `browse/test/snapshot.test.ts` — 新下拉菜单/popover 测试用例
