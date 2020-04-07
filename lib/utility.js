"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = __importDefault(require("./utils/mongo"));
const redis_1 = __importDefault(require("./utils/redis"));
const joi_1 = __importDefault(require("./utils/joi"));
exports.mongo = new mongo_1.default();
exports.redis = new redis_1.default();
exports.Joi = joi_1.default;
