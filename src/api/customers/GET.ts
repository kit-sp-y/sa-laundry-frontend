import { customerResponse } from "@/interface/customers";
import {api} from "@/lib/axios";

export async function getCustomers() {
  const res = await api.get("/users/role/customer", {
    withCredentials: true,
  });
  return res.data as customerResponse[];
}

export async function getCustomerInfo(customerId: string) {
  const res = await api.get(`/users/id/${customerId}`, {
    withCredentials: true,
  });
  return res.data as customerResponse;
}