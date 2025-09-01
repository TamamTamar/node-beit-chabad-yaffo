// src/db/models/setting.ts
import { Schema, model } from "mongoose";
import { ISetting } from "../../@types/chabad";



export const SettingSchema = new Schema<ISetting>({
    key: { type: String, required: true, unique: true, index: true },
    value: { type: String, required: true },
    updatedBy: { type: String, required: false },
}, { timestamps: true });

