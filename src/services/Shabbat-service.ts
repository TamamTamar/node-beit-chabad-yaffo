import { RishumShabbatType } from "../@types/@types";
import RishumShabbat from "../db/models/ShabbatModel";

export const ShabbatService = {
    createNewRishumShabbat: async (data: RishumShabbatType) => {
        const rishumShabbat = new RishumShabbat(data);
        return rishumShabbat.save();
    },

    getAllRishumShabbat: async () => {
        return RishumShabbat.find();
    },
    updatePrice: async (id: string, totalPrice: number) => {
        return RishumShabbat.findByIdAndUpdate(id, { totalPrice }, { new: true });
    },
    deleteRishumShabbat: async (id: string) => {
        return RishumShabbat.findByIdAndDelete(id);
    }
};