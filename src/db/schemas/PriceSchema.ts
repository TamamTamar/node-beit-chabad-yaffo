import mongoose from "mongoose";
import { prices } from "../../@types/chabad";

export const PriceSchema = new mongoose.Schema<prices>({
    adultPrice: { type: Number, required: true },
    childPrice: { type: Number, required: true },
    couplePrice: { type: Number, required: true },
}, { timestamps: true });



