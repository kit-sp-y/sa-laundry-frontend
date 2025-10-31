import { api } from "@/lib/axios";

export interface CreateCustomerData {
  name: string;
  nickname: string;
  phone_number: string;
  password: string;
  role: string;
}

export async function createCustomer(data: CreateCustomerData) {
    const response = await api.post("/users/register", data, {
      withCredentials: true,
    });

    return response.data;
}
