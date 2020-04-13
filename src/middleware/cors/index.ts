import { Context, Next } from 'koa';
import { CorsOptions } from '../../../typings';

export = (config: CorsOptions) => {
  const options = {
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    allowHeaders: 'Origin, Content-Type, Method',
    ...config
  };

  if (Array.isArray(options.allowMethods)) {
    options.allowMethods = options.allowMethods.join(',');
  }

  if (Array.isArray(options.allowHeaders)) {
    options.allowHeaders = options.allowHeaders.join(',');
  }

  return async (ctx: Context, next: Next) => {
    await next();

    const allowedOrigin = options.allowOrigins;
    const origin = ctx.request.headers.origin;

    if (Array.isArray(allowedOrigin)) {
      if (origin && allowedOrigin.indexOf(origin) > -1) {
        ctx.set('Access-Control-Allow-Origin', origin);
      }
    } else {
      ctx.set('Access-Control-Allow-Origin', allowedOrigin);
    }

    ctx.set('Access-Control-Allow-Methods', options.allowMethods);
    ctx.set('Access-Control-Allow-Headers', options.allowHeaders);

    if (options.allowCredentials === true) {
      ctx.set('Access-Control-Allow-Credentials', 'true');
    }
  };
};
