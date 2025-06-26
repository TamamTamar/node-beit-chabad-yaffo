import express, { Router } from "express";
import { PaymentDataToSave } from '../@types/chabad';
import { Payment } from '../db/models/PaymentModel';
import { paymentService } from '../services/payment-service';


const router = Router();

router.post("/payment-callback", express.json(), async (req, res) => {
    const paymentData = req.body;

    console.log("Callback data:", paymentData);

    // בדיקה אם יש Confirmation - נניח שזה מסמל תשלום מאושר
    if (paymentData.Confirmation) {
        // כאן אפשר לבצע שמירה במסד הנתונים
        const newPaymentData: PaymentDataToSave = {
            FirstName: paymentData.ClientName.split(" ")[0],
            LastName: paymentData.ClientName.split(" ")[1] || "",
            Phone: paymentData.Phone,
            Amount: parseFloat(paymentData.Amount),
            Tashlumim: parseInt(paymentData.Tashloumim || "1"),
            Comment: paymentData.Comment, 
         
          
        };

        const payment = new Payment(newPaymentData);
        await payment.save();

        console.log("✅ תשלום אושר ושמור במסד נתונים");
    } else {
        console.log("❌ עסקה זמנית או לא אושרה (אין מספר אישור)");
    }

    res.status(200).send("OK");
});

  
  
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
        res.status(500).json({ message: "Failed to fetch payments" });
    }
});



export { router as paymentRouter };
