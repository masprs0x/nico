# Nico [![blastZ](https://circleci.com/gh/blastZ/nico.svg?style=svg)](https://circleci.com/gh/blastZ/nico)

[![NPM version][npm-image]][npm-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@blastz/nico.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@blastz/nico
[david-image]: https://img.shields.io/david/blastZ/nico.svg?style=flat-square
[david-url]: https://david-dm.org/blastZ/nico
[node-image]: https://img.shields.io/badge/node.js-%3E=_8-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/@blastz/nico.svg?style=flat-square
[download-url]: https://npmjs.org/package/@blastz/nico

**This package is still in development.**

Nico is a modern backend framework build on [koa](https://github.com/koajs/koa), it's inspired by [sails](https://github.com/balderdashy/sails). Ultimately nico is an effort to provide a more clear way to build api services.

## Installation

```bash
npm install @blastz/nico
```

## Hello Nico

```js
import nico from '@blastz/nico';
// const nico = require('@blastz/nico').default

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

## Body Parser

By default, body parser only works when request method is `POST`, `PUT` or `PATCH`, change it by `parsedMethods` config.

You need to manually enable body parser on specific route, otherwise it won't work.

```js
nico.init({
  routes: {
    '/api/v3': {
      '/users': {
        POST: {
          bodyParser: true,
          // ...
        },
      },
    },
  },
});
```

By default It will only parse `json` and `form` types.

### Multipart

To support multipart form data, you need to enable it.

```js
nico.init({
  //...
  POST: {
    bodyParser: {
      multipartOpts: {
        enable: true,
      },
    },
    // ...
  },
  //...
});
```

### XML And Text

Same as multipart, you need to enable them by `xmlOpts` and `textOpts` configs.

### More options

Check more options in config types.

## Responses

Use responses to change response format.

```js
nico.init({
  routes: {
    'GET /users': {
      controller: (ctx) => {
        return ctx.ok([]); // { data: [], message: 'execute success', success: true }
      },
    },
  },
  responses: {
    ok: function ok(data, message = 'execute success', success = true) {
      this.status = 200;
      this.body = {
        success,
        data,
        message,
      };
    },
  },
});
```

## Validate

Nico support validate `params`, `query`, `body` and `files`, It's recommend to use it with [Joi](https://github.com/sideway/joi).

```js
nico.init({
  routes: {
    'POST /users': {
      controller: (ctx) => {
        ctx.logger.info(ctx.state.body.name); // validated value will be mounted at ctx.state
      },
      bodyParser: true, // enable body parser middleware
      validate: {
        body: Joi.object({
          username: Joi.string().trim().required().min(1).max(50),
        }),
      },
    },
  },
});
```

Nico will throw validate error by default, the error will be cached by global error handler.
You can add `onError`, `onBodyParserError`, `onValidateError` in `responses` config to change default behavior.

```js
nico.init({
  responses: {
    onError: function onError(err) {
      this.status = 200;
      return (this.body = {
        message: err.message,
        success: false,
      });
    }, // change global error handle
    onBodyParserError: function onBodyParserError(err) {
      this.status = 200;
      return (this.body = {
        message: err.message,
        success: false,
      });
    }, // change body parser error handle
    onValidateError: function onValidateError(err) {
      this.status = 200;
      return (this.body = {
        message: err.message,
        success: false,
      });
    }, // change validate error handle
  },
});
```

## Static File Serve

Serve `/assets` directory like this:

```ts
nico.init({
  serve: {
    root: path.resolve(process.cwd(), './assets'),
  },
});
```

### Change Route Path

```ts
nico.init({
  serve: {
    root: path.resolve(process.cwd(), './assets'),
    route: '/static',
  },
});
```

Get `/assets/avatar.png` by route `{{serverUrl}}/static/avatar.png`.

### Serve Multiple Directories

Serve multiple directories also supported.

```ts
nico.init({
  serve: [
    {
      root: path.resolve(process.cwd(), './assets'),
      route: '/assets',
    },
    {
      root: path.resolve(process.cwd(), './static'),
      route: '/static',
    },
  ],
});
```

### More Options

Serve configs support [koa-static](https://github.com/koajs/static) options.

```ts
nico.init({
  serve: {
    opts, // from koa-static
  },
});
```

## Debug

nico has five log levels: `fatal`, `error`, `warn`, `info`, `debug` and `trace`.

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

Default Output directories are `log/trace` and `log/error`.

### Usage Example

```js
ctx.logger.fatal('fatal');
ctx.logger.debug('debug');
```

## Custom Middlewares

Nico use `appMiddlewares` and `routeMiddlewares` to store middleware informations, app middlewares will execute when `nico.init()` is called,
route middlewares will execute when http request come.

The default `appMiddleware` is `['error-handler', 'not-found-handler', 'global-cors', 'responses', 'serve', 'routes']`.

The default `routeMiddleware` is `['debug', 'controller-cors', 'csp', 'xframes', 'policies', 'body-parser', 'validate', 'controller']`.

Change default middlewares:

```js
nico.appMiddlewares = [
  InnerAppMiddleware.ERROR_HANDLER,
  InnerAppMiddleware.GLOBAL_CORS,
  InnerAppMiddleware.ROUTES,
];
nico.routeMiddlewares = [InnerRouteMiddleware.CONTROLLER];
```

Define custom middlewares:

```js
nico.useAppMiddleware(async (ctx, next) => {
  await next();
  ctx.set('custom', 'custom');
});

nico.useRouteMiddleware(async (ctx, next) => {
  await next();
  ctx.set('custom', 'custom');
}, InnerRouteMiddleware.DEBUG);

nico.init();
```

The second argument is the middleware name, above example shows custom middleware will execute after `debug` middleware.
Custom middleware will be added to the middlewares after use middleware function, the name in the middlewares is the name of the function.

The default second argument of `useAppMiddleware` is `global-cors` and `useRouteMiddleware` is `controller-cors`.

If the second argument is `null` or not found in middlewares, the custom middleware will be execute before all middlewares.

## Graceful Shutdown

Nico will handle `SIGINT` and `SIGTERM` by default, you can add custom signal handler like this:

```js
nico.useSignalHandler('SIGINT', () => {
  closeDB();
});
```

Nico will automatically await all requests end and close the server, you only need to add some side effects.

The process will force exit after 10 seconds, you can change it in `nico.config.advancedConfigs.forceExitTime`.

## Cluster Mode

Nico support cluster mode internal, use `nico.startCluster(port: number, instances?: number)` to start nico with cluster mode.
The default instances will be cpu numbers.

## Plugins

- [nico-build](https://github.com/blastZ/nico-build) bundle project build on nico.
- [nico-mongo](https://github.com/blastZ/nico-mongo) (⚠️building) use mongo with nico.
- [nico-redis](https://github.com/blastZ/nico-redis) (⚠️building) use ioredis with nico.

## License

[MIT](https://github.com/blastZ/nico/blob/master/LICENSE)
