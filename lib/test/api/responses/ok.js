"use strict";
module.exports = function (data, message, success = true) {
    this.body = {
        success,
        data,
        message
    };
};
