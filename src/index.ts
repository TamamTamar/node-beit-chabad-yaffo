import express, { json } from 'express';
import cors, { CorsOptionsDelegate } from 'cors';
import morgan from 'morgan';

import configDevEnv from '../config';
import connect from './db/connection';
import notFound from './errors/not-found';
import errorHandler from './middleware/error-handler';

import { paymentRouter } from './routers/payment-router';
import { rishumRouter } from './routers/rishum-router';
import { settingsRouter } from './routers/settings-router';
import { usersRouter } from './routers/users-router';

configDevEnv();

const ALLOWED_ORIGINS: (string | RegExp)[] = [
  /^https:\/\/([a-z0-9-]+\.)*chabadyafo\.org$/i,
  /\.netlify\.app$/i,
  /\.netlify\.live$/i,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const corsOptions: CorsOptionsDelegate = (req, cb) => {
  const origin = req.headers.origin as string | undefined;
  if (!origin) {
    return cb(null, {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      optionsSuccessStatus: 204,
    });
  }
  const allowed = ALLOWED_ORIGINS.some(o => o instanceof RegExp ? o.test(origin) : o === origin);
  if (allowed) {
    return cb(null, {
      origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      optionsSuccessStatus: 204,
    });
  }
  return cb(new Error(`Not allowed by CORS: ${origin}`));
};

async function main() {
  await connect();

  const app = express();

  // CORS חייב להיות ראשון
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(json());
  app.use(morgan('dev'));

  // הפניה ל-www רק אם באמת צריך; אם לא – מחקי את כל הבלוק הזה
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS' || req.path.startsWith('/api')) return next();
    if (req.hostname === 'chabadyafo.org') {
      return res.redirect(301, `https://www.chabadyafo.org${req.originalUrl}`);
    }
    next();
  });

  // API
  app.use('/api/payment', paymentRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/rishum', rishumRouter);
  app.use('/api/settings', settingsRouter);

  // Errors
  app.use(notFound);
  app.use(errorHandler);

  const PORT = Number(process.env.PORT) || 8080;
  app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
}

main().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
