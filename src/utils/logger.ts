/**
 * シンプルなロガー
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isDevelopment = process.env.NODE_ENV === 'development';

function log(level: LogLevel, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  switch (level) {
    case 'error':
      console.error(prefix, message, data ? data : '');
      break;
    case 'warn':
      console.warn(prefix, message, data ? data : '');
      break;
    case 'debug':
      if (isDevelopment) {
        console.debug(prefix, message, data ? data : '');
      }
      break;
    case 'info':
    default:
      console.log(prefix, message, data ? data : '');
      break;
  }
}

export const logger = {
  info: (message: string, data?: unknown) => log('info', message, data),
  warn: (message: string, data?: unknown) => log('warn', message, data),
  error: (message: string, data?: unknown) => log('error', message, data),
  debug: (message: string, data?: unknown) => log('debug', message, data),
};
