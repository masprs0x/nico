import { Context, Next, Middleware } from '../../../typings';

export default function getPolicyHandleMiddleware(policyMiddleware: Middleware<any, any>) {
  const policyName = policyMiddleware.name;

  return async function policyHandleMiddleware(ctx: Context, next: Next) {
    ctx.logger = ctx.logger.child({ stage: `policy-${policyName}` });
    ctx.logger.trace(`hit policy ${policyName}`);

    await policyMiddleware(ctx, next);
  };
}
