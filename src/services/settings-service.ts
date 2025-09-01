// src/services/settings-service.ts

import Setting from "../db/models/settingModel";


const KEY = "donationsStartDate";

export const settingsService = {
    async getDonationsStartDate(): Promise<Date> {
        const doc = await Setting.findOne({ key: KEY });
        return doc ? new Date(doc.value) : new Date("1970-01-01T00:00:00Z");
    },

    async setDonationsStartDate(dateISO: string, updatedBy?: string) {
        // אימות קצר: חייב להיות תאריך ISO תקין
        const d = new Date(dateISO);
        if (isNaN(d.getTime())) {
            throw new Error("Invalid ISO date string");
        }
        const update = { value: d.toISOString(), updatedBy };
        return Setting.findOneAndUpdate({ key: KEY }, update, { upsert: true, new: true });
    },
};
