import { Router } from 'express';
import { Payment } from '../db/models/PaymentModel';

const router = Router();

// הגדרת כתובת ה-IP המורשת
const allowedIP = "18.194.219.73";

router.post("/nedarim", async (req, res) => {
    try {
        const data = req.body;
        console.log("Request body:", data);

        const newPaymentData = {
            TransactionId: data.TransactionId,
            ClientId: data.ClientId,
            Zeout: data.Zeout,
            ClientName: data.ClientName,
            Adresse: data.Adresse,
            Phone: data.Phone,
            Mail: data.Mail,
            Amount: parseFloat(data.Amount),
            Currency: parseInt(data.Currency),
            TransactionTime: data.TransactionTime,
            Confirmation: data.Confirmation,
            LastNum: data.LastNum,
            Tokef: data.Tokef,
            TransactionType: data.TransactionType,
            Groupe: data.Groupe,
            Comments: data.Comments,
            Tashloumim: parseInt(data.Tashloumim),
            FirstTashloum: parseFloat(data.FirstTashloum),
            MosadNumber: data.MosadNumber,
            CallId: data.CallId,
            MasofId: data.MasofId,
            Shovar: data.Shovar,
            CompagnyCard: data.CompagnyCard,
            Solek: data.Solek,
            Tayar: data.Tayar,
            Makor: data.Makor,
            KevaId: data.KevaId,
            DebitIframe: data.DebitIframe,
            ReceiptCreated: data.ReceiptCreated,
            ReceiptData: data.ReceiptData,
            ReceiptDocNum: data.ReceiptDocNum,
        };

        console.log("New payment data:", newPaymentData);

        const payment = new Payment(newPaymentData);
        await payment.save();

        console.log("Payment data saved successfully:", payment);

        res.status(200).send({ Status: "OK" });
    } catch (error) {
        console.error("Error handling callback:", error);
        res.status(500).send("Internal Server Error");
    }
});

export { router as paymentRouter };