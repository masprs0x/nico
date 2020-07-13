import KoaBody from 'koa-body';

import { Context, Middleware, Next, ConfigSecurity, DefaultState, DefaultCustom, ConfigRoute } from '../../../typings';
import log from '../../utils/log';
import debug, { debugLog } from '../debug';
import cors from '../cors';
import removeCors from '../cors/remove';
import xframes from '../xframes';
import csp from '../csp';

async function defaultController(ctx: Context, next: Next) {
  await next();
}

function forbiddenMiddleware(ctx: Context) {
  ctx.status = 403;
  ctx.body = 'Route is disabled';
  return ctx;
}

const removeCorsMiddleware = removeCors();

export default function getMiddlewares<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom>(
  routeConfig: ConfigRoute<TState, TCustom>,
  options?: { securityConfig?: ConfigSecurity }
) {
  const { securityConfig = {} } = options ?? {};
  const middlewares: Middleware<TState, TCustom>[] = [];

  const {
    controller = defaultController,
    policies = true,
    bodyParser = false,
    validate = {},
    cors: corsOptions,
    xframes: xframesOptions,
    csp: cspOptions
  } = routeConfig;

  /** Log Router */
  middlewares.push(debug('api:route', { stage: 'api-start' }));

  /** Cors Middleware */
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
        ...corsOptions
      };
      middlewares.push(cors(corsConfig, false));
    }
  }

  /** CSP Middleware */
  if (cspOptions) {
    if (typeof cspOptions === 'boolean') {
      cspOptions && middlewares.push(csp(securityConfig.csp || { policy: {} }));
    } else {
      middlewares.push(csp(cspOptions));
    }
  }

  /** Xframes Middleware */
  if (xframesOptions) {
    if (typeof xframesOptions === 'boolean') {
      xframesOptions === true && middlewares.push(xframes(securityConfig.xframes || 'SAMEORIGIN'));
    } else {
      middlewares.push(xframes(xframesOptions));
    }
  }

  /** Policies Middleware */
  if (typeof policies === 'boolean') {
    !policies && middlewares.push(forbiddenMiddleware);
  } else if (Array.isArray(policies)) {
    policies.map((policyMiddleware) => {
      middlewares.push(async (ctx, next) => {
        debugLog('api:policy', ctx, {
          stage: 'policy',
          name: policyMiddleware.name
        });

        await policyMiddleware(ctx, next);
      });
    });
  }

  /** BodyParser Middleware */
  if (bodyParser) {
    if (typeof bodyParser === 'boolean') {
      bodyParser &&
        middlewares.push(async (ctx, next) => {
          try {
            await KoaBody()(ctx, next);
          } catch (err) {
            debugLog('api:body-parser', ctx, {
              stage: 'body-parser',
              errMessage: err.message
            });

            if (ctx.onBodyParserError) {
              return ctx.onBodyParserError(err);
            }

            throw err;
          }
        });
    } else {
      middlewares.push(KoaBody(bodyParser));
    }
  }

  /** Validate Middleware */
  Object.keys(validate).map((key) => {
    const validateMiddleware = async (ctx: Context<TState, TCustom>, next: Next) => {
      if (key === 'params' || key === 'query' || key === 'body') {
        const validator = validate[key];
        const data = key == 'params' ? ctx.params : ctx.request[key];
        let value = {};

        if (typeof validator === 'function') {
          value = await validator(data);
        } else if (typeof validator === 'object' && validator.validateAsync) {
          if (validator.type !== typeof data) {
            log.warn.extend('validate')(`%s type %s mismatch Joi.Schema type %s`, key, typeof data, validator.type);
          } else {
            try {
              value = await validator.validateAsync(data);
              debugLog('api:validate', ctx, {
                stage: 'validate-' + key,
                value
              });
            } catch (err) {
              debugLog('api:validate', ctx, {
                stage: 'validate-' + key,
                data,
                errMessage: err.message
              });

              if (ctx.onValidateError) {
                return ctx.onValidateError(err);
              }

              throw err;
            }
          }
        }

        ctx.state[key] = value;
      }

      await next();
    };

    middlewares.push(validateMiddleware);
  });

  const controllers = Array.isArray(controller) ? controller : [controller];
  const controllerMiddlewares = controllers.map((o) => {
    return async (ctx: Context<TState, TCustom>, next: Next) => {
      debugLog('api:controller', ctx, {
        stage: 'controller',
        name: o.name
      });

      await o(ctx, next);
    };
  });

  return [...middlewares, ...controllerMiddlewares];
}
