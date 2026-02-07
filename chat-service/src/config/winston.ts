import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : '';
      return `[${timestamp}] ${level}: ${message}${metaStr}`;
    }),
  ),
  defaultMeta: { service: 'chat-service' },
  transports: [
    new winston.transports.Console(),

    new DailyRotateFile({
      filename: path.join(logDir, '%DATE%-error.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d', // auto delete after 14 days
    }),

    new DailyRotateFile({
      filename: path.join(logDir, '%DATE%-combined.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxFiles: '14d', // auto delete after 14 days
    }),
  ],
});

export default logger;
