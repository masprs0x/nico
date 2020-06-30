import custom from './custom';
import security from './security';
import serve from './serve';
import responses from './responses';
import routes from './routes';

import { Config } from '../../typings';

const config: Config = {
  custom,
  routes,
  security,
  serve,
  responses
};

export default config;
