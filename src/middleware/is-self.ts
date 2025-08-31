import { RequestHandler } from "express";
import MyErrors from "../errors/MyErrors";
import { validateToken } from "./validate-token";


const _isSelf: RequestHandler = (req, res, next) => {
  if (req.params.id === req.payload?._id) {
    return next();
  }

  next(new MyErrors(403, "Only the user is allowed"));
};

export const isSelf = [validateToken, _isSelf];
