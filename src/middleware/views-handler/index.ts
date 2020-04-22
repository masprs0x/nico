import { Context, Next } from 'koa';
import cons from 'consolidate';
import path from 'path';

import { ConfigView } from '../../../typings';

export = (config: ConfigView) => {
  const options: ConfigView = {
    autoRender: true,
    ...config
  };

  const { map, autoRender } = options;

  return async (ctx: Context, next: Next) => {
    if (ctx.render) return await next();

    (<any>ctx.response).render = ctx.render = async (filePath: string, locals: any) => {
      const extname = path.extname(filePath);
      const engineName = map[extname];
      const render = cons[engineName];
      const html = await render(path.resolve(process.cwd(), './views', filePath), locals);

      if (autoRender) {
        ctx.body = html;
      } else {
        return html;
      }
    };

    await next();
  };
};
