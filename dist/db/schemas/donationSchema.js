"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.donationSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.donationSchema = new mongoose_1.default.Schema({
    TransactionId: { type: String, unique: true },
    ClientName: String,
    Amount: Number,
    TransactionType: String,
    TransactionTime: String,
    Groupe: String,
    Tashloumim: Number,
    NextTashloum: Number,
    // כל שדה שרלוונטי לך
}, { timestamps: true });
