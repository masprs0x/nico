import nico, { log } from '../src/index';

test('Merge Configs', () => {
  const configs = nico.mergeConfigs(
    {
      custom: {
        name: 'test'
      }
    },
    {
      custom: {
        age: 12
      }
    }
  );

  expect(configs).toEqual({ custom: { name: 'test', age: 12 } });
});

test('Log Methods', () => {
  expect(typeof log.silly).toEqual('function');
  expect(typeof log.trace).toEqual('function');
  expect(typeof log.debug).toEqual('function');
  expect(typeof log.info).toEqual('function');
  expect(typeof log.warn).toEqual('function');
  expect(typeof log.error).toEqual('function');
  expect(typeof log.fatal).toEqual('function');
});
