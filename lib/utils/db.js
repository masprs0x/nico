"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
class DB {
    constructor(config) {
        this.config = {
            default: {
                url: ''
            }
        };
        this.config = config;
    }
    async connect() {
        if (this.config.default) {
        }
        if (this.config.cache) {
            const redis = new ioredis_1.default(this.config.cache.url);
            this.redis = redis;
        }
    }
    async disconnect() {
        if (this.config.default) {
        }
        if (this.redis) {
            this.redis.disconnect();
        }
    }
}
exports.DB = DB;
