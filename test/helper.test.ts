import request from 'supertest';

import { Nico } from '../src/index';

const nico = new Nico();
const req = request(nico.callback());

beforeAll(() => {
  nico.init({
    routes: {
      'GET /getExecuteTime': {
        controller: async (ctx) => {
          const start = ctx.helper.getExecuteTime();
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 600);
          });
          const end = ctx.helper.getExecuteTime();
          return (ctx.body = { time: end - start });
        },
      },
    },
    logger: {
      consoleLevel: 'none',
      fileLevel: 'none',
    },
  });
});

test('getExecuteTime', async () => {
  const { time } = (await req.get('/getExecuteTime')).body;
  expect(Math.round(time / 1000 - 0.6)).toEqual(0);
});
