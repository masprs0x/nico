import Application from '../../typings';

const config: Application.ConfigSecurity = {
  cors: {
    allowOrigins: ['http://localhost', 'http://127.0.0.1'],
    allowCredentials: true
  }
};

export = config;
