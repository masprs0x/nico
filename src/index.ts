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
import { mergeDeep } from './utils/utility';
import Application from '../typings/app';
import db from './middleware/db';

export = (inputConfig: Partial<Application.Config> = {}) => {
  const config: Application.Config = mergeDeep(defaultConfig, inputConfig);

  const app = new Koa() as Application;

  app.use(responses(config.responses));
  app.use(errorHandler());
  app.use(cors(config));
  app.use(serve(path.resolve(process.cwd(), './assets'), config.serve));
  app.use(customHandler(config));
  app.use(db(app, config.datastores));

  const router = new Router<Application.State, Application.Custom>();

  app.use(routes(router, config));
  app.use(router.routes()).use(router.allowedMethods());

  return app;
};
