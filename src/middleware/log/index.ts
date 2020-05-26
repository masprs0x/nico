import { Context, Next } from 'koa';
import debug from 'debug';

const log = debug('nico:api');

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
        const path = ctx.path;
        log(ctx.method + ' ' + path);

        // log controller
        log.extend('controller')(controllerName);

        // log payload
        const stateKeys = ['params', 'query', 'body'];
        const state = ctx.state as any;
        stateKeys.map((key) => {
          state[key] && log.extend(key)({ ...state[key] });
        });

        // log execute time
        const end = process.hrtime(start);
        const time = end[0] * 1000 + end[1] / 1000000;
        log.extend('time')(`+${time}ms`);
        if (time > 2000) {
          log.extend('performance')('execute too long');
        }
      }
    } catch (err) {
      log.extend('err')(err);

      return ctx.ok(undefined, err.message, false);
    }
  };
};
