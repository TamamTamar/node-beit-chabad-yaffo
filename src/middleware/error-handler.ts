import Joi from "joi";
import { ErrorRequestHandler } from "express";
import { MongoServerError } from "mongodb";
import MyErrors from "../errors/MyErrors";
import { Logger } from "../logs/logger";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // My custom errors
  if (err instanceof MyErrors) {
    Logger.error(`MyError: ${err.message}`);
    return res.status(err.status).json({ message: err.message });
  }

  // Invalid ObjectId
  if (err?.name === "CastError" && err.path && err.value) {
    Logger.error(`Invalid ObjectId: ${err.path}=${err.value}`);
    return res.status(400).json({
      message: "Invalid object id",
      path: err.path,
      value: err.value,
    });
  }

  // JSON parse error
  if (err instanceof SyntaxError && "body" in err) {
    Logger.error("Invalid JSON");
    return res.status(400).json({ message: "Invalid JSON" });
  }

  // Duplicate key
  if (err instanceof MongoServerError && err.code === 11000) {
    Logger.error(`Duplicate key: ${JSON.stringify(err.keyValue)}`);
    return res.status(409).json({
      message: "Duplicate key - must be unique",
      value: err.keyValue,
    });
  }

  // Joi validation error
  if (err instanceof Joi.ValidationError) {
    Logger.error(`Validation Error: ${err.message}`);
    return res.status(400).json({ message: err.message });
  }

  // Default fallback
  Logger.error(`Internal Server Error: ${err.message}`);
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};

export default errorHandler;
