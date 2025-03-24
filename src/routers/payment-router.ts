import { Router } from 'express';
import { paymentService } from '../services/payment-service';

const router = Router();

// הגדרת כתובת ה-IP המורשת
const allowedIP = "18.194.219.73";
// המפתח הסודי לאימות
const SECRET_KEY = process.env.SECRET_KEY;

router.post("/nedarim", async (req, res) => {
    try {
        const data = req.body;

        // לוודא שהבקשה מכילה נתונים
        if (!data || typeof data !== "object") {
            return res.status(400).send("Invalid request format");
        }

        console.log("Received Callback Data:", data);

        // דוגמה לשליפת נתונים לפי שם המפתח, בלי תלות בסדר
        const transactionId = data.TransactionID;
        const amount = data.Amount;
        const status = data.Status;
        
        if (!transactionId || !amount || !status) {
            return res.status(400).send("Missing required fields");
        }

        // שמירת העסקה במערכת שלנו
        await paymentService.handleCallback(data);

        res.status(200).send("OK");
    } catch (error) {
        console.error("Error handling callback:", error);
        res.status(500).send("Internal Server Error");
    }
});


export { router as paymentRouter };
