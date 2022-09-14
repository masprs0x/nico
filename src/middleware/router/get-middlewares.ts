import { logger } from '@blastz/logger';

import {
  ConfigRoute,
  ConfigSecurity,
  CustomMiddlewares,
  NicoContext as Context,
  NicoMiddleware as Middleware,
  NicoNext as Next,
} from '../../../typings';

import { InnerRouteMiddleware } from '../../constants';

import bodyParser from '../body-parser';
import cors from '../cors';
import removeCors from '../cors/remove';
import csp from '../csp';
import xframes from '../xframes';

import getControllerHandleMiddleware from './get-controller-handle';
import getPolicyHandleMiddleware from './get-policy-handle';
import validator from './middleware/validator';

async function defaultController(ctx: Context, next: Next) {
  await next();
}

function forbiddenMiddleware(ctx: Context) {
  ctx.status = 403;
  ctx.body = 'Route is disabled';
  return ctx;
}

const removeCorsMiddleware = removeCors();

export default function getMiddlewares(
  routeConfig: ConfigRoute,
  options?: {
    securityConfig?: ConfigSecurity;
    routeMiddlewares?: string[];
    customMiddlewares?: CustomMiddlewares;
  },
) {
  const { securityConfig = {}, routeMiddlewares = [], customMiddlewares = {} } = options ?? {};
  const middlewares: Middleware[] = [];

  const {
    controller = defaultController,
    policies = true,
    bodyParser: bodyParserOpts = false,
    validate = {},
    cors: corsOptions,
    xframes: xframesOptions,
    csp: cspOptions,
    timeout,
  } = routeConfig;

  routeMiddlewares.forEach((name) => {
    if (name === 'controller-cors') {
      const defaultCorsMiddleware = cors(securityConfig.cors, false);
      if (corsOptions || typeof corsOptions === 'boolean') {
        if (typeof corsOptions === 'boolean') {
          if (corsOptions) {
            middlewares.push(defaultCorsMiddleware);
          } else {
            middlewares.push(removeCorsMiddleware);
          }
        } else {
          const corsConfig = {
            ...securityConfig.cors,
            ...corsOptions,
          };
          middlewares.push(cors(corsConfig, false));
        }
      }
    } else if (name === 'csp') {
      if (cspOptions) {
        if (typeof cspOptions === 'boolean') {
          cspOptions && middlewares.push(csp(securityConfig.csp || { policy: {} }));
        } else {
          middlewares.push(csp(cspOptions));
        }
      }
    } else if (name === 'xframes') {
      if (xframesOptions) {
        if (typeof xframesOptions === 'boolean' && xframesOptions) {
          middlewares.push(xframes(securityConfig.xframes || 'SAMEORIGIN'));
        } else if (typeof xframesOptions === 'object') {
          middlewares.push(xframes(xframesOptions));
        }
      }
    } else if (name === 'policies') {
      if (typeof policies === 'boolean' && !policies) {
        middlewares.push(forbiddenMiddleware);
      } else if (Array.isArray(policies)) {
        policies.forEach((policyMiddleware) => {
          middlewares.push(getPolicyHandleMiddleware(policyMiddleware));
        });
      }
    } else if (name === 'body-parser') {
      if (bodyParserOpts) {
        if (typeof bodyParserOpts === 'boolean' && bodyParserOpts) {
          middlewares.push(bodyParser());
        } else if (typeof bodyParserOpts === 'object') {
          middlewares.push(bodyParser(bodyParserOpts));
        }
      }
    } else if (name === InnerRouteMiddleware.VALIDATE) {
      middlewares.push(validator(validate));
    } else if (name === 'controller') {
      const controllers = Array.isArray(controller) ? controller : [controller];
      const controllerMiddlewares = controllers.map((o) => {
        return getControllerHandleMiddleware(o, { timeout });
      });

      middlewares.push(...controllerMiddlewares);
    } else if (customMiddlewares[name]) {
      middlewares.push(customMiddlewares[name]);
    } else {
      logger.warn(
        `${name} is defined in nico.routeMiddlewares but doesn't be implemented in config.middlewares`,
      );
    }
  });

  return middlewares;
}
