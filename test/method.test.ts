import request from 'supertest';

import { Nico } from '../src';

test('Cluster Mode', () => {
  const nico = new Nico();

  expect(typeof nico.startCluster).toEqual('function'); // TODO test cluster mode
});

test('Custom App Middlewares', async () => {
  const nico = new Nico();

  nico.useAppMiddleware(() => async (ctx, next) => {
    await next();
    ctx.set('custom', 'custom');
  });

  nico.useAppMiddleware(
    () => async (ctx, next) => {
      await next();
      ctx.set('custom2', 'custom2');
    },
    'custom',
  );

  nico.init({
    routes: {
      '/test': {
        GET: {
          controller: (ctx) => {
            ctx.body = { text: 'test' };
          },
        },
      },
    },
  });

  const req = request(nico.callback());

  const result = await req.get('/test');

  expect(result.header.custom).toEqual('custom');
  expect(result.header.custom2).toEqual('custom2');
});

test('Custom Route Middlewares', async () => {
  const nico = new Nico();

  nico.useRouteMiddleware(() => async (ctx, next) => {
    await next();
    ctx.set('custom', 'custom');
  });

  nico.useRouteMiddleware(
    () => async (ctx, next) => {
      await next();
      ctx.set('custom2', 'custom2');
    },
    'custom',
  );

  nico.init({
    routes: {
      '/test': {
        GET: {
          controller: (ctx) => {
            ctx.body = { text: 'test' };
          },
        },
      },
    },
  });

  const req = request(nico.callback());
  const result = await req.get('/test');

  expect(result.header.custom).toEqual('custom');
  expect(result.header.custom2).toEqual('custom2');
});
