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
