import nico from '../src/index';

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
  expect(typeof nico.log.silly).toEqual('function');
  expect(typeof nico.log.trace).toEqual('function');
  expect(typeof nico.log.debug).toEqual('function');
  expect(typeof nico.log.info).toEqual('function');
  expect(typeof nico.log.warn).toEqual('function');
  expect(typeof nico.log.error).toEqual('function');
  expect(typeof nico.log.fatal).toEqual('function');
});
