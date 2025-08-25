import { Request, Response, NextFunction } from "express";

export const redirectNonWww = (req: Request, res: Response, next: NextFunction) => {
  if (req.hostname === 'chabadyafo.org') {
    const newUrl = `https://www.chabadyafo.org${req.originalUrl}`;
    return res.redirect(301, newUrl);
  }
  next();
};