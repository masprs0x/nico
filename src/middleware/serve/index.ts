import Router from '@koa/router';
import serve from 'koa-static';
import path from 'path';

import { ConfigServe, Context, Next } from '../../../typings';

export default function getServeMiddleware(router: Router, config?: ConfigServe) {
  const { root, route = '/assets', opts } = config || {};

  if (root) {
    router.get(
      `${route}/(.+)`,
      async (ctx: Context, next: Next) => {
        ctx.path = ctx.path.slice(route.length);
        ctx.logger.child({ stage: 'serve' }).trace('serve static assets');
        await next();
      },
      serve(path.resolve(process.cwd(), root), {
        defer: false,
        maxAge: 1 * 24 * 3600 * 1000,
        ...opts,
      }),
    );
  }

  return async function serveMiddleware(ctx: Context, next: Next) {
    await next();
  };
}
