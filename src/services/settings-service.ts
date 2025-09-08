// src/services/settings-service.ts
import Setting from "../db/models/settingModel";

// מפתח תאריך התחלה לתרומות
const DONATIONS_START_KEY = "donationsStartDate";

// יצירת מפתח אחיד לפי ref (בנורמליזציה ל-lowercase)
const toKey = (prefix: "goal" | "name", ref: string) =>
    `${prefix}.ref.${String(ref || "").trim().toLowerCase()}`;

const keyForRefGoal = (ref: string) => toKey("goal", ref);
const keyForRefName = (ref: string) => toKey("name", ref);

// המרת ערך למספר תקין (תומך גם במחרוזות כמו "₪90,000")
const toNumber = (v: unknown): number => {
    const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
};

export const settingsService = {
    // === תאריך התחלה של תרומות ===
    async getDonationsStartDate(): Promise<Date> {
        const doc = await Setting.findOne({ key: DONATIONS_START_KEY }).lean();
        return doc ? new Date(doc.value) : new Date("1970-01-01T00:00:00Z");
    },

    async setDonationsStartDate(dateISO: string, updatedBy?: string) {
        const d = new Date(dateISO);
        if (isNaN(d.getTime())) throw new Error("Invalid ISO date string");

        const update: Record<string, any> = { value: d.toISOString() };
        if (updatedBy) update.updatedBy = updatedBy;

        return Setting.findOneAndUpdate(
            { key: DONATIONS_START_KEY },
            { $set: update },
            { upsert: true, new: true }
        );
    },

    // Alias לנוחות תאימות בצד לקוח
    async getDonationsStart(): Promise<Date> {
        return this.getDonationsStartDate();
    },

    // === יעדים לפי ref ===
    async getRefGoal(ref: string): Promise<number> {
        const k = keyForRefGoal(ref);
        const doc = await Setting.findOne({ key: k }).lean();
        return toNumber(doc?.value);
    },

    async setRefGoal(ref: string, goal: number | string, updatedBy?: string) {
        const k = keyForRefGoal(ref);
        const v = String(toNumber(goal)); // שומר מספר מנורמל כמחרוזת
        const update: Record<string, any> = { value: v };
        if (updatedBy) update.updatedBy = updatedBy;

        return Setting.findOneAndUpdate(
            { key: k },
            { $set: update },
            { upsert: true, new: true }
        );
    },

    async getAllRefGoals(): Promise<Record<string, number>> {
        const docs = await Setting.find({ key: /^goal\.ref\./i }).lean();
        const out: Record<string, number> = {};
        for (const d of docs) {
            const refKey = String(d.key).replace(/^goal\.ref\./i, "");
            out[refKey] = toNumber(d.value);
        }
        return out;
    },

    async setRefGoalsBulk(goals: Record<string, number | string>, updatedBy?: string) {
        const ops = Object.entries(goals || {}).map(([ref, g]) => ({
            updateOne: {
                filter: { key: keyForRefGoal(ref) },
                update: {
                    $set: {
                        value: String(toNumber(g)),
                        ...(updatedBy ? { updatedBy } : {}),
                    },
                },
                upsert: true,
            },
        }));

        if (!ops.length) return { ok: true, matched: 0, modified: 0, upserted: 0 };

        const res = await Setting.bulkWrite(ops);
        return { ok: true, result: res };
    },

    // === שמות ידידותיים לפי ref ===
    async getRefName(ref: string): Promise<string> {
        const k = keyForRefName(ref);
        const doc = await Setting.findOne({ key: k }).lean();
        return String(doc?.value ?? "");
    },

    async setRefName(ref: string, name: string, updatedBy?: string) {
        const k = keyForRefName(ref);
        const update: Record<string, any> = {
            value: String(name || "").trim(),
        };
        if (updatedBy) update.updatedBy = updatedBy;

        return Setting.findOneAndUpdate(
            { key: k },
            { $set: update },
            { upsert: true, new: true }
        );
    },

    async getAllRefNames(): Promise<Record<string, string>> {
        const docs = await Setting.find({ key: /^name\.ref\./i }).lean();
        const out: Record<string, string> = {};
        for (const d of docs) {
            const refKey = String(d.key).replace(/^name\.ref\./i, "");
            out[refKey] = String(d.value ?? "");
        }
        return out;
    },

    // === מטא מאוחד ל-ref (שם + יעד) ===
    async getRefMeta(ref: string): Promise<{ ref: string; goal: number; name: string }> {
        const [goal, name] = await Promise.all([this.getRefGoal(ref), this.getRefName(ref)]);
        return { ref: String(ref || "").trim().toLowerCase(), goal, name };
    },
};

export default settingsService;
