import express, { Router, Request, Response, NextFunction } from "express";
import { PaymentDataToSave } from "../@types/chabad";
import { Payment } from "../db/models/PaymentModel";
import { paymentService } from "../services/payment-service";

const router = Router();

/** עזר */
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const extractRefFromComment = (comments?: string): string | null => {
  const match = comments?.match(/ref:\s*([^\s]+)/i);
  return match?.[1] || null;
};


router.post("/payment-callback", express.json(), async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;
    console.log("Callback data:", paymentData);

    if (!paymentData?.Confirmation) {
      console.log("❌ עסקה זמנית/לא אושרה (אין Confirmation)");
      return res.status(200).send("OK");
    }

    const [firstName = "", lastName = ""] = String(paymentData.ClientName || "").split(" ");

    const newPaymentData: PaymentDataToSave = {
      FirstName: firstName,
      LastName: lastName,
      Phone: paymentData.Phone,
      Amount: Number(paymentData.Amount),
      Tashlumim: parseInt(paymentData.Tashloumim || "1", 10),
      Comments: paymentData.Comments,
      ref: extractRefFromComment(paymentData.Comments),
    };

    console.log("newPaymentData:", newPaymentData);
    const payment = new Payment(newPaymentData);
    await payment.save();

    console.log("✅ תשלום נשמר");
    res.status(200).send("OK");
  } catch (err) {
    console.error("payment-callback error:", err);
    res.status(500).send("Internal Server Error");
  }
});

/** 2) שמירה ידנית (אם נדרש) */
router.post("/nedarim/save", async (req: Request, res: Response) => {
  try {
    const data = req.body as PaymentDataToSave;
    const payment = await paymentService.savePayment(data);
    console.log("Payment saved:", payment?._id);
    res.status(200).send("OK");
  } catch (error: any) {
    console.error("nedarim/save error:", error);
    res.status(500).send("Internal Server Error");
  }
});
//
router.get("/payments", async (req: Request, res: Response) => {
  try {
    const { ref, ci = "false", from, to, limit = "50", skip = "0" } = req.query as Record<string, string | undefined>;

    const q: any = {};
    if (ref && ref.trim()) {
      q.ref = ci === "true"
        ? { $regex: `^${escapeRegExp(ref.trim())}$`, $options: "i" }
        : ref.trim();
    }
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }

    const lim = Math.min(parseInt(limit || "50", 10) || 50, 200);
    const skp = Math.max(parseInt(skip || "0", 10) || 0, 0);

    const [items, total] = await Promise.all([
      Payment.find(q).sort({ createdAt: -1 }).skip(skp).limit(lim).lean(),
      Payment.countDocuments(q),
    ]);

    return res.json({
      query: { ref, ci: ci === "true", from, to, limit: lim, skip: skp },
      meta: { total, returned: items.length },
      items, // תמיד מערך
    });
  } catch (error: any) {
    console.error("GET /payments error:", error?.message || error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

/**
 * 4) סיכום לפי ref (אגרגציה)
 *    GET /api/payment/payments/summary/by-ref?from=2025-07-01&to=2025-09-30
 *    מייצר ref מאוחד case-insensitive
 */
router.get("/payments/by-ref", async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as Record<string, string | undefined>;
    const match: any = {};

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const result = await Payment.aggregate([
      Object.keys(match).length ? { $match: match } : null,
      { $addFields: { refLower: { $toLower: { $ifNull: ["$ref", ""] } } } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$refLower", ""] }, "ללא מזהה", "$refLower"] },
          totalAmount: { $sum: "$Amount" },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ].filter(Boolean) as any);

    return res.json(
      result.map((r: any) => ({
        ref: r._id,
        totalAmount: r.totalAmount,
        donationCount: r.donationCount,
      }))
    );
  } catch (error) {
    console.error("summary/by-ref error:", error);
    res.status(500).send("שגיאה בשרת");
  }
});

//get dontion by ref
router.get("/payments/by-ref/:ref", async (req: Request, res: Response) => {
  try {
    const ref = req.params.ref;
    if (!ref || !ref.trim()) {
      return res.status(400).json({ message: "Missing or empty ref parameter" });
    }
    const payments = await Payment.find({
      ref: { $regex: `^${escapeRegExp(ref.trim())}$`, $options: "i" },
    }).sort({ createdAt: -1 }).lean();
    return res.json({ ref, count: payments.length, payments });
  } catch (error: any) {
    console.error("GET /payments/by-ref/:ref error:", error?.message || error);
    res.status(500).json({ message: "Failed to fetch payments by ref" });
  }
});

export { router as paymentRouter };
