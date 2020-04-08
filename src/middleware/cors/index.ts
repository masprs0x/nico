import { Context, Next } from 'koa';
import { ConfigSecurity } from '../../../typings';

export = (config: ConfigSecurity) => {
  return async (ctx: Context, next: Next) => {
    await next();
    const allowedOrigin = config.cors.allowOrigins;
    const origin = ctx.request.headers.origin;

    if (origin && Array.isArray(allowedOrigin)) {
      if (allowedOrigin.indexOf(origin) > -1) {
        ctx.set('Access-Control-Allow-Origin', origin);
      }
      ctx.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH');
      ctx.set('Access-Control-Allow-Headers', 'Origin, Content-Type, Method');

      if (config.cors.allowCredentials === true) {
        ctx.set('Access-Control-Allow-Credentials', 'true');
      }
    }
  };
};
