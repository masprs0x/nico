import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import os from 'os';
import util from 'util';
import chalk from 'chalk';
import { ConfigLogger, Logger, FileLevel } from '../../typings';

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

  return `${info.timestamp} ${info.level}\n${util.inspect(message, { colors: true, depth: 8 })}`;
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
    frequency: '1h',
    dirname: './log/trace',
    datePattern: 'YYYY-MM-DD-HH',
    maxSize: '20m',
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

    if (fileLevel.level) {
      defaultFileTransportOptions.dirname = `./log/${fileLevel.level}`;
    }

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
