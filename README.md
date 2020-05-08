# Nico

**This package is still in development, don't use in production enviroment.**

Wrap up koa for better usage, learn how to use it in [node-services-boilerplate](https://github.com/blastZ/node-services-boilerplate);

## Installation

```bash
npm install @blastz/nico
```

## API

### Nico.init(inputConfig: Config): Koa

Get koa application.

Application.Config

```ts
type Config = {
  routes?: {
    [method_route: string]: {
      controller: Koa.Middleware<State, Custom>;
      policies?: Koa.Middleware<State, Custom>[] | boolean;
      bodyParser?: boolean | koaBody.IKoaBodyOptions;
      validate?: {
        params?: Joi.ObjectSchema;
        query?: Joi.ObjectSchema;
        body?: Joi.ObjectSchema;
      };
      cors?: CorsOptions | true;
      xframes?: XFrameOptions | true;
      csp?: CSPOptions | true;
    };
  };
  custom?: {
    [key: string]: any;
  };
  security?: {
    cors?: {
      allowOrigins: string[] | string;
      allRoutes?: boolean;
      allowMethods?: string[] | string;
      allowHeaders?: string[] | string;
      allowCredentials?: boolean;
    };
    xframes?: XFrameOptions;
    csp?: CSPOptions;
  };
  serve?: {
    root?: string;
    opts?: serve.Options;
  };
  responses?: {
    [key: string]: (this: Koa.Context, ...args: any) => void;
  };
};
```

### Nico.start(port?: number, messageOrListener?: string | (() => void)): void

Start koa server

## Utility

check utility in [nico-utility](https://github.com/blastZ/nico-utility).
