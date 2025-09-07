// src/services/settings-service.ts
import Setting from "../db/models/settingModel";

const KEY = "donationsStartDate";

// עזר: מפתח יעד לפי ref (נורמליזציה ל-lowercase)
const keyForRefGoal = (ref: string) => `goal.ref.${String(ref || "").trim().toLowerCase()}`;

// עזר: המרת ערך למספר תקין (מקבל גם "₪90,000")
const toNumber = (v: unknown): number => {
    const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
};

export const settingsService = {
    // === מה שהיה לך ===
    getDonationsStartDate: async (): Promise<Date> => {
        const doc = await Setting.findOne({ key: KEY });
        return doc ? new Date(doc.value) : new Date("1970-01-01T00:00:00Z");
    },

    setDonationsStartDate: async (dateISO: string, updatedBy?: string) => {
        const d = new Date(dateISO);
        if (isNaN(d.getTime())) throw new Error("Invalid ISO date string");
        const update: Record<string, any> = { value: d.toISOString() };
        if (updatedBy) update.updatedBy = updatedBy;
        return Setting.findOneAndUpdate({ key: KEY }, update, { upsert: true, new: true });
    },

    // === חדש: יעדים לפי ref ===

    // שליפת יעד ל-ref (case-insensitive)
    getRefGoal: async (ref: string): Promise<number> => {
        const k = keyForRefGoal(ref);
        const doc = await Setting.findOne({ key: k }).lean();
        return toNumber(doc?.value);
    },

    // קביעת יעד יחיד ל-ref
    setRefGoal: async (ref: string, goal: number | string, updatedBy?: string) => {
        const k = keyForRefGoal(ref);
        const v = String(toNumber(goal));
        const update: Record<string, any> = { value: v };
        if (updatedBy) update.updatedBy = updatedBy;
        return Setting.findOneAndUpdate({ key: k }, { $set: update }, { upsert: true, new: true });
    },

    // שליפת כל היעדים כ־map { dl: 50000, team-a: 120000, ... }
    getAllRefGoals: async (): Promise<Record<string, number>> => {
        const docs = await Setting.find({ key: /^goal\.ref\./i }).lean();
        const out: Record<string, number> = {};
        for (const d of docs) {
            const refKey = String(d.key).replace(/^goal\.ref\./i, "");
            out[refKey] = toNumber(d.value);
        }
        return out;
    },

    // עדכון מרוכז של כמה יעדים
    setRefGoalsBulk: async (
        goals: Record<string, number | string>,
        updatedBy?: string
    ) => {
        const ops = Object.entries(goals || {}).map(([ref, g]) => ({
            updateOne: {
                filter: { key: keyForRefGoal(ref) },
                update: { $set: { value: String(toNumber(g)), ...(updatedBy ? { updatedBy } : {}) } },
                upsert: true,
            },
        }));
        if (!ops.length) return { ok: true, matched: 0, modified: 0, upserted: 0 };
        const res = await Setting.bulkWrite(ops);
        return { ok: true, result: res };
    },
};
// עזר: המרת ערך למספר תקין (מקבל גם "₪90,000")