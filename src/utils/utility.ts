function _isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function mergeDeep(target: any, ...sources: any): any {
  if (!sources.length) return target;

  const source = sources.shift();

  if (_isObject(target) && _isObject(source)) {
    for (const key in source) {
      if (_isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }

        if (target[key] && !_isObject(target[key])) {
          Object.assign(target, { [key]: {} });
        }

        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
