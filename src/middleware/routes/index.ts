import Router from '@koa/router';
import KoaBody from 'koa-body';
import { Middleware, Context, Next } from 'koa';
import debug from 'debug';

import cors from '../cors';
import xframes from '../xframes';
import { HttpMethod, ConfigRoutes, Config, ConfigSecurity } from '../../../typings';

const log = debug('nico:api');

export = function <State, Custom>(router: Router<State, Custom>, config: Config<State, Custom>) {
  const configRoutes = config.routes as ConfigRoutes<State, Custom>;
  const configSecurity = config.security as ConfigSecurity;

  Object.entries(configRoutes).map(([key, value]) => {
    const { controller, policies = true, bodyParser = false, validate = {}, cors: corsOptions, xframes: xframesOptions } = value;
    const [methodStr, ...route] = key.split(' ');
    const method = methodStr.toLowerCase();
    const testMethod = /^(get|post|delete|put|patch)$/;

    if (!testMethod.test(method)) {
      console.error('E_ROUTES_INVALID_HTTP_METHOD: ', key);
      return;
    }

    let middlewares: Middleware<State, Custom>[] = [];

    /** Debug Method Middleware */
    if (process.env.NODE_ENV === 'development') {
      middlewares.push(async (ctx: Context, next: Next) => {
        const path = ctx.path;
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
    }

    /** Cors Middleware */
    if (corsOptions) {
      middlewares.push(cors(corsOptions));
    } else {
      if (configSecurity.cors?.allRoutes) {
        middlewares.push(cors(configSecurity.cors));
      }
    }

    /** Route Error Handler Middleware */
    middlewares.push(async (ctx: Context, next: Next) => {
      try {
        await next();
      } catch (err) {
        log.extend('err')(err);

        return ctx.ok(undefined, err.message, false);
      }
    });

    /** Xframes Middleware */
    if (xframesOptions) {
      if (typeof xframesOptions === 'boolean' && xframesOptions === true) {
        middlewares.push(xframes(configSecurity.xframes || 'SAMEORIGIN'));
      } else {
        middlewares.push(xframes(xframesOptions));
      }
    }

    /** Policies Middleware */
    if (typeof policies === 'boolean') {
      if (!policies) {
        middlewares.push((ctx: Context, next: Next) => {
          ctx.status = 400;
          ctx.body = 'Route is disabled';
          return ctx;
        });
      }
    } else if (Array.isArray(policies)) {
      middlewares = middlewares.concat([...policies]);
    }

    /** BodyParser Middleware */
    if (bodyParser) {
      if (typeof bodyParser === 'boolean' && bodyParser) {
        middlewares.push(KoaBody());
      } else {
        middlewares.push(KoaBody({ ...bodyParser }));
      }
    }

    /** Validate Middleware */
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

    /** Debug Payload Middleware */
    if (process.env.NODE_ENV === 'development') {
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
