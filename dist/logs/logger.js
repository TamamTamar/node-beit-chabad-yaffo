"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs_1 = __importDefault(require("fs"));
class Logger {
    static error(message) {
        if (this.isProd()) {
            fs_1.default.appendFile("logs.txt", message.toString() + "\n", () => { });
            return;
        }
        ;
        console.error(message);
    }
    static log(message) {
        if (this.isProd()) {
            fs_1.default.appendFile("logs.txt", message.toString() + "\n", () => { });
            return;
        }
        console.log(message);
    }
    static verbose(message) {
    }
}
exports.Logger = Logger;
Logger.isProd = () => process.env.NODE_ENV === "prod";
