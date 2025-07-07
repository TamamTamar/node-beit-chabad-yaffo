"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MyErrors {
    constructor(status, message) {
        this.status = status;
        this.message = message;
        this.date = new Date();
    }
}
exports.default = MyErrors;
