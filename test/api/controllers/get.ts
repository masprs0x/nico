import { Context } from '../../../typings';
import { User } from '../models/User';

export = async (ctx: Context) => {
  const users = await User.find().select('_id name');
  return ctx.ok(users);
};
