"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const mongoose_1 = __importDefault(require("mongoose"));
class DB {
    constructor(config) {
        this.config = config;
    }
    async connect() {
        var _a, _b, _c;
        if (((_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.default) === null || _b === void 0 ? void 0 : _b.type) === 'mongo' && this.config.default.url) {
            const defaultDB = await mongoose_1.default.connect(this.config.default.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false
            });
            this.default = defaultDB;
        }
        if ((_c = this.config) === null || _c === void 0 ? void 0 : _c.cache) {
            const redis = new ioredis_1.default(this.config.cache.url);
            this.cache = redis;
        }
    }
    async disconnect() {
        if (this.default) {
            await Promise.all(this.default.connections.map(async (connection) => {
                await connection.close();
            }));
        }
        if (this.cache) {
            this.cache.disconnect();
        }
    }
}
exports.DB = DB;
