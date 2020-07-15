import { Context, Next } from '../../../typings';

import { log } from '../..';

export default function getDebugMiddleware(namespace: string, data?: object) {
  return async function debugMiddleware(ctx: Context, next: Next) {
    let start: [number, number] = [0, 0];

    start = process.hrtime();

    debugLog(namespace, ctx, data);

    await next();

    const end = process.hrtime(start);
    const time = end[0] * 1000 + end[1] / 1000000;

    debugLog(namespace, ctx, {
      stage: 'api-end',
      time: `${time}ms`
    });
  };
}

export const debugLog = (namespace: string, ctx: Context, data?: object) => {
  log.debug.extend(namespace)('%O', {
    url: ctx.method + ' ' + ctx.url,
    ...data
  });
};
