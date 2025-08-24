"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("./express");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("express");
const http_1 = require("./http");
const chatSocket_1 = require("./sockets/chatSocket");
dotenv_1.default.config({ path: "./.env.local" });
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.getExpressApp)();
        //body parser
        app.use((0, cors_1.default)());
        app.use((0, express_2.urlencoded)({ extended: false }));
        app.use((0, express_2.json)());
        //sockets
        (0, chatSocket_1.startChatSocket)();
        //server
        (0, http_1.startHttpServer)();
    });
}
init();
