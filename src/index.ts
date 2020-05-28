import Koa from 'koa';
import Router from '@koa/router';
import debug from 'debug';

import routes from './middleware/routes';
import errorHandler from './middleware/error-handler';
import responses from './middleware/responses';
import defaultConfig from './config';
import custom from './middleware/custom';
import { deepmerge } from './utils/utility';
import serve from './middleware/serve';
import cors from './middleware/cors';

import { Config, DefaultState, DefaultCustom } from '../typings';

class Nico<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom> {
  app: Koa<TState, TCustom>;

  constructor(inputConfig: Config<TState, TCustom> | Config<TState, TCustom>[]) {
    let config: Config<TState, TCustom>;
    if (Array.isArray(inputConfig)) {
      config = deepmerge(defaultConfig, Nico.mergeConfigs<TState, TCustom, Config<TState, TCustom>>(inputConfig));
    } else {
      config = deepmerge(defaultConfig, inputConfig);
    }

    this.app = new Koa<TState, TCustom>();

    this.app.use(errorHandler());
    this.app.use(cors(config.security?.cors));
    this.app.use(custom(config.custom));
    this.app.use(responses(config.responses));

    const serveRouter = new Router();
    this.app.use(serve(serveRouter, config.serve));

    const router = new Router();
    this.app.use(routes<TState, TCustom>(router, config));

    this.app.use(serveRouter.routes()).use(serveRouter.allowedMethods());
    this.app.use(router.routes()).use(router.allowedMethods());
  }

  start(port = 1314, messageOrListener?: string | (() => void)) {
    let listener = () => {
      if (typeof messageOrListener === 'string') {
        Nico.log('start', messageOrListener);
      } else {
        Nico.log('start', 'app is on ' + port);
      }
    };

    if (typeof messageOrListener === 'function') {
      listener = messageOrListener;
    }

    this.app.listen(port, listener);
  }

  static mergeConfigs<
    TState extends DefaultState = DefaultState,
    TCustom extends DefaultCustom = DefaultCustom,
    TConfig extends Config<TState, TCustom> = Config
  >(configs: TConfig[]) {
    if (!Array.isArray(configs)) return configs;

    const config = configs.reduce((result, current, index) => {
      if (index == 0) return current;
      return deepmerge(result, current);
    }, configs[0]);

    return config;
  }

  static log(extend: string, message: string) {
    const log = debug('nico').extend(extend);
    log(message);
  }
}

export default Nico;
