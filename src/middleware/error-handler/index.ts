import { Context, Next } from 'koa';

import log from '../../utils/log';

export default function getErrorMiddleware() {
  return async function errorMiddleware(ctx: Context, next: Next) {
    try {
      await next();
    } catch (err) {
      log.fatal.extend('error-middleware')(err);

      if (ctx.onError) {
        return ctx.onError(err);
      }

      ctx.status = 500;
      ctx.body = 'Server Error';
      return;
    }
  };
}
