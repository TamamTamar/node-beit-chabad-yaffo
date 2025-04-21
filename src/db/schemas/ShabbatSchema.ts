import mongoose from 'mongoose';
import { RishumShabbatType } from '../../@types/@types';


export const ShabbatSchema = new mongoose.Schema<RishumShabbatType>({
    parasha: { type: String, required: true },
    date: { type: String, required: true },
    name: { type: String, required: true },
    adult: { type: String, required: true },
    child: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

