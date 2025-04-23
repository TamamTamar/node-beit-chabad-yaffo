import { Router } from 'express';
import { Payment } from '../db/models/PaymentModel';


const router = Router();

// הגדרת כתובת ה-IP המורשת
const allowedIP = "18.194.219.73";

router.post("/nedarim", async (req, res) => {
    try {
        const requestIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        console.log(`Request received from IP: ${requestIP}`);
        if (requestIP !== allowedIP) {
            console.error(`Unauthorized access attempt from IP: ${requestIP}`);
            return res.status(403).send("Forbidden: Unauthorized IP");
        }

        const data = req.body;

        const newPaymentData = {
            Mosad: data.MosadNumber,
            ApiValid: "zidFYCLaNi",
            Zeout: data.Zeout,
            FirstName: data.ClientName.split(" ")[0],
            LastName: data.ClientName.split(" ")[1] || "",
            Street: data.Adresse,
            City: "",
            Phone: data.Phone,
            Mail: data.Mail,
            PaymentType: data.TransactionType,
            Amount: parseFloat(data.Amount),
            Tashlumim: parseInt(data.Tashloumim),
            Currency: parseInt(data.Currency),
            Groupe: data.Groupe,
            Comment: data.Comments,
            CallBack: "https://node-beit-chabad-yaffo.onrender.com/api/payment/nedarim",
            CallBackMailError: "lchabadyaffo@gmail.com",
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