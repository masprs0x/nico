export enum InnerAppMiddleware {
  ERROR_HANDLER = 'error-handler',
  NOT_FOUND_HANDLER = 'not-found-handler',
  GLOBAL_CORS = 'global-cors',
  RESPONSES = 'responses',
  SERVE = 'serve',
  ROUTES = 'routes',
}

export const APP_MIDDLEWARES = [
  InnerAppMiddleware.ERROR_HANDLER,
  InnerAppMiddleware.NOT_FOUND_HANDLER,
  InnerAppMiddleware.GLOBAL_CORS,
  InnerAppMiddleware.RESPONSES,
  InnerAppMiddleware.SERVE,
  InnerAppMiddleware.ROUTES,
];
