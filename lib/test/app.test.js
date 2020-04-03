"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const supertest_1 = __importDefault(require("supertest"));
beforeAll(async () => {
    var _a;
    await index_1.default.init({
        datastores: {
            default: {
                type: 'mongo',
                url: 'mongodb://root:admin123@localhost:27017/test?authSource=admin'
            }
        },
        routes: {
            'GET /nico': {
                controller: (ctx) => {
                    return (ctx.body = { data: 'nico nico ni' });
                },
                policies: true
            }
        }
    });
    await ((_a = index_1.default.db) === null || _a === void 0 ? void 0 : _a.connect());
});
afterAll(async () => {
    var _a;
    await ((_a = index_1.default.db) === null || _a === void 0 ? void 0 : _a.disconnect());
});
test('GET /nico', async () => {
    const response = await supertest_1.default(index_1.default.app.callback()).get('/api/v1/nico');
    expect(response.body.data).toEqual('nico nico ni');
});
