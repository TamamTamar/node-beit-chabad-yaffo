import { Router } from "express";
import { BitService } from "../services/bit-service";
import type { BitCallbackPayload } from "../@types/bit";

const router = Router();

/**
 * POST /api/nedarim/callback/bit
 * Body: BitCallbackPayload (FORM-POST מנדרים)
 */
router.post("/bit", async (req, res) => {
    try {
        const fwd = (req.headers["x-forwarded-for"] as string) || "";
        const ip = (fwd.split(",")[0] || req.socket.remoteAddress || "").trim();

        await BitService.handleCallback(ip, req.body as BitCallbackPayload);
        res.status(200).send("OK");
    } catch (err: any) {
        console.error("bit callback error:", err?.message || err);
        res.status(err?.status || 500).send(err?.status ? err?.message : "Internal Server Error");
    }
});

export { router as bitRouter };
