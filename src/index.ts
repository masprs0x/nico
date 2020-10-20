import Koa from 'koa';
import Router from '@koa/router';
import cluster from 'cluster';
import os from 'os';

import routes from './middleware/routes';
import errorHandler from './middleware/error-handler';
import responses from './middleware/responses';
import defaultConfig from './config';
import { mergeConfigs, createUid } from './utils/utility';
import serve from './middleware/serve';
import cors from './middleware/cors';
import logger, { initLogger } from './lib/logger';
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

  #initialed = false;

  #started = false;

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

  #signalHandlers: { [key: string]: SignalHandler } = {
    SIGINT: () => {},
    SIGTERM: () => {},
  };

  get initialed() {
    return this.#initialed;
  }

  get started() {
    return this.#started;
  }

  get config() {
    return Object.freeze(this.#config);
  }

  constructor() {
    super();

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

  useAppMiddleware(getMiddleware: GetMiddlewareFunc, after = 'global-cors') {
    if (this.#initialed) {
      this.logger.warn('custom app middleware should mount before init');
    }

    this.appMiddlewares = this.getCustomMiddlewares(this.appMiddlewares, getMiddleware, after);
  }

  useRouteMiddleware(getMiddleware: GetMiddlewareFunc, after = 'controller-cors') {
    if (this.#initialed) {
      this.logger.warn('custom route middleware should mount before init');
    }

    this.routeMiddlewares = this.getCustomMiddlewares(this.routeMiddlewares, getMiddleware, after);
  }

  useSignalHandler(signalOrSignals: NodeJS.Signals | NodeJS.Signals[], handler: SignalHandler) {
    if (this.#started) {
      this.logger.warn('You must call useSignal before start');
      return;
    }

    const signals = Array.isArray(signalOrSignals) ? signalOrSignals : [signalOrSignals];
    signals.forEach((signal) => {
      this.#signalHandlers[signal.toUpperCase()] = handler;
    });
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

    this.use(getHelperMiddleware(config.helpers));
    Object.keys(config.helpers).map((key) => {
      this.context.helper[key] = config.helpers[key].bind(this.context);
      return undefined;
    });

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

  private createServer(port = 1314, listener?: (this: Nico) => void) {
    const server = this.listen(port, listener);

    const getSignalListener: (handler: SignalHandler) => NodeJS.SignalsListener = (handler) => (
      signal,
    ) => {
      this.logger.trace({
        ...(cluster.worker ? { pid: cluster.worker.process.pid, workerId: cluster.worker.id } : {}),
        message: `${signal} signal received`,
      });

      const timeout = setTimeout(() => {
        this.logger.error({
          forceExitTime: this.config.advancedConfigs.forceExitTime,
          message: `${signal} handler execute too long, force exit fired`,
        });
        process.exit(1);
      }, this.config.advancedConfigs.forceExitTime ?? 10 * 1000);

      server.close(async (err) => {
        let code = 0;
        if (err) {
          code = 1;
          this.logger.error(err);
          handler && (await handler.call(this, err));
        } else {
          handler && (await handler.call(this));
        }

        clearTimeout(timeout);
        process.exit(code);
      });
    };

    Object.entries(this.#signalHandlers).map(([signal, handler]) => {
      process.on(signal as NodeJS.Signals, getSignalListener(handler));
      return undefined;
    });

    process.on('uncaughtException', (err) => {
      this.logger.fatal({ message: err.message, stack: err.stack });
    });

    return server;
  }

  start(port = 1314, listener?: (this: Nico) => void) {
    if (this.#started) {
      this.logger.error('nico already started');
      return undefined;
    }

    if (!this.#initialed) {
      this.init();
      this.logger.warn('nico need init before start, auto init fired');
    }

    this.logger.info({ port, pid: process.pid, message: `app started` });

    return this.createServer(port, listener?.bind(this));
  }

  startCluster(port = 1314, instances = os.cpus().length) {
    let closing = false;

    cluster.on('online', (worker) => {
      this.logger.trace({ pid: worker.process.pid, workerId: worker.id, message: 'worker start' });
    });

    cluster.on('exit', (worker, code) => {
      this.logger.trace({
        pid: worker.process.pid,
        workerId: worker.id,
        code,
        message: `worker exit`,
      });

      !closing && cluster.fork();
    });

    if (cluster.isMaster) {
      this.logger.info({
        port,
        pid: process.pid,
        instances,
        message: 'app started with cluster mode',
      });

      for (let i = 0; i < instances; i += 1) {
        cluster.fork();
      }

      Object.keys(this.#signalHandlers).map((signal) =>
        process.on(signal as NodeJS.Signals, () => {
          closing = true;
          Object.values(cluster.workers).map((work) => work?.kill(signal));
        }),
      );
    } else {
      this.createServer(port);
    }
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

export type SignalHandler = (this: Nico, error?: Error) => void;
