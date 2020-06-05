import Nico, { utility } from '../src/index';

test('Merge Configs', () => {
  const configs = utility.mergeConfigs(
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
