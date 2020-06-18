import { Context, Next } from 'koa';

import log from '../../utils/log';

export = () => {
  return async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (err) {
      log.fatal.extend('error-middleware')(err);

      ctx.status = 500;
      ctx.body = 'Server Error';
      return;
    }
  };
};
