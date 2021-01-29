import parse from 'co-body';
import Koa from 'koa';
import util from 'util';

import { Context, Next, HttpMethod } from '../../../typings';

const jsonTypes = [
  'application/json',
  'application/json-patch+json',
  'application/vnd.api+json',
  'application/csp-report',
];
const formTypes = ['application/x-www-form-urlencoded'];
const textTypes = ['text/plain'];
const xmlTypes = ['text/xml', 'application/xml'];

export default function getBodyParser(opts: Partial<Options> = {}) {
  // encoding supported by iconv-lite
  const encoding = 'utf-8';
  const parsedMethods: HttpMethod[] = ['post', 'put', 'patch'];

  const options: Options = {
    parsedMethods,
    encoding: opts.encoding ?? encoding,
    jsonOpts: {
      enable: true,
      limit: '1mb',
      strict: true,
      ...opts.jsonOpts,
    },
    formOpts: {
      enable: true,
      limit: '56kb',
      qsOpts: {},
      ...opts.formOpts,
    },
    textOpts: {
      enable: false,
      limit: '56kb',
      ...opts.textOpts,
    },
    xmlOpts: {
      enable: false,
      limit: '56kb',
      ...opts.xmlOpts,
    },
  };

  if (opts.parsedMethods) {
    options.parsedMethods = opts.parsedMethods.map((o) => o.toLowerCase() as HttpMethod);
  }

  const { jsonOpts, formOpts, textOpts, xmlOpts } = options;

  return async function bodyParser(ctx: Context, next: Next) {
    // ctx.logger = ctx.logger.child({ stage: 'body-parser' });

    if (options.parsedMethods.includes(ctx.method.toLowerCase() as HttpMethod)) {
      try {
        if (jsonOpts.enable && ctx.is(jsonTypes)) {
          const result = await parse.json(ctx, {
            encoding: options.encoding,
            limit: jsonOpts.limit,
            strict: jsonOpts.strict,
            returnRawBody: false,
          });

          // ctx.logger.debug({ result });

          ctx.request.body = result;
        } else if (formOpts.enable && ctx.is(formTypes)) {
          const result = await parse.form(ctx, {
            encoding: options.encoding,
            limit: formOpts.limit,
            queryString: formOpts.qsOpts,
            returnRawBody: false,
          });

          ctx.request.body = result;
        } else if (textOpts.enable && ctx.is(textTypes)) {
          // parse text data
        } else if (xmlOpts.enable && ctx.is(xmlTypes)) {
          // parse xml data
        }
      } catch (err) {
        ctx.logger.error(err);
        // TODO support custom error handler
        throw err;
      }
    }

    await next();
  };
}

declare module 'koa' {
  interface Request extends Koa.BaseRequest {
    body?: any;
  }
}

export interface Options {
  parsedMethods: HttpMethod[];
  encoding: string;
  jsonOpts: JsonOpts;
  formOpts: FormOpts;
  textOpts: TextOpts;
  xmlOpts: XmlOpts;
}

export type EnabledTypes = ('json' | 'form' | 'text' | 'xml')[];

interface BaseParseOptions {
  enable: boolean;
  limit: string; // '1mb' for json, '56kb' for form-urlencoded
}

export interface JsonOpts extends BaseParseOptions {
  strict: boolean; // only parse array and object, default is true
}

export interface TextOpts extends BaseParseOptions {}

export interface FormOpts extends BaseParseOptions {
  qsOpts: qs.IParseOptions; // qs module parse options
}

export interface XmlOpts extends BaseParseOptions {}
