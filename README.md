# Nico

**This module is sill in building, everyting maybe change**.

Wrap up koa for better usage, learn how to use it in [node-services-boilerplate](https://github.com/blastZ/node-services-boilerplate);

## Installation

```bash
npm install @blastz/nico
```

## API

### init<State, Custom>(inputConfig: Partial<Config<State, Custom>> = {})

Get koa application by init nico.

Application.Config

```ts
type Config = {
  routes: {
    [method_route: string]: {
      controller: Koa.Middleware<State, Custom>;
      policies?: Koa.Middleware<State, Custom>[] | boolean;
      bodyParser?: boolean | koaBody.IKoaBodyOptions;
      validate?: {
        params?: Joi.ObjectSchema;
        query?: Joi.ObjectSchema;
        body?: Joi.ObjectSchema;
      };
    };
  };
  custom: {
    [key: string]: any;
  };
  security: {
    cors: {
      allowOrigins: string[];
      allowCredentials?: boolean;
    };
  };
  serve: serve.Options;
  responses: {
    [key: string]: (this: Koa.Context, ...args: any) => void;
  };
  routerPrefix?: string;
};
```
