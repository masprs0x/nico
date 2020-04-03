import Koa from 'koa';
import Router from '@koa/router';
import serve from 'koa-static';
import path from 'path';
import Joi from '@hapi/joi';

import routes from './middleware/routes';
import errorHandler from './middleware/error-handler';
import responses from './middleware/responses';
import defaultConfig from './config';
import customHandler from './middleware/custom-handler';
import cors from './middleware/cors';
import { mergeDeep } from './utils/utility';
import Application from '../typings';
import { DB } from './utils/db';

class Nico {
  Joi: Joi.Root = Joi;

  db?: DB;
  app?: Application;

  async init(inputConfig: Partial<Application.Config> = {}) {
    const config: Application.Config = mergeDeep(defaultConfig, inputConfig);

    const app = new Koa() as Application;

    app.use(responses(config.responses));
    app.use(errorHandler());
    app.use(cors(config));
    app.use(serve(path.resolve(process.cwd(), './assets'), config.serve));
    app.use(customHandler(config));

    this.db = new DB(config.datastores);

    const router = new Router<Application.State, Application.Custom>();

    app.use(routes(router, config));
    app.use(router.routes()).use(router.allowedMethods());

    this.app = app;

    return app;
  }
}

export = new Nico();
