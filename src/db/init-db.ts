import { Logger } from "../logs/logger";
import { donations } from "./initial-data";
import { Payment } from "./models/PaymentModel";

const initDB = async () => {
  try {
    for (let d of donations) {
      const saved = await Payment.create(d);
      Logger.verbose(`Donation created: ${saved.Phone}`);
    }
  } catch (e) {
    Logger.error(`Database initialization failed: ${e.message}`);
  }
};

export default initDB;