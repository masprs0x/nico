"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("@koa/router"));
const koa_static_1 = __importDefault(require("koa-static"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./middleware/routes"));
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
const responses_1 = __importDefault(require("./middleware/responses"));
const config_1 = __importDefault(require("./config"));
const custom_handler_1 = __importDefault(require("./middleware/custom-handler"));
const cors_1 = __importDefault(require("./middleware/cors"));
const utility_1 = require("./utils/utility");
class Nico {
    constructor() {
        this.app = new koa_1.default();
    }
    async init(inputConfig = {}) {
        const config = utility_1.deepmerge(config_1.default, inputConfig);
        const app = this.app;
        app.use(responses_1.default(config.responses));
        app.use(error_handler_1.default());
        app.use(cors_1.default(config.security));
        app.use(koa_static_1.default(path_1.default.resolve(process.cwd(), './assets'), config.serve));
        app.use(custom_handler_1.default(config.custom));
        const router = new router_1.default();
        app.use(routes_1.default(router, config.routes, config.routerPrefix));
        app.use(router.routes()).use(router.allowedMethods());
        return app;
    }
}
module.exports = new Nico();
