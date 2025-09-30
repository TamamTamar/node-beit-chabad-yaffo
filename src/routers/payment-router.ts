import express, { Router } from "express";
import { PaymentDataToSave } from '../@types/chabad';
import { Payment } from '../db/models/PaymentModel';
import { paymentService } from '../services/payment-service';
import { BitService } from "../services/bit-service";



const router = Router();


// handle payment gateway callback (Nedarim+)
router.post("/payment-callback", express.json(), async (req, res) => {
  try {
    const b = req.body ?? {};
    console.log("Callback data:", JSON.stringify(b, null, 2));

    // --- עזרי פרסינג ---
    const toNum = (v: unknown): number => {
      const n = Number.parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
      return Number.isFinite(n) ? n : 0;
    };
    const toInt = (v: unknown): number => {
      const n = Number.parseInt(String(v ?? "").replace(/[^\d-]/g, ""), 10);
      return Number.isFinite(n) ? n : 0;
    };

    // --- קריאת שדות מה-callback ---
    const statusOk = String(b.Status ?? "").trim().toUpperCase() === "OK";

    // שימי לב: אצלך ב-logs מגיע Confirmation (לא AuthorisationNumber)
    const authorisation =
      String(b.AuthorisationNumber ?? b.Confirmation ?? "").trim();

    const transactionType = String(b.TransactionType ?? "").trim(); // "רגיל" | "תשלומים" | "הקמת הו\"ק" וכו'
    const comments = String(b.Comments ?? "");
    const phone = String(b.Phone ?? "");
    const mail = String(b.Mail ?? "");
    const amountRaw = toNum(b.Amount); // לפי הדוק: רגיל=סה"כ עסקה, HK=חודשי
    const currency = toInt(b.Currency) || 1; // 1=שקל, 2=דולר
    const firstTashloum = toNum((b as any).FirstTashloum); // בתשלומים בלבד
    const ragilTashlumim =
      toInt((b as any).Tashlumim ?? (b as any).Tashloumim ?? 1) || 1;

    // זיהוי סוג עסקה
    const isHK =
      /HK|הקמ|הו.?ק/i.test(transactionType) || String(b.KevaId ?? "").trim() !== "";

    const isInstallments =
      /תשלומים|installments/i.test(transactionType) || ragilTashlumim > 1;

    // פירוק שם לקוח
    const parts = String(b.ClientName ?? "").trim().split(/\s+/);
    const firstName = parts.shift() ?? "";
    const lastName = parts.join(" ");

    // === לוגיקה אחידה לשמירה בבסיס נתונים ===
    // החלטה עקרונית: תמיד שומרים Amount כ"תשלום לתקופה" (לתשלום אחד/למשל חודש),
    // ושומרים NormalizedTotal לסיכומים כוללים כדי למנוע בלבול בצד ה-UI.

    let amountPerPeriod = 0;
    let periods = 1; // כמה "תקופות" (תשלומים/חודשים) הטרנזקציה כוללת
    let normalizedTotal = 0;

    if (isHK) {
      // HK: על פי התיעוד Amount = סכום חודשי; מספר חודשים ב-Tashlumim (או ריק=ללא הגבלה)
      const months = toInt((b as any).Tashlumim ?? (b as any).Month ?? 0); // אם "ללא הגבלה" יגיע ריק/0
      amountPerPeriod = amountRaw; // חודשי
      periods = months > 0 ? months : 1; // אם ללא הגבלה — שומרים 1, כדי לא לנפח
      normalizedTotal = months > 0 ? amountPerPeriod * periods : amountPerPeriod; // אם לא ידוע חודשים, לא לכפול
    } else if (isInstallments) {
      // רגיל בתשלומים: לפי התיעוד Amount = סה"כ עסקה, Tashlumim=מס' תשלומים
      periods = ragilTashlumim;
      // אם FirstTashloum קיים (כמו בלוגים שלך) נעדיף אותו לתשלום בודד;
      // אחרת נחלק את הסכום הכולל.
      amountPerPeriod =
        firstTashloum > 0 ? firstTashloum : Math.round((amountRaw / periods) * 100) / 100;

      normalizedTotal = amountRaw; // סה"כ העסקה
    } else {
      // רגיל חד-פעמי: Amount = סה"כ עסקה, Tashlumim=1
      periods = 1;
      amountPerPeriod = amountRaw; // תשלום יחיד
      normalizedTotal = amountRaw;
    }

    // סטטוס פנימי (לוגים בלבד)
    let resultStatus: "OK" | "DECLINED";
    resultStatus = statusOk && authorisation ? "OK" : "DECLINED";

    // הכנת דוק לשמירה
    const doc: PaymentDataToSave = {
      FirstName: firstName,
      LastName: lastName,
      Phone: phone,
      Mail: mail,
      // לשמור Amount תמיד "לפי תקופה" כדי להיות עקביים
      Amount: amountPerPeriod,
      // Tashlumim = מספר התקופות (חודשים ב-HK | מספר תשלומים בתשלומים | 1 בחד-פעמי)
      Tashlumim: periods,
      lizchut: "",
      Comments: comments,
      ref: extractRefFromComment(comments),
      currency: currency,
      IsHK: isHK,
      NormalizedTotal: normalizedTotal, // זה מה שמסכמים בצד שרת/UI
      TransactionType: transactionType,
      AuthorisationNumber: authorisation,
      ExternalId: String(b.ID ?? ""),  // מומלץ לשמירת מניעת כפילויות
      MasofId: String(b.MasofId ?? ""),
      NextDate: String((b as any).NextDate ?? ""),
    };

    const payment = new Payment(doc);
    await payment.save();

    console.log(
      `✅ processed: ${isHK ? "HK" : isInstallments ? "Ragil/Installments" : "Ragil/One-Time"}, perPeriod=${amountPerPeriod}, periods=${periods}, total=${normalizedTotal}, status=${resultStatus}`
    );

    // חלק מהספקים דורשים תמיד 200
    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ payment-callback error:", err);
    res.status(200).send("OK");
  }
});



// Extract ref from comments, e.g., "ref: XYZ123"
const extractRefFromComment = (comments?: string): string | null => {
  const match = comments?.match(/ref:\s?(\w+)/i);
  return match?.[1] || null;
};



//save payment data to DB
router.post("/nedarim/save", async (req, res) => {
  try {
    const data = req.body as PaymentDataToSave;
    const payment = await paymentService.savePayment(data);

    console.log("Payment data saved successfully:" + JSON.stringify(payment, null, 2));

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error handling callback:", error);
    res.status(500).send("Internal Server Error" + error);
  }
});

//get all payments (public view)
router.get("/nedarim/payments", async (req, res) => {
  try {
    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .lean({ virtuals: true }); // מוסיף את ה־virtual PublicName

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payments found" });
    }

    return res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch payments: " + error.message });
  }
});


// get donations summary grouped by ref
router.get("/donations-by-ref", async (req, res) => {
  try {
    const result = await Payment.aggregate([
      // מחשבים סכום שורה: Amount * Tashlumim (ברירת מחדל 1)
      {
        $project: {
          ref: { $ifNull: ["$ref", "ללא מזהה"] },
          totalLine: {
            $multiply: [
              { $toDouble: { $ifNull: ["$Amount", 0] } },
              { $toInt: { $ifNull: ["$Tashlumim", 1] } }
            ]
          }
        }
      },
      // אגרגציה לפי ref
      {
        $group: {
          _id: "$ref",
          totalAmount: { $sum: "$totalLine" },
          donationCount: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json(
      result.map(item => ({
        ref: item._id,
        totalAmount: item.totalAmount,
        donationCount: item.donationCount
      }))
    );
  } catch (error) {
    console.error("שגיאה בשליפת תרומות לפי ref:", error);
    res.status(500).send("שגיאה בשרת");
  }
});





// get all donations with specific ref (case-insensitive)
router.get("/donations/:ref", async (req, res, next) => {
  try {
    const ref = String(req.params.ref || "").trim();

    // חיפוש case-insensitive כדי לתמוך ב-DL/dl/Dl וכו'
    const esc = ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const docs = await Payment
      .find({ ref: new RegExp(`^${esc}$`, "i") })
      .sort({ createdAt: -1 })
      .lean();

    // תמיד מחזירים 200 עם מערך (גם אם ריק)
    return res.json(docs);
  } catch (e) { next(e); }
});
router.get("/status", async (req, res) => {
  try {
    const m = String(req.query.m || "");
    if (!m) return res.status(400).json({ error: "Missing m" });

    const data = await BitService.getStatus(m);
    res.json(data); // { status: "pending"|"paid"|"error", amount? }
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed" });
  }
});





export { router as paymentRouter };
