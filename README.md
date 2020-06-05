# Nico [![blastZ](https://circleci.com/gh/blastZ/nico.svg?style=svg)](https://circleci.com/gh/blastZ/nico)

**This package is still in development.**

Nico is a backend framework build on koa. It's inspired by [sails](https://github.com/balderdashy/sails). Ultimately nico is an effort to provide a more clear way to build api services.

## Installation

```bash
npm install @blastz/nico
```

## Hello Nico

```js
import Nico from '@blastz/nico';
import Joi from '@hapi/joi';

const nico = new Nico({
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

### nico.start(port, messageOrListener)

Start server on port, default is 1314. Custom callback listener is supported.

## Plugins

- [nico-mongo](https://github.com/blastZ/nico-mongo) (⚠️building) use mongo with nico.
- [nico-redis](https://github.com/blastZ/nico-redis) (⚠️building) use ioredis with nico.
- [nico-build](https://github.com/blastZ/nico-build) (⚠️building) bundle project build on nico.

## License

[MIT](https://github.com/blastZ/nico/blob/master/LICENSE)
