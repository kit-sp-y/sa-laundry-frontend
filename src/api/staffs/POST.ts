import { api } from "@/lib/axios";

export interface staff {
  name: string;
  nickname: string;
  phone_number: string;
  password: string;
  role: string;
}

export async function createStaff(data: staff) {
  const response = await api.post("/users/register", data, {
    withCredentials: true,
  });
  return response.data;
}
