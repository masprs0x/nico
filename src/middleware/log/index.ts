import { Context, Next } from 'koa';
import log from '../../utils/log';

export = (controllerName: string) => {
  return async (ctx: Context, next: Next) => {
    try {
      let start: [number, number] = [0, 0];

      start = process.hrtime();

      await next();

      // log method + path
      log.debug.extend('api:route')(ctx.method, ctx.path);

      // log controller
      log.debug.extend('api:controller')(controllerName);

      // log payload
      const stateKeys = ['params', 'query', 'body'];
      const state = ctx.state as any;
      stateKeys.map((key) => {
        state[key] && log.debug.extend('api:payload')('%s %o', key, { ...state[key] });
      });

      // log execute time
      const end = process.hrtime(start);
      const time = end[0] * 1000 + end[1] / 1000000;
      log.debug.extend('api:time')('%dms', time);
      if (time > 2000) {
        log.warn.extend('api:performance')('execute too long');
      }
    } catch (err) {
      log.fatal.extend('log-middleware')(err);

      return ctx.ok(undefined, err.message, false);
    }
  };
};
