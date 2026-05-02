/**
 * 活动流：为 Chrome 扩展侧边栏提供 browse 命令的实时事件流。
 *
 * 架构：
 *   handleCommand() -> emitActivity(command_start)
 *                   -> emitActivity(command_end)
 *   wirePageEvents() -> emitActivity(navigation)
 *
 *   GET /activity/stream?after=ID -> 通过 ReadableStream 输出 SSE
 *   GET /activity/history?limit=N -> REST 兜底接口
 *
 * 隐私：`filterArgs()` 会脱敏密码、认证令牌和敏感查询参数。
 * 背压：通过 `queueMicrotask` 通知订阅者，不阻塞命令主路径。
 * 缺口检测：客户端传入 `?after=ID`，服务端检测环形缓冲区是否已溢出。
 */

import { CircularBuffer } from './buffers';

// 类型

export interface ActivityEntry {
  id: number;
  timestamp: number;
  type: 'command_start' | 'command_end' | 'navigation' | 'error';
  command?: string;
  args?: string[];
  url?: string;
  duration?: number;
  status?: 'ok' | 'error';
  error?: string;
  result?: string;
  tabs?: number;
  mode?: string;
  clientId?: string;
}

// 缓冲区与订阅者

const BUFFER_CAPACITY = 1000;
const activityBuffer = new CircularBuffer<ActivityEntry>(BUFFER_CAPACITY);
let nextId = 1;

type ActivitySubscriber = (entry: ActivityEntry) => void;
const subscribers = new Set<ActivitySubscriber>();

// 隐私过滤

const SENSITIVE_COMMANDS = new Set(['fill', 'type', 'cookie', 'header']);
const SENSITIVE_PARAM_PATTERN = /\b(password|token|secret|key|auth|bearer|api[_-]?key)\b/i;

/**
 * 在流式发送前对命令参数里的敏感数据做脱敏。
 */
export function filterArgs(command: string, args: string[]): string[] {
  if (!args || args.length === 0) return args;

  // fill：如果是密码类字段，脱敏最后一个值参数。
  if (command === 'fill' && args.length >= 2) {
    const selector = args[0];
    // 如果选择器看起来像密码字段，就脱敏值。
    if (/password|passwd|secret|token/i.test(selector)) {
      return [selector, '[REDACTED]'];
    }
    return args;
  }

  // header：脱敏 Authorization 和其他敏感请求头。
  if (command === 'header' && args.length >= 1) {
    const headerLine = args[0];
    if (/^(authorization|x-api-key|cookie|set-cookie)/i.test(headerLine)) {
      const colonIdx = headerLine.indexOf(':');
      if (colonIdx > 0) {
        return [headerLine.substring(0, colonIdx + 1) + '[REDACTED]'];
      }
    }
    return args;
  }

  // cookie：脱敏 cookie 值。
  if (command === 'cookie' && args.length >= 1) {
    const cookieStr = args[0];
    const eqIdx = cookieStr.indexOf('=');
    if (eqIdx > 0) {
      return [cookieStr.substring(0, eqIdx + 1) + '[REDACTED]'];
    }
    return args;
  }

  // type：始终脱敏，因为可能输入的是密码。
  if (command === 'type') {
    return ['[REDACTED]'];
  }

  // URL 参数：脱敏敏感查询参数。
  return args.map(arg => {
    if (arg.startsWith('http://') || arg.startsWith('https://')) {
      try {
        const url = new URL(arg);
        let redacted = false;
        for (const key of url.searchParams.keys()) {
          if (SENSITIVE_PARAM_PATTERN.test(key)) {
            url.searchParams.set(key, '[REDACTED]');
            redacted = true;
          }
        }
        return redacted ? url.toString() : arg;
      } catch {
        return arg;
      }
    }
    return arg;
  });
}

/**
 * 截断流式返回结果文本，最多 200 个字符。
 */
function truncateResult(result: string | undefined): string | undefined {
  if (!result) return undefined;
  if (result.length <= 200) return result;
  return result.substring(0, 200) + '...';
}

// 对外 API

/**
 * 发送一条活动事件。对背压安全：订阅者会异步收到通知。
 */
export function emitActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): ActivityEntry {
  const full: ActivityEntry = {
    ...entry,
    id: nextId++,
    timestamp: Date.now(),
    args: entry.args ? filterArgs(entry.command || '', entry.args) : undefined,
    result: truncateResult(entry.result),
  };
  activityBuffer.push(full);

  // 异步通知订阅者，绝不阻塞命令主路径。
  for (const notify of subscribers) {
    queueMicrotask(() => {
      try { notify(full); } catch { /* 订阅者报错时不要让进程崩溃 */ }
    });
  }

  return full;
}

/**
 * 订阅实时活动事件。返回取消订阅函数。
 */
export function subscribe(fn: ActivitySubscriber): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/**
 * 取指定游标 ID 之后的最近活动记录。
 * 如果缓冲区已溢出，同时返回缺口信息。
 */
export function getActivityAfter(afterId: number): {
  entries: ActivityEntry[];
  gap: boolean;
  gapFrom?: number;
  availableFrom?: number;
  totalAdded: number;
} {
  const total = activityBuffer.totalAdded;
  const allEntries = activityBuffer.toArray();

  if (afterId === 0) {
    return { entries: allEntries, gap: false, totalAdded: total };
  }

  // 检查是否有缺口：afterId 太旧时可能已经被淘汰。
  const oldestId = allEntries.length > 0 ? allEntries[0].id : nextId;
  if (afterId < oldestId) {
    return {
      entries: allEntries,
      gap: true,
      gapFrom: afterId + 1,
      availableFrom: oldestId,
      totalAdded: total,
    };
  }

  // 只保留游标之后的记录。
  const filtered = allEntries.filter(e => e.id > afterId);
  return { entries: filtered, gap: false, totalAdded: total };
}

/**
 * 获取最近 N 条活动记录。
 */
export function getActivityHistory(limit: number = 50): {
  entries: ActivityEntry[];
  totalAdded: number;
} {
  const allEntries = activityBuffer.toArray();
  const sliced = limit < allEntries.length ? allEntries.slice(-limit) : allEntries;
  return { entries: sliced, totalAdded: activityBuffer.totalAdded };
}

/**
 * 获取当前订阅者数量，便于调试和健康检查。
 */
export function getSubscriberCount(): number {
  return subscribers.size;
}
