import { Router } from 'express';
import { paymentService } from '../services/payment-service';

const router = Router();

// הגדרת כתובת ה-IP המורשת
const allowedIP = "18.194.219.73";

router.post("/nedarim", async (req, res) => {
    try {
        // קבלת ה-IP של הבקשה
        const requestIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        // הצגת ה-IP שהתקבל לצורכי debugging
        console.log("IP של הבקשה:", requestIP);

        // בדיקה אם ה-IP הוא ה-IP המורשה
        if (requestIP !== allowedIP) {
            return res.status(403).send("Unauthorized"); // אם ה-IP לא תואם, מחזירים שגיאה 403
        }

        // קריאה לפונקציית הטיפול בנתונים לאחר שהבקשה מאושרת
        await paymentService.handleCallback(req.body);

        // מחזירים תשובה בהצלחה
        res.status(200).send("OK");
    } catch (error) {
        console.error("Error handling Nedarim callback:", error);
        res.status(500).send("Internal Server Error"); // שגיאת שרת
    }
});

export { router as paymentRouter };
