import Koa from 'koa';
import Router from '@koa/router';

import routes from './middleware/routes';
import errorHandler from './middleware/error-handler';
import responses from './middleware/responses';
import defaultConfig from './config';
import { mergeConfigs } from './utils/utility';
import serve from './middleware/serve';
import cors from './middleware/cors';
import logger, { Logger } from './utils/logger';

import { Config, DefaultState, DefaultCustom } from '../typings';

export * from '../typings';

export class Nico<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom> extends Koa {
  config: Config<TState, TCustom> = defaultConfig;
  logger: Logger = logger;

  #initialed = false;

  constructor(...inputConfigs: Config<TState, TCustom>[]) {
    super();

    this.config = mergeConfigs<TState, TCustom>(defaultConfig, ...inputConfigs);
  }

  init(...inputConfigs: Config<TState, TCustom>[]) {
    if (this.#initialed) {
      this.logger.error('nico can only be initialize once');
      return;
    }

    this.config = mergeConfigs<TState, TCustom>(this.config, ...inputConfigs);
    this.context.logger = this.logger;
    this.context.custom = this.config.custom;

    const config = this.config;

    this.use(errorHandler());
    this.use(cors(config.security?.cors));
    this.use(responses(config.responses));

    const serveRouter = new Router();
    this.emit('beforeServe', serveRouter);
    this.use(serve(serveRouter, config.serve));

    const router = new Router(config.advancedConfigs?.routerOptions);
    this.emit('beforeRouter', router);
    this.use(routes<TState, TCustom>(router, config));

    this.use(serveRouter.routes()).use(serveRouter.allowedMethods());
    this.use(router.routes()).use(router.allowedMethods());

    this.#initialed = true;
  }

  start(port = 1314, messageOrListener?: string | (() => void)) {
    let listener = () => {
      if (typeof messageOrListener === 'string') {
        this.logger.info(messageOrListener);
      } else {
        this.logger.info(`app is on ${port}`);
      }
    };

    if (typeof messageOrListener === 'function') {
      listener = messageOrListener;
    }

    this.listen(port, listener);
  }

  mergeConfigs = mergeConfigs;
}

export default new Nico();
