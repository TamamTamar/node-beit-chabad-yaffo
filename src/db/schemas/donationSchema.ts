import mongoose from 'mongoose';

export const donationSchema = new mongoose.Schema({
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

