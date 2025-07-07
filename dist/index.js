"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const connection_1 = __importDefault(require("./db/connection"));
const not_found_1 = __importDefault(require("./errors/not-found"));
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
const payment_router_1 = require("./routers/payment-router");
const rishum_router_1 = require("./routers/rishum-router");
const config_1 = __importDefault(require("./config"));
// קוראים לפונקציה כדי לטעון את משתני הסביבה
(0, config_1.default)();
console.log("Environment variables loaded successfully."); // לוג לטעינת משתני סביבה
(0, connection_1.default)();
const app = (0, express_1.default)();
// Redirect non-www to www
app.use((req, res, next) => {
    console.log('hostname is:', req.hostname); // נוסיף לוג
    if (req.hostname === 'chabadyafo.org') {
        const newUrl = `https://www.chabadyafo.org${req.originalUrl}`;
        console.log('Redirecting to:', newUrl); // נוסיף גם את זה
        return res.redirect(301, newUrl);
    }
    next();
});
app.use((0, express_1.json)());
app.use((0, morgan_1.default)("dev"));
app.options("*", (0, cors_1.default)());
app.use((0, cors_1.default)());
app.use('/api/payment', payment_router_1.paymentRouter);
app.use('/api/rishum', rishum_router_1.rishumRouter);
app.use(express_1.default.static("public"));
app.use(error_handler_1.default);
app.use(not_found_1.default);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
