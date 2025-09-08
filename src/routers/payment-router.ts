import express, { Router } from "express";
import { PaymentDataToSave } from '../@types/chabad';
import { Payment } from '../db/models/PaymentModel';
import { paymentService } from '../services/payment-service';



const router = Router();

//handle payment gateway callback
// handle payment gateway callback
router.post("/payment-callback", express.json(), async (req, res) => {
  try {
    const b = req.body || {};
    console.log("Callback data:", JSON.stringify(b, null, 2));

    const statusOk = b.Status === "OK";
    const months = parseInt(String(b.Month ?? "0"), 10) || 0;
    const authorisation = String(b.AuthorisationNumber || "");

    // זיהוי HK: טקסט ההקמה או יותר מחודש אחד
    const isHK =
      (typeof b.TransactionType === "string" && b.TransactionType.includes("הקמת")) ||
      months >= 2;

    // מיפוי תשלומים (ב-Ragil ייתכן ששדה יגיע כ-Tashlumim/‏Tashloumim)
    const tashlumim =
      isHK
        ? 1
        : parseInt(String(b.Tashlumim ?? b.Tashloumim ?? 1), 10) || 1;

    // סכום: ב-HK זה חודשי; ב-Ragil זה סכום כל העסקה
    const amount = parseFloat(String(b.Amount ?? "0")) || 0;

    // פיצול שם (יעבוד טוב גם בעברית עם רווח אחד)
    const [firstName = "", lastName = ""] = String(b.ClientName || "").split(" ");

    // סטטוס פנימי
    let resultStatus: "HK_SETUP_OK" | "CHARGE_OK" | "DECLINED";
    if (!statusOk) {
      resultStatus = "DECLINED";
    } else if (isHK) {
      // בהקמת הוראת קבע אין מספר אישור עדיין — זה תקין
      resultStatus = "HK_SETUP_OK";
    } else {
      // עסקה רגילה: חייב להיות AuthorisationNumber כדי לאשר גבייה
      resultStatus = authorisation ? "CHARGE_OK" : "DECLINED";
    }

    const doc: PaymentDataToSave = {
      FirstName: firstName,
      LastName: lastName,
      Phone: b.Phone || "",
      Amount: amount,
      Tashlumim: tashlumim,
      lizchut: undefined,
      Comments: b.Comments || "",
      ref: extractRefFromComment(b.Comments),
    };

    // שמירה / עדכון במסד (לפי הצורך שלך)
    // למשל: אם את רוצה לשמור גם raw/סטטוסים נפרדים, עשי מודל נוסף
    const payment = new Payment(doc);
    await payment.save();

    console.log(
      `✅ callback processed: mode=${isHK ? "HK" : "Ragil"}, status=${resultStatus}`
    );
    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ payment-callback error:", err);
    // עדיין 200 כדי למנוע ניסיונות חוזרים אינסופיים מהספק
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

//get all payments
router.get("/nedarim/payments", async (req, res) => {
  try {
    const payments = await Payment.find({});
    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payments found" });
    }
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" + error.message });
  }
});

// Get donations grouped by ref
router.get("/donations-by-ref", async (req, res) => {
  try {
    const result = await Payment.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$ref", "ללא מזהה"] },
          totalAmount: { $sum: "$Amount" },
          donationCount: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } } // אפשר גם לפי תרומות
    ]);

    res.json(result.map(item => ({
      ref: item._id,
      totalAmount: item.totalAmount,
      donationCount: item.donationCount
    })));
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






export { router as paymentRouter };
  