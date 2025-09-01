import cors, { CorsOptionsDelegate } from 'cors';
import express, { json } from 'express';
import morgan from 'morgan';
import connect from './db/connection';
import notFound from './errors/not-found';
import errorHandler from './middleware/error-handler';
import { paymentRouter } from './routers/payment-router';
import { rishumRouter } from './routers/rishum-router';
import configDevEnv from '../config';
import { Logger } from './logs/logger';
import { usersRouter } from './routers/users-router';

console.log('🚀 configDevEnv imported:', typeof configDevEnv);

configDevEnv();
console.log('✅ configDevEnv() called successfully');

connect();
console.log('✅ connect() called successfully');

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

console.log('✅ Middleware loaded');

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  if (req.path.startsWith('/api')) return next();
  if (req.hostname === 'chabadyafo.org') {
    return res.redirect(301, `https://www.chabadyafo.org${req.originalUrl}`);
  }
  next();
});

console.log('✅ Redirect middleware loaded');

// ---- ה־API שלך ----
app.use('/api/payment', paymentRouter);
app.use('/api/users', usersRouter);
app.use('/api/rishum', rishumRouter);

console.log('✅ Routers loaded');

// קבצים סטטיים אם צריך
app.use(express.static('public'));

console.log('✅ Static files middleware loaded');

// ---- מטפלי שגיאות ----
app.use(notFound);       // 404 קודם
app.use(errorHandler);   // error handler תמיד אחרון

console.log('✅ Error handlers loaded');

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server is running on :${PORT}`);
});