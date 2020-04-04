"use strict";
module.exports = (ctx) => {
    return ctx.ok(ctx.state.custom);
};
