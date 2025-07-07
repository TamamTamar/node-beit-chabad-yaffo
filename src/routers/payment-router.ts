import express, { Router } from "express";
import { PaymentDataToSave } from '../@types/chabad';
import { Payment } from '../db/models/PaymentModel';
import { paymentService } from '../services/payment-service';


const router = Router();

router.post("/payment-callback", express.json(), async (req, res) => {
  const paymentData = req.body;

  console.log("Callback data:", paymentData);

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

    console.log("newPaymentData:", newPaymentData);

    const payment = new Payment(newPaymentData);
    await payment.save();

    console.log("✅ תשלום אושר ושמור במסד נתונים");
  } else {
    console.log("❌ עסקה זמנית או לא אושרה (אין מספר אישור)");
  }

  res.status(200).send("OK");
});

function extractRefFromComment(comments?: string): string | null {
  const match = comments?.match(/ref:\s?(\w+)/i);
  return match?.[1] || null;
}



//save payment data to DB
router.post("/nedarim/save", async (req, res) => {
    try {
        const data = req.body as PaymentDataToSave;
        const payment = await paymentService.savePayment(data);

        console.log("Payment data saved successfully:", payment);

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



export { router as paymentRouter };
