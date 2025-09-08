import mongoose from "mongoose";
import { BitPaymentSchema } from "../schemas/BitPaymentSchema";

const BitPayment = mongoose.model("BitPayment", BitPaymentSchema);

export default BitPayment;
