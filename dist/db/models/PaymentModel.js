"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PaymentSchema_1 = require("../schemas/PaymentSchema");
exports.Payment = mongoose_1.default.model("Payment", PaymentSchema_1.PaymentSchema);
