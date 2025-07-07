"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.PriceSchema = new mongoose_1.default.Schema({
    adultPrice: { type: Number, required: true },
    childPrice: { type: Number, required: true },
    couplePrice: { type: Number, required: true },
}, { timestamps: true });
