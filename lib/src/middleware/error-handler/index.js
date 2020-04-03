"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const debug_1 = __importDefault(require("debug"));
const log = debug_1.default('nico:err');
module.exports = () => {
    return async (ctx, next) => {
        try {
            await next();
        }
        catch (err) {
            log(err);
            return ctx.ok(undefined, err.message, false);
        }
    };
};
