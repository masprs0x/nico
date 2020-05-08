import { Context, Next } from 'koa';

import { CorsOptions } from '../../../typings';

export = (config?: CorsOptions, global = true) => {
  const options: CorsOptions = {
    allowOrigins: ['http://127.0.0.1'],
    allowCredentials: false,
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

  const allowedOrigin = options.allowOrigins;
  const allRoutes = options.allRoutes;

  return async (ctx: Context, next: Next) => {
    const requestOrigin = ctx.request.headers.origin;
    const method = ctx.method;
    let origin = '';

    if (((global && allRoutes) || !global) && method !== 'OPTIONS') {
      if (options.allowCredentials === true) {
        ctx.set('Access-Control-Allow-Credentials', 'true');
      }

      if (Array.isArray(allowedOrigin)) {
        if (requestOrigin && allowedOrigin.indexOf(requestOrigin) > -1) {
          origin = requestOrigin;
        }
      } else {
        origin = allowedOrigin;
      }

      origin ? ctx.set('Access-Control-Allow-Origin', origin) : ctx.remove('Access-Control-Allow-Origin');

      await next();
    } else {
      if (!ctx.get('Access-Control-Request-Method')) {
        return await next();
      }

      if (options.allowCredentials === true) {
        ctx.set('Access-Control-Allow-Credentials', 'true');
      }

      ctx.set('Access-Control-Allow-Origin', requestOrigin);

      options.allowMethods && ctx.set('Access-Control-Allow-Methods', options.allowMethods);

      let allowHeaders = options.allowHeaders;
      if (!allowHeaders) {
        allowHeaders = ctx.get('Access-Control-Request-Headers');
      }
      allowHeaders && ctx.set('Access-Control-Allow-Headers', allowHeaders);

      ctx.status = 204;
    }
  };
};
