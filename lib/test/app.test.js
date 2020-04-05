"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const joi_1 = __importDefault(require("../utils/joi"));
const ok = function (data, message, success = true) {
    this.body = {
        success,
        data,
        message
    };
};
beforeAll(async () => {
    await index_1.default.init({
        custom: {
            APP_NAME: 'nico'
        },
        responses: {
            ok
        },
        routes: {
            'GET /nico': {
                controller: (ctx) => {
                    return ctx.ok(ctx.state.custom);
                },
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
                        name: joi_1.default.string().trim().required()
                    })
                }
            }
        }
    });
});
test('Basic test', async () => {
    const response = await supertest_1.default(index_1.default.app.callback()).get('/nico');
    const response2 = await supertest_1.default(index_1.default.app.callback()).post('/nico').send({
        name: 'nico'
    });
    expect(response.body.data.APP_NAME).toEqual('nico');
    expect(response2.body.data).toEqual('nico');
});
