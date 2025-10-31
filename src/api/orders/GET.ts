import { order } from "@/interface/orders";
import { api } from "@/lib/axios";

export async function getOrders() {
  const res = await api.get("/orders/", {
    withCredentials: true,
  });
  return res.data as order[];
}

export async function getOrderInfo(orderId: string) {
  const res = await api.get(`/orders/${orderId}`, {
    withCredentials: true,
  });
  return res.data as order;
}

export async function getOrdersById(user_id: string) {
  const res = await api.get(`/orders/user/${user_id}`, {
    withCredentials: true,
  });
  return res.data as order[];
}
