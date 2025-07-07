"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const logger_1 = require("../logs/logger");
const notFound = (req, res, next) => {
    const message = `Not Found - ${req.originalUrl}`;
    logger_1.Logger.error(message); // הוספת לוג לשגיאה
    res.status(404).json({ message });
};
exports.notFound = notFound;
exports.default = notFound;
