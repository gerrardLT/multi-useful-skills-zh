# 交互设计

## 八种交互状态

每个可交互元素都需要设计好这些状态：

| State | When | Visual Treatment |
|-------|------|------------------|
| **Default** | 静止状态 | 基础样式 |
| **Hover** | 指针悬停（非触屏） | 轻微抬升、颜色变化 |
| **Focus** | 键盘 / 程序聚焦 | 明显焦点环（见下文） |
| **Active** | 正在按下 | 压下感、更深的颜色 |
| **Disabled** | 不可交互 | 降低透明度、禁用指针 |
| **Loading** | 处理中 | Spinner、skeleton |
| **Error** | 无效状态 | 红色边框、图标、提示信息 |
| **Success** | 已完成 | 绿色勾选、确认反馈 |

**最常见的遗漏**：只设计 hover 不设计 focus，或者反过来。两者不是一回事。键盘用户永远无法看到 hover 状态。

## Focus Ring：要正确处理

**绝不要在没有替代方案时直接写 `outline: none`。** 这会破坏可访问性。应使用 `:focus-visible`，只向键盘用户显示焦点：

```css
/* 为鼠标 / 触屏隐藏焦点环 */
button:focus {
  outline: none;
}

/* 为键盘显示焦点环 */
button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

**焦点环设计要求**：
- 高对比度（与相邻颜色至少 3:1）
- 厚度 2–3px
- 与元素本体留出偏移（不要画在里面）
- 所有交互元素保持一致

## 表单设计：那些不那么显眼但很重要的点

**placeholder 不是 label**，因为一输入就消失。始终使用可见的 `<label>`。**应在 blur 时校验**，而不是每次敲键都校验（密码强度是例外）。错误信息应放在字段**下方**，并用 `aria-describedby` 关联起来。

## 加载状态

**乐观更新**：先立即展示成功，失败时再回滚。适用于低风险操作（点赞、关注），不适用于支付或破坏性行为。**Skeleton screen 优于 spinner**，因为它能提前展示内容轮廓，也比通用 spinner 更让人感觉快。

## 模态框：`inert` 方案

过去，模态框里的焦点陷阱通常要写复杂 JavaScript。现在可以使用 `inert` 属性：

```html
<!-- 模态框打开时 -->
<main inert>
  <!-- 模态框后面的内容不能被聚焦或点击 -->
</main>
<dialog open>
  <h2>Modal Title</h2>
  <!-- 焦点会留在模态框内部 -->
</dialog>
```

或者直接使用原生 `<dialog>` 元素：

```javascript
const dialog = document.querySelector('dialog');
dialog.showModal();  // 打开时自动锁定焦点，按 Escape 关闭
```

## Popover API

对于 tooltip、dropdown 和非模态浮层，优先使用原生 popover：

```html
<button popovertarget="menu">Open menu</button>
<div id="menu" popover>
  <button>Option 1</button>
  <button>Option 2</button>
</div>
```

**优点**：支持轻量关闭（点外部即可关闭）、层叠关系正确、不用打 `z-index` 混战，而且默认更易访问。

## Dropdown 与浮层定位

如果 dropdown 用 `position: absolute` 渲染在带有 `overflow: hidden` 或 `overflow: auto` 的容器里，它就会被裁切。这是生成式代码里最常见的 dropdown 问题。

### CSS Anchor Positioning

现代方案是使用 CSS Anchor Positioning API，在不依赖 JavaScript 的情况下把浮层锚定到触发器：

```css
.trigger {
  anchor-name: --menu-trigger;
}

.dropdown {
  position: fixed;
  position-anchor: --menu-trigger;
  position-area: block-end span-inline-end;
  margin-top: 4px;
}

/* 下方放不下时翻到上方 */
@position-try --flip-above {
  position-area: block-start span-inline-end;
  margin-bottom: 4px;
}
```

由于 dropdown 使用的是 `position: fixed`，它可以逃离祖先元素的 `overflow` 裁切。`@position-try` 块还能自动处理视口边界。**浏览器支持**：Chrome 125+、Edge 125+。Firefox 和 Safari 还不支持，因此这些浏览器需要兜底方案。

### Popover + Anchor 组合

将 Popover API 与 anchor positioning 结合，可以在一个模式里同时拿到正确层叠、点外关闭、可访问性和准确定位：

```html
<button popovertarget="menu" class="trigger">Open</button>
<div id="menu" popover class="dropdown">
  <button>Option 1</button>
  <button>Option 2</button>
</div>
```

`popover` 属性会把元素放进 **top layer**，无论 `z-index` 或 `overflow` 如何，都会盖在普通内容之上，因此不需要 portal。

### Portal / Teleport 模式

在组件框架里，可以把 dropdown 渲染到文档根节点，再用 JavaScript 定位：

- **React**：`createPortal(dropdown, document.body)`
- **Vue**：`<Teleport to="body">`
- **Svelte**：使用 portal 库，或挂载到 `document.body`

通过触发器的 `getBoundingClientRect()` 计算位置，再给浮层设置 `position: fixed` 和对应的 `top`、`left`。在滚动和缩放时重新计算。

### Fixed 定位兜底方案

对于不支持 anchor positioning 的浏览器，使用手动坐标的 `position: fixed` 可以避开 `overflow` 裁切：

```css
.dropdown {
  position: fixed;
  /* top/left 通过 JS 基于触发器的 getBoundingClientRect() 设置 */
}
```

渲染前先检查视口边界。如果 dropdown 会超出下边缘，就翻到触发器上方；如果会超出右边缘，就改为与触发器右侧对齐。

### 反模式

- **在 `overflow: hidden` 里使用 `position: absolute`**：dropdown 一定会被裁掉。应改用 `position: fixed` 或 top layer。
- **随手写 `z-index: 9999` 这类任意值**：请使用有语义的 z-index 层级，例如 `dropdown (100) -> sticky (200) -> modal-backdrop (300) -> modal (400) -> toast (500) -> tooltip (600)`。
- **把 dropdown 直接内联渲染**，却没有办法逃离父级 stacking context。应使用 `popover`（top layer）、portal，或 `position: fixed`。

## 破坏性操作：撤销优于确认

**撤销通常优于确认弹窗**，因为用户往往会无脑点掉确认。更好的方式是：先从 UI 中移除，弹出可撤销 toast，等 toast 过期后再真正删除。确认弹窗只适用于真正不可逆的操作（如账号删除）、高成本操作或批量操作。

## 键盘导航模式

### Roving Tabindex

对于组件组（tabs、menu items、radio groups），只允许其中一个项目进入 tab 序列，再通过方向键在组内移动：

```html
<div role="tablist">
  <button role="tab" tabindex="0">Tab 1</button>
  <button role="tab" tabindex="-1">Tab 2</button>
  <button role="tab" tabindex="-1">Tab 3</button>
</div>
```

方向键负责在项目之间移动 `tabindex="0"`；按 Tab 时则直接离开该组件，进入下一个组件。

### Skip Links

为键盘用户提供 skip link（`<a href="#main-content">Skip to main content</a>`），让他们可以跳过导航直接进入正文。默认可移到屏幕外，聚焦时再显示。

## 手势可发现性

滑动删除这类手势默认是不可见的，所以要给用户提示：

- **部分露出**：让删除按钮从边缘露出一点
- **首次引导**：第一次使用时加 coach mark
- **替代入口**：始终提供可见的后备方案（例如带 “Delete” 的菜单）

不要把手势当作执行某个操作的唯一方式。

---

**避免**：在没有替代方案时移除焦点指示；把 placeholder 当 label；触控目标小于 44x44px；使用泛泛的错误信息；制作没有 ARIA / 键盘支持的自定义控件。