"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const ioredis_1 = __importDefault(require("ioredis"));
module.exports = class Redis {
    constructor() {
        this.url = '';
        this.redis = new ioredis_1.default();
    }
    init(url) {
        this.url = url;
    }
    async connect() {
        if (this.url) {
            this.redis = new ioredis_1.default(this.url);
        }
    }
    async disconnect() {
        if (this.redis) {
            this.redis.disconnect();
        }
    }
};
