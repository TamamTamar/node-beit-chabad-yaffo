import { Router } from "express";
import { ShabbatService } from "../services/Shabbat-service";
import RishumShabbat from "../db/models/ShabbatModel";

const router = Router();

//create new Rishum Shabbat
router.post('/register', async (req, res) => {
    try {
        const { parasha, date, totalPrice, name, people } = req.body;

        // בדיקת שדות חובה
        if (!parasha || !date || !totalPrice || !name || !people) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // קריאה ל-Service ליצירת רישום חדש
        const newRishum = await ShabbatService.createNewRishumShabbat({
            parasha,
            date,
            totalPrice,
            name,
            people,
            _id: undefined, // Assign a default or generate an ID if needed
            createdAt: new Date(), // Add the current timestamp
        });

        res.status(201).json({ message: 'Registration saved successfully', data: newRishum });
    } catch (error) {
        console.error('Error saving registration:', error);
        res.status(500).json({ message: 'Failed to save registration' });
    }
});

//get all Rishum Shabbat
router.get("/", async (req, res, next) => {
    try {
        const result = await ShabbatService.getAllRishumShabbat();
        if (!result) {
            return res.status(400).json({ message: "Failed to get all Rishum Shabbat" });
        }
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
});

export { router as rishumRouter };