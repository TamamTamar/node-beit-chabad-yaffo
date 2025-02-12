import { Router } from 'express';
import { paymentService } from '../services/payment-service';



const router = Router();



router.post("/try", async (req, res) => {
    try {
        await paymentService.handleCallback(req.body);
        res.status(200).send("OK");
    } catch (error) {
        console.error("Error handling Nedarim callback:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.post("/nedarim", async (req, res) => {
    try {
        const allowedIP = "18.194.219.73";
        const requestIP = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        if (requestIP !== allowedIP) {
            return res.status(403).send("Unauthorized");
        }

        await paymentService.handleCallback(req.body);

        res.status(200).send("OK");
    } catch (error) {
        console.error("Error handling Nedarim callback:", error);
        res.status(500).send("Internal Server Error");
    }
});



export { router as paymentRouter };
