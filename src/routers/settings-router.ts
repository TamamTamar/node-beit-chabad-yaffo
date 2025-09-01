// src/routers/settings-router.ts
import { Router } from "express";

import { validateToken } from "../middleware/validate-token";
import { settingsService } from "../services/settings-service";
import { isAdmin } from "../middleware/is-admin";


const router = Router();

// GET /api/settings/donations-start
router.get("/donations-start",...isAdmin, async (req, res, next) => {
    try {
        const date = await settingsService.getDonationsStartDate();
        res.json({ value: date.toISOString() });
    } catch (e) { next(e); }
});

// PUT /api/settings/donations-start  { "value": "2025-07-01T00:00:00.000Z" }
router.put("/donations-start", ...isAdmin, async (req, res, next) => {
    try {
        const { value } = req.body as { value: string };
        const doc = await settingsService.setDonationsStartDate(value, req.payload?._id);
        res.json({ key: doc.key, value: doc.value, updatedBy: doc.updatedBy, updatedAt: doc.updatedAt });
    } catch (e) { next(e); }
});

export { router as settingsRouter };
