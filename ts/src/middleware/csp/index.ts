import { Context, Next } from 'koa';
import { CSPOptions } from '../../../typings';

export = (config: CSPOptions) => {
  const options: CSPOptions = {
    policy: {},
    reportOnly: false,
    reportUri: '',
    ...config
  };

  const { policy, reportOnly, reportUri } = options;

  if (typeof policy !== 'object') {
    throw new Error('csp.policy must be object');
  }

  const name = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';

  let rules = '';
  Object.keys(policy).map((key) => {
    rules += `${key} ${policy[key]};`;
  });

  if (reportUri) {
    rules += `report-uri ${reportUri};`;
  }

  return async (ctx: Context, next: Next) => {
    ctx.set(name, rules);

    await next();
  };
};
