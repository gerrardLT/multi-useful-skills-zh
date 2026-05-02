# 分层防御式校验

## 概览

当你修复一个由无效数据引发的 bug 时，只在一个地方加校验会让人觉得“应该够了”。但这一个检查完全可能被其他代码路径、重构，甚至 mocks 绕过去。

**核心原则：** 在数据流经过的 **每一层** 都做校验，让这个 bug 从结构上变成“不可能发生”。

## 为什么要多层校验

单点校验：`“我们把这个 bug 修掉了”`  
多层校验：`“我们让这个 bug 不可能再出现”`

不同层会捕获不同问题：
- 入口校验能挡住大多数非法输入
- 业务逻辑校验能挡住边界情况
- 环境保护能防止某些上下文特有的危险操作
- 调试日志能在其他层都漏掉时留下法证线索

## 四层防御

### 第 1 层：入口校验
**目的：** 在 API 边界直接拒绝明显非法的输入

```typescript
function createProject(name: string, workingDirectory: string) {
  if (!workingDirectory || workingDirectory.trim() === '') {
    throw new Error('workingDirectory cannot be empty');
  }
  if (!existsSync(workingDirectory)) {
    throw new Error(`workingDirectory does not exist: ${workingDirectory}`);
  }
  if (!statSync(workingDirectory).isDirectory()) {
    throw new Error(`workingDirectory is not a directory: ${workingDirectory}`);
  }
  // ... proceed
}
```

### 第 2 层：业务逻辑校验
**目的：** 确保这份数据对当前操作来说也合理

```typescript
function initializeWorkspace(projectDir: string, sessionId: string) {
  if (!projectDir) {
    throw new Error('projectDir required for workspace initialization');
  }
  // ... proceed
}
```

### 第 3 层：环境保护
**目的：** 在特定上下文中阻止危险操作

```typescript
async function gitInit(directory: string) {
  // In tests, refuse git init outside temp directories
  if (process.env.NODE_ENV === 'test') {
    const normalized = normalize(resolve(directory));
    const tmpDir = normalize(resolve(tmpdir()));

    if (!normalized.startsWith(tmpDir)) {
      throw new Error(
        `Refusing git init outside temp dir during tests: ${directory}`
      );
    }
  }
  // ... proceed
}
```

### 第 4 层：调试埋点
**目的：** 为法证排查保留上下文

```typescript
async function gitInit(directory: string) {
  const stack = new Error().stack;
  logger.debug('About to git init', {
    directory,
    cwd: process.cwd(),
    stack,
  });
  // ... proceed
}
```

## 如何应用这个模式

当你发现一个 bug 时：

1. **追踪数据流** - 坏值从哪里来？在哪里被使用？
2. **列出所有检查点** - 把数据经过的每个节点都列出来
3. **每层都补校验** - 入口层、业务层、环境层、调试层
4. **每层都验证** - 尝试绕过第 1 层，确认第 2 层仍能接住

## 会话中的真实例子

Bug：空的 `projectDir` 导致 `git init` 在源码目录中执行

**数据流：**
1. Test setup -> 空字符串
2. `Project.create(name, '')`
3. `WorkspaceManager.createWorkspace('')`
4. `git init` 最终在 `process.cwd()` 中运行

**加上的四层防御：**
- 第 1 层：`Project.create()` 校验非空 / 存在 / 可写
- 第 2 层：`WorkspaceManager` 校验 `projectDir` 非空
- 第 3 层：`WorktreeManager` 在测试中拒绝对 tmpdir 之外执行 `git init`
- 第 4 层：在 `git init` 前打印 stack trace

**结果：** 1847 个测试全部通过，且该 bug 无法再被复现

## 关键洞察

四层都不可少。在真实测试里，每一层都接住了其他层漏掉的情况：
- 不同代码路径会绕过入口层校验
- mocks 会绕过业务逻辑检查
- 不同平台上的边界情况需要环境保护
- 调试日志则帮助识别结构层面的误用

**不要在一个校验点就停手。** 数据经过的每一层，都应该补上保护。