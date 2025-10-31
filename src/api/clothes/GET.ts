import { api } from "@/lib/axios";
import { ClothResponse } from "@/interface/clothes";

export async function getClothes(): Promise<ClothResponse[]> {
    const response = await api.get("/cloths/");
    return response.data as ClothResponse[];
}