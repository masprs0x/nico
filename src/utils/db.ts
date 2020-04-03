import Redis from 'ioredis';
import mongoose from 'mongoose';

import Application from '../../typings';

export class DB {
  default?: typeof mongoose;
  cache?: Redis.Redis;
  config?: Application.ConfigDatastores;

  constructor(config: Application.ConfigDatastores) {
    this.config = config;
  }

  async connect() {
    if (this.config?.default?.type === 'mongo' && this.config.default.url) {
      const defaultDB = await mongoose.connect(this.config.default.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      });

      this.default = defaultDB;
    }

    if (this.config?.cache) {
      const redis = new Redis(this.config.cache.url);
      this.cache = redis;
    }
  }

  async disconnect() {
    if (this.default) {
      await Promise.all(
        this.default.connections.map(async connection => {
          await connection.close();
        })
      );
    }

    if (this.cache) {
      this.cache.disconnect();
    }
  }
}
