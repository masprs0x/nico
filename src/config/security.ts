import { ConfigSecurity } from '../../typings';

const config: ConfigSecurity = {
  cors: {
    allowOrigins: ['http://localhost', 'http://127.0.0.1'],
    allowCredentials: true
  }
};

export = config;
