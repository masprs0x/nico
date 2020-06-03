import { Context, Next } from 'koa';

import { error } from '../../utils/debug';

export = () => {
  return async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (err) {
      error('global')(err);

      ctx.status = 500;
      ctx.body = 'Server Error';
      return;
    }
  };
};
