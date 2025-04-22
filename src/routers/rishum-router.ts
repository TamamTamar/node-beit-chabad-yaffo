import { Router } from "express";
import { ShabbatService } from "../services/Shabbat-service";

const router = Router();

//create new Rishum Shabbat
router.post("/", async (req, res, next) => {
    try {
        const result = await ShabbatService.createNewRishumShabbat(req.body);
        if (!result) {
            return res.status(400).json({ message: "Failed to create new Rishum Shabbat" });
        }
        res.status(201).json(result);
    } catch (e) {
        next(e);
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