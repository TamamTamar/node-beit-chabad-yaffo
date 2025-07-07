import mongoose from "mongoose";
import dotenv from "dotenv";

import { payments } from "./initial-data";
import { Payment } from "./models/PaymentModel";

dotenv.config();

const MONGO_URI ="mongodb+srv://chabadyaffo:oKVOSd9pfObHhNjB@chabad-yaffo.gcdz4we.mongodb.net/?retryWrites=true&w=majority&appName=chabad-yaffo";

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

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
