import request from 'supertest';
import mongoose from 'mongoose';

import nico from '../src/index';
import Joi from '@hapi/joi';
import Mongo from '@blastz/nico-mongo';

beforeAll(async () => {
  nico.init({
    routes: {
      'GET /user': {
        controller: require('./api/controllers/get'),
        policies: true
      },
      'POST /user': {
        controller: require('./api/controllers/create'),
        bodyParser: true,
        validate: {
          body: Joi.object({
            name: Joi.string().trim().required()
          })
        }
      },
      'POST /users/:id': {
        controller: async (ctx) => {
          return ctx.ok({
            params: ctx.state.params,
            body: ctx.state.body,
            query: ctx.state.query
          });
        },
        bodyParser: true,
        validate: {
          params: Joi.object({
            id: Joi.number().required().min(1)
          }),
          body: (data) => {
            if (!data.name) {
              throw new Error('Need name');
            }

            return {
              name: String(data.name).trim()
            };
          },
          query: Joi.object({
            limit: Joi.number().min(0)
          })
        }
      }
    },
    serve: {
      root: 'assets'
    }
  });

  await Mongo.connect(mongoose, 'mongodb://root:admin123@localhost:27017/test?authSource=admin');
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await Mongo.disconnect(mongoose);
});

test('App', async () => {
  const createUser = await request(nico.callback()).post('/user').send({ name: 'nico nico ni' });
  const getUsers = await request(nico.callback()).get('/user');

  expect(createUser.body.data.name).toEqual('nico nico ni');
  expect(getUsers.body.data[0].name).toEqual('nico nico ni');
});

test('Validate', async () => {
  const testValidator = await request(nico.callback()).post('/users/122');
  expect(testValidator.body.message).toEqual('Need name');
  const testValidator2 = await request(nico.callback()).post('/users/122').send({ name: '  1' });
  expect(testValidator2.body.data).toEqual({ params: { id: 122 }, body: { name: '1' }, query: {} });
  const testValidator3 = await request(nico.callback()).post('/users/122?limit=-1').send({ name: '  1' });
  expect(testValidator3.body.message).toEqual('"limit" must be larger than or equal to 0');
  const testValidator4 = await request(nico.callback()).post('/users/122?limit=100').send({ name: '  1' });
  expect(testValidator4.body.data).toEqual({ params: { id: 122 }, body: { name: '1' }, query: { limit: 100 } });
});

test('Serve', async () => {
  const res = await request(nico.callback()).get('/assets/1/2');
  expect(res.status).toEqual(404);
  expect(res.body).toEqual({});
});
