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

export function createUid() {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}
