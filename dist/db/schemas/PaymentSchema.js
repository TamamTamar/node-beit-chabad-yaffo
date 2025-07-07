"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.PaymentSchema = new mongoose_1.default.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Phone: { type: String, required: false },
    Amount: { type: Number, required: true },
    Tashlumim: { type: Number, required: true },
    lizchut: { type: String },
    Comments: { type: String, required: true },
    ref: { type: String },
}, { timestamps: true });
