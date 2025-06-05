import mongoose from "mongoose";
import { PaymentDataToSave } from "../../@types/chabad";


export const PaymentSchema = new mongoose.Schema<PaymentDataToSave>({
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Phone: { type: String, required: false },
  Amount: { type: Number, required: true },
  Tashlumim: { type: Number, required: false, default: 12 }, // ברירת מחדל ל-1 אם לא נמסר
  createdAt: { type: Date, default: Date.now },
  lizchut: { type: String, required: false }
}, {
  timestamps: true,

});