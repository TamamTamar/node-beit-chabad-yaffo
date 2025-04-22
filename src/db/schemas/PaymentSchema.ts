import mongoose from "mongoose";
import { PaymentType } from "../../@types/chabad";

export const PaymentSchema = new mongoose.Schema<PaymentType>({
    Mosad: { type: String, required: true },
    ApiValid: { type: String, required: true },
    Zeout: { type: String, required: true },
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Street: { type: String, required: false },
    City: { type: String, required: false },
    Phone: { type: String, required: false },
    Mail: { type: String, required: false },
    PaymentType: { type: String, required: true },
    Amount: { type: Number, required: true },
    Tashlumim: { type: Number, required: true },
    Currency: { type: Number, required: true },
    Groupe: { type: String, required: false },
    Comment: { type: String, required: false },
    CallBack: { type: String, required: true },
    CallBackMailError: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});