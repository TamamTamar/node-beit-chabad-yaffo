import { config } from "dotenv";

const configDevEnv = () => {
 // בדיקה שהקובץ נטען

// טוען את קובץ הסביבה הראשי
config({ path: "config/.env" });

// טוען את הקובץ הספציפי לסביבה
const mode = process.env.NODE_ENV || 'dev';
config({ path: `config/${mode}.env` });

// הדפסת משתנה הסביבה כדי לוודא שהוא נטען


if (!process.env.PERSISTENT_DISK_PATH) {
    throw new Error("Environment variable PERSISTENT_DISK_PATH is not set. Please configure it in your .env file.");
}
};
export default configDevEnv;
