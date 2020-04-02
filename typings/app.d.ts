import Koa from 'koa';
import koaBody from 'koa-body';
import serve from 'koa-static';
import Joi from '@hapi/joi';

import { DB } from '../src/utils/db';
import Redis from 'ioredis';

declare class Application extends Koa {
  db: DB;
}

declare namespace Application {
  type ConfigDatastores = {
    default?: {
      url?: string;
    };
    cache?: {
      url: string;
    };
  };

  type ConfigRoutes = {
    [method_route: string]: {
      controller: Koa.Middleware<State, Custom>;
      policies?: Koa.Middleware<State, Custom>[] | boolean;
      bodyParser?: boolean | koaBody.IKoaBodyOptions;
      validate?: {
        params?: Joi.ObjectSchema;
        query?: Joi.ObjectSchema;
        body?: Joi.ObjectSchema;
      };
    };
  };

  type ConfigCustom = {
    APP_NAME: string;
  };

  type ConfigSecurity = {
    cors: {
      allowOrigins: string[];
      allowCredentials?: boolean;
    };
  };

  type ConfigResponses = {
    [key: string]: Koa.Middleware;
  };

  type Config = {
    datastores: ConfigDatastores;
    routes: ConfigRoutes;
    custom: ConfigCustom;
    security: ConfigSecurity;
    serve: serve.Options;
    responses: ConfigResponses;
  };

  type HttpMethod = 'post' | 'get' | 'delete' | 'put' | 'patch';

  interface State extends Koa.DefaultState {
    custom: ConfigCustom;
    query?: object;
    params?: object;
    body?: object;
  }

  interface Custom extends Koa.DefaultContext {
    redis?: Redis.Redis;
  }

  interface Context extends Koa.ParameterizedContext<State, Custom> {}

  interface Next extends Koa.Next {}
}

export = Application;
