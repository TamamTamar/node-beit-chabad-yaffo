import cors from 'cors';
import express, { json } from "express";
import morgan from 'morgan';
import connect from './db/connection';
import notFound from './errors/not-found';
import errorHandler from './middleware/error-handler';
import { paymentRouter } from './routers/payment-router';
import { rishumRouter } from './routers/rishum-router';
import configDevEnv from './config';

configDevEnv();
connect();

const app = express();

/** ✅ אם בקשות יגיעו עם Origin = chabadyafo.org (Netlify), נאשר אותן */
const allowedOrigins = [
  'https://chabadyafo.org',
  'https://www.chabadyafo.org',
  // אם יש לך דומיין Netlify קבוע – הוסיפי אותו כאן:
  // 'https://chabadyafo-org.netlify.app',
];

function isAllowedOrigin(origin?: string | null) {
  if (!origin) return true; // server-to-server / curl
  if (allowedOrigins.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    // לאשר Deploy Previews של Netlify
    if (host.endsWith('.netlify.app') || host.endsWith('.netlify.live')) return true;
  } catch {}
  return false;
}

// ⛔️ שימי לב: ה-redirect הזה רלוונטי רק אם ה-Host הוא chabadyafo.org.
// ב-Railway ה-Host הוא *.railway.app, אז זה לא ישפיע על ה-API.
app.use((req, res, next) => {
  if (req.hostname === 'chabadyafo.org') {
    return res.redirect(301, `https://www.chabadyafo.org${req.originalUrl}`);
  }
  next();
});

/** ✅ CORS חייב להגיע לפני כל ראוט שמחזיר תשובה */
app.use(cors({
  origin(origin, cb) {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true, // השאירי true רק אם את שולחת cookies/Authorization מהדפדפן
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
}));

/** ✅ לטפל ב-preflight לכל הנתיבים */
app.options('*', cors());

app.use(json());
app.use(morgan('dev'));

/** ✅ ה-API שלך */
app.use('/api/payment', paymentRouter);
app.use('/api/rishum', rishumRouter);

app.use(express.static('public'));

/** ✅ מטפלי שגיאות אחרי הראוטים */
app.use(errorHandler);
app.use(notFound);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on :${PORT}`);
});
