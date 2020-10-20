import { Nico } from '../src';

test('Cluster Mode', () => {
  const nico = new Nico();

  expect(typeof nico.startCluster).toEqual('function'); // TODO test cluster mode
});
