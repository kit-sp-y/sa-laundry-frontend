import { order } from "@/interface/orders";
import { api } from "@/lib/axios";

export async function updateOrder(id: string, data: order) {
    const res = await api.put(`/orders/${id}`, data, {
      withCredentials: true,
    });
    return res.data;
}