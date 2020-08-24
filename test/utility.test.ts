import nico from '../src/index';

test('Merge Configs', () => {
  const configs = nico.mergeConfigs(
    {
      custom: {
        name: 'test',
      },
    },
    {
      custom: {
        age: 12,
      },
    },
    // @ts-ignore
    11,
    undefined,
    null,
    'string',
    function test() {},
    [{ custom: { name: 'a' } }],
    {
      custom: {
        name: 'cool',
      },
    },
  );

  expect(configs).toEqual({ custom: { name: 'cool', age: 12 } });
});

test('Logger level', () => {
  const levelFuncs = [
    nico.logger.fatal,
    nico.logger.error,
    nico.logger.warn,
    nico.logger.info,
    nico.logger.debug,
    nico.logger.trace,
  ];

  levelFuncs.forEach((o) => {
    expect(typeof o).toEqual('function');
  });
});
