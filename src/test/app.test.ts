import request from 'supertest';
import mongoose from 'mongoose';

import nico from '../index';
import Joi from '../utils/joi';
import Mongo from '../utils/mongo';

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
      }
    }
  });

  await Mongo.connect(mongoose, 'mongodb://root:admin123@localhost:27017/test?authSource=admin');
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await Mongo.disconnect(mongoose);
});

test('Basic test', async () => {
  const createUser = await request(nico.app.callback()).post('/user').send({ name: 'nico nico ni' });
  const getUsers = await request(nico.app.callback()).get('/user');

  expect(createUser.body.data.name).toEqual('nico nico ni');
  expect(getUsers.body.data[0].name).toEqual('nico nico ni');
});
