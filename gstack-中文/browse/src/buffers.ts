/**
 * 共享缓冲区与类型定义。
 * 抽出来是为了打破 `server.ts` 和 `browser-manager.ts` 之间的循环依赖。
 *
 * `CircularBuffer<T>`：固定容量、O(1) 写入的环形缓冲区。
 *
 *   ┌───┬───┬───┬───┬───┬───┐
 *   │ 3 │ 4 │ 5 │   │ 1 │ 2 │  capacity=6, head=4, size=5
 *   └───┴───┴───┴───┴─▲─┴───┘
 *                     │
 *                   head（最旧条目）
 *
 *   push() 在 `(head + size) % capacity` 位置写入，复杂度 O(1)
 *   toArray() 按插入顺序返回条目，复杂度 O(n)
 *   totalAdded 会在超出容量后继续累加（用于 flush 游标）
 */

// CircularBuffer

export class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private _size: number = 0;
  private _totalAdded: number = 0;
  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  push(entry: T): void {
    const index = (this.head + this._size) % this.capacity;
    this.buffer[index] = entry;
    if (this._size < this.capacity) {
      this._size++;
    } else {
      // 缓冲区已满，向前推进 head（覆盖最旧条目）。
      this.head = (this.head + 1) % this.capacity;
    }
    this._totalAdded++;
  }

  /** 按插入顺序返回条目（最旧在前）。 */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.head + i) % this.capacity] as T);
    }
    return result;
  }

  /** 返回最近 N 条记录（最终顺序仍是最旧在前）。 */
  last(n: number): T[] {
    const count = Math.min(n, this._size);
    const result: T[] = [];
    const start = (this.head + this._size - count) % this.capacity;
    for (let i = 0; i < count; i++) {
      result.push(this.buffer[(start + i) % this.capacity] as T);
    }
    return result;
  }

  get length(): number {
    return this._size;
  }

  get totalAdded(): number {
    return this._totalAdded;
  }

  clear(): void {
    this.head = 0;
    this._size = 0;
    // 不重置 totalAdded，flush 游标依赖它。
  }

  /** 按索引取条目（0 = 最旧），供网络响应匹配使用。 */
  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;
    return this.buffer[(this.head + index) % this.capacity];
  }

  /** 按索引设置条目（0 = 最旧），供网络响应匹配使用。 */
  set(index: number, entry: T): void {
    if (index < 0 || index >= this._size) return;
    this.buffer[(this.head + index) % this.capacity] = entry;
  }
}

// 条目类型

export interface LogEntry {
  timestamp: number;
  level: string;
  text: string;
}

export interface NetworkEntry {
  timestamp: number;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  size?: number;
}

export interface DialogEntry {
  timestamp: number;
  type: string;        // 'alert' | 'confirm' | 'prompt' | 'beforeunload'
  message: string;
  defaultValue?: string;
  action: string;      // 'accepted' | 'dismissed'
  response?: string;   // prompt 中提供的文本
}

// 缓冲区实例

const HIGH_WATER_MARK = 50_000;

export const consoleBuffer = new CircularBuffer<LogEntry>(HIGH_WATER_MARK);
export const networkBuffer = new CircularBuffer<NetworkEntry>(HIGH_WATER_MARK);
export const dialogBuffer = new CircularBuffer<DialogEntry>(HIGH_WATER_MARK);

// 便捷追加函数

export function addConsoleEntry(entry: LogEntry) {
  consoleBuffer.push(entry);
}

export function addNetworkEntry(entry: NetworkEntry) {
  networkBuffer.push(entry);
}

export function addDialogEntry(entry: DialogEntry) {
  dialogBuffer.push(entry);
}
