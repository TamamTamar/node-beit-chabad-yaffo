import mongoose from "mongoose";
import { PaymentDataToSave } from "../../@types/chabad";


export const PaymentSchema = new mongoose.Schema<PaymentDataToSave>({
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Phone: { type: String, required: false },
  Amount: { type: Number, required: true },
  Tashlumim: { type: Number, required: true },
  lizchut: { type: String },
  Comments: { type: String, required: true },
  ref: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

