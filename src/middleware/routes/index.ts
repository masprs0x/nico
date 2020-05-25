import Router from '@koa/router';
import KoaBody from 'koa-body';

import cors from '../cors';
import removeCors from '../cors/remove';
import xframes from '../xframes';
import csp from '../csp';
import log from '../log';

import { Context, Middleware, Next, HttpMethod, ConfigRoutes, Config, ConfigSecurity, DefaultState, DefaultCustom } from '../../../typings';

export = function <TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom>(
  router: Router<TState, TCustom>,
  config: Config<TState, TCustom>
) {
  const configRoutes = config.routes as ConfigRoutes<TState, TCustom>;
  const configSecurity = config.security as ConfigSecurity;

  const defaultCorsMiddleware = cors(configSecurity.cors, false);
  const removeCorsMiddleware = removeCors();

  const testMethod = /^(get|post|delete|put|patch|options|all)$/;

  Object.entries(configRoutes).map(([key, value]) => {
    const { policies = true, bodyParser = false, validate = {}, cors: corsOptions, xframes: xframesOptions, csp: cspOptions } = value;
    let { controller } = value;
    const [methodStr, ...route] = key.split(' ');
    const method = methodStr.toLowerCase();

    if (!controller) {
      controller = async function defaultController(ctx, next) {
        await next();
      };
    }

    if (!testMethod.test(method)) {
      console.error('E_ROUTES_INVALID_HTTP_METHOD: ', key);
      return;
    }

    let middlewares: Middleware<TState, TCustom>[] = [];

    /** Cors Middleware */
    if (corsOptions || typeof corsOptions === 'boolean') {
      if (typeof corsOptions === 'boolean') {
        if (corsOptions) {
          middlewares.push(defaultCorsMiddleware);
        } else {
          middlewares.push(removeCorsMiddleware);
        }
      } else {
        const corsConfig = {
          ...configSecurity.cors,
          ...corsOptions
        };
        middlewares.push(cors(corsConfig, false));
      }
    }

    /** Route Error Handler And Debug Middleware */
    middlewares.push(log(controller.name));

    /** CSP Middleware */
    if (cspOptions) {
      if (typeof cspOptions === 'boolean' && cspOptions === true) {
        middlewares.push(csp(configSecurity.csp || { policy: {} }));
      } else {
        middlewares.push(csp(cspOptions));
      }
    }

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
      if (typeof bodyParser === 'boolean') {
        if (bodyParser) {
          middlewares.push(KoaBody());
        }
      } else {
        middlewares.push(KoaBody({ ...bodyParser }));
      }
    }

    /** Validate Middleware */
    Object.keys(validate).map((key) => {
      const middleware = async (ctx: Context<TState, TCustom>, next: Next) => {
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

    router[method as HttpMethod](route, ...middlewares, controller);
  });

  return async (ctx: Context<TState, TCustom>, next: Next) => {
    await next();
  };
};
