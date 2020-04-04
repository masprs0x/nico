import { Context, Next } from 'koa';
import { ConfigResponses } from '../../../typings';

export = (responses: ConfigResponses) => {
  return async (ctx: Context, next: Next) => {
    Object.entries(responses).map(([key, value]) => {
      ctx[key] = value;
    });

    await next();
  };
};
