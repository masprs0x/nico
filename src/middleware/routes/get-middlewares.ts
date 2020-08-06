import KoaBody from 'koa-body';

import {
  Logger,
  Context,
  Middleware,
  Next,
  ConfigSecurity,
  DefaultState,
  DefaultCustom,
  ConfigRoute,
  CustomMiddlewares,
} from '../../../typings';

import debug from '../debug';
import cors from '../cors';
import removeCors from '../cors/remove';
import xframes from '../xframes';
import csp from '../csp';
import defaultLogger from '../../utils/logger';

async function defaultController(ctx: Context, next: Next) {
  await next();
}

function forbiddenMiddleware(ctx: Context) {
  ctx.status = 403;
  ctx.body = 'Route is disabled';
  return ctx;
}

const removeCorsMiddleware = removeCors();

export default function getMiddlewares<
  TState extends DefaultState = DefaultState,
  TCustom extends DefaultCustom = DefaultCustom
>(
  routeConfig: ConfigRoute<TState, TCustom>,
  options?: {
    securityConfig?: ConfigSecurity;
    routeMiddlewares?: string[];
    logger?: Logger;
    customMiddlewares?: CustomMiddlewares;
  },
) {
  const {
    securityConfig = {},
    routeMiddlewares = [],
    logger = defaultLogger,
    customMiddlewares = {},
  } = options ?? {};
  const middlewares: Middleware<TState, TCustom>[] = [];

  const {
    controller = defaultController,
    policies = true,
    bodyParser = false,
    validate = {},
    cors: corsOptions,
    xframes: xframesOptions,
    csp: cspOptions,
  } = routeConfig;

  routeMiddlewares.forEach((name) => {
    if (name === 'debug') {
      middlewares.push(debug());
    } else if (name === 'controller-cors') {
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
        if (typeof xframesOptions === 'boolean') {
          xframesOptions === true &&
            middlewares.push(xframes(securityConfig.xframes || 'SAMEORIGIN'));
        } else {
          middlewares.push(xframes(xframesOptions));
        }
      }
    } else if (name === 'policies') {
      if (typeof policies === 'boolean') {
        !policies && middlewares.push(forbiddenMiddleware);
      } else if (Array.isArray(policies)) {
        policies.forEach((policyMiddleware) => {
          const policyName = policyMiddleware.name;
          const stage = `policy-${policyName}`;

          middlewares.push(async (ctx, next) => {
            ctx.logger = ctx.logger.child({ stage });
            ctx.logger.debug(`hit policy ${policyName}`);

            await policyMiddleware(ctx, next);
          });
        });
      }
    } else if (name === 'body-parser') {
      if (bodyParser) {
        if (typeof bodyParser === 'boolean') {
          bodyParser &&
            middlewares.push(async (ctx, next) => {
              const stage = 'middleware-bodyParser';
              ctx.logger = ctx.logger.child({ stage });
              try {
                ctx.logger.debug('hit bodyParser middleware');
                await KoaBody()(ctx, next);
              } catch (err) {
                ctx.logger.error(`hit bodyParser middleware catch: ${err.message}`);

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
    } else if (name === 'validate') {
      Object.keys(validate).forEach((key) => {
        const stage = `validate-${key}`;

        const validateMiddleware = async (ctx: Context<TState, TCustom>, next: Next) => {
          ctx.logger = ctx.logger.child({ stage });

          if (key === 'params' || key === 'query' || key === 'body') {
            const validator = validate[key];
            const data = key === 'params' ? ctx.params : ctx.request[key];
            let value = {};

            if (typeof validator === 'function') {
              value = await validator(data);
            } else if (typeof validator === 'object' && validator.validateAsync) {
              if (validator.type !== typeof data) {
                ctx.logger.warn(
                  `${key} type ${typeof data} mismatch Joi.Schema type ${validator.type}`,
                );
              } else {
                try {
                  value = await validator.validateAsync(data);
                  ctx.logger.debug({ origin: data, parsed: value });
                } catch (err) {
                  ctx.logger.error({ origin: data, errMessage: err.message });

                  if (ctx.onValidateError) {
                    return ctx.onValidateError(err);
                  }

                  throw err;
                }
              }
            }

            ctx.state[key] = value;
          } else {
            ctx.logger.warn(`validate key '${key}', is not allowed`);
          }

          await next();
        };

        middlewares.push(validateMiddleware);
      });
    } else if (name === 'controller') {
      const controllers = Array.isArray(controller) ? controller : [controller];
      const controllerMiddlewares = controllers.map((o) => {
        const stage = `controller-${o.name}`;

        return async (ctx: Context<TState, TCustom>, next: Next) => {
          ctx.logger = ctx.logger.child({ stage });
          ctx.logger
            .child({ executeTime: ctx.helper.getExecuteTime() })
            .debug(`hit controller ${o.name}`);

          await o(ctx, next);
        };
      });

      middlewares.push(...controllerMiddlewares);
    } else if (customMiddlewares[name]) {
      middlewares.push(customMiddlewares[name]());
    } else {
      logger.warn(
        `${name} is defined in nico.routeMiddlewares but doesn't be implemented in config.middlewares`,
      );
    }
  });

  return middlewares;
}
