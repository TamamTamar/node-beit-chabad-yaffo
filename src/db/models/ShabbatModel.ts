import mongoose from "mongoose";
import { ShabbatSchema } from "../schemas/ShabbatSchema";

const RishumShabbat = mongoose.model('Shabbat', ShabbatSchema);

export default RishumShabbat;

