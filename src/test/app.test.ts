import request from 'supertest';

import { Context, DefaultState } from '../../typings';
import nico from '../index';
import Joi from '../utils/joi';

interface State extends DefaultState {
  custom: {
    APP_NAME: string;
  };
}

type Custom = {
  ok: typeof ok;
};

const ok = function (this: Context, data?: any, message?: string, success = true) {
  this.body = {
    success,
    data,
    message
  };
};

beforeAll(async () => {
  await nico.init({
    custom: {
      APP_NAME: 'nico'
    },
    responses: {
      ok
    },
    routes: {
      'GET /nico': {
        controller: (ctx: Context<State, Custom>) => {
          return ctx.ok(ctx.state.custom);
        },
        policies: true
      },
      'POST /nico': {
        controller: (ctx: Context<State, Custom>) => {
          const body = ctx.state.body;
          return ctx.ok(body.name);
        },
        bodyParser: true,
        validate: {
          body: Joi.object({
            name: Joi.string().trim().required()
          })
        }
      }
    }
  });
});

test('simple test', async () => {
  const response = await request(nico.app.callback()).get('/api/v1/nico');
  const response2 = await request(nico.app.callback()).post('/api/v1/nico').send({
    name: 'nico'
  });
  expect(response.body.data.APP_NAME).toEqual('nico');
  expect(response2.body.data).toEqual('nico');
});
