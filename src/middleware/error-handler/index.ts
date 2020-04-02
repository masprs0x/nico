import { Context, Next } from 'koa';
import debug from 'debug';

const log = debug('nico:err');

export = () => {
  return async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (err) {
      log(err);

      return ctx.ok(undefined, err.message, false);
    }
  };
};
