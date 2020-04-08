import { Context, Next } from 'koa';
import Router from '@koa/router';
import serve from 'koa-static';
import path from 'path';
import debug from 'debug';

import { ConfigServe } from '../../../typings';

const log = debug('nico:serve');

export = (router: Router, config: ConfigServe) => {
  const { root, opts } = config;

  if (root) {
    router.get(
      `/${root}/*`,
      async (ctx, next) => {
        ctx.path = ctx.path.slice(('/' + root).length);
        log(ctx.method + ' ' + ctx.path);
        await next();
      },
      serve(path.resolve(process.cwd(), root), {
        defer: false,
        maxAge: 1 * 24 * 3600 * 1000,
        ...opts
      })
    );
  }

  return async (ctx: Context, next: Next) => {
    await next();
  };
};
