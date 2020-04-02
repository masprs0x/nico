import { Context, Next } from 'koa';
import Application from '../../../typings/app';

export = (config: Application.Config) => {
  return async (ctx: Context, next: Next) => {
    ctx.state.custom = config.custom;

    await next();
  };
};
