import { Router } from "express";
import Price from "../db/models/PriceModel";
import { ShabbatService } from "../services/Shabbat-service";

const router = Router();

//create new Rishum Shabbat
router.post('/new', async (req, res) => {
    try {
        const { parasha, date, totalPrice, name, people, phone } = req.body;

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
            phone, // Optional field, default to empty string if not provided
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

// שליפת המחירים
// שליפת המחירים מה-Database
router.get('/prices', async (req, res) => {
    try {
        const prices = await Price.findOne(); // שליפת המחירים (רק מסמך אחד)
        if (!prices) {
            return res.status(404).json({ message: "Prices not found" });
        }
        res.status(200).json(prices);
    } catch (error) {
        console.error("Error fetching prices:", error);
        res.status(500).json({ message: "Failed to fetch prices" });
    }
});

// update prices
router.put('/prices', async (req, res) => {
    try {
        const { adultsPrice, childrenPrice } = req.body;

        // בדיקת שדות חובה
        if (adultsPrice === undefined || childrenPrice === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // עדכון המחירים במסמך הקיים
        const updatedPrices = await Price.findOneAndUpdate(
            {},
            { adultsPrice, childrenPrice },
            { new: true } // מחזיר את המסמך המעודכן
        );

        if (!updatedPrices) {
            return res.status(404).json({ message: "Prices not found" });
        }

        res.status(200).json({ message: "Prices updated successfully", data: updatedPrices });
    } catch (error) {
        console.error("Error updating prices:", error);
        res.status(500).json({ message: "Failed to update prices" });
    }
});

//delete Rishum Shabbat
router.delete("/delete/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ShabbatService.deleteRishumShabbat(id);
        if (!result) {
            return res.status(400).json({ message: "Failed to delete Rishum Shabbat" });
        }
        res.status(200).json({ message: "Rishum Shabbat deleted successfully", data: result });
    } catch (e) {
        next(e);
    }
    
});

export { router as rishumRouter };
