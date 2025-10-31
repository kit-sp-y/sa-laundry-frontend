import { clothListResponse } from "@/interface/clothList";
import { api } from "@/lib/axios";

export async function getClothListByOrderId(orderId: string) {
    const res = await api.get(`/cloth_lists/order/${orderId}`);
    return res.data as clothListResponse[];
}