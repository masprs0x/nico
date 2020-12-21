import { Context } from '../../../src';
import mysql from '../models/mysql';

export default async function create(ctx: Context) {
  const { name } = ctx.state.body;
  const { insertId } = await mysql.exec('insert into users(`name`) values(?) ', [name]);
  const user = (await mysql.exec('select * from users where id = ?', [insertId]))[0];

  return ctx.ok(user);
}
