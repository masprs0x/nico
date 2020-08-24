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

nico.init({
  routes: {
    'GET /users': {
      controller: async (ctx) => {
        return (ctx.body = []);
      },
    },
  },
});

nico.start();
```

## Router

### Basic Router

Nico use `routes` config to register routes, the basic usage like:

```js
nico.init({
  routes: {
    'GET /users': {
      // ...
    },
  },
});
```

This will register a route whose path is `/users` and http method is `Get`.

### Nested Router

Nesetd router also supported:

```js
nico.init({
  routes: {
    '/api/v3': {
      '/users': {
        GET: {
          // ...
        },
        POST: {
          // ...
        },
        '/:id': {
          DELETE: {
            // ...
          },
        },
      },
    },
  },
});
```

This config will register three routes

- `GET /api/v3/users`
- `POST /api/v3/users`
- `DELETE /api/v3/users/:id`

## Debug

Use [winston](https://github.com/winstonjs/winston) underhood.

Nico has five log levels: `fatal`, `error`, `warn`, `info`, `debug` and `trace`.

Default console level is `info`, file level is `none`.

### Default Logger Config

```ts
const loggerConfig: ConfigLogger = {
  fileLevel: 'none',
  consoleLevel: 'info',
};
```

### Mutiple File Logger

```ts
const loggerConfig: ConfigLogger = {
  fileLevel: ['trace', 'error'],
};
```

Output directories are `log/trace` and `log/error`.

### Usage Example

```js
ctx.logger.fatal('fatal');
ctx.logger.debug('debug');
```

## Custom Middlewares

Nico use `appMiddlewares` and `routeMiddlewares` to store middleware informations, app middlewares will execute when `nico.init()` is called,
route middlewares will execute when http request come.

The default `appMiddleware` is `['error-handler', 'global-cors', 'responses', 'serve', 'routes']`.

The default `routeMiddleware` is `['debug', 'controller-cors', 'csp', 'xframes', 'policies', 'body-parser', 'validate', 'controller']`.

Change default middlewares:

```js
nico.appMiddlewares = ['error-handler', 'global-cors', 'routes'];
nico.routeMiddlewares = ['controller'];
```

Define custom middlewares:

```js
nico.useCustomAppMiddleware(() => async (ctx, next) => {
  await next();
  ctx.set('custom', 'custom');
});

nico.useCustomRouteMiddleware(
  () => async (ctx, next) => {
    await next();
    ctx.set('custom', 'custom');
  },
  'debug',
);

nico.init();
```

The second argument is middleware name, if it's `debug` that's mean custom middleware will execute after `debug` middleware.
Custom middleware will be added to the middlewares after use middleware function, the name in the middlewares is the name of the function.

The default second argument of `useCustomAppMiddleware` is `global-cors` and `useCustomRouteMiddleware` is `controller-cors`.

If the second argument is `null` or not found in middlewares, the custom middleware will be execute before all middlewares.

## Plugins

- [nico-mongo](https://github.com/blastZ/nico-mongo) (⚠️building) use mongo with nico.
- [nico-redis](https://github.com/blastZ/nico-redis) (⚠️building) use ioredis with nico.
- [nico-build](https://github.com/blastZ/nico-build) (⚠️building) bundle project build on nico.

## License

[MIT](https://github.com/blastZ/nico/blob/master/LICENSE)
