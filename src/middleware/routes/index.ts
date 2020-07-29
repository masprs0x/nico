import Router from '@koa/router';

import { Context, Next, HttpMethod, ConfigRoutes, Config, DefaultState, DefaultCustom, ConfigRoute } from '../../../typings';

import logger, { Logger } from '../../utils/logger';
import getMiddlewares from './get-middlewares';

export default function getRouterMiddleware<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom>(
  router: Router<TState, TCustom>,
  config: Config<TState, TCustom>,
  options: {
    routeMiddlewares: string[];
    logger: Logger;
  }
) {
  const routesConfig = config.routes || {};

  const testMethod = /^(get|post|delete|put|patch|options|all)$/;

  const mountRoutes = (configRoutes: ConfigRoutes<TState, TCustom>, prefix = '') => {
    Object.entries(configRoutes).map(([key, value]) => {
      const isPrefix = key.startsWith('/');

      if (!isPrefix) {
        const [methodStr, route = ''] = key.split(' ');
        const method = methodStr.toLowerCase();

        if (!testMethod.test(method)) {
          logger.error('invalid route', key);
          return;
        }

        const middlewares = getMiddlewares<TState, TCustom>(value as ConfigRoute, {
          securityConfig: config.security,
          routeMiddlewares: options.routeMiddlewares,
          logger: options.logger,
          middlewares: config.middlewares
        });

        router[method as HttpMethod](prefix + route, ...middlewares);
      } else {
        mountRoutes(value as ConfigRoutes, prefix + key);
      }
    });
  };

  mountRoutes(routesConfig);

  return async function routerMiddleware(ctx: Context<TState, TCustom>, next: Next) {
    await next();
  };
}
