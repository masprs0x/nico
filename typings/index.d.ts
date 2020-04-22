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
      cors?: CorsOptions;
      xframes?: XFrameOptions | true;
      csp?: CSPOptions | true;
    };
  };

  type ConfigCustom = {
    [key: string]: any;
  };

  type CorsOptions = {
    allowOrigins: string[] | string;
    allowMethods?: string[] | string;
    allowHeaders?: string[] | string;
    allowCredentials?: boolean;
  };

  type CSPOptions = {
    policy: { [key: string]: string };
    reportOnly?: boolean;
    reportUri?: string;
  };

  type XFrameOptions = 'DENY' | 'SAMEORIGIN';

  type ConfigSecurity = {
    cors?: { allRoutes?: boolean } & CorsOptions;
    xframes?: XFrameOptions;
    csp?: CSPOptions;
  };

  type ConfigResponses = {
    [key: string]: (this: Koa.Context, ...args: any) => void;
  };

  type ConfigView = {
    autoRender: boolean;
    map: {
      [extname: string]: 'ejs' | 'pug' | 'react' | 'nunjucks';
    };
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
    views?: ConfigView;
  };

  type HttpMethod = 'post' | 'get' | 'delete' | 'put' | 'patch';

  interface DefaultState extends Koa.DefaultState {
    query?: any;
    params?: any;
    body?: any;
  }

  interface DefaultCustom extends Koa.DefaultContext {
    ok: (this: Context, data?: any, message?: string, success?: boolean) => void;
    render?: (filePath: string) => void;
  }

  type Context<State extends DefaultState = DefaultState, Custom extends DefaultCustom = DefaultCustom> = Koa.ParameterizedContext<
    State,
    Custom
  >;
  type Next = Koa.Next;
  type Middleware<State extends DefaultState = DefaultState, Custom extends DefaultCustom = DefaultCustom> = Koa.Middleware<State, Custom>;
}

export = Application;
