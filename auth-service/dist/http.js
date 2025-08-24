"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHttpServerInstance = getHttpServerInstance;
exports.startHttpServer = startHttpServer;
const http_1 = require("http");
const express_1 = require("./express");
let httpServer = null;
function getHttpServerInstance() {
    if (!httpServer) {
        const app = (0, express_1.getExpressApp)();
        httpServer = (0, http_1.createServer)(app);
    }
    return httpServer;
}
function startHttpServer() {
    var _a;
    const server = getHttpServerInstance();
    const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : "5000";
    server.listen(PORT, () => {
        console.log(`Listening HTTP Server at http://localhost:${PORT}`);
    });
}
