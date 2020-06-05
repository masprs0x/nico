import deepmerge from './deepmerge';

import { Config, DefaultState, DefaultCustom } from '../../typings';

export function mergeConfigs<TState extends DefaultState = DefaultState, TCustom extends DefaultCustom = DefaultCustom>(
  ...configs: Config<TState, TCustom>[]
) {
  if (!Array.isArray(configs)) return configs;

  const config = configs.reduce((result, current, index) => {
    if (index == 0) return current;
    return deepmerge(result, current);
  }, configs[0]);

  return config;
}
