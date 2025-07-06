import mongoose from "mongoose";
import { PaymentDataToSave } from "../../@types/chabad";


export const PaymentSchema = new mongoose.Schema<PaymentDataToSave>({
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Phone: { type: String, required: false },
  Amount: { type: Number, required: true },
  Tashlumim: { type: Number, required: false, default: 12 },
  lizchut: { type: String, required: false },
  Comments: { type: String, required: true },
  ref: { type: String, required: false }, // כדאי להוסיף כדי לשמור את מזהה המתרים
}, {
  timestamps: true, // יוצר createdAt ו-updatedAt אוטומטית
});
