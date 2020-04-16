import { Context, Next } from 'koa';
import debug from 'debug';

const log = debug('nico:err');

export = () => {
  return async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (err) {
      log(err);

      ctx.status = 500;
      ctx.body = 'Server Error';
      return;
    }
  };
};
