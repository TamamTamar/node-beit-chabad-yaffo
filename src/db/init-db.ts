import { Logger } from "../logs/logger";
import { donations } from "./initial-data";
import { Payment } from "./models/PaymentModel";


const initDB = async () => {
  try {
    const donationsCount = await Payment.countDocuments();

    if (donationsCount >= 1000000) {
      Logger.log("1 or more donations already exist. Skipping donation initialization.");
    } else {
      for (let d of donations) {
               const existingDonation = await Payment.findOne({
          FirstName: d.FirstName,
          LastName: d.LastName,
          Phone: d.Phone
        });
        if (!existingDonation) {
          const saved = await Payment.create(d);
          Logger.verbose(`Donation created: ${saved.Phone}`);
        } else {
          // מחברים את ה-Amount הקיים עם ה-Amount החדש
          existingDonation.Amount += d.Amount;
          await existingDonation.save();
          Logger.log(`Donation updated (Amount summed): ${existingDonation.Phone} - New Amount: ${existingDonation.Amount}`);
        }
      }
    }
  } catch (e) {
    Logger.error(`Database initialization failed: ${e.message}`);
  }
};


export default initDB;