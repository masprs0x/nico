import serve from 'koa-static';

const config: serve.Options = {
  maxAge: 1 * 24 * 3600 * 1000
};

export = config;
