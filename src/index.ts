import cors from 'cors';
import express, { json } from "express";
import morgan from 'morgan';
import configDevEnv from '../config';
import connect from './db/connection';
import notFound from './errors/not-found';
import errorHandler from './middleware/error-handler';
import { paymentRouter } from './routers/payment-router';
import { rishumRouter } from './routers/rishum-router';
import { Logger } from './logs/logger'; // ייבוא מחלקת Logger

// קוראים לפונקציה כדי לטעון את משתני הסביבה
configDevEnv();
console.log("Environment variables loaded successfully."); // לוג לטעינת משתני סביבה

connect()
  .then(() => console.log("Connected to the database successfully."))
  .catch((err) => console.error(`Failed to connect to the database: ${err.message}`));

const app = express();
// Redirect non-www to www
app.use((req, res, next) => {
  if (req.hostname === 'chabadyafo.org') {
    const newUrl = `https://www.chabadyafo.org${req.originalUrl}`;
    return res.redirect(301, newUrl);
  }
  next();
});


app.use(json());
app.use(morgan("dev"));
app.options("*", cors());
app.use(cors());

app.use('/api/payment', paymentRouter);
app.use('/api/rishum', rishumRouter);

app.use(express.static("public"));
app.use(errorHandler);
app.use(notFound);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});