# Nico

**This module is sill in building, everyting maybe change**.

Wrap up koa for better usage, learn how to use it in [node-services-boilerplate](https://github.com/blastZ/node-services-boilerplate);

## Installation

```bash
npm install @blastz/nico
```

## API

### Nico.init<State, Custom>(inputConfig: Config<State, Custom>)

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
    };
  };
  custom?: {
    [key: string]: any;
  };
  security?: {
    cors: {
      allowOrigins: string[];
      allowCredentials?: boolean;
    };
  };
  serve?: {
    root?: string;
    opts?: serve.Options;
  };
  responses?: {
    [key: string]: (this: Koa.Context, ...args: any) => void;
  };
  routerPrefix?: string;
};
```

### Utility.Mongo.connect(mongoose: typeof Mongoose, url: string)

Connect mongodb

### Utility.Mongo.disconnect(mongoose: typeof Mongoose)

Disconnect mongodb
