import { Context, Next } from '../../../typings';

function createUid() {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

function getUrl(ctx: Context) {
  return ctx.method + ' ' + ctx.url;
}

export default function getDebugMiddleware() {
  const HEADER_REQUEST_ID = 'X-Request-ID';

  return async function debugMiddleware(ctx: Context, next: Next) {
    let start: [number, number] = [0, 0];

    start = process.hrtime();

    const requestId = ctx.get(HEADER_REQUEST_ID) || createUid();

    if (!ctx.get(HEADER_REQUEST_ID)) {
      ctx.set(HEADER_REQUEST_ID, requestId);
    }

    ctx.logger = ctx.logger.child({ requestId, url: getUrl(ctx), label: 'request' });
    ctx.logger.child({ stage: 'debug-middleware' }).debug('api start');

    await next();

    const end = process.hrtime(start);
    const time = end[0] * 1000 + end[1] / 1000000;

    ctx.logger.child({ stage: 'debug-middleware', executeTime: time }).debug('api end');
  };
}
