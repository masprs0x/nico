"use strict";
const db_1 = require("../../utils/db");
module.exports = (app, config) => {
    const db = new db_1.DB(config);
    app.db = db;
    return async (ctx, next) => {
        if (db.redis) {
            ctx.redis = db.redis;
        }
        await next();
    };
};
