
import { Logger } from "../logs/logger";
import { Payment } from "./models/PaymentModel";


const initPayments = async () => {
  try {

    for (let payment of payments) {
      const existing = await Payment.findOne({
        FirstName: payment.FirstName,
        LastName: payment.LastName,
        Amount: payment.Amount,
        createdAt: payment.createdAt,
      });

      if (!existing) {
        await Payment.create(payment);
        Logger.verbose(`תרומה נשמרה: ${payment.FirstName} ${payment.LastName}`);
      } else {
        Logger.log(`תרומה קיימת כבר: ${payment.FirstName} ${payment.LastName}`);
      }
    }

    Logger.log("✅ אתחול התרומות הושלם בהצלחה");
  } catch (e) {
    Logger.error(`❌ שגיאה באתחול התרומות: ${e.message}`);
  }
};

export default initPayments;
