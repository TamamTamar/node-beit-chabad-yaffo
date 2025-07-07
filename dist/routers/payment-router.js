"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = __importStar(require("express"));
const PaymentModel_1 = require("../db/models/PaymentModel");
const payment_service_1 = require("../services/payment-service");
const router = (0, express_1.Router)();
exports.paymentRouter = router;
router.post("/payment-callback", express_1.default.json(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const paymentData = req.body;
    console.log("Callback data:", paymentData);
    if (paymentData.Confirmation) {
        const [firstName = "", lastName = ""] = (paymentData.ClientName || "").split(" ");
        const newPaymentData = {
            FirstName: firstName,
            LastName: lastName,
            Phone: paymentData.Phone,
            Amount: parseFloat(paymentData.Amount),
            Tashlumim: parseInt(paymentData.Tashloumim || "1"),
            Comments: paymentData.Comments,
            ref: extractRefFromComment(paymentData.Comments),
        };
        console.log("newPaymentData:", newPaymentData);
        const payment = new PaymentModel_1.Payment(newPaymentData);
        yield payment.save();
        console.log("✅ תשלום אושר ושמור במסד נתונים");
    }
    else {
        console.log("❌ עסקה זמנית או לא אושרה (אין מספר אישור)");
    }
    res.status(200).send("OK");
}));
function extractRefFromComment(comments) {
    const match = comments === null || comments === void 0 ? void 0 : comments.match(/ref:\s?(\w+)/i);
    return (match === null || match === void 0 ? void 0 : match[1]) || null;
}
//save payment data to DB
router.post("/nedarim/save", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const payment = yield payment_service_1.paymentService.savePayment(data);
        console.log("Payment data saved successfully:", payment);
        res.status(200).send("OK");
    }
    catch (error) {
        console.error("Error handling callback:", error);
        res.status(500).send("Internal Server Error" + error);
    }
}));
//get all payments
router.get("/nedarim/payments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield PaymentModel_1.Payment.find({});
        if (!payments || payments.length === 0) {
            return res.status(404).json({ message: "No payments found" });
        }
        res.status(200).json(payments);
    }
    catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: "Failed to fetch payments" + error.message });
    }
}));
// Get donations grouped by ref
router.get("/donations-by-ref", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield PaymentModel_1.Payment.aggregate([
            {
                $group: {
                    _id: { $ifNull: ["$ref", "ללא מזהה"] },
                    totalAmount: { $sum: "$Amount" },
                    donationCount: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } } // אפשר גם לפי תרומות
        ]);
        res.json(result.map(item => ({
            ref: item._id,
            totalAmount: item.totalAmount,
            donationCount: item.donationCount
        })));
    }
    catch (error) {
        console.error("שגיאה בשליפת תרומות לפי ref:", error);
        res.status(500).send("שגיאה בשרת");
    }
}));
