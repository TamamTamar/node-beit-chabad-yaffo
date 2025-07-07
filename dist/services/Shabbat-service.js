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
exports.ShabbatService = void 0;
const ShabbatModel_1 = __importDefault(require("../db/models/ShabbatModel"));
exports.ShabbatService = {
    createNewRishumShabbat: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const rishumShabbat = new ShabbatModel_1.default(data);
        return rishumShabbat.save();
    }),
    getAllRishumShabbat: () => __awaiter(void 0, void 0, void 0, function* () {
        return ShabbatModel_1.default.find();
    }),
    updatePrice: (id, totalPrice) => __awaiter(void 0, void 0, void 0, function* () {
        return ShabbatModel_1.default.findByIdAndUpdate(id, { totalPrice }, { new: true });
    }),
    deleteRishumShabbat: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return ShabbatModel_1.default.findByIdAndDelete(id);
    })
};
