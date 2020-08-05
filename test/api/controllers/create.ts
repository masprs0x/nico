import User from '../models/User';
import { Context } from '../../../src';

export default async function create(ctx: Context) {
  const { name } = ctx.state.body;
  const user = await User.create({
    name,
  });

  return ctx.ok(user);
}
