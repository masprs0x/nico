import Koa from 'koa';
import koaBody from 'koa-body';
import serve from 'koa-static';
import Joi from '@hapi/joi';

declare namespace Application {
  type ConfigRoutes<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom> = {
    [method_route: string]: {
      controller: Middleware<TState, TCustom>;
      policies?: Middleware<TState, TCustom>[] | boolean;
      bodyParser?: boolean | koaBody.IKoaBodyOptions;
      validate?: {
        params?: Joi.ObjectSchema;
        query?: Joi.ObjectSchema;
        body?: Joi.ObjectSchema;
      };
      cors?: CorsOptions | boolean;
      xframes?: XFrameOptions | true;
      csp?: CSPOptions | true;
    };
  };

  type ConfigCustom = {
    [key: string]: any;
  };

  type CorsOptions = { allRoutes?: boolean } & {
    allowOrigins: string[] | string;
    allowMethods?: string[] | string;
    allowHeaders?: string[] | string;
    allowCredentials?: boolean;
    maxAge?: number;
  };

  type CSPOptions = {
    policy: { [key: string]: string };
    reportOnly?: boolean;
    reportUri?: string;
  };

  type XFrameOptions = 'DENY' | 'SAMEORIGIN';

  type ConfigSecurity = {
    cors?: CorsOptions;
    xframes?: XFrameOptions;
    csp?: CSPOptions;
  };

  type ConfigResponses = {
    [key: string]: (this: Koa.Context, ...args: any) => void;
  };

  interface ConfigServe {
    root?: string;
    opts?: serve.Options;
  }

  type Config<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom> = {
    routes?: ConfigRoutes<TState, TCustom>;
    custom?: ConfigCustom;
    security?: ConfigSecurity;
    serve?: ConfigServe;
    responses?: ConfigResponses;
  };

  type HttpMethod = 'post' | 'get' | 'delete' | 'put' | 'patch';

  interface DefaultState extends Koa.DefaultState {
    query?: any;
    params?: any;
    body?: any;
  }

  interface DefaultCustom extends Koa.DefaultContext {
    ok: (this: Context, data?: any, message?: string, success?: boolean) => void;
    custom: ConfigCustom;
  }

  type Context<State extends DefaultState = DefaultState, Custom extends DefaultCustom = DefaultCustom> = Koa.ParameterizedContext<
    State,
    Custom
  >;
  type Next = Koa.Next;
  type Middleware<State extends DefaultState = DefaultState, Custom extends DefaultCustom = DefaultCustom> = Koa.Middleware<State, Custom>;
}

export = Application;
