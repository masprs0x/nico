import { Context } from '../../../src';

import User from '../models/User';

export default async function get(ctx: Context) {
  const users = await User.find().select('_id name');
  return ctx.ok(users);
}
