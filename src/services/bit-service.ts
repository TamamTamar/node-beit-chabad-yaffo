import axios from "axios";
import qs from "qs";
import { randomUUID } from "crypto";
import { CreateBitInput, NedarimBitCreatePayload, BitCallbackPayload } from "../@types/bit";
import BitPayment from "../db/models/BitPayment";

const NEDARIM_ENDPOINT =
    "https://matara.pro/nedarimplus/V6/Files/WebServices/DebitBit.aspx";

const MOSAD_ID = process.env.NEDARIM_MOSAD_ID!;
const API_VALID = process.env.NEDARIM_API_VALID!;
const API_BASE_URL = process.env.API_BASE_URL!;           // לדוגמה: https://api.chabadyafo.org
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL!;     // לדוגמה: https://chabadyafo.org
const NEDARIM_IP = process.env.NEDARIM_IP || "18.194.219.73";

export const BitService = {
    /**
     * יוצר עסקת ביט ומחזיר קישור תשלום + param2
     */
    async createTransaction(input: CreateBitInput) {
        if (!MOSAD_ID || !API_VALID || !API_BASE_URL || !PUBLIC_SITE_URL) {
            throw new Error("Missing env vars for Nedarim/URLs");
        }

        const phoneDigits = input.Phone.replace(/\D/g, "");
        if (!input.FirstName || !input.LastName || !phoneDigits) {
            throw new Error("Missing required donor fields");
        }
        if (!input.Amount || input.Amount <= 0) {
            throw new Error("Amount must be > 0");
        }

        const param2 = `bit_${randomUUID()}`; // מזהה ייחודי לעסקה
        await BitPayment.create({
            param2,
            status: "pending",
            amount: input.Amount,
            clientName: `${input.LastName} ${input.FirstName}`,
            phone: phoneDigits,
            mail: input.Mail || "",
            comment: input.Comment || "",
            ref: input.ref || "",
        });

        const payload: NedarimBitCreatePayload = {
            Action: "CreateTransaction",
            MosadId: MOSAD_ID,
            ApiValid: API_VALID,
            ClientName: `${input.LastName} ${input.FirstName}`,
            Phone: phoneDigits,
            Mail: input.Mail || "",
            Amount: input.Amount.toFixed(2),
            Comment: input.Comment || (input.ref ? `ref:${input.ref}` : ""),
            Groupe: input.Groupe || "",
            Param2: param2,
            UrlSuccess: `${PUBLIC_SITE_URL}/thankyou?m=${encodeURIComponent(param2)}`,
            UrlFailure: `${PUBLIC_SITE_URL}/failed?m=${encodeURIComponent(param2)}`,
            CallBack: `${API_BASE_URL}/api/nedarim/callback/bit`,
        };

        const { data } = await axios.post(
            NEDARIM_ENDPOINT,
            qs.stringify(payload),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 15000 }
        );

        const paymentUrl = typeof data === "string" ? data.trim() : String(data);
        if (!paymentUrl.startsWith("http")) {
            throw new Error("Bad response from Nedarim: " + paymentUrl);
        }

        return { paymentUrl, param2 };
    },

    /**
     * מטפל בקאלבק – אימות IP, עדכון סטטוס למסד
     */
    async handleCallback(remoteIp: string, body: BitCallbackPayload) {
        const ip = (remoteIp || "").replace("::ffff:", "");
        if (ip !== NEDARIM_IP) {
            const err = new Error(`Forbidden IP: ${ip}`);
            (err as any).status = 403;
            throw err;
        }

        const p2 = body.Param2 || "";
        if (!p2) {
            const err = new Error("Callback missing Param2");
            (err as any).status = 400;
            throw err;
        }

        const amount = body.Amount ? Number(body.Amount) : undefined;
        const status: "paid" | "error" = body.Status === "OK" ? "paid" : "error";

        await BitPayment.findOneAndUpdate(
            { param2: p2 },
            {
                status,
                amount,
                nedarimId: body.ID,
                clientName: body.ClientName,
                phone: body.Phone,
                mail: body.Mail,
                comment: body.Comments,
                raw: body,
            },
            { upsert: false }
        );

        return { ok: true };
    },

    /**
     * קריאת סטטוס למסך תודה (פולינג)
     */
    async getStatus(param2: string) {
        const rec = await BitPayment.findOne({ param2 });
        if (!rec) return { status: "pending" as const };
        return { status: rec.status, amount: rec.amount };
    },
};
