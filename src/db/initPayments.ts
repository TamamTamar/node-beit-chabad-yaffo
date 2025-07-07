import mongoose from "mongoose";
import dotenv from "dotenv";

import { payments } from "./initial-data";
import { Payment } from "./models/PaymentModel";

dotenv.config();

const MONGO_URI = process.env.DB_CONNECTION_STRING as string;

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB + " + MONGO_URI);

    const count = await Payment.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ Skipping: ${count} payments already in DB`);
      return;
    }

    const inserted = await Payment.insertMany(payments);
    console.log(`✅ Inserted ${inserted.length} payments`);
  } catch (error) {
    console.error("❌ Error inserting payments:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

run();
