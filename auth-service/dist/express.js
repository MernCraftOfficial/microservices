"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpressApp = getExpressApp;
exports.startExpressAppServer = startExpressAppServer;
const express_1 = __importDefault(require("express"));
let app = null;
function getExpressApp() {
    if (!app) {
        app = (0, express_1.default)();
    }
    return app;
}
function startExpressAppServer() {
    var _a;
    const app = getExpressApp();
    const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : "5000";
    app.listen(PORT !== null && PORT !== void 0 ? PORT : 5000, () => {
        console.log(`Listening Express Server at http://localhost:${PORT}`);
    });
}
