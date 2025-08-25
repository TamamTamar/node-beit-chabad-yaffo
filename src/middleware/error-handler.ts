import { ValidationError } from "joi";
import { ErrorRequestHandler } from "express";
import { MongoServerError } from "mongodb";
import MyErrors from "../errors/MyErrors";
import { Logger } from "../logs/logger";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  //my error
  if (err instanceof MyErrors) {
    Logger.error(`MyError: ${err.message}`);
    return res.status(err.status).json(err);
  }

  //Invalid Object ID:
  if (err && err.name && err.name == "CastError" && err.path && err.value) {
    Logger.error(`Invalid Object ID: Path - ${err.path}, Value - ${err.value}`);
    return res
      .status(400)
      .json({ message: "Invalid object id", path: err.path, value: err.value });
  }

  //express json error
  if (err instanceof SyntaxError) {
    Logger.error("Invalid JSON");
    return res.status(400).json({ message: "Invalid JSON" });
  }

  //Mongo duplicate key error
  if (err instanceof MongoServerError && err.code === 11000) {
    Logger.error(`Duplicate Key Error: ${JSON.stringify(err.keyValue)}`);
    return res.status(400).json({
      message: "duplicate key - must be unique",
      value: err.keyValue,
    });
  }

  //Validation error
  if (err instanceof ValidationError) {
    Logger.error(`Validation Error: ${err.message}`);
    return res.status(400).json({ message: err.message });
  }

  // Log any other errors
  Logger.error(`Internal Server Error: ${err.message}`);
  console.error(err);

  //internal server error
  return res.status(500).json(err);
};

export default errorHandler;