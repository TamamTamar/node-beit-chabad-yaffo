"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const initial_data_1 = require("./initial-data");
const PaymentModel_1 = require("./models/PaymentModel");
dotenv_1.default.config();
const MONGO_URI = process.env.DB_CONNECTION_STRING;
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB + " + MONGO_URI);
        const count = yield PaymentModel_1.Payment.countDocuments();
        if (count > 0) {
            console.log(`ℹ️ Skipping: ${count} payments already in DB`);
            return;
        }
        const inserted = yield PaymentModel_1.Payment.insertMany(initial_data_1.payments);
        console.log(`✅ Inserted ${inserted.length} payments`);
    }
    catch (error) {
        console.error("❌ Error insertig payments:", error);
    }
    finally {
        yield mongoose_1.default.disconnect();
        process.exit();
    }
});
run();
