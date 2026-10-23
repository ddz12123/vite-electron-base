import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { app } from 'electron';

/**
 * 统一日志落地：追加写入系统日志目录（app.getPath('logs')）下的 <name>.log。
 * 生产构建会 drop 掉所有 console.* 调用，打包后的 Windows 又没有 stderr，
 * 异常痕迹只有落到日志文件才能排查；写文件失败不能反过来影响调用方流程
 */
export const writeLog = (name: string, detail: string): void => {
  process.stderr.write(`[${name}] ${detail}\n`);
  try {
    const logDir = app.getPath('logs');
    mkdirSync(logDir, { recursive: true });
    appendFileSync(
      join(logDir, `${name}.log`),
      `[${new Date().toISOString()}] ${detail}\n`,
      'utf8',
    );
  } catch {
    // 日志落地失败时静默，调用方（更新流程、IPC handler）不能被日志拖垮
  }
};
