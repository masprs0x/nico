import { Logger as WinstonLogger, createLogger, format, transports, LeveledLogMethod } from 'winston';
import os from 'os';
import util from 'util';
import chalk from 'chalk';
import { ConfigLogger } from '../../typings';

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
  }

  return paint(' ' + level + ' ');
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

const logger = createLogger({
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5
  },
  format: format.combine(levelFormat(), format.timestamp(), outputFormat),
  defaultMeta: {
    serverName: os.hostname()
  },
  transports: []
}) as Logger;

export const initLogger = (logger: Logger, config: ConfigLogger = {}) => {
  logger.clear();

  const { consoleLevel = 'debug', fileLevel = 'none' } = config;

  if (consoleLevel == 'none' && fileLevel == 'none') {
    logger.configure({
      silent: true
    });

    return logger;
  }

  if (consoleLevel !== 'none' && levels.includes(consoleLevel)) {
    logger.add(
      new transports.Console({
        level: config.consoleLevel
      })
    );
  }

  if (fileLevel !== 'none' && levels.includes(fileLevel)) {
    logger.add(
      new transports.File({
        filename: `${config.fileLevel}.log`,
        level: config.fileLevel
      })
    );
  }

  return logger;
};

export default logger;

export interface Logger extends WinstonLogger {
  fatal: LeveledLogMethod;
  trace: LeveledLogMethod;
  child(options: Object): Logger;
}
