import mongoose from 'mongoose';
import { RishumShabbatType } from '../../@types/@types';

export const ShabbatSchema = new mongoose.Schema<RishumShabbatType>({
    parasha: { type: String, required: true },
    date: { type: String, required: true },
    totalPrice: { type: Number, required: true }, // מחיר כולל
    name: { type: String, required: true }, // שם המזמין
    phone: { type: String, required: true }, // טלפון - שדה אופציונלי
    people: 
        {
            adults: {
                quantity: { type: Number, required: true }, // כמות מבוגרים
                price: { type: Number, required: true }, // מחיר למבוגרים
            },
            children: {
                quantity: { type: Number, required: true }, // כמות ילדים
                price: { type: Number, required: true }, // מחיר לילדים
            },
        },
    createdAt: { type: Date, default: Date.now },
});