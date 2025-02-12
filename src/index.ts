import morgan from 'morgan';
import configDevEnv from '../config';
import connect from './db/connection';
import { Logger } from './logs/logger';
import express, { json } from "express";
import cors from 'cors';
import errorHandler from './middleware/error-handler';
import notFound from './errors/not-found';
import { paymentRouter } from './routers/payment-router';

// קוראים לפונקציה כדי לטעון את משתני הסביבה
configDevEnv();
connect();


const app = express();

app.use(json());
app.use(morgan("dev"));
app.options("*", cors());
app.use(cors());

app.use('api/payment', paymentRouter);


app.use(express.static("public"));
app.use(errorHandler);
app.use(notFound);


app.listen(8080, () => {
    Logger.log("Server is running on port 8080");
});
