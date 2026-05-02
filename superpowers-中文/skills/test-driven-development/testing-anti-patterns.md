# 测试反模式

**在以下场景加载这份参考：** 写测试、修改测试、添加 mocks，或你忍不住想往生产代码里塞“只给测试用”的方法时。

## 概览

测试必须验证真实行为，而不是 mock 的行为。mock 只是隔离手段，不是被测对象本身。

**核心原则：** 测代码做了什么，不测 mock 做了什么。  
**严格遵守 TDD，通常就能自然避开这些反模式。**

## 铁律

```text
1. NEVER test mock behavior
2. NEVER add test-only methods to production classes
3. NEVER mock without understanding dependencies
```

## 反模式 1：测试 mock 的行为

**错误示例：**

```typescript
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

**为什么错：**

- 你验证的是 mock 是否存在，不是组件本身是否正确
- mock 在时测试就过，mock 不在时测试就挂
- 它对真实行为没有任何说明力

**正确做法：**

```typescript
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

### 闸门问题

在对任何 mock 元素做断言前，先问自己：

> 我现在测的是组件真实行为，还是只是在测 mock 是否存在？

如果答案是后者，就停止，删掉断言，或者取消 mock。

## 反模式 2：在生产代码里加“测试专用方法”

**错误示例：**

```typescript
class Session {
  async destroy() {
    await this._workspaceManager?.destroyWorkspace(this.id);
  }
}
```

如果这个方法只会在测试里被调用，那它就不该存在于生产类中。

**为什么错：**

- 生产类被测试逻辑污染
- 一旦误用于生产环境，风险很高
- 违反 YAGNI，也破坏关注点分离

**正确做法：**

把清理逻辑放到测试工具里：

```typescript
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}
```

## 反模式 3：没搞懂依赖就乱 mock

**错误示例：**

```typescript
test('detects duplicate server', () => {
  vi.mock('ToolCatalog', () => ({
    discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
  }));

  await addServer(config);
  await addServer(config);
});
```

**为什么错：**

- 被 mock 的方法可能自带测试依赖的副作用
- 为了“保险”而过度 mock，反而破坏真实行为
- 测试可能因为错误原因通过，或神秘失败

**正确做法：**

- 先跑一次真实实现，搞清依赖链
- 只 mock 真正慢、真正外部、真正不稳定的那一层
- 不要 mock 掉测试本身依赖的关键行为

## 反模式 4：不完整的 mock

**错误示例：**

```typescript
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' }
};
```

如果真实接口还会返回 `metadata`，而下游代码依赖它，这种 mock 会制造虚假信心。

**为什么错：**

- mock 没有完整镜像真实结构
- 下游可能依赖你没提供的字段
- 测试通过，但集成环境照样会炸

**正确做法：**

```typescript
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
};
```

## 反模式 5：把集成测试当作“最后补一下”

**错误示例：**

```text
实现完成，但还没有任何测试。
"Ready for testing"
```

**为什么错：**

- 测试是实现的一部分，不是收尾赠品
- 如果真在做 TDD，这种状态本不该出现
- 没有测试，就不能声称“已经完成”

**正确做法：**

```text
TDD cycle:
1. Write failing test
2. Implement to pass
3. Refactor
4. THEN claim complete
```

## 当 mocks 复杂到失控时

**警告信号：**

- mock setup 比测试主体还长
- 为了让测试通过，到处都在 mock
- mocks 缺少真实组件本来就有的方法
- 只要 mock 稍微一动，测试就碎

这时要认真问一句：

> 我们真的需要在这里使用 mock 吗？

很多时候，直接写基于真实组件的集成测试，反而更简单、更稳定。

## 为什么 TDD 能防住这些反模式

TDD 的价值在于：

1. **先写测试**：逼你先想清楚自己到底在测什么
2. **先看它失败**：证明你测到的是“真实行为”，而不是 mock
3. **最小实现**：降低把测试专用代码混进生产代码的概率
4. **先接真实依赖**：让你更理解系统真正依赖什么

如果你最后测出来的只是 mock 行为，那通常说明你已经偏离了 TDD。

## 快速参考

| Anti-Pattern | Fix |
|--------------|-----|
| 对 mock 元素做断言 | 测真实组件，或去掉 mock |
| 往生产类加测试专用方法 | 移到 test utilities |
| 没理解依赖就 mock | 先理解依赖，再做最小 mock |
| 不完整 mock | 完整镜像真实 API |
| 把测试当收尾补充 | 让测试先行 |
| mock 过于复杂 | 考虑改用集成测试 |

## 红旗信号

- 断言在检查 `*-mock` test ID
- 某个方法只在测试文件里被调用
- mock setup 占了测试 50% 以上
- 去掉 mock，测试立刻失效
- 你说不清为什么必须使用 mock
- 你开始说“先 mock 一下比较安全”

## 底线

**Mocks 是隔离工具，不是被测对象。**

如果 TDD 暴露出你在测试 mock 行为，那就说明方向已经偏了。正确做法是回到真实行为，或者重新审视你到底为什么需要 mock。