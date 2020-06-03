import debug from 'debug';

export const error = (namespace: string) => debug('nico:error').extend(namespace);

export const log = (namespace: string) => debug('nico:log').extend(namespace);

export const info = (namespace: string) => debug('nico:info').extend(namespace);
