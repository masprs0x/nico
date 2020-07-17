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
