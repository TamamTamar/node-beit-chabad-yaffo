import { Router } from 'express';
import { paymentService } from '../services/payment-service';

const router = Router();

// הגדרת כתובת ה-IP המורשת
const allowedIP = "18.194.219.73";
// המפתח הסודי לאימות
const SECRET_KEY = process.env.SECRET_KEY;

router.post("/nedarim", async (req, res) => {
    try {
        console.log("Received Callback Data:", req.body); // 🔍 בדיקה מה נשלח

        res.status(200).send("OK"); // להחזיר 200 כדי שהמערכת שלהם לא תשלח שגיאה

    } catch (error) {
        console.error("Error handling callback:", error);
        res.status(500).send("Internal Server Error");
    }
});



export { router as paymentRouter };
