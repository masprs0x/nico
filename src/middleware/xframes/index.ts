import { Context, Next } from 'koa';
import { XFrameOptions } from '../../../typings';

export = (value: XFrameOptions) => {
  return async (ctx: Context, next: Next) => {
    await next();

    if (value) {
      ctx.set('X-Frame-Options', value);
    }
  };
};
