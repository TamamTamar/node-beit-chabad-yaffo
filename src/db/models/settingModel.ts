import mongoose, { model } from "mongoose";
import { ISetting } from "../../@types/chabad";
import { SettingSchema } from "../schemas/setting-schema";

const Setting = mongoose.model("Setting", SettingSchema);



export default Setting;
