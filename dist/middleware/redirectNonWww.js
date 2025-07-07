"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectNonWww = void 0;
const redirectNonWww = (req, res, next) => {
    if (req.hostname === 'chabadyafo.org') {
        const newUrl = `https://www.chabadyafo.org${req.originalUrl}`;
        return res.redirect(301, newUrl);
    }
    next();
};
exports.redirectNonWww = redirectNonWww;
