"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PriceSchema_1 = require("../schemas/PriceSchema");
const Price = mongoose_1.default.model("Price", PriceSchema_1.PriceSchema);
exports.default = Price;
