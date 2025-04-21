import { Router } from "express";
import { ShabbatService } from "../services/Shabbat-service";

const router = Router();

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

export { router as rishumRouter };