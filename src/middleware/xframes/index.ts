import { Context, Next } from 'koa';
import { XFrameOptions } from '../../../typings';

export default function getXframesMiddleware(value: XFrameOptions) {
  return async function xframesMiddleware(ctx: Context, next: Next) {
    await next();

    if (value) {
      ctx.set('X-Frame-Options', value);
    }
  };
}
