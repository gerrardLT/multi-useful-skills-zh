强化界面，使其能承受边界情况、错误、国际化问题，以及那些会击穿理想化设计的真实世界使用场景。

## 评估加固需求

识别薄弱点与边界场景：

1. **用极端输入测试**：
   - 很长的文本（姓名、描述、标题）
   - 很短的文本（空、单个字符）
   - 特殊字符（emoji、RTL 文本、重音字符）
   - 大数字（百万、十亿）
   - 大量项目（1000+ 列表项、50+ 选项）
   - 无数据（空状态）

2. **测试错误场景**：
   - 网络失败（离线、慢网、超时）
   - API 错误（400、401、403、404、500）
   - 校验错误
   - 权限错误
   - 限流
   - 并发操作

3. **测试国际化**：
   - 很长的翻译文本（德语通常比英语长 30%）
   - RTL 语言（阿拉伯语、希伯来语）
   - 字符集（中文、日文、韩文、emoji）
   - 日期 / 时间格式
   - 数字格式（1,000 vs 1.000）
   - 货币符号

**关键原则**：只在“完美数据”下才能正常工作的设计，不算 production-ready。要针对真实世界加固。

## 加固维度

系统性提升韧性：

### 文本溢出与换行

**长文本处理**：
```css
/* 单行省略号 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 多行截断 */
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 允许换行 */
.wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
```

**Flex / Grid 溢出**：
```css
/* 防止 flex item 溢出 */
.flex-item {
  min-width: 0; /* 允许缩到小于内容宽度 */
  overflow: hidden;
}

/* 防止 grid item 溢出 */
.grid-item {
  min-width: 0;
  min-height: 0;
}
```

**响应式文字尺寸**：
- 使用 `clamp()` 做流体字号
- 设定最小可读尺寸（移动端至少 14px）
- 测试文字缩放（放大到 200%）
- 确保容器会随文字扩张

### 国际化（i18n）

**文本膨胀**：
- 为翻译预留 30–40% 的空间预算
- 使用能适应内容的 flexbox / grid
- 用最长语言测试（通常是德语）
- 文本容器避免固定宽度

```jsx
// Bad：假设英文文本很短
<button className="w-24">Submit</button>

// Good：随内容自适应
<button className="px-4 py-2">Submit</button>
```

**RTL（从右到左）支持**：
```css
/* 使用逻辑属性 */
margin-inline-start: 1rem; /* 不要写 margin-left */
padding-inline: 1rem; /* 不要写 padding-left/right */
border-inline-end: 1px solid; /* 不要写 border-right */

/* 或使用 dir 属性 */
[dir="rtl"] .arrow { transform: scaleX(-1); }
```

**字符集支持**：
- 全部使用 UTF-8 编码
- 测试中文 / 日文 / 韩文（CJK）字符
- 测试 emoji（可能占 2–4 字节）
- 处理不同文字系统（拉丁、西里尔、阿拉伯等）

**日期 / 时间格式**：
```javascript
// Good：使用 Intl API 正确格式化
new Intl.DateTimeFormat('en-US').format(date); // 1/15/2024
new Intl.DateTimeFormat('de-DE').format(date); // 15.1.2024

new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD' 
}).format(1234.56); // $1,234.56
```

**复数规则**：
```javascript
// Bad：默认套用英语复数规则
`${count} item${count !== 1 ? 's' : ''}`

// Good：使用正规 i18n 库
t('items', { count }) // 处理更复杂的复数规则
```

### 错误处理

**网络错误**：
- 显示清晰错误信息
- 提供重试按钮
- 解释发生了什么
- 如适用，提供离线模式
- 处理超时场景

```jsx
// 带恢复路径的错误状态
{error && (
  <ErrorMessage>
    <p>Failed to load data. {error.message}</p>
    <button onClick={retry}>Try again</button>
  </ErrorMessage>
)}
```

**表单校验错误**：
- 在字段旁显示行内错误
- 提示清晰且具体
- 提供修改建议
- 不要无谓阻止提交
- 出错时保留用户输入

**API 错误**：
- 按不同状态码分别处理
  - 400：显示校验错误
  - 401：跳转到登录
  - 403：显示权限错误
  - 404：显示未找到状态
  - 429：显示限流提示
  - 500：显示通用错误，并提供支持路径

**优雅降级**：
- 核心功能在没有 JavaScript 时也能工作
- 图片带有 alt 文本
- 渐进增强
- 为不支持的特性准备 fallback

### 边界情况与临界条件

**空状态**：
- 列表没有项目
- 搜索没有结果
- 没有通知
- 没有可展示的数据
- 提供清晰的下一步行动

**加载状态**：
- 首次加载
- 分页加载
- 刷新中
- 清楚说明在加载什么（“Loading your projects...”）
- 长操作给出时间预估

**大数据集**：
- 分页或虚拟滚动
- 搜索 / 筛选能力
- 性能优化
- 不要一次加载全部 10,000 项

**并发操作**：
- 防止重复提交（加载时禁用按钮）
- 处理竞态条件
- 乐观更新 + 回滚
- 冲突解决

**权限状态**：
- 无查看权限
- 无编辑权限
- 只读模式
- 清楚解释原因

**浏览器兼容性**：
- 为现代特性补 polyfill
- 为不支持的 CSS 准备 fallback
- 做 feature detection，不做 browser detection
- 在目标浏览器中实际测试

### 输入校验与清洗

**客户端校验**：
- 必填字段
- 格式校验（邮箱、电话、URL）
- 长度限制
- 模式匹配
- 自定义校验规则

**服务端校验**（始终需要）：
- 永远不要只相信客户端
- 校验并清洗所有输入
- 防止注入攻击
- 做限流

**约束处理**：
```html
<!-- 明确声明约束 -->
<input 
  type="text"
  maxlength="100"
  pattern="[A-Za-z0-9]+"
  required
  aria-describedby="username-hint"
/>
<small id="username-hint">
  Letters and numbers only, up to 100 characters
</small>
```

### 可访问性韧性

**键盘导航**：
- 所有功能都可通过键盘访问
- Tab 顺序合理
- 模态框中管理好焦点
- 长内容提供 skip link

**屏幕阅读器支持**：
- 正确的 ARIA label
- 动态变化可被播报（live region）
- 有描述性的 alt 文本
- 使用语义化 HTML

**运动敏感性**：
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**高对比模式**：
- 在 Windows 高对比模式中测试
- 不要只依赖颜色传递信息
- 提供其他视觉线索

### 性能韧性

**慢连接**：
- 渐进式图片加载
- Skeleton screen
- 乐观式 UI 更新
- 离线支持（service worker）

**内存泄漏**：
- 清理事件监听器
- 取消订阅
- 清理 timer / interval
- 组件卸载时中止未完成请求

**节流与防抖**：
```javascript
// 搜索输入做防抖
const debouncedSearch = debounce(handleSearch, 300);

// 滚动处理做节流
const throttledScroll = throttle(handleScroll, 100);
```

## 测试策略

**手动测试**：
- 用极端数据测试（超长、超短、空）
- 切换不同语言测试
- 离线测试
- 慢网测试（限速到 3G）
- 用屏幕阅读器测试
- 纯键盘导航测试
- 在旧浏览器里测试

**自动化测试**：
- 边界情况单元测试
- 错误场景集成测试
- 关键路径 E2E 测试
- 视觉回归测试
- 可访问性测试（axe、WAVE）

**重要**：加固的核心，是预期那些意料之外的事情。真实用户一定会做出你没想到的操作。

**绝不要**：
- 假设输入完美无缺（所有输入都要校验）
- 忽视国际化（为全球使用而设计）
- 让错误提示过于泛泛（“Error occurred”）
- 忘记离线场景
- 只信任客户端校验
- 为文本使用固定宽度
- 默认所有语言都和英语一样短
- 因一个组件报错就阻断整个界面

## 验证加固结果

用边界场景彻底测试：

- **长文本**：试试 100+ 字符的名字
- **Emoji**：在所有文本字段里输入 emoji
- **RTL**：用阿拉伯语或希伯来语测试
- **CJK**：用中文 / 日文 / 韩文测试
- **网络问题**：断网、限速
- **大数据集**：用 1000+ 项测试
- **并发操作**：快速点击提交 10 次
- **错误**：强制制造 API 错误，测试所有错误状态
- **空状态**：删除所有数据，测试空状态

记住：你是在为生产环境的现实做加固，不是在为演示环境的完美做加固。要默认用户会输入奇怪数据、会在流程中途掉线、会用意想不到的方式使用产品。把韧性写进每个组件里。
