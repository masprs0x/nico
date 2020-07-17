import Router from '@koa/router';
import serve from 'koa-static';
import path from 'path';

import { ConfigServe, Context, Next } from '../../../typings';

export default function getServeMiddleware(router: Router, config?: ConfigServe) {
  const { root, opts } = config ?? {
    root: 'assets'
  };

  if (root) {
    router.get(
      `/${root}/(.+)`,
      async (ctx: Context, next: Next) => {
        ctx.path = ctx.path.slice(('/' + root).length);
        ctx.logger.child({ stage: 'serve' }).debug('static assets');
        await next();
      },
      serve(path.resolve(process.cwd(), root), {
        defer: false,
        maxAge: 1 * 24 * 3600 * 1000,
        ...opts
      })
    );
  }

  return async function serveMiddleware(ctx: Context, next: Next) {
    await next();
  };
}
