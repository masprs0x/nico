"use strict";
const User_1 = require("../models/User");
module.exports = async (ctx) => {
    const name = ctx.state.body.name;
    const user = await User_1.User.create({
        name
    });
    return ctx.ok(user);
};
