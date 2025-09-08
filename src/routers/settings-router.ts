// src/routers/settings-router.ts
import { Router, Request, Response, NextFunction } from "express";
import { settingsService } from "../services/settings-service";
import { isAdmin } from "../middleware/is-admin";

const router = Router();

// עזר: נורמליזציה ל-ref וולידציה פשוטה
const normalizeRef = (v: unknown) => String(v ?? "").trim();
const getUpdatedBy = (req: Request) => (req as any)?.payload?._id;

/* ======================
   Donations start date
   ====================== */

// GET /api/settings/donations-start
router.get(
    "/donations-start",
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const date = await settingsService.getDonationsStartDate();
            res.json({ value: date.toISOString() });
        } catch (e) { next(e); }
    }
);

// PUT /api/settings/donations-start  { "value": "2025-07-01T00:00:00.000Z" }
router.put(
    "/donations-start",
    ...isAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { value } = req.body as { value: string };
            if (!value) return res.status(400).json({ error: "Missing body.value" });

            const doc = await settingsService.setDonationsStartDate(value, getUpdatedBy(req));
            res.json({ key: "donationsStartDate", value: doc.value, updatedAt: doc.updatedAt });
        } catch (e) { next(e); }
    }
);

/* ===============
   Goals per ref
   =============== */

// PUT /api/settings/goal/:ref    body: { goal: number|string }
router.put(
    "/goal/:ref",
    ...isAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ref = normalizeRef(req.params.ref);
            if (!ref) return res.status(400).json({ error: "Missing param :ref" });

            const { goal } = req.body as { goal: number | string };
            if (goal == null) return res.status(400).json({ error: "Missing body.goal" });

            const doc = await settingsService.setRefGoal(ref, goal, getUpdatedBy(req));
            res.json({ key: doc.key, value: doc.value, updatedAt: doc.updatedAt });
        } catch (e) { next(e); }
    }
);

// GET /api/settings/goal/:ref
router.get(
    "/goal/:ref",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ref = normalizeRef(req.params.ref);
            if (!ref) return res.status(400).json({ error: "Missing param :ref" });

            const goal = await settingsService.getRefGoal(ref);
            res.json({ ref: ref.toLowerCase(), goal });
        } catch (e) { next(e); }
    }
);

// GET /api/settings/goals
router.get(
    "/goals",
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const goals = await settingsService.getAllRefGoals();
            res.json(goals); // { dl: 50000, ... }
        } catch (e) { next(e); }
    }
);

// PUT /api/settings/goals/bulk     body: { goals: Record<string, number|string> }
router.put(
    "/goals/bulk",
    ...isAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { goals } = req.body as { goals: Record<string, number | string> };
            if (!goals || typeof goals !== "object") {
                return res.status(400).json({ error: "Missing body.goals (map of ref->goal)" });
            }
            const result = await settingsService.setRefGoalsBulk(goals, getUpdatedBy(req));
            res.json(result);
        } catch (e) { next(e); }
    }
);

/* ===============
   Names per ref
   =============== */

// PUT /api/settings/name/:ref    body: { name: string }
router.put(
    "/name/:ref",
    ...isAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ref = normalizeRef(req.params.ref);
            if (!ref) return res.status(400).json({ error: "Missing param :ref" });

            const { name } = req.body as { name: string };
            if (!name || !String(name).trim()) {
                return res.status(400).json({ error: "Missing body.name" });
            }

            const doc = await settingsService.setRefName(ref, name, getUpdatedBy(req));
            res.json({ key: doc.key, value: doc.value, updatedAt: doc.updatedAt });
        } catch (e) { next(e); }
    }
);

// GET /api/settings/name/:ref
router.get(
    "/name/:ref",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ref = normalizeRef(req.params.ref);
            if (!ref) return res.status(400).json({ error: "Missing param :ref" });

            const name = await settingsService.getRefName(ref);
            res.json({ ref: ref.toLowerCase(), name });
        } catch (e) { next(e); }
    }
);

// GET /api/settings/names
router.get(
    "/names",
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const names = await settingsService.getAllRefNames();
            res.json(names); // { dl: "שם", fr: "שם", ... }
        } catch (e) { next(e); }
    }
);

/* ====================
   Meta (goal + name)
   ==================== */

// GET /api/settings/ref/:ref  → { ref, goal, name }
router.get(
    "/ref/:ref",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ref = normalizeRef(req.params.ref);
            if (!ref) return res.status(400).json({ error: "Missing param :ref" });

            const meta = await settingsService.getRefMeta(ref);
            res.json(meta);
        } catch (e) { next(e); }
    }
);

export { router as settingsRouter };
