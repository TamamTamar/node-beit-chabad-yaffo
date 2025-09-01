import { config } from "dotenv";

const configDevEnv = () => {
 // בדיקה שהקובץ נטען

// טוען את קובץ הסביבה הראשי
config({ path: "config/.env" });

// טוען את הקובץ הספציפי לסביבה
const mode = process.env.NODE_ENV || 'dev';
config({ path: `config/${mode}.env` });

// הדפסת משתנה הסביבה כדי לוודא שהוא נטען


};
export default configDevEnv;
