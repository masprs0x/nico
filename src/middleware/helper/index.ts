import { Context, Next } from 'koa';
import getExecuteTime from './utility/getExecuteTime';

function getHelperMiddleware() {
  return async function helperMiddleware(ctx: Context, next: Next) {
    ctx.helper.getExecuteTime = getExecuteTime.bind(ctx);

    await next();
  };
}

export default getHelperMiddleware;
