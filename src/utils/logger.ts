type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, data?: unknown): void {
  const timestamp = new Date().toISOString();
  const entry = data
    ? `[${timestamp}] ${level.toUpperCase()}: ${message} ${JSON.stringify(data)}`
    : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  console.log(entry);
}

export const logger = {
  info: (message: string, data?: unknown) => log('info', message, data),
  warn: (message: string, data?: unknown) => log('warn', message, data),
  error: (message: string, data?: unknown) => log('error', message, data),
};
