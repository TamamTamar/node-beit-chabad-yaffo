import mongoose from "mongoose";
import { Logger } from "../logs/logger";
import { payments } from "./initial-data"; // הנתיב לקובץ שמכיל את המערך
import { Payment } from "./models/PaymentModel";

const importPayments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://...");

    for (const data of payments) {
      const exists = await Payment.findOne({
        FirstName: data.FirstName,
        LastName: data.LastName,
        Amount: data.Amount,
        createdAt: data.createdAt,
      });

      if (!exists) {
        const payment = new Payment(data);
        await payment.save();
        Logger.verbose(`נשמרה תרומה של ${data.FirstName} ${data.LastName}`);
      } else {
        Logger.log(`התרומה של ${data.FirstName} כבר קיימת`);
      }
    }

    Logger.log("✅ כל התרומות נשמרו בהצלחה");
    process.exit(0);
  } catch (e) {
    Logger.error(`❌ שגיאה בייבוא: ${e.message}`);
    process.exit(1);
  }
};

importPayments();
