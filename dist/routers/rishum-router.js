"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rishumRouter = void 0;
const express_1 = require("express");
const PriceModel_1 = __importDefault(require("../db/models/PriceModel"));
const Shabbat_service_1 = require("../services/Shabbat-service");
const router = (0, express_1.Router)();
exports.rishumRouter = router;
//create new Rishum Shabbat
router.post('/new', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parasha, date, totalPrice, name, people, phone } = req.body;
        // בדיקת שדות חובה
        if (!parasha || !date || !totalPrice || !name || !people) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // קריאה ל-Service ליצירת רישום חדש
        const newRishum = yield Shabbat_service_1.ShabbatService.createNewRishumShabbat({
            parasha,
            date,
            totalPrice,
            name,
            phone, // Optional field, default to empty string if not provided
            people,
            _id: undefined, // Assign a default or generate an ID if needed
            createdAt: new Date(), // Add the current timestamp
        });
        res.status(201).json({ message: 'Registration saved successfully', data: newRishum });
    }
    catch (error) {
        console.error('Error saving registration:', error);
        res.status(500).json({ message: 'Failed to save registration' });
    }
}));
//get all Rishum Shabbat
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Shabbat_service_1.ShabbatService.getAllRishumShabbat();
        if (!result) {
            return res.status(400).json({ message: "Failed to get all Rishum Shabbat" });
        }
        res.status(200).json(result);
    }
    catch (e) {
        next(e);
    }
}));
// שליפת המחירים
// שליפת המחירים מה-Database
router.get('/prices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prices = yield PriceModel_1.default.findOne(); // שליפת המחירים (רק מסמך אחד)
        if (!prices) {
            return res.status(404).json({ message: "Prices not found" });
        }
        res.status(200).json(prices);
    }
    catch (error) {
        console.error("Error fetching prices:", error);
        res.status(500).json({ message: "Failed to fetch prices" });
    }
}));
// update prices
router.put('/prices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adultsPrice, childrenPrice } = req.body;
        // בדיקת שדות חובה
        if (adultsPrice === undefined || childrenPrice === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // עדכון המחירים במסמך הקיים
        const updatedPrices = yield PriceModel_1.default.findOneAndUpdate({}, { adultsPrice, childrenPrice }, { new: true } // מחזיר את המסמך המעודכן
        );
        if (!updatedPrices) {
            return res.status(404).json({ message: "Prices not found" });
        }
        res.status(200).json({ message: "Prices updated successfully", data: updatedPrices });
    }
    catch (error) {
        console.error("Error updating prices:", error);
        res.status(500).json({ message: "Failed to update prices" });
    }
}));
//delete Rishum Shabbat
router.delete("/delete/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield Shabbat_service_1.ShabbatService.deleteRishumShabbat(id);
        if (!result) {
            return res.status(400).json({ message: "Failed to delete Rishum Shabbat" });
        }
        res.status(200).json({ message: "Rishum Shabbat deleted successfully", data: result });
    }
    catch (e) {
        next(e);
    }
}));
