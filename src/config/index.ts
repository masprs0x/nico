import datastores from './datastores';
import routes from './routes';
import custom from './custom';
import security from './security';
import serve from './serve';
import Application from '../../typings';
import responses from './responses';

const config: Application.Config = {
  datastores,
  routes,
  custom,
  security,
  serve,
  responses
};

export = config;
