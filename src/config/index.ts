import custom from './custom';
import security from './security';
import serve from './serve';
import responses from './responses';
import routes from './routes';
import { Config, DefaultState, DefaultCustom } from '../../typings';

const config: Config<DefaultState, DefaultCustom> = {
  custom,
  routes,
  security,
  serve,
  responses
};

export = config;
