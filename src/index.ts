import Koa from 'koa';
import Router from '@koa/router';
import serve from 'koa-static';
import path from 'path';

import routes from './middleware/routes';
import errorHandler from './middleware/error-handler';
import responses from './middleware/responses';
import defaultConfig from './config';
import customHandler from './middleware/custom-handler';
import cors from './middleware/cors';
import { deepmerge } from './utils/utility';
import { Config } from '../typings';

class Nico {
  app = new Koa();

  async init<State, Custom>(inputConfig: Partial<Config<State, Custom>> = {}) {
    const config: Config<State, Custom> = deepmerge(defaultConfig, inputConfig);
    const app = this.app;

    app.use(responses(config.responses));
    app.use(errorHandler());
    app.use(cors(config.security));
    app.use(serve(path.resolve(process.cwd(), './assets'), config.serve));
    app.use(customHandler(config.custom));

    const router = new Router();

    app.use(routes(router, config.routes, config.routerPrefix));
    app.use(router.routes()).use(router.allowedMethods());

    return app;
  }
}

export = new Nico();
