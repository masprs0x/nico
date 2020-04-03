"use strict";
module.exports = (config) => {
    return async (ctx, next) => {
        ctx.state.custom = config.custom;
        await next();
    };
};
