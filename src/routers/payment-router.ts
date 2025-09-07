import express, { Router } from "express";
import { PaymentDataToSave } from '../@types/chabad';
import { Payment } from '../db/models/PaymentModel';
import { paymentService } from '../services/payment-service';
import { Logger } from "../logs/logger";
import { settingsService } from "../services/settings-service";
import { Donation } from "../db/models/donationModel";


const router = Router();

//handle payment gateway callback
router.post("/payment-callback", express.json(), async (req, res) => {
  const paymentData = req.body;

  console.log("Callback data:" + JSON.stringify(paymentData, null, 2));

  if (paymentData.Confirmation) {
    const [firstName = "", lastName = ""] = (paymentData.ClientName || "").split(" ");

    const newPaymentData: PaymentDataToSave = {
      FirstName: firstName,
      LastName: lastName,
      Phone: paymentData.Phone,
      Amount: parseFloat(paymentData.Amount),
      Tashlumim: parseInt(paymentData.Tashloumim || "1"),
      Comments: paymentData.Comments,
      ref: extractRefFromComment(paymentData.Comments),

    };

    console.log("newPaymentData:" + JSON.stringify(newPaymentData, null, 2));

    const payment = new Payment(newPaymentData);
    await payment.save();

    console.log("✅ תשלום אושר ושמור במסד נתונים");
  } else {
    console.log("❌ עסקה זמנית או לא אושרה (אין מספר אישור)");
  }

  res.status(200).send("OK");
});

// Extract ref from comments, e.g., "ref: XYZ123"
const extractRefFromComment = (comments?: string): string | null => {
  const match = comments?.match(/ref:\s?(\w+)/i);
  return match?.[1] || null;
}



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

// Get all donations since the donations start date
router.get("/", async (req, res, next) => {
  try {
    const from = await settingsService.getDonationsStartDate();
    const docs = await Donation.find({ createdAt: { $gte: from } }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (e) { next(e); }
});

//get donation by ref
router.get("/donations/:ref", async (req, res, next) => {
  try {
    const ref = req.params.ref;
    const docs = await Donation.find({ ref }).sort({ createdAt: -1 });
    if (!docs || docs.length === 0) {
      return res.status(404).json({ message: "No donations found for this ref" });
    }
    res.json(docs);
  } catch (e) { next(e); }
});





export { router as paymentRouter };
