import Router from '@koa/router';
import KoaBody from 'koa-body';
import { Middleware, Context, Next } from 'koa';
import debug from 'debug';
import { HttpMethod, ConfigRoutes } from '../../../typings';

const log = debug('nico:api');

export = function <State, Custom>(router: Router<State, Custom>, config: ConfigRoutes<State, Custom> = {}, routerPrifix?: string) {
  const prefix = routerPrifix ?? '';

  router.prefix(prefix);

  Object.entries(config).map(([key, value]) => {
    const { controller, policies = true, bodyParser = false, validate = {} } = value;
    const [methodStr, ...route] = key.split(' ');
    const method = methodStr.toLowerCase();
    const testMethod = /^(get|post|delete|put|patch)$/;

    if (!testMethod.test(method)) {
      console.error('E_ROUTES_INVALID_HTTP_METHOD: ', key);
      return;
    }

    let middlewares: Middleware<State, Custom>[] = [];
    if (typeof policies === 'boolean') {
      if (!policies) {
        middlewares.push((ctx: Context, next: Next) => {
          ctx.status = 400;
          ctx.body = 'Route is disabled';
          return ctx;
        });
      }
    } else if (Array.isArray(policies)) {
      middlewares = [...policies];
    }

    if (bodyParser) {
      if (typeof bodyParser === 'boolean' && bodyParser) {
        middlewares.push(KoaBody());
      } else {
        middlewares.push(KoaBody({ ...bodyParser }));
      }
    }

    Object.keys(validate).map((key) => {
      const middleware = async (ctx: Context, next: Next) => {
        let value = {};

        if (key === 'params') {
          value = await validate[key]?.validateAsync(ctx.params);
          ctx.state.params = value;
        } else if (key === 'query' || key === 'body') {
          value = await validate[key]?.validateAsync(ctx.request[key]);
          ctx.state[key] = value;
        }

        await next();
      };

      middlewares.push(middleware);
    });

    if (process.env.NODE_ENV === 'development') {
      middlewares.unshift(async (ctx: Context, next: Next) => {
        const path = ctx.path.slice(prefix.length);
        const start = process.hrtime();
        log(ctx.method + ' ' + path);

        await next();
        const end = process.hrtime(start);
        const time = end[0] * 1000 + end[1] / 1000000;
        log.extend('time')(`+${time}ms`);
        if (time > 2000) {
          log.extend('performance')('execute too long');
        }
      });

      middlewares.push(async (ctx: Context, next: Next) => {
        const stateKeys = ['params', 'query', 'body'];
        const state = ctx.state as any;
        stateKeys.map((key) => {
          state[key] && log.extend(key)(state[key]);
        });

        await next();
      });
    }

    router[method as HttpMethod](route, ...middlewares, controller);
  });

  return async (ctx: Context, next: Next) => {
    await next();
  };
};
