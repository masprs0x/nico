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

test('Logger level', () => {
  const levelFuncs = [nico.logger.fatal, nico.logger.error, nico.logger.warn, nico.logger.info, nico.logger.debug, nico.logger.trace];

  levelFuncs.map((o) => {
    expect(typeof o).toEqual('function');
  });
});
