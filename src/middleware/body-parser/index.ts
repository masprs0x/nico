import parse from 'co-body';
import Koa from 'koa';
import { Fields, Files, IncomingForm } from 'formidable';

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
const multipartTypes = ['multipart/form-data'];

export default function getBodyParser(opts: Partial<Options> = {}) {
  // encoding supported by iconv-lite
  const encoding = 'utf-8';
  const parsedMethods: HttpMethod[] = ['post', 'put', 'patch'];

  const options: Options = {
    parsedMethods,
    encoding: opts.encoding ?? encoding,
    includeRawBody: false,
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
      limit: '1mb',
      ...opts.textOpts,
    },
    xmlOpts: {
      enable: false,
      limit: '1mb',
      ...opts.xmlOpts,
    },
    multipartOpts: {
      enable: false,
      multiples: false,
      ...opts.multipartOpts,
    },
  };

  if (opts.parsedMethods) {
    options.parsedMethods = opts.parsedMethods.map((o) => o.toLowerCase() as HttpMethod);
  }

  if (typeof opts.includeRawBody === 'boolean') {
    options.includeRawBody = opts.includeRawBody;
  }

  const { jsonOpts, formOpts, textOpts, xmlOpts, multipartOpts } = options;

  return async function bodyParser(ctx: Context, next: Next) {
    if (ctx.logger) {
      ctx.logger = ctx.logger?.child({ stage: 'nico.routeMiddleware.bodyParser' });
    }

    ctx?.logger?.trace({
      method: ctx.request.method,
      contentType: ctx.get('content-type'),
      message: 'hit body parser',
    });

    if (options.parsedMethods.includes(ctx.method.toLowerCase() as HttpMethod)) {
      try {
        if (multipartOpts.enable && ctx.is(multipartTypes)) {
          const result = await parseMultipart(ctx);

          ctx.request.body = result.fields;
          ctx.request.files = result.files;
        } else {
          const result = await parseBody(ctx);

          if (options.includeRawBody) {
            ctx.request.body = result?.parsed ?? {};
            ctx.request.rawBody = result?.raw;
          } else {
            ctx.request.body = result ?? {};
          }
        }
      } catch (err) {
        ctx?.logger?.error(err);
        // TODO support custom error handler
        throw err;
      }
    }

    await next();
  };

  async function parseBody(ctx: Context) {
    if (jsonOpts.enable && ctx.is(jsonTypes)) {
      return parse.json(ctx, {
        encoding: options.encoding,
        limit: jsonOpts.limit,
        strict: jsonOpts.strict,
        returnRawBody: options.includeRawBody,
      });
    }

    if (formOpts.enable && ctx.is(formTypes)) {
      return parse.form(ctx, {
        encoding: options.encoding,
        limit: formOpts.limit,
        queryString: formOpts.qsOpts,
        returnRawBody: options.includeRawBody,
      });
    }

    if (textOpts.enable && ctx.is(textTypes)) {
      return parse.text(ctx, {
        encoding: options.encoding,
        limit: options.textOpts.limit,
        returnRawBody: options.includeRawBody,
      });
    }

    if (xmlOpts.enable && ctx.is(xmlTypes)) {
      return parse.text(ctx, {
        encoding: options.encoding,
        limit: options.xmlOpts.limit,
        returnRawBody: options.includeRawBody,
      });
    }

    return {};
  }

  async function parseMultipart(ctx: Context): Promise<{ fields: Fields; files: Files }> {
    return new Promise((resolve, reject) => {
      const form = new IncomingForm();

      const files: any = {};
      const fields: any = {};

      form
        .on('end', function onEnd() {
          return resolve({
            files,
            fields,
          });
        })
        .on('error', function onError(err: Error) {
          return reject(err);
        })
        .on('field', function onFields(field: string, value: any) {
          // TODO check max fields
          if (fields[field]) {
            if (Array.isArray(fields[field])) {
              fields[field].push(value);
            } else {
              fields[field] = [fields[field], value];
            }
          } else {
            fields[field] = value;
          }
        })
        .on('file', function onFile(field: string, file: any) {
          // TODO check multiples
          if (files[field]) {
            if (Array.isArray(files[field])) {
              files.push(file);
            } else {
              files[field] = [files[field], file];
            }
          } else {
            files[field] = file;
          }
        });

      form.parse(ctx.req);
    });
  }
}

declare module 'koa' {
  interface Request extends Koa.BaseRequest {
    body?: any;
    rawBody?: string;
    files?: Files;
  }
}

export interface Options {
  parsedMethods: HttpMethod[];
  includeRawBody: boolean;
  encoding: string;
  jsonOpts: JsonOpts;
  formOpts: FormOpts;
  textOpts: TextOpts;
  xmlOpts: XmlOpts;
  multipartOpts: MultipartOpts;
}

interface BaseParseOptions {
  enable?: boolean;
  limit?: string; // '1mb' for json, '56kb' for form-urlencoded
}

export interface MultipartOpts {
  enable?: boolean;
  multiples?: boolean;
}

export interface JsonOpts extends BaseParseOptions {
  strict?: boolean; // only parse array and object, default is true
}

export interface TextOpts extends BaseParseOptions {}

export interface FormOpts extends BaseParseOptions {
  qsOpts?: qs.IParseOptions; // qs module parse options
}

export interface XmlOpts extends BaseParseOptions {}
