import { Router } from 'express';
import { Payment } from '../db/models/PaymentModel';


const router = Router();

// הגדרת כתובת ה-IP המורשת
const allowedIP = "18.194.219.73";

router.post("/nedarim", async (req, res) => {
    try {
        // בדיקת כתובת ה-IP של הבקשה
        const requestIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        if (requestIP !== allowedIP) {
            console.error(`Unauthorized access attempt from IP: ${requestIP}`);
            return res.status(403).send("Forbidden: Unauthorized IP");
        }

        const data = req.body;

        // יצירת אובייקט חדש עם הנתונים
        const newPaymentData = {
            Mosad: "7013920",
            ApiValid: "zidFYCLaNi",
            Zeout: data.Zeout,
            FirstName: data.FirstName,
            LastName: data.LastName,
            Street: data.Street,
            City: data.City,
            Phone: data.Phone,
            Mail: data.Mail,
            PaymentType: data.Is12Months ? "HK" : "Ragil",
            Amount: data.annualAmount,
            Tashlumim: data.Is12Months ? 12 : data.Tashlumim,
            Currency: 1,
            Groupe: data.Groupe,
            Comment: data.Comment,
            CallBack: "https://node-beit-chabad-yaffo.onrender.com/api/payment/nedarim",
            CallBackMailError: "lchabadyaffo@gmail.com",
        };

        // שמירת הנתונים ב-Database
        const payment = new Payment(newPaymentData);
        await payment.save();

        console.log("Payment data saved successfully:", payment);

        res.status(200).send("OK"); // להחזיר 200 כדי שהמערכת שלהם לא תשלח שגיאה
    } catch (error) {
        console.error("Error handling callback:", error);
        res.status(500).send("Internal Server Error");
    }
});

export { router as paymentRouter };