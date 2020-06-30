import Koa from 'koa';
import koaBody from 'koa-body';
import serve from 'koa-static';
import Joi from '@hapi/joi';
import Router from '@koa/router';

export type Validator = (data: any) => { [key: string]: any };

export type ConfigRoutes<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom> = {
  [method_route: string]: {
    controller: Middleware<TState, TCustom>;
    policies?: Middleware<TState, TCustom>[] | boolean;
    bodyParser?: boolean | koaBody.IKoaBodyOptions;
    validate?: {
      params?: Joi.ObjectSchema | Validator;
      query?: Joi.ObjectSchema | Validator;
      body?: Joi.ObjectSchema | Validator;
    };
    cors?: CorsOptions | boolean;
    xframes?: XFrameOptions | true;
    csp?: CSPOptions | true;
  };
};

export type ConfigCustom = {
  [key: string]: any;
};

export type CorsOptions = { allRoutes?: boolean } & {
  allowOrigins: string[] | string;
  allowMethods?: string[] | string;
  allowHeaders?: string[] | string;
  exposeHeaders?: string[] | string;
  allowCredentials?: boolean;
  maxAge?: number;
};

export type CSPOptions = {
  policy: { [key: string]: string };
  reportOnly?: boolean;
  reportUri?: string;
};

export type XFrameOptions = 'DENY' | 'SAMEORIGIN';

export type ConfigSecurity = {
  cors?: CorsOptions;
  xframes?: XFrameOptions;
  csp?: CSPOptions;
};

export type ConfigResponses = {
  [key: string]: (this: Koa.Context, ...args: any) => void;
};

export interface ConfigServe {
  root?: string;
  opts?: serve.Options;
}

export type Config<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom> = {
  routes?: ConfigRoutes<TState, TCustom>;
  custom?: ConfigCustom;
  security?: ConfigSecurity;
  serve?: ConfigServe;
  responses?: ConfigResponses;
  advancedConfigs?: {
    routerOptions?: Router.RouterOptions;
  };
};

export type HttpMethod = 'post' | 'get' | 'delete' | 'put' | 'patch';

export interface DefaultState extends Koa.DefaultState {
  query?: any;
  params?: any;
  body?: any;
}

export interface DefaultCustom extends Koa.DefaultContext {
  ok: (this: Context, data?: any, message?: string, success?: boolean) => void;
  custom: ConfigCustom;
}

export type Context<State extends DefaultState = DefaultState, Custom extends DefaultCustom = DefaultCustom> = Koa.ParameterizedContext<
  State,
  Custom
>;
export type Next = Koa.Next;
export type Middleware<State extends DefaultState = DefaultState, Custom extends DefaultCustom = DefaultCustom> = Koa.Middleware<
  State,
  Custom
>;
