"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = require("joi");
const mongodb_1 = require("mongodb");
const MyErrors_1 = __importDefault(require("../errors/MyErrors"));
const logger_1 = require("../logs/logger");
const errorHandler = (err, req, res, next) => {
    //my error
    if (err instanceof MyErrors_1.default) {
        logger_1.Logger.error(`MyError: ${err.message}`);
        return res.status(err.status).json(err);
    }
    //Invalid Object ID:
    if (err && err.name && err.name == "CastError" && err.path && err.value) {
        logger_1.Logger.error(`Invalid Object ID: Path - ${err.path}, Value - ${err.value}`);
        return res
            .status(400)
            .json({ message: "Invalid object id", path: err.path, value: err.value });
    }
    //express json error
    if (err instanceof SyntaxError) {
        logger_1.Logger.error("Invalid JSON");
        return res.status(400).json({ message: "Invalid JSON" });
    }
    //Mongo duplicate key error
    if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
        logger_1.Logger.error(`Duplicate Key Error: ${JSON.stringify(err.keyValue)}`);
        return res.status(400).json({
            message: "duplicate key - must be unique",
            value: err.keyValue,
        });
    }
    //Validation error
    if (err instanceof joi_1.ValidationError) {
        logger_1.Logger.error(`Validation Error: ${err.message}`);
        return res.status(400).json({ message: err.message });
    }
    // Log any other errors
    logger_1.Logger.error(`Internal Server Error: ${err.message}`);
    console.error(err);
    //internal server error
    return res.status(500).json(err);
};
exports.default = errorHandler;
