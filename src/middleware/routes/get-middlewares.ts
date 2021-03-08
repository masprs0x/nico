import path from 'path';

import {
  Logger,
  ConfigSecurity,
  ConfigRoute,
  CustomMiddlewares,
  NicoMiddleware as Middleware,
  NicoContext as Context,
  NicoNext as Next,
} from '../../../typings';

import debug from '../debug';
import cors from '../cors';
import removeCors from '../cors/remove';
import xframes from '../xframes';
import csp from '../csp';
import defaultLogger from '../../lib/logger';
import bodyParser from '../body-parser';

import getPolicyHandleMiddleware from './get-policy-handle';
import getControllerHandleMiddleware from './get-controller-handle';

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
    } else if (name === 'validate') {
      Object.keys(validate).forEach((key) => {
        const stage = `validate-${key}`;

        const validateMiddleware = async (ctx: Context, next: Next) => {
          ctx.logger = ctx.logger.child({ stage });

          if (key !== 'params' && key !== 'query' && key !== 'body' && key !== 'files') {
            ctx.logger.trace(`${key} is not allowed in validate`);
            return next();
          }

          let data = key === 'params' ? ctx.params : ctx.request[key];

          try {
            if (key === 'params' || key === 'query' || key === 'body') {
              const validator = validate[key];

              let value = {};

              if (typeof validator === 'function') {
                value = await validator(data);
              } else if (typeof validator === 'object' && validator.validateAsync) {
                if (validator.type !== typeof data) {
                  ctx.logger.warn(
                    `${key} type ${typeof data} mismatch Joi.Schema type ${validator.type}`,
                  );
                } else {
                  value = await validator.validateAsync(data);
                  ctx.logger.trace({ origin: data, parsed: value });
                }
              }

              ctx.state[key] = value;
            } else if (key === 'files') {
              const files = validate.files || {};

              await Promise.all(
                Object.keys(files).map(async (optionalFileKey) => {
                  let allowNull = false;
                  let fileKey = optionalFileKey;

                  if (optionalFileKey.endsWith('?')) {
                    fileKey = optionalFileKey.slice(0, -1);
                    allowNull = true;
                  }

                  const file = ctx.request?.files?.[fileKey];

                  if (!file) {
                    if (allowNull) return;
                    throw new Error(`${fileKey} is required`);
                  }

                  if (Array.isArray(file)) {
                    throw new Error(`file validate don't support multiple files`);
                  }

                  const fileValidateSchema = files[optionalFileKey];

                  await Promise.all(
                    Object.keys(fileValidateSchema).map(async (fileValidateKey) => {
                      const validator = fileValidateSchema[fileValidateKey];

                      if (
                        !['size', 'name', 'basename', 'extname', 'type'].includes(fileValidateKey)
                      ) {
                        ctx.logger.warn(`${fileValidateKey} is not allowed in files validates`);
                        return;
                      }

                      try {
                        if (typeof validator === 'function') {
                          if (fileValidateKey === 'basename') {
                            await validator(path.basename(file.name, path.extname(file.name)));
                          } else if (fileValidateKey === 'extname') {
                            await validator(path.extname(file.name));
                          } else {
                            // @ts-ignore
                            await validator(file[fileValidateKey]);
                          }
                        } else if (typeof validator === 'object' && validator.validateAsync) {
                          if (fileValidateKey === 'basename') {
                            await validator.validateAsync(
                              path.basename(file.name, path.extname(file.name)),
                            );
                          } else if (fileValidateKey === 'extname') {
                            await validator.validateAsync(path.extname(file.name));
                          } else {
                            // @ts-ignore
                            await validator.validateAsync(file[fileValidateKey]);
                          }
                        }
                      } catch (err) {
                        data = data[fileKey];
                        throw err;
                      }
                    }),
                  );

                  ctx.logger.trace({ [fileKey]: file });
                }),
              );

              ctx.state.files = ctx.request.files;
            } else {
              ctx.logger.warn(`validate key '${key}', is not allowed`);
            }
          } catch (err) {
            ctx.logger.error({ origin: data, errMessage: err.message });

            if (ctx.onValidateError) {
              return ctx.onValidateError(err);
            }

            throw err;
          }

          await next();
        };

        middlewares.push(validateMiddleware);
      });
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
