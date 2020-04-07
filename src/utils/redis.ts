import IORedis from 'ioredis';

export = class Redis {
  url = '';
  redis = new IORedis();

  init(url: string) {
    this.url = url;
  }

  async connect() {
    if (this.url) {
      this.redis = new IORedis(this.url);
    }
  }

  async disconnect() {
    if (this.redis) {
      this.redis.disconnect();
    }
  }
};
