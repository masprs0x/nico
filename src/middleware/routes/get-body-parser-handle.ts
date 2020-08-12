import KoaBody from 'koa-body';

import { Context, Next } from '../../../typings';

export default function getBodyParserHandleMiddleware(koaOptions?: KoaBody.IKoaBodyOptions) {
  return async function bodyParserHandleMiddleware(ctx: Context, next: Next) {
    ctx.logger = ctx.logger.child({ stage: 'middleware-bodyParser' });
    try {
      ctx.logger.debug('hit bodyParser middleware');
      await KoaBody(koaOptions)(ctx, next);
    } catch (err) {
      ctx.logger.error(`hit bodyParser middleware catch: ${err.message}`);

      if (ctx.onBodyParserError) {
        return ctx.onBodyParserError(err);
      }

      throw err;
    }
  };
}
