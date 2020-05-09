import { Context, Next } from 'koa';

export = () => {
  return async (ctx: Context, next: Next) => {
    await next();
    ctx.remove('Access-Control-Allow-Origin');
    ctx.remove('Access-Control-Allow-Credentials');
    ctx.remove('Access-Control-Allow-Methods');
    ctx.remove('Access-Control-Allow-Headers');
    ctx.remove('Access-Control-Max-Age');
  };
};
