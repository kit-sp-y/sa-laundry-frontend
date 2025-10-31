import { order } from "@/interface/orders";
import { api } from "@/lib/axios";

export async function createOrder(data: order) {
    const res = await api.post(`/orders/`, data);
    return res.data as order;
}