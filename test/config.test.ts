import request from 'supertest';

import { Nico } from '../src/index';
import Joi from '@hapi/joi';

test('Merge configs', async () => {
  const nico = new Nico();
  nico.init(
    {
      routes: {
        'GET /test': {
          controller: (ctx) => {
            ctx.ok('test');
          }
        }
      },
      responses: {
        ok: function ok(data, message, success) {
          this.body = {
            success,
            data,
            message
          };
        }
      },
      logger: {
        consoleLevel: 'none'
      }
    },
    {
      routes: {
        'GET /test2': {
          controller: (ctx) => {
            ctx.ok('test2');
          }
        }
      }
    }
  );

  const req = request(nico.callback());

  const { body } = await req.get('/test');
  const { body: body2 } = await req.get('/test2');

  expect(body.data).toEqual('test');
  expect(body2.data).toEqual('test2');
});

test('Merge configs in constructor', async () => {
  const nico = new Nico({
    routes: {
      'GET /test': {
        controller: (ctx) => {
          return (ctx.body = { name: 'blast' });
        },
        policies: true
      },
      'GET /test2': {
        controller: function a() {},
        policies: true
      }
    }
  });

  nico.init({
    routes: {
      'GET /test2': {
        controller: function b(ctx) {
          return (ctx.body = { name: 'z' });
        },
        policies: false
      }
    }
  });

  expect(nico.config.routes?.['GET /test'].policies).toEqual(true);
  expect(nico.config.routes?.['GET /test2'].policies).toEqual(false);

  const req = request(nico.callback());

  const { body } = await req.get('/test');
  const { body: body2 } = await req.get('/test2');

  expect(body).toEqual({ name: 'blast' });
  expect(body2).toEqual({}); // policies is false
});

test('Empty configs', async () => {
  const nico = new Nico();

  nico.init();
});

test('Cors Configs', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'OPTIONS /test': {
        controller: (ctx) => {
          ctx.body = 'options test';
        }
      },
      'GET /test': {
        controller: (ctx) => {
          ctx.body = 'get test';
        },
        cors: {
          allowOrigins: '*',
          allowCredentials: true,
          exposeHeaders: ['Pagination-Count']
        }
      }
    },
    security: {
      cors: {
        allRoutes: true,
        allowOrigins: ['http://127.0.0.1'],
        allowHeaders: ['Pagination-Page']
      }
    }
  });

  const req = request(nico.callback());

  const { header } = await req.get('/test');
  expect(header['access-control-allow-origin']).toEqual('*');
  expect(header['access-control-allow-credentials']).toEqual('true');
  expect(header['access-control-expose-headers']).toEqual('Pagination-Count');

  const { header: header2 } = await req.options('/test').set('Access-Control-Request-Method', 'PATCH').set('Origin', 'http://127.0.0.1');
  expect(header2['access-control-allow-origin']).toEqual('http://127.0.0.1');
  expect(header2['access-control-allow-methods']).toEqual('GET,HEAD,PUT,POST,DELETE,PATCH');
  expect(header2['access-control-max-age']).toEqual('60');
  expect(header2['access-control-allow-headers']).toEqual('Pagination-Page');
});

test('Advanced Configs', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'GET /test': {
        controller: (ctx) => {
          ctx.body = { name: '/test' };
        }
      },
      'GET /test/': {
        controller: (ctx) => {
          ctx.body = { name: '/test/' };
        }
      }
    },
    advancedConfigs: {
      routerOptions: {
        strict: true
      }
    }
  });

  const req = request(nico.callback());

  const { body } = await req.get('/test');
  const { body: body2 } = await req.get('/test/');

  expect(body.name).toEqual('/test');
  expect(body2.name).toEqual('/test/');
});

test('Nested Routes', async () => {
  const nico = new Nico({
    routes: {
      '/api/v1': {
        '/users': {
          GET: {
            controller: (ctx) => {
              return (ctx.body = { data: 'get' });
            }
          },
          POST: {
            controller: (ctx) => {
              return (ctx.body = { data: 'post' });
            }
          },
          '/:id': {
            DELETE: {
              controller: (ctx) => {
                return (ctx.body = { data: 'delete' + ' ' + ctx.state.params.id });
              },
              validate: {
                params: Joi.object({
                  id: Joi.number()
                })
              }
            }
          }
        }
      },
      '/api/v2': {
        '/posts': {
          '/:id': {
            'GET /categories': {
              controller: (ctx) => {
                return (ctx.body = { data: `category${ctx.params.id}` });
              }
            },
            'GET /authors': {
              controller: (ctx) => {
                return (ctx.body = { data: `author${ctx.params.id}` });
              }
            }
          }
        }
      }
    }
  });

  nico.init();

  const req = request(nico.callback());

  const { body: getBody } = await req.get('/api/v1/users');
  expect(getBody.data).toEqual('get');

  const { body: postBody } = await req.post('/api/v1/users');
  expect(postBody.data).toEqual('post');

  const { body: deleteBody } = await req.delete('/api/v1/users/233');
  expect(deleteBody.data).toEqual('delete 233');

  const { body: body1 } = await req.get('/api/v2/posts/2/categories');
  const { body: body2 } = await req.get('/api/v2/posts/3/authors');
  expect(body1.data).toEqual('category2');
  expect(body2.data).toEqual('author3');
});

test('Custom App Middlewares', async () => {
  const nico = new Nico({
    routes: {
      '/test': {
        GET: {
          controller: (ctx) => {
            ctx.body = { text: 'test' };
          }
        }
      }
    }
  });

  nico.useCustomAppMiddleware(() => async (ctx, next) => {
    await next();
    ctx.set('custom', 'custom');
  });

  nico.useCustomAppMiddleware(
    () => async (ctx, next) => {
      await next();
      ctx.set('custom2', 'custom2');
    },
    'custom'
  );

  nico.init();

  const req = request(nico.callback());

  const result = await req.get('/test');

  expect(result.header.custom).toEqual('custom');
  expect(result.header.custom2).toEqual('custom2');
});

test('Custom Route Middlewares', async () => {
  const nico = new Nico({
    routes: {
      '/test': {
        GET: {
          controller: (ctx) => {
            ctx.body = { text: 'test' };
          }
        }
      }
    }
  });

  nico.useCustomRouteMiddleware(() => async (ctx, next) => {
    await next();
    ctx.set('custom', 'custom');
  });

  nico.useCustomRouteMiddleware(
    () => async (ctx, next) => {
      await next();
      ctx.set('custom2', 'custom2');
    },
    'custom'
  );
  nico.init();

  const req = request(nico.callback());
  const result = await req.get('/test');

  expect(result.header.custom).toEqual('custom');
  expect(result.header.custom2).toEqual('custom2');
});
