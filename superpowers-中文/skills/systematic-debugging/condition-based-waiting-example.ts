// 基于条件等待工具的完整实现
// 来源：Lace 测试基础设施改进（2025-10-03）
// 背景：通过替换随意的超时等待，修复了 15 个不稳定测试

import type { ThreadManager } from '~/threads/thread-manager';
import type { LaceEvent, LaceEventType } from '~/threads/types';

/**
 * 等待线程中出现指定类型的事件
 *
 * @param threadManager 要查询的线程管理器
 * @param threadId 要检查事件的线程 ID
 * @param eventType 要等待的事件类型
 * @param timeoutMs 最大等待时间，默认 5000ms
 * @returns 返回首个匹配事件的 Promise
 *
 * 示例：
 *   await waitForEvent(threadManager, agentThreadId, 'TOOL_RESULT');
 */
export function waitForEvent(
  threadManager: ThreadManager,
  threadId: string,
  eventType: LaceEventType,
  timeoutMs = 5000
): Promise<LaceEvent> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const event = events.find((e) => e.type === eventType);

      if (event) {
        resolve(event);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`等待 ${eventType} 事件超时，已等待 ${timeoutMs}ms`));
      } else {
        // 每 10ms 轮询一次，兼顾响应速度和开销。
        setTimeout(check, 10);
      }
    };

    check();
  });
}

/**
 * 等待某类事件达到指定数量
 *
 * @param threadManager 要查询的线程管理器
 * @param threadId 要检查事件的线程 ID
 * @param eventType 要等待的事件类型
 * @param count 要等待的事件数量
 * @param timeoutMs 最大等待时间，默认 5000ms
 * @returns 当数量达到要求时，返回全部匹配事件的 Promise
 *
 * 示例：
 *   // 等待 2 个 AGENT_MESSAGE 事件（初始回复 + 后续补充）
 *   await waitForEventCount(threadManager, agentThreadId, 'AGENT_MESSAGE', 2);
 */
export function waitForEventCount(
  threadManager: ThreadManager,
  threadId: string,
  eventType: LaceEventType,
  count: number,
  timeoutMs = 5000
): Promise<LaceEvent[]> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const matchingEvents = events.filter((e) => e.type === eventType);

      if (matchingEvents.length >= count) {
        resolve(matchingEvents);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(
          new Error(
            `等待 ${count} 个 ${eventType} 事件超时，已等待 ${timeoutMs}ms（当前仅 ${matchingEvents.length} 个）`
          )
        );
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}

/**
 * 等待满足自定义条件的事件
 * 适用于不只看事件类型、还要检查事件内容的场景
 *
 * @param threadManager 要查询的线程管理器
 * @param threadId 要检查事件的线程 ID
 * @param predicate 用于判断事件是否匹配的函数
 * @param description 用于报错的人类可读描述
 * @param timeoutMs 最大等待时间，默认 5000ms
 * @returns 返回首个匹配事件的 Promise
 *
 * 示例：
 *   // 等待带指定 ID 的 TOOL_RESULT
 *   await waitForEventMatch(
 *     threadManager,
 *     agentThreadId,
 *     (e) => e.type === 'TOOL_RESULT' && e.data.id === 'call_123',
 *     'id=call_123 的 TOOL_RESULT'
 *   );
 */
export function waitForEventMatch(
  threadManager: ThreadManager,
  threadId: string,
  predicate: (event: LaceEvent) => boolean,
  description: string,
  timeoutMs = 5000
): Promise<LaceEvent> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const event = events.find(predicate);

      if (event) {
        resolve(event);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`等待 ${description} 超时，已等待 ${timeoutMs}ms`));
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}

// 下面是一次真实调试会话中的使用示例：
//
// 修改前（不稳定）：
// ------------------
// const messagePromise = agent.sendMessage('Execute tools');
// await new Promise(r => setTimeout(r, 300)); // 希望 300ms 内工具能启动
// agent.abort();
// await messagePromise;
// await new Promise(r => setTimeout(r, 50));  // 希望 50ms 内结果能返回
// expect(toolResults.length).toBe(2);         // 随机失败
//
// 修改后（稳定）：
// ----------------
// const messagePromise = agent.sendMessage('Execute tools');
// await waitForEventCount(threadManager, threadId, 'TOOL_CALL', 2); // 等到工具启动
// agent.abort();
// await messagePromise;
// await waitForEventCount(threadManager, threadId, 'TOOL_RESULT', 2); // 等到结果返回
// expect(toolResults.length).toBe(2); // 始终成功
//
// 结果：通过率从 60% 提升到 100%，执行速度还快了 40%
