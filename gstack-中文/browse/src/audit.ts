/**
 * 持久化命令审计日志。
 *
 * 以只追加的 JSONL 形式写入 `.gstack/browse-audit.jsonl`。不同于内存中的
 * 环形缓冲区（console、network、dialog），审计日志会跨越服务重启保留，
 * 且不会被服务端截断。每条记录包含：
 *
 *   - 时间戳、命令、参数（截断后）、页面来源
 *   - 耗时、状态（ok/error）、错误信息（如有）
 *   - 是否导入了 cookies（更高安全上下文）
 *   - 连接模式（headless/headed）
 *
 * 所有写入都采用尽力而为策略，审计失败不会导致命令失败。
 */

import * as fs from 'fs';

export interface AuditEntry {
  ts: string;
  cmd: string;
  /** 如果 agent 输入了别名（例如 `setcontent`），这里保留原始输入；
   *  同时 `cmd` 保存规范名称（`load-html`）。当 cmd === rawCmd 时省略。 */
  aliasOf?: string;
  args: string;
  origin: string;
  durationMs: number;
  status: 'ok' | 'error';
  error?: string;
  hasCookies: boolean;
  mode: 'launched' | 'headed';
}

const MAX_ARGS_LENGTH = 200;
const MAX_ERROR_LENGTH = 300;

let auditPath: string | null = null;

export function initAuditLog(logPath: string): void {
  auditPath = logPath;
}

export function writeAuditEntry(entry: AuditEntry): void {
  if (!auditPath) return;
  try {
    const truncatedArgs = entry.args.length > MAX_ARGS_LENGTH
      ? entry.args.slice(0, MAX_ARGS_LENGTH) + '...'
      : entry.args;
    const truncatedError = entry.error && entry.error.length > MAX_ERROR_LENGTH
      ? entry.error.slice(0, MAX_ERROR_LENGTH) + '...'
      : entry.error;

    const record: Record<string, unknown> = {
      ts: entry.ts,
      cmd: entry.cmd,
      args: truncatedArgs,
      origin: entry.origin,
      durationMs: entry.durationMs,
      status: entry.status,
      hasCookies: entry.hasCookies,
      mode: entry.mode,
    };
    if (entry.aliasOf) record.aliasOf = entry.aliasOf;
    if (truncatedError) record.error = truncatedError;

    fs.appendFileSync(auditPath, JSON.stringify(record) + '\n');
  } catch {
    // 审计写入失败时静默处理，不阻塞命令执行。
  }
}
