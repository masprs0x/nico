import { Context, Next } from 'koa';
import { ConfigCustom } from '../../../typings';

export = (inputCustom?: ConfigCustom) => {
  const custom = inputCustom ?? {};

  return async (ctx: Context, next: Next) => {
    ctx.custom = custom;

    await next();
  };
};
