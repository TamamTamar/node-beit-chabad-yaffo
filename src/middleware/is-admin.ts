import { RequestHandler } from "express";
import { validateToken } from "./validate-token";
import MyErrors from "../errors/MyErrors";

const _isAdmin: RequestHandler = (req, _, next) => {
    if (req.payload?.isAdmin) {
        return next();
    }
    next(new MyErrors(403, "Must be admin"));
};

export const isAdmin = [validateToken, _isAdmin];