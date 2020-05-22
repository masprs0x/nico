import { User } from '../models/User';
import { Context } from '../../../typings';

export = async (ctx: Context) => {
  const name: string = ctx.state.body.name;
  const user = await User.create({
    name
  });

  return ctx.ok(user);
};
