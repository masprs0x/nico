import { Context, Next } from 'koa';
import { ConfigCustom } from '../../../typings';

export = (custom: ConfigCustom) => {
  return async (ctx: Context, next: Next) => {
    ctx.state.custom = custom;

    await next();
  };
};
