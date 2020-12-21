import { Context } from '../../../src';
import mysql from '../models/mysql';

export default async function get(ctx: Context) {
  const users = await mysql.exec('select * from users');
  return ctx.ok(users);
}
