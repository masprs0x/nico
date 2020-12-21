import mysql, { Connection, ConnectionOptions } from 'mysql2/promise';

class Mysql {
  connection: Connection;

  async init() {
    await this.exec('drop database if exists `nico`');
    await this.exec('create database `nico`');
    await this.connection.changeUser({ database: 'nico' });
    await this.exec('drop table if exists `users`');
    await this.exec(
      'create table `users` ( `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, `name` VARCHAR(45) NOT NULL, PRIMARY KEY (`id`))',
    );
  }

  async connect(options: ConnectionOptions) {
    this.connection = await mysql.createConnection(options);
  }

  async exec(sql: string, params?: any[]) {
    const [rows] = await this.connection.execute(sql, params);

    return rows as any;
  }

  async disconnect() {
    await this.connection.end();
  }
}

export default new Mysql();
