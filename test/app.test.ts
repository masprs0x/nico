import request from 'supertest';
import mongoose from 'mongoose';
import path from 'path';

import Joi from '@hapi/joi';
import Mongo from '@blastz/nico-mongo';
import nico from '../src/index';

import getController from './api/controllers/get';
import createControler from './api/controllers/create';

beforeAll(async () => {
  nico.init({
    routes: {
      'GET /user': {
        controller: getController,
        policies: true,
      },
      'POST /user': {
        controller: createControler,
        bodyParser: true,
        validate: {
          body: Joi.object({
            name: Joi.string().trim().required(),
          }),
        },
      },
      'POST /users/:id': {
        controller: async (ctx) => {
          return ctx.ok({
            params: ctx.state.params,
            body: ctx.state.body,
            query: ctx.state.query,
          });
        },
        bodyParser: true,
        validate: {
          params: Joi.object({
            id: Joi.number().required().min(1),
          }),
          body: (data) => {
            if (!data.name) {
              throw new Error('Need name');
            }

            return {
              name: String(data.name).trim(),
            };
          },
          query: Joi.object({
            limit: Joi.number().min(0),
          }),
        },
      },
      'GET /controllers': {
        controller: [
          async (ctx, next) => {
            await next();
            return ctx.ok(ctx.state.name);
          },
          async (ctx) => {
            ctx.state.name = 'test-controllers';
          },
        ],
      },
      'POST /test-validate-files': {
        controller: async (ctx) => {
          return ctx.ok();
        },
        bodyParser: {
          multipart: true,
        },
        validate: {
          files: {
            file: {
              type: Joi.string().valid('image/jpeg'),
            },
            'file2?': {
              type: Joi.string().valid('image/png'),
            },
            'file3?': {
              name: Joi.string().valid('avatar2.jpg'),
            },
            'file4?': {
              extname: Joi.string().valid('.jpeg'),
            },
            'file5?': {
              basename: Joi.string().valid('avatar2'),
            },
            'file6?': {
              size: Joi.number().max(5 * 1024),
            },
          },
        },
      },
    },
    serve: {
      root: 'assets',
    },
    responses: {
      ok: function ok(data, message, success) {
        this.body = {
          success,
          data,
          message,
        };
      },
      onValidateError: function handle(err) {
        this.body = {
          success: false,
          message: err.message,
        };
      },
    },
    logger: {
      consoleLevel: 'none',
    },
    custom: {
      datastores: {
        default: {
          url: 'mongodb://root:admin123@localhost:27017/test?authSource=admin',
        },
      },
    },
  });

  await Mongo.connect(mongoose, nico.config.custom.datastores.default.url);
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await Mongo.disconnect(mongoose);
});

test('Log', async () => {
  expect(() => {
    nico.logger.error('error');
  }).not.toThrowError();
});

test('App', async () => {
  const createUser = await request(nico.callback()).post('/user').send({ name: 'nico nico ni' });
  const getUsers = await request(nico.callback()).get('/user');
  const testControllers = await request(nico.callback()).get('/controllers');

  expect(createUser.body.data.name).toEqual('nico nico ni');
  expect(getUsers.body.data[0].name).toEqual('nico nico ni');
  expect(testControllers.body.data).toEqual('test-controllers');
});

test('Validate', async () => {
  const testValidator = await request(nico.callback()).post('/users/122');
  expect(testValidator.body.message).toEqual('Need name');
  const testValidator2 = await request(nico.callback()).post('/users/122').send({ name: '  1' });
  expect(testValidator2.body.data).toEqual({ params: { id: 122 }, body: { name: '1' }, query: {} });
  const testValidator3 = await request(nico.callback())
    .post('/users/122?limit=-1')
    .send({ name: '  1' });
  expect(testValidator3.body.message).toEqual('"limit" must be larger than or equal to 0');
  const testValidator4 = await request(nico.callback())
    .post('/users/122?limit=100')
    .send({ name: '  1' });
  expect(testValidator4.body.data).toEqual({
    params: { id: 122 },
    body: { name: '1' },
    query: { limit: 100 },
  });
});

test('Validate Files', async () => {
  const filePath = path.resolve(__dirname, '../../test/assets/avatar.jpg');

  const result = await request(nico.callback()).post('/test-validate-files');
  expect(result.body.message).toEqual('file is required');

  const result2 = await request(nico.callback())
    .post('/test-validate-files')
    .attach('file', filePath)
    .attach('file2', filePath);
  expect(result2.body.message).toEqual('"value" must be [image/png]');

  const result3 = await request(nico.callback())
    .post('/test-validate-files')
    .attach('file', filePath)
    .attach('file3', filePath);
  expect(result3.body.message).toEqual('"value" must be [avatar2.jpg]');

  const result4 = await request(nico.callback())
    .post('/test-validate-files')
    .attach('file', filePath)
    .attach('file4', filePath);
  expect(result4.body.message).toEqual('"value" must be [.jpeg]');

  const result5 = await request(nico.callback())
    .post('/test-validate-files')
    .attach('file', filePath)
    .attach('file5', filePath);
  expect(result5.body.message).toEqual('"value" must be [avatar2]');

  const result6 = await request(nico.callback())
    .post('/test-validate-files')
    .attach('file', filePath)
    .attach('file6', filePath);
  expect(result6.body.message).toEqual('"value" must be less than or equal to 5120');
});

test('Serve', async () => {
  const res = await request(nico.callback()).get('/assets/1/2');
  expect(res.status).toEqual(404);
  expect(res.body).toEqual({});
});

test('Private Attributes', () => {
  expect(nico.initialed).toEqual(true);

  expect(() => {
    // @ts-ignore
    nico.initialed = false;
  }).toThrowError();

  expect(nico.initialed).toEqual(true);

  expect(nico.config.custom.datastores.default.url).toEqual(
    'mongodb://root:admin123@localhost:27017/test?authSource=admin',
  );

  // @ts-ignore
  expect(() => nico.config.custom = {}).toThrowError();
});
