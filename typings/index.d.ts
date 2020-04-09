import Koa from 'koa';
import koaBody from 'koa-body';
import serve from 'koa-static';
import Joi from '@hapi/joi';

declare namespace Application {
  type ConfigRoutes<State, Custom> = {
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
    [key: string]: any;
  };

  type ConfigSecurity = {
    cors: {
      allowOrigins: string[];
      allowCredentials?: boolean;
    };
  };

  type ConfigResponses = {
    [key: string]: (this: Koa.Context, ...args: any) => void;
  };

  interface ConfigServe {
    root?: string;
    opts?: serve.Options;
  }

  type Config<State, Custom> = {
    routes?: ConfigRoutes<State, Custom>;
    custom?: ConfigCustom;
    security?: ConfigSecurity;
    serve?: ConfigServe;
    responses?: ConfigResponses;
    routerPrefix?: string;
  };

  type HttpMethod = 'post' | 'get' | 'delete' | 'put' | 'patch';

  interface DefaultState extends Koa.DefaultState {
    query?: any;
    params?: any;
    body?: any;
  }

  interface DefaultCustom extends Koa.DefaultContext {
    ok: (this: Context, data?: any, message?: string, success?: boolean) => void;
  }

  type Context<State extends DefaultState = DefaultState, Custom extends DefaultCustom = DefaultCustom> = Koa.ParameterizedContext<
    State,
    Custom
  >;
  type Next = Koa.Next;
  type Middleware<State extends DefaultState = DefaultState, Custom extends DefaultCustom = DefaultCustom> = Koa.Middleware<State, Custom>;
}

export = Application;
