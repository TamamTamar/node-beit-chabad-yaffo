import { Router } from 'express';
import { Payment } from '../db/models/PaymentModel';
import express from "express";
import axios from 'axios';
import { paymentService } from '../services/payment-service';
import { PaymentDataToSave, PaymentInput } from '../@types/chabad';


const router = Router();

router.post("/payment-callback", express.json(), async (req, res) => {
    const paymentData = req.body;

    console.log("Callback data:", paymentData);

    // בדיקה אם יש Confirmation - נניח שזה מסמל תשלום מאושר
    if (paymentData.Confirmation) {
        // כאן אפשר לבצע שמירה במסד הנתונים
        const newPaymentData = {
            FirstName: paymentData.ClientName.split(" ")[0],
            LastName: paymentData.ClientName.split(" ")[1] || "",
            Phone: paymentData.Phone,
            Amount: parseFloat(paymentData.Amount),
            Tashlumim: parseInt(paymentData.Tashloumim || "1"), // ברירת מחדל 1 תשלום
            // ניתן להוסיף שדות נוספים בהתאם לצורך
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
        const newPaymentData = {
            FirstName: data.FirstName,
            LastName: data.LastName,
            Phone: data.Phone,
            Amount: data.Amount,
            Tashlumim: data.Tashlumim || null,
        };

        const payment = new Payment(newPaymentData);
        await payment.save();

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