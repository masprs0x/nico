import Koa from 'koa';
import Router from '@koa/router';
import debug from 'debug';

import routes from './middleware/routes';
import errorHandler from './middleware/error-handler';
import responses from './middleware/responses';
import defaultConfig from './config';
import custom from './middleware/custom';
import { deepmerge } from './utils/utility';
import { Config, DefaultState, DefaultCustom } from '../typings';
import serve from './middleware/serve';
import cors from './middleware/cors';

class Nico {
  app = new Koa();
  log = debug('nico');

  init<State = DefaultState, Custom = DefaultCustom>(inputConfig: Config<State, Custom> | Config<State, Custom>[]) {
    let config: Config<State, Custom>;
    if (Array.isArray(inputConfig)) {
      config = deepmerge(defaultConfig, this.mergeConfigs<State, Custom>(inputConfig));
    } else {
      config = deepmerge(defaultConfig, inputConfig);
    }

    //const config = deepmerge(defaultConfig, inputConfig);
    const app = this.app;

    app.use(errorHandler());
    app.use(cors(config.security?.cors));
    app.use(custom(config.custom));
    app.use(responses(config.responses));

    const serveRouter = new Router();
    app.use(serve(serveRouter, config.serve));

    const router = new Router();
    app.use(routes(router, config));

    app.use(serveRouter.routes()).use(serveRouter.allowedMethods());
    app.use(router.routes()).use(router.allowedMethods());

    return app;
  }

  start(port = 1314, messageOrListener?: string | (() => void)) {
    let listener = () => {
      const log = this.log.extend('start');
      if (typeof messageOrListener === 'string') {
        log(messageOrListener);
      } else {
        log('app is on ' + port);
      }
    };

    if (typeof messageOrListener === 'function') {
      listener = messageOrListener;
    }

    this.app.listen(port, listener);
  }

  mergeConfigs<State = DefaultState, Custom = DefaultCustom>(configs: Config<State, Custom>[]) {
    if (!Array.isArray(configs)) return configs;

    const config = configs.reduce((result, current, index) => {
      if (index == 0) return current;
      return deepmerge(result, current);
    }, configs[0]);

    return config;
  }
}

export default new Nico();
