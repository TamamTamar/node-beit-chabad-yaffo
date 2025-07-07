"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShabbatSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.ShabbatSchema = new mongoose_1.default.Schema({
    parasha: { type: String, required: true },
    date: { type: String, required: true },
    totalPrice: { type: Number, required: true }, // מחיר כולל
    name: { type: String, required: true }, // שם המזמין
    phone: { type: String, required: true }, // טלפון - שדה אופציונלי
    people: {
        adults: {
            quantity: { type: Number, required: true }, // כמות מבוגרים
            price: { type: Number, required: true }, // מחיר למבוגרים
        },
        children: {
            quantity: { type: Number, required: true }, // כמות ילדים
            price: { type: Number, required: true }, // מחיר לילדים
        },
    },
    createdAt: { type: Date, default: Date.now },
});
