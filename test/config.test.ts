import request from 'supertest';

import { Nico } from '../src/index';

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

test('Cors Configs', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'OPTIONS /test': {
        controller: (ctx) => {
          ctx.ok('options test');
        }
      },
      'GET /test': {
        controller: (ctx) => {
          ctx.ok('get test');
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
          ctx.ok('/test');
        }
      },
      'GET /test/': {
        controller: (ctx) => {
          ctx.ok('/test/');
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

  expect(body.data).toEqual('/test');
  expect(body2.data).toEqual('/test/');
});
