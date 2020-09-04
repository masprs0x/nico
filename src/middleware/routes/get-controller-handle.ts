import { NicoContext, NicoMiddleware, NicoNext } from '../../../typings';

export type Options = {
  timeout?: number;
};

export default function getControllerHandleMiddleware(
  controller: NicoMiddleware,
  options?: Options,
) {
  const { timeout } = options || {};
  const { name } = controller;
  const stage = `controller-${name}`;

  return async function controllerHandleMiddleware(ctx: NicoContext, next: NicoNext) {
    ctx.logger = ctx.logger.child({ stage, timeout });

    let timeoutFunc: (() => Promise<any>) | undefined;
    let timer: NodeJS.Timeout | undefined;

    if (timeout) {
      const realTimeout = Number(timeout);
      if (!Number.isNaN(realTimeout) && realTimeout > 0) {
        timeoutFunc = () =>
          new Promise((_, reject) => {
            timer = setTimeout(() => {
              reject(new Error('Request timeout'));
            }, realTimeout);
          });
      }
    }

    ctx.logger.debug({
      executeTime: ctx.helper.getExecuteTime(),
      message: `hit controller ${name}`,
    });

    if (timeoutFunc) {
      try {
        // TODO async controller will keep executing after timeout, is it necessary to stop it?
        await Promise.race([
          timeoutFunc(),
          (async () => {
            await controller(ctx, next);
            return Promise.resolve();
          })(),
        ]);
      } finally {
        timer && clearTimeout(timer);
      }
    } else {
      await controller(ctx, next);
    }
  };
}
