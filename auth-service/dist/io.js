"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketInstance = getSocketInstance;
exports.createSocketNamespace = createSocketNamespace;
const socket_io_1 = require("socket.io");
const http_1 = require("./http");
let io = null;
function getSocketInstance() {
    if (!io) {
        const httpServer = (0, http_1.getHttpServerInstance)();
        io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });
    }
    return io;
}
function createSocketNamespace(namespace) {
    const io = getSocketInstance();
    return io.of(namespace);
}
