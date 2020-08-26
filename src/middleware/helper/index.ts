import { NicoContext, NicoNext, ConfigHelpers } from '../../../typings';

import getExecuteTime from './helpers/getExecuteTime';

function getHelperMiddleware(config: ConfigHelpers) {
  return async function helperMiddleware(ctx: NicoContext, next: NicoNext) {
    ctx.helper.getExecuteTime = getExecuteTime.bind(ctx);

    Object.keys(config).map((key) => {
      ctx.helper[key] = config[key].bind(ctx);
      return undefined;
    });

    await next();
  };
}

export default getHelperMiddleware;
