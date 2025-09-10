import mongoose from "mongoose";
import { PaymentDataToSave } from "../../@types/chabad";

export const PaymentSchema = new mongoose.Schema<PaymentDataToSave>({
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Phone: { type: String, required: false },
  Mail: { type: String, required: false }, // ← חדש (נוח להצגה/חיפוש)

  // שימי לב: Amount נשמר "לפי תקופה" (לתשלום אחד/חודש).
  Amount: { type: Number, required: true },
  // Tashlumim = מספר התקופות (מס' תשלומים/מס' חודשים בהו״ק)
  Tashlumim: { type: Number, required: true },

  // סכום מנורמל לסיכומים/דאשבורדים: תמיד Amount * Tashlumim,
  // למעט HK ללא הגבלת חודשים—שם נשמור Amount בלבד (תקופה אחת).
  NormalizedTotal: { type: Number, required: true }, // ← חדש

  // אינפורמטיבי בלבד (לא חובה לוגית)
  IsHK: { type: Boolean, default: false }, // ← חדש
  TransactionType: { type: String },                  // ← חדש (לוגים/דוחות)
  AuthorisationNumber: { type: String },              // ← חדש (Confirmation/Authorisation)
  ExternalId: { type: String },                  // ← חדש (b.ID)
  MasofId: { type: String },                  // ← חדש (Online וכו')
  NextDate: { type: String },                  // ← חדש (אם רלוונטי)

  lizchut: { type: String },
  Comments: { type: String, required: true, default: "", alias: "Comment" },
  ref: { type: String },
}, { timestamps: true });

// מומלץ: אינדקס ייחודי רך למניעת כפילויות מהקאלבק (אם מגיע b.ID + MasofId)
PaymentSchema.index({ ExternalId: 1, MasofId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Payment", PaymentSchema);
