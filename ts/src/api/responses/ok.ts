import { Context } from 'koa';

export = function (this: Context, data: any = undefined, message = 'execute success', success = true) {
  this.body = {
    success,
    data,
    message
  };
};
