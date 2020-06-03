import { Context, Next } from 'koa';
import { log, error } from '../../utils/debug';

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
        log('api:url')(ctx.method + ' ' + ctx.path);

        // log controller
        log('api:controller')(controllerName);

        // log payload
        const stateKeys = ['params', 'query', 'body'];
        const state = ctx.state as any;
        stateKeys.map((key) => {
          state[key] && log(`api:${key}`)({ ...state[key] });
        });

        // log execute time
        const end = process.hrtime(start);
        const time = end[0] * 1000 + end[1] / 1000000;
        log('api:time')(`+${time}ms`);
        if (time > 2000) {
          error('api:performance')('execute too long');
        }
      }
    } catch (err) {
      error('api')(err);

      return ctx.ok(undefined, err.message, false);
    }
  };
};
