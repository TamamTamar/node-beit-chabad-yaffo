import cors, { CorsOptionsDelegate } from 'cors';
import express, { json } from 'express';
import morgan from 'morgan';
import connect from './db/connection';
import notFound from './errors/not-found';
import errorHandler from './middleware/error-handler';
import { paymentRouter } from './routers/payment-router';
import { rishumRouter } from './routers/rishum-router';
import configDevEnv from './config';
import { Logger } from './logs/logger';

configDevEnv();
connect();

const app = express();

// ---- רשימת Origins מותרים ----
const ALLOWED_ORIGINS: (string | RegExp)[] = [
  'https://chabadyafo.org',
  'https://www.chabadyafo.org',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  /\.netlify\.app$/,   // Netlify deploy previews
  /\.netlify\.live$/,  // Netlify live previews
];

// ---- הגדרת CORS ----
const corsOptions: CorsOptionsDelegate = (req, cb) => {
  const origin = req.headers.origin as string | undefined;

  // בקשה בלי Origin (curl / בריאות / שרת-לשרת) – נאשר
  if (!origin) {
    return cb(null, {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      optionsSuccessStatus: 204,
    });
  }

  const allowed = ALLOWED_ORIGINS.some(o =>
    o instanceof RegExp ? o.test(origin) : o === origin
  );

  if (allowed) {
    return cb(null, {
      origin,  // נחזיר את ה-Origin עצמו (ולא true) – הכי נקי
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      optionsSuccessStatus: 204,
    });
  }

  cb(new Error('Not allowed by CORS'));
};

// ✳️ CORS חייב להיות ראשון
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(json());
app.use(morgan('dev'));

// ---- redirect non-www→www ----
// ❗ לא מפנים OPTIONS (preflight)
// ❗ לא מפנים בקשות ל־/api
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  if (req.path.startsWith('/api')) return next();
  if (req.hostname === 'chabadyafo.org') {
    return res.redirect(301, `https://www.chabadyafo.org${req.originalUrl}`);
  }
  next();
});

// ---- ה־API שלך ----
app.use('/api/payment', paymentRouter);
app.use('/api/rishum', rishumRouter);

// קבצים סטטיים אם צריך
app.use(express.static('public'));

// ---- מטפלי שגיאות ----
app.use(notFound);       // 404 קודם
app.use(errorHandler);   // error handler תמיד אחרון

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  Logger.log(`✅ Server is running on :${PORT}`);
});
