import express, { Router } from "express";
import { PaymentDataToSave } from '../@types/chabad';
import { Payment } from '../db/models/PaymentModel';
import { paymentService } from '../services/payment-service';
import { BitService } from "../services/bit-service";



const router = Router();


// handle payment gateway callback
router.post("/payment-callback", express.json(), async (req, res) => {
  try {
    const b = req.body ?? {};
    console.log("Callback data:", JSON.stringify(b, null, 2));

    const statusOk = b.Status === "OK";
    const months = Number.parseInt(String(b.Month ?? "0"), 10) || 0;
    const authorisation = String(b.AuthorisationNumber ?? "");
    const transactionType = String(b.TransactionType ?? "");
    const isHK = /הקמ/.test(transactionType) || months >= 2;

    const amountRaw = Number.parseFloat(String(b.Amount ?? "0")) || 0;

    // שם לקוח – פיצול יציב
    const parts = String(b.ClientName ?? "").trim().split(/\s+/);
    const firstName = parts.shift() ?? "";
    const lastName = parts.join(" ");

    // סטטוס פנימי
    let resultStatus: "HK_SETUP_OK" | "CHARGE_OK" | "DECLINED";
    if (!statusOk) {
      resultStatus = "DECLINED";
    } else if (isHK) {
      resultStatus = "HK_SETUP_OK"; // בהקמה אין אישור סליקה עדיין
    } else {
      resultStatus = authorisation ? "CHARGE_OK" : "DECLINED";
    }

    // מיפוי לשדות השמירה:
    // HK: Amount = חודשי, Tashlumim = מספר חודשים
    // Ragil: Amount = כולל, Tashlumim = מתיבת הספק (אם קיימת)
    const tashlumimRagil =
      Number.parseInt(String(b.Tashlumim ?? b.Tashloumim ?? 1), 10) || 1;

    const amountToSave = amountRaw;
    const tashlumimToSave = isHK ? (months || 1) : tashlumimRagil;

    const doc: PaymentDataToSave = {
      FirstName: firstName,
      LastName: lastName,
      Phone: String(b.Phone ?? ""),
      Amount: amountToSave,     // ב-HK זה חודשי, ברגיל זה כולל
      Tashlumim: tashlumimToSave,
      lizchut: "",
      Comments: String(b.Comments ?? ""),
      ref: extractRefFromComment(String(b.Comments ?? "")),
    };

    // (אופציונלי) אם יש לך שדות נוספים בסכמה, מומלץ לשמור מידע עוזר:
    // doc.IsHK = isHK;
    // doc.HKTotalPlanned = isHK ? amountRaw * tashlumimToSave : undefined;
    // doc.NextDate = b.NextDate; // "08/09/2025" - לשקול פרסינג ל-ISO
    // doc.ExternalId = b.ID;     // "1910386" - למניעת כפילויות

    const payment = new Payment(doc);
    await payment.save();

    console.log(
      `✅ processed: ${isHK ? "HK (setup)" : "Ragil"}, monthly=${isHK ? amountRaw : "-"}, months=${isHK ? tashlumimToSave : "-"}, status=${resultStatus}`
    );
    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ payment-callback error:", err);
    // אם הספק דורש תמיד 200 - השאירי כך
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





// server: payment-router.ts
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
