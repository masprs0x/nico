import Redis from 'ioredis';

import Application from '../../typings/app';

export class DB {
  redis: Redis.Redis | undefined;
  config: Application.ConfigDatastores = {
    default: {
      url: ''
    }
  };

  constructor(config: Application.ConfigDatastores) {
    this.config = config;
  }

  async connect() {
    if (this.config.default) {
    }

    if (this.config.cache) {
      const redis = new Redis(this.config.cache.url);
      this.redis = redis;
    }
  }

  async disconnect() {
    if (this.config.default) {
    }

    if (this.redis) {
      this.redis.disconnect();
    }
  }
}
