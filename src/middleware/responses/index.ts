import { Context, Next } from 'koa';
import Application from '../../../typings/app';

export = (responses: Application.ConfigResponses) => {
  return async (ctx: Context, next: Next) => {
    Object.entries(responses).map(([key, value]) => {
      ctx[key] = value;
    });

    await next();
  };
};
