import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
  LeveledLogMethod,
} from 'winston';
import 'winston-daily-rotate-file';
import os from 'os';
import util from 'util';
import chalk from 'chalk';

export type LoggerLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type DailyRotateFileTransportOptions = {
  level?: LoggerLevel;
  datePattern?: string;
  zippedArchive?: boolean;
  filename?: string;
  dirname?: string;
  stream?: NodeJS.WritableStream;
  maxSize?: string | number;
  maxFiles?: string | number;
  options?: string | object;
  auditFile?: string;
  frequency?: string;
  utc?: boolean;
  extension?: string;
  createSymlink?: boolean;
  symlinkName?: string;
};

export type FileLevel = LoggerLevel | DailyRotateFileTransportOptions;
export interface ConfigLogger {
  fileLevel?: FileLevel | FileLevel[] | 'none';
  consoleLevel?: LoggerLevel | 'none';
}

export interface Logger extends WinstonLogger {
  fatal: LeveledLogMethod;
  trace: LeveledLogMethod;
  child(options: Object): Logger;
}

const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

const colorize = (inputLevel: string) => {
  const level = inputLevel.toUpperCase();
  let paint = chalk.white.cyan;

  switch (level) {
    case 'FATAL':
      paint = chalk.white.bgRgb(255, 0, 185).bold;
      break;
    case 'ERROR':
      paint = chalk.white.bgRed.bold;
      break;
    case 'WARN':
      paint = chalk.white.bgRgb(200, 128, 0).bold;
      break;
    case 'INFO':
      paint = chalk.white.bgBlue.bold;
      break;
    case 'DEBUG':
      paint = chalk.white.bgRgb(0, 157, 37).bold;
      break;
    case 'TRACE':
      paint = chalk.white.bgRgb(91, 0, 171).bold;
      break;
    default:
      paint = chalk.white.cyan;
  }

  return paint(` ${level} `);
};

const levelFormat = format((info) => {
  info.level = colorize(info.level);
  return info;
});

const outputFormat = format.printf((info) => {
  const message = Object.keys(info).reduce((result, key) => {
    result[key] = info[key];
    return result;
  }, {} as any);

  delete message.level;
  delete message.timestamp;

  return `${info.timestamp} ${info.level}\n${util.inspect(message, {
    colors: true,
    depth: 8,
    breakLength: 1,
  })}`;
});

const defaultLogger = createLogger({
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  format: format.combine(levelFormat(), format.timestamp(), outputFormat),
  defaultMeta: {
    serverName: os.hostname(),
  },
  transports: [],
}) as Logger;

const mountFileTransport = (logger: Logger, fileLevel: FileLevel) => {
  const defaultFileTransportOptions = {
    level: 'trace',
    frequency: '24h',
    dirname: './log/trace',
    datePattern: 'YYYY-MM-DD-HH',
    maxSize: undefined,
    maxFiles: '30d',
  };

  if (typeof fileLevel === 'string') {
    logger.add(
      new transports.DailyRotateFile({
        ...defaultFileTransportOptions,
        filename: '%DATE%.log',
        dirname: `./log/${fileLevel}`,
        level: fileLevel,
      }),
    );
  }

  if (typeof fileLevel === 'object') {
    if (!fileLevel.stream && !fileLevel.filename) {
      fileLevel.filename = '%DATE%.log';
    }

    if (fileLevel.level && !fileLevel.dirname) {
      fileLevel.dirname = `./log/${fileLevel.level}`;
    }

    // @ts-ignore
    logger.add(new transports.DailyRotateFile({ ...defaultFileTransportOptions, ...fileLevel }));
  }
};

export const initLogger = (logger: Logger, config: ConfigLogger = {}) => {
  logger.clear();

  const { consoleLevel = 'info', fileLevel = 'none' } = config;

  if (consoleLevel === 'none' && fileLevel === 'none') {
    logger.configure({
      silent: true,
    });

    return logger;
  }

  if (consoleLevel !== 'none' && levels.includes(consoleLevel)) {
    logger.add(
      new transports.Console({
        level: config.consoleLevel,
      }),
    );
  }

  if (fileLevel !== 'none') {
    if (Array.isArray(fileLevel)) {
      fileLevel.map((o) => {
        mountFileTransport(logger, o);
        return undefined;
      });
    } else {
      mountFileTransport(logger, fileLevel);
    }
  }

  return logger;
};

export default defaultLogger;
