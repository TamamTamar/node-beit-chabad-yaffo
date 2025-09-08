import mongoose from "mongoose";
import { PaymentDataToSave } from "../../@types/chabad";

export const PaymentSchema = new mongoose.Schema<PaymentDataToSave>(
  {
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Phone: { type: String, required: false },
    Mail: { type: String, required: false }, // אופציונלי
    Amount: { type: Number, required: true },
    Tashlumim: { type: Number, required: true },
    lizchut: { type: String },
    Comments: { type: String, required: true, default: "", alias: "Comment" },
    ref: { type: String },

    // חדש: תצוגה אנונימית
    DisplayAsAnonymous: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

// וירטואל להצגת שם ציבורי (לא נשמר בבסיס הנתונים)
PaymentSchema.virtual("PublicName").get(function (this: PaymentDataToSave) {
  if (this.DisplayAsAnonymous) return "תורם/ת אנונימי/ת";
  const fn = this.FirstName?.trim() || "";
  const ln = this.LastName?.trim() || "";
  return `${fn} ${ln}`.trim();
});

// בדיפולט בעת המרה ל-JSON לכלול וירטואלים (אם תרצי להשתמש בהם ישירות בממשק)
PaymentSchema.set("toJSON", { virtuals: true });
PaymentSchema.set("toObject", { virtuals: true });

// (אופציונלי) אינדקס על ref לתצוגות לפי ref
PaymentSchema.index?.({ ref: 1, createdAt: -1 });

