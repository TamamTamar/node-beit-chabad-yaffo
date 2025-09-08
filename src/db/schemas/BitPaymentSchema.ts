import mongoose from "mongoose";
import { IBitPayment } from "../../@types/bit";

export const BitPaymentSchema = new mongoose.Schema<IBitPayment>(
    {
        param2: { type: String, required: true, unique: true, index: true },
        status: { type: String, enum: ["pending", "paid", "error"], default: "pending" },
        amount: { type: Number },
        nedarimId: { type: String },
        clientName: { type: String },
        phone: { type: String },
        mail: { type: String },
        comment: { type: String },
        ref: { type: String },
        raw: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);
