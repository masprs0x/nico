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
    },
    'GET /users': {
      controller: async (ctx) => {
        const users = await getUsers();
        return ctx.ok(users);
      }
    },
    'PATCH /users/:id': {
      controller: async (ctx) => {
        const updated = await updateUserAge(ctx.state.params.id, ctx.state.body.age);
        return ctx.ok(updated);
      },
      bodyParser: true,
      validate: {
        params: Joi.object({ id: Joi.number().required().min(1) }),
        body: Joi.object({ age: Joi.number().min(1).max(150) })
      }
    },
    'DELETE /users/:id': {
      controller: async (ctx) => {
        await deleteUser(ctx.state.params.id);
        return ctx.ok();
      },
      validate: {
        params: Joi.object({ id: Joi.number().required().min(1) })
      }
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

Use [debug](https://github.com/visionmedia/debug) in inner function.

```js
import { log } from '@blastz/nico';

log.silly('I am a silly log.');
log.trace('I am a trace log with a stack trace.');
log.debug('I am a debug log.');
log.info('I am an info log.');
log.warn('I am a warn log with a json object: %o', { foo: 'bar' });
log.error('I am an error log.');
log.fatal('I am a fatal log.');
```

## Events

### beforeServe

Emit before serve router mount.

```js
nico.on('beforeServe', (router) => {
  // ...
});
```

### beforeRouter

Emit before api router mount.

```js
nico.on('beforeRouter', (router) => {
  // ...
});
```

## Plugins

- [nico-mongo](https://github.com/blastZ/nico-mongo) (⚠️building) use mongo with nico.
- [nico-redis](https://github.com/blastZ/nico-redis) (⚠️building) use ioredis with nico.
- [nico-build](https://github.com/blastZ/nico-build) (⚠️building) bundle project build on nico.

## License

[MIT](https://github.com/blastZ/nico/blob/master/LICENSE)
