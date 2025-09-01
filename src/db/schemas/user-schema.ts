import { Schema } from "mongoose";
import { IUser } from "../../@types/@types";


const userSchema = new Schema<IUser>(
  {
    name: {
      first: { type: String, required: true, trim: true },
      middle: { type: String, trim: true },
      last: { type: String, required: true, trim: true },
    },
    address: {
      state: { type: String, trim: true },
      country: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      street: { type: String, trim: true },
      houseNumber: { type: Number, min: 0 },
      zip: { type: String, trim: true },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      // לא להגביל ל-max 30 — מיילים חוקיים לעתים ארוכים יותר
      minlength: 6,
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      maxlength: 300,
      select: false, // לא נשלף כברירת מחדל
    },
    phone: { type: String, required: true, minlength: 9, maxlength: 20, trim: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// אינדקס ייחודי על אימייל — מבטיחי שהוא קיים
userSchema.index({ email: 1 }, { unique: true });

export default userSchema;
