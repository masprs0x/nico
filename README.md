# Nico [![blastZ](https://circleci.com/gh/blastZ/nico.svg?style=svg)](https://circleci.com/gh/blastZ/nico)

**This package is still in development.**

Nico is a backend framework build on koa. It's inspired by [sails](https://github.com/balderdashy/sails). Ultimately nico is an effort to provide a more clear way to build api services.

## Installation

```bash
npm install @blastz/nico
```

## Hello Nico

```js
const Nico = require('@blastz/nico');

const nico = new Nico({
  routes: {
    'GET /users': {
      controller: async (ctx) => {
        ctx.ok({
          users: []
        });
      }
    }
  }
});

nico.start();
```

```bash
$ curl "http://localhost:1314/users"
# {"success":true,"data":{"users":[]},"message":"execute success"}
```

## Getting started

- [node-services-boilerplate](https://github.com/blastZ/node-services-boilerplate) - An restful api services boilerplate build on nico.

## API

### new Nico(inputConfig)

Get nico application, `inputConfig` is extended from deafult config:

```ts
type Config<TState, TCustom> = {
  routes?: {
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

### nico.start(port, messageOrListener)

Start server on port, default is 1314. Custom callback listener is supported.

### Nico.mergeConfigs(configs)

Merge multiple configs.

### Nico.log(extend, message)

Use `debug('nico').extend(extend)(message)` to log messages.

## Utility

check utility in [nico-utility](https://github.com/blastZ/nico-utility).
