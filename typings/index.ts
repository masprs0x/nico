import Koa from 'koa';
import koaBody from 'koa-body';
import serve from 'koa-static';
import Joi from '@hapi/joi';
import Router from '@koa/router';

import { Logger } from '../src/utils/logger';

export type Validator = (data: any) => { [key: string]: any };

export type ConfigRoute<TState = DefaultState, TCustom = DefaultCustom> = {
  controller: Middleware<TState, TCustom> | Middleware<TState, TCustom>[];
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

export type ConfigRoutes<TState = DefaultState, TCustom = DefaultCustom> = {
  [routeOrPrefix: string]: ConfigRoute<TState, TCustom> | ConfigRoutes<TState, TCustom>;
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

export type Response<TState = Koa.DefaultState, TCustom = Koa.DefaultContext> = (
  this: ParameterizedContext<TState, TCustom>,
  ...args: any
) => void;

export type ConfigResponses<TState = Koa.DefaultState, TCustom = Koa.DefaultContext> = {
  [key: string]: Response<TState, TCustom>;
};

export interface ConfigServe {
  root?: string;
  opts?: serve.Options;
}

export type Config<TState = DefaultState, TCustom = DefaultCustom> = {
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
  custom: ConfigCustom;
  logger: Logger;
}

export type ParameterizedContext<TState = Koa.DefaultState, TCustom = Koa.DefaultContext> = Koa.ParameterizedContext<TState, TCustom>;
export type Context<State = DefaultState, Custom = DefaultCustom> = Koa.ParameterizedContext<State, Custom>;
export type Next = Koa.Next;
export type Middleware<State = DefaultState, Custom = DefaultCustom> = Koa.Middleware<State, Custom>;
