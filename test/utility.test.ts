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
