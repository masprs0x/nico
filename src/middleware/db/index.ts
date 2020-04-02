import { DB } from '../../utils/db';
import Application, { Context, Next } from '../../../typings/app';

export = (app: Application, config: Application.ConfigDatastores) => {
  const db = new DB(config);
  app.db = db;

  return async (ctx: Context, next: Next) => {
    if (db.redis) {
      ctx.redis = db.redis;
    }

    await next();
  };
};
