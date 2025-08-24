"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startChatSocket = startChatSocket;
const io_1 = require("../io");
function startChatSocket() {
    const chatSocket = (0, io_1.createSocketNamespace)("/uchat");
    chatSocket.on("connection", (socket) => {
        console.log("Connection!");
        socket.on("disconnect", () => {
            console.log("Disconnected!");
        });
    });
}
