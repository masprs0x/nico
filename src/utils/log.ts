import debug from 'debug';

const log = debug('nico');

/**
 * Log Lovel -
 * 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal
 */
export class Logger {
  silly(formatter: any, ...args: any[]) {
    log.extend('silly')(formatter, ...args);
  }

  trace(formatter: any, ...args: any[]) {
    log.extend('trace')(formatter, ...args);
  }

  debug(formatter: any, ...args: any[]) {
    log.extend('debug')(formatter, ...args);
  }

  info(formatter: any, ...args: any[]) {
    log.extend('info')(formatter, ...args);
  }

  warn(formatter: any, ...args: any[]) {
    log.extend('warn')(formatter, ...args);
  }

  error(formatter: any, ...args: any[]) {
    log.extend('error')(formatter, ...args);
  }

  fatal(formatter: any, ...args: any[]) {
    log.extend('fatal')(formatter, ...args);
  }
}

export default new Logger();
