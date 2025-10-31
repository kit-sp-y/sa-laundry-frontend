import { api } from "@/lib/axios";

export interface CreateClothListData {
    quantity: number;
    sub_total_cost: number;
    order_id: string;
    cloth_id: string;
}

export async function createClothList(data: CreateClothListData) {
    const res = await api.post(`/cloth_lists/`, data);
    return res.data;
}
