import { config } from "dotenv";

const configDevEnv = () => {
 // בדיקה שהקובץ נטען
console.log("Loading environment variables...");

// טוען את קובץ הסביבה הראשי
config({ path: "config/.env" });

// טוען את הקובץ הספציפי לסביבה
const mode = process.env.NODE_ENV || 'dev';
config({ path: `config/${mode}.env` });

// הדפסת משתנה הסביבה כדי לוודא שהוא נטען
console.log("PERSISTENT_DISK_PATH:", process.env.PERSISTENT_DISK_PATH);

if (!process.env.PERSISTENT_DISK_PATH) {
    throw new Error("Environment variable PERSISTENT_DISK_PATH is not set. Please configure it in your .env file.");
}
};
export default configDevEnv;
