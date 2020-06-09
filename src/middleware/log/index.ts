import { Context, Next } from 'koa';
import log from '../../utils/log';

export = (controllerName: string) => {
  const isDev = process.env.NODE_ENV === 'development';

  return async (ctx: Context, next: Next) => {
    try {
      let start: [number, number] = [0, 0];

      if (isDev) {
        start = process.hrtime();
      }

      await next();

      if (isDev) {
        // log method + path
        log.debug('api:route %s %s', ctx.method, ctx.path);

        // log controller
        log.debug('api:controller: %s', controllerName);

        // log payload
        const stateKeys = ['params', 'query', 'body'];
        const state = ctx.state as any;
        stateKeys.map((key) => {
          state[key] && log.debug(`api:%s: %o`, key, { ...state[key] });
        });

        // log execute time
        const end = process.hrtime(start);
        const time = end[0] * 1000 + end[1] / 1000000;
        log.debug('api:time: +%dms', time);
        if (time > 2000) {
          log.warn('api:performance: execute too long');
        }
      }
    } catch (err) {
      log.fatal('Error Capture In: /middleware/log/index.js \n %O', err);

      return ctx.ok(undefined, err.message, false);
    }
  };
};
