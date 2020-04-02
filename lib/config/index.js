"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const datastores_1 = __importDefault(require("./datastores"));
const routes_1 = __importDefault(require("./routes"));
const custom_1 = __importDefault(require("./custom"));
const security_1 = __importDefault(require("./security"));
const serve_1 = __importDefault(require("./serve"));
const responses_1 = __importDefault(require("./responses"));
const config = {
    datastores: datastores_1.default,
    routes: routes_1.default,
    custom: custom_1.default,
    security: security_1.default,
    serve: serve_1.default,
    responses: responses_1.default
};
module.exports = config;
