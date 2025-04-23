import mongoose from "mongoose";
import { PriceSchema } from "../schemas/PriceSchema";

const Price = mongoose.model("Price", PriceSchema);

export default Price;