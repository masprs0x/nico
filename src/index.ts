import Koa from 'koa';
import Router from '@koa/router';

import routes from './middleware/routes';
import errorHandler from './middleware/error-handler';
import responses from './middleware/responses';
import defaultConfig from './config';
import custom from './middleware/custom';
import { mergeConfigs } from './utils/utility';
import serve from './middleware/serve';
import cors from './middleware/cors';
import log, { Logger } from './utils/log';

import { Config, DefaultState, DefaultCustom } from '../typings';

export class Nico<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom> extends Koa {
  config: Config<TState, TCustom> = defaultConfig;
  initialed = false;

  init(...inputConfigs: Config<TState, TCustom>[]) {
    if (this.initialed) {
      log.error('nico can only be initialize once');
      return;
    }

    const config = mergeConfigs<TState, TCustom>(defaultConfig, ...inputConfigs);
    this.config = config;

    this.use(errorHandler());
    this.use(cors(config.security?.cors));
    this.use(custom(config.custom));
    this.use(responses(config.responses));

    const serveRouter = new Router();
    this.emit('beforeServe', serveRouter);
    this.use(serve(serveRouter, config.serve));

    const router = new Router(config.advancedConfigs?.routerOptions);
    this.emit('beforeRouter', router);
    this.use(routes<TState, TCustom>(router, config));

    this.use(serveRouter.routes()).use(serveRouter.allowedMethods());
    this.use(router.routes()).use(router.allowedMethods());

    this.initialed = true;
  }

  start(port = 1314, messageOrListener?: string | (() => void)) {
    let listener = () => {
      if (typeof messageOrListener === 'string') {
        log.info(messageOrListener);
      } else {
        log.info('app is on %d', port);
      }
    };

    if (typeof messageOrListener === 'function') {
      listener = messageOrListener;
    }

    this.listen(port, listener);
  }

  mergeConfigs = mergeConfigs;
  log = new Logger();
}

export default new Nico();
