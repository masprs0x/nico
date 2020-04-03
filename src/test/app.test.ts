import nico from '../index';
import Application, { Context } from '../../typings';
import request from 'supertest';

beforeAll(async () => {
  await nico.init({
    datastores: {
      default: {
        type: 'mongo',
        url: 'mongodb://root:admin123@localhost:27017/test?authSource=admin'
      }
    },
    routes: {
      'GET /nico': {
        controller: (ctx: Context) => {
          return (ctx.body = { data: 'nico nico ni' });
        },
        policies: true
      }
    }
  });

  await nico.db?.connect();
});

afterAll(async () => {
  await nico.db?.disconnect();
});

test('GET /nico', async () => {
  const response = await request((<Application>nico.app).callback()).get('/api/v1/nico');
  expect(response.body.data).toEqual('nico nico ni');
});
