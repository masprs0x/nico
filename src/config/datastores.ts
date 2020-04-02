import Application from '../../typings/app';

const config: Application.ConfigDatastores = {
  default: {},
  cache: {
    url: 'redis://127.0.0.1:6379'
  }
};

export = config;
