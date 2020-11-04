import Koa from 'koa';
import koaBody from 'koa-body';
import serve from 'koa-static';
import Joi from '@hapi/joi';
import Router from '@koa/router';
import { Logger as WinstonLogger, LeveledLogMethod } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Files } from 'formidable';

export * from './constant';

export interface Logger extends WinstonLogger {
  fatal: LeveledLogMethod;
  trace: LeveledLogMethod;
  child(options: Object): Logger;
}

export type Validator = (data: any) => { [key: string]: any };

type FilesValidator = Joi.Schema | Validator;

export type ConfigRoute<TState = DefaultState, TCustom = DefaultCustom> = {
  controller: Middleware<TState, TCustom> | Middleware<TState, TCustom>[];
  policies?: Middleware<TState, TCustom>[] | boolean;
  bodyParser?: boolean | koaBody.IKoaBodyOptions;
  validate?: {
    params?: Joi.ObjectSchema | Validator;
    query?: Joi.ObjectSchema | Validator;
    body?: Joi.ObjectSchema | Validator;
    files?: {
      [key: string]: {
        size?: FilesValidator;
        name?: FilesValidator;
        basename?: FilesValidator;
        extname?: FilesValidator;
        type?: FilesValidator;
      } & {
        [key: string]: FilesValidator;
      };
    };
  };
  timeout?: number;
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

export type Response = (this: Context, ...args: any) => void;

export type ConfigResponses = {
  [key: string]: Response;
};

export type Helper = (this: NicoContext<DefaultState, any>, ...args: any) => any;

export type ConfigHelpers = {
  [key: string]: Helper;
};

export interface ConfigServe {
  root?: string;
  route?: string;
  opts?: serve.Options;
}

export type LoggerLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type FileLevel = LoggerLevel | DailyRotateFile.DailyRotateFileTransportOptions;

export interface ConfigLogger {
  fileLevel?: FileLevel | FileLevel[] | 'none';
  consoleLevel?: LoggerLevel | 'none';
}

export type GetMiddlewareFunc = (...args: any) => Middleware;

export type CustomMiddlewares = {
  [key: string]: GetMiddlewareFunc;
};

export type InputConfig<TState = DefaultState, TCustom = DefaultCustom> = {
  routes?: ConfigRoutes<TState, TCustom>;
  custom?: ConfigCustom;
  security?: ConfigSecurity;
  serve?: ConfigServe;
  responses?: ConfigResponses;
  helpers?: ConfigHelpers;
  advancedConfigs?: {
    routerOptions?: Router.RouterOptions;
    forceExitTime?: number;
  };
  logger?: ConfigLogger;
};

export type Config<TState = DefaultState, TCustom = DefaultCustom> = Required<
  InputConfig<TState, TCustom>
>;

export type HttpMethod = 'post' | 'get' | 'delete' | 'put' | 'patch';

export interface DefaultState extends Koa.DefaultState {
  query?: any;
  params?: any;
  body?: any;
  files?: Files;
  requestStartTime?: [number, number];
}

export type DefaultHelper = {
  getExecuteTime: () => number;
};

export interface DefaultCustom extends Koa.DefaultContext {
  config: Config;
  logger: Logger;
  helper: {
    [key: string]: Helper;
  } & DefaultHelper;
}

export type Context<
  TState = Koa.DefaultState,
  TCustom = Koa.DefaultContext
> = Koa.ParameterizedContext<TState, TCustom>;

export type Next = Koa.Next;

export type Middleware<TState = Koa.DefaultState, TCustom = Koa.DefaultContext> = Koa.Middleware<
  TState,
  TCustom
>;

export type NicoContext<TState = DefaultState, TCustom = DefaultCustom> = Koa.ParameterizedContext<
  TState,
  TCustom
>;

export type NicoNext = Next;

export type NicoMiddleware<TState = DefaultState, TCustom = DefaultCustom> = Koa.Middleware<
  TState,
  TCustom
>;
