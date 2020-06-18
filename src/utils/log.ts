import debug from 'debug';

const log = debug('nico');

/**
 * Log Lovel -
 * 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal
 */
export class Logger {
  silly = log.extend('silly');
  trace = log.extend('trace');
  debug = log.extend('debug');
  info = log.extend('info');
  warn = log.extend('warn');
  error = log.extend('error');
  fatal = log.extend('fatal');
}

export default new Logger();
