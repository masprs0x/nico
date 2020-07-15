import { Context, Next } from 'koa';
import { ConfigCustom } from '../../../typings';

export default function getCustomMiddleware(inputCustom?: ConfigCustom) {
  const custom = inputCustom ?? {};

  return async function customMiddleware(ctx: Context, next: Next) {
    ctx.custom = custom;

    await next();
  };
}
