# Nico [![blastZ](https://circleci.com/gh/blastZ/nico.svg?style=svg)](https://circleci.com/gh/blastZ/nico)

**This package is still in development.**

Nico is a modern backend framework build on [koa](https://github.com/koajs/koa), it's inspired by [sails](https://github.com/balderdashy/sails). Ultimately nico is an effort to provide a more clear way to build api services.

## Installation

```bash
npm install @blastz/nico
```

## Hello Nico

```js
import nico from '@blastz/nico';
import Joi from '@hapi/joi';

nico.init({
  routes: {
    'POST /users': {
      controller: async (ctx) => {
        const user = await createUser({ name: ctx.state.body.name });
        return ctx.ok(user);
      },
      bodyParser: true,
      validate: {
        body: Joi.object({
          name: Joi.string().required().trim().min(1).max(16)
        })
      }
    }
  },
  responses: {
    ok: function ok(data) {
      this.body = {
        data
      };
    }
  }
});

nico.start();
```

## Getting started

- [node-services-boilerplate](https://github.com/blastZ/node-services-boilerplate) (❌outdated) - An restful api services boilerplate build on nico.

## API

### nico.init(...inputConfigs: Config<TState, TCustom>[])

Get nico application, `inputConfig` is extended from deafult config:

```ts
type Config<TState, TCustom> = {
  routes?: {
    [method_route: string]: {
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
  logger?: {
    fileLevel?: LoggerLevel | 'none';
    consoleLevel?: LoggerLevel | 'none';
  };
  middlewares?: {
    [key: string]: (...args: any) => Middleware<any, any>;
  };
  advancedConfigs?: {
    routerOptions?: Router.RouterOptions;
  };
};
```

### nico.start(port = 1314, messageOrListener?: string | (() => void))

Start server on port, default is 1314. Custom callback listener is supported.

### nico.mergeConfigs(...configs: Config<TState, TCustom>[])

Merge mutiple nico configs

## Debug

Use [winston](https://github.com/winstonjs/winston) underhood.

Nico has five log levels: `fatal`, `error`, `warn`, `info` and `debug`.

```js
ctx.logger.debug('I am a debug log.');
```

## Custom Middleware

Nico use `appMiddlewares` and `routeMiddlewares` to store middleware informations, app middlewares will execute when `nico.init()` is called,
route middlewares will execute when http request come.

The default `appMiddleware` is `['error-handler', 'global-cors', 'responses', 'serve', 'routes']`.

Use custom middlewares:

```js
nico.appMiddlewares = ['error-handler', 'custom', 'custom2', 'global-cors', 'responses', 'serve', 'routes'];
// or
nico.useCustomAppMiddleware('custom', 'error-handler');
nico.useCustomAppMiddleware('custom2', 'custom');
```

Define custom middlewares:

```js
// define when create nico
const nico = new Nico({
  //...
  middlewares: {
    custom: () => async (ctx, next) => {
      // do something
      await next();
      // do something
    }
  }
});

// or define when init nico
nico.init({
  //...
  middlewares: {
    custom2: () => async (ctx, next) => {
      // do something
      await next();
      // do something
    }
  }
});
```

## Plugins

- [nico-mongo](https://github.com/blastZ/nico-mongo) (⚠️building) use mongo with nico.
- [nico-redis](https://github.com/blastZ/nico-redis) (⚠️building) use ioredis with nico.
- [nico-build](https://github.com/blastZ/nico-build) (⚠️building) bundle project build on nico.

## License

[MIT](https://github.com/blastZ/nico/blob/master/LICENSE)
