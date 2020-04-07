import { Context } from '../../../../typings';

export = function (this: Context, data?: any, message?: string, success = true) {
  this.body = {
    success,
    data,
    message
  };
};
