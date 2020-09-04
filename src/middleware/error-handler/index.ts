import { Context, Next } from 'koa';

export default function getErrorMiddleware() {
  return async function errorMiddleware(ctx: Context, next: Next) {
    try {
      await next();
    } catch (err) {
      ctx.logger = ctx.logger.child({ stage: 'middleware-errorHandler' });
      ctx.logger.fatal(err);

      if (ctx.onError) {
        return ctx.onError(err);
      }

      if (err.message === 'Request timeout') {
        ctx.status = 408;
        ctx.body = 'Request timeout';
      } else {
        ctx.status = 500;
        ctx.body = 'Server Error';
      }
    }
  };
}
