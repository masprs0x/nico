export enum InnerAppMiddleware {
  ERROR_HANDLER = 'error-handler',
  NOT_FOUND_HANDLER = 'not-found-handler',
  GLOBAL_CORS = 'global-cors',
  RESPONSES = 'responses',
  SERVE = 'serve',
  ROUTES = 'routes',
}

export enum InnerRouteMiddleware {
  DEBUG = 'debug',
  CONTROLLER_CORS = 'controller-cors',
  CSP = 'csp',
  XFRAMES = 'xframes',
  POLICIES = 'policies',
  BODY_PARSER = 'body-parser',
  VALIDATE = 'validate',
  CONTROLLER = 'controller',
}
