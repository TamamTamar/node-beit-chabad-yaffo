import { Router } from "express";
import { ShabbatService } from "../services/Shabbat-service";

const router = Router();

router.post("/", async (req, res, next) => {
    try {
        const result = await ShabbatService.createNewRishumShabbat(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

export { router as rishumRouter };