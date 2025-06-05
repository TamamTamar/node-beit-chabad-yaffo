import { Router } from 'express';
import { Payment } from '../db/models/PaymentModel';
import express from "express";
import axios from 'axios';
import { paymentService } from '../services/payment-service';

const router = Router();

// הגדרת כתובת ה-IP המורשת
router.post("/payment-callback", express.urlencoded({ extended: true }), async (req, res) => {
    const paymentData = req.body;
    console.log("Callback data:", paymentData);
  
    // בדיקה אם הסטטוס של העסקה מאושר
    if (paymentData.Status === "Approved") {
      // יצירת אובייקט נתוני תשלום
      const data = req.body;
      const newPaymentData = {
          FirstName: data.ClientName,  // שם פרטי (נראה כי יש לך רק שם אחד בשדה)
          LastName: data.ClientName,   // אפשר לשנות לשדה אחר אם יש, כמו "שם משפחה"
          Phone: data.Phone,
          Amount: parseFloat(data.Amount),  // סכום (לפי הנתונים שמתקבלים)
          Tashloumim: parseInt(data.Tashloumim),  // מספר תשלומים
      };
  
      // שמירה במסד נתונים
      const payment = new Payment(newPaymentData);
      await payment.save();  // שמירה במסד נתונים
  
      console.log("✅ תשלום אושר ושמור במסד נתונים");
    } else {
      console.log("❌ תשלום נכשל או בוטל");
    }
  
    // תשובה חיובית ל-NedrimPlus שהבקשה התקבלה
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
        res.status(500).send("Internal Server Error" + error);
    }
});
router.get('/donations', async (req, res) => {
  try {
    const donations = await paymentService.fetchAndAggregateDonations();
    res.json(donations);
  } catch (error: any) {
    console.error('שגיאה בשליפת התרומות:', error.message);
    res.status(500).json({ message: 'נכשל בשליפת התרומות' });
  }
});



export { router as paymentRouter };