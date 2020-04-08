import { ConfigResponses } from '../../typings';
import { Context } from 'koa';

const config: ConfigResponses = {
  ok: function (this: Context, data: any, message: string, success: boolean) {
    this.body = {
      success,
      data,
      message
    };
  }
};

export = config;
