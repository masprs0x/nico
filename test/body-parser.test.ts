import request from 'supertest';
import path from 'path';

import { Nico } from '../src';

test('application/json', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'POST /users': {
        controller: async (ctx) => {
          return (ctx.body = { ...ctx.request.body });
        },
        bodyParser: true,
      },
    },
    logger: { consoleLevel: 'none' },
  });

  const agent = request(nico.callback());

  const result = await agent.post('/users').send({ name: 'blastz', age: 12 });
  expect(result.status).toEqual(200);
  expect(result.body.name).toEqual('blastz');
  expect(result.body.age).toEqual(12);
});

test('application/x-www-form-urlencoded', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'POST /users': {
        controller: async (ctx) => {
          return (ctx.body = { ...ctx.request.body });
        },
        bodyParser: true,
      },
    },
    logger: { consoleLevel: 'none' },
  });

  const agent = request(nico.callback());

  const result = await agent.post('/users').send('name=blastz&age=12');
  expect(result.status).toEqual(200);
  expect(result.body.name).toEqual('blastz');
  expect(result.body.age).toEqual('12');
});

test('text/plain', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'POST /users': {
        controller: async (ctx) => {
          return (ctx.body = ctx.request.body);
        },
        bodyParser: {
          textOpts: {
            enable: true,
          },
        },
      },
    },
    logger: { consoleLevel: 'none' },
  });

  const agent = request(nico.callback());

  const result = await agent
    .post('/users')
    .set('content-type', 'text/plain')
    .send('name=blastz&age=12');

  expect(result.status).toEqual(200);
  expect(result.text).toEqual('name=blastz&age=12');
});

test('text/xml', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'POST /users': {
        controller: async (ctx) => {
          return (ctx.body = ctx.request.body);
        },
        bodyParser: {
          xmlOpts: {
            enable: true,
          },
        },
      },
    },
    logger: { consoleLevel: 'none' },
  });

  const agent = request(nico.callback());

  const result = await agent
    .post('/users')
    .set('content-type', 'text/xml')
    .send('<str>name=blastz&age=12</str>');

  expect(result.status).toEqual(200);
  expect(result.text).toEqual('<str>name=blastz&age=12</str>');
});

test('multipart/form-data', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'POST /users': {
        controller: async (ctx) => {
          return (ctx.body = {
            name: ctx.request.body.name,
            // @ts-ignore
            avatar: ctx.request.files?.avatar.path,
          });
        },
        bodyParser: {
          multipartOpts: {
            enable: true,
          },
        },
      },
    },
    logger: { consoleLevel: 'none' },
  });

  const agent = request(nico.callback());

  const result = await agent
    .post('/users')
    .field('name', 'blastz')
    .attach('avatar', path.resolve(__dirname, '../../test/assets/avatar.jpg'));

  expect(result.status).toEqual(200);
  expect(result.body.name).toEqual('blastz');
  expect(result.body.avatar.startsWith('/tmp/upload_')).toEqual(true);
});
