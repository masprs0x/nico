"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const joi_1 = __importDefault(require("@hapi/joi"));
module.exports = {
    'GET /nico': {
        controller: require('../api/controllers/get'),
        policies: true
    },
    'POST /nico': {
        controller: (ctx) => {
            const body = ctx.state.body;
            return ctx.ok(body.name);
        },
        bodyParser: true,
        validate: {
            body: joi_1.default.object({
                name: joi_1.default.string()
            })
        }
    }
};
