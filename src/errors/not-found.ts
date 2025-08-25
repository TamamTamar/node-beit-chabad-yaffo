import { RequestHandler } from "express";
import { Logger } from "../logs/logger";

const notFound: RequestHandler = (req, res, next) => {
  const message = `Not Found - ${req.originalUrl}`;
  Logger.error(message); // הוספת לוג לשגיאה
  res.status(404).json({ message });
};

export { notFound };
export default notFound;