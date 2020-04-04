"use strict";
module.exports = (custom) => {
    return async (ctx, next) => {
        ctx.state.custom = custom;
        await next();
    };
};
