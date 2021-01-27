import parse from 'co-body';

import { Context, Next, HttpMethod } from '../../../typings';

export interface Options {
  parsedMethods: HttpMethod[];
  encoding: string;
  enabledTypes: EnabledTypes;
}

export type EnabledTypes = ('json' | 'form' | 'text' | 'xml')[];

export default async function getBodyParser(opts: Partial<Options>) {
  const jsonTypes = [
    'application/json',
    'application/json-patch+json',
    'application/vnd.api+json',
    'application/csp-report',
  ];
  const formTypes = ['application/x-www-form-urlencoded'];
  const textTypes = ['text/plain'];
  const xmlTypes = ['text/xml', 'application/xml'];

  const enableTypes: EnabledTypes = ['json', 'form'];
  // encoding supported by iconv-lite
  const encoding = 'utf-8';
  const parsedMethods: HttpMethod[] = ['post', 'put', 'patch'];

  const options: Options = {
    parsedMethods: opts.parsedMethods ?? parsedMethods,
    encoding: opts.encoding ?? encoding,
    enabledTypes: opts.enabledTypes ?? enableTypes,
  };

  return async function bodyParser(ctx: Context, next: Next) {
    ctx.logger = ctx.logger.child({ stage: 'body-parser' });

    if (options.parsedMethods.includes(ctx.method.toLowerCase() as HttpMethod)) {
      try {
      } catch (err) {}
    }

    await next();
  };
}
