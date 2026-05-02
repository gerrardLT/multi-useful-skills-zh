# Chrome Web Store Listing

## Name
Impeccable

## Short description (132 chars max)
检测任意网页中的 AI slop 与设计反模式。打开 DevTools，立刻看到哪些地方需要修。

## Detailed description

Impeccable 会直接在浏览器里检测 24 种常见 UI 反模式。只要在任意页面打开 DevTools，overlay 就会立刻高亮问题，从 AI 生成设计的典型痕迹，到可访问性和整体质量问题，都能直接指出来。

**检测内容**

AI 生成痕迹（那些一眼让人看出“这是 AI 做的”的设计痕迹）：
- 侧边标签强调边框
- 标题上的渐变文字
- 紫色/紫罗兰色 AI 色板
- 嵌套卡片、单调间距
- 弹跳/弹性缓动
- 带有发光强调的暗色模式
- 过度使用的字体、扁平的字体层级

质量问题（通用设计与可访问性问题）：
- 低对比文本（WCAG AA）
- 过于拥挤的 padding、过紧的 line height
- 跳级的标题层级
- 行长过长
- 过小的正文、两端对齐文本
- 布局属性动画

**工作原理**

1. 安装扩展
2. 在任意页面打开 DevTools（Cmd+Opt+I / F12）
3. Overlay 会自动出现，并高亮问题
4. 点击 "Impeccable" 面板 tab，查看结构化的 findings 列表
5. 点击任意 finding，即可跳转到 Elements 面板中的对应元素

**功能特性**

- 打开 DevTools 时自动扫描，无需手动触发
- Findings 自动分组：AI 痕迹 vs. 质量问题
- 点击即可检查：从 finding 直接跳到具体元素
- 可以在面板或 toolbar popup 中开关 overlays
- 支持按规则单独配置：禁用你不关心的检测项
- 会在导航时重新扫描，包括 SPA 路由切换
- 适用于任意网站
- 100% 本地运行，不会把数据发往任何地方

开源地址：https://github.com/pbakaus/impeccable

## Category
Developer Tools

## Language
English

## Privacy policy URL
https://impeccable.style/privacy

## Single purpose description
在任意网页上检测并高亮 UI 反模式（包括 AI 生成设计痕迹以及通用质量问题）。