import Koa from 'koa';
import Router from '@koa/router';
import debug from 'debug';

import routes from './middleware/routes';
import errorHandler from './middleware/error-handler';
import responses from './middleware/responses';
import defaultConfig from './config';
import customHandler from './middleware/custom-handler';
import cors from './middleware/cors';
import { deepmerge } from './utils/utility';
import { Config } from '../typings';
import serve from './middleware/serve';

class Nico {
  app = new Koa();
  log = debug('nico');

  init<State, Custom>(inputConfig: Config<State, Custom> = {}) {
    const config = deepmerge(defaultConfig, inputConfig);
    const app = this.app;

    app.use(responses(config.responses));
    app.use(cors(config.security));
    app.use(errorHandler());
    app.use(customHandler(config.custom));

    const serveRouter = new Router();
    app.use(serve(serveRouter, config.serve));

    const router = new Router();
    app.use(routes(router, config.routes, config.routerPrefix));

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
}

export = new Nico();
