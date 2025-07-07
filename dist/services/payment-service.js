"use strict";
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
exports.paymentService = void 0;
const PaymentModel_1 = require("../db/models/PaymentModel");
exports.paymentService = {
    handleCallback: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Received callback from Nedarim Plus:", data);
            // כאן תוכל לבדוק את סטטוס העסקה ולעדכן את מסד הנתונים
            if (data.status === "SUCCESS") {
                console.log(`Transaction ${data.transactionId} completed successfully.`);
                // לדוגמה: עדכון מסד נתונים
            }
            else {
                console.log(`Transaction ${data.transactionId} failed.`);
                // לדוגמה: שמירת סטטוס שגיאה
            }
        }
        catch (error) {
            console.error("Error in Nedarim Service:", error);
            throw error;
        }
    }),
    savePayment: (data) => __awaiter(void 0, void 0, void 0, function* () {
        // מחפשים תשלום קיים לפי הטלפון
        const existingPayment = yield PaymentModel_1.Payment.findOne({ FirstName: data.FirstName, LastName: data.LastName, Phone: data.Phone });
        if (existingPayment) {
            // אם יש, מחברים את הסכום החדש לישן
            existingPayment.Amount += data.Amount;
            // אפשר לעדכן גם את Tashlumim אם תרצה, או להשאיר אותו כפי שהוא
            if (data.Tashlumim) {
                existingPayment.Tashlumim = data.Tashlumim;
            }
            yield existingPayment.save();
            return existingPayment;
        }
        else {
            // אם לא קיים, יוצרים חדש
            const newPaymentData = {
                FirstName: data.FirstName,
                LastName: data.LastName,
                Phone: data.Phone,
                Amount: data.Amount,
                Tashlumim: data.Tashlumim || 1,
                Comment: data.Comments,
            };
            const payment = new PaymentModel_1.Payment(newPaymentData);
            yield payment.save();
            return payment;
        }
    }),
};
