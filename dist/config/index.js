"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const configDevEnv = () => {
    // בדיקה שהקובץ נטען
    console.log("Loading environment variables...");
    // טוען את קובץ הסביבה הראשי
    (0, dotenv_1.config)({ path: "config/.env" });
    // טוען את הקובץ הספציפי לסביבה
    const mode = process.env.NODE_ENV || 'dev';
    (0, dotenv_1.config)({ path: `config/${mode}.env` });
    // הדפסת משתנה הסביבה כדי לוודא שהוא נטען
    console.log("PERSISTENT_DISK_PATH:", process.env.PERSISTENT_DISK_PATH);
    if (!process.env.PERSISTENT_DISK_PATH) {
        throw new Error("Environment variable PERSISTENT_DISK_PATH is not set. Please configure it in your .env file.");
    }
};
exports.default = configDevEnv;
