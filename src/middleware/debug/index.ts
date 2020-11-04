import { Context, Next } from '../../../typings';

import { createUid } from '../../utils/utility';

function getUrl(ctx: Context) {
  return `${ctx.method} ${ctx.url}`;
}

export default function getDebugMiddleware() {
  const HEADER_REQUEST_ID = 'X-Request-ID';
  const stage = 'middleware-debug';

  return async function debugMiddleware(ctx: Context, next: Next) {
    ctx.state.requestStartTime = process.hrtime();

    const requestId = ctx.get(HEADER_REQUEST_ID) || createUid();

    if (!ctx.get(HEADER_REQUEST_ID)) {
      ctx.set(HEADER_REQUEST_ID, requestId);
    }

    ctx.logger = ctx.logger.child({
      requestId,
      url: getUrl(ctx),
      label: 'request',
      stage,
    });
    ctx.logger.child({ executeTime: 0 }).trace('request in');

    await next();

    ctx.logger.child({ stage, executeTime: ctx.helper.getExecuteTime() }).trace('request out');
  };
}
