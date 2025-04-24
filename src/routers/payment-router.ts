import { Router } from 'express';
import { Payment } from '../db/models/PaymentModel';
import express from "express";

const router = Router();

// הגדרת כתובת ה-IP המורשת
router.post("/payment-callback", express.urlencoded({ extended: true }), (req, res) => {
    const paymentData = req.body;
    console.log("Callback data:", paymentData);
  
    // בדיקה בסיסית
    if (paymentData.Status === "Approved") {
      // שמירה במסד נתונים
      console.log("✅ תשלום אושר");
    } else {
      console.log("❌ תשלום נכשל או בוטל");
    }
  
    res.status(200).send("OK");
  });
  
  
//save payment data to DB
router.post("/nedarim/save", async (req, res) => {
    try {
        const data = req.body;
        const newPaymentData = {
            FirstName: data.ClientName.split(" ")[0],
            LastName: data.ClientName.split(" ")[1] || "",
            Phone: data.Phone,
            Amount: parseFloat(data.Amount),
            Tashlumim: parseInt(data.Tashloumim),
        };

        const payment = new Payment(newPaymentData);
        await payment.save();

        console.log("Payment data saved successfully:", payment);

        res.status(200).send("OK");
    } catch (error) {
        console.error("Error handling callback:", error);
        res.status(500).send("Internal Server Error");
    }
});

export { router as paymentRouter };