import custom from './custom';
import responses from './responses';
import routes from './routes';
import security from './security';

import { Config } from '../../typings';

const config: Config = {
  custom,
  routes,
  security,
  responses,
  serve: {},
  advancedConfigs: {
    forceExitTime: 10 * 1000,
  },
  helpers: {},
};

export default config;
