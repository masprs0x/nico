"use strict";
module.exports = (responses) => {
    return async (ctx, next) => {
        Object.entries(responses).map(([key, value]) => {
            ctx[key] = value;
        });
        await next();
    };
};
