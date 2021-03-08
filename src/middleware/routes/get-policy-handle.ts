import { Context, Next, Middleware } from '../../../typings';

export default function getPolicyHandleMiddleware(policyMiddleware: Middleware<any, any>) {
  const policyName = policyMiddleware.name;

  return async function policyHandleMiddleware(ctx: Context, next: Next) {
    ctx.logger = ctx.logger.child({ stage: `nico.routeMiddleware.policies.${policyName}` });
    ctx.logger.trace(`hit policy`);

    await policyMiddleware(ctx, next);
  };
}
