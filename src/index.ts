import Koa from 'koa';
import Router from '@koa/router';

import routes from './middleware/routes';
import errorHandler from './middleware/error-handler';
import responses from './middleware/responses';
import defaultConfig from './config';
import { mergeConfigs, createUid } from './utils/utility';
import serve from './middleware/serve';
import cors from './middleware/cors';
import logger, { initLogger } from './utils/logger';
import getHelperMiddleware from './middleware/helper';

import {
  Logger,
  Config,
  GetMiddlewareFunc,
  CustomMiddlewares,
  InputConfig,
  DefaultState,
  DefaultCustom,
} from '../typings';

export * from '../typings';

export class Nico extends Koa {
  logger: Logger;

  #initialed: Boolean;

  #config: Config<any, any>;

  customMiddlewares: CustomMiddlewares = {};

  /** ['error-handler', 'global-cors', 'responses', 'serve', 'routes'] */
  appMiddlewares: string[] = ['error-handler', 'global-cors', 'responses', 'serve', 'routes'];

  /** ['debug', 'controller-cors', 'csp', 'xframes', 'policies', 'body-parser', 'validate', 'controller'] */
  routeMiddlewares: string[] = [
    'debug',
    'controller-cors',
    'csp',
    'xframes',
    'policies',
    'body-parser',
    'validate',
    'controller',
  ];

  get initialed() {
    return this.#initialed;
  }

  get config() {
    return { ...this.#config };
  }

  constructor() {
    super();

    this.#initialed = false;
    this.#config = defaultConfig;
    this.logger = initLogger(logger, defaultConfig.logger);

    this.context.helper = {};
  }

  private getCustomMiddlewares(
    middlewares: string[],
    getMiddleware: GetMiddlewareFunc,
    after: string,
  ) {
    let name = getMiddleware.name.trim();
    if (!name) {
      name = createUid();
      this.logger.warn(`custom middleware need a name, use uuid ${name} instead`);
    }

    if (this.customMiddlewares[name]) {
      this.logger.warn(`custom middleware ${name} already exist, previous one will be used`);
    } else {
      this.customMiddlewares[name] = getMiddleware;
    }

    let result = middlewares;

    const index = middlewares.findIndex((o) => o === after);
    if (index < 0) {
      result = [name].concat(middlewares);
    } else {
      result = middlewares
        .slice(0, index + 1)
        .concat([name])
        .concat(middlewares.slice(index + 1));
    }

    return result;
  }

  useCustomAppMiddleware(getMiddleware: GetMiddlewareFunc, after = 'global-cors') {
    if (this.#initialed) {
      this.logger.warn('custom app middleware should mount before init');
    }

    this.appMiddlewares = this.getCustomMiddlewares(this.appMiddlewares, getMiddleware, after);
  }

  useCustomRouteMiddleware(getMiddleware: GetMiddlewareFunc, after = 'controller-cors') {
    if (this.#initialed) {
      this.logger.warn('custom route middleware should mount before init');
    }

    this.routeMiddlewares = this.getCustomMiddlewares(this.routeMiddlewares, getMiddleware, after);
  }

  init<TState = DefaultState, TCustom = DefaultCustom>(
    ...inputConfigs: InputConfig<TState, TCustom>[]
  ) {
    if (this.#initialed) {
      this.logger.warn('nico can only be initialized once');
      return;
    }

    this.#config = mergeConfigs<TState, TCustom>(this.#config, ...inputConfigs) as Config<
      TState,
      TCustom
    >;
    const config = { ...this.#config };

    this.logger = initLogger(this.logger, config.logger);

    this.context.config = config;
    this.context.logger = this.logger;

    this.use(getHelperMiddleware());

    this.appMiddlewares.forEach((name) => {
      if (name === 'error-handler') {
        this.use(errorHandler());
      } else if (name === 'global-cors') {
        this.use(cors(config.security?.cors));
      } else if (name === 'responses') {
        this.use(responses(config.responses));
      } else if (name === 'serve') {
        const serveRouter = new Router();
        this.use(serve(serveRouter, config.serve));
        this.use(serveRouter.routes()).use(serveRouter.allowedMethods());
      } else if (name === 'routes') {
        const router = new Router(config.advancedConfigs?.routerOptions);
        this.use(
          routes(router, config, {
            routeMiddlewares: this.routeMiddlewares,
            customMiddlewares: this.customMiddlewares,
            logger: this.logger,
          }),
        );
        this.use(router.routes()).use(router.allowedMethods());
      } else {
        const middleware = this.customMiddlewares[name];

        if (middleware) {
          this.use(middleware());
        } else {
          this.logger.warn(
            `${name} is defined in nico.appMiddlewares but doesn't be implemented in config.middlewares`,
          );
        }
      }
    });

    this.#initialed = true;
  }

  start(port = 1314, messageOrListener?: string | (() => void)) {
    if (!this.#initialed) {
      this.init();
      this.logger.warn('nico need init before start, auto init fired');
    }

    let listener = () => {
      if (typeof messageOrListener === 'string') {
        this.logger.info(messageOrListener);
      } else {
        this.logger.info(`app is on ${port}`);
      }
    };

    if (typeof messageOrListener === 'function') {
      listener = messageOrListener.bind(this);
    }

    this.listen(port, listener);
  }

  mergeConfigs = mergeConfigs;
}

let nico: Nico;

export function getNico() {
  if (nico) return nico;
  nico = new Nico();
  return nico;
}

export default getNico();
