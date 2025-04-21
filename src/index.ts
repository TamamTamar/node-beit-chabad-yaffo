import cors from 'cors';
import express, { json } from "express";
import morgan from 'morgan';
import configDevEnv from '../config';
import connect from './db/connection';
import notFound from './errors/not-found';
import errorHandler from './middleware/error-handler';
import { paymentRouter } from './routers/payment-router';

// קוראים לפונקציה כדי לטעון את משתני הסביבה
configDevEnv();
connect();


const app = express();

app.use(json());
app.use(morgan("dev"));
app.options("*", cors());
app.use(cors());

app.use('/api/payment', paymentRouter);
app.use('/api/rishum', paymentRouter);


app.use(express.static("public"));
app.use(errorHandler);
app.use(notFound);


app.listen(process.env.PORT || 8080, () => {
    console.log('השרת פועל');
});

