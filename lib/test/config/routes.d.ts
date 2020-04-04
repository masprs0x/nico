/// <reference types="koa" />
/// <reference types="hapi__joi" />
/// <reference types="koa-body" />
import Joi from '@hapi/joi';
declare const _default: {
    'GET /nico': {
        controller: any;
        policies: boolean;
    };
    'POST /nico': {
        controller: (ctx: import("koa").ParameterizedContext<import("koa").DefaultState, import("koa").DefaultContext>) => any;
        bodyParser: boolean;
        validate: {
            body: Joi.ObjectSchema<any>;
        };
    };
};
export = _default;
