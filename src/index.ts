import Koa from 'koa';
import Router from '@koa/router';

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

  async init<State, Custom>(inputConfig: Config<State, Custom> = {}) {
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
}

export = new Nico();
