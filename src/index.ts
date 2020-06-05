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
import { log } from './utils/debug';

import { Config, DefaultState, DefaultCustom } from '../typings';

class Nico<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom> extends Koa {
  config: Config<TState, TCustom>;

  constructor(...inputConfigs: Config<TState, TCustom>[]) {
    super();

    const config = mergeConfigs<TState, TCustom>(defaultConfig, ...inputConfigs);
    this.config = config;

    this.use(errorHandler());
    this.use(cors(config.security?.cors));
    this.use(custom(config.custom));
    this.use(responses(config.responses));

    const serveRouter = new Router();
    this.use(serve(serveRouter, config.serve));

    this.emit('routerWillMount');
    const router = new Router(config.advancedConfigs?.routerOptions);
    this.use(routes<TState, TCustom>(router, config));

    this.use(serveRouter.routes()).use(serveRouter.allowedMethods());
    this.use(router.routes()).use(router.allowedMethods());
  }

  start(port = 1314, messageOrListener?: string | (() => void)) {
    let listener = () => {
      if (typeof messageOrListener === 'string') {
        log('app')(messageOrListener);
      } else {
        log('app')('app is on ' + port);
      }
    };

    if (typeof messageOrListener === 'function') {
      listener = messageOrListener;
    }

    this.listen(port, listener);
  }
}

export default Nico;

export const utility = {
  mergeConfigs
};
