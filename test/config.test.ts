import request from 'supertest';
import mongoose from 'mongoose';

import Nico from '../src/index';
import Joi from '@hapi/joi';

test('Advanced Configs', async () => {
  const nico = new Nico({
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

  const req = request(nico.app.callback());

  const { body } = await req.get('/test');
  const { body: body2 } = await req.get('/test/');

  expect(body.data).toEqual('/test');
  expect(body2.data).toEqual('/test/');
});
