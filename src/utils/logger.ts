import { createLogger, format, transports } from 'winston';
import os from 'os';
import util from 'util';
import chalk from 'chalk';

type Level = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

const colorize = (inputLevel: string) => {
  const level = inputLevel.toUpperCase();
  let paint = chalk.white.cyan;

  switch (level) {
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
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  },
  format: format.combine(levelFormat(), format.timestamp(), outputFormat),
  defaultMeta: {
    serverName: os.hostname()
  },
  transports: [
    new transports.Console({
      level: 'debug'
    })
  ]
});

export default logger;

export { Logger } from 'winston';
