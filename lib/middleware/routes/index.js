"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const koa_body_1 = __importDefault(require("koa-body"));
const debug_1 = __importDefault(require("debug"));
const log = debug_1.default('nico:route');
module.exports = function (router, config, routerPrifix) {
    const prefix = routerPrifix !== null && routerPrifix !== void 0 ? routerPrifix : '';
    router.prefix(prefix);
    Object.entries(config).map(([key, value]) => {
        const { controller, policies = true, bodyParser = false, validate = {} } = value;
        const [methodStr, ...route] = key.split(' ');
        const method = methodStr.toLowerCase();
        const testMethod = /^(get|post|delete|put|patch)$/;
        if (!testMethod.test(method)) {
            console.error('E_ROUTES_INVALID_HTTP_METHOD: ', key);
            return;
        }
        let middlewares = [];
        if (typeof policies === 'boolean') {
            if (!policies) {
                middlewares.push((ctx, next) => {
                    ctx.status = 400;
                    ctx.body = 'Route is disabled';
                    return ctx;
                });
            }
        }
        else if (Array.isArray(policies)) {
            middlewares = [...policies];
        }
        if (bodyParser) {
            if (typeof bodyParser === 'boolean' && bodyParser) {
                middlewares.push(koa_body_1.default());
            }
            else {
                middlewares.push(koa_body_1.default({ ...bodyParser }));
            }
        }
        Object.keys(validate).map((key) => {
            const middleware = async (ctx, next) => {
                var _a, _b;
                let value = {};
                if (key === 'params') {
                    value = await ((_a = validate[key]) === null || _a === void 0 ? void 0 : _a.validateAsync(ctx.params));
                    ctx.state.params = value;
                }
                else if (key === 'query' || key === 'body') {
                    value = await ((_b = validate[key]) === null || _b === void 0 ? void 0 : _b.validateAsync(ctx.request[key]));
                    ctx.state[key] = value;
                }
                await next();
            };
            middlewares.push(middleware);
        });
        middlewares.unshift(async (ctx, next) => {
            log(ctx.request.method + ' ' + ctx.request.url.slice(prefix.length));
            await next();
        });
        middlewares.push(async (ctx, next) => {
            const stateKeys = ['params', 'query', 'body'];
            const state = ctx.state;
            stateKeys.map((key) => {
                state[key] && log.extend(key)(state[key]);
            });
            await next();
        });
        router[method](route, ...middlewares, controller);
    });
    return async (ctx, next) => {
        await next();
    };
};
