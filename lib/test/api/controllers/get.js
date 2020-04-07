"use strict";
const User_1 = require("../models/User");
module.exports = async (ctx) => {
    const users = await User_1.User.find().select('_id name');
    return ctx.ok(users);
};
