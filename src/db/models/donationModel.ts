import mongoose from "mongoose";
import { donationSchema } from "../schemas/donationSchema";

export const Donation = mongoose.model('Donation', donationSchema);
