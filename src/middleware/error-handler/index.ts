import { Context, Next } from 'koa';

export default function getErrorMiddleware() {
  return async function errorMiddleware(ctx: Context, next: Next) {
    try {
      await next();
    } catch (err) {
      ctx.logger.child({ stage: 'error-handler-middleware' }).error(err);

      if (ctx.onError) {
        return ctx.onError(err);
      }

      ctx.status = 500;
      ctx.body = 'Server Error';
      return;
    }
  };
}
