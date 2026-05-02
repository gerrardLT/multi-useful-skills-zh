/**
 * 网络响应体捕获：`SizeCappedBuffer` + 捕获生命周期管理。
 *
 * 架构：
 *   `page.on('response')` 监听器 -> 按 URL 规则过滤 -> 存储响应体
 *   `SizeCappedBuffer`：总大小超限时淘汰最旧条目
 *   导出：写成 JSONL 文件（每行一条响应）
 *
 * 内存管理：
 *   - 总缓冲区上限 50MB（可配置）
 *   - 单条响应体上限 5MB（更大的响应只保留元数据）
 *   - 二进制响应用 base64 存储
 *   - 文本响应按原文存储
 */

import * as fs from 'fs';
import type { Response as PlaywrightResponse } from 'playwright';

export interface CapturedResponse {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  timestamp: number;
  size: number;
  bodyTruncated: boolean;
}

const MAX_BUFFER_SIZE = 50 * 1024 * 1024; // 总容量 50MB
const MAX_ENTRY_SIZE = 5 * 1024 * 1024;   // 单条响应体最多 5MB

export class SizeCappedBuffer {
  private entries: CapturedResponse[] = [];
  private totalSize = 0;
  private readonly maxSize: number;

  constructor(maxSize = MAX_BUFFER_SIZE) {
    this.maxSize = maxSize;
  }

  push(entry: CapturedResponse): void {
    // 持续淘汰最旧条目，直到腾出足够空间。
    while (this.entries.length > 0 && this.totalSize + entry.size > this.maxSize) {
      const evicted = this.entries.shift()!;
      this.totalSize -= evicted.size;
    }
    this.entries.push(entry);
    this.totalSize += entry.size;
  }

  toArray(): CapturedResponse[] {
    return [...this.entries];
  }

  get length(): number {
    return this.entries.length;
  }

  get byteSize(): number {
    return this.totalSize;
  }

  clear(): void {
    this.entries = [];
    this.totalSize = 0;
  }

  /** 导出为 JSONL 文件。 */
  exportToFile(filePath: string): number {
    const lines = this.entries.map(e => JSON.stringify(e));
    fs.writeFileSync(filePath, lines.join('\n') + '\n');
    return this.entries.length;
  }

  /** 捕获结果摘要（URL、状态码、大小）。 */
  summary(): string {
    if (this.entries.length === 0) return 'No captured responses.';
    const lines = this.entries.map((e, i) =>
      `  [${i + 1}] ${e.status} ${e.url.slice(0, 100)} (${Math.round(e.size / 1024)}KB${e.bodyTruncated ? ', truncated' : ''})`
    );
    return `${this.entries.length} responses (${Math.round(this.totalSize / 1024)}KB total):\n${lines.join('\n')}`;
  }
}

/** 全局捕获状态。 */
let captureBuffer = new SizeCappedBuffer();
let captureActive = false;
let captureFilter: RegExp | null = null;
let captureListener: ((response: PlaywrightResponse) => Promise<void>) | null = null;

export function isCaptureActive(): boolean {
  return captureActive;
}

export function getCaptureBuffer(): SizeCappedBuffer {
  return captureBuffer;
}

/** 创建响应监听函数。 */
function createResponseListener(filter: RegExp | null): (response: PlaywrightResponse) => Promise<void> {
  return async (response: PlaywrightResponse) => {
    const url = response.url();
    if (filter && !filter.test(url)) return;

    // 跳过没有有效内容的响应（重定向、204 等）。
    const status = response.status();
    if (status === 204 || status === 301 || status === 302 || status === 304) return;

    const contentType = response.headers()['content-type'] || '';
    let body = '';
    let bodySize = 0;
    let truncated = false;

    try {
      const rawBody = await response.body();
      bodySize = rawBody.length;

      if (bodySize > MAX_ENTRY_SIZE) {
        truncated = true;
        body = '';
      } else if (contentType.includes('json') || contentType.includes('text') || contentType.includes('xml') || contentType.includes('html')) {
        body = rawBody.toString('utf-8');
      } else {
        body = rawBody.toString('base64');
      }
    } catch {
      // 响应体可能不可用，例如流式响应或中途取消。
      body = '';
      truncated = true;
    }

    const entry: CapturedResponse = {
      url,
      status,
      headers: response.headers(),
      body,
      contentType,
      timestamp: Date.now(),
      size: bodySize,
      bodyTruncated: truncated,
    };

    captureBuffer.push(entry);
  };
}

/** 开始捕获响应体。 */
export function startCapture(filterPattern?: string): { filter: string | null } {
  captureFilter = filterPattern ? new RegExp(filterPattern) : null;
  captureActive = true;
  captureListener = createResponseListener(captureFilter);
  return { filter: filterPattern || null };
}

/** 获取当前激活的监听器（供页面挂载）。 */
export function getCaptureListener(): ((response: PlaywrightResponse) => Promise<void>) | null {
  return captureListener;
}

/** 停止捕获。 */
export function stopCapture(): { count: number; sizeKB: number } {
  captureActive = false;
  captureListener = null;
  return {
    count: captureBuffer.length,
    sizeKB: Math.round(captureBuffer.byteSize / 1024),
  };
}

/** 清空捕获缓冲区。 */
export function clearCapture(): void {
  captureBuffer.clear();
}

/** 把已捕获响应导出为 JSONL 文件。 */
export function exportCapture(filePath: string): number {
  return captureBuffer.exportToFile(filePath);
}
