import { RequestHandler, Request } from "express";
import { authService } from "../services/auth-service";
import MyErrors from "../errors/MyErrors";

const extractToken = (req: Request) => {
  // לוקח מה־Authorization header
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    throw new MyErrors(400, "Authorization header is missing");
  }

  // צריך להיות בפורמט: "Bearer eyJhbGciOi..."
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new MyErrors(400, "Invalid Authorization header format. Expected 'Bearer <token>'");
  }

  return parts[1]; // הטוקן עצמו
};

const validateToken: RequestHandler = (req, res, next) => {
  try {
    const token = extractToken(req);

    // בדיקת תקינות הטוקן והפקת payload
    const payload = authService.validateJWT(token);

    // שומר את ה־payload בבקשה לשימוש בשלבים הבאים
    (req as any).payload = payload;

    next();
  } catch (e) {
    next(e);
  }
};

export { validateToken, extractToken };
