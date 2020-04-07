"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../index"));
const joi_1 = __importDefault(require("../utils/joi"));
const mongo_1 = __importDefault(require("../utils/mongo"));
beforeAll(async () => {
    await index_1.default.init({
        responses: {
            ok: require('./api/responses/ok')
        },
        routes: {
            'GET /user': {
                controller: require('./api/controllers/get'),
                policies: true
            },
            'POST /user': {
                controller: require('./api/controllers/create'),
                bodyParser: true,
                validate: {
                    body: joi_1.default.object({
                        name: joi_1.default.string().trim().required()
                    })
                }
            }
        }
    });
    await mongo_1.default.connect(mongoose_1.default, 'mongodb://root:admin123@localhost:27017/test?authSource=admin');
    await mongoose_1.default.connection.db.dropDatabase();
});
afterAll(async () => {
    await mongo_1.default.disconnect(mongoose_1.default);
});
test('Basic test', async () => {
    const createUser = await supertest_1.default(index_1.default.app.callback()).post('/user').send({ name: 'nico nico ni' });
    const getUsers = await supertest_1.default(index_1.default.app.callback()).get('/user');
    expect(createUser.body.data.name).toEqual('nico nico ni');
    expect(getUsers.body.data[0].name).toEqual('nico nico ni');
});
