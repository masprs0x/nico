# Nico

Wrap koa for better usage, learn how to use it in [node-services-boilerplate](https://github.com/blastZ/node-services-boilerplate);

## Installation

```bash
npm install @blastz/nico
```

## API

### Nico.init(config: Partial<Application.Config>)

Get koa application by init nico.

Application.Config

```ts
type Config = {
  datastores: {
    default?: {
      type: 'mongo';
      url: string;
    };
    cache?: {
      url: string;
    };
  };
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
    APP_NAME: string;
  };
  security: {
    cors: {
      allowOrigins: string[];
      allowCredentials?: boolean;
    };
  };
  serve: serve.Options;
  responses: {
    [key: string]: Koa.Middleware;
  };
};
```

### Nico.db.connect()

Connect default mongodb when `config.datastores.default` is provided.

### Nico.db.disconnect()

Disconnect default database.
