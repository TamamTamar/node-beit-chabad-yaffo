
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

}